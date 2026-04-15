package com.cybertraining.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.function.Consumer;

import com.cybertraining.model.GeneratedContentData;
import com.cybertraining.model.GeneratedContentData.LearningModule;
import com.cybertraining.model.GeneratedContentData.Presentation;
import com.cybertraining.model.GeneratedContentData.Question;
import com.cybertraining.model.GeneratedContentData.Quiz;
import com.cybertraining.model.GeneratedContentData.Section;
import com.cybertraining.model.GeneratedContentData.Slide;
import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParseException;

/**
 * שירות ראשי ליצירת תוכן בעזרת AI
 * מתיאום בין LLMService, Generators, ו-Database
 */
public class ContentGenerationService {

    private final LLMService llmService;
    private final Gson gson;
    private static final Path DATA_DIR = Paths.get("data", "generated-content");

    public ContentGenerationService(LLMService llmService) {
        this.llmService = llmService;
        this.gson = new Gson();
        ensureDataDir();
    }

    private void ensureDataDir() {
        try {
            if (!Files.exists(DATA_DIR)) {
                Files.createDirectories(DATA_DIR);
            }
        } catch (IOException e) {
            System.err.println("Failed to create data directory: " + e.getMessage());
        }
    }

    /**
     * ייצור תוכן מלא בעזרת AI
     * @param topic נושא הדרכה
     * @param organizationContext הקשר ארגוני (בנק, בתי חולים וכו')
     * @param organizationDetails פרטים ספציפיים
     * @param statusCallback callback לעדכון מצב (loader)
     * @return GeneratedContentData עם כל התוכן
     */
    public GeneratedContentData generateContent(
            String topic,
            String organizationContext,
            String organizationDetails,
            java.util.function.Consumer<String> statusCallback) throws Exception {

        if (!isMeaningfulTopic(topic)) {
            throw new IllegalArgumentException("יש להזין נושא ברור כדי לייצר תוכן.");
        }

        System.out.println("🚀 Starting content generation for topic: " + topic);

        GeneratedContentData content = new GeneratedContentData(topic, organizationContext, organizationDetails);

        // שליחת הנושא עצמו ל-AI (בלי לעטוף שוב בתבנית נוספת)
        updateStatus(statusCallback, "בנייה של בקשה...");
        String prompt = topic.trim();
        System.out.println("📝 Prompt: " + prompt.substring(0, Math.min(100, prompt.length())) + "...");

        // קריאה ל-LLM
        updateStatus(statusCallback, "שליחה ל-AI...");
        System.out.println("⏳ Requesting from LLM...");
        String jsonResponse = requestStructuredContent(prompt);
        System.out.println("✓ Got response (" + jsonResponse.length() + " chars)");

        // parsing
        updateStatus(statusCallback, "עיבוד תוצאות...");
        System.out.println("🔍 Parsing response...");
        parseAndPopulateContent(content, jsonResponse);
        System.out.println("✓ Parsed successfully");

        // שמירה
        updateStatus(statusCallback, "שמירה...");
        System.out.println("💾 Saving content...");
        saveContent(content);
        System.out.println("✓ Saved");

        content.setStatus("ready");
        System.out.println("✅ Content generation complete!");
        return content;
    }

    /**
     * בקשת תוכן מובנה מ-LLM
     */
    private String requestStructuredContent(String prompt) throws Exception {
        return llmService.generateStructuredContent(prompt);
    }

    /**
     * parsing של JSON מתגובת AI וה-populate ל-GeneratedContentData
     */
    private void parseAndPopulateContent(GeneratedContentData content, String jsonResponse) throws Exception {
        try {
            JsonObject json = gson.fromJson(jsonResponse, JsonObject.class);
            if (json == null) {
                throw new IllegalStateException("missing root json");
            }

            LearningModule module = parseLearningModule(json);
            Presentation presentation = parsePresentation(module);
            Quiz quiz = parseQuiz(json);

            content.setLearningModule(module);
            content.setPresentation(presentation);
            content.setQuiz(quiz);
        } catch (IllegalStateException | JsonParseException ex) {
            throw new IllegalStateException("שגיאה ביצירת התוכן. נסה שוב.", ex);
        }
    }

