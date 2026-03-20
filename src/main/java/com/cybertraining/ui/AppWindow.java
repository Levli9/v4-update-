package com.cybertraining.ui;

import javax.swing.*;

/**
 * Singleton persistent application window.
 * All screens swap the content-pane of this one JFrame instead of
 * opening/closing separate windows, which eliminates the visual jump
 * (flash/animation) between screens on macOS and other platforms.
 */
public class AppWindow {

    private static JFrame frame;

    public static JFrame get() {
        if (frame == null) {
            frame = new JFrame();
            AppTheme.applyDefaultFrame(frame, "מערכת הדרכת סייבר");
            frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        }
        return frame;
    }

    /**
     * Replace the visible content with {@code content} without creating a
     * new OS-level window.  Auto-shows the window on first call.
     */
    public static void navigate(JPanel content) {
        JFrame f = get();
        f.setContentPane(content);
        f.revalidate();
        f.repaint();
        if (!f.isVisible()) {
            f.setVisible(true);
        }
    }
}
