package com.cybertraining.service;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;

import com.cybertraining.model.learning.LessonModule;
import com.cybertraining.model.learning.LessonSlide;
import com.cybertraining.model.learning.QuizQuestion;
import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;

public class LearningModuleMapper {

    private final Gson gson = new Gson();

    public LessonModule parse(String jsonResponse) {
        JsonObject root = gson.fromJson(jsonResponse, JsonObject.class);
        if (root == null) {
            throw new IllegalStateException("missing root json");
        }

        String title = text(root, "title");
        if (title.isBlank()) {
            title = text(root, "courseTitle");
        }
        if (title.isBlank()) {
            title = "הדרכה מותאמת";
        }

        List<LessonSlide> slides = parseSlides(root);
        if (slides.size() < 5) {
            slides = padSlides(slides);
        }
        if (slides.size() > 8) {
            slides = new ArrayList<>(slides.subList(0, 8));
        }

        List<QuizQuestion> quiz = parseQuiz(root);
        while (quiz.size() < 10) {
            int idx = quiz.size() + 1;
            quiz.add(new QuizQuestion(
                    "שאלה " + idx,
                    List.of("א", "ב", "ג", "ד"),
                    "א",
                    "זוהי שאלה משלימה שנוספה כדי להשלים את המבנה."));
        }

        if (quiz.size() > 10) {
            quiz = new ArrayList<>(quiz.subList(0, 10));
        }

        return new LessonModule(title, slides, quiz);
    }

    private List<LessonSlide> parseSlides(JsonObject root) {
        List<LessonSlide> slides = new ArrayList<>();

        JsonArray slidesArray = array(root, "slides");
        if (slidesArray != null) {
            for (JsonElement element : slidesArray) {
                if (!element.isJsonObject()) {
                    continue;
                }
                LessonSlide slide = parseSlideObject(element.getAsJsonObject(), slides.size() + 1);
                if (slide != null) {
                    slides.add(slide);
                }
            }
        }

        if (!slides.isEmpty()) {
            return slides;
        }

        JsonArray sections = array(root, "sections");
        if (sections == null) {
            return slides;
        }

        for (JsonElement sectionElement : sections) {
            if (!sectionElement.isJsonObject()) {
                continue;
            }
            JsonObject section = sectionElement.getAsJsonObject();
            JsonArray sectionSlides = array(section, "slides");
            if (sectionSlides == null) {
                continue;
            }
            for (JsonElement slideElement : sectionSlides) {
                if (!slideElement.isJsonObject()) {
                    continue;
                }
                LessonSlide slide = parseSlideObject(slideElement.getAsJsonObject(), slides.size() + 1);
                if (slide != null) {
                    slides.add(slide);
                }
            }
        }

        return slides;
    }

    private LessonSlide parseSlideObject(JsonObject slideObject, int index) {
        String heading = text(slideObject, "heading");
        if (heading.isBlank()) {
            heading = text(slideObject, "title");
        }
        if (heading.isBlank()) {
            heading = "שקף " + index;
        }

        String content = text(slideObject, "content");
        if (content.isBlank()) {
            content = text(slideObject, "summary");
        }
        if (content.isBlank()) {
            content = "תוכן לימודי קצר.";
        }
        content = enrichEducationalContent(heading, content);

        JsonArray bulletsArray = array(slideObject, "bullets");
        List<String> bullets = new ArrayList<>();
        if (bulletsArray != null) {
            for (JsonElement bullet : bulletsArray) {
                String value = textValue(bullet);
                if (!value.isBlank()) {
                    bullets.add(value);
                }
            }
        }

        if (bullets.isEmpty()) {
            bullets = List.of("נקודה חשובה", "יישום מעשי", "המלצה לפעולה");
        }

        return new LessonSlide(heading, content, bullets);
    }

