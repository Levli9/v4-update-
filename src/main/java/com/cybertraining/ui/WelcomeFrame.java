package com.cybertraining.ui;

import java.awt.Component;
import java.awt.FlowLayout;
import java.awt.ComponentOrientation;
import java.awt.Dimension;
import java.awt.GridBagLayout;
import java.awt.GridBagConstraints;

import javax.swing.Box;
import javax.swing.BoxLayout;
import javax.swing.JButton;
import javax.swing.JFrame;
import javax.swing.JLabel;
import javax.swing.JPanel;
import javax.swing.SwingConstants;

import com.cybertraining.db.DatabaseManager;

public class WelcomeFrame extends JFrame {

    public WelcomeFrame(DatabaseManager db) {


        BackgroundPanel bg = new BackgroundPanel(null);
        bg.setLayout(new GridBagLayout());
        bg.setComponentOrientation(ComponentOrientation.RIGHT_TO_LEFT);

        // header with top-right back/exit button
        JPanel header = new JPanel(new FlowLayout(FlowLayout.RIGHT, 12, 12));
        header.setOpaque(false);
        JButton exitBtn = AppTheme.backButton("יציאה");
        exitBtn.addActionListener(e -> System.exit(0));
        header.add(exitBtn);
        GridBagConstraints hgbc = new GridBagConstraints();
        hgbc.gridx = 0; hgbc.gridy = 0; hgbc.anchor = GridBagConstraints.NORTHEAST; hgbc.weightx = 1.0; hgbc.insets = new java.awt.Insets(6,6,6,6);
        bg.add(header, hgbc);

        JPanel card = AppTheme.cardPanel();
        card.setLayout(new BoxLayout(card,BoxLayout.Y_AXIS));
        card.setPreferredSize(new Dimension(900, 560));

        JLabel title = new JLabel("<html><div style='white-space:nowrap; text-align:center;'><span style='color: #00E6FF;'>⚡</span> מערכת הדרכה לאבטחת מידע <span style='color: #00E6FF;'>⚡</span></div></html>");
        title.setFont(AppTheme.TITLE);
        title.setForeground(AppTheme.TEXT);
        title.setAlignmentX(Component.CENTER_ALIGNMENT);
        title.setHorizontalAlignment(SwingConstants.CENTER);

        JLabel sub = new JLabel("פלטפורמת למידה והסמכה חכמה לעובדים 🚀");
        sub.setFont(AppTheme.SUBTITLE);
        sub.setForeground(AppTheme.MUTED);
        sub.setAlignmentX(Component.CENTER_ALIGNMENT);
        sub.setHorizontalAlignment(SwingConstants.CENTER);

        // Buttons according to new flow: Register / Login – side by side
        JButton register = AppTheme.primaryButton("הרשמה");
        JButton login = AppTheme.primaryButton("התחברות");

        register.setPreferredSize(new Dimension(200, 52));
        login.setPreferredSize(new Dimension(200, 52));

        JPanel btnRow = new JPanel(new FlowLayout(FlowLayout.CENTER, 20, 0));
        btnRow.setOpaque(false);
        btnRow.setAlignmentX(Component.CENTER_ALIGNMENT);
        btnRow.add(register);
        btnRow.add(login);

        register.addActionListener(e -> new RegistrationFrame(db));

        login.addActionListener(e -> new RoleSelectionScreen(db));

        // Cyber welcome banner with fade edges
        javax.swing.JLabel bannerLabel = new javax.swing.JLabel();
        bannerLabel.setAlignmentX(Component.CENTER_ALIGNMENT);
        bannerLabel.setHorizontalAlignment(SwingConstants.CENTER);
        try {
            java.awt.image.BufferedImage src = javax.imageio.ImageIO.read(getClass().getResourceAsStream("/images/cyber_welcome.jpg"));
            if (src != null) {
                double aspect = (double) src.getWidth() / src.getHeight();
                int bannerW = 820;
                int bannerH = (int)(bannerW / aspect);
                if (bannerH > 280) { bannerH = 280; bannerW = (int)(bannerH * aspect); }
                java.awt.image.BufferedImage faded = new java.awt.image.BufferedImage(bannerW, bannerH, java.awt.image.BufferedImage.TYPE_INT_ARGB);
                java.awt.Graphics2D g2 = faded.createGraphics();
                g2.setRenderingHint(java.awt.RenderingHints.KEY_INTERPOLATION, java.awt.RenderingHints.VALUE_INTERPOLATION_BILINEAR);
                g2.drawImage(src, 0, 0, bannerW, bannerH, null);
                // Fade edges with radial gradient
                g2.setComposite(java.awt.AlphaComposite.DstIn);
                java.awt.RadialGradientPaint rgp = new java.awt.RadialGradientPaint(
                    new java.awt.geom.Point2D.Float(bannerW / 2f, bannerH / 2f),
                    Math.max(bannerW, bannerH) / 2f,
                    new float[]{0f, 0.55f, 1f},
                    new java.awt.Color[]{new java.awt.Color(0,0,0,255), new java.awt.Color(0,0,0,220), new java.awt.Color(0,0,0,0)});
                g2.setPaint(rgp);
                g2.fillRect(0, 0, bannerW, bannerH);
                g2.dispose();
                bannerLabel.setIcon(new javax.swing.ImageIcon(faded));
            }
        } catch (Exception ignored) {}

        card.add(bannerLabel);
        card.add(Box.createVerticalStrut(10));
        card.add(title);
        card.add(Box.createVerticalStrut(12));
        card.add(sub);
        card.add(Box.createVerticalStrut(24));
        card.add(btnRow);

        GridBagConstraints gbc = new GridBagConstraints();
        gbc.gridx = 0; gbc.gridy = 1; gbc.fill = GridBagConstraints.NONE; gbc.anchor = GridBagConstraints.CENTER; gbc.weightx = 1.0; gbc.weighty = 1.0;
        bg.add(card, gbc);
        AppTheme.applyRTL(bg);
        AppWindow.navigate(bg);
    }
}