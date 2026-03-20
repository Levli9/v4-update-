package com.cybertraining.ui;

import java.awt.*;
import java.util.Set;
import javax.swing.*;
import javax.swing.border.EmptyBorder;

import com.cybertraining.db.DatabaseManager;
import com.cybertraining.model.User;

public class TopicSelectionFrame extends JFrame {

    private static final String[][] TOPICS = {
        {"🌐", "מהי תקיפת סייבר?", "#54A0FF"},
        {"🛡️", "מהי אבטחת סייבר?", "#2ecc71"},
        {"🦠", "תוכנות זדוניות (Malware)", "#e74c3c"},
        {"🎣", "פישינג (Phishing)", "#3498db"},
        {"👤", "Man-in-the-Middle", "#e67e22"},
        {"🔑", "תקיפת סיסמאות", "#2ecc71"},
        {"🛡️", "שיטות הגנה בסייבר", "#9b59b6"},
        {"💥", "השפעת תקיפות סייבר", "#e74c3c"},
        {"🎯", "APT — איום מתקדם מתמשך", "#f39c12"},
        {"🌊", "מתקפת DDoS", "#1abc9c"},
        {"💉", "SQL Injection", "#e74c3c"},
    };

    public TopicSelectionFrame(DatabaseManager db, User user) {
        Set<Integer> completed = db.getCompletedTopics(user.getId());

        GradientPanel bg = new GradientPanel(AppTheme.BG, AppTheme.BG2);
        bg.setLayout(new BorderLayout());

        // Header
        JPanel header = new JPanel(new BorderLayout());
        header.setOpaque(false);
        header.setBorder(new EmptyBorder(15, 15, 5, 15));

        JButton backButton = AppTheme.backButton("← חזרה לתפריט");
        backButton.addActionListener(e -> new EmployeeHomeFrame(db, user));
        JPanel rightHeader = new JPanel(new FlowLayout(FlowLayout.RIGHT, 0, 0));
        rightHeader.setOpaque(false);
        rightHeader.add(backButton);
        header.add(rightHeader, BorderLayout.EAST);

        JLabel title = new JLabel("📚 פורטל למידה — אבטחת מידע");
        title.setForeground(AppTheme.TEXT);
        title.setFont(AppTheme.TITLE);
        title.setHorizontalAlignment(SwingConstants.CENTER);
        header.add(title, BorderLayout.CENTER);

        // Progress subtitle
        JLabel progressLabel = new JLabel("הושלמו " + completed.size() + " מתוך " + TOPICS.length + " נושאים");
        progressLabel.setForeground(AppTheme.MUTED);
        progressLabel.setFont(AppTheme.TEXT_FONT);
        progressLabel.setHorizontalAlignment(SwingConstants.CENTER);
        progressLabel.setBorder(new EmptyBorder(8, 0, 0, 0));
        header.add(progressLabel, BorderLayout.SOUTH);

        bg.add(header, BorderLayout.NORTH);

        // Banner image + topics in a vertical scroll
        JPanel contentPanel = new JPanel();
        contentPanel.setLayout(new BoxLayout(contentPanel, BoxLayout.Y_AXIS));
        contentPanel.setOpaque(false);

        // Cyber room banner image with fade edges
        try {
            java.awt.image.BufferedImage src = javax.imageio.ImageIO.read(getClass().getResourceAsStream("/images/cyber_room.gif"));
            if (src != null) {
                // Keep aspect ratio: original is wider than tall
                double aspect = (double) src.getWidth() / src.getHeight();
                int bannerW = 900;
                int bannerH = (int)(bannerW / aspect);
                if (bannerH > 350) { bannerH = 350; bannerW = (int)(bannerH * aspect); }
                java.awt.image.BufferedImage faded = new java.awt.image.BufferedImage(bannerW, bannerH, java.awt.image.BufferedImage.TYPE_INT_ARGB);
                java.awt.Graphics2D g2 = faded.createGraphics();
                g2.setRenderingHint(java.awt.RenderingHints.KEY_INTERPOLATION, java.awt.RenderingHints.VALUE_INTERPOLATION_BILINEAR);
                g2.drawImage(src, 0, 0, bannerW, bannerH, null);
                // Fade edges
                g2.setComposite(java.awt.AlphaComposite.DstIn);
                java.awt.RadialGradientPaint rgp = new java.awt.RadialGradientPaint(
                    new java.awt.geom.Point2D.Float(bannerW / 2f, bannerH / 2f),
                    Math.max(bannerW, bannerH) / 2f,
                    new float[]{0f, 0.6f, 1f},
                    new java.awt.Color[]{new java.awt.Color(0,0,0,255), new java.awt.Color(0,0,0,200), new java.awt.Color(0,0,0,0)});
                g2.setPaint(rgp);
                g2.fillRect(0, 0, bannerW, bannerH);
                g2.dispose();
                JLabel bannerLabel = new JLabel(new javax.swing.ImageIcon(faded));
                bannerLabel.setAlignmentX(java.awt.Component.CENTER_ALIGNMENT);
                bannerLabel.setBorder(new EmptyBorder(5, 0, 5, 0));
                contentPanel.add(bannerLabel);
            }
        } catch (Exception ignored) {}

        // Topic cards grid — wider with centered alignment
        JPanel topicsGrid = new JPanel(new GridLayout(0, 2, 20, 15));
        topicsGrid.setOpaque(false);

        // Wrap grid in a centered panel with max width
        JPanel gridWrapper = new JPanel();
        gridWrapper.setLayout(new BoxLayout(gridWrapper, BoxLayout.X_AXIS));
        gridWrapper.setOpaque(false);
        gridWrapper.setAlignmentX(Component.CENTER_ALIGNMENT);
        gridWrapper.add(Box.createHorizontalGlue());
        topicsGrid.setMaximumSize(new Dimension(1000, Integer.MAX_VALUE));
        topicsGrid.setBorder(new EmptyBorder(15, 10, 15, 10));
        gridWrapper.add(topicsGrid);
        gridWrapper.add(Box.createHorizontalGlue());

        for (int i = 0; i < TOPICS.length; i++) {
            final int topicIdx = i;
            String emoji = TOPICS[i][0];
            String name = TOPICS[i][1];
            Color accentColor = Color.decode(TOPICS[i][2]);
            boolean done = completed.contains(i);

            JPanel card = createTopicCard(emoji, name, accentColor, done, i + 1);
            card.setCursor(Cursor.getPredefinedCursor(Cursor.HAND_CURSOR));
            card.addMouseListener(new java.awt.event.MouseAdapter() {
                @Override
                public void mouseClicked(java.awt.event.MouseEvent e) {
                    new LearningFrame(db, user, topicIdx);
                }
                @Override
                public void mouseEntered(java.awt.event.MouseEvent e) {
                    card.setBackground(new Color(40, 35, 65));
                }
                @Override
                public void mouseExited(java.awt.event.MouseEvent e) {
                    card.setBackground(AppTheme.CARD);
                }
            });
            topicsGrid.add(card);
        }

        // Exam card (only if all topics completed)
        if (completed.size() == TOPICS.length) {
            JPanel examCard = new JPanel(new BorderLayout(10, 0));
            examCard.setComponentOrientation(ComponentOrientation.RIGHT_TO_LEFT);
            examCard.setBackground(AppTheme.CARD);
            examCard.setBorder(BorderFactory.createCompoundBorder(
                new RoundedBorder(12, new Color(0, 230, 255)),
                new EmptyBorder(18, 20, 18, 20)
            ));
            examCard.setCursor(Cursor.getPredefinedCursor(Cursor.HAND_CURSOR));

            JLabel examLabel = new JLabel("<html><div style='text-align:right;'><b style='font-size:14px; color:#00E6FF;'>🎓 מעבר למבחן הסמכה</b><br><span style='color:#aaa;'>סיימת את כל הנושאים — מוכן למבחן!</span></div></html>");
            examLabel.setFont(AppTheme.TEXT_FONT);
            examLabel.setForeground(AppTheme.TEXT);
            examCard.add(examLabel, BorderLayout.CENTER);

            examCard.addMouseListener(new java.awt.event.MouseAdapter() {
                @Override
                public void mouseClicked(java.awt.event.MouseEvent e) {
                    new QuizFrame(db, user);
                }
                @Override
                public void mouseEntered(java.awt.event.MouseEvent e) {
                    examCard.setBackground(new Color(40, 35, 65));
                }
                @Override
                public void mouseExited(java.awt.event.MouseEvent e) {
                    examCard.setBackground(AppTheme.CARD);
                }
            });
            topicsGrid.add(examCard);
        }

        contentPanel.add(gridWrapper);

        JScrollPane scroll = new JScrollPane(contentPanel);
        scroll.setBorder(null);
        scroll.setOpaque(false);
        scroll.getViewport().setOpaque(false);
        scroll.getVerticalScrollBar().setUnitIncrement(16);

        bg.add(scroll, BorderLayout.CENTER);
        AppWindow.navigate(bg);
    }

