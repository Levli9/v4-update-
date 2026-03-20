package com.cybertraining.ui;

import javax.imageio.ImageIO;
import javax.swing.*;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.IOException;
import java.net.URL;

public class BackgroundPanel extends JPanel {

    private BufferedImage image;
    private boolean useGradientFallback = true;

    public BackgroundPanel(String imageUrl) {
        setLayout(new BorderLayout());
        setOpaque(true);
        try {
            if (imageUrl != null && !imageUrl.isEmpty()) {
                if (imageUrl.startsWith("/")) {
                    // load from resources
                    try (java.io.InputStream is = getClass().getResourceAsStream(imageUrl)) {
                        if (is != null) image = ImageIO.read(is);
                    }
                } else if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
                    image = ImageIO.read(new URL(imageUrl));
                }
            }
        } catch (IOException e) {
            image = null;
        }
    }

    @Override
    protected void paintComponent(Graphics g) {
        super.paintComponent(g);
        Graphics2D g2 = (Graphics2D) g.create();
        int w = getWidth();
        int h = getHeight();
        if (image != null) {
            // scale and center cover
            double iw = image.getWidth();
            double ih = image.getHeight();
            double scale = Math.max((double) w / iw, (double) h / ih);
            int iw2 = (int) (iw * scale);
            int ih2 = (int) (ih * scale);
            int x = (w - iw2) / 2;
            int y = (h - ih2) / 2;
            g2.drawImage(image, x, y, iw2, ih2, null);
            // dark overlay to keep UI readable
            g2.setColor(new Color(6, 10, 23, 160));
            g2.fillRect(0, 0, w, h);
        } else if (useGradientFallback) {
            Paint p = AppTheme.backgroundGradient(w, h);
            g2.setPaint(p);
            g2.fillRect(0, 0, w, h);
            // subtle animated noise could be added later
        } else {
            g2.setColor(AppTheme.BG);
            g2.fillRect(0, 0, w, h);
        }
        g2.dispose();
    }
}
