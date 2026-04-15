package com.cybertraining.ui;

import java.awt.BorderLayout;
import java.awt.Color;
import java.awt.Component;
import java.awt.ComponentOrientation;
import java.awt.Dimension;
import java.awt.FlowLayout;
import java.awt.Font;
import java.awt.GridBagLayout;
import java.util.ArrayList;
import java.util.List;

import javax.swing.BorderFactory;
import javax.swing.Box;
import javax.swing.BoxLayout;
import javax.swing.ButtonGroup;
import javax.swing.JButton;
import javax.swing.JEditorPane;
import javax.swing.JFrame;
import javax.swing.JLabel;
import javax.swing.JPanel;
import javax.swing.JRadioButton;
import javax.swing.JScrollPane;
import javax.swing.JTabbedPane;
import javax.swing.SwingConstants;
import javax.swing.border.EmptyBorder;

import com.cybertraining.model.GeneratedContentData;
import com.cybertraining.model.GeneratedContentData.LearningModule;
import com.cybertraining.model.GeneratedContentData.Question;
import com.cybertraining.model.GeneratedContentData.Section;
import com.cybertraining.model.GeneratedContentData.Slide;

/**
 * Frame לתצוגת תוכן AI שנוצר
 * מציג: Learning Module, Presentation, Quiz
 */
public class ContentGenerationFrame extends JFrame {

    private final GeneratedContentData content;
    private final JTabbedPane tabbedPane;
    private final JPanel learningPanel;
    private final JPanel presentationPanel;
    private final JPanel quizPanel;
    private int currentSlideIndex = 0;
    private final List<Slide> slides;

    public ContentGenerationFrame(GeneratedContentData generatedContent) {
        this.content = generatedContent;
        this.slides = (generatedContent.getPresentation() != null && generatedContent.getPresentation().getSlides() != null)
            ? generatedContent.getPresentation().getSlides()
            : new ArrayList<>();

        setTitle("תוכן מותאם אישית");
        setDefaultCloseOperation(JFrame.DISPOSE_ON_CLOSE);
        setSize(1400, 900);
        setMinimumSize(new Dimension(1200, 800));
        setLocationRelativeTo(null);

        // Layout ראשי
        JPanel mainPanel = new JPanel(new BorderLayout(0, 0));
        mainPanel.setBackground(AppTheme.BG);

        // Header
        mainPanel.add(createHeader(), BorderLayout.NORTH);

        // Tabbed Pane עם התוכן
        tabbedPane = new JTabbedPane();
        tabbedPane.setComponentOrientation(ComponentOrientation.RIGHT_TO_LEFT);
        tabbedPane.setBackground(AppTheme.CARD);
        tabbedPane.setForeground(AppTheme.TEXT);

        learningPanel = createLearningPanel();
        presentationPanel = createPresentationPanel();
        quizPanel = createQuizPanel();

        tabbedPane.addTab("🎓 למידה", learningPanel);
        tabbedPane.addTab("🖥️ שקפים", presentationPanel);
        tabbedPane.addTab("❓ שאלון", quizPanel);

        mainPanel.add(tabbedPane, BorderLayout.CENTER);

        // Footer עם מידע
        mainPanel.add(createFooter(), BorderLayout.SOUTH);

        setContentPane(mainPanel);
        
        AppTheme.applyRTL(this);
        try {
            setExtendedState(JFrame.MAXIMIZED_BOTH);
        } catch (Exception ignored) {
        }
        setVisible(true);
    }

    private JPanel createHeader() {
        JPanel header = new JPanel(new BorderLayout());
        header.setComponentOrientation(ComponentOrientation.RIGHT_TO_LEFT);
        header.setOpaque(false);
        header.setBorder(new EmptyBorder(15, 15, 15, 15));

        JButton closeBtn = AppTheme.backButton("← סגור");
        closeBtn.addActionListener(e -> dispose());

        JPanel rightBar = new JPanel(new FlowLayout(FlowLayout.RIGHT, 0, 0));
        rightBar.setOpaque(false);
        rightBar.add(closeBtn);
        header.add(rightBar, BorderLayout.WEST);

        JLabel title = new JLabel("תוכן מותאם: " + content.getTopic());
        title.setForeground(AppTheme.TEXT);
        title.setFont(AppTheme.TITLE);
        title.setHorizontalAlignment(SwingConstants.CENTER);
        header.add(title, BorderLayout.CENTER);

        if (content.getOrganizationContext() != null && !content.getOrganizationContext().isEmpty()) {
            JLabel context = new JLabel("(" + content.getOrganizationContext() + ")");
            context.setForeground(AppTheme.MUTED);
            context.setFont(AppTheme.TEXT_FONT.deriveFont(Font.ITALIC, 12f));
            header.add(context, BorderLayout.SOUTH);
        }

        return header;
    }

