package com.cybertraining.ui;

import javax.swing.*;
import java.awt.*;

public class SimpleBarChart extends JPanel {

    private final int[] values;
    private final String[] labels;
    private final Color barColor;

    public SimpleBarChart(int[] values, String[] labels) {
        this(values, labels, AppTheme.PRIMARY);
    }

    public SimpleBarChart(int[] values, String[] labels, Color barColor) {
        this.values = values != null ? values : new int[0];
        this.labels = labels != null ? labels : new String[0];
        this.barColor = barColor;
        setOpaque(false);
        setPreferredSize(new Dimension(280, 160));
    }

    @Override
    protected void paintComponent(Graphics g) {
        super.paintComponent(g);
        Graphics2D g2 = (Graphics2D) g.create();
        g2.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);

        int w = getWidth();
        int h = getHeight();
        int paddingTop = 24;
        int paddingBottom = 30;
        int paddingLeft = 12;
        int paddingRight = 12;

        int plotW = w - paddingLeft - paddingRight;
        int plotH = h - paddingTop - paddingBottom;

        int max = 1;
        for (int v : values) if (v > max) max = v;

        int n = values.length;
        if (n == 0) return;
        int gap = Math.max(6, plotW / (n * 6));
        int barW = (plotW - gap * (n + 1)) / n;

        int x = paddingLeft + gap;

        for (int i = 0; i < n; i++) {
            int val = values[i];
            int barH = Math.round(((float) val / max) * (plotH - 10));
            int y = paddingTop + (plotH - barH);

            // bar background
            g2.setColor(new Color(255,255,255,20));
            g2.fillRoundRect(x, paddingTop, barW, plotH, 8, 8);

            // bar
            g2.setColor(barColor);
            g2.fillRoundRect(x, y, barW, barH, 6, 6);

            // value label above
            g2.setColor(AppTheme.TEXT);
            String vs = String.valueOf(val);
            FontMetrics fm = g2.getFontMetrics(AppTheme.SMALL_FONT);
            int tw = fm.stringWidth(vs);
            g2.setFont(AppTheme.SMALL_FONT);
            g2.drawString(vs, x + (barW - tw) / 2, y - 6);

            // x label below
            String lbl = i < labels.length ? labels[i] : "";
            FontMetrics fm2 = g2.getFontMetrics(AppTheme.SMALL_FONT);
            int tl = fm2.stringWidth(lbl);
            g2.setColor(AppTheme.MUTED);
            g2.drawString(lbl, x + (barW - tl) / 2, paddingTop + plotH + 18);

            x += barW + gap;
        }

        g2.dispose();
    }
}
