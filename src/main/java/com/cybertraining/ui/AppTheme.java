package com.cybertraining.ui;

import java.awt.Color;
import java.awt.Cursor;
import java.awt.Font;
import java.awt.Dimension;

import javax.swing.JButton;
import javax.swing.JLabel;
import javax.swing.SwingConstants;
import javax.swing.JPanel;
import javax.swing.JPasswordField;
import javax.swing.JTextField;
import javax.swing.border.CompoundBorder;
import javax.swing.border.EmptyBorder;

public class AppTheme {

    public static final Font TITLE = new Font("Avenir Next", Font.BOLD, 24);
    public static final Font SUBTITLE = new Font("Avenir Next", Font.PLAIN, 18);
    public static final Font TEXT_FONT = new Font("Avenir Next", Font.PLAIN, 15);

    public static final Color BG = new Color(13, 10, 25); // Deep dark purple/black
    public static final Color BG2 = new Color(38, 20, 60); // Vibrant dark violet
    public static final String DEFAULT_BACKGROUND_RESOURCE = "/images/background.png";

    public static final Color CARD = new Color(25, 20, 45); // Semi-dark violet card

    public static final Color TEXT = new Color(245, 245, 255);
    public static final Color MUTED = new Color(170, 160, 200);

    public static final Color ACCENT = new Color(0, 230, 255); // Neon Cyan
    public static final Color ACCENT_DARK = new Color(0, 170, 200);
    
    public static final Color SECONDARY_ACCENT = new Color(255, 42, 122); // Neon Pink

    public static final Color PRIMARY = new Color(0, 123, 255);
    public static final Color PRIMARY_HOVER = new Color(0, 150, 255);
    public static final Color INPUT_BG = new Color(240, 240, 240);
    public static final int RADIUS = 10;
    public static final Color BORDER = new Color(200, 200, 200);
    public static final Font SMALL_FONT = new Font("Arial", Font.PLAIN, 12);
    public static final Color SHADOW = new Color(50, 50, 50, 50);
    public static final Color PANEL_2 = new Color(30, 30, 30);
    public static final Font TITLE_FONT = new Font("Arial", Font.BOLD, 18);

    // Standard application frame size (used to keep all frames consistent)
    public static final int FRAME_WIDTH = 1200;
    public static final int FRAME_HEIGHT = 800;

    // Default card size used by most center cards/panels
    public static final int CARD_WIDTH = 1100;
    public static final int CARD_HEIGHT = 650;

    public static JPanel cardPanel(){

        JPanel panel = new JPanel() {
            @Override
            protected void paintComponent(java.awt.Graphics g) {
                java.awt.Graphics2D g2 = (java.awt.Graphics2D) g.create();
                g2.setRenderingHint(java.awt.RenderingHints.KEY_ANTIALIASING, java.awt.RenderingHints.VALUE_ANTIALIAS_ON);
                g2.setColor(getBackground());
                g2.fillRoundRect(0, 0, getWidth(), getHeight(), 30, 30);
                g2.dispose();
            }
        };

        panel.setBackground(CARD);
        panel.setOpaque(false);

        panel.setBorder(new CompoundBorder(
                new RoundedBorder(30, new Color(72, 78, 96), 1),
                new EmptyBorder(26, 28, 26, 28)
        ));

        return panel;
    }

    public static java.awt.Paint backgroundGradient(int width, int height) {
        return new java.awt.GradientPaint(0, 0, BG, width, height, BG2);
    }

    public static JTextField styledTextField(){
        // Use light input background with dark text for readability
        JTextField f = new JTextField();
        f.setBackground(INPUT_BG);
        f.setForeground(Color.BLACK);
        f.setCaretColor(Color.BLACK);
        f.setSelectionColor(ACCENT);
        f.setSelectedTextColor(Color.WHITE);
        f.setFont(TEXT_FONT);
        f.setBorder(new CompoundBorder(
                new RoundedBorder(20, BORDER, 1),
                new EmptyBorder(9, 12, 9, 12)
        ));
        return f;
    }

