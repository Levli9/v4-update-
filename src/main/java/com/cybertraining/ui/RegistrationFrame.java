package com.cybertraining.ui;

import java.awt.BorderLayout;
import java.awt.Color;
import java.awt.Component;
import java.awt.ComponentOrientation;
import java.awt.Dimension;
import java.awt.FlowLayout;
import java.awt.GridBagConstraints;
import java.awt.GridBagLayout;
import java.awt.Insets;

import javax.swing.Box;
import javax.swing.BoxLayout;
import javax.swing.ImageIcon;
import javax.swing.JButton;
import javax.swing.JComboBox;
import javax.swing.JFrame;
import javax.swing.JLabel;
import javax.swing.JOptionPane;
import javax.swing.JPanel;
import javax.swing.JPasswordField;
import javax.swing.JTextField;
import javax.swing.SwingConstants;
import javax.swing.SwingWorker;

import com.cybertraining.db.DatabaseManager;
import com.cybertraining.model.User;

public class RegistrationFrame extends JFrame {

    private final DatabaseManager db;
    private final com.cybertraining.service.AuthenticationService authService;

    private JTextField usernameField;
    private JPasswordField passwordField;
    private JPasswordField confirmPasswordField;
    private JTextField fullNameField;
    private JTextField emailField;
    private JComboBox<String> roleCombo;
    private JComboBox<String> departmentCombo;

