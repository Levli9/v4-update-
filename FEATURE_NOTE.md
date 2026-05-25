# 🎬 Man-in-the-Middle Video + PDF Integration

## Summary
Integrated custom video and PDF viewer for the "Man-in-the-Middle" learning topic with:
- Full-screen video player (1920x1080 aspect ratio)
- Seamless navigation between video and PDF
- Pause/play video controls
- Fullscreen mode toggle
- Auto-open PDF in external viewer

## Files to be added:
1. `src/main/java/com/cybertraining/ui/PDFViewerFrame.java` - New video+PDF viewer component
2. `data/generated-videos/training-1776270463079-training.mp4` - Hebrew training video
3. `data/pdfs/man-in-the-middle.pdf` - MITM Attack Anatomy PDF document

## Modified Files:
1. `src/main/java/com/cybertraining/ui/TopicSelectionFrame.java` - Link MITM topic to PDFViewerFrame
2. `src/main/java/com/cybertraining/service/ContentGenerationService.java` - Fixed Docker status check
3. `pom.xml` - Added maven-compiler-plugin with --release 17

## Key Features:
✅ Video player with proper aspect ratio preservation
✅ Fullscreen toggle (⛶) button
✅ Pause/Play controls
✅ Screen switching: Video ↔ PDF
✅ Auto-launch PDF in native viewer
✅ Proper resource cleanup on close
✅ Static JavaFX initialization to prevent re-initialization errors
