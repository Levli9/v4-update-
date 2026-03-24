package com.cybertraining.ui;

import java.awt.BorderLayout;
import java.awt.FlowLayout;
import java.util.ArrayList;
import java.util.List;

import javax.swing.Box;
import javax.swing.JButton;
import javax.swing.JEditorPane;
import javax.swing.JFrame;
import javax.swing.JLabel;
import javax.swing.JPanel;
import javax.swing.JScrollPane;
import javax.swing.SwingConstants;
import javax.swing.border.EmptyBorder;

import com.cybertraining.db.DatabaseManager;
import com.cybertraining.model.User;

public class GeneratedContentFrame extends JFrame {

    public void updateVideoStatus(int slideIndex, String status, String newVidUrl) {
        javax.swing.SwingUtilities.invokeLater(() -> {
            if (newVidUrl != null) {
                slideVideos.set(slideIndex, newVidUrl);
                if (current == slideIndex) {
                    showSlide();
                }
            } else {
                if (current == slideIndex) {
                    contentArea.setText(htmlWrap("<h1 style='color:#54A0FF; text-align:center;'>🎬 סרטון בהכנה...</h1><br><h2 style='text-align:center; color:#FFD700;'>" + status + "</h2><p style='text-align:center; color:#aaa; font-size:14px;'>(תוכלו לסגור את המצגת או לחזור אחורה בינתיים)</p>"));
                }
            }
        });
    }

    private List<String> slides = new ArrayList<>();
    private List<String> slideVideos = new ArrayList<>(); // video URI per slide (null = no video)
    private int current = 0;
    private JEditorPane contentArea;
    private JLabel progressLabel;
    private JButton prev;
    private JButton next;
    private JButton closeBtn;
    private JPanel videoContainer; // inline video area below slide text
    private JScrollPane scrollPane; // text scroll pane
    private JPanel centerPanel; // main content panel

    public GeneratedContentFrame(List<String> generatedSlides, List<String> generatedVideos) {
        this.slides = generatedSlides;
        this.slideVideos = generatedVideos;

        GradientPanel bg = new GradientPanel(AppTheme.BG, AppTheme.BG2);
        bg.setLayout(new BorderLayout());
        bg.setComponentOrientation(java.awt.ComponentOrientation.RIGHT_TO_LEFT);

        JPanel header = new JPanel(new BorderLayout());
        header.setComponentOrientation(java.awt.ComponentOrientation.RIGHT_TO_LEFT);
        header.setOpaque(false);
        header.setBorder(new EmptyBorder(15, 15, 15, 15));

        JButton backButton = AppTheme.backButton("← סגור");
        backButton.addActionListener(e -> {
            dispose();
        });
        
        JPanel rightHeader = new JPanel(new FlowLayout(FlowLayout.RIGHT, 0, 0));
        rightHeader.setOpaque(false);
        rightHeader.add(backButton);
        
        header.add(rightHeader, BorderLayout.EAST);

        JLabel title = new JLabel("תוכן מותאם אישית");
        title.setForeground(AppTheme.TEXT);
        title.setFont(AppTheme.TITLE);
        title.setHorizontalAlignment(SwingConstants.CENTER);
        header.add(title, BorderLayout.CENTER);

        bg.add(header, BorderLayout.NORTH);

        centerPanel = new JPanel(new BorderLayout());
        centerPanel.setComponentOrientation(java.awt.ComponentOrientation.RIGHT_TO_LEFT);
        centerPanel.setOpaque(false);
        centerPanel.setBorder(new EmptyBorder(10, 40, 20, 40));

        contentArea = new JEditorPane();
        contentArea.setComponentOrientation(java.awt.ComponentOrientation.RIGHT_TO_LEFT);
        contentArea.setContentType("text/html");
        contentArea.setEditable(false);
        contentArea.setBackground(AppTheme.CARD);
        contentArea.setForeground(AppTheme.TEXT);
        contentArea.setBorder(new EmptyBorder(30, 30, 30, 30));

        scrollPane = new JScrollPane(contentArea);
        scrollPane.setComponentOrientation(java.awt.ComponentOrientation.RIGHT_TO_LEFT);
        scrollPane.setBorder(AppTheme.cardPanel().getBorder());
        scrollPane.setBackground(AppTheme.BG);
        scrollPane.getViewport().setBackground(AppTheme.CARD);

        // Inline video container (disabled for now)
        videoContainer = new JPanel(new BorderLayout());
        videoContainer.setBackground(java.awt.Color.BLACK);
        videoContainer.setVisible(false);

        // Default: text fills everything
        centerPanel.add(scrollPane, BorderLayout.CENTER);
        bg.add(centerPanel, BorderLayout.CENTER);

        JPanel nav = new JPanel(new BorderLayout());
        nav.setComponentOrientation(java.awt.ComponentOrientation.RIGHT_TO_LEFT);
        nav.setOpaque(false);
        nav.setBorder(new EmptyBorder(10, 40, 30, 40));

        progressLabel = new JLabel();
        progressLabel.setForeground(AppTheme.MUTED);
        progressLabel.setFont(AppTheme.TEXT_FONT);
        progressLabel.setHorizontalAlignment(SwingConstants.CENTER);

        JPanel buttonsPanel = new JPanel(new FlowLayout(FlowLayout.CENTER, 20, 0));
        buttonsPanel.setComponentOrientation(java.awt.ComponentOrientation.RIGHT_TO_LEFT);
        buttonsPanel.setOpaque(false);

        prev = AppTheme.secondaryButton("שקף קודם");
        next = AppTheme.primaryButton("שקף הבא");
        closeBtn = AppTheme.primaryButton("סגור");

        prev.addActionListener(e -> prev());
        next.addActionListener(e -> next());
        closeBtn.addActionListener(e -> {
            dispose();
        });

        buttonsPanel.add(prev);
        buttonsPanel.add(closeBtn);
        buttonsPanel.add(next);

        nav.add(progressLabel, BorderLayout.NORTH);
        nav.add(Box.createVerticalStrut(15), BorderLayout.CENTER);
        nav.add(buttonsPanel, BorderLayout.SOUTH);

        bg.add(nav, BorderLayout.SOUTH);

        // Set up the frame as a popup window
        setTitle("תוכן מותאם");
        setSize(1200, 800);
        setExtendedState(JFrame.MAXIMIZED_BOTH);
        setLocationRelativeTo(null);
        setDefaultCloseOperation(JFrame.DISPOSE_ON_CLOSE);
        setContentPane(bg);
        setVisible(true);

        current = 0;
        showSlide();
    }