    public RegistrationFrame(DatabaseManager db) {
        this.db = db;
        this.authService = new com.cybertraining.service.AuthenticationService(db);

        // use gradient background (no large blue image) for cleaner registration look
        BackgroundPanel root = new BackgroundPanel(null);
        root.setLayout(new GridBagLayout());
        root.setComponentOrientation(ComponentOrientation.RIGHT_TO_LEFT);

        // top-right header with back button
        JPanel topHeader = new JPanel(new FlowLayout(FlowLayout.RIGHT, 12, 12));
        topHeader.setOpaque(false);
        JButton topBack = AppTheme.backButton("חזור");
        topBack.addActionListener(e -> new WelcomeFrame(db));
        topHeader.add(topBack);
        GridBagConstraints hgbc = new GridBagConstraints();
        hgbc.gridx = 0; hgbc.gridy = 0; hgbc.anchor = GridBagConstraints.NORTHEAST; hgbc.weightx = 1.0; hgbc.insets = new Insets(6,6,6,6);
        root.add(topHeader, hgbc);

        JPanel card = AppTheme.createCardPanel();
        // larger card so the form is more spacious on bigger screens
        card.setPreferredSize(new Dimension(660, 650));
        card.setLayout(new BorderLayout(0, 18));

        JPanel header = new JPanel();
        header.setOpaque(false);
        header.setLayout(new BoxLayout(header, BoxLayout.Y_AXIS));

        JLabel title = AppTheme.createTitle("הרשמה למערכת");
        title.setFont(new java.awt.Font("SansSerif", java.awt.Font.BOLD, 24));
        title.setHorizontalAlignment(SwingConstants.CENTER);
        title.setAlignmentX(Component.CENTER_ALIGNMENT);

        JLabel sub = AppTheme.createSubtitle("צור חשבון חדש כדי לגשת לתוכן ההדרכה");
        sub.setFont(new java.awt.Font("SansSerif", java.awt.Font.PLAIN, 16));
        sub.setHorizontalAlignment(SwingConstants.CENTER);
        sub.setAlignmentX(Component.CENTER_ALIGNMENT);

        // Globe lock logo
        JLabel logoLabel = new JLabel();
        logoLabel.setAlignmentX(Component.CENTER_ALIGNMENT);
        logoLabel.setHorizontalAlignment(SwingConstants.CENTER);
        try {
            java.awt.image.BufferedImage src = javax.imageio.ImageIO.read(getClass().getResourceAsStream("/images/globe_lock.png"));
            if (src != null) {
                int targetH = 90;
                int targetW = (int)(src.getWidth() * (targetH / (double) src.getHeight()));
                java.awt.image.BufferedImage faded = new java.awt.image.BufferedImage(targetW, targetH, java.awt.image.BufferedImage.TYPE_INT_ARGB);
                java.awt.Graphics2D g2 = faded.createGraphics();
                g2.setRenderingHint(java.awt.RenderingHints.KEY_INTERPOLATION, java.awt.RenderingHints.VALUE_INTERPOLATION_BILINEAR);
                g2.drawImage(src, 0, 0, targetW, targetH, null);
                g2.setComposite(java.awt.AlphaComposite.DstIn);
                java.awt.RadialGradientPaint rgp = new java.awt.RadialGradientPaint(
                    new java.awt.geom.Point2D.Float(targetW / 2f, targetH / 2f),
                    Math.max(targetW, targetH) / 2f,
                    new float[]{0f, 0.7f, 1f},
                    new java.awt.Color[]{new java.awt.Color(0,0,0,255), new java.awt.Color(0,0,0,200), new java.awt.Color(0,0,0,0)});
                g2.setPaint(rgp);
                g2.fillRect(0, 0, targetW, targetH);
                g2.dispose();
                logoLabel.setIcon(new ImageIcon(faded));
            }
        } catch (Exception ignored) {}

        header.add(logoLabel);
        header.add(Box.createVerticalStrut(8));
        header.add(title);
        header.add(Box.createVerticalStrut(8));
        header.add(sub);

        // Build vertical list of rows so label appears on the right and field on the left
        JPanel form = new JPanel();
        form.setOpaque(false);
        form.setLayout(new BoxLayout(form, BoxLayout.Y_AXIS));
        form.setComponentOrientation(ComponentOrientation.RIGHT_TO_LEFT);
        form.setBorder(new javax.swing.border.EmptyBorder(6, 6, 6, 6));

        usernameField = AppTheme.createTextField();
        passwordField = AppTheme.createPasswordField();
        confirmPasswordField = AppTheme.createPasswordField();
        fullNameField = AppTheme.createTextField();
        emailField = AppTheme.createTextField();

        // Ensure RTL typing, right-aligned text and consistent sizes for Hebrew
        // Use wider inputs and slightly smaller font so all fields fit without scrolling
        Dimension inputSize = new Dimension(300, 36);
        java.awt.Font fieldFont = new java.awt.Font("SansSerif", java.awt.Font.PLAIN, 13);

        JTextField[] fields = new JTextField[] { usernameField, fullNameField, emailField };
        JPasswordField[] pfields = new JPasswordField[] { passwordField, confirmPasswordField };

        javax.swing.border.Border roundedPadding = new javax.swing.border.CompoundBorder(
            new RoundedBorder(26, AppTheme.BORDER, 1),
            new javax.swing.border.EmptyBorder(6, 10, 6, 10)
        );

        for (JTextField f : fields) {
            f.setComponentOrientation(ComponentOrientation.RIGHT_TO_LEFT);
            f.setHorizontalAlignment(javax.swing.JTextField.RIGHT);
            f.setPreferredSize(inputSize);
            f.setMaximumSize(inputSize);
            f.setFont(fieldFont);
            f.setBorder(roundedPadding);
            f.setBackground(AppTheme.INPUT_BG);
        }
        for (JPasswordField f : pfields) {
            f.setComponentOrientation(ComponentOrientation.RIGHT_TO_LEFT);
            f.setHorizontalAlignment(javax.swing.JTextField.RIGHT);
            f.setPreferredSize(inputSize);
            f.setMaximumSize(inputSize);
            f.setFont(fieldFont);
            f.setBorder(roundedPadding);
            f.setBackground(AppTheme.INPUT_BG);
        }

        roleCombo = new JComboBox<>(new String[]{"עובד", "מנהל"});
        roleCombo.setFont(fieldFont);
        roleCombo.setBackground(AppTheme.INPUT_BG);
        roleCombo.setForeground(Color.BLACK);
        roleCombo.setBorder(new RoundedBorder(26, AppTheme.BORDER, 1));
        // make combo a bit smaller and center the displayed text
        Dimension comboSize = new Dimension(300, 32);
        roleCombo.setPreferredSize(comboSize);
        roleCombo.setMaximumSize(comboSize);
        roleCombo.setComponentOrientation(ComponentOrientation.RIGHT_TO_LEFT);
        roleCombo.setRenderer(new javax.swing.DefaultListCellRenderer() {
            @Override
            public java.awt.Component getListCellRendererComponent(javax.swing.JList<?> list, Object value, int index, boolean isSelected, boolean cellHasFocus) {
                javax.swing.JLabel lbl = (javax.swing.JLabel) super.getListCellRendererComponent(list, value, index, isSelected, cellHasFocus);
                lbl.setHorizontalAlignment(javax.swing.SwingConstants.CENTER);
                return lbl;
            }
        });

        departmentCombo = new JComboBox<>(new String[]{"מכירות", "פיתוח", "משאבי אנוש", "לוגיסטיקה", "תמיכה"});
        departmentCombo.setFont(fieldFont);
        departmentCombo.setBackground(AppTheme.INPUT_BG);
        departmentCombo.setForeground(Color.BLACK);
        departmentCombo.setBorder(new RoundedBorder(26, AppTheme.BORDER, 1));
        // match combo size (smaller) and center the displayed text
        Dimension deptComboSize = new Dimension(300, 32);
        departmentCombo.setPreferredSize(deptComboSize);
        departmentCombo.setMaximumSize(deptComboSize);
        departmentCombo.setComponentOrientation(ComponentOrientation.RIGHT_TO_LEFT);
        departmentCombo.setRenderer(new javax.swing.DefaultListCellRenderer() {
            @Override
            public java.awt.Component getListCellRendererComponent(javax.swing.JList<?> list, Object value, int index, boolean isSelected, boolean cellHasFocus) {
                javax.swing.JLabel lbl = (javax.swing.JLabel) super.getListCellRendererComponent(list, value, index, isSelected, cellHasFocus);
                lbl.setHorizontalAlignment(javax.swing.SwingConstants.CENTER);
                return lbl;
            }
        });

        // helper to create a compact row where label is on the right and field is immediately to its left
        java.util.function.BiFunction<JLabel, java.awt.Component, JPanel> makeRow = (lbl, field) -> {
            JPanel row = new JPanel(new FlowLayout(FlowLayout.RIGHT, 10, 6));
            row.setOpaque(false);
            row.setComponentOrientation(ComponentOrientation.RIGHT_TO_LEFT);
            lbl.setHorizontalAlignment(SwingConstants.RIGHT);
            lbl.setFont(fieldFont);
            lbl.setPreferredSize(new Dimension(140, 20));
            // add label first (right), then field (to its left)
            row.add(lbl);
            row.add(field);
            row.setMaximumSize(new Dimension(Short.MAX_VALUE, 42));
            row.setPreferredSize(new Dimension(460, 42));
            return row;
        };

        form.add(makeRow.apply(AppTheme.createFieldLabel("שם משתמש:"), usernameField));
        form.add(Box.createVerticalStrut(8));
        form.add(makeRow.apply(AppTheme.createFieldLabel("סיסמה:"), passwordField));
        form.add(Box.createVerticalStrut(8));
        form.add(makeRow.apply(AppTheme.createFieldLabel("אימות סיסמה:"), confirmPasswordField));
        form.add(Box.createVerticalStrut(8));
        form.add(makeRow.apply(AppTheme.createFieldLabel("שם מלא:"), fullNameField));
        form.add(Box.createVerticalStrut(8));
        form.add(makeRow.apply(AppTheme.createFieldLabel("אימייל:"), emailField));
        form.add(Box.createVerticalStrut(8));
        form.add(makeRow.apply(AppTheme.createFieldLabel("סוג משתמש:"), roleCombo));
        form.add(Box.createVerticalStrut(8));
        form.add(makeRow.apply(AppTheme.createFieldLabel("מחלקה:"), departmentCombo));

        JPanel buttons = new JPanel(new FlowLayout(FlowLayout.CENTER, 14, 6));
        buttons.setOpaque(false);

        JButton cancel = AppTheme.secondaryButton("חזור");
        JButton register = AppTheme.primaryButton("הרשמה");
        // smaller maximum sizes so buttons fit comfortably within the card
        cancel.setMaximumSize(new Dimension(180, 54));
        register.setMaximumSize(new Dimension(180, 54));

        cancel.addActionListener(e -> new WelcomeFrame(db));

        register.addActionListener(e -> doRegister());

        buttons.add(cancel);
        buttons.add(register);

        card.add(header, BorderLayout.NORTH);
        // wrap form in a centered container so rows appear centered in the card
        // center the form both horizontally and vertically inside the card
        JPanel formWrapper = new JPanel(new GridBagLayout());
        formWrapper.setOpaque(false);
        GridBagConstraints fw = new GridBagConstraints();
        fw.gridx = 0; fw.gridy = 0; fw.weightx = 1.0; fw.weighty = 1.0;
        fw.anchor = GridBagConstraints.CENTER; fw.fill = GridBagConstraints.NONE;
        formWrapper.add(form, fw);
        card.add(formWrapper, BorderLayout.CENTER);
        card.add(buttons, BorderLayout.SOUTH);

        GridBagConstraints rootGbc = new GridBagConstraints();
        rootGbc.gridx = 0; rootGbc.gridy = 1; rootGbc.fill = GridBagConstraints.NONE;
        rootGbc.anchor = GridBagConstraints.CENTER; rootGbc.weightx = 1.0; rootGbc.weighty = 1.0;
        root.add(card, rootGbc);
        // (glow removed per request)
        AppTheme.applyRTL(root);
        AppWindow.navigate(root);
    }

