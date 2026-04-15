package com.cybertraining.ui;

import java.awt.BorderLayout;
import java.awt.Color;
import java.awt.Component;
import java.awt.ComponentOrientation;
import java.awt.Cursor;
import java.awt.Dimension;
import java.awt.FlowLayout;
import java.awt.Font;
import java.awt.GridLayout;
import java.util.Set;

import javax.swing.BorderFactory;
import javax.swing.Box;
import javax.swing.BoxLayout;
import javax.swing.JButton;
import javax.swing.JFrame;
import javax.swing.JLabel;
import javax.swing.JPanel;
import javax.swing.JScrollPane;
import javax.swing.JTextField;
import javax.swing.SwingConstants;
import javax.swing.SwingUtilities;
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

        JPanel contentPanel = new JPanel();
        contentPanel.setLayout(new BoxLayout(contentPanel, BoxLayout.Y_AXIS));
        contentPanel.setOpaque(false);
        contentPanel.setBorder(new EmptyBorder(0, 0, 24, 0));

        try {
            java.io.InputStream bannerStream = getClass().getResourceAsStream("/images/cyber_room.gif");
            if (bannerStream != null) {
                java.awt.image.BufferedImage src = javax.imageio.ImageIO.read(bannerStream);
                if (src != null) {
                    double aspect = (double) src.getWidth() / src.getHeight();
                    int bannerW = 920;
                    int bannerH = (int) (bannerW / aspect);
                    if (bannerH > 340) {
                        bannerH = 340;
                        bannerW = (int) (bannerH * aspect);
                    }

                    java.awt.image.BufferedImage faded = new java.awt.image.BufferedImage(
                            bannerW,
                            bannerH,
                            java.awt.image.BufferedImage.TYPE_INT_ARGB);
                    java.awt.Graphics2D g2 = faded.createGraphics();
                    g2.setRenderingHint(java.awt.RenderingHints.KEY_INTERPOLATION, java.awt.RenderingHints.VALUE_INTERPOLATION_BILINEAR);
                    g2.drawImage(src, 0, 0, bannerW, bannerH, null);
                    g2.setComposite(java.awt.AlphaComposite.DstIn);
                    java.awt.RadialGradientPaint rgp = new java.awt.RadialGradientPaint(
                            new java.awt.geom.Point2D.Float(bannerW / 2f, bannerH / 2f),
                            Math.max(bannerW, bannerH) / 2f,
                            new float[]{0f, 0.65f, 1f},
                            new java.awt.Color[]{
                                new java.awt.Color(0, 0, 0, 255),
                                new java.awt.Color(0, 0, 0, 210),
                                new java.awt.Color(0, 0, 0, 0)
                            }
                    );
                    g2.setPaint(rgp);
                    g2.fillRect(0, 0, bannerW, bannerH);
                    g2.dispose();

                    JLabel bannerLabel = new JLabel(new javax.swing.ImageIcon(faded));
                    bannerLabel.setAlignmentX(Component.CENTER_ALIGNMENT);
                    bannerLabel.setBorder(new EmptyBorder(6, 0, 16, 0));
                    contentPanel.add(bannerLabel);
                }
            }
        } catch (Exception ignored) {
        }

        JPanel promptPanel = createLearningPromptPanel();
        promptPanel.setAlignmentX(Component.CENTER_ALIGNMENT);
        contentPanel.add(promptPanel);

        JPanel topicsGrid = new JPanel(new GridLayout(0, 2, 20, 15));
        topicsGrid.setOpaque(false);
        topicsGrid.setMaximumSize(new Dimension(1000, Integer.MAX_VALUE));
        topicsGrid.setBorder(new EmptyBorder(15, 10, 15, 10));

        JPanel gridWrapper = new JPanel();
        gridWrapper.setLayout(new BoxLayout(gridWrapper, BoxLayout.X_AXIS));
        gridWrapper.setOpaque(false);
        gridWrapper.add(Box.createHorizontalGlue());
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

        if (completed.size() == TOPICS.length) {
            JPanel examCard = new JPanel(new BorderLayout(10, 0));
            examCard.setComponentOrientation(ComponentOrientation.RIGHT_TO_LEFT);
            examCard.setBackground(AppTheme.CARD);
            examCard.setBorder(BorderFactory.createCompoundBorder(
                    new RoundedBorder(12, new Color(0, 230, 255)),
                    new EmptyBorder(18, 20, 18, 20)
            ));

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

    private JPanel createLearningPromptPanel() {
        JPanel outer = new JPanel();
        outer.setOpaque(false);
        outer.setLayout(new BoxLayout(outer, BoxLayout.Y_AXIS));
        outer.setBorder(new EmptyBorder(18, 18, 18, 18));
        outer.setComponentOrientation(ComponentOrientation.RIGHT_TO_LEFT);

        JPanel heroCard = new JPanel();
        heroCard.setOpaque(false);
        heroCard.setLayout(new BoxLayout(heroCard, BoxLayout.Y_AXIS));
        heroCard.setAlignmentX(Component.CENTER_ALIGNMENT);
        heroCard.setBorder(new EmptyBorder(0, 8, 16, 8));
        heroCard.setComponentOrientation(ComponentOrientation.RIGHT_TO_LEFT);

        JLabel badge = new JLabel("יצירת תוכן AI");
        badge.setAlignmentX(Component.CENTER_ALIGNMENT);
        badge.setForeground(new Color(0, 230, 255));
        badge.setFont(AppTheme.TEXT_FONT.deriveFont(Font.BOLD, 12f));
        badge.setComponentOrientation(ComponentOrientation.RIGHT_TO_LEFT);

        JLabel heroTitle = new JLabel("כתוב נושא אחד, והמערכת תבנה הכל");
        heroTitle.setAlignmentX(Component.CENTER_ALIGNMENT);
        heroTitle.setForeground(AppTheme.TEXT);
        heroTitle.setFont(AppTheme.TITLE.deriveFont(Font.BOLD, 26f));
        heroTitle.setHorizontalAlignment(SwingConstants.RIGHT);
        heroTitle.setComponentOrientation(ComponentOrientation.RIGHT_TO_LEFT);

        JLabel heroSubtitle = new JLabel("הלומדה, המצגת והשאלון נוצרים אוטומטית לפי הנושא שתקליד.");
        heroSubtitle.setAlignmentX(Component.CENTER_ALIGNMENT);
        heroSubtitle.setForeground(AppTheme.MUTED);
        heroSubtitle.setFont(AppTheme.SUBTITLE.deriveFont(Font.PLAIN, 16f));
        heroSubtitle.setHorizontalAlignment(SwingConstants.RIGHT);
        heroSubtitle.setComponentOrientation(ComponentOrientation.RIGHT_TO_LEFT);

        heroCard.add(badge);
        heroCard.add(Box.createVerticalStrut(6));
        heroCard.add(heroTitle);
        heroCard.add(Box.createVerticalStrut(4));
        heroCard.add(heroSubtitle);
        outer.add(heroCard);

        JPanel topicCard = new JPanel(new BorderLayout(12, 0));
        topicCard.setOpaque(true);
        topicCard.setBackground(AppTheme.CARD);
        topicCard.setComponentOrientation(ComponentOrientation.RIGHT_TO_LEFT);
        topicCard.setMaximumSize(new Dimension(980, 120));
        topicCard.setBorder(BorderFactory.createCompoundBorder(
            new RoundedBorder(18, new Color(72, 78, 96), 1),
            new EmptyBorder(18, 20, 18, 20)
        ));

        JLabel topicLabel = new JLabel("🎯 נושא");
        topicLabel.setForeground(new Color(0, 230, 255));
        topicLabel.setFont(AppTheme.TEXT_FONT.deriveFont(Font.BOLD, 14f));
        topicLabel.setPreferredSize(new Dimension(100, 36));
        topicLabel.setComponentOrientation(ComponentOrientation.RIGHT_TO_LEFT);

        JTextField topicField = new JTextField();
        topicField.setComponentOrientation(ComponentOrientation.RIGHT_TO_LEFT);
        topicField.setHorizontalAlignment(JTextField.RIGHT);
        topicField.setBackground(new Color(18, 16, 32));
        topicField.setForeground(AppTheme.TEXT);
        topicField.setCaretColor(AppTheme.ACCENT);
        topicField.setFont(AppTheme.TEXT_FONT.deriveFont(Font.PLAIN, 16f));
        topicField.setBorder(BorderFactory.createCompoundBorder(
            new RoundedBorder(16, new Color(84, 160, 255), 1),
            new EmptyBorder(10, 14, 10, 14)
        ));

        JLabel inputHint = new JLabel("הקלד רק נושא אחד. המערכת תייצר עבורך את כל שאר התוצרים.");
        inputHint.setForeground(AppTheme.MUTED);
        inputHint.setFont(AppTheme.TEXT_FONT.deriveFont(Font.PLAIN, 12f));
        inputHint.setHorizontalAlignment(SwingConstants.RIGHT);
        inputHint.setComponentOrientation(ComponentOrientation.RIGHT_TO_LEFT);

        JPanel topicCenter = new JPanel();
        topicCenter.setOpaque(false);
        topicCenter.setLayout(new BoxLayout(topicCenter, BoxLayout.Y_AXIS));
        topicCenter.setComponentOrientation(ComponentOrientation.RIGHT_TO_LEFT);
        topicCenter.add(topicField);
        topicCenter.add(Box.createVerticalStrut(8));
        topicCenter.add(inputHint);

        topicCard.add(topicLabel, BorderLayout.EAST);
        topicCard.add(topicCenter, BorderLayout.CENTER);
        outer.add(topicCard);
        outer.add(Box.createVerticalStrut(16));

        // ============ Status & Button ============
        JLabel status = new JLabel("הקלד נושא ולחץ 'ייצר לי'");
        status.setForeground(AppTheme.MUTED);
        status.setFont(AppTheme.TEXT_FONT.deriveFont(Font.PLAIN, 13f));
        status.setHorizontalAlignment(SwingConstants.CENTER);
        status.setComponentOrientation(ComponentOrientation.RIGHT_TO_LEFT);

        JButton generateBtn = new AnimatedButton("ייצר לי", new Color(84, 160, 255), new Color(116, 184, 255), Color.WHITE);
        generateBtn.setFont(AppTheme.TEXT_FONT.deriveFont(Font.BOLD, 15f));
        generateBtn.setBorder(BorderFactory.createCompoundBorder(
            new RoundedBorder(18, new Color(50, 120, 210), 2),
            new EmptyBorder(12, 28, 12, 28)
        ));

        generateBtn.addActionListener(e -> {
            final String topic = topicField.getText().trim();

            if (!isMeaningfulTopic(topic)) {
                status.setText("⚠️ אנא כתוב נושא ברור בעברית או באנגלית, למשל: 'בתי חולים', 'לוגיסטיקה', 'מפעל'.");
                status.setForeground(new Color(231, 76, 60));
                return;
            }

            status.setText("⏳ יוצר תוכן...");
            status.setForeground(new Color(241, 196, 15));

            // Async generation in background
            new Thread(() -> {
                try {
                    generateContentAsync(topic, status);
                } catch (Exception ex) {
                    SwingUtilities.invokeLater(() -> {
                        status.setText("❌ שגיאה: " + ex.getMessage());
                        status.setForeground(new Color(231, 76, 60));
                    });
                }
            }).start();
        });

        JPanel buttonPanel = new JPanel(new FlowLayout(FlowLayout.CENTER));
        buttonPanel.setOpaque(false);
        buttonPanel.add(generateBtn);

        JPanel actionCard = new JPanel();
        actionCard.setOpaque(true);
        actionCard.setBackground(AppTheme.CARD);
        actionCard.setComponentOrientation(ComponentOrientation.RIGHT_TO_LEFT);
        actionCard.setMaximumSize(new Dimension(980, 110));
        actionCard.setBorder(BorderFactory.createCompoundBorder(
            new RoundedBorder(18, new Color(72, 78, 96), 1),
            new EmptyBorder(14, 16, 14, 16)
        ));

        JPanel actionContent = new JPanel();
        actionContent.setOpaque(false);
        actionContent.setLayout(new BoxLayout(actionContent, BoxLayout.Y_AXIS));
        actionContent.add(status);
        actionContent.add(Box.createVerticalStrut(12));
        actionContent.add(buttonPanel);

        actionCard.add(actionContent);

        outer.add(actionCard);

        JPanel wrapper = new JPanel();
        wrapper.setOpaque(false);
        wrapper.setLayout(new BoxLayout(wrapper, BoxLayout.X_AXIS));
        wrapper.add(Box.createHorizontalGlue());
        wrapper.add(outer);
        wrapper.add(Box.createHorizontalGlue());

        return wrapper;
    }

    private boolean isMeaningfulTopic(String topic) {
        if (topic == null) {
            return false;
        }

        String cleaned = topic.trim();
        if (cleaned.length() < 2) {
            return false;
        }

        boolean hasLetter = false;
        int letterCount = 0;
        for (int i = 0; i < cleaned.length(); i++) {
            char ch = cleaned.charAt(i);
            if (Character.isLetter(ch)) {
                hasLetter = true;
                letterCount++;
            }
        }

        if (!hasLetter || letterCount < 2) {
            return false;
        }

        String lower = cleaned.toLowerCase(java.util.Locale.ROOT);
        String[] invalidFragments = {
            "asdf", "qwer", "test", "xxx", "zzz", "lol", "123", "!!!!!", "?????"
        };

        for (String invalid : invalidFragments) {
            if (lower.contains(invalid)) {
                return false;
            }
        }

        return true;
    }

    private void generateContentAsync(String topic, JLabel statusLabel) {
        System.out.println("🔄 generateContentAsync called: topic=" + topic);
        
        try {
            System.out.println("📦 Creating LLMService...");
            com.cybertraining.service.LLMService llmService = new com.cybertraining.service.LLMService();
            
            System.out.println("📦 Creating ContentGenerationService...");
            com.cybertraining.service.ContentGenerationService contentService = 
                new com.cybertraining.service.ContentGenerationService(llmService);

            // Callback לעדכון סטטוס
            java.util.function.Consumer<String> statusCallback = status -> {
                System.out.println("📊 Status: " + status);
                SwingUtilities.invokeLater(() -> statusLabel.setText(status));
            };

            System.out.println("🎯 Starting content generation...");
            com.cybertraining.model.GeneratedContentData content = 
                contentService.generateContent(topic, "", "", statusCallback);

            System.out.println("✅ Content generated! Opening frame...");
            SwingUtilities.invokeLater(() -> {
                statusLabel.setText("✅ בוצע!");
                statusLabel.setForeground(new Color(46, 204, 113));
                System.out.println("🎨 Creating ContentGenerationFrame...");
                new com.cybertraining.ui.ContentGenerationFrame(content);
                System.out.println("✓ Frame created and shown!");
            });

        } catch (Exception ex) {
            System.err.println("❌ Error in generateContentAsync: " + ex.getMessage());
            ex.printStackTrace();
            
            SwingUtilities.invokeLater(() -> {
                String rawMessage = ex.getMessage() == null ? "" : ex.getMessage();
                String errorMsg = rawMessage.contains("שגיאה ביצירת התוכן. נסה שוב.")
                    ? "שגיאה ביצירת התוכן. נסה שוב."
                    : (rawMessage.isBlank() ? "שגיאה לא ידועה" : rawMessage);
                statusLabel.setText(errorMsg);
                statusLabel.setForeground(new Color(231, 76, 60));
            });
        }
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
