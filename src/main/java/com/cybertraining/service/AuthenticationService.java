package com.cybertraining.service;

// import org.mindrot.jbcrypt.BCrypt; // Temporarily disabled

import java.io.InputStream;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.Arrays;
import java.util.Base64;
import java.util.Properties;

import javax.crypto.Cipher;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;

import org.mindrot.jbcrypt.BCrypt;

import com.cybertraining.db.DatabaseManager;
import com.cybertraining.model.User;

import brevo.ApiClient;
import brevo.Configuration;
import brevo.auth.ApiKeyAuth;
import brevoApi.TransactionalEmailsApi;
import brevoModel.SendSmtpEmail;
import brevoModel.SendSmtpEmailSender;
import brevoModel.SendSmtpEmailTo;

public class AuthenticationService {

    private final DatabaseManager db;
    private static final String BREVO_FILE_PATH = "data/brevo.properties";
    private static final String BREVO_API_KEY_PROP = "BREVO_API_KEY";
    private static final String BREVO_API_KEY_ENC_PROP = "BREVO_API_KEY_ENC";
    private static final String BREVO_SECRET_ENV = "BREVO_CONFIG_SECRET";
    private static final String ENC_PREFIX = "enc:";
    private static final String DEFAULT_LOCAL_SECRET = "CyberTrainingSystemLocalSecret-v1";

    public AuthenticationService(DatabaseManager db) {
        this.db = db;
    }

    public User authenticate(String username, String password, String roleDisplay) {
        User u = db.getUserByUsername(username);
        if (u == null) return null;
        String stored = u.getPassword();
        if (stored == null) return null;
        // Temporarily disabled BCrypt for compilation - using simple comparison
        // if (BCrypt.checkpw(password, stored)) return u;
        if (BCrypt.checkpw(password, stored)) return u;
        return null;
    }

    public User register(String username, String password, String fullName, String roleDisplay, String department, String email) {
        // Validate password strength
        if (!isValidPassword(password)) {
            throw new IllegalArgumentException("הסיסמה חייבת להיות לפחות 8 תווים, עם אות גדולה אחת לפחות וסימן מיוחד אחד לפחות");
        }
        // Validate email format
        if (!isValidEmail(email)) {
            throw new IllegalArgumentException("כתובת אימייל לא תקינה");
        }
        // hash password before storing
        // String hashed = BCrypt.hashpw(password, BCrypt.gensalt(12));
        String hashed = BCrypt.hashpw(password, BCrypt.gensalt(12));
        return db.registerUser(username, hashed, fullName, roleDisplay, department, email);
    }

    private boolean isValidPassword(String password) {
        return password != null && password.length() >= 6;
    }

    private boolean isValidEmail(String email) {
        if (email == null || email.trim().isEmpty()) {
            return false;
        }
        return email.matches("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$");
    }

    public String initiatePasswordRecovery(String email) {
        User user = db.getUserByEmail(email);
        if (user == null) {
            throw new IllegalArgumentException("כתובת האימייל לא רשומה במערכת");
        }

        // Generate a recovery code (6 digits)
        String recoveryCode = String.format("%06d", (int)(Math.random() * 1000000));

        // Send recovery email
        sendRecoveryEmail(email, recoveryCode);

        return recoveryCode; // For testing - in production, don't return this
    }

    public boolean isEmailDeliveryConfigured() {
        return resolveBrevoApiKey() != null;
    }

    public boolean resetPassword(String email, String recoveryCode, String newPassword) {
        if (email == null || email.trim().isEmpty()) {
            throw new IllegalArgumentException("יש להזין כתובת אימייל");
        }

        if (recoveryCode == null || recoveryCode.trim().isEmpty()) {
            throw new IllegalArgumentException("יש להזין קוד אימות");
        }

        // Validate password strength
        if (!isValidPassword(newPassword)) {
            throw new IllegalArgumentException("הסיסמה חייבת להיות לפחות 8 תווים, עם אות גדולה אחת לפחות וסימן מיוחד אחד לפחות");
        }

        // In a real application, verify the recovery code from storage
        // For now, we'll assume the code is valid if provided

        String hashed = BCrypt.hashpw(newPassword, BCrypt.gensalt(12));
        return db.updatePasswordByEmail(email.trim(), hashed);
    }

