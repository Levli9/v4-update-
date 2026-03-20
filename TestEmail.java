import com.cybertraining.service.AuthenticationService;
import com.cybertraining.db.DatabaseManager;

public class TestEmail {
    public static void main(String[] args) {
        System.out.println("Testing Brevo email sending...");

        // Set the API key for this test
        System.setProperty("BREVO_API_KEY", "YOUR_BREVO_API_KEY_HERE");

        try {
            DatabaseManager db = new DatabaseManager();
            AuthenticationService auth = new AuthenticationService(db);

            System.out.println("Sending password recovery email to yanivlegin@gmail.com...");
            String code = auth.initiatePasswordRecovery("yanivlegin@gmail.com");
            System.out.println("SUCCESS: Email sent! Recovery code: " + code);

        } catch (Exception e) {
            System.out.println("ERROR: " + e.getMessage());
            e.printStackTrace();
        }
    }
}