package com.cybertraining.ui;

import java.awt.BorderLayout;
import java.awt.Component;
import java.awt.ComponentOrientation;
import java.awt.Dimension;
import java.awt.FlowLayout;
import java.awt.GridBagConstraints;
import java.awt.GridBagLayout;
import java.awt.Insets;

import javax.swing.Box;
import javax.swing.BoxLayout;
import javax.swing.JButton;
import javax.swing.JFrame;
import javax.swing.JLabel;
import javax.swing.JOptionPane;
import javax.swing.JPanel;
import javax.swing.JPasswordField;
import javax.swing.JTextField;
import javax.swing.SwingConstants;
import javax.swing.SwingWorker;

import com.cybertraining.db.DatabaseManager;
import com.cybertraining.service.AuthenticationService;

public class PasswordRecoveryFrame extends JFrame {

    private final DatabaseManager db;
    private final AuthenticationService authService;

    private JTextField emailField;
    private JTextField codeField;
    private JPasswordField newPasswordField;
    private JPasswordField confirmPasswordField;

    private JPanel codePanel;
    private JPanel passwordPanel;

    private JButton sendCodeButton;
    private JButton verifyCodeButton;
    private JButton resetPasswordButton;

    private String expectedRecoveryCode; // Store the code for verification

    public PasswordRecoveryFrame(DatabaseManager db) {
        this.db = db;
        this.authService = new AuthenticationService(db);

        // Create buttons first
        sendCodeButton = AppTheme.primaryButton("שלח קוד");
        verifyCodeButton = AppTheme.primaryButton("אמת קוד");
        resetPasswordButton = AppTheme.primaryButton("איפוס סיסמה");

        sendCodeButton.addActionListener(e -> sendRecoveryCode());
        verifyCodeButton.addActionListener(e -> verifyCode());
        resetPasswordButton.addActionListener(e -> resetPassword());

        BackgroundPanel background = new BackgroundPanel(null);
        background.setLayout(new GridBagLayout());
        background.setComponentOrientation(ComponentOrientation.RIGHT_TO_LEFT);

        // header with top-right back button
        JPanel header = new JPanel(new FlowLayout(FlowLayout.RIGHT, 12, 12));
        header.setOpaque(false);
        JButton topBack = AppTheme.backButton("חזור");
        topBack.addActionListener(e -> new WelcomeFrame(db));
        header.add(topBack);
        GridBagConstraints hgbc = new GridBagConstraints();
        hgbc.gridx = 0; hgbc.gridy = 0; hgbc.anchor = GridBagConstraints.NORTHEAST; hgbc.weightx = 1.0; hgbc.insets = new Insets(6,6,6,6);
        background.add(header, hgbc);

        JPanel card = AppTheme.cardPanel();
        card.setLayout(new BoxLayout(card, BoxLayout.Y_AXIS));
        card.setPreferredSize(new Dimension(550, 500));

        JLabel title = new JLabel("🔐 שחזור סיסמה");
        title.setFont(AppTheme.TITLE);
        title.setForeground(AppTheme.TEXT);
        title.setAlignmentX(Component.CENTER_ALIGNMENT);
        title.setHorizontalAlignment(SwingConstants.CENTER);

        // Email input panel
        JPanel emailPanel = new JPanel(new GridBagLayout());
        emailPanel.setOpaque(false);
        emailPanel.setComponentOrientation(ComponentOrientation.RIGHT_TO_LEFT);
        emailPanel.setMaximumSize(new Dimension(400, 60));
        emailPanel.setAlignmentX(Component.CENTER_ALIGNMENT);

        JLabel emailLabel = new JLabel("כתובת אימייל:");
        emailLabel.setForeground(AppTheme.TEXT);
        emailLabel.setFont(AppTheme.TEXT_FONT);

        emailField = AppTheme.createTextField();
        emailField.setComponentOrientation(ComponentOrientation.RIGHT_TO_LEFT);
        emailField.setHorizontalAlignment(javax.swing.JTextField.RIGHT);

        GridBagConstraints gc = new GridBagConstraints();
        gc.gridx = 0;
        gc.gridy = 0;
        gc.insets = new Insets(6, 6, 6, 6);
        gc.anchor = GridBagConstraints.LINE_END;
        emailPanel.add(emailLabel, gc);

        gc.gridx = 1;
        gc.fill = GridBagConstraints.HORIZONTAL;
        gc.weightx = 1.0;
        emailField.setPreferredSize(new Dimension(280, 34));
        emailPanel.add(emailField, gc);

        // Code input panel (initially hidden)
        codePanel = new JPanel(new GridBagLayout());
        codePanel.setOpaque(false);
        codePanel.setComponentOrientation(ComponentOrientation.RIGHT_TO_LEFT);
        codePanel.setMaximumSize(new Dimension(400, 60));
        codePanel.setAlignmentX(Component.CENTER_ALIGNMENT);
        codePanel.setVisible(false);

        JLabel codeLabel = new JLabel("קוד אימות:");
        codeLabel.setForeground(AppTheme.TEXT);
        codeLabel.setFont(AppTheme.TEXT_FONT);

        codeField = AppTheme.createTextField();
        codeField.setComponentOrientation(ComponentOrientation.RIGHT_TO_LEFT);
        codeField.setHorizontalAlignment(javax.swing.JTextField.RIGHT);

        gc = new GridBagConstraints();
        gc.gridx = 0;
        gc.gridy = 0;
        gc.insets = new Insets(6, 6, 6, 6);
        gc.anchor = GridBagConstraints.LINE_END;
        codePanel.add(codeLabel, gc);

        gc.gridx = 1;
        gc.fill = GridBagConstraints.HORIZONTAL;
        gc.weightx = 1.0;
        codeField.setPreferredSize(new Dimension(280, 34));
        codePanel.add(codeField, gc);

        // Password input panel (initially hidden)
        passwordPanel = new JPanel(new GridBagLayout());
        passwordPanel.setOpaque(false);
        passwordPanel.setComponentOrientation(ComponentOrientation.RIGHT_TO_LEFT);
        passwordPanel.setMaximumSize(new Dimension(400, 120));
        passwordPanel.setAlignmentX(Component.CENTER_ALIGNMENT);
        passwordPanel.setVisible(false);

        JLabel newPasswordLabel = new JLabel("סיסמה חדשה:");
        newPasswordLabel.setForeground(AppTheme.TEXT);
        newPasswordLabel.setFont(AppTheme.TEXT_FONT);

        newPasswordField = AppTheme.createPasswordField();
        newPasswordField.setComponentOrientation(ComponentOrientation.RIGHT_TO_LEFT);
        newPasswordField.setHorizontalAlignment(javax.swing.JTextField.RIGHT);

        JLabel confirmPasswordLabel = new JLabel("אימות סיסמה:");
        confirmPasswordLabel.setForeground(AppTheme.TEXT);
        confirmPasswordLabel.setFont(AppTheme.TEXT_FONT);

        confirmPasswordField = AppTheme.createPasswordField();
        confirmPasswordField.setComponentOrientation(ComponentOrientation.RIGHT_TO_LEFT);
        confirmPasswordField.setHorizontalAlignment(javax.swing.JTextField.RIGHT);

        gc = new GridBagConstraints();
        gc.gridx = 0;
        gc.gridy = 0;
        gc.insets = new Insets(6, 6, 6, 6);
        gc.anchor = GridBagConstraints.LINE_END;
        passwordPanel.add(newPasswordLabel, gc);

        gc.gridx = 1;
        gc.fill = GridBagConstraints.HORIZONTAL;
        gc.weightx = 1.0;
        newPasswordField.setPreferredSize(new Dimension(280, 34));
        passwordPanel.add(newPasswordField, gc);

        gc.gridx = 0;
        gc.gridy = 1;
        gc.weightx = 0.0;
        gc.fill = GridBagConstraints.NONE;
        passwordPanel.add(confirmPasswordLabel, gc);

        gc.gridx = 1;
        gc.fill = GridBagConstraints.HORIZONTAL;
        gc.weightx = 1.0;
        confirmPasswordField.setPreferredSize(new Dimension(280, 34));
        passwordPanel.add(confirmPasswordField, gc);

        // Buttons are already created above
        JPanel buttonPanel = new JPanel(new FlowLayout(FlowLayout.CENTER, 20, 0));
        buttonPanel.setOpaque(false);
        buttonPanel.setAlignmentX(Component.CENTER_ALIGNMENT);
        buttonPanel.add(sendCodeButton);
        buttonPanel.add(verifyCodeButton);
        buttonPanel.add(resetPasswordButton);

        // Initially hide verify and reset buttons
        verifyCodeButton.setVisible(false);
        resetPasswordButton.setVisible(false);

        card.add(title);
        card.add(Box.createVerticalStrut(18));
        card.add(emailPanel);
        card.add(Box.createVerticalStrut(10));
        card.add(codePanel);
        card.add(Box.createVerticalStrut(10));
        card.add(passwordPanel);
        card.add(Box.createVerticalStrut(18));
        card.add(buttonPanel);

        GridBagConstraints gbc = new GridBagConstraints();
        gbc.gridx = 0; gbc.gridy = 1; gbc.fill = GridBagConstraints.NONE; gbc.anchor = GridBagConstraints.CENTER; gbc.weightx = 1.0; gbc.weighty = 1.0;
        background.add(card, gbc);

        AppTheme.applyRTL(background);
        AppWindow.navigate(background);
    }

