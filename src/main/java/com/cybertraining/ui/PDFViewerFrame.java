package com.cybertraining.ui;

import java.awt.BorderLayout;
import java.awt.Color;
import java.awt.Component;
import java.awt.Dimension;
import java.awt.FlowLayout;
import java.io.File;
import java.io.IOException;

import javax.swing.Box;
import javax.swing.BoxLayout;
import javax.swing.JButton;
import javax.swing.JLabel;
import javax.swing.JPanel;
import javax.swing.SwingConstants;
import javax.swing.border.EmptyBorder;

public class PDFViewerFrame extends JPanel {
    private static boolean javafxInitialized = false;
    
    static {
        // בדוק אם JavaFX כבר אותחל
        if (!javafxInitialized) {
            try {
                javafx.application.Platform.startup(() -> {
                    // Empty startup
                });
                javafxInitialized = true;
                System.out.println("✅ JavaFX initialized once");
            } catch (Exception ex) {
                System.err.println("⚠️  JavaFX already initialized: " + ex.getMessage());
                javafxInitialized = true;
            }
        }
    }
    
    private String pdfPath;
    private String videoPath;
    private int currentScreen = 0; // 0 = video, 1 = pdf
    private javafx.embed.swing.JFXPanel videoPanel;
    private JPanel contentPanel;
    private JLabel screenTitle;
    private JButton prevBtn;
    private JButton nextBtn;
    private JPanel header;
    private JPanel footer;
    private boolean isFullscreen = false;

    public PDFViewerFrame(String pdfPath, String videoPath) throws IOException {
        this.pdfPath = pdfPath;
        this.videoPath = videoPath;
        
        setLayout(new BorderLayout());
        setBackground(AppTheme.BG);
        setComponentOrientation(java.awt.ComponentOrientation.RIGHT_TO_LEFT);
        setBorder(new EmptyBorder(0, 0, 0, 0));

        // Header
        header = new JPanel(new BorderLayout());
        header.setOpaque(false);
        header.setBorder(new EmptyBorder(8, 0, 8, 0));
        header.setPreferredSize(new Dimension(0, 50));

        screenTitle = new JLabel("🎬 סרטון");
        screenTitle.setForeground(AppTheme.TEXT);
        screenTitle.setFont(AppTheme.TITLE);
        screenTitle.setHorizontalAlignment(SwingConstants.CENTER);
        header.add(screenTitle, BorderLayout.CENTER);
        
        JButton fullscreenBtn = AppTheme.backButton("⛶");
        fullscreenBtn.setPreferredSize(new Dimension(40, 40));
        fullscreenBtn.addActionListener(e -> toggleFullscreen());
        header.add(fullscreenBtn, BorderLayout.EAST);

        add(header, BorderLayout.NORTH);

        // Content area
        contentPanel = new JPanel(new BorderLayout());
        contentPanel.setBackground(new Color(20, 20, 25));
        contentPanel.setBorder(new EmptyBorder(0, 0, 0, 0));
        add(contentPanel, BorderLayout.CENTER);

        // Footer
        footer = new JPanel(new FlowLayout(FlowLayout.CENTER, 20, 10));
        footer.setOpaque(false);
        footer.setBorder(new EmptyBorder(8, 0, 8, 0));
        footer.setPreferredSize(new Dimension(0, 50));

        prevBtn = AppTheme.backButton("◀ קודם");
        prevBtn.addActionListener(e -> showPreviousScreen());

        nextBtn = AppTheme.backButton("הבא ▶");
        nextBtn.addActionListener(e -> showNextScreen());

        footer.add(prevBtn);
        footer.add(nextBtn);
        add(footer, BorderLayout.SOUTH);

        showScreen(0);
    }

    private void showPreviousScreen() {
        if (currentScreen > 0) {
            showScreen(currentScreen - 1);
        }
    }

    private void showNextScreen() {
        if (currentScreen < 1) {
            showScreen(currentScreen + 1);
        }
    }

