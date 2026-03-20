package com.cybertraining.ui;

import javax.swing.JPanel;
import java.awt.Color;
import java.awt.Graphics;
import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.awt.Font;
import java.util.Map;


public class SimpleChartPanel extends JPanel {

    public enum Type { PIE, BAR }

    private Type type;
    private Map<String, Integer> data;
    private Color[] palette = new Color[]{AppTheme.ACCENT, AppTheme.SECONDARY_ACCENT, new Color(0xF08A5D), new Color(0xF6D55C), new Color(0x3FBF7F)};

    public SimpleChartPanel(Type type, Map<String,Integer> data) {
        this.type = type;
        this.data = data;
        setOpaque(false);
    }

    public void updateData(Map<String, Integer> newData) {
        this.data = newData;
        repaint();
    }

    @Override
    protected void paintComponent(Graphics g) {
        super.paintComponent(g);
        Graphics2D g2 = (Graphics2D) g.create();
        g2.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);

        int w = getWidth();
        int h = getHeight();

        if (data == null || data.isEmpty()) {
            g2.setColor(new Color(255,255,255,20));
            g2.fillRoundRect(10, 10, Math.max(30, w-20), Math.max(30, h-20), 6, 6);
            g2.setFont(new Font("SansSerif", Font.PLAIN, 12));
            g2.setColor(new Color(255,255,255,120));
            g2.drawString("אין נתונים", 20, 30);
            g2.dispose();
            return;
        }

        if (type == Type.PIE) drawPie(g2, w, h);
        else drawBar(g2, w, h);

        g2.dispose();
    }

    private void drawPie(Graphics2D g2, int w, int h) {
        int size = Math.min(w, h) - 20;
        int cx = (w - size) / 2;
        int cy = (h - size) / 2;

        int total = data.values().stream().mapToInt(Integer::intValue).sum();
        if (total <= 0) return;
        double start = 0.0;
        int i = 0;
        for (Map.Entry<String,Integer> e : data.entrySet()) {
            double ang = (e.getValue() * 360.0) / total;
            g2.setColor(palette[i % palette.length]);
            g2.fillArc(cx, cy, size, size, (int) Math.round(start), (int) Math.round(ang));
            start += ang;
            i++;
        }

        // Draw legend
        int lx = Math.max(cx + size + 8, w - 140);
        int ly = cy - 8;
        i = 0;
        g2.setFont(new Font("SansSerif", Font.PLAIN, 11));
        for (Map.Entry<String,Integer> e : data.entrySet()) {
            g2.setColor(palette[i % palette.length]);
            g2.fillRect(lx, ly + i*18, 12, 12);
            g2.setColor(new Color(255,255,255,200));
            g2.drawString(e.getKey() + " (" + e.getValue() + ")", lx + 18, ly + 10 + i*18);
            i++;
        }
    }

    private void drawBar(Graphics2D g2, int w, int h) {
        int margin = 18;
        int chartW = w - 2*margin;
        int chartH = h - 2*margin - 20;
        int bx = margin;
        int by = margin + 20;

        int total = data.values().stream().mapToInt(Integer::intValue).sum();
        int bars = data.size();
        if (bars == 0) return;
        int barW = Math.max(8, chartW / (bars * 2));

        int i = 0;
        g2.setFont(new Font("SansSerif", Font.PLAIN, 12));
        for (Map.Entry<String,Integer> e : data.entrySet()) {
            double frac = total == 0 ? 0 : (e.getValue() / (double) total);
            int hbar = (int) Math.round(frac * chartH);
            int x = bx + i * (barW * 2);
            int y = by + (chartH - hbar);
            g2.setColor(palette[i % palette.length]);
            g2.fillRect(x, y, barW, hbar);
            g2.setColor(new Color(255,255,255,200));
            g2.drawString(e.getKey(), x, by + chartH + 16);
            i++;
        }
    }
}
