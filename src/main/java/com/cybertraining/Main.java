package com.cybertraining;

import javax.swing.SwingUtilities;

import com.cybertraining.db.DatabaseManager;
import com.cybertraining.service.AuthenticationService;
import com.cybertraining.ui.WelcomeFrame;

public class Main {

    public static void main(String[] args) {
        SwingUtilities.invokeLater(() -> {

            DatabaseManager databaseManager = new DatabaseManager();
            AuthenticationService auth = new AuthenticationService(databaseManager);

            // Check existing data
            System.out.println("Users in database: " + databaseManager.getUserCount());
            System.out.println("Results in database: " + databaseManager.getResults().size());
            System.out.println("Courses in database: " + databaseManager.getCourses().size());

            // ensure at least one manager exists for first-run convenience
            if (databaseManager.getUserCount() == 0) {
                auth.register("manager", "Manager123!", "מנהל מערכת", "מנהל", "הנהלה", "admin@cybertraining.com");
            }

            // Add special manager users if they don't exist
            try {
                if (databaseManager.getUserByUsername("Yaniv123") == null) {
                    auth.register("Yaniv123", "Yaniv123", "יניב", "מנהל", "הנהלה", "thebeastcom71@gmail.com");
                }
                if (databaseManager.getUserByUsername("Lev123") == null) {
                    auth.register("Lev123", "Lev123", "לב", "מנהל", "הנהלה", "thebeastcom71@gmail.com");
                }
                // Add employee versions of the same users
                if (databaseManager.getUserByUsername("Yaniv123_emp") == null) {
                    auth.register("Yaniv123_emp", "Yaniv123", "יניב (עובד)", "עובד", "פיתוח", "thebeastcom71@gmail.com");
                }
                if (databaseManager.getUserByUsername("Lev123_emp") == null) {
                    auth.register("Lev123_emp", "Lev123", "לב (עובד)", "עובד", "מכירות", "thebeastcom71@gmail.com");
                }
            } catch (Exception e) {
                // Ignore if user creation fails
            }

            // Add some demo results if database is empty
            if (databaseManager.getResults().isEmpty()) {
                try {
                    // Get the employee users we just created
                    com.cybertraining.model.User yanivEmp = databaseManager.getUserByUsername("Yaniv123_emp");
                    com.cybertraining.model.User levEmp = databaseManager.getUserByUsername("Lev123_emp");
                    
                    // Get the first course
                    com.cybertraining.model.Course course = databaseManager.getCourses().isEmpty() ? null : databaseManager.getCourses().get(0);
                    
                    if (yanivEmp != null && course != null) {
                        databaseManager.saveResult(new com.cybertraining.model.Result(yanivEmp, course, 85));
                        databaseManager.saveResult(new com.cybertraining.model.Result(yanivEmp, course, 92));
                    }
                    if (levEmp != null && course != null) {
                        databaseManager.saveResult(new com.cybertraining.model.Result(levEmp, course, 78));
                        databaseManager.saveResult(new com.cybertraining.model.Result(levEmp, course, 88));
                    }
                } catch (Exception e) {
                    // Ignore demo data creation failures
                }
            }

            // WelcomeFrame constructor calls AppWindow.navigate() which auto-shows the window
            new WelcomeFrame(databaseManager);

        });
    }
}