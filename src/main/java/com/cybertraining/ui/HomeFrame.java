package com.cybertraining.ui;

import com.cybertraining.db.DatabaseManager;

import javax.swing.*;
import java.awt.*;

public class HomeFrame extends JFrame {

    public HomeFrame(DatabaseManager db) {
        AppTheme.applyFrameSettings(this, "ברוכים הבאים למערכת הדרכת סייבר", 900, 620);

        BackgroundPanel bg = new BackgroundPanel(null);
        bg.setLayout(new GridBagLayout());

        // header with top-right exit button
        JPanel header = new JPanel(new FlowLayout(FlowLayout.RIGHT, 12, 12));
        header.setOpaque(false);
        JButton topExit = AppTheme.backButton("יציאה");
        topExit.addActionListener(e -> System.exit(0));
        header.add(topExit);
        GridBagConstraints hgbc = new GridBagConstraints();
        hgbc.gridx = 0; hgbc.gridy = 0; hgbc.anchor = GridBagConstraints.NORTHEAST; hgbc.weightx = 1.0; hgbc.insets = new Insets(6,6,6,6);
        bg.add(header, hgbc);

        JPanel card = AppTheme.createCardPanel();
        card.setLayout(new BoxLayout(card, BoxLayout.Y_AXIS));
        card.setPreferredSize(new Dimension(1100, 650));

        JLabel title = AppTheme.createTitle("הצטרף למערכת הדרכת סייבר");
        title.setAlignmentX(Component.RIGHT_ALIGNMENT);
        title.setBorder(BorderFactory.createEmptyBorder(8, 0, 8, 0));

        JLabel subtitle = AppTheme.createSubtitle("פלטפורמה מודרנית ללימוד והסמכה לעובדי ארגון");
        subtitle.setAlignmentX(Component.RIGHT_ALIGNMENT);

        LogoPanel logo = new LogoPanel();
        logo.setAlignmentX(Component.CENTER_ALIGNMENT);

        JPanel actionWrap = new JPanel(new FlowLayout(FlowLayout.CENTER, 12, 12));
        actionWrap.setOpaque(false);

        JButton register = AppTheme.primaryButton("הרשמה");
        register.addActionListener(e -> {
            new RegistrationFrame(db).setVisible(true);
            dispose();
        });

        JButton exit = AppTheme.createGhostButton("יציאה");
        exit.addActionListener(e -> System.exit(0));

        actionWrap.add(register);
        actionWrap.add(exit);

        card.add(Box.createVerticalStrut(8));
        card.add(logo);
        card.add(Box.createVerticalStrut(8));
        card.add(title);
        card.add(Box.createVerticalStrut(6));
        card.add(subtitle);
        card.add(Box.createVerticalStrut(18));
        card.add(actionWrap);

        GridBagConstraints gbc = new GridBagConstraints();
        gbc.gridx = 0; gbc.gridy = 1; gbc.fill = GridBagConstraints.BOTH; gbc.weightx = 1.0; gbc.weighty = 1.0;
        bg.add(card, gbc);

        setContentPane(bg);
        pack();
        setLocationRelativeTo(null);
        setResizable(true);

        // Apply RTL to all components
        AppTheme.applyRTL(this);

        addComponentListener(new java.awt.event.ComponentAdapter() {
            @Override
            public void componentShown(java.awt.event.ComponentEvent e) {
                logo.start();
            }

            @Override
            public void componentHidden(java.awt.event.ComponentEvent e) {
                logo.stop();
            }
        });
    }
}
