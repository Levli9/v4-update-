package com.cybertraining.service;

import java.util.function.Consumer;

import com.cybertraining.model.GeneratedContentData;

public class LearningModuleController {

    private static final long MIN_GENERATION_TIME_MS = 60_000L;

    private final LearningAiService aiService;
    private final ContentGenerationService contentGenerationService;

    public LearningModuleController(LearningAiService aiService, ContentGenerationService contentGenerationService) {
        this.aiService = aiService;
        this.contentGenerationService = contentGenerationService;
    }

    public GeneratedContentData generateModule(String topic, String organizationContext, String organizationDetails,
            Consumer<String> statusCallback) throws Exception {

        long startMs = System.currentTimeMillis();

        if (statusCallback != null) {
            statusCallback.accept("בנייה של בקשה...");
            statusCallback.accept("שליחה ל-AI...");
        }

        String jsonResponse = aiService.generateLessonJson(topic);

        if (statusCallback != null) {
            statusCallback.accept("עיבוד תוצאות...");
        }

        long elapsed = System.currentTimeMillis() - startMs;
        long remaining = MIN_GENERATION_TIME_MS - elapsed;
        if (remaining > 0) {
            if (statusCallback != null) {
                statusCallback.accept("מלטש ומסדר את התוכן לתוצאה ברורה...");
            }
            Thread.sleep(remaining);
        }

        return contentGenerationService.generateContentFromJson(topic, organizationContext, organizationDetails, jsonResponse,
                statusCallback);
    }
}