    private String htmlWrap(String content) {
        return "<html><body dir='rtl' style='font-family: Arial, sans-serif; font-size: 16px; color: #E6E8EE; line-height: 1.6;'>" + content + "</body></html>";
    }

    private void showSlide(){
        contentArea.setText(htmlWrap(slides.get(current)));
        contentArea.setCaretPosition(0);

        progressLabel.setText("שקף " + (current + 1) + " מתוך " + slides.size());

        prev.setVisible(current > 0);
        next.setVisible(current < slides.size() - 1);
        closeBtn.setVisible(current == slides.size() - 1);

        // Determine if this is a video slide
        String vid = (current < slideVideos.size()) ? slideVideos.get(current) : null;
        boolean isVideoSlide = (vid != null && !vid.isEmpty() && !vid.equals("LOADING"));
        boolean isLoadingSlide = (vid != null && vid.equals("LOADING"));

        // Stop any active video
        stopActiveVideo();

        // Swap layout: video slides get small title + big video, text slides get full text
        centerPanel.removeAll();
        videoContainer.removeAll();
        videoContainer.setVisible(false);

        if (isVideoSlide) {
            scrollPane.setPreferredSize(new java.awt.Dimension(0, 100));
            centerPanel.add(scrollPane, BorderLayout.NORTH);
            centerPanel.add(videoContainer, BorderLayout.CENTER);
            embedInlineVideo(vid);
        } else if (isLoadingSlide) {
            scrollPane.setPreferredSize(null);
            centerPanel.add(scrollPane, BorderLayout.CENTER);
            contentArea.setText(htmlWrap("<h1 style='color:#54A0FF; text-align:center;'>🎬 החלונית ממתינה לסרטון...</h1><p style='text-align:center; color:#aaa;'>(הסרטון עדיין בהפקה במערכת, אפשר לחכות פה)</p>"));
        } else {
            scrollPane.setPreferredSize(null);
            centerPanel.add(scrollPane, BorderLayout.CENTER);
        }

        // Force layout refresh
        centerPanel.revalidate();
        centerPanel.repaint();
    }

    private void next(){
        if(current < slides.size() - 1){
            current++;
            showSlide();
        }
    }

    private void prev(){
        if(current > 0){
            current--;
            showSlide();
        }
    }

    private VideoPlayerPanel currentPlayer = null;

    private void stopActiveVideo() {
        if (currentPlayer != null) {
            currentPlayer.stop();
            currentPlayer = null;
        }
        videoContainer.removeAll();
    }

    private void embedInlineVideo(String vid) {
        currentPlayer = new VideoPlayerPanel(vid);
        videoContainer.add(currentPlayer, BorderLayout.CENTER);
        videoContainer.revalidate();
        videoContainer.setVisible(true);
        currentPlayer.play();
    }
}