    private JPanel createTopicCard(String emoji, String name, Color accent, boolean done, int number) {
        JPanel card = new JPanel(new BorderLayout(10, 0));
        card.setComponentOrientation(ComponentOrientation.RIGHT_TO_LEFT);
        card.setBackground(AppTheme.CARD);
        card.setBorder(BorderFactory.createCompoundBorder(
            new RoundedBorder(12, done ? new Color(46, 204, 113) : new Color(231, 76, 60)),
            new EmptyBorder(18, 20, 18, 20)
        ));

        // Left side: number + emoji
        JLabel numLabel = new JLabel(number + ". " + emoji, SwingConstants.RIGHT);
        numLabel.setFont(new Font("Arial", Font.BOLD, 22));
        numLabel.setForeground(accent);
        numLabel.setPreferredSize(new Dimension(65, 40));
        card.add(numLabel, BorderLayout.EAST);

        // Center: topic name
        String statusText = done
            ? "<span style='color:#2ecc71;'>✅ הושלם</span>"
            : "<span style='color:#aaa;'>טרם הושלם</span>";
        JLabel nameLabel = new JLabel("<html><div style='text-align:right;'>"
            + "<b style='font-size:13px;'>" + name + "</b><br>" + statusText + "</div></html>");
        nameLabel.setFont(AppTheme.TEXT_FONT);
        nameLabel.setForeground(AppTheme.TEXT);
        card.add(nameLabel, BorderLayout.CENTER);

        return card;
    }
}
