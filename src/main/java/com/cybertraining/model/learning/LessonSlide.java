package com.cybertraining.model.learning;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class LessonSlide {

    private final String heading;
    private final String content;
    private final List<String> bullets;

    public LessonSlide(String heading, String content, List<String> bullets) {
        this.heading = heading == null ? "" : heading;
        this.content = content == null ? "" : content;
        this.bullets = Collections.unmodifiableList(new ArrayList<>(bullets == null ? List.of() : bullets));
    }

    public String getHeading() {
        return heading;
    }

    public String getContent() {
        return content;
    }

    public List<String> getBullets() {
        return bullets;
    }
}
