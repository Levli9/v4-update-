package com.cybertraining.ui;

import java.awt.BorderLayout;
import java.awt.Component;
import java.awt.Dimension;
import java.awt.FlowLayout;
import java.awt.GridBagLayout;

import javax.swing.Box;
import javax.swing.BoxLayout;
import javax.swing.JButton;
import javax.swing.JFrame;
import javax.swing.JLabel;
import javax.swing.JPanel;

import com.cybertraining.db.DatabaseManager;
import com.cybertraining.model.User;

public class EmployeeHomeFrame extends JFrame {

    public EmployeeHomeFrame(DatabaseManager db, User user){

        GradientPanel bg = new GradientPanel(AppTheme.BG, AppTheme.BG2);
        bg.setLayout(new BorderLayout());

        JPanel topBar = new JPanel(new FlowLayout(FlowLayout.RIGHT, 15, 15));
        topBar.setOpaque(false);
        JButton backButton = AppTheme.backButton("← התנתק וחזור");
        backButton.addActionListener(e -> new WelcomeFrame(db));
        topBar.add(backButton);
        bg.add(topBar, BorderLayout.NORTH);

        JPanel centerPanel = new JPanel(new GridBagLayout());
        centerPanel.setOpaque(false);

        JPanel card = AppTheme.cardPanel();
        card.setLayout(new BoxLayout(card, BoxLayout.Y_AXIS));
        card.setPreferredSize(new Dimension(900, 500));

        JLabel welcome = new JLabel("<html><center>שלום, <span style='color: #00E6FF;'><b>" + user.getName() + "</b></span> 👋</center></html>");
        welcome.setForeground(AppTheme.TEXT);
        welcome.setFont(AppTheme.TITLE);
        welcome.setAlignmentX(Component.CENTER_ALIGNMENT);
        
        JLabel subtitle = new JLabel("בחר אחת מהאפשרויות הבאות:");
        subtitle.setForeground(AppTheme.MUTED);
        subtitle.setFont(AppTheme.SUBTITLE);
        subtitle.setAlignmentX(Component.CENTER_ALIGNMENT);

        JButton learn = AppTheme.primaryButton("📚 פורטל למידה");
        JButton exam = AppTheme.secondaryButton("🎯 מבחן הסמכה");
        
        learn.setAlignmentX(Component.CENTER_ALIGNMENT);
        exam.setAlignmentX(Component.CENTER_ALIGNMENT);
        learn.setMaximumSize(new Dimension(260, 44));
        exam.setMaximumSize(new Dimension(260, 44));

        learn.addActionListener(e -> new TopicSelectionFrame(db, user));

        exam.addActionListener(e -> new QuizFrame(db, user));

        // Shield logo with fade
        javax.swing.JLabel logoLabel = new javax.swing.JLabel();
        logoLabel.setAlignmentX(Component.CENTER_ALIGNMENT);
        logoLabel.setHorizontalAlignment(javax.swing.SwingConstants.CENTER);
        try {
            java.awt.Image img = javax.imageio.ImageIO.read(getClass().getResourceAsStream("/images/shield_logo.png"));
            java.awt.image.BufferedImage src = (java.awt.image.BufferedImage) img;
            int iw = src.getWidth(), ih = src.getHeight();
            int targetH = 110;
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
            logoLabel.setIcon(new javax.swing.ImageIcon(faded));
        } catch (Exception ignored) {}

        card.add(Box.createVerticalStrut(20));
        card.add(logoLabel);
        card.add(Box.createVerticalStrut(10));
        card.add(welcome);
        card.add(Box.createVerticalStrut(10));
        card.add(subtitle);
        card.add(Box.createVerticalStrut(30));
        card.add(learn);
        card.add(Box.createVerticalStrut(15));
        card.add(exam);

        centerPanel.add(card);
        bg.add(centerPanel, BorderLayout.CENTER);

        AppTheme.applyRTL(bg);
        AppWindow.navigate(bg);
    }
}