    public static JPasswordField styledPasswordField(){
        // Light input background with dark text
        JPasswordField f = new JPasswordField();
        f.setBackground(INPUT_BG);
        f.setForeground(Color.BLACK);
        f.setCaretColor(Color.BLACK);
        f.setSelectionColor(ACCENT);
        f.setSelectedTextColor(Color.WHITE);
        f.setFont(TEXT_FONT);
        f.setBorder(new CompoundBorder(
                new RoundedBorder(20, BORDER, 1),
                new EmptyBorder(9, 12, 9, 12)
        ));
        return f;
    }

    public static JButton backButton(String text){

        JButton btn = new JButton(text);

        btn.setFocusPainted(false);
        btn.setContentAreaFilled(false);
        btn.setOpaque(false);
        btn.setForeground(MUTED);
        btn.setFont(new Font("Avenir Next", Font.BOLD, 14));
        btn.setBorder(new EmptyBorder(5, 10, 5, 10));
        btn.setCursor(new Cursor(Cursor.HAND_CURSOR));

        // Let hovered state get brighter
        btn.addMouseListener(new java.awt.event.MouseAdapter() {
            public void mouseEntered(java.awt.event.MouseEvent evt) {
                btn.setForeground(TEXT);
            }
            public void mouseExited(java.awt.event.MouseEvent evt) {
                btn.setForeground(MUTED);
            }
        });

        return btn;
    }

    public static JButton primaryButton(String text){
        AnimatedButton btn = new AnimatedButton(text, PRIMARY, PRIMARY_HOVER, Color.WHITE);
        btn.setFont(new Font("Avenir Next", Font.BOLD, 16));
        btn.setBorder(new CompoundBorder(
            new RoundedBorder(20, PRIMARY.darker(), 1),
            new EmptyBorder(10, 22, 10, 22)
        ));
        return btn;
    }

    public static JButton secondaryButton(String text){
        AnimatedButton btn = new AnimatedButton(text, new Color(40, 40, 50), new Color(60, 60, 70), Color.WHITE);
        btn.setFont(new Font("Avenir Next", Font.BOLD, 15));
        btn.setBorder(new CompoundBorder(
            new RoundedBorder(20, new Color(80, 80, 90), 1),
            new EmptyBorder(10, 22, 10, 22)
        ));
        return btn;
    }

    public static void applyFrameSettings(javax.swing.JFrame frame, String title, int width, int height) {
        frame.setTitle(title);
        frame.setSize(width, height);
        frame.setMinimumSize(new Dimension(width, height));
        frame.setLocationRelativeTo(null);
        frame.setDefaultCloseOperation(javax.swing.JFrame.EXIT_ON_CLOSE);
        try {
            frame.setExtendedState(javax.swing.JFrame.MAXIMIZED_BOTH);
        } catch (Exception ignored) {
        }
    }

    public static void applyDefaultFrame(javax.swing.JFrame frame, String title) {
        // Apply the standard size then maximize so the app fills the user's screen
        applyFrameSettings(frame, title, FRAME_WIDTH, FRAME_HEIGHT);
        try {
            frame.setExtendedState(javax.swing.JFrame.MAXIMIZED_BOTH);
        } catch (Exception ex) {
            // fallback: if extending state isn't supported, keep the default size
        }
    }

    public static JPanel createCardPanel() {
        JPanel panel = new JPanel();
        panel.setBackground(CARD);
        // prefer a larger default card so forms and controls are less cramped
        panel.setPreferredSize(new Dimension(CARD_WIDTH, CARD_HEIGHT));
        return panel;
    }

