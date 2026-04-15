package com.cybertraining.service;

import java.awt.Color;
import java.awt.Font;
import java.awt.FontMetrics;
import java.awt.GradientPaint;
import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.awt.image.BufferedImage;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Duration;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Properties;
import java.util.function.Consumer;

import javax.imageio.ImageIO;

import com.google.gson.Gson;

public class LLMService {

	private static final Gson GSON = new Gson();

	private static final String GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
	private static final String GROQ_API_KEY_ENV = "GROQ_API_KEY";
	private static final String GROQ_API_KEY_PROP = "groq.api.key";
	private static final String GROQ_MODEL_PROP = "groq.model";

	private static final String FFMPEG_PATH_ENV = "FFMPEG_PATH";
	private static final String FFMPEG_PATH_PROP = "ffmpeg.path";

	private static final String DEFAULT_MODEL = "llama-3.3-70b-versatile";
	private static final int DEFAULT_TARGET_VIDEO_SECONDS = 300;
	private static final Path DATA_LLM_PROPERTIES = Paths.get("data", "llm.properties");

	private final String apiKey;
	private final String model;
	private final String ffmpegExecutable;
	private final HttpClient httpClient;

	public LLMService() {
		this.apiKey = resolveApiKey();
		this.model = resolveModel();
		this.ffmpegExecutable = resolveFfmpegExecutable();
		this.httpClient = HttpClient.newBuilder()
				.connectTimeout(Duration.ofSeconds(20))
				.build();
	}

	/**
	 * Legacy helper used by existing tests.
	 */
	public String generateSlides(String prompt) throws Exception {
		GeneratedTrainingContent content = generateCustomTrainingContent(prompt);
		StringBuilder sb = new StringBuilder();
		sb.append("title=").append(content.getCourseTitle()).append("\n");
		int idx = 1;
		for (TrainingSlide slide : content.getSlides()) {
			sb.append("slide_").append(idx++)
					.append(": ")
					.append(slide.getTitle())
					.append(" -> ")
					.append(String.join(" | ", slide.getBullets()))
					.append("\n");
		}
		return sb.toString();
	}

	public GeneratedTrainingContent generateCustomTrainingContent(String userPrompt) throws Exception {
		String prompt = sanitizePrompt(userPrompt);
		if (prompt.length() < 12) {
			String fallbackPrompt = prompt.isBlank() ? "הדרכת סייבר כללית לעובדים" : prompt;
			return buildFallbackContent(fallbackPrompt);
		}

		if (apiKey == null) {
			return buildFallbackContent(prompt);
		}

		try {
			String modelContent = requestStructuredContent(prompt);
			StructuredPayload payload = parseStructuredPayload(modelContent);
			if (payload == null || payload.slides == null || payload.slides.isEmpty()) {
				return buildFallbackContent(prompt);
			}
			return toGeneratedContent(payload, prompt);
		} catch (Exception ex) {
			return buildFallbackContent(prompt);
		}
	}

	public String generateTrainingVideo(GeneratedTrainingContent content, Consumer<String> statusCallback) throws Exception {
		Objects.requireNonNull(content, "Generated content cannot be null");
		updateStatus(statusCallback, "Checking video engine...");

		if (!isFfmpegAvailable()) {
			throw new IllegalStateException("ffmpeg is not available. Install ffmpeg and configure FFMPEG_PATH or ffmpeg.path.");
		}

		Path outputDir = Paths.get("data", "generated-videos");
		Files.createDirectories(outputDir);

		String slug = slugify(content.getCourseTitle());
		long now = System.currentTimeMillis();
		Path workDir = outputDir.resolve("work-" + now + "-" + slug);
		Files.createDirectories(workDir);

		try {
			updateStatus(statusCallback, "Rendering visual frames...");
			List<Path> frames = renderFrames(content, workDir, statusCallback);

			updateStatus(statusCallback, "Preparing timeline...");
			Path concatFile = workDir.resolve("frames.txt");
			writeConcatFile(frames, concatFile, content.getTargetDurationSeconds());

			Path outputVideo = outputDir.resolve("training-" + now + "-" + slug + ".mp4");
			updateStatus(statusCallback, "Building MP4 with ffmpeg...");
			runFfmpeg(concatFile, outputVideo);

			updateStatus(statusCallback, "Video ready.");
			return outputVideo.toUri().toString();
		} finally {
			deleteRecursively(workDir);
		}
	}