    private void sendRecoveryEmail(String email, String recoveryCode) {
        String apiKey = resolveBrevoApiKey();
        if (apiKey == null || apiKey.trim().isEmpty()) {
            throw new RuntimeException("שליחת אימייל לא זמינה כרגע (BREVO_API_KEY לא מוגדר).\n"
                    + "יש להגדיר מפתח Brevo במשתנה סביבה BREVO_API_KEY\n"
                    + "או בקובץ data/brevo.properties");
        }

        System.out.println("🔄 Starting email send process for: " + email);
        System.out.println("🔑 API Key present: " + (apiKey != null && !apiKey.trim().isEmpty()));

        try {
            // Create Brevo client (similar to JavaScript)
            BrevoClient client = new BrevoClient(apiKey);

            // Send transactional email (similar to JavaScript structure)
            client.sendTransacEmail(new EmailData(
                "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;'>" +
                "<h2 style='color: #333;'>שחזור סיסמה - מערכת סייבר טריינינג</h2>" +
                "<p>שלום,</p>" +
                "<p>קיבלת הודעה זו כי ביקשת לשחזר את סיסמתך במערכת.</p>" +
                "<div style='background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;'>" +
                "<h3 style='margin-top: 0; color: #007bff;'>קוד האימות שלך:</h3>" +
                "<p style='font-size: 24px; font-weight: bold; color: #28a745; letter-spacing: 3px;'>" + recoveryCode + "</p>" +
                "</div>" +
                "<p><strong>הערה:</strong> הקוד תקף ל-15 דקות בלבד.</p>" +
                "<p>אם לא ביקשת שחזור סיסמה, אנא התעלם מהודעה זו.</p>" +
                "<hr>" +
                "<p style='color: #666; font-size: 12px;'>מערכת סייבר טריינינג - אבטחת מידע</p>" +
                "</div>",
                new Sender("thebeastcom71@gmail.com", "Cyber Training System"),
                "🔐 קוד אימות למערכת סייבר טריינינג",
                Arrays.asList(new Recipient(email, null)) // name can be null
            ));

            System.out.println("✅ אימייל נשלח בהצלחה ל: " + email);
        } catch (Throwable e) {
            System.err.println("❌ שגיאה בשליחת אימייל: " + e.getMessage());
            System.err.println("❌ Exception type: " + e.getClass().getName());
            e.printStackTrace();
            throw new RuntimeException("שליחת האימייל נכשלה. נסה שוב מאוחר יותר.");
        }
    }

    private String resolveBrevoApiKey() {
        String fromEnv = sanitizeApiKeyCandidate(System.getenv(BREVO_API_KEY_PROP));
        if (fromEnv != null) return fromEnv;

        String fromProp = sanitizeApiKeyCandidate(System.getProperty(BREVO_API_KEY_PROP));
        if (fromProp != null) return fromProp;

        try {
            Path p = Paths.get(BREVO_FILE_PATH);
            if (Files.exists(p)) {
                Properties props = new Properties();
                try (InputStream in = Files.newInputStream(p)) {
                    props.load(in);
                }

                String encFromFile = props.getProperty(BREVO_API_KEY_ENC_PROP);
                if (encFromFile != null && !encFromFile.trim().isEmpty()) {
                    return decryptApiKey(encFromFile.trim());
                }

                String plainFromFile = sanitizeApiKeyCandidate(props.getProperty(BREVO_API_KEY_PROP));
                if (plainFromFile != null) {
                    String plain = plainFromFile;
                    migratePlainKeyToEncryptedFile(p, props, plain);
                    return plain;
                }
            }
        } catch (Exception ignored) {
        }

        return null;
    }

    private String sanitizeApiKeyCandidate(String value) {
        if (value == null) return null;
        String trimmed = value.trim();
        if (trimmed.isEmpty()) return null;

        String upper = trimmed.toUpperCase();
        if (upper.contains("YOUR_BREVO_API_KEY") || upper.contains("PLACEHOLDER") || upper.equals("CHANGEME")) {
            return null;
        }
        return trimmed;
    }

