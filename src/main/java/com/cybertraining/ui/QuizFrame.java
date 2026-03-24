package com.cybertraining.ui;

import java.awt.BorderLayout;
import java.awt.Color;
import java.awt.Component;
import java.awt.Cursor;
import java.awt.Dimension;
import java.awt.FlowLayout;
import java.awt.Font;
import java.awt.GridBagLayout;
import java.util.List;

import javax.swing.BorderFactory;
import javax.swing.Box;
import javax.swing.BoxLayout;
import javax.swing.ButtonGroup;
import javax.swing.JButton;
import javax.swing.JFrame;
import javax.swing.JLabel;
import javax.swing.JOptionPane;
import javax.swing.JPanel;
import javax.swing.JProgressBar;
import javax.swing.JRadioButton;
import javax.swing.SwingConstants;

import com.cybertraining.db.DatabaseManager;
import com.cybertraining.model.Question;
import com.cybertraining.model.User;
import com.cybertraining.service.QuizService;

public class QuizFrame extends JFrame {

    private QuizService quiz;
    private DatabaseManager db;
    private User user;
    private long quizStartMs;
    private javax.swing.Timer uiTimer;
    private JLabel timerLabel;
    private JProgressBar progressBar;

    private JLabel title;
    private JLabel categoryLabel;
    private JLabel questionLabel;
    private JRadioButton[] options;
    private ButtonGroup group;
    private JLabel[] optionLabels;