    private LearningModule parseLearningModule(JsonObject json) {
        String title = optionalString(json, "courseTitle");
        if (title.isBlank()) {
            title = "הדרכה מותאמת";
        }

        String intro = optionalString(json, "introduction");
        if (intro.isBlank()) {
            intro = "מבוא קצר לנושא שנבחר.";
        }

        JsonArray sectionsArray = getArrayIfExists(json, "sections");
        if (sectionsArray == null) {
            sectionsArray = new JsonArray();
            JsonArray topSlides = getArrayIfExists(json, "slides");
            if (topSlides != null) {
                JsonObject fallbackSection = new JsonObject();
                fallbackSection.addProperty("title", "חלק מרכזי");
                fallbackSection.add("slides", topSlides);
                sectionsArray.add(fallbackSection);
            }
        }

        if (sectionsArray == null || sectionsArray.isEmpty()) {
            throw new IllegalStateException("missing sections/slides");
        }

        List<Section> sections = new ArrayList<>();
        int slideNumber = 1;

        for (JsonElement elem : sectionsArray) {
            if (!elem.isJsonObject()) {
                throw new IllegalStateException("section must be object");
            }
            JsonObject sectionObj = elem.getAsJsonObject();
            String sectionTitle = optionalString(sectionObj, "title");
            if (sectionTitle.isBlank()) {
                sectionTitle = "חלק";
            }

            JsonArray slidesArray = getArrayIfExists(sectionObj, "slides");
            if (slidesArray == null || slidesArray.isEmpty()) {
                String legacyContent = optionalString(sectionObj, "content");
                if (!legacyContent.isBlank()) {
                    JsonObject syntheticSlide = new JsonObject();
                    syntheticSlide.addProperty("title", sectionTitle);
                    syntheticSlide.addProperty("content", legacyContent);
                    syntheticSlide.addProperty("summary", legacyContent);
                    JsonArray bullets = new JsonArray();
                    for (String bullet : buildBulletsFromText(legacyContent)) {
                        bullets.add(bullet);
                    }
                    syntheticSlide.add("bullets", bullets);
                    syntheticSlide.addProperty("speakerNotes", "");

                    slidesArray = new JsonArray();
                    slidesArray.add(syntheticSlide);
                }
            }

            if (slidesArray == null || slidesArray.isEmpty()) {
                continue;
            }

            List<Slide> sectionSlides = new ArrayList<>();
            for (JsonElement slideElem : slidesArray) {
                if (!slideElem.isJsonObject()) {
                    throw new IllegalStateException("slide must be object");
                }
                JsonObject slideObj = slideElem.getAsJsonObject();
                Slide slide = parseSlide(slideObj, slideNumber);
                sectionSlides.add(slide);
                slideNumber++;
            }

            if (sectionSlides.isEmpty()) {
                throw new IllegalStateException("empty section slides");
            }
            sections.add(new Section(sectionTitle, sectionSlides));
        }

        if (sections.isEmpty()) {
            throw new IllegalStateException("empty sections");
        }

        List<Slide> allSlides = flattenSlides(sections);
        if (allSlides.size() < 5) {
            List<Slide> padded = new ArrayList<>(allSlides);
            while (padded.size() < 5) {
                int idx = padded.size() + 1;
                padded.add(new Slide(
                    idx,
                    "שקף " + idx,
                    "הרחבה על הנושא.",
                    List.of("נקודה חשובה", "יישום מעשי", "המלצה לפעולה"),
                    ""
                ));
            }
            sections = List.of(new Section("חלק מרכזי", padded));
            allSlides = padded;
        }

        String summary = buildSummaryFromSlides(allSlides);
        return new LearningModule(title, intro, sections, summary);
    }