    private JPanel createLearningPanel() {
        JPanel panel = new JPanel(new BorderLayout());
        panel.setComponentOrientation(ComponentOrientation.RIGHT_TO_LEFT);
        panel.setBackground(AppTheme.CARD);
        panel.setBorder(new EmptyBorder(20, 20, 20, 20));

        LearningModule module = content.getLearningModule();
        if (module == null) {
            panel.add(emptyState("לא התקבל תוכן להצגה."), BorderLayout.CENTER);
            return panel;
        }

        JEditorPane editor = new JEditorPane();
        editor.setContentType("text/html");
        editor.setEditable(false);
        editor.setBackground(AppTheme.CARD);
        editor.setForeground(AppTheme.TEXT);

        StringBuilder html = new StringBuilder();
        html.append("<html><body style='direction: rtl; text-align: right; font-family: Arial; color: #E6E8EE; line-height: 1.9;'>");
        html.append("<h1 style='color: #54A0FF; margin-bottom: 8px;'>").append(escapeHtml(module.getTitle())).append("</h1>");
        html.append("<p style='font-size:16px; margin-top: 0;'>").append(escapeHtml(module.getIntroduction())).append("</p>");

        if (module.getSections() != null) {
            for (Section section : module.getSections()) {
                html.append("<div style='background:#181420; border:1px solid #2F3A56; border-radius:12px; padding:12px 14px; margin:14px 0;'>");
                html.append("<h2 style='color:#1ABC9C; margin: 0 0 8px 0;'>").append(escapeHtml(section.getTitle())).append("</h2>");
                int slideCount = section.getSlides() == null ? 0 : section.getSlides().size();
                html.append("<p style='margin:0; color:#BDC3D5;'>").append("מספר שקפים בחלק זה: ").append(slideCount).append("</p>");
                html.append("</div>");
            }
        }

        html.append("<div style='margin-top:18px; border-top:1px solid #343B51; padding-top:12px;'>");
        html.append("<h3 style='color:#FFD166; margin:0 0 6px 0;'>סיכום</h3>");
        html.append("<p style='margin:0;'>").append(escapeHtml(module.getSummary())).append("</p>");
        html.append("</div>");
        html.append("</body></html>");

        editor.setText(html.toString());

        JScrollPane scroll = new JScrollPane(editor);
        scroll.setComponentOrientation(ComponentOrientation.RIGHT_TO_LEFT);
        panel.add(scroll, BorderLayout.CENTER);

        return panel;
    }

    private JPanel createPresentationPanel() {
        JPanel panel = new JPanel(new BorderLayout());
        panel.setComponentOrientation(ComponentOrientation.RIGHT_TO_LEFT);
        panel.setBackground(AppTheme.BG);
        panel.setBorder(new EmptyBorder(20, 20, 20, 20));

        JPanel contentPanel = new JPanel(new BorderLayout());
        contentPanel.setBackground(AppTheme.CARD);
        contentPanel.setBorder(new RoundedBorder(10, AppTheme.PRIMARY));

        JEditorPane slideEditor = new JEditorPane();
        slideEditor.setContentType("text/html");
        slideEditor.setEditable(false);
        slideEditor.setBackground(AppTheme.CARD);
        slideEditor.setForeground(AppTheme.TEXT);

        JScrollPane scroll = new JScrollPane(slideEditor);
        scroll.setComponentOrientation(ComponentOrientation.RIGHT_TO_LEFT);
        contentPanel.add(scroll, BorderLayout.CENTER);

        panel.add(contentPanel, BorderLayout.CENTER);

        // Navigation buttons
        JPanel navPanel = new JPanel(new FlowLayout(FlowLayout.CENTER, 15, 10));
        navPanel.setComponentOrientation(ComponentOrientation.RIGHT_TO_LEFT);
        navPanel.setOpaque(false);

        JButton prevBtn = AppTheme.secondaryButton("← שקף קודם");
        JButton nextBtn = AppTheme.primaryButton("שקף הבא →");
        JLabel slideCounter = new JLabel();
        slideCounter.setForeground(AppTheme.TEXT);
        slideCounter.setFont(AppTheme.TEXT_FONT.deriveFont(Font.BOLD, 13f));

        prevBtn.addActionListener(e -> {
            if (currentSlideIndex > 0) {
                currentSlideIndex--;
                updateSlideDisplay(slideEditor, slideCounter);
            }
        });

        nextBtn.addActionListener(e -> {
            if (currentSlideIndex < slides.size() - 1) {
                currentSlideIndex++;
                updateSlideDisplay(slideEditor, slideCounter);
            }
        });

        navPanel.add(nextBtn);
        navPanel.add(slideCounter);
        navPanel.add(prevBtn);

        panel.add(navPanel, BorderLayout.SOUTH);

        // Display first slide
        if (!slides.isEmpty()) {
            updateSlideDisplay(slideEditor, slideCounter);
        }

        return panel;
    }