    public static void applyRTL(java.awt.Container c) {
        if (c == null) return;
        c.setComponentOrientation(java.awt.ComponentOrientation.RIGHT_TO_LEFT);
        for (java.awt.Component comp : c.getComponents()) {
            if (comp instanceof java.awt.Container) applyRTL((java.awt.Container) comp);
        }
    }

    public static JLabel createTitle(String text) {
        JLabel label = new JLabel(text);
        label.setFont(TITLE);
        label.setForeground(TEXT);
        return label;
    }

    public static JLabel createSubtitle(String text) {
        JLabel label = new JLabel(text);
        label.setFont(SUBTITLE);
        label.setForeground(MUTED);
        return label;
    }

    public static JButton createPrimaryButton(String text) {
        JButton button = new JButton(text);
        button.setBackground(PRIMARY);
        button.setForeground(Color.WHITE);
        button.setFont(TEXT_FONT);
        return button;
    }

    public static JButton createGhostButton(String text) {
        JButton button = new JButton(text);
        button.setOpaque(false);
        button.setContentAreaFilled(false);
        button.setBorder(new RoundedBorder(20, PRIMARY, 1));
        button.setForeground(PRIMARY);
        return button;
    }

    public static JLabel createFieldLabel(String text) {
        JLabel label = new JLabel(text);
        label.setFont(TEXT_FONT);
        label.setForeground(TEXT);
        label.setHorizontalAlignment(SwingConstants.RIGHT);
        return label;
    }

    public static JButton createSecondaryButton(String text) {
        JButton button = new JButton(text);
        button.setBackground(SECONDARY_ACCENT);
        button.setForeground(Color.WHITE);
        button.setFont(TEXT_FONT);
        return button;
    }

    public static JTextField createTextField() {
        JTextField field = new JTextField() {
            @Override
            protected void paintComponent(java.awt.Graphics g) {
                java.awt.Graphics2D g2 = (java.awt.Graphics2D) g.create();
                g2.setRenderingHint(java.awt.RenderingHints.KEY_ANTIALIASING, java.awt.RenderingHints.VALUE_ANTIALIAS_ON);
                g2.setColor(getBackground());
                g2.fillRoundRect(0, 0, getWidth(), getHeight(), 20, 20);
                g2.dispose();
                super.paintComponent(g);
            }
        };
        field.setOpaque(false);
        field.setBackground(INPUT_BG);
        field.setBorder(javax.swing.BorderFactory.createCompoundBorder(
            new RoundedBorder(20, BORDER, 1),
            javax.swing.BorderFactory.createEmptyBorder(2, 10, 2, 10)));
        field.setForeground(Color.BLACK);
        field.setFont(TEXT_FONT);
        field.setCaretColor(Color.BLACK);
        field.setSelectionColor(ACCENT);
        field.setSelectedTextColor(Color.WHITE);
        return field;
    }

    public static JPasswordField createPasswordField() {
        JPasswordField field = new JPasswordField() {
            @Override
            protected void paintComponent(java.awt.Graphics g) {
                java.awt.Graphics2D g2 = (java.awt.Graphics2D) g.create();
                g2.setRenderingHint(java.awt.RenderingHints.KEY_ANTIALIASING, java.awt.RenderingHints.VALUE_ANTIALIAS_ON);
                g2.setColor(getBackground());
                g2.fillRoundRect(0, 0, getWidth(), getHeight(), 20, 20);
                g2.dispose();
                super.paintComponent(g);
            }
        };
        field.setOpaque(false);
        field.setBackground(INPUT_BG);
        field.setBorder(javax.swing.BorderFactory.createCompoundBorder(
            new RoundedBorder(20, BORDER, 1),
            javax.swing.BorderFactory.createEmptyBorder(2, 10, 2, 10)));
        field.setForeground(Color.BLACK);
        field.setFont(TEXT_FONT);
        field.setCaretColor(Color.BLACK);
        field.setSelectionColor(ACCENT);
        field.setSelectedTextColor(Color.WHITE);
        return field;
    }
}