    private String enrichEducationalContent(String heading, String content) {
        String normalized = content == null ? "" : content.trim();
        if (normalized.length() >= 280) {
            return normalized;
        }

        StringBuilder sb = new StringBuilder(normalized);
        if (!normalized.isBlank()) {
            sb.append("\n\n");
        }

        sb.append("היבט מקצועי: ")
                .append(heading)
                .append(" דורש שילוב בין הבנה עקרונית לבין יישום יומיומי בתהליך העבודה. ")
                .append("בפועל, חשוב לזהות מראש נקודות כשל, להגדיר אחריות ברורה, ולוודא שההנחיה מבוצעת באופן עקבי בכל צוות.")
                .append("\n")
                .append("דוגמה ליישום: להתחיל בתרחיש אמיתי קצר מתוך הארגון, לנתח את הסיכון, ולסגור עם פעולה ברורה שניתן למדוד תוך שבועיים.");

        return sb.toString();
    }

    private List<LessonSlide> padSlides(List<LessonSlide> slides) {
        List<LessonSlide> padded = new ArrayList<>(slides);
        while (padded.size() < 5) {
            int idx = padded.size() + 1;
            padded.add(new LessonSlide(
                    "שקף " + idx,
                    "הרחבה על הנושא עם דגש מעשי ויישומי.",
                    List.of("עיקרון מרכזי", "דוגמה קצרה", "מה עושים בפועל")));
        }
        return padded;
    }

    private List<QuizQuestion> parseQuiz(JsonObject root) {
        List<QuizQuestion> quiz = new ArrayList<>();
        JsonArray quizArray = array(root, "quiz");
        if (quizArray == null) {
            return quiz;
        }

        for (JsonElement element : quizArray) {
            if (!element.isJsonObject()) {
                continue;
            }
            JsonObject q = element.getAsJsonObject();
            String question = normalizeQuestion(text(q, "question"));
            if (question.isBlank()) {
                continue;
            }

            LinkedHashSet<String> optionsSet = new LinkedHashSet<>();
            JsonArray optionsArray = array(q, "options");
            if (optionsArray != null) {
                for (JsonElement optionElement : optionsArray) {
                    String option = normalizeOption(textValue(optionElement));
                    if (!option.isBlank()) {
                        optionsSet.add(option);
                    }
                }
            }

            List<String> options = new ArrayList<>(optionsSet);
            while (options.size() < 4) {
                options.add("מסיח לא נכון " + (options.size() + 1));
            }
            if (options.size() > 4) {
                options = new ArrayList<>(options.subList(0, 4));
            }

            String correctAnswer = normalizeOption(text(q, "correctAnswer"));
            if (correctAnswer.isBlank() || !options.contains(correctAnswer)) {
                correctAnswer = options.get(0);
            }

            String explanation = text(q, "explanation");
            if (explanation.isBlank()) {
                explanation = "הסבר קצר לתשובה הנכונה.";
            }
            if (explanation.length() < 30) {
                explanation = explanation + " חשוב לשים לב למושג המרכזי ולסיבה שהתשובה הזו מדויקת יותר מהאחרות.";
            }

            quiz.add(new QuizQuestion(question, options, correctAnswer, explanation));
        }

        return quiz;
    }

    private String normalizeQuestion(String rawQuestion) {
        String q = rawQuestion == null ? "" : rawQuestion.trim();
        q = q.replaceAll("^[•\\-\\d\\.)\\s]+", "");
        if (!q.isBlank() && !q.endsWith("?")) {
            q = q + "?";
        }
        return q;
    }

    private String normalizeOption(String rawOption) {
        String option = rawOption == null ? "" : rawOption.trim();
        option = option.replaceAll("^[•\\-\\d\\.)\\s]+", "");
        return option;
    }

    private JsonArray array(JsonObject object, String key) {
        if (!object.has(key) || !object.get(key).isJsonArray()) {
            return null;
        }
        return object.getAsJsonArray(key);
    }

    private String text(JsonObject object, String key) {
        if (!object.has(key) || object.get(key).isJsonNull()) {
            return "";
        }
        return object.get(key).getAsString().trim();
    }

    private String textValue(JsonElement element) {
        if (element == null || element.isJsonNull()) {
            return "";
        }
        return element.getAsString().trim();
    }
}
