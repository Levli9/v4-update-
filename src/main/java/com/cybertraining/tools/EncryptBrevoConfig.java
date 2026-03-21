package com.cybertraining.tools;

import java.io.InputStream;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.Properties;

import javax.crypto.Cipher;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;

public class EncryptBrevoConfig {

    private static final String BREVO_FILE_PATH = "data/brevo.properties";
    private static final String BREVO_API_KEY_PROP = "BREVO_API_KEY";
    private static final String BREVO_API_KEY_ENC_PROP = "BREVO_API_KEY_ENC";
    private static final String BREVO_SECRET_ENV = "BREVO_CONFIG_SECRET";
    private static final String ENC_PREFIX = "enc:";
    private static final String DEFAULT_LOCAL_SECRET = "CyberTrainingSystemLocalSecret-v1";

    public static void main(String[] args) throws Exception {
        Path filePath = Paths.get(BREVO_FILE_PATH);
        if (!Files.exists(filePath)) {
            System.out.println("brevo.properties not found: " + filePath.toAbsolutePath());
            return;
        }

        Properties props = new Properties();
        try (InputStream in = Files.newInputStream(filePath)) {
            props.load(in);
        }

        String plain = props.getProperty(BREVO_API_KEY_PROP);
        if (plain == null || plain.trim().isEmpty()) {
            System.out.println("No plaintext BREVO_API_KEY found. Nothing to encrypt.");
            return;
        }

        String encrypted = encryptApiKey(plain.trim(), getConfigSecret());
        props.remove(BREVO_API_KEY_PROP);
        props.setProperty(BREVO_API_KEY_ENC_PROP, encrypted);

        try (OutputStream out = Files.newOutputStream(filePath)) {
            props.store(out, "Brevo local configuration (encrypted)");
        }

        System.out.println("Encrypted BREVO_API_KEY successfully.");
    }

    private static String encryptApiKey(String plainText, String secret) throws Exception {
        byte[] key = MessageDigest.getInstance("SHA-256").digest(secret.getBytes(StandardCharsets.UTF_8));
        byte[] iv = new byte[12];
        new SecureRandom().nextBytes(iv);

        Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
        cipher.init(Cipher.ENCRYPT_MODE, new SecretKeySpec(key, "AES"), new GCMParameterSpec(128, iv));
        byte[] encrypted = cipher.doFinal(plainText.getBytes(StandardCharsets.UTF_8));

        byte[] payload = new byte[iv.length + encrypted.length];
        System.arraycopy(iv, 0, payload, 0, iv.length);
        System.arraycopy(encrypted, 0, payload, iv.length, encrypted.length);

        return ENC_PREFIX + Base64.getEncoder().encodeToString(payload);
    }

    private static String getConfigSecret() {
        String fromEnv = System.getenv(BREVO_SECRET_ENV);
        if (fromEnv != null && !fromEnv.trim().isEmpty()) {
            return fromEnv.trim();
        }

        String fromProp = System.getProperty(BREVO_SECRET_ENV);
        if (fromProp != null && !fromProp.trim().isEmpty()) {
            return fromProp.trim();
        }

        return DEFAULT_LOCAL_SECRET;
    }
}
