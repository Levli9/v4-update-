package com.cybertraining.model.learning;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class LessonModule {

    private final String title;
    private final List<LessonSlide> slides;
    private final List<QuizQuestion> quiz;

    public LessonModule(String title, List<LessonSlide> slides, List<QuizQuestion> quiz) {
        this.title = title == null ? "" : title;
        this.slides = Collections.unmodifiableList(new ArrayList<>(slides == null ? List.of() : slides));
        this.quiz = Collections.unmodifiableList(new ArrayList<>(quiz == null ? List.of() : quiz));
    }

    public String getTitle() {
        return title;
    }

    public List<LessonSlide> getSlides() {
        return slides;
    }

    public List<QuizQuestion> getQuiz() {
        return quiz;
    }
}
