package com.cybertraining.service;
public class LLMTest {
    public static void main(String[] args) throws Exception {
        LLMService service = new LLMService();
        System.out.println("Starting test...\n");
        String result = service.generateSlides("test");
        System.out.println("\nResult:\n" + result);
        System.exit(0);
    }
}