    public QuizFrame(DatabaseManager db, User user){

        this.db = db;
        this.user = user;
        List<Question> list = db.getQuestionsForCourse(1);
        quiz = new QuizService(list);

        GradientPanel bg = new GradientPanel(AppTheme.BG, AppTheme.BG2);
        bg.setLayout(new BorderLayout());
        bg.setComponentOrientation(java.awt.ComponentOrientation.RIGHT_TO_LEFT);

        JPanel header = new JPanel(new FlowLayout(FlowLayout.RIGHT, 15, 15));
        header.setComponentOrientation(java.awt.ComponentOrientation.RIGHT_TO_LEFT);
        header.setOpaque(false);
        JButton backButton = AppTheme.backButton("← יציאה מהמבחן");
        backButton.addActionListener(e -> {
            if (uiTimer != null) uiTimer.stop();
            new EmployeeHomeFrame(db, user);
        });
        header.add(backButton);
        bg.add(header, BorderLayout.NORTH);
        // (glow removed per request)

        JPanel centerPanel = new JPanel(new GridBagLayout());
        centerPanel.setComponentOrientation(java.awt.ComponentOrientation.RIGHT_TO_LEFT);
        centerPanel.setOpaque(false);

        JPanel card = AppTheme.cardPanel();
        card.setLayout(new BoxLayout(card, BoxLayout.Y_AXIS));
        card.setComponentOrientation(java.awt.ComponentOrientation.RIGHT_TO_LEFT);
        card.setPreferredSize(new Dimension(1100, 650));

        title = new JLabel("מבחן הסמכה");
        title.setFont(AppTheme.TITLE);
        title.setForeground(AppTheme.TEXT);
        title.setAlignmentX(Component.CENTER_ALIGNMENT);

        title.setHorizontalAlignment(SwingConstants.CENTER);

        progressBar = new JProgressBar(0, Math.max(quiz.getTotalQuestions(), 1));
        progressBar.setValue(0);
        progressBar.setStringPainted(false);
        progressBar.setForeground(AppTheme.ACCENT);
        progressBar.setBackground(new Color(236, 242, 248));
        progressBar.setBorder(BorderFactory.createEmptyBorder());
        progressBar.setPreferredSize(new Dimension(500, 8));
        progressBar.setMaximumSize(new Dimension(500, 8));
        progressBar.setAlignmentX(Component.CENTER_ALIGNMENT);

        categoryLabel = new JLabel();
        categoryLabel.setFont(new Font("Avenir Next", Font.BOLD, 14));
        categoryLabel.setForeground(AppTheme.ACCENT);
        categoryLabel.setAlignmentX(Component.CENTER_ALIGNMENT);
        categoryLabel.setHorizontalAlignment(SwingConstants.CENTER);
        categoryLabel.setBorder(BorderFactory.createCompoundBorder(
            new RoundedBorder(16, AppTheme.ACCENT, 1),
            BorderFactory.createEmptyBorder(4, 12, 4, 12)
        ));

        questionLabel = new JLabel();
        questionLabel.setFont(AppTheme.SUBTITLE);
        questionLabel.setForeground(AppTheme.TEXT);
        questionLabel.setAlignmentX(Component.CENTER_ALIGNMENT);
        questionLabel.setHorizontalAlignment(SwingConstants.RIGHT);

        options = new JRadioButton[4];
        optionLabels = new JLabel[4];
        group = new ButtonGroup();
        JPanel optionsPanel = new JPanel();
        optionsPanel.setLayout(new BoxLayout(optionsPanel, BoxLayout.Y_AXIS));
        optionsPanel.setOpaque(false);
        optionsPanel.setBorder(BorderFactory.createEmptyBorder(20, 0, 20, 0));
        optionsPanel.setAlignmentX(Component.RIGHT_ALIGNMENT);

        for (int i = 0; i < 4; i++) {
            options[i] = new JRadioButton();
            options[i].setFont(AppTheme.TEXT_FONT);
            options[i].setForeground(AppTheme.TEXT);
            options[i].setOpaque(false);
            options[i].setFocusPainted(false);
            options[i].setCursor(new Cursor(Cursor.HAND_CURSOR));
            options[i].setText(""); // icon only
            options[i].setComponentOrientation(java.awt.ComponentOrientation.LEFT_TO_RIGHT);
            group.add(options[i]);

            optionLabels[i] = new JLabel();
            optionLabels[i].setFont(AppTheme.TEXT_FONT);
            optionLabels[i].setForeground(AppTheme.TEXT);
            optionLabels[i].setHorizontalAlignment(SwingConstants.RIGHT);
            optionLabels[i].setVerticalAlignment(SwingConstants.CENTER);
            optionLabels[i].setOpaque(false);
            // wide enough for full Hebrew answer sentences on one line
            optionLabels[i].setPreferredSize(new Dimension(700, 30));
            optionLabels[i].setMaximumSize(new Dimension(900, 60));

            // row: radio on the RIGHT (first) and label to its LEFT — so Hebrew text starts at the right edge
            JPanel row = new JPanel(new java.awt.BorderLayout());
            row.setOpaque(false);
            row.setAlignmentX(Component.RIGHT_ALIGNMENT);
            // place the radio at the right side
            row.add(options[i], java.awt.BorderLayout.EAST);
            // label fills remaining space and is right-aligned; add right padding so it doesn't touch the radio
            optionLabels[i].setBorder(new javax.swing.border.EmptyBorder(0,0,0,12));
            row.add(optionLabels[i], java.awt.BorderLayout.CENTER);

            optionsPanel.add(row);
            optionsPanel.add(Box.createVerticalStrut(8));
        }

        JPanel actionsPanel = new JPanel(new FlowLayout(FlowLayout.CENTER, 15, 0));
        actionsPanel.setOpaque(false);

        JButton skipButton = AppTheme.secondaryButton("דלג על השאלה");
        skipButton.setPreferredSize(new Dimension(160, 44));
        skipButton.addActionListener(e -> skip());

        JButton finishButton = AppTheme.secondaryButton("סיים מבחן");
        finishButton.setPreferredSize(new Dimension(160, 44));
        finishButton.addActionListener(e -> {
            int opt = javax.swing.JOptionPane.showConfirmDialog(
                    AppWindow.get(),
                    "אתה בטוח שברצונך לסיים את המבחן עכשיו?",
                    "אישור סיום מבחן",
                    javax.swing.JOptionPane.YES_NO_OPTION);
            if (opt == javax.swing.JOptionPane.YES_OPTION) {
                finishExam();
            }
        });

        JButton nextButton = AppTheme.primaryButton("שאלה הבאה");
        nextButton.setPreferredSize(new Dimension(160, 44));
        nextButton.addActionListener(e -> next());

        actionsPanel.add(skipButton);
        actionsPanel.add(finishButton);
        actionsPanel.add(nextButton);

        JPanel progressFrame = new RoundedPanel(AppTheme.CARD, 18, 0);
        progressFrame.setOpaque(false);
        progressFrame.setLayout(new BoxLayout(progressFrame, BoxLayout.Y_AXIS));
        progressFrame.setBorder(BorderFactory.createCompoundBorder(
            new RoundedBorder(18, AppTheme.BORDER, 1),
            BorderFactory.createEmptyBorder(8, 14, 8, 14)
        ));
        progressFrame.setAlignmentX(Component.CENTER_ALIGNMENT);
        progressFrame.setMaximumSize(new Dimension(590, 40));

        progressFrame.add(progressBar);

        card.add(Box.createVerticalStrut(10));
        card.add(title);
        card.add(Box.createVerticalStrut(15));
        card.add(categoryLabel);
        card.add(Box.createVerticalStrut(20));
        card.add(questionLabel);
        card.add(Box.createVerticalStrut(10));
        // wrap optionsPanel in a right-aligned container so the whole block is flush to the right
        JPanel optionsWrapper = new JPanel(new FlowLayout(FlowLayout.RIGHT, 0, 0));
        optionsWrapper.setOpaque(false);
        optionsPanel.setAlignmentX(Component.RIGHT_ALIGNMENT);
        optionsPanel.setPreferredSize(new Dimension(750, optionsPanel.getPreferredSize().height));
        optionsWrapper.add(optionsPanel);
        card.add(optionsWrapper);
        card.add(Box.createVerticalStrut(15));
        card.add(actionsPanel);

        centerPanel.add(card);
        bg.add(centerPanel, BorderLayout.CENTER);

        // timer label showing elapsed time
        timerLabel = new JLabel("זמן: 00:00:00");
        timerLabel.setFont(AppTheme.SMALL_FONT);
        timerLabel.setForeground(AppTheme.MUTED);
        timerLabel.setAlignmentX(Component.CENTER_ALIGNMENT);

        card.add(Box.createVerticalStrut(10));
        card.add(timerLabel);
        card.add(Box.createVerticalStrut(14));
        card.add(progressFrame);
        card.add(Box.createVerticalStrut(10));

        centerPanel.add(card);
        bg.add(centerPanel, BorderLayout.CENTER);

        AppWindow.navigate(bg);
        quizStartMs = System.currentTimeMillis();
        uiTimer = new javax.swing.Timer(1000, e -> updateTimer());
        uiTimer.start();

        loadQuestion();
    }

