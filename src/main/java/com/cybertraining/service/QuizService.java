package com.cybertraining.service;

import java.util.List;

import com.cybertraining.model.Question;

public class QuizService {

    private List<Question> questions;
    private int currentIndex = 0;
    private int correctAnswers = 0;

    public QuizService(List<Question> questions) {
        this.questions = questions;
    }

    public Question getCurrentQuestion() {
        return questions.get(currentIndex);
    }

    public boolean hasNextQuestion() {
        return currentIndex < questions.size() - 1;
    }

    public void nextQuestion() {
        if (hasNextQuestion()) {
            currentIndex++;
        }
    }

    public void submitAnswer(int selectedIndex) {
        Question q = questions.get(currentIndex);
        if (q.isCorrect(selectedIndex)) {
            correctAnswers++;
        }
    }

    public void skipQuestion() {
        // Just empty method logically if we needed any specific bookkeeping,
        // but skipping just means we won't call submitAnswer before nextQuestion.
    }

    public int getScore() {
        if (questions.isEmpty()) return 0;
        return (int) Math.round(((double) correctAnswers / questions.size()) * 100.0);
    }

    public int getCurrentIndex() {
        return currentIndex;
    }

    public int getTotalQuestions() {
        return questions.size();
    }
}