    private void sendRecoveryCode() {
        String email = emailField.getText().trim();
        if (email.isEmpty()) {
            JOptionPane.showMessageDialog(this, "אנא הכנס כתובת אימייל", "שגיאה", JOptionPane.WARNING_MESSAGE);
            return;
        }

        SwingWorker<String, Void> worker = new SwingWorker<>() {
            @Override
            protected String doInBackground() throws Exception {
                return authService.initiatePasswordRecovery(email);
            }

            @Override
            protected void done() {
                try {
                    expectedRecoveryCode = get(); // Store the code for verification
                    JOptionPane.showMessageDialog(PasswordRecoveryFrame.this,
                        "קוד האימות נשלח לאימייל שלך או הודפס לקונסול.",
                        "קוד נשלח", JOptionPane.INFORMATION_MESSAGE);
                    codePanel.setVisible(true);
                    passwordPanel.setVisible(false);
                    sendCodeButton.setVisible(false);
                    verifyCodeButton.setVisible(true);
                    resetPasswordButton.setVisible(false);
                    revalidate();
                    repaint();
                } catch (Exception ex) {
                    JOptionPane.showMessageDialog(PasswordRecoveryFrame.this,
                        ex.getMessage(), "שגיאה", JOptionPane.ERROR_MESSAGE);
                }
            }
        };
        worker.execute();
    }

