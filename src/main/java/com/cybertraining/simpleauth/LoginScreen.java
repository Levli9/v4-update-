package com.cybertraining.simpleauth;

import com.cybertraining.ui.AppTheme;
import com.cybertraining.ui.BackgroundPanel;

import javax.swing.*;
import java.awt.*;
import java.awt.event.ActionEvent;

public class LoginScreen extends JFrame {

    private final DatabaseManager db;
    private final String chosenRole;

    private JTextField usernameField;
    private JPasswordField passwordField;

    public LoginScreen(DatabaseManager db, String chosenRole) {
        this.db = db;
        this.chosenRole = chosenRole;
        initUI();
    }

    private void initUI() {
        AppTheme.applyFrameSettings(this, "כניסה למערכת", 820, 560);

        BackgroundPanel bg = new BackgroundPanel(AppTheme.DEFAULT_BACKGROUND_RESOURCE);
        bg.setLayout(new GridBagLayout());

        JPanel card = AppTheme.cardPanel();
        card.setLayout(new GridBagLayout());
        GridBagConstraints cc = new GridBagConstraints();
        cc.insets = new Insets(10, 12, 10, 12);
        cc.fill = GridBagConstraints.HORIZONTAL;

        JLabel title = AppTheme.createTitle("כניסת עובדים");

        usernameField = AppTheme.styledTextField();
        passwordField = AppTheme.styledPasswordField();

        cc.gridx = 0; cc.gridy = 0; cc.gridwidth = 2; card.add(title, cc);

        cc.gridwidth = 1; cc.gridy = 1; cc.gridx = 0; card.add(AppTheme.createFieldLabel("שם משתמש:"), cc);
        cc.gridx = 1; card.add(usernameField, cc);

        cc.gridy = 2; cc.gridx = 0; card.add(AppTheme.createFieldLabel("סיסמה:"), cc);
        cc.gridx = 1; card.add(passwordField, cc);

        JButton loginBtn = AppTheme.primaryButton("התחבר");
        loginBtn.addActionListener(this::onLogin);

        JButton registerBtn = AppTheme.secondaryButton("הרשמה");
        registerBtn.addActionListener(e -> {
            dispose();
            new RegisterScreen(db, chosenRole).setVisible(true);
        });

        JPanel btns = new JPanel(new FlowLayout(FlowLayout.CENTER, 14, 8));
        btns.setOpaque(false);
        btns.add(registerBtn);
        btns.add(loginBtn);

        cc.gridy = 3; cc.gridx = 0; cc.gridwidth = 2; card.add(btns, cc);

        AppTheme.applyRTL(card);

        bg.add(card, new GridBagConstraints());
        setContentPane(bg);
    }

    private void onLogin(ActionEvent ev) {
        String username = usernameField.getText().trim();
        String pass = new String(passwordField.getPassword());

        if (username.isEmpty() || pass.isEmpty()) {
            JOptionPane.showMessageDialog(this, "אנא מלא את כל השדות", "שגיאה", JOptionPane.ERROR_MESSAGE);
            return;
        }

        boolean ok;
        try {
            ok = db.authenticate(username, pass);
        } catch (Exception ex) {
            JOptionPane.showMessageDialog(this, "שגיאת מערכת: " + ex.getMessage(), "שגיאה", JOptionPane.ERROR_MESSAGE);
            ex.printStackTrace();
            return;
        }

        if (!ok) {
            JOptionPane.showMessageDialog(this, "שם משתמש או סיסמה שגויים", "שגיאה", JOptionPane.ERROR_MESSAGE);
            return;
        }

        JOptionPane.showMessageDialog(this, "התחברת בהצלחה!", "הצלחה", JOptionPane.INFORMATION_MESSAGE);
        dispose();
    }

}