    private void loadQuestion(){
        Question q = quiz.getCurrentQuestion();
        title.setText("שאלה " + (quiz.getCurrentIndex() + 1) + " מתוך " + quiz.getTotalQuestions());
        updateProgress();
        
        String cat = q.getCategory() != null ? q.getCategory() : "כללי";
        categoryLabel.setText("קטגוריה: " + cat);
        
        Color catColor = AppTheme.ACCENT;
        if (cat.contains("פישינג")) catColor = new Color(0, 230, 255); // Neon Cyan
        else if (cat.contains("הנדסה")) catColor = new Color(255, 150, 0); // Neon Orange
        else if (cat.contains("סיסמאות")) catColor = new Color(0, 255, 128); // Neon Green
        else if (cat.contains("פיזית")) catColor = new Color(190, 40, 255); // Neon Purple
        else if (cat.contains("זדוניות")) catColor = new Color(255, 42, 122); // Neon Pink
        else if (cat.contains("גלישה")) catColor = new Color(0, 255, 200); // Neon Teal
        else if (cat.contains("ניהול")) catColor = new Color(255, 255, 0); // Neon Yellow

        categoryLabel.setForeground(catColor);
        categoryLabel.setBorder(BorderFactory.createCompoundBorder(
            new RoundedBorder(16, catColor, 2),
            BorderFactory.createEmptyBorder(6, 16, 6, 16)
        ));
        
        // Convert rgb to hex for html rendering of the text if needed, or just let it remain centered
        String hexColor = String.format("#%02x%02x%02x", catColor.getRed(), catColor.getGreen(), catColor.getBlue());
        questionLabel.setText("<html><div style='text-align: center; color: " + hexColor + ";'>" + q.getQuestion() + "</div></html>");
        
        String[] ans = q.getAnswers();
        for(int i = 0; i < 4; i++){
            String safe = ans[i] != null ? ans[i] : "";
            // preserve words and let the label wrap naturally at word boundaries
            String html = "<html><div dir='rtl' style='text-align:right; white-space:nowrap;'>" + safe + "</div></html>";
            optionLabels[i].setText(html);
            options[i].setSelected(false);
            options[i].setForeground(AppTheme.TEXT);
        }
    }