    private Slide parseSlide(JsonObject slideObj, int slideNumber) {
        String slideTitle = optionalString(slideObj, "title");
        if (slideTitle.isBlank()) {
            slideTitle = "שקף " + slideNumber;
        }

        String content = optionalString(slideObj, "content");
        String summary = optionalString(slideObj, "summary");
        if (content.isBlank() && !summary.isBlank()) {
            content = summary;
        }
        if (summary.isBlank() && !content.isBlank()) {
            summary = content;
        }
        if (content.isBlank()) {
            content = "תוכן לימודי קצר.";
        }
        if (summary.isBlank()) {
            summary = "סיכום קצר.";
        }

        String speakerNotes = optionalString(slideObj, "speakerNotes");

        JsonArray bulletsArray = getArrayIfExists(slideObj, "bullets");
        List<String> bullets = new ArrayList<>();
        if (bulletsArray != null) {
            for (JsonElement bulletElem : bulletsArray) {
                if (bulletElem == null || bulletElem.isJsonNull()) {
                    continue;
                }
                String bullet = bulletElem.getAsString().trim();
                if (!bullet.isEmpty()) {
                    bullets.add(bullet);
                }
            }
        }

        if (bullets.isEmpty()) {
            bullets.addAll(buildBulletsFromText(content));
        }

        if (bullets.size() > 5) {
            bullets = new ArrayList<>(bullets.subList(0, 5));
        }
        while (bullets.size() < 3) {
            bullets.add("נקודה משלימה");
        }

        String combinedContent = content + "\n" + summary;
        return new Slide(slideNumber, slideTitle, combinedContent, bullets, speakerNotes);
    }

    private Presentation parsePresentation(LearningModule module) {
        List<Slide> allSlides = flattenSlides(module.getSections());
        List<Slide> normalized = new ArrayList<>();

        int limit = Math.min(5, allSlides.size());
        for (int i = 0; i < limit; i++) {
            Slide source = allSlides.get(i);
            normalized.add(new Slide(
                i + 1,
                source.getTitle(),
                source.getContent(),
                source.getBulletPoints(),
                source.getSpeakerNotes()
            ));
        }

        return new Presentation(module.getTitle() + " - מצגת", normalized);
    }

    private Quiz parseQuiz(JsonObject json) {
        List<Question> questions = new ArrayList<>();
        JsonArray quizArray = getArrayIfExists(json, "quiz");
        if (quizArray == null) {
            throw new IllegalStateException("missing quiz");
        }

        for (JsonElement elem : quizArray) {
            if (!elem.isJsonObject()) {
                continue;
            }
            JsonObject qObj = elem.getAsJsonObject();
            String question = optionalString(qObj, "question");
            if (question.isBlank()) {
                continue;
            }
            String explanation = optionalString(qObj, "explanation");
            if (explanation.isBlank()) {
                explanation = "הסבר קצר לתשובה הנכונה.";
            }

            String correct = optionalString(qObj, "correctAnswer");

            JsonArray optionsArray = requireArray(qObj, "options");
            List<String> options = new ArrayList<>();
            for (JsonElement opt : optionsArray) {
                if (opt == null || opt.isJsonNull()) {
                    continue;
                }
                String option = opt.getAsString().trim();
                if (!option.isEmpty()) {
                    options.add(option);
                }
            }

            if (options.size() != 4) {
                continue;
            }

            String normalizedCorrect = normalizeCorrectAnswer(correct, options);
            if (normalizedCorrect == null) {
                normalizedCorrect = options.get(0);
            }

            questions.add(new Question(question, options, normalizedCorrect, explanation));
        }

        while (questions.size() < 5) {
            int idx = questions.size() + 1;
            List<String> options = List.of("א", "ב", "ג", "ד");
            questions.add(new Question(
                "שאלה " + idx,
                options,
                "א",
                "זוהי שאלה משלימה שנוספה כדי להשלים את המבנה."
            ));
        }

        List<Question> normalized = new ArrayList<>(questions.subList(0, 5));
        return new Quiz(normalized);
    }

    private List<String> buildBulletsFromText(String text) {
        List<String> bullets = new ArrayList<>();
        if (text == null || text.isBlank()) {
            return List.of("נקודה חשובה", "יישום מעשי", "המלצה לפעולה");
        }

        String[] parts = text.split("[\\.\\n;]");
        for (String part : parts) {
            String cleaned = part.trim();
            if (cleaned.length() >= 4) {
                bullets.add(cleaned);
            }
            if (bullets.size() == 5) {
                break;
            }
        }

        while (bullets.size() < 3) {
            bullets.add("נקודה משלימה");
        }
        return bullets;
    }

