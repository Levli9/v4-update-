package com.cybertraining.model.learning;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class QuizQuestion {

    private final String question;
    private final List<String> options;
    private final String correctAnswer;
    private final String explanation;

    public QuizQuestion(String question, List<String> options, String correctAnswer, String explanation) {
        this.question = question == null ? "" : question;
        this.options = Collections.unmodifiableList(new ArrayList<>(options == null ? List.of() : options));
        this.correctAnswer = correctAnswer == null ? "" : correctAnswer;
        this.explanation = explanation == null ? "" : explanation;
    }

    public String getQuestion() {
        return question;
    }

    public List<String> getOptions() {
        return options;
    }

    public String getCorrectAnswer() {
        return correctAnswer;
    }

    public String getExplanation() {
        return explanation;
    }
}
