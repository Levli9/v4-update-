package com.cybertraining;

import java.util.List;
import java.util.ArrayList;

public class LLMTest {
    public static void main(String[] args) {
        // Mock LLMService functionality
        String prompt = "Create a cyber security training presentation about phishing attacks";

        // Mock response
        List<String> slides = new ArrayList<>();
        slides.add("<h1>הבנת התקפות פישינג</h1><p>פישינג הוא סוג של התקפה סייבר שמטרתה לגנוב מידע אישי או כספי על ידי התחזות לישות מהימנה.</p>");
        slides.add("<h2>סוגי פישינג נפוצים</h2><ul><li>פישינג באימייל</li><li>פישינג באתר</li><li>פישינג בטלפון (וישינג)</li></ul>");
        slides.add("<h2>איך להגן מפני פישינג</h2><p>תמיד בדקו את הכתובת של האתר, אל תלחצו על קישורים חשודים, והשתמשו בתוכנות אנטי-וירוס.</p>");

        List<String> videos = new ArrayList<>();
        videos.add(""); // No video for first slide
        videos.add(""); // No video for second slide
        videos.add(""); // No video for third slide

        System.out.println("Mock LLM Generation Test:");
        System.out.println("Prompt: " + prompt);
        System.out.println("Generated " + slides.size() + " slides");
        for (int i = 0; i < slides.size(); i++) {
            System.out.println("Slide " + (i+1) + ": " + slides.get(i).substring(0, Math.min(50, slides.get(i).length())) + "...");
        }
        System.out.println("Test completed successfully!");
    }
}