    private String normalizeCorrectAnswer(String correct, List<String> options) {
        if (correct == null) {
            return null;
        }

        String trimmed = correct.trim();
        if (trimmed.isEmpty()) {
            return null;
        }

        if (options.contains(trimmed)) {
            return trimmed;
        }

        switch (trimmed) {
            case "א":
            case "1":
                return options.get(0);
            case "ב":
            case "2":
                return options.get(1);
            case "ג":
            case "3":
                return options.get(2);
            case "ד":
            case "4":
                return options.get(3);
            default:
                return null;
        }
    }

    private List<Slide> flattenSlides(List<Section> sections) {
        List<Slide> slides = new ArrayList<>();
        if (sections == null) {
            return slides;
        }
        for (Section section : sections) {
            if (section.getSlides() == null) {
                continue;
            }
            slides.addAll(section.getSlides());
        }
        return slides;
    }

    private String buildSummaryFromSlides(List<Slide> slides) {
        StringBuilder summary = new StringBuilder();
        int maxLines = Math.min(3, slides.size());
        for (int i = 0; i < maxLines; i++) {
            String content = slides.get(i).getContent();
            if (content == null || content.isBlank()) {
                continue;
            }
            String firstLine = content.split("\\n", 2)[0].trim();
            if (firstLine.isEmpty()) {
                continue;
            }
            if (summary.length() > 0) {
                summary.append(" ");
            }
            summary.append(firstLine);
        }
        return summary.toString();
    }

    private String requireNonBlankString(JsonObject object, String key) {
        if (!object.has(key) || object.get(key) == null || object.get(key).isJsonNull()) {
            throw new IllegalStateException("missing field: " + key);
        }
        String value = object.get(key).getAsString().trim();
        if (value.isEmpty()) {
            throw new IllegalStateException("empty field: " + key);
        }
        return value;
    }

    private String optionalString(JsonObject object, String key) {
        if (!object.has(key) || object.get(key) == null || object.get(key).isJsonNull()) {
            return "";
        }
        return object.get(key).getAsString().trim();
    }

    private JsonArray requireArray(JsonObject object, String key) {
        if (!object.has(key) || !object.get(key).isJsonArray()) {
            throw new IllegalStateException("missing array: " + key);
        }
        return object.getAsJsonArray(key);
    }

    private JsonArray getArrayIfExists(JsonObject object, String key) {
        if (!object.has(key) || !object.get(key).isJsonArray()) {
            return null;
        }
        return object.getAsJsonArray(key);
    }


    private void saveContent(GeneratedContentData content) throws IOException {
        String filename = sanitizeFilename(content.getTopic()) + "_" + System.currentTimeMillis() + ".json";
        Path filepath = DATA_DIR.resolve(filename);
        
        String json = gson.toJson(content);
        Files.write(filepath, json.getBytes());
        
        System.out.println("Content saved to: " + filepath);
    }

    private String sanitizeFilename(String input) {
        return input.replaceAll("[^a-zA-Z0-9\\u0590-\\u05FF_-]", "_");
    }

    private static void updateStatus(Consumer<String> callback, String status) {
        if (callback != null) {
            callback.accept(status);
        }
    }

    private boolean isMeaningfulTopic(String topic) {
        if (topic == null) {
            return false;
        }

        String cleaned = topic.trim();
        if (cleaned.length() < 2) {
            return false;
        }

        int letterCount = 0;
        for (int i = 0; i < cleaned.length(); i++) {
            if (Character.isLetter(cleaned.charAt(i))) {
                letterCount++;
            }
        }

        if (letterCount < 2) {
            return false;
        }

        String lower = cleaned.toLowerCase(java.util.Locale.ROOT);
        String[] invalidFragments = {"asdf", "qwer", "test", "xxx", "zzz", "lol", "123", "!!!!!", "?????"};
        for (String invalid : invalidFragments) {
            if (lower.contains(invalid)) {
                return false;
            }
        }

        return true;
    }
}
