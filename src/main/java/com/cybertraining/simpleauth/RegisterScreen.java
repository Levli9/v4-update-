package com.cybertraining.simpleauth;

import java.awt.FlowLayout;
import java.awt.GridBagConstraints;
import java.awt.GridBagLayout;
import java.awt.Insets;
import java.awt.event.ActionEvent;

import javax.swing.JButton;
import javax.swing.JComboBox;
import javax.swing.JFrame;
import javax.swing.JLabel;
import javax.swing.JOptionPane;
import javax.swing.JPanel;
import javax.swing.JPasswordField;
import javax.swing.JTextField;

import com.cybertraining.ui.AppTheme;
import com.cybertraining.ui.BackgroundPanel;

public class RegisterScreen extends JFrame {

    private final DatabaseManager db;
    private final String returnRole;
    private JTextField usernameField;
    private JPasswordField passwordField;
    private JPasswordField confirmField;
    private JComboBox<String> roleCombo;

    public RegisterScreen(DatabaseManager db, String returnRole) {
        this.db = db;
        this.returnRole = returnRole;
        initUI();
    }

    private void initUI() {
        AppTheme.applyFrameSettings(this, "הרשמה", 820, 560);

        BackgroundPanel bg = new BackgroundPanel(AppTheme.DEFAULT_BACKGROUND_RESOURCE);
        bg.setLayout(new GridBagLayout());

        JPanel card = AppTheme.cardPanel();
        card.setLayout(new GridBagLayout());
        GridBagConstraints cc = new GridBagConstraints();
        cc.insets = new Insets(10, 12, 10, 12);
        cc.fill = GridBagConstraints.HORIZONTAL;

        JLabel title = AppTheme.createTitle("הרשמה למערכת");

        usernameField = AppTheme.styledTextField();
        passwordField = AppTheme.styledPasswordField();
        confirmField = AppTheme.styledPasswordField();
        roleCombo = new JComboBox<>(new String[]{"עובד", "מנהל"});
        roleCombo.setBackground(AppTheme.CARD);
        roleCombo.setForeground(AppTheme.TEXT);

        cc.gridx = 0; cc.gridy = 0; cc.gridwidth = 2; card.add(title, cc);

        cc.gridwidth = 1; cc.gridy = 1; cc.gridx = 0; card.add(AppTheme.createFieldLabel("שם משתמש:"), cc);
        cc.gridx = 1; card.add(usernameField, cc);

        cc.gridy = 2; cc.gridx = 0; card.add(AppTheme.createFieldLabel("סיסמה:"), cc);
        cc.gridx = 1; card.add(passwordField, cc);

        cc.gridy = 3; cc.gridx = 0; card.add(AppTheme.createFieldLabel("אימות סיסמה:"), cc);
        cc.gridx = 1; card.add(confirmField, cc);

        cc.gridy = 4; cc.gridx = 0; card.add(AppTheme.createFieldLabel("סוג משתמש:"), cc);
        cc.gridx = 1; card.add(roleCombo, cc);

        JButton registerBtn = AppTheme.primaryButton("הרשמה");
        registerBtn.addActionListener(this::onRegister);

        JButton toLogin = AppTheme.backButton("יש לך כבר חשבון? התחבר");
        toLogin.addActionListener(e -> {
            dispose();
            new LoginScreen(db, returnRole).setVisible(true);
        });

        JPanel btns = new JPanel(new FlowLayout(FlowLayout.CENTER, 12, 8));
        btns.setOpaque(false);
        btns.add(registerBtn);
        btns.add(toLogin);

        cc.gridy = 5; cc.gridx = 0; cc.gridwidth = 2; card.add(btns, cc);

        AppTheme.applyRTL(card);

        bg.add(card, new GridBagConstraints());
        setContentPane(bg);
    }

    private void onRegister(ActionEvent ev) {
        String username = usernameField.getText().trim();
        String pass = new String(passwordField.getPassword());
        String confirm = new String(confirmField.getPassword());
        String role = (String) roleCombo.getSelectedItem();

        if (username.isEmpty() || pass.isEmpty() || confirm.isEmpty()) {
            JOptionPane.showMessageDialog(this, "אנא מלא את כל השדות", "שגיאה", JOptionPane.ERROR_MESSAGE);
            return;
        }

        if (!pass.equals(confirm)) {
            JOptionPane.showMessageDialog(this, "הסיסמאות אינן תואמות", "שגיאה", JOptionPane.ERROR_MESSAGE);
            return;
        }

        if (db.userExists(username)) {
            JOptionPane.showMessageDialog(this, "שם משתמש קיים. בחר שם אחר.", "שגיאה", JOptionPane.ERROR_MESSAGE);
            return;
        }

        boolean ok = db.registerUser(username, pass, role);
        if (!ok) {
            JOptionPane.showMessageDialog(this, "הרשמה נכשלה", "שגיאה", JOptionPane.ERROR_MESSAGE);
            return;
        }

        JOptionPane.showMessageDialog(this, "נרשמת בהצלחה!", "הצלחה", JOptionPane.INFORMATION_MESSAGE);
        dispose();
        new LoginScreen(db, returnRole).setVisible(true);
    }

}