    private void skip(){
        if(quiz.hasNextQuestion()){
            quiz.nextQuestion();
            loadQuestion();
            group.clearSelection();
        } else {
            // save result to DB so dashboard can reflect it
            com.cybertraining.model.Course course = null;
            java.util.List<com.cybertraining.model.Course> courses = db.getCourses();
            if (courses != null && !courses.isEmpty()) course = courses.get(0);
            long duration = (System.currentTimeMillis() - quizStartMs) / 1000;
            com.cybertraining.model.Result res = new com.cybertraining.model.Result(user, course, quiz.getScore(), duration);
            db.saveResult(res);
            if (uiTimer != null) uiTimer.stop();
            // open result screen
            new ResultFrame(db, user, quiz.getScore());
        }
    }

    private void next(){
        int selected = -1;
        for(int i = 0; i < 4; i++){
            if(options[i].isSelected()){
                selected = i;
                break;
            }
        }

        if(selected == -1){
            JOptionPane.showMessageDialog(AppWindow.get(), "אנא בחר תשובה או לחץ על דלג'");
            return;
        }

        quiz.submitAnswer(selected);

        if(quiz.hasNextQuestion()){
            quiz.nextQuestion();
            loadQuestion();
            group.clearSelection();
        } else {
            if (uiTimer != null) uiTimer.stop();
            new ResultFrame(db, user, quiz.getScore());
        }
    }

    private void finishExam() {
        // Persist current state and score to DB and show result
        int score = quiz.getScore();
        com.cybertraining.model.Course course = null;
        java.util.List<com.cybertraining.model.Course> courses = db.getCourses();
        if (courses != null && !courses.isEmpty()) course = courses.get(0);
        long durationSec = (System.currentTimeMillis() - quizStartMs) / 1000;
        com.cybertraining.model.Result res = new com.cybertraining.model.Result(user, course, score, durationSec);
        db.saveResult(res);
        if (uiTimer != null) uiTimer.stop();
        new ResultFrame(db, user, score);
    }
    
    private void updateTimer() {
        long elapsed = System.currentTimeMillis() - quizStartMs;
        long s = elapsed / 1000;
        long hrs = s / 3600;
        long mins = (s % 3600) / 60;
        long secs = s % 60;
        timerLabel.setText(String.format("זמן: %02d:%02d:%02d", hrs, mins, secs));
    }

    private void updateProgress() {
        int total = Math.max(quiz.getTotalQuestions(), 1);
        int current = Math.min(quiz.getCurrentIndex() + 1, total);

        progressBar.setMaximum(total);
        progressBar.setValue(current);
    }

}