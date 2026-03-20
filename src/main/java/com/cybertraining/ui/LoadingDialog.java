package com.cybertraining.ui;

import javax.swing.*;
import java.awt.*;

public class LoadingDialog extends JDialog {

    private final JLabel label;

    public LoadingDialog(Window owner, String message) {
        super(owner, ModalityType.APPLICATION_MODAL);
        setUndecorated(true);
        setSize(220, 90);
        setLocationRelativeTo(owner);
        JPanel p = new JPanel();
        p.setBackground(new Color(0,0,0,160));
        p.setLayout(new BorderLayout(8,8));
        p.setBorder(BorderFactory.createEmptyBorder(12,12,12,12));

        JProgressBar bar = new JProgressBar();
        bar.setIndeterminate(true);
        bar.setPreferredSize(new Dimension(180, 16));

        label = new JLabel(message, SwingConstants.CENTER);
        label.setForeground(Color.WHITE);
        label.setFont(AppTheme.TEXT_FONT);

        p.add(label, BorderLayout.NORTH);
        p.add(bar, BorderLayout.SOUTH);
        setContentPane(p);
    }

    public void setMessage(String msg) {
        label.setText(msg);
    }
}
