package com.cybertraining.ui;

import javax.swing.*;
import java.awt.*;

public class GradientPanel extends JPanel {

    private Color c1;
    private Color c2;

    public GradientPanel(Color c1, Color c2){
        this.c1 = c1;
        this.c2 = c2;
        setOpaque(false);
    }

    @Override
    protected void paintComponent(Graphics g){

        super.paintComponent(g);

        Graphics2D g2 = (Graphics2D) g.create();

        GradientPaint gp = new GradientPaint(
                0,0,c1,
                0,getHeight(),c2
        );

        g2.setPaint(gp);
        g2.fillRect(0,0,getWidth(),getHeight());

        g2.dispose();
    }
}