package com.cybertraining.ui;

import java.awt.BorderLayout;
import java.awt.Color;
import java.awt.Component;
import java.awt.Dimension;
import java.awt.Font;
import java.awt.GridBagLayout;
import java.awt.FlowLayout;

import javax.swing.Box;
import javax.swing.BoxLayout;
import javax.swing.JButton;
import javax.swing.JFrame;
import javax.swing.JLabel;
import javax.swing.JPanel;

import com.cybertraining.db.DatabaseManager;
import com.cybertraining.model.User;

public class ResultFrame extends JFrame {

    public ResultFrame(DatabaseManager db, User user, int score){

        GradientPanel bg = new GradientPanel(AppTheme.BG, AppTheme.BG2);
        bg.setLayout(new BorderLayout());

        // header with top-right back button
        JPanel header = new JPanel(new FlowLayout(FlowLayout.RIGHT, 12, 12));
        header.setOpaque(false);
        JButton backBtn = AppTheme.backButton("חזרה לדף העיקרי");
        backBtn.addActionListener(e -> new EmployeeHomeFrame(db, user));
        header.add(backBtn);
        bg.add(header, BorderLayout.NORTH);

        JPanel centerPanel = new JPanel(new GridBagLayout());
        centerPanel.setOpaque(false);

        JPanel card = AppTheme.cardPanel();
        card.setLayout(new BoxLayout(card, BoxLayout.Y_AXIS));
        card.setPreferredSize(new Dimension(900, 560));

        JLabel title = new JLabel(score >= 80 ? "🏆 כל הכבוד, עברתם בהצטיינות!" : (score >= 60 ? "👍 כל הכבוד, עברתם!" : "❌ צריך להשתפר, לא עברתם"));
        title.setFont(AppTheme.TITLE);
        title.setForeground(score >= 80 ? new Color(0, 230, 255) : (score >= 60 ? new Color(76, 217, 100) : new Color(255, 42, 122)));
        title.setAlignmentX(Component.CENTER_ALIGNMENT);

        JLabel scoreTitle = new JLabel("הציון שלך:");
        scoreTitle.setFont(AppTheme.SUBTITLE);
        scoreTitle.setForeground(AppTheme.MUTED);
        scoreTitle.setAlignmentX(Component.CENTER_ALIGNMENT);

        JLabel scoreValue = new JLabel(score + "");
        scoreValue.setFont(new Font("Avenir Next", Font.BOLD, 72));
        scoreValue.setForeground(AppTheme.TEXT);
        scoreValue.setAlignmentX(Component.CENTER_ALIGNMENT);
        
        JButton backButton = AppTheme.primaryButton("חזרה לדף העובד");
        backButton.setAlignmentX(Component.CENTER_ALIGNMENT);
        backButton.setMaximumSize(new Dimension(240, 48));
        backButton.addActionListener(e -> new EmployeeHomeFrame(db, user));

        card.add(Box.createVerticalStrut(30));
        card.add(title);
        card.add(Box.createVerticalStrut(20));
        card.add(scoreTitle);
        card.add(Box.createVerticalStrut(10));
        card.add(scoreValue);
        card.add(Box.createVerticalStrut(30));
        card.add(backButton);

        centerPanel.add(card);
        bg.add(centerPanel, BorderLayout.CENTER);

        AppWindow.navigate(bg);
    }
}