    private void doRegister() {
        String username = usernameField.getText().trim();
        String password = new String(passwordField.getPassword());
        String confirm = new String(confirmPasswordField.getPassword());
        String fullName = fullNameField.getText().trim();
        String email = emailField.getText().trim();
        String role = (String) roleCombo.getSelectedItem();

        if (username.isEmpty() || password.isEmpty() || confirm.isEmpty() || email.isEmpty()) {
            JOptionPane.showMessageDialog(AppWindow.get(), "אנא מלא את כל השדות הנדרשים", "שגיאה", JOptionPane.WARNING_MESSAGE);
            return;
        }

        if (!password.equals(confirm)) {
            JOptionPane.showMessageDialog(AppWindow.get(), "הסיסמאות אינן תואמות", "שגיאה", JOptionPane.WARNING_MESSAGE);
            return;
        }

        String department = (String) departmentCombo.getSelectedItem();
        LoadingDialog ld = new LoadingDialog(AppWindow.get(), "הרשמה...\nאנא המתן");
        SwingWorker<User, Void> worker = new SwingWorker<>() {
            @Override
            protected User doInBackground() throws Exception {
                return authService.register(username, password, fullName, role, department != null ? department : "", email);
            }

            @Override
            protected void done() {
                ld.dispose();
                try {
                    User u = get();
                    if (u == null) {
                        // determine whether username already exists or another DB error occurred
                        com.cybertraining.model.User existing = db.getUserByUsername(username);
                        if (existing != null) {
                            JOptionPane.showMessageDialog(AppWindow.get(), "שם משתמש קיים. בחר שם אחר.", "שגיאה", JOptionPane.ERROR_MESSAGE);
                        } else {
                            JOptionPane.showMessageDialog(AppWindow.get(), "אירעה שגיאה בהרשמה (בדוק את הלוג בקונסול)", "שגיאה", JOptionPane.ERROR_MESSAGE);
                        }
                        return;
                    }
                    JOptionPane.showMessageDialog(AppWindow.get(), "נרשמת בהצלחה! ניתן להתחבר כעת.", "הצלחה", JOptionPane.INFORMATION_MESSAGE);
                    new LoginFrame(db, false);
                } catch (Exception ex) {
                    if (ex.getCause() instanceof IllegalArgumentException) {
                        JOptionPane.showMessageDialog(AppWindow.get(), ex.getCause().getMessage(), "סיסמה לא תקינה", JOptionPane.WARNING_MESSAGE);
                    } else {
                        JOptionPane.showMessageDialog(AppWindow.get(), "אירעה שגיאה במהלך ההרשמה", "שגיאה", JOptionPane.ERROR_MESSAGE);
                    }
                }
            }
        };
        worker.execute();
        ld.setVisible(true);
    }
}