    private void toggleFullscreen() {
        isFullscreen = !isFullscreen;
        header.setVisible(!isFullscreen);
        footer.setVisible(!isFullscreen);
        this.revalidate();
        this.repaint();
        
        java.awt.Window window = javax.swing.SwingUtilities.getWindowAncestor(this);
        if (window instanceof javax.swing.JFrame) {
            javax.swing.JFrame frame = (javax.swing.JFrame) window;
            if (isFullscreen) {
                frame.setExtendedState(javax.swing.JFrame.MAXIMIZED_BOTH);
            } else {
                frame.setExtendedState(javax.swing.JFrame.NORMAL);
            }
        }
        
        System.out.println(isFullscreen ? "⛶ Fullscreen mode ON" : "⛶ Fullscreen mode OFF");
    }

    private JPanel videoScreenPanel;
    private JPanel pdfScreenPanel;

    private void showScreen(int screenNum) {
        currentScreen = screenNum;

        if (currentScreen == 0) {
            screenTitle.setText("🎬 סרטון");
            prevBtn.setEnabled(false);
            nextBtn.setEnabled(true);
            
            if (pdfScreenPanel != null) {
                pdfScreenPanel.setVisible(false);
            }
            if (videoScreenPanel == null) {
                showVideoScreen();
            } else {
                videoScreenPanel.setVisible(true);
                if (currentMediaPlayer != null && currentMediaPlayer.getStatus() == javafx.scene.media.MediaPlayer.Status.PAUSED) {
                    currentMediaPlayer.play();
                }
            }
        } else {
            screenTitle.setText("📄 מסמך PDF");
            prevBtn.setEnabled(true);
            nextBtn.setEnabled(false);
            
            if (videoScreenPanel != null) {
                videoScreenPanel.setVisible(false);
                if (currentMediaPlayer != null) {
                    currentMediaPlayer.pause();
                }
            }
            if (pdfScreenPanel == null) {
                showPDFScreen();
                openPDFInApp();
            } else {
                pdfScreenPanel.setVisible(true);
                openPDFInApp();
            }
        }

        contentPanel.revalidate();
        contentPanel.repaint();
    }

    private javafx.scene.media.MediaPlayer currentMediaPlayer;

    private void showVideoScreen() {
        if (videoScreenPanel == null) {
            videoScreenPanel = new JPanel(new BorderLayout());
            videoScreenPanel.setBackground(new Color(20, 20, 25));
            videoScreenPanel.setBorder(new EmptyBorder(0, 0, 0, 0));
            
            videoPanel = new javafx.embed.swing.JFXPanel();

            javafx.application.Platform.runLater(() -> {
                javafx.scene.Group root = new javafx.scene.Group();
                javafx.scene.Scene scene = new javafx.scene.Scene(root, javafx.scene.paint.Color.BLACK);
                
                try {
                    java.io.File videoFile = new java.io.File(videoPath);
                    if (videoFile.exists()) {
                        String url = videoFile.toURI().toString();
                        System.out.println("📹 טוען סרטון מ-URL: " + url);
                        
                        javafx.scene.media.Media media = new javafx.scene.media.Media(url);
                        currentMediaPlayer = new javafx.scene.media.MediaPlayer(media);
                        javafx.scene.media.MediaView mediaView = new javafx.scene.media.MediaView(currentMediaPlayer);
                        
                        mediaView.fitWidthProperty().bind(scene.widthProperty());
                        mediaView.fitHeightProperty().bind(scene.heightProperty());
                        mediaView.setPreserveRatio(true);
                        
                        mediaView.layoutXProperty().bind(
                            javafx.beans.binding.Bindings.createDoubleBinding(
                                () -> (scene.getWidth() - mediaView.getBoundsInLocal().getWidth()) / 2,
                                scene.widthProperty(), mediaView.boundsInLocalProperty()
                            )
                        );
                        mediaView.layoutYProperty().bind(
                            javafx.beans.binding.Bindings.createDoubleBinding(
                                () -> (scene.getHeight() - mediaView.getBoundsInLocal().getHeight()) / 2,
                                scene.heightProperty(), mediaView.boundsInLocalProperty()
                            )
                        );
                        
                        root.getChildren().add(mediaView);
                        currentMediaPlayer.play();
                        System.out.println("✅ סרטון מנגן ב-1920x1080");
                    }
                } catch (Exception ex) {
                    System.err.println("⚠️  שגיאה בטעינת וידאו: " + ex.getMessage());
                    ex.printStackTrace();
                }
                
                videoPanel.setScene(scene);
            });

            videoScreenPanel.add(videoPanel, BorderLayout.CENTER);
            
            JPanel controlPanel = new JPanel(new FlowLayout(FlowLayout.CENTER, 15, 5));
            controlPanel.setOpaque(false);
            controlPanel.setBorder(new EmptyBorder(5, 0, 0, 0));

            JButton pauseBtn = AppTheme.backButton("⏸ עצור");
            pauseBtn.addActionListener(e -> {
                if (currentMediaPlayer != null) {
                    currentMediaPlayer.pause();
                    System.out.println("⏸ סרטון עצור");
                }
            });

            JButton playBtn = AppTheme.backButton("▶ המשך");
            playBtn.addActionListener(e -> {
                if (currentMediaPlayer != null) {
                    currentMediaPlayer.play();
                    System.out.println("▶ סרטון מנגן");
                }
            });

            controlPanel.add(pauseBtn);
            controlPanel.add(playBtn);
            
            videoScreenPanel.add(controlPanel, BorderLayout.SOUTH);
            
            contentPanel.add(videoScreenPanel, BorderLayout.CENTER);
        }
    }

