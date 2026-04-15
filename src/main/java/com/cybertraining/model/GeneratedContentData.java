package com.cybertraining.model;

import java.util.List;

/**
 * DTO לייצוג תוכן שנוצר על ידי AI
 * כולל: לומדה, מצגת ושאלון
 */
public class GeneratedContentData {

    private String id;
    private String topic;
    private String organizationContext;
    private String organizationDetails;
    private LearningModule learningModule;
    private Presentation presentation;
    private Quiz quiz;
    private long createdAt;
    private String status; // "ready", "generating", "error"

    public GeneratedContentData() {
    }

    public GeneratedContentData(String topic, String organizationContext, String organizationDetails) {
        this.topic = topic;
        this.organizationContext = organizationContext;
        this.organizationDetails = organizationDetails;
        this.id = generateId();
        this.createdAt = System.currentTimeMillis();
        this.status = "generating";
    }

    private String generateId() {
        return "content_" + System.currentTimeMillis() + "_" + (int) (Math.random() * 10000);
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━ GETTERS & SETTERS ━━━━━━━━━━━━━━━━━━━━━━━━

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getTopic() {
        return topic;
    }

    public void setTopic(String topic) {
        this.topic = topic;
    }

    public String getOrganizationContext() {
        return organizationContext;
    }

    public void setOrganizationContext(String organizationContext) {
        this.organizationContext = organizationContext;
    }

    public String getOrganizationDetails() {
        return organizationDetails;
    }

    public void setOrganizationDetails(String organizationDetails) {
        this.organizationDetails = organizationDetails;
    }

    public LearningModule getLearningModule() {
        return learningModule;
    }

    public void setLearningModule(LearningModule learningModule) {
        this.learningModule = learningModule;
    }

    public Presentation getPresentation() {
        return presentation;
    }

    public void setPresentation(Presentation presentation) {
        this.presentation = presentation;
    }

    public Quiz getQuiz() {
        return quiz;
    }

    public void setQuiz(Quiz quiz) {
        this.quiz = quiz;
    }

    public long getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(long createdAt) {
        this.createdAt = createdAt;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━ INNER CLASSES ━━━━━━━━━━━━━━━━━━━━━━━━

    public static class LearningModule {
        private String title;
        private String introduction;
        private List<Section> sections;
        private String summary;

        public LearningModule() {
        }

        public LearningModule(String title, String introduction, List<Section> sections, String summary) {
            this.title = title;
            this.introduction = introduction;
            this.sections = sections;
            this.summary = summary;
        }

        public String getTitle() {
            return title;
        }

        public void setTitle(String title) {
            this.title = title;
        }

        public String getIntroduction() {
            return introduction;
        }

        public void setIntroduction(String introduction) {
            this.introduction = introduction;
        }

        public List<Section> getSections() {
            return sections;
        }

        public void setSections(List<Section> sections) {
            this.sections = sections;
        }

        public String getSummary() {
            return summary;
        }

        public void setSummary(String summary) {
            this.summary = summary;
        }
    }

    public static class Section {
        private String title;
        private List<Slide> slides;

        public Section() {
        }

        public Section(String title, List<Slide> slides) {
            this.title = title;
            this.slides = slides;
        }

        public String getTitle() {
            return title;
        }

        public void setTitle(String title) {
            this.title = title;
        }

        public List<Slide> getSlides() {
            return slides;
        }

        public void setSlides(List<Slide> slides) {
            this.slides = slides;
        }
    }

    public static class Presentation {
        private String title;
        private List<Slide> slides;

        public Presentation() {
        }

        public Presentation(String title, List<Slide> slides) {
            this.title = title;
            this.slides = slides;
        }

        public String getTitle() {
            return title;
        }

        public void setTitle(String title) {
            this.title = title;
        }

        public List<Slide> getSlides() {
            return slides;
        }

        public void setSlides(List<Slide> slides) {
            this.slides = slides;
        }
    }

    public static class Slide {
        private int slideNumber;
        private String title;
        private String content;
        private List<String> bulletPoints;
        private String speakerNotes;

        public Slide() {
        }

        public Slide(int slideNumber, String title, String content, List<String> bulletPoints, String speakerNotes) {
            this.slideNumber = slideNumber;
            this.title = title;
            this.content = content;
            this.bulletPoints = bulletPoints;
            this.speakerNotes = speakerNotes;
        }

        public int getSlideNumber() {
            return slideNumber;
        }

        public void setSlideNumber(int slideNumber) {
            this.slideNumber = slideNumber;
        }

        public String getTitle() {
            return title;
        }

        public void setTitle(String title) {
            this.title = title;
        }

        public String getContent() {
            return content;
        }

        public void setContent(String content) {
            this.content = content;
        }

        public List<String> getBulletPoints() {
            return bulletPoints;
        }

        public void setBulletPoints(List<String> bulletPoints) {
            this.bulletPoints = bulletPoints;
        }

        public String getSpeakerNotes() {
            return speakerNotes;
        }

        public void setSpeakerNotes(String speakerNotes) {
            this.speakerNotes = speakerNotes;
        }
    }

    public static class Quiz {
        private List<Question> questions;

        public Quiz() {
        }

        public Quiz(List<Question> questions) {
            this.questions = questions;
        }

        public List<Question> getQuestions() {
            return questions;
        }

        public void setQuestions(List<Question> questions) {
            this.questions = questions;
        }
    }

    public static class Question {
        private String question;
        private List<String> options;
        private String correctAnswer;
        private String explanation;

        public Question() {
        }

        public Question(String question, List<String> options, String correctAnswer, String explanation) {
            this.question = question;
            this.options = options;
            this.correctAnswer = correctAnswer;
            this.explanation = explanation;
        }

        public String getQuestion() {
            return question;
        }

        public void setQuestion(String question) {
            this.question = question;
        }

        public List<String> getOptions() {
            return options;
        }

        public void setOptions(List<String> options) {
            this.options = options;
        }

        public String getCorrectAnswer() {
            return correctAnswer;
        }

        public void setCorrectAnswer(String correctAnswer) {
            this.correctAnswer = correctAnswer;
        }

        public String getExplanation() {
            return explanation;
        }

        public void setExplanation(String explanation) {
            this.explanation = explanation;
        }
    }
}