    private void updateSlideDisplay(JEditorPane editor, JLabel counter) {
        if (currentSlideIndex >= 0 && currentSlideIndex < slides.size()) {
            Slide slide = slides.get(currentSlideIndex);

            String contentText = slide.getContent() == null ? "" : slide.getContent();
            String explanation = contentText;
            String summaryLine = "";
            int split = contentText.indexOf('\n');
            if (split >= 0) {
                explanation = contentText.substring(0, split).trim();
                summaryLine = contentText.substring(split + 1).trim();
            }

            StringBuilder html = new StringBuilder();
            html.append("<html><body style='direction: rtl; text-align: right; font-family: Arial; color: #E6E8EE; line-height: 1.9;'>");
            html.append("<div style='background:#171327; border:1px solid #2D3E63; border-radius:14px; padding:18px;'>");
            html.append("<h1 style='color: #54A0FF; margin:0 0 8px 0;'>").append(escapeHtml(slide.getTitle())).append("</h1>");
            html.append("<p style='font-size:15px; margin:0 0 12px 0;'>").append(escapeHtml(explanation)).append("</p>");

            if (slide.getBulletPoints() != null) {
                html.append("<ul style='margin: 6px 0 12px 0; padding-right: 22px;'>");
                for (String bullet : slide.getBulletPoints()) {
                    html.append("<li style='margin: 7px 0;'>").append(escapeHtml(bullet)).append("</li>");
                }
                html.append("</ul>");
            }

            if (!summaryLine.isEmpty()) {
                html.append("<p style='color:#FFD166; margin: 8px 0 0 0;'><b>סיכום:</b> ").append(escapeHtml(summaryLine)).append("</p>");
            }

            if (slide.getSpeakerNotes() != null && !slide.getSpeakerNotes().isEmpty()) {
                html.append("<hr style='border: 1px solid #3A425A; margin-top:12px;' />");
                html.append("<p style='color: #C9D8FF; font-style: italic; margin:8px 0 0 0;'><b>הערות מרצה:</b><br/>")
                    .append(escapeHtml(slide.getSpeakerNotes())).append("</p>");
            }

            html.append("</div>");
            html.append("</body></html>");
            editor.setText(html.toString());

            counter.setText(String.format("שקף %d מתוך %d", currentSlideIndex + 1, slides.size()));
        }
    }

    private JPanel createQuizPanel() {
        JPanel panel = new JPanel(new BorderLayout());
        panel.setComponentOrientation(ComponentOrientation.RIGHT_TO_LEFT);
        panel.setBackground(AppTheme.CARD);
        panel.setBorder(new EmptyBorder(20, 20, 20, 20));

        if (content.getQuiz() != null && content.getQuiz().getQuestions() != null) {
            JPanel questionsPanel = new JPanel();
            questionsPanel.setLayout(new BoxLayout(questionsPanel, BoxLayout.Y_AXIS));
            questionsPanel.setComponentOrientation(ComponentOrientation.RIGHT_TO_LEFT);
            questionsPanel.setOpaque(false);

            for (Question q : content.getQuiz().getQuestions()) {
                JPanel qPanel = createQuestionPanel(q);
                questionsPanel.add(qPanel);
                questionsPanel.add(Box.createVerticalStrut(20));
            }

            JScrollPane scroll = new JScrollPane(questionsPanel);
            scroll.setComponentOrientation(ComponentOrientation.RIGHT_TO_LEFT);
            panel.add(scroll, BorderLayout.CENTER);
        } else {
            panel.add(emptyState("לא התקבלו שאלות להצגה."), BorderLayout.CENTER);
        }

        return panel;
    }