    private void showPDFScreen() {
        if (pdfScreenPanel == null) {
            pdfScreenPanel = new JPanel(new BorderLayout());
            pdfScreenPanel.setBackground(new Color(25, 25, 30));
            pdfScreenPanel.setBorder(new EmptyBorder(0, 0, 0, 0));

            javax.swing.JEditorPane pdfInfo = new javax.swing.JEditorPane();
            pdfInfo.setEditorKit(new javax.swing.text.html.HTMLEditorKit());
            pdfInfo.setEditable(false);
            pdfInfo.setBackground(new Color(25, 25, 30));
            pdfInfo.setForeground(new Color(200, 200, 200));

            String htmlContent = "<html>" +
                "<body style='color:#ccc; font-family:Arial; text-align:right; direction:rtl;'>" +
                "<h2 style='color:#2ecc71; text-align:center; margin-top:100px;'>📖 MITM Attack Anatomy</h2>" +
                "<p style='font-size:16px; line-height:1.8; margin:60px 40px;'>" +
                "המסמך נפתח בתוכנה החיצונית.<br><br>" +
                "תוכן המסמך:<br>" +
                "🔐 עקרונות התקפה<br>" +
                "🎯 וקטורי התקפה<br>" +
                "🛡️ טכניקות הגנה<br>" +
                "📊 דוגמאות ממשיות" +
                "</p>" +
                "</body>" +
                "</html>";

            pdfInfo.setText(htmlContent);
            pdfInfo.setBorder(new EmptyBorder(0, 20, 0, 20));

            javax.swing.JScrollPane scroll = new javax.swing.JScrollPane(pdfInfo);
            scroll.setBorder(null);
            scroll.setOpaque(false);
            scroll.getViewport().setOpaque(false);

            pdfScreenPanel.add(scroll, BorderLayout.CENTER);

            contentPanel.add(pdfScreenPanel, BorderLayout.CENTER);
        }
    }

    private void openPDFInApp() {
        new Thread(() -> {
            try {
                File file = new File(pdfPath);
                if (!file.exists()) {
                    System.err.println("❌ הקובץ לא נמצא: " + pdfPath);
                    return;
                }

                String[] cmd = {"open", pdfPath};
                Process p = Runtime.getRuntime().exec(cmd);
                p.waitFor();
                System.out.println("✅ PDF נפתח בתוכנת ברירת המחדל");
            } catch (Exception ex) {
                System.err.println("❌ שגיאה בפתיחת PDF: " + ex.getMessage());
            }
        }).start();
    }

    public void dispose() {
        currentMediaPlayer = null;
        videoPanel = null;
        videoScreenPanel = null;
        pdfScreenPanel = null;
        System.out.println("✅ Resources אופסו");
    }
}
