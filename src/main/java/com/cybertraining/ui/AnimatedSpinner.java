package com.cybertraining.ui;

import java.awt.Color;
import java.awt.Dimension;
import java.awt.Graphics;
import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.awt.geom.Arc2D;
import java.awt.geom.Ellipse2D;
import javax.swing.JPanel;
import javax.swing.Timer;

/**
 * Simple animated spinner with fading arcs and a subtle inner glow.
 */
public class AnimatedSpinner extends JPanel {

    private double angle = 0.0;
    private Timer timer;
    private Color primary = new Color(0, 230, 255);

    public AnimatedSpinner(int size) {
        setOpaque(false);
        setPreferredSize(new Dimension(size, size));
        setMinimumSize(new Dimension(size, size));

        timer = new Timer(30, e -> {
            angle += Math.PI / 60.0;
            if (angle > Math.PI * 2) angle -= Math.PI * 2;
            repaint();
        });
        timer.start();
    }

    @Override
    protected void paintComponent(Graphics g) {
        super.paintComponent(g);
        Graphics2D g2 = (Graphics2D) g.create();
        g2.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);

        int w = getWidth();
        int h = getHeight();
        int cx = w / 2;
        int cy = h / 2;
        int r = Math.min(w, h) / 2 - 2;

        // draw several arc segments with decreasing alpha
        int segments = 12;
        double segAngle = 360.0 / segments;
        for (int i = 0; i < segments; i++) {
            double a = Math.toRadians(i * segAngle) + angle;
            float alpha = (float) ((i + 1) / (float) segments);
            Color c = new Color(primary.getRed(), primary.getGreen(), primary.getBlue(), Math.min(255, (int) (alpha * 255)));
            g2.setColor(c);
            double start = Math.toDegrees(a);
            Arc2D arc = new Arc2D.Double(cx - r, cy - r, r * 2, r * 2, start, segAngle * 0.9, Arc2D.OPEN);
            g2.setStroke(new java.awt.BasicStroke(Math.max(2, r / 6)));
            g2.draw(arc);
        }

        // inner glowing dot that moves slightly
        double glowX = cx + Math.cos(angle * 1.5) * (r * 0.35);
        double glowY = cy + Math.sin(angle * 1.5) * (r * 0.35);
        int dotR = Math.max(6, r / 6);
        Ellipse2D dot = new Ellipse2D.Double(glowX - dotR / 2.0, glowY - dotR / 2.0, dotR, dotR);
        g2.setColor(new Color(primary.getRed(), primary.getGreen(), primary.getBlue(), 200));
        g2.fill(dot);

        g2.dispose();
    }

    public void stop() {
        if (timer != null) timer.stop();
    }
}
