package com.cybertraining.ui;

import javafx.application.Platform;
import javafx.embed.swing.JFXPanel;
import javafx.scene.Scene;
import javafx.scene.layout.StackPane;
import javafx.scene.media.Media;
import javafx.scene.media.MediaPlayer;
import javafx.scene.media.MediaView;
import javafx.scene.control.Button;
import javafx.scene.control.Slider;
import javafx.scene.layout.HBox;
import javafx.scene.layout.VBox;
import javafx.scene.layout.Priority;
import javafx.geometry.Pos;
import javafx.geometry.Insets;
import javafx.util.Duration;

import javax.swing.*;
import java.awt.*;

/**
 * A Swing JPanel that embeds a JavaFX MediaPlayer for playing MP4/H.264 videos.
 * Usage: new VideoPlayerPanel("file:///path/to/video.mp4") or any URI supported by JavaFX Media.
 */
public class VideoPlayerPanel extends JPanel {

    private JFXPanel fxPanel;
    private MediaPlayer mediaPlayer;
    private String videoUri;

    private static boolean fxInitialized = false;

    public VideoPlayerPanel(String videoUri) {
        this.videoUri = videoUri;
        setLayout(new BorderLayout());
        setBackground(Color.BLACK);

        fxPanel = new JFXPanel(); // initializes JavaFX toolkit
        add(fxPanel, BorderLayout.CENTER);

        // Build the JavaFX scene on the FX thread
        Platform.runLater(this::initFX);
    }

    private void initFX() {
        try {
            Media media = new Media(videoUri);
            mediaPlayer = new MediaPlayer(media);

            MediaView mediaView = new MediaView(mediaPlayer);
            mediaView.setPreserveRatio(true);

            // Auto-fit to panel size
            mediaView.fitWidthProperty().bind(fxPanel.getScene() != null ?
                fxPanel.getScene().widthProperty() :
                javafx.beans.binding.Bindings.createDoubleBinding(() -> 640.0));
            mediaView.fitHeightProperty().bind(fxPanel.getScene() != null ?
                fxPanel.getScene().heightProperty().subtract(50) :
                javafx.beans.binding.Bindings.createDoubleBinding(() -> 360.0));

            // Transport controls
            Button playPause = new Button("▶");
            playPause.setStyle("-fx-font-size: 16; -fx-background-color: #007BFF; -fx-text-fill: white; -fx-padding: 6 16;");
            playPause.setOnAction(e -> {
                if (mediaPlayer.getStatus() == MediaPlayer.Status.PLAYING) {
                    mediaPlayer.pause();
                    playPause.setText("▶");
                } else {
                    mediaPlayer.play();
                    playPause.setText("⏸");
                }
            });

            Button stop = new Button("⏹");
            stop.setStyle("-fx-font-size: 16; -fx-background-color: #444; -fx-text-fill: white; -fx-padding: 6 16;");
            stop.setOnAction(e -> {
                mediaPlayer.stop();
                playPause.setText("▶");
            });

            Slider seekSlider = new Slider(0, 100, 0);
            seekSlider.setPrefWidth(300);
            HBox.setHgrow(seekSlider, Priority.ALWAYS);

            mediaPlayer.currentTimeProperty().addListener((obs, oldVal, newVal) -> {
                if (!seekSlider.isValueChanging() && mediaPlayer.getTotalDuration() != null) {
                    double total = mediaPlayer.getTotalDuration().toMillis();
                    if (total > 0) {
                        seekSlider.setValue(newVal.toMillis() / total * 100);
                    }
                }
            });

            seekSlider.setOnMouseReleased(e -> {
                if (mediaPlayer.getTotalDuration() != null) {
                    mediaPlayer.seek(Duration.millis(seekSlider.getValue() / 100.0 * mediaPlayer.getTotalDuration().toMillis()));
                }
            });

            Slider volumeSlider = new Slider(0, 1, 0.7);
            volumeSlider.setPrefWidth(80);
            mediaPlayer.volumeProperty().bind(volumeSlider.valueProperty());

            javafx.scene.control.Label volLabel = new javafx.scene.control.Label("🔊");
            volLabel.setStyle("-fx-text-fill: white; -fx-font-size: 14;");

            HBox controls = new HBox(10, playPause, stop, seekSlider, volLabel, volumeSlider);
            controls.setAlignment(Pos.CENTER);
            controls.setPadding(new Insets(8));
            controls.setStyle("-fx-background-color: #1a1a2e;");

            StackPane videoPane = new StackPane(mediaView);
            videoPane.setStyle("-fx-background-color: black;");
            VBox.setVgrow(videoPane, Priority.ALWAYS);

            VBox root = new VBox(videoPane, controls);
            root.setStyle("-fx-background-color: black;");

            Scene scene = new Scene(root, 640, 400);
            fxPanel.setScene(scene);

            // Now bind after scene is set
            mediaView.fitWidthProperty().bind(scene.widthProperty());
            mediaView.fitHeightProperty().bind(scene.heightProperty().subtract(50));

            mediaPlayer.setOnEndOfMedia(() -> {
                mediaPlayer.stop();
                playPause.setText("▶");
            });

        } catch (Exception ex) {
            System.err.println("Failed to load video: " + videoUri);
            ex.printStackTrace();
        }
    }

    /** Start playing the video */
    public void play() {
        Platform.runLater(() -> {
            if (mediaPlayer != null) mediaPlayer.play();
        });
    }

    /** Pause the video */
    public void pause() {
        Platform.runLater(() -> {
            if (mediaPlayer != null) mediaPlayer.pause();
        });
    }

    /** Stop and release the player */
    public void stop() {
        Platform.runLater(() -> {
            if (mediaPlayer != null) {
                mediaPlayer.stop();
                mediaPlayer.dispose();
            }
        });
    }

    /** Change the video URI */
    public void setVideo(String uri) {
        Platform.runLater(() -> {
            if (mediaPlayer != null) {
                mediaPlayer.stop();
                mediaPlayer.dispose();
            }
            this.videoUri = uri;
            initFX();
        });
    }
}
