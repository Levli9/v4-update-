package com.cybertraining.ui;

import javax.swing.*;
import java.awt.*;
import java.awt.event.MouseAdapter;
import java.awt.event.MouseEvent;
import javax.swing.Timer;

public class AnimatedButton extends JButton {

    private Color targetBg;
    private Timer animator;
    private int animStep = 0;
    private final int STEPS = 8;

    public AnimatedButton(String text, Color baseBg, Color hoverBg, Color fg) {
        super(text);
        this.targetBg = hoverBg;
        setBackground(baseBg);
        setForeground(fg);
        setFocusPainted(false);
        setContentAreaFilled(false);
        setOpaque(false);
        setCursor(new Cursor(Cursor.HAND_CURSOR));

        addMouseListener(new MouseAdapter() {
            @Override
            public void mouseEntered(MouseEvent e) {
                animateTo(targetBg);
            }

            @Override
            public void mouseExited(MouseEvent e) {
                animateTo(baseBg);
            }
        });
    }

    @Override
    protected void paintComponent(Graphics g) {
        Graphics2D g2 = (Graphics2D) g.create();
        g2.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        g2.setColor(getBackground());
        g2.fillRoundRect(0, 0, getWidth(), getHeight(), 20, 20);
        g2.dispose();
        super.paintComponent(g);
    }

    private void animateTo(Color dest) {
        Color start = getBackground();
        if (animator != null && animator.isRunning()) animator.stop();
        animStep = 0;
        animator = new Timer(12, ev -> {
            animStep++;
            float t = Math.min(1f, animStep / (float) STEPS);
            int r = (int) (start.getRed() + t * (dest.getRed() - start.getRed()));
            int g = (int) (start.getGreen() + t * (dest.getGreen() - start.getGreen()));
            int b = (int) (start.getBlue() + t * (dest.getBlue() - start.getBlue()));
            setBackground(new Color(r, g, b));
            if (t >= 1f) ((Timer) ev.getSource()).stop();
        });
        animator.start();
    }
}
