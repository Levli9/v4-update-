package com.cybertraining.ui;

import java.awt.Component;
import java.awt.ComponentOrientation;
import java.awt.Dimension;
import java.awt.GridBagConstraints;
import java.awt.GridBagLayout;
import java.awt.Insets;
import java.awt.FlowLayout;

import javax.swing.Box;
import javax.swing.JCheckBox;
import javax.swing.SwingConstants;
import javax.swing.BoxLayout;
import javax.swing.JButton;
import javax.swing.JFrame;
import javax.swing.JLabel;
import javax.swing.JOptionPane;
import javax.swing.JPanel;
import javax.swing.JPasswordField;
import javax.swing.JTextField;

import com.cybertraining.db.DatabaseManager;
import com.cybertraining.service.AuthenticationService;
import com.cybertraining.model.User;

public class LoginFrame extends JFrame {

    private JTextField usernameField;
    private JPasswordField passwordField;

    private DatabaseManager db;
    private AuthenticationService authService;
    public LoginFrame(DatabaseManager db, boolean managerMode){

        this.db = db;
        this.authService = new AuthenticationService(db);
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
        card.setPreferredSize(new Dimension(550, 420));

        JLabel title = new JLabel(managerMode ? "🔑 כניסת מנהלים" : "👨‍💻 כניסת עובדים");
        title.setFont(AppTheme.TITLE);
        title.setForeground(AppTheme.TEXT);
        title.setAlignmentX(Component.CENTER_ALIGNMENT);
        title.setHorizontalAlignment(SwingConstants.CENTER);

        JLabel userLabel = new JLabel("שם משתמש:");
        JLabel passLabel = new JLabel("סיסמה:");

        userLabel.setForeground(AppTheme.TEXT);
        passLabel.setForeground(AppTheme.TEXT);
        userLabel.setFont(AppTheme.TEXT_FONT);
        passLabel.setFont(AppTheme.TEXT_FONT);

        usernameField = AppTheme.createTextField();
        passwordField = AppTheme.createPasswordField();

        // Right-align input text and set RTL for Hebrew
        usernameField.setComponentOrientation(ComponentOrientation.RIGHT_TO_LEFT);
        usernameField.setHorizontalAlignment(javax.swing.JTextField.RIGHT);
        passwordField.setComponentOrientation(ComponentOrientation.RIGHT_TO_LEFT);
        passwordField.setHorizontalAlignment(javax.swing.JTextField.RIGHT);

        // Show / hide password checkbox
        JCheckBox showPassword = new JCheckBox("הצג סיסמה");
        showPassword.setOpaque(false);
        showPassword.setForeground(AppTheme.MUTED);
        char defaultEcho = passwordField.getEchoChar();
        showPassword.addActionListener(e -> {
            if (showPassword.isSelected()) {
                passwordField.setEchoChar((char) 0);
            } else {
                passwordField.setEchoChar(defaultEcho);
            }
        });

        JButton loginButton =
                AppTheme.primaryButton("התחברות");

            JButton registerButton = AppTheme.primaryButton("הרשמה");
        registerButton.setMaximumSize(new Dimension(200, 44));
        registerButton.addActionListener(e -> new RegistrationFrame(db));

        loginButton.addActionListener(e -> login());

        JPanel form = new JPanel(new GridBagLayout());
        form.setOpaque(false);
        form.setComponentOrientation(ComponentOrientation.RIGHT_TO_LEFT);
        form.setMaximumSize(new Dimension(400, 200));
        form.setAlignmentX(Component.CENTER_ALIGNMENT);
        GridBagConstraints gc = new GridBagConstraints();
        gc.gridx = 0;
        gc.gridy = 0;
        gc.insets = new Insets(6, 6, 6, 6);
        gc.anchor = GridBagConstraints.LINE_END;
        form.add(userLabel, gc);

        gc.gridx = 1;
        gc.fill = GridBagConstraints.HORIZONTAL;
        gc.weightx = 1.0;
        usernameField.setPreferredSize(new Dimension(280, 34));
        form.add(usernameField, gc);

        gc.gridx = 0;
        gc.gridy = 1;
        gc.weightx = 0.0;
        gc.fill = GridBagConstraints.NONE;
        form.add(passLabel, gc);

        gc.gridx = 1;
        gc.fill = GridBagConstraints.HORIZONTAL;
        gc.weightx = 1.0;
        passwordField.setPreferredSize(new Dimension(280, 34));
        form.add(passwordField, gc);

        gc.gridx = 1; gc.gridy = 2; gc.fill = GridBagConstraints.NONE; gc.anchor = GridBagConstraints.LINE_END; form.add(showPassword, gc);

        JPanel actions = new JPanel(new FlowLayout(FlowLayout.CENTER, 20, 0));
        actions.setOpaque(false);
        actions.setAlignmentX(Component.CENTER_ALIGNMENT);
        registerButton.setPreferredSize(new Dimension(140, 44));
        loginButton.setPreferredSize(new Dimension(140, 44));
        actions.add(loginButton);
        actions.add(registerButton);

        // Forgot password link
        JButton forgotPasswordButton = new JButton("שכחת סיסמה?");
        forgotPasswordButton.setBorderPainted(false);
        forgotPasswordButton.setContentAreaFilled(false);
        forgotPasswordButton.setFocusPainted(false);
        forgotPasswordButton.setForeground(AppTheme.ACCENT);
        forgotPasswordButton.setFont(AppTheme.TEXT_FONT);
        forgotPasswordButton.setCursor(new java.awt.Cursor(java.awt.Cursor.HAND_CURSOR));
        forgotPasswordButton.addActionListener(e -> new PasswordRecoveryFrame(db));

        JPanel forgotPanel = new JPanel(new FlowLayout(FlowLayout.CENTER));
        forgotPanel.setOpaque(false);
        forgotPanel.add(forgotPasswordButton);

        card.add(title);
        card.add(Box.createVerticalStrut(18));
        card.add(form);
        card.add(Box.createVerticalStrut(18));
        card.add(actions);
        card.add(Box.createVerticalStrut(10));
        card.add(forgotPanel);

        GridBagConstraints gbc = new GridBagConstraints();
        gbc.gridx = 0; gbc.gridy = 1; gbc.fill = GridBagConstraints.NONE; gbc.anchor = GridBagConstraints.CENTER; gbc.weightx = 1.0; gbc.weighty = 1.0;
        background.add(card, gbc);

        // (glow removed per request)

        AppTheme.applyRTL(background);
        AppWindow.navigate(background);
        AppWindow.get().getRootPane().setDefaultButton(loginButton);
    }

    public LoginFrame(DatabaseManager db) {
        // Placeholder implementation
        this.db = db;
    }

    private void login(){

        String username = usernameField.getText();
        String password = new String(passwordField.getPassword());

        User user = authService.authenticate(username, password, null);

        if(user == null){

            JOptionPane.showMessageDialog(
                    this,
                    "שם משתמש או סיסמה שגויים"
            );

            return;
        }

        if(user.isManager()){

            // Check if this is a special user who can choose between views
            boolean isSpecialUser = user.getUsername().equals("Yaniv123") || 
                                   user.getUsername().equals("Lev123") ||
                                   user.getUsername().equals("Yaniv123_emp") || 
                                   user.getUsername().equals("Lev123_emp");
            
            if (isSpecialUser) {
                new ViewSelectionScreen(db, user);
            } else {
                new ManagerDashboardFrame(db, user);
            }

        } else {

            // Check if this employee user is special
            boolean isSpecialEmployee = user.getUsername().equals("Yaniv123_emp") || 
                                       user.getUsername().equals("Lev123_emp");
            
            if (isSpecialEmployee) {
                new ViewSelectionScreen(db, user);
            } else {
                new EmployeeHomeFrame(db, user);
            }
        }
    }
}