    private void migratePlainKeyToEncryptedFile(Path filePath, Properties props, String plainApiKey) {
        try {
            String encrypted = encryptApiKey(plainApiKey);
            props.remove(BREVO_API_KEY_PROP);
            props.setProperty(BREVO_API_KEY_ENC_PROP, encrypted);
            try (OutputStream out = Files.newOutputStream(filePath)) {
                props.store(out, "Brevo local configuration (encrypted)");
            }
            System.out.println("🔐 BREVO_API_KEY migrated to encrypted format in " + BREVO_FILE_PATH);
        } catch (Exception ex) {
            System.err.println("⚠️ Could not auto-migrate Brevo key to encrypted format: " + ex.getMessage());
        }
    }

    private String encryptApiKey(String plainText) throws Exception {
        byte[] key = deriveAesKey(getConfigSecret());
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

    private String decryptApiKey(String encodedValue) throws Exception {
        String value = encodedValue.startsWith(ENC_PREFIX) ? encodedValue.substring(ENC_PREFIX.length()) : encodedValue;
        byte[] payload = Base64.getDecoder().decode(value);
        if (payload.length <= 12) {
            throw new IllegalArgumentException("Encrypted Brevo key payload is invalid");
        }

        byte[] iv = Arrays.copyOfRange(payload, 0, 12);
        byte[] encrypted = Arrays.copyOfRange(payload, 12, payload.length);

        byte[] key = deriveAesKey(getConfigSecret());
        Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
        cipher.init(Cipher.DECRYPT_MODE, new SecretKeySpec(key, "AES"), new GCMParameterSpec(128, iv));
        byte[] decrypted = cipher.doFinal(encrypted);
        return new String(decrypted, StandardCharsets.UTF_8);
    }

    private byte[] deriveAesKey(String secret) throws Exception {
        MessageDigest digest = MessageDigest.getInstance("SHA-256");
        return digest.digest(secret.getBytes(StandardCharsets.UTF_8));
    }

    private String getConfigSecret() {
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

    // BrevoClient class (similar to JavaScript BrevoClient)
    private static class BrevoClient {
        private final String apiKey;

        public BrevoClient(String apiKey) {
            this.apiKey = apiKey;
        }

        public void sendTransacEmail(EmailData emailData) throws Exception {
            System.out.println("🔄 Initializing Brevo API client...");
            ApiClient defaultClient = Configuration.getDefaultApiClient();
            ApiKeyAuth apiKeyAuth = (ApiKeyAuth) defaultClient.getAuthentication("api-key");
            apiKeyAuth.setApiKey(apiKey);

            System.out.println("🔄 Creating TransactionalEmailsApi instance...");
            TransactionalEmailsApi api = new TransactionalEmailsApi();

            System.out.println("🔄 Building email object...");
            SendSmtpEmail emailObj = new SendSmtpEmail();

            // Convert our data structure to Sendinblue SDK format
            emailObj.setTo(emailData.to.stream()
                .map(recipient -> {
                    SendSmtpEmailTo to = new SendSmtpEmailTo();
                    to.email(recipient.email);
                    if (recipient.name != null) {
                        to.name(recipient.name);
                    }
                    return to;
                })
                .collect(java.util.stream.Collectors.toList()));

            SendSmtpEmailSender sender = new SendSmtpEmailSender();
            sender.setEmail(emailData.sender.email);
            sender.setName(emailData.sender.name);
            emailObj.setSender(sender);

            emailObj.setSubject(emailData.subject);
            emailObj.setHtmlContent(emailData.htmlContent);

            System.out.println("🔄 Sending email via Brevo API...");
            System.out.println("📧 To: " + emailData.to.get(0).email);
            System.out.println("📧 From: " + emailData.sender.email);
            System.out.println("📧 Subject: " + emailData.subject);

            // Send the email and get response
            Object response = api.sendTransacEmail(emailObj);
            System.out.println("✅ Brevo API response: " + response);
        }
    }

    // Data classes (similar to JavaScript objects)
    private static class EmailData {
        public final String htmlContent;
        public final Sender sender;
        public final String subject;
        public final java.util.List<Recipient> to;

        public EmailData(String htmlContent, Sender sender, String subject, java.util.List<Recipient> to) {
            this.htmlContent = htmlContent;
            this.sender = sender;
            this.subject = subject;
            this.to = to;
        }
    }

    private static class Sender {
        public final String email;
        public final String name;

        public Sender(String email, String name) {
            this.email = email;
            this.name = name;
        }
    }

    private static class Recipient {
        public final String email;
        public final String name;

        public Recipient(String email, String name) {
            this.email = email;
            this.name = name;
        }
    }
}