	public boolean isFfmpegAvailable() {
		if (ffmpegExecutable == null || ffmpegExecutable.isBlank()) {
			return false;
		}

		try {
			Process process = new ProcessBuilder(ffmpegExecutable, "-version").start();
			int code = process.waitFor();
			return code == 0;
		} catch (Exception ignored) {
			return false;
		}
	}

	private String requestStructuredContent(String prompt) throws Exception {
		String systemPrompt = "You create cybersecurity awareness training in Hebrew for employees. "
				+ "Return STRICT JSON only with this schema: "
				+ "{\"courseTitle\":string,\"targetDurationSeconds\":number,\"slides\":[{\"title\":string,\"summary\":string,\"bullets\":[string],\"narration\":string}]}. "
				+ "Generate 6 slides, each with 4-6 bullets. Duration must be close to 300 seconds.";

		Map<String, Object> body = new LinkedHashMap<>();
		body.put("model", model);
		body.put("temperature", 0.7);
		body.put("max_tokens", 2200);

		List<Map<String, String>> messages = new ArrayList<>();
		messages.add(Map.of("role", "system", "content", systemPrompt));
		messages.add(Map.of("role", "user", "content", "Organization request: " + prompt));
		body.put("messages", messages);

		HttpRequest request = HttpRequest.newBuilder(URI.create(GROQ_API_URL))
				.timeout(Duration.ofSeconds(100))
				.header("Authorization", "Bearer " + apiKey)
				.header("Content-Type", "application/json")
				.POST(HttpRequest.BodyPublishers.ofString(GSON.toJson(body), StandardCharsets.UTF_8))
				.build();

		HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));
		if (response.statusCode() < 200 || response.statusCode() >= 300) {
			throw new IOException("Groq request failed: HTTP " + response.statusCode() + " body=" + trimForLog(response.body()));
		}

		GroqChatResponse chatResponse = GSON.fromJson(response.body(), GroqChatResponse.class);
		if (chatResponse == null
				|| chatResponse.choices == null
				|| chatResponse.choices.isEmpty()
				|| chatResponse.choices.get(0).message == null
				|| chatResponse.choices.get(0).message.content == null) {
			throw new IOException("Groq response did not include message content");
		}

		return chatResponse.choices.get(0).message.content;
	}

	private StructuredPayload parseStructuredPayload(String modelContent) {
		String json = safeJsonFromModelOutput(modelContent);
		return GSON.fromJson(json, StructuredPayload.class);
	}

	private GeneratedTrainingContent toGeneratedContent(StructuredPayload payload, String prompt) {
		String title = safe(payload.courseTitle, "תוכנית מודעות סייבר מותאמת");
		int duration = payload.targetDurationSeconds > 0 ? payload.targetDurationSeconds : DEFAULT_TARGET_VIDEO_SECONDS;
		duration = Math.max(240, Math.min(360, duration));

		List<TrainingSlide> slides = new ArrayList<>();
		for (StructuredSlide s : payload.slides) {
			if (s == null) {
				continue;
			}
			String slideTitle = safe(s.title, "נושא אבטחת מידע");
			String summary = safe(s.summary, "");
			List<String> bullets = (s.bullets == null || s.bullets.isEmpty())
					? List.of("זיהוי דפוסי תקיפה", "יישום נהלי דיווח ברורים")
					: sanitizeBullets(s.bullets);
			String narration = safe(s.narration, summary);
			slides.add(new TrainingSlide(slideTitle, summary, bullets, narration));
		}

		if (slides.isEmpty()) {
			return buildFallbackContent(prompt);
		}

		return new GeneratedTrainingContent(title, prompt, slides, duration);
	}

	private List<Path> renderFrames(GeneratedTrainingContent content, Path workDir, Consumer<String> statusCallback) throws Exception {
		List<Path> frames = new ArrayList<>();
		int total = content.getSlides().size();
		int index = 1;
		for (TrainingSlide slide : content.getSlides()) {
			updateStatus(statusCallback, "Rendering frame " + index + " / " + total + "...");
			Path frame = renderSlideFrame(content.getCourseTitle(), slide, index, total, workDir);
			frames.add(frame);
			index++;
		}
		return frames;
	}

	private Path renderSlideFrame(String courseTitle, TrainingSlide slide, int slideIndex, int totalSlides, Path workDir) throws Exception {
		int width = 1280;
		int height = 720;
		BufferedImage image = new BufferedImage(width, height, BufferedImage.TYPE_INT_RGB);
		Graphics2D g = image.createGraphics();
		try {
			g.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
			g.setRenderingHint(RenderingHints.KEY_TEXT_ANTIALIASING, RenderingHints.VALUE_TEXT_ANTIALIAS_ON);

			g.setPaint(new GradientPaint(0, 0, new Color(13, 10, 25), width, height, new Color(38, 20, 60)));
			g.fillRect(0, 0, width, height);

			g.setColor(new Color(0, 230, 255));
			g.setFont(new Font("Arial", Font.BOLD, 30));
			drawRightAlignedWrappedText(g, courseTitle, 90, width - 80, width - 160, 36);

			g.setColor(Color.WHITE);
			g.setFont(new Font("Arial", Font.BOLD, 50));
			int y = 180;
			y = drawRightAlignedWrappedText(g, slide.getTitle(), y, width - 80, width - 160, 54);

			if (!slide.getSummary().isBlank()) {
				g.setColor(new Color(210, 215, 240));
				g.setFont(new Font("Arial", Font.PLAIN, 30));
				y = drawRightAlignedWrappedText(g, slide.getSummary(), y + 10, width - 80, width - 160, 38);
			}

			g.setColor(new Color(240, 242, 255));
			g.setFont(new Font("Arial", Font.PLAIN, 30));
			y += 20;
			for (String bullet : slide.getBullets()) {
				String line = "• " + bullet;
				y = drawRightAlignedWrappedText(g, line, y, width - 80, width - 180, 36);
				y += 8;
				if (y > height - 120) {
					break;
				}
			}

			g.setColor(new Color(170, 160, 200));
			g.setFont(new Font("Arial", Font.PLAIN, 22));
			String footer = "Slide " + slideIndex + " / " + totalSlides;
			FontMetrics fm = g.getFontMetrics();
			g.drawString(footer, width - 80 - fm.stringWidth(footer), height - 40);
		} finally {
			g.dispose();
		}

		Path frame = workDir.resolve(String.format("frame-%02d.png", slideIndex));
		ImageIO.write(image, "png", frame.toFile());
		return frame;
	}

	private int drawRightAlignedWrappedText(Graphics2D g, String text, int yStart, int rightX, int maxWidth, int lineHeight) {
		List<String> lines = wrapText(text, g.getFontMetrics(), maxWidth);
		int y = yStart;
		for (String line : lines) {
			int lineWidth = g.getFontMetrics().stringWidth(line);
			g.drawString(line, rightX - lineWidth, y);
			y += lineHeight;
		}
		return y;
	}

	private List<String> wrapText(String text, FontMetrics metrics, int maxWidth) {
		if (text == null || text.isBlank()) {
			return List.of("");
		}

		String[] words = text.replace('\n', ' ').trim().split("\\s+");
		List<String> lines = new ArrayList<>();
		StringBuilder current = new StringBuilder();

		for (String word : words) {
			if (current.isEmpty()) {
				current.append(word);
				continue;
			}

			String candidate = current + " " + word;
			if (metrics.stringWidth(candidate) <= maxWidth) {
				current.append(" ").append(word);
			} else {
				lines.add(current.toString());
				current.setLength(0);
				current.append(word);
			}
		}

		if (!current.isEmpty()) {
			lines.add(current.toString());
		}
		return lines;
	}

	private void writeConcatFile(List<Path> frames, Path concatFile, int targetDurationSeconds) throws IOException {
		if (frames.isEmpty()) {
			throw new IOException("No frames produced for ffmpeg");
		}

		int safeDuration = Math.max(240, Math.min(360, targetDurationSeconds));
		double perSlide = safeDuration / (double) frames.size();
		StringBuilder sb = new StringBuilder();
		for (Path frame : frames) {
			String escaped = frame.toAbsolutePath().toString().replace("'", "'\\''");
			sb.append("file '").append(escaped).append("'\n");
			sb.append("duration ").append(String.format(Locale.US, "%.3f", perSlide)).append("\n");
		}
		String lastEscaped = frames.get(frames.size() - 1).toAbsolutePath().toString().replace("'", "'\\''");
		sb.append("file '").append(lastEscaped).append("'\n");

		Files.writeString(concatFile, sb.toString(), StandardCharsets.UTF_8);
	}

	private void runFfmpeg(Path concatFile, Path outputFile) throws Exception {
		if (ffmpegExecutable == null || ffmpegExecutable.isBlank()) {
			throw new IOException("ffmpeg executable path is not configured");
		}

		List<String> command = List.of(
				ffmpegExecutable,
				"-y",
				"-f", "concat",
				"-safe", "0",
				"-i", concatFile.toAbsolutePath().toString(),
				"-vf", "fps=30,format=yuv420p",
				"-c:v", "libx264",
				"-preset", "veryfast",
				"-crf", "23",
				outputFile.toAbsolutePath().toString()
		);

		ProcessBuilder pb = new ProcessBuilder(command);
		pb.redirectErrorStream(true);
		Process process = pb.start();

		StringBuilder ffmpegOutput = new StringBuilder();
		try (BufferedReader br = new BufferedReader(new InputStreamReader(process.getInputStream(), StandardCharsets.UTF_8))) {
			String line;
			while ((line = br.readLine()) != null) {
				ffmpegOutput.append(line).append('\n');
			}
		}

		int exit = process.waitFor();
		if (exit != 0) {
			throw new IOException("ffmpeg failed with code " + exit + ": " + trimForLog(ffmpegOutput.toString()));
		}

		if (!Files.exists(outputFile) || Files.size(outputFile) == 0L) {
			throw new IOException("ffmpeg completed but output file is missing or empty");
		}
	}

	private GeneratedTrainingContent buildFallbackContent(String prompt) {
		String promptSnippet = prompt.length() > 220 ? prompt.substring(0, 220) + "..." : prompt;

		List<TrainingSlide> slides = new ArrayList<>();
		slides.add(new TrainingSlide(
				"תמונת איומים ארגונית",
				"מבט ממוקד על סיכוני הסייבר הרלוונטיים לארגון שלך",
				List.of(
						"מיפוי נכסים קריטיים ומערכות עם השפעה עסקית",
						"זיהוי תוקפים אפשריים ומטרות תקיפה סבירות",
						"בחינת פערי הגנה קיימים ומוכנות לדיווח",
						"תיעדוף בקרות לצמצום סיכון מיידי"
				),
				"פתיחה בהקשר עסקי ברור והסבר מדוע ההדרכה נחוצה עכשיו."
		));
		slides.add(new TrainingSlide(
				"התנהגויות מסוכנות שיש להפסיק",
				"דוגמאות פרקטיות מתהליכי עבודה יומיומיים",
				List.of(
						"לחיצה על קישורים דחופים משולחים לא מוכרים",
						"שיתוף סיסמאות בין כלים ארגוניים",
						"שמירת קבצי חברה באחסון פרטי לא מנוהל",
						"התעלמות מהתראות התחברות חריגות"
				),
				"חיבור כל התנהגות מסוכנת לתרחיש תקיפה ממשי."
		));
		slides.add(new TrainingSlide(
				"פישינג והנדסה חברתית",
				"איך לזהות ולחסום ניסיונות מניפולציה",
				List.of(
						"אימות זהות השולח בערוץ בלתי תלוי",
						"בדיקת זיוף דומיין ואי-התאמות בקישורים",
						"הסלמה של בקשות חשודות לפני ביצוע",
						"שימוש מיידי בערוצי דיווח מאושרים"
				),
				"מעבר על תרחיש פישינג מציאותי משלב הקבלה ועד הדיווח."
		));
		slides.add(new TrainingSlide(
				"גישה מאובטחת והיגיינת תחנות קצה",
				"צמצום השתלטות על חשבונות ותנועה רוחבית",
				List.of(
						"הפעלת MFA בכל מערכת רגישה",
						"שימוש בסיסמאות מורכבות ומנהל סיסמאות",
						"עדכונים שוטפים למערכת ההפעלה ולאפליקציות",
						"נעילת תחנה והגנת סשנים מרוחקים"
				),
				"הסבר כיצד חולשות בגישה מובילות לאירועי אבטחה משמעותיים."
		));
		slides.add(new TrainingSlide(
				"תגובה לאירוע סייבר לעובדים",
				"מה עושים בדקות הקריטיות הראשונות",
				List.of(
						"בידוד מערכות חשודות לפי הנחיות",
						"שמירת ראיות והימנעות ממחיקת ממצאים",
						"דיווח מדויק עם ציר זמן ואינדיקטורים",
						"תיאום עם IT/SOC לפי נוהל הסלמה"
				),
				"חיזוק עקרונות מהירות, בהירות ומשמעת תהליכית בדיווח."
		));
		slides.add(new TrainingSlide(
				"תוכנית פעולה לארגון",
				"יעדי ההדרכה וצעדי המשך מיידיים",
				List.of(
						"הרצת סימולציות פישינג חודשיות",
						"מדידת אימוץ MFA וכיסוי עדכוני אבטחה",
						"ביקורת הרשאות גבוהות ושיתוף חיצוני",
						"תרגילי שולחן רבעוניים לאירועי סייבר"
				),
				"סגירה עם אחריות ביצוע, לוחות זמנים ומדדי הצלחה."
		));

		return new GeneratedTrainingContent(
				"תוכנית מודעות סייבר מותאמת",
				promptSnippet,
				slides,
				DEFAULT_TARGET_VIDEO_SECONDS
		);
	}

	private List<String> sanitizeBullets(List<String> bullets) {
		List<String> out = new ArrayList<>();
		for (String bullet : bullets) {
			if (bullet == null) {
				continue;
			}
			String cleaned = bullet.trim();
			if (!cleaned.isEmpty()) {
				out.add(cleaned);
			}
		}
		if (out.isEmpty()) {
			return List.of("זיהוי סיכון", "פעולה מונעת", "דיווח מיידי");
		}
		return out;
	}

	private void deleteRecursively(Path root) {
		try {
			if (root == null || !Files.exists(root)) {
				return;
			}
			Files.walk(root)
					.sorted(Comparator.reverseOrder())
					.forEach(p -> {
						try {
							Files.deleteIfExists(p);
						} catch (IOException ignored) {
						}
					});
		} catch (IOException ignored) {
		}
	}

	private String resolveApiKey() {
		String fromEnv = sanitizeSecretCandidate(System.getenv(GROQ_API_KEY_ENV));
		if (fromEnv != null) {
			return fromEnv;
		}

		String fromProp = sanitizeSecretCandidate(System.getProperty(GROQ_API_KEY_ENV));
		if (fromProp != null) {
			return fromProp;
		}

		Properties localProps = loadPropertiesFromFile(DATA_LLM_PROPERTIES);
		String fromDataFile = sanitizeSecretCandidate(localProps.getProperty(GROQ_API_KEY_PROP));
		if (fromDataFile != null) {
			return fromDataFile;
		}

		Properties resourceProps = loadPropertiesFromResource("/llm.properties");
		return sanitizeSecretCandidate(resourceProps.getProperty(GROQ_API_KEY_PROP));
	}

	private String resolveModel() {
		String fromProp = sanitizeSecretCandidate(System.getProperty(GROQ_MODEL_PROP));
		if (fromProp != null) {
			return fromProp;
		}

		Properties localProps = loadPropertiesFromFile(DATA_LLM_PROPERTIES);
		String fromDataFile = sanitizeSecretCandidate(localProps.getProperty(GROQ_MODEL_PROP));
		if (fromDataFile != null) {
			return fromDataFile;
		}

		Properties resourceProps = loadPropertiesFromResource("/llm.properties");
		String fromResource = sanitizeSecretCandidate(resourceProps.getProperty(GROQ_MODEL_PROP));
		return fromResource != null ? fromResource : DEFAULT_MODEL;
	}

	private String resolveFfmpegExecutable() {
		List<String> candidates = new ArrayList<>();

		String fromEnv = sanitizeSecretCandidate(System.getenv(FFMPEG_PATH_ENV));
		if (fromEnv != null) {
			candidates.add(fromEnv);
		}

		String fromProp = sanitizeSecretCandidate(System.getProperty(FFMPEG_PATH_PROP));
		if (fromProp != null) {
			candidates.add(fromProp);
		}

		Properties localProps = loadPropertiesFromFile(DATA_LLM_PROPERTIES);
		String fromDataFile = sanitizeSecretCandidate(localProps.getProperty(FFMPEG_PATH_PROP));
		if (fromDataFile != null) {
			candidates.add(fromDataFile);
		}

		Properties resourceProps = loadPropertiesFromResource("/llm.properties");
		String fromResource = sanitizeSecretCandidate(resourceProps.getProperty(FFMPEG_PATH_PROP));
		if (fromResource != null) {
			candidates.add(fromResource);
		}

		for (String candidate : candidates) {
			String resolved = resolveExecutablePath(candidate);
			if (resolved != null) {
				return resolved;
			}
		}

		if (canExecuteBinary("ffmpeg")) {
			return "ffmpeg";
		}

		String userHome = System.getProperty("user.home", "");
		List<String> commonPaths = List.of(
				"/opt/homebrew/bin/ffmpeg",
				"/usr/local/bin/ffmpeg",
				Paths.get(userHome, "bin", "ffmpeg").toString()
		);

		for (String candidate : commonPaths) {
			String resolved = resolveExecutablePath(candidate);
			if (resolved != null) {
				return resolved;
			}
		}

		return null;
	}

	private String resolveExecutablePath(String rawPath) {
		if (rawPath == null || rawPath.isBlank()) {
			return null;
		}

		String normalized = rawPath.trim();
		if (normalized.startsWith("~/")) {
			normalized = System.getProperty("user.home", "") + normalized.substring(1);
		}

		try {
			Path p = Paths.get(normalized).toAbsolutePath().normalize();
			if (Files.exists(p) && Files.isRegularFile(p) && Files.isExecutable(p)) {
				return p.toString();
			}
		} catch (Exception ignored) {
		}

		return null;
	}

	private boolean canExecuteBinary(String binary) {
		try {
			Process process = new ProcessBuilder(binary, "-version").start();
			int code = process.waitFor();
			return code == 0;
		} catch (Exception ignored) {
			return false;
		}
	}

	private Properties loadPropertiesFromFile(Path filePath) {
		Properties p = new Properties();
		if (filePath == null || !Files.exists(filePath)) {
			return p;
		}
		try (InputStream in = Files.newInputStream(filePath)) {
			p.load(in);
		} catch (IOException ignored) {
		}
		return p;
	}

	private Properties loadPropertiesFromResource(String resourcePath) {
		Properties p = new Properties();
		try (InputStream in = getClass().getResourceAsStream(resourcePath)) {
			if (in != null) {
				p.load(in);
			}
		} catch (IOException ignored) {
		}
		return p;
	}

	private String sanitizeSecretCandidate(String value) {
		if (value == null) {
			return null;
		}
		String trimmed = value.trim();
		if (trimmed.isEmpty()) {
			return null;
		}
		String upper = trimmed.toUpperCase(Locale.ROOT);
		if (upper.contains("YOUR_") || upper.contains("PLACEHOLDER") || upper.contains("CHANGEME")) {
			return null;
		}
		return trimmed;
	}

	private String sanitizePrompt(String prompt) {
		if (prompt == null) {
			return "";
		}
		return prompt.replace("\u0000", "").trim();
	}

	private static String safeJsonFromModelOutput(String content) {
		if (content == null) {
			return "{}";
		}

		String trimmed = content.trim();
		int firstBrace = trimmed.indexOf('{');
		int lastBrace = trimmed.lastIndexOf('}');
		if (firstBrace >= 0 && lastBrace > firstBrace) {
			return trimmed.substring(firstBrace, lastBrace + 1);
		}
		return "{}";
	}

	private String slugify(String text) {
		if (text == null || text.isBlank()) {
			return "training";
		}
		String slug = text.toLowerCase(Locale.ROOT)
				.replaceAll("[^a-z0-9]+", "-")
				.replaceAll("^-+|-+$", "");
		return slug.isEmpty() ? "training" : slug;
	}

	private static void updateStatus(Consumer<String> callback, String status) {
		if (callback != null && status != null && !status.isBlank()) {
			callback.accept(status);
		}
	}

	private static String trimForLog(String value) {
		if (value == null) {
			return "";
		}
		return value.length() <= 420 ? value : value.substring(0, 420) + "...";
	}

	private static String safe(String value, String fallback) {
		return value == null || value.isBlank() ? fallback : value.trim();
	}

	public static final class GeneratedTrainingContent {
		private final String courseTitle;
		private final String sourcePrompt;
		private final List<TrainingSlide> slides;
		private final int targetDurationSeconds;

		public GeneratedTrainingContent(String courseTitle, String sourcePrompt, List<TrainingSlide> slides, int targetDurationSeconds) {
			this.courseTitle = courseTitle;
			this.sourcePrompt = sourcePrompt;
			this.slides = Collections.unmodifiableList(new ArrayList<>(slides));
			this.targetDurationSeconds = targetDurationSeconds;
		}

		public String getCourseTitle() {
			return courseTitle;
		}

		public String getSourcePrompt() {
			return sourcePrompt;
		}

		public List<TrainingSlide> getSlides() {
			return slides;
		}

		public int getTargetDurationSeconds() {
			return targetDurationSeconds;
		}

		public List<String> toHtmlSlides() {
			List<String> htmlSlides = new ArrayList<>();
			for (TrainingSlide slide : slides) {
				StringBuilder sb = new StringBuilder();
				sb.append("<h1 style='color:#54A0FF; border-bottom:2px solid #484E60; padding-bottom:10px;'>")
						.append(escapeHtml(slide.getTitle()))
						.append("</h1>");

				if (!slide.getSummary().isBlank()) {
					sb.append("<p style='font-size:18px;'>")
							.append(escapeHtml(slide.getSummary()))
							.append("</p>");
				}

				sb.append("<ul style='line-height:1.8;'>");
				for (String bullet : slide.getBullets()) {
					sb.append("<li>").append(escapeHtml(bullet)).append("</li>");
				}
				sb.append("</ul>");
				htmlSlides.add(sb.toString());
			}
			return htmlSlides;
		}
	}

	public static final class TrainingSlide {
		private final String title;
		private final String summary;
		private final List<String> bullets;
		private final String narration;

		public TrainingSlide(String title, String summary, List<String> bullets, String narration) {
			this.title = title;
			this.summary = summary;
			this.bullets = Collections.unmodifiableList(new ArrayList<>(bullets));
			this.narration = narration;
		}

		public String getTitle() {
			return title;
		}

		public String getSummary() {
			return summary;
		}

		public List<String> getBullets() {
			return bullets;
		}

		public String getNarration() {
			return narration;
		}
	}

	private static String escapeHtml(String text) {
		if (text == null) {
			return "";
		}
		return text
				.replace("&", "&amp;")
				.replace("<", "&lt;")
				.replace(">", "&gt;")
				.replace("\"", "&quot;")
				.replace("'", "&#39;");
	}

	private static class GroqChatResponse {
		List<GroqChoice> choices;
	}

	private static class GroqChoice {
		GroqMessage message;
	}

	private static class GroqMessage {
		String content;
	}

	private static class StructuredPayload {
		String courseTitle;
		int targetDurationSeconds;
		List<StructuredSlide> slides;
	}

	private static class StructuredSlide {
		String title;
		String summary;
		List<String> bullets;
		String narration;
	}
}
