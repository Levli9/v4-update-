package com.cybertraining.ui;

import javax.swing.*;
import java.awt.*;
import java.awt.geom.Point2D;
import java.awt.RadialGradientPaint;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;

public class LogoPanel extends JPanel {

    private float angle = 0f;
    private float scale = 1f;
    private final Timer timer;

    public LogoPanel() {
        setOpaque(false);
        setPreferredSize(new Dimension(180, 180));

        timer = new Timer(16, new ActionListener() {
            private int t = 0;

            @Override
            public void actionPerformed(ActionEvent e) {
                t++;
                angle += 0.02f;
                // pulse scale between 0.95 and 1.05
                scale = 1f + 0.05f * (float) Math.sin(t * 0.06);
                repaint();
            }
        });
    }

    public void start() {
        timer.start();
    }

    public void stop() {
        timer.stop();
    }

    @Override
    protected void paintComponent(Graphics g) {
        super.paintComponent(g);
        Graphics2D g2 = (Graphics2D) g.create();
        g2.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);

        int w = getWidth();
        int h = getHeight();
        int size = Math.min(w, h);

        g2.translate(w / 2.0, h / 2.0);
        g2.scale(scale, scale);
        g2.rotate(angle);

        // draw circular gradient emblem
        int r = size - 20;
        Shape circle = new java.awt.geom.Ellipse2D.Double(-r/2.0, -r/2.0, r, r);
        Point2D center = new Point2D.Float(0, 0);
        float[] dist = {0f, 1f};
        Color[] colors = {AppTheme.PRIMARY, AppTheme.PRIMARY_HOVER};
        RadialGradientPaint p = new RadialGradientPaint(center, r/2f, dist, colors);
        g2.setPaint(p);
        g2.fill(circle);

        // draw inner shield shape
        g2.setColor(AppTheme.PANEL_2);
        int sx = r/2 - 10;
        java.awt.Polygon shield = new java.awt.Polygon();
        shield.addPoint(0, -sx/2);
        shield.addPoint(sx/2, 0);
        shield.addPoint(0, sx/2);
        shield.addPoint(-sx/2, 0);
        g2.fill(shield);

        // draw small accent
        g2.setColor(AppTheme.ACCENT);
        int dot = Math.max(6, r/12);
        g2.fillOval(-r/4, -r/4, dot, dot);

        // draw product name beneath (rotated back)
        g2.rotate(-angle);
        g2.scale(1/scale, 1/scale);
        g2.translate(0, r/2 + 12);
        g2.setFont(AppTheme.TITLE_FONT.deriveFont(Font.BOLD, 18f));
        g2.setColor(AppTheme.ACCENT);
        String name = "הדרכת סייבר";
        FontMetrics fm = g2.getFontMetrics();
        int tw = fm.stringWidth(name);
        g2.drawString(name, -tw/2, 0);

        g2.dispose();
    }
}
