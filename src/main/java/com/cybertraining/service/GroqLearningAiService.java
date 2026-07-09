package com.cybertraining.service;

public class GroqLearningAiService implements LearningAiService {

    private final LLMService llmService;

    public GroqLearningAiService(LLMService llmService) {
        this.llmService = llmService;
    }

    @Override
    public String generateLessonJson(String topic) throws Exception {
        return llmService.generateStructuredContent(topic);
    }
}
