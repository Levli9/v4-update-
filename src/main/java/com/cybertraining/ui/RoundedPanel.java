package com.cybertraining.ui;

import javax.swing.*;
import java.awt.*;

public class RoundedPanel extends JPanel {

    private final Color bg;
    private final int radius;
    private final int shadowSize;

    public RoundedPanel(Color bg, int radius, int shadowSize) {
        this.bg = bg;
        this.radius = radius;
        this.shadowSize = shadowSize;
        setOpaque(false);
    }

    @Override
    protected void paintComponent(Graphics g) {
        Graphics2D g2 = (Graphics2D) g.create();
        g2.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);

        int w = getWidth();
        int h = getHeight();

        // draw shadow
        if (shadowSize > 0) {
            g2.setColor(AppTheme.SHADOW);
            g2.fillRoundRect(shadowSize/2, shadowSize/2, w - shadowSize, h - shadowSize, radius, radius);
        }

        // draw background rounded rect
        g2.setColor(bg);
        g2.fillRoundRect(0, 0, w - shadowSize, h - shadowSize, radius, radius);

        g2.dispose();
        super.paintComponent(g);
    }
}
