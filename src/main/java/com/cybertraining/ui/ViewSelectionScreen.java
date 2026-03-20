package com.cybertraining.ui;

import com.cybertraining.db.DatabaseManager;
import com.cybertraining.model.User;

import javax.swing.*;
import java.awt.*;

public class ViewSelectionScreen extends JFrame {

    private final DatabaseManager db;
    private final User user;

    public ViewSelectionScreen(DatabaseManager db, User user) {
        super("בחירת תצוגה");
        this.db = db;
        this.user = user;
        initUI();
    }

    private void initUI() {
        GradientPanel background = new GradientPanel(AppTheme.BG, AppTheme.BG2);
        background.setLayout(new GridBagLayout());
        background.setComponentOrientation(ComponentOrientation.RIGHT_TO_LEFT);

        // top-right header with back/exit button
        JPanel header = new JPanel(new FlowLayout(FlowLayout.RIGHT, 12, 12));
        header.setOpaque(false);
        JButton back = AppTheme.backButton("התנתק");
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

        JLabel title = new JLabel("שלום, " + user.getName() + " 👋");
        title.setFont(AppTheme.TITLE);
        title.setForeground(AppTheme.TEXT);
        title.setHorizontalAlignment(SwingConstants.CENTER);
        title.setAlignmentX(Component.CENTER_ALIGNMENT);
        card.add(title, gbc);

        gbc.gridy = 1;
        JLabel subtitle = new JLabel("בחר את התצוגה שברצונך לגשת אליה:");
        subtitle.setFont(AppTheme.SUBTITLE);
        subtitle.setForeground(AppTheme.MUTED);
        subtitle.setHorizontalAlignment(SwingConstants.CENTER);
        subtitle.setAlignmentX(Component.CENTER_ALIGNMENT);
        card.add(subtitle, gbc);

        // Shield logo
        gbc.gridy = 2; gbc.gridwidth = 2;
        JLabel logoLabel = new JLabel();
        logoLabel.setHorizontalAlignment(SwingConstants.CENTER);
        try {
            java.awt.Image img = javax.imageio.ImageIO.read(getClass().getResourceAsStream("/images/shield_logo.png"));
            java.awt.image.BufferedImage src = (java.awt.image.BufferedImage) img;
            int iw = src.getWidth(), ih = src.getHeight();
            int targetH = 100;
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

        gbc.gridy = 3; gbc.gridwidth = 1; gbc.fill = GridBagConstraints.NONE;
        JButton employeeView = AppTheme.primaryButton("👤 תצוגת עובדים");
        employeeView.setPreferredSize(new Dimension(280, 56));
        employeeView.addActionListener(e -> {
            dispose();
            new EmployeeHomeFrame(db, user);
        });

        gbc.gridx = 1;
        JButton managerView = AppTheme.primaryButton("📊 תצוגת מנהלים");
        managerView.setPreferredSize(new Dimension(280, 56));
        managerView.addActionListener(e -> {
            dispose();
            new ManagerDashboardFrame(db, user);
        });

        gbc.gridx = 0; gbc.gridy = 4; card.add(employeeView, gbc);
        gbc.gridx = 1; card.add(managerView, gbc);

        GridBagConstraints cgbc = new GridBagConstraints();
        cgbc.gridx = 0; cgbc.gridy = 1; cgbc.fill = GridBagConstraints.NONE; cgbc.anchor = GridBagConstraints.CENTER; cgbc.weightx = 1.0; cgbc.weighty = 1.0;
        background.add(card, cgbc);
        AppTheme.applyRTL(background);
        AppWindow.navigate(background);
    }
}