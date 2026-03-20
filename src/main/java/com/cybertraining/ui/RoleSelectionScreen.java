package com.cybertraining.ui;

import com.cybertraining.db.DatabaseManager;

import javax.swing.*;
import java.awt.*;

public class RoleSelectionScreen extends JFrame {

    private final DatabaseManager db;

    public RoleSelectionScreen(DatabaseManager db) {
        super("בחירת כניסה");
        this.db = db;
        initUI();
    }

    private void initUI() {
        BackgroundPanel background = new BackgroundPanel(null);
        background.setLayout(new GridBagLayout());
        background.setComponentOrientation(ComponentOrientation.RIGHT_TO_LEFT);

        // top-right header with back/exit button
        JPanel header = new JPanel(new FlowLayout(FlowLayout.RIGHT, 12, 12));
        header.setOpaque(false);
        JButton back = AppTheme.backButton("חזור");
        back.addActionListener(e -> new WelcomeFrame(db));
        header.add(back);

        GridBagConstraints hgbc = new GridBagConstraints();
        hgbc.gridx = 0; hgbc.gridy = 0; hgbc.anchor = GridBagConstraints.NORTHEAST; hgbc.weightx = 1.0; hgbc.insets = new Insets(6,6,6,6);
        background.add(header, hgbc);

        JPanel card = AppTheme.cardPanel();
        card.setPreferredSize(new Dimension(900, 500));
        card.setLayout(new GridBagLayout());

        GridBagConstraints gbc = new GridBagConstraints();
        gbc.insets = new Insets(8, 12, 8, 12);
        gbc.gridx = 0; gbc.gridy = 0; gbc.gridwidth = 2; gbc.fill = GridBagConstraints.HORIZONTAL;

        JLabel title = new JLabel("ברוכים הבאים למערכת ההכשרה");
        title.setFont(AppTheme.TITLE);
        title.setForeground(AppTheme.TEXT);
        title.setHorizontalAlignment(SwingConstants.CENTER);
        title.setAlignmentX(Component.CENTER_ALIGNMENT);
        card.add(title, gbc);

        // Shield logo with fade
        gbc.gridy = 1; gbc.gridwidth = 2;
        JLabel logoLabel = new JLabel();
        logoLabel.setHorizontalAlignment(SwingConstants.CENTER);
        try {
            java.awt.Image img = javax.imageio.ImageIO.read(getClass().getResourceAsStream("/images/shield_logo.png"));
            java.awt.image.BufferedImage src = (java.awt.image.BufferedImage) img;
            int iw = src.getWidth(), ih = src.getHeight();
            int targetH = 120;
            int targetW = (int)(iw * (targetH / (double) ih));
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
        } catch (Exception ignored) {}
        card.add(logoLabel, gbc);

        gbc.gridy = 2; gbc.gridwidth = 1; gbc.fill = GridBagConstraints.NONE;
        JButton emp = AppTheme.primaryButton("כניסת עובדים");
        emp.setPreferredSize(new Dimension(220, 56));
        emp.addActionListener(e -> openLogin(false));

        gbc.gridx = 1;
        JButton mgr = AppTheme.primaryButton("כניסת מנהלים");
        mgr.setPreferredSize(new Dimension(220, 56));
        mgr.addActionListener(e -> openLogin(true));

        gbc.gridx = 0; gbc.gridy = 3; card.add(emp, gbc);
        gbc.gridx = 1; card.add(mgr, gbc);

        GridBagConstraints cgbc = new GridBagConstraints();
        cgbc.gridx = 0; cgbc.gridy = 1; cgbc.fill = GridBagConstraints.NONE; cgbc.anchor = GridBagConstraints.CENTER; cgbc.weightx = 1.0; cgbc.weighty = 1.0;
        background.add(card, cgbc);
        AppTheme.applyRTL(background);
        AppWindow.navigate(background);
    }

    private void openLogin(boolean managerMode) {
        new LoginFrame(db, managerMode);
    }
}
