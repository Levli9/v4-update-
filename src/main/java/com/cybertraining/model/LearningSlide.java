package com.cybertraining.model;

public class LearningSlide {

    private int id;
    private int courseId;
    private String title;
    private String content;

    public LearningSlide(int id, int courseId, String title, String content) {
        this.id = id;
        this.courseId = courseId;
        this.title = title;
        this.content = content;
    }

    public int getId() {
        return id;
    }

    public int getCourseId() {
        return courseId;
    }

    public String getTitle() {
        return title;
    }

    public String getContent() {
        return content;
    }
}