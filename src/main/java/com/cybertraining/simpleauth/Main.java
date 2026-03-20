package com.cybertraining.simpleauth;

import javax.swing.*;

public class Main {
    public static void main(String[] args) {
        SwingUtilities.invokeLater(() -> {
            DatabaseManager db = new DatabaseManager("data/auth.db");
            // Open registration screen first
            RegisterScreen rs = new RegisterScreen(db, null);
            rs.setVisible(true);
        });
    }
}