    private void verifyCode() {
        String code = codeField.getText().trim();
        if (code.isEmpty()) {
            JOptionPane.showMessageDialog(this, "אנא הכנס קוד אימות", "שגיאה", JOptionPane.WARNING_MESSAGE);
            return;
        }

        if (expectedRecoveryCode != null && expectedRecoveryCode.equals(code)) {
            passwordPanel.setVisible(true);
            verifyCodeButton.setVisible(false);
            resetPasswordButton.setVisible(true);
            JOptionPane.showMessageDialog(this, "קוד אימות תקין! ניתן כעת להגדיר סיסמה חדשה.", "הצלחה", JOptionPane.INFORMATION_MESSAGE);
        } else {
            JOptionPane.showMessageDialog(this, "קוד אימות שגוי", "שגיאה", JOptionPane.ERROR_MESSAGE);
        }
        revalidate();
        repaint();
    }

    private void resetPassword() {
        String email = emailField.getText().trim();
        String newPassword = new String(newPasswordField.getPassword());
        String confirmPassword = new String(confirmPasswordField.getPassword());

        if (newPassword.isEmpty() || confirmPassword.isEmpty()) {
            JOptionPane.showMessageDialog(this, "אנא מלא את כל השדות", "שגיאה", JOptionPane.WARNING_MESSAGE);
            return;
        }

        if (!newPassword.equals(confirmPassword)) {
            JOptionPane.showMessageDialog(this, "הסיסמאות אינן תואמות", "שגיאה", JOptionPane.WARNING_MESSAGE);
            return;
        }

        SwingWorker<Boolean, Void> worker = new SwingWorker<>() {
            @Override
            protected Boolean doInBackground() throws Exception {
                // Since we already verified the code, just reset the password
                return authService.resetPassword(email, expectedRecoveryCode, newPassword);
            }

            @Override
            protected void done() {
                try {
                    boolean success = get();
                    if (success) {
                        JOptionPane.showMessageDialog(PasswordRecoveryFrame.this,
                            "הסיסמה אופסה בהצלחה! ניתן להתחבר כעת.", "הצלחה", JOptionPane.INFORMATION_MESSAGE);
                        new LoginFrame(db, false);
                    } else {
                        JOptionPane.showMessageDialog(PasswordRecoveryFrame.this,
                            "אירעה שגיאה באיפוס הסיסמה", "שגיאה", JOptionPane.ERROR_MESSAGE);
                    }
                } catch (Exception ex) {
                    JOptionPane.showMessageDialog(PasswordRecoveryFrame.this,
                        ex.getMessage(), "שגיאה", JOptionPane.ERROR_MESSAGE);
                }
            }
        };
        worker.execute();
    }
}