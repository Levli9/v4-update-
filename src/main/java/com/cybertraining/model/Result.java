package com.cybertraining.model;

public class Result {

    private User user;
    private Course course;
    private int score;
    private long timestamp;
    // duration in seconds that the user spent on the quiz/test
    private long durationSeconds;

    public Result(User user, Course course, int score) {
        this.user = user;
        this.course = course;
        this.score = score;
        this.timestamp = System.currentTimeMillis();
        this.durationSeconds = 0L;
    }

    public Result(User user, Course course, int score, long durationSeconds) {
        this.user = user;
        this.course = course;
        this.score = score;
        this.timestamp = System.currentTimeMillis();
        this.durationSeconds = durationSeconds;
    }

    public User getUser() {
        return user;
    }

    public Course getCourse() {
        return course;
    }

    public int getScore() {
        return score;
    }

    public long getTimestamp() {
        return timestamp;
    }

    public long getDurationSeconds() {
        return durationSeconds;
    }

    public void setDurationSeconds(long durationSeconds) {
        this.durationSeconds = durationSeconds;
    }

    public boolean isPassed() {
        return score >= 60;
    }
}