    private JPanel createQuestionPanel(Question q) {
        JPanel panel = new JPanel();
        panel.setLayout(new BoxLayout(panel, BoxLayout.Y_AXIS));
        panel.setComponentOrientation(ComponentOrientation.RIGHT_TO_LEFT);
        panel.setBackground(new Color(21, 24, 38));
        panel.setBorder(BorderFactory.createCompoundBorder(
            new RoundedBorder(12, AppTheme.PRIMARY),
            new EmptyBorder(14, 16, 14, 16)
        ));

        JLabel qLabel = new JLabel("<html><div style='text-align:right; width:700px;'><b>" + escapeHtml(q.getQuestion()) + "</b></div></html>");
        qLabel.setForeground(AppTheme.TEXT);
        qLabel.setFont(AppTheme.TEXT_FONT.deriveFont(Font.BOLD, 14f));
        qLabel.setAlignmentX(Component.RIGHT_ALIGNMENT);
        panel.add(qLabel);
        panel.add(Box.createVerticalStrut(10));

        ButtonGroup group = new ButtonGroup();
        List<JRadioButton> optionButtons = new ArrayList<>();
        if (q.getOptions() != null) {
            for (String option : q.getOptions()) {
                JRadioButton optionButton = new JRadioButton(option);
                optionButton.setOpaque(false);
                optionButton.setForeground(AppTheme.TEXT);
                optionButton.setFont(AppTheme.TEXT_FONT.deriveFont(Font.PLAIN, 13f));
                optionButton.setComponentOrientation(ComponentOrientation.RIGHT_TO_LEFT);
                optionButton.setHorizontalAlignment(SwingConstants.RIGHT);
                optionButton.setAlignmentX(Component.RIGHT_ALIGNMENT);
                group.add(optionButton);
                optionButtons.add(optionButton);
                panel.add(optionButton);
                panel.add(Box.createVerticalStrut(4));
            }
        }

        panel.add(Box.createVerticalStrut(10));

        JLabel resultLabel = new JLabel("בחר תשובה ולחץ על 'בדוק תשובה'.");
        resultLabel.setForeground(AppTheme.MUTED);
        resultLabel.setFont(AppTheme.TEXT_FONT.deriveFont(Font.PLAIN, 12f));
        resultLabel.setAlignmentX(Component.RIGHT_ALIGNMENT);
        panel.add(resultLabel);

        panel.add(Box.createVerticalStrut(8));

        JButton checkBtn = AppTheme.primaryButton("בדוק תשובה");
        checkBtn.setAlignmentX(Component.RIGHT_ALIGNMENT);
        checkBtn.addActionListener(e -> {
            String selected = null;
            for (JRadioButton option : optionButtons) {
                if (option.isSelected()) {
                    selected = option.getText();
                    break;
                }
            }

            if (selected == null) {
                resultLabel.setText("בחר אפשרות אחת כדי לבדוק.");
                resultLabel.setForeground(new Color(241, 196, 15));
                return;
            }

            boolean correct = selected.equals(q.getCorrectAnswer());
            if (correct) {
                resultLabel.setText("✓ תשובה נכונה. " + safeText(q.getExplanation()));
                resultLabel.setForeground(new Color(46, 204, 113));
            } else {
                resultLabel.setText("✗ תשובה לא נכונה. תשובה נכונה: " + safeText(q.getCorrectAnswer()) + ". " + safeText(q.getExplanation()));
                resultLabel.setForeground(new Color(231, 76, 60));
            }
        });
        panel.add(checkBtn);

        return panel;
    }

    private JPanel emptyState(String text) {
        JPanel state = new JPanel(new GridBagLayout());
        state.setOpaque(false);
        JLabel label = new JLabel(text);
        label.setForeground(AppTheme.MUTED);
        label.setFont(AppTheme.TEXT_FONT.deriveFont(Font.PLAIN, 14f));
        state.add(label);
        return state;
    }

    private String safeText(String value) {
        return value == null ? "" : value;
    }

    private String escapeHtml(String text) {
        if (text == null) {
            return "";
        }
        return text
            .replace("&", "&amp;")
            .replace("<", "&lt;")
            .replace(">", "&gt;")
            .replace("\"", "&quot;")
            .replace("'", "&#39;");
    }

    private JPanel createFooter() {
        JPanel footer = new JPanel(new FlowLayout(FlowLayout.CENTER));
        footer.setComponentOrientation(ComponentOrientation.RIGHT_TO_LEFT);
        footer.setOpaque(false);
        footer.setBorder(new EmptyBorder(10, 10, 10, 10));

        JLabel status = new JLabel("✓ תוכן מוכן לשימוש");
        status.setForeground(new Color(46, 204, 113));
        status.setFont(AppTheme.TEXT_FONT.deriveFont(Font.BOLD));
        footer.add(status);

        return footer;
    }
}
