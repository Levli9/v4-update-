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

public class LearningFrame extends JFrame {

    private List<String> slides = new ArrayList<>();
    private List<String> slideVideos = new ArrayList<>(); // video URI per slide (null = no video)
    private int current = 0;
    private JEditorPane contentArea;
    private JLabel progressLabel;
    private JButton prev;
    private JButton next;
    private JButton exam;
    private JButton videoBtn;
    private DatabaseManager db;
    private User user;
    private JPanel videoContainer; // inline video area below slide text
    private javafx.embed.swing.JFXPanel currentFxPanel; // current embedded video panel
    private JScrollPane scrollPane; // text scroll pane
    private JPanel centerPanel; // main content panel
    private int topicIndex; // which topic (0-10) this frame shows, or -1 for all
    private int slideOffset; // first slide index for this topic in the full list
    private int slideCount;  // number of slides for this topic

    public LearningFrame(DatabaseManager db, User user, int topicIndex){
        this.topicIndex = topicIndex;

        this.db = db;
        this.user = user;

        GradientPanel bg = new GradientPanel(AppTheme.BG, AppTheme.BG2);
        bg.setLayout(new BorderLayout());
        bg.setComponentOrientation(java.awt.ComponentOrientation.RIGHT_TO_LEFT);

        JPanel header = new JPanel(new BorderLayout());
        header.setComponentOrientation(java.awt.ComponentOrientation.RIGHT_TO_LEFT);
        header.setOpaque(false);
        header.setBorder(new EmptyBorder(15, 15, 15, 15));

        JButton backButton = AppTheme.backButton("← חזרה לנושאים");
        backButton.addActionListener(e -> {
            stopActiveVideo();
            new TopicSelectionFrame(db, user);
        });
        
        JPanel rightHeader = new JPanel(new FlowLayout(FlowLayout.RIGHT, 0, 0));
        rightHeader.setOpaque(false);
        rightHeader.add(backButton);
        
        header.add(rightHeader, BorderLayout.EAST);

        JLabel title = new JLabel("קורס יסודות אבטחת מידע");
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

        // Prevent JavaFX toolkit from shutting down when JFXPanels are removed
        javafx.application.Platform.setImplicitExit(false);

        // Inline video container
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
        exam = AppTheme.primaryButton("✅ סיימתי — חזרה לנושאים");
        videoBtn = AppTheme.primaryButton("🎬 סרטון");
        videoBtn.setVisible(false); // no longer used — videos play inline

        prev.addActionListener(e -> prev());
        next.addActionListener(e -> next());
        exam.addActionListener(e -> {
            // Mark topic as completed
            db.markTopicCompleted(user.getId(), topicIndex);
            stopActiveVideo();
            new TopicSelectionFrame(db, user);
        });

        buttonsPanel.add(prev);
        buttonsPanel.add(videoBtn);
        buttonsPanel.add(exam);
        buttonsPanel.add(next);

        nav.add(progressLabel, BorderLayout.NORTH);
        nav.add(Box.createVerticalStrut(15), BorderLayout.CENTER);
        nav.add(buttonsPanel, BorderLayout.SOUTH);

        bg.add(nav, BorderLayout.SOUTH);

        AppWindow.navigate(bg);

        loadSlides();

        // Calculate which slides belong to this topic
        // Topics 0-10: each has 2 slides (text + video), then slide 22 is summary
        if (topicIndex >= 0 && topicIndex <= 10) {
            slideOffset = topicIndex * 2;
            slideCount = 2;
        } else {
            slideOffset = 0;
            slideCount = slides.size();
        }
        current = slideOffset;
        showSlide();
    }

    private String htmlWrap(String content) {
        return "<html><body dir='rtl' style='font-family: Arial, sans-serif; font-size: 16px; color: #E6E8EE; line-height: 1.6;'>" + content + "</body></html>";
    }

    private void loadSlides(){

        // ========== מבנה: לכל נושא – חומר לימודי ואחריו שקף סרטון ==========
        // slideVideos: null = שקף טקסט, נתיב MP4 = שקף סרטון

        // ── 1. מבוא: מהי תקיפת סייבר? ──
        slideVideos.add(null);
        slides.add(htmlWrap(
            "<h1 style='color: #54A0FF; border-bottom: 2px solid #484E60; padding-bottom: 10px;'>🌐 מהי תקיפת סייבר?</h1>" +
            "<p>תקיפת סייבר היא ניסיון מכוון של האקר או קבוצת האקרים לפרוץ למערכת מידע ממוחשבת של אדם, ארגון או ממשלה, במטרה לגנוב מידע, לגרום נזק, או להשיג שליטה על מערכות.</p>" +
            "<div style='background-color:#2a2d3d; padding:15px; border-radius:10px; border-right:5px solid #FF9F43;'>" +
            "<h3 style='color:#FF9F43; margin-top:0;'>💡 נתון מפתח</h3>" +
            "בשנת 2023, העלות הממוצעת של פריצת נתונים עמדה על <b>4.45 מיליון דולר</b> לכל אירוע (לפי IBM). תקיפות סייבר מתרחשות כל <b>39 שניות</b> בממוצע ברחבי העולם.</div>" +
            "<p><b>סוגי תקיפות עיקריים:</b></p>" +
            "<ul style='line-height:1.8;'>" +
            "<li>תקיפות על <b>סודיות</b> — גניבת מידע אישי, סיסמאות, נתוני לקוחות</li>" +
            "<li>תקיפות על <b>זמינות</b> — השבתת שירותים (DDoS)</li>" +
            "<li>תקיפות על <b>שלמות</b> — שינוי נתונים במערכת ללא ידיעת הבעלים</li>" +
            "</ul>"
        ));

        slideVideos.add("videos/01_cyberattack_intro.mp4");
        slides.add(htmlWrap("<h1 style='color:#54A0FF; text-align:center;'>🎬 סרטון: מהי תקיפת סייבר?</h1>" +
            "<p style='text-align:center; color:#aaa;'>לחצו על ▶ נגן לצפייה בסרטון ההסבר</p>"));

        // ── 2. מהי אבטחת סייבר? ──
        slideVideos.add(null);
        slides.add(htmlWrap(
            "<h1 style='color: #2ecc71; border-bottom: 2px solid #2ecc71; padding-bottom: 10px;'>🛡️ מהי אבטחת סייבר?</h1>" +
            "<p>אבטחת סייבר (Cyber Security) היא מכלול הטכנולוגיות, התהליכים והנהלים שנועדו להגן על מערכות מחשוב, רשתות, תוכנות ונתונים מפני תקיפות סייבר.</p>" +
            "<div style='background-color:#2a2d3d; padding:15px; border-radius:10px; border-right:5px solid #2ecc71;'>" +
            "<h3 style='color:#2ecc71; margin-top:0;'>🔑 שלושת עמודי התווך של אבטחת מידע (CIA):</h3>" +
            "<ul>" +
            "<li><b>סודיות (Confidentiality)</b> — רק מורשים יכולים לגשת למידע</li>" +
            "<li><b>שלמות (Integrity)</b> — המידע לא שונה באופן בלתי מורשה</li>" +
            "<li><b>זמינות (Availability)</b> — המידע נגיש למורשים בכל עת</li>" +
            "</ul></div>" +
            "<p>אבטחת סייבר כוללת הגנה על רשתות, אפליקציות, נתונים, זהויות, וגם הדרכה של עובדים — כי <b>הגורם האנושי הוא החוליה החלשה ביותר</b>.</p>"
        ));

        slideVideos.add("videos/02_what_is_cybersecurity.mp4");
        slides.add(htmlWrap("<h1 style='color:#2ecc71; text-align:center;'>🎬 סרטון: מהי אבטחת סייבר?</h1>" +
            "<p style='text-align:center; color:#aaa;'>לחצו על ▶ נגן לצפייה בסרטון ההסבר</p>"));

        // ── 3. תוכנות זדוניות (Malware) ──
        slideVideos.add(null);
        slides.add(htmlWrap(
            "<h1 style='color: #e74c3c; border-bottom: 2px solid #e74c3c; padding-bottom: 10px;'>🦠 תוכנות זדוניות (Malware)</h1>" +
            "<p><b>Malware</b> הוא שם כולל לכל תוכנה זדונית שנועדה לחדור למחשב, לגנוב מידע, להצפין קבצים או לפגוע במערכת.</p>" +
            "<h3>סוגי תוכנות זדוניות:</h3>" +
            "<ul style='line-height:1.8;'>" +
            "<li><b>וירוסים (Virus)</b> — מתפשטים על ידי הצמדות לקבצים לגיטימיים</li>" +
            "<li><b>סוסים טרויאניים (Trojan Horse)</b> — מתחזים לתוכנה רגילה אך מריצים קוד זדוני ברקע</li>" +
            "<li><b>תולעים (Worms)</b> — מתפשטים ברשת באופן עצמאי ללא התערבות אנושית</li>" +
            "<li><b>כופרה (Ransomware)</b> — מצפין קבצים ודורש כופר בתמורה למפתח פענוח</li>" +
            "<li><b>רוגלה (Spyware)</b> — עוקבת אחר פעולותיכם ומדווחת לתוקף</li>" +
            "</ul>" +
            "<div style='background-color:#2a2d3d; padding:15px; border-radius:10px; border-right:5px solid #e74c3c;'>" +
            "<h3 style='color:#e74c3c; margin-top:0;'>🛡️ כיצד מתגוננים?</h3>" +
            "אל תורידו תוכנות ממקורות לא מוכרים, ודאו שאנטי-וירוס מעודכן פועל, אל תפתחו קבצים מצורפים חשודים.</div>"
        ));

        slideVideos.add("videos/03_malware.mp4");
        slides.add(htmlWrap("<h1 style='color:#e74c3c; text-align:center;'>🎬 סרטון: תוכנות זדוניות (Malware)</h1>" +
            "<p style='text-align:center; color:#aaa;'>לחצו על ▶ נגן לצפייה בסרטון ההסבר</p>"));

        // ── 4. פישינג (Phishing) ──
        slideVideos.add(null);
        String hackerImgTag = "";
        try {
            java.net.URL hackerUrl = getClass().getResource("/images/cyber_hacker.png");
            if (hackerUrl != null) hackerImgTag = "<center><img src='" + hackerUrl + "' width='400'></center><br>";
        } catch (Exception ignored) {}
        slides.add(htmlWrap(
            "<h1 style='color: #3498db; border-bottom: 2px solid #3498db; padding-bottom: 10px;'>🎣 פישינג (Phishing)</h1>" +
            hackerImgTag +
            "<p><b>פישינג</b> היא שיטת תקיפה שבה התוקף מתחזה לגורם לגיטימי (בנק, חברת IT, מנהל) כדי לגרום לכם לחשוף מידע רגיש, ללחוץ על קישור זדוני או להוריד קובץ מסוכן.</p>" +
            "<div style='background-color:#2a2d3d; padding:15px; border-radius:10px; border-right:5px solid #e74c3c;'>" +
            "<h3 style='color:#e74c3c; margin-top:0;'>⚠️ נורות אזהרה (דגלים אדומים):</h3>" +
            "<ul>" +
            "<li><b>תחושת דחיפות:</b> \"חשבונך יינעל תוך 24 שעות!\"</li>" +
            "<li><b>שגיאות כתיב וניסוח:</b> תרגום קלוקל או שפה לא שגרתית</li>" +
            "<li><b>התחזות בשולח:</b> <span style='font-family:monospace; background:#000; padding:2px;'>support@paypa1.com</span> (ספרה 1 במקום l)</li>" +
            "<li><b>בקשה למידע רגיש:</b> IT לעולם לא מבקש סיסמה במייל</li>" +
            "</ul></div>" +
            "<p><b>💡 טיפ:</b> אל תלחצו על קישורים במייל! פתחו דפדפן והקלידו את הכתובת בעצמכם.</p>"
        ));

        slideVideos.add("videos/04_phishing.mp4");
        slides.add(htmlWrap("<h1 style='color:#3498db; text-align:center;'>🎬 סרטון: פישינג (Phishing)</h1>" +
            "<p style='text-align:center; color:#aaa;'>לחצו על ▶ נגן לצפייה בסרטון ההסבר</p>"));

        // ── 5. תקיפת Man-in-the-Middle ──
        slideVideos.add(null);
        slides.add(htmlWrap(
            "<h1 style='color: #e67e22; border-bottom: 2px solid #e67e22; padding-bottom: 10px;'>👤 תקיפת Man-in-the-Middle (MITM)</h1>" +
            "<p>בתקיפת MITM, התוקף מתמקם <b>בין שני צדדים</b> שמתקשרים (למשל ביניכם לבין האתר של הבנק) ויכול לקרוא, לשנות או לגנוב את המידע שעובר.</p>" +
            "<div style='background-color:#2a2d3d; padding:15px; border-radius:10px; border-right:5px solid #e67e22;'>" +
            "<h3 style='color:#e67e22; margin-top:0;'>🔍 איך זה עובד?</h3>" +
            "<ul>" +
            "<li>התוקף יוצר רשת Wi-Fi מזויפת (\"Free_Airport_WiFi\") ומאזין לכל התעבורה</li>" +
            "<li>התוקף מיירט תקשורת לא מוצפנת (HTTP) וגונב סיסמאות</li>" +
            "<li>התוקף יכול לשנות נתונים בדרך — למשל לשנות מספר חשבון בנק בהעברה</li>" +
            "</ul></div>" +
            "<p><b>🛡️ הגנה:</b> השתמשו תמיד ב-<b>VPN</b> ברשתות ציבוריות, ודאו שאתרים מציגים <b>HTTPS</b> (מנעול ירוק), הימנעו מרשתות Wi-Fi פתוחות לא מוכרות.</p>"
        ));

        slideVideos.add("videos/05_mitm.mp4");
        slides.add(htmlWrap("<h1 style='color:#e67e22; text-align:center;'>🎬 סרטון: תקיפת Man-in-the-Middle</h1>" +
            "<p style='text-align:center; color:#aaa;'>לחצו על ▶ נגן לצפייה בסרטון ההסבר</p>"));

        // ── 6. תקיפת סיסמאות (Password Attack) ──
        slideVideos.add(null);
        slides.add(htmlWrap(
            "<h1 style='color: #2ecc71; border-bottom: 2px solid #2ecc71; padding-bottom: 10px;'>🔑 תקיפת סיסמאות (Password Attack)</h1>" +
            "<p>תקיפת סיסמאות היא ניסיון של תוקף לגלות או לפרוץ את הסיסמה שלכם כדי להשיג גישה לחשבונות ומערכות.</p>" +
            "<h3>שיטות תקיפה נפוצות:</h3>" +
            "<ul style='line-height:1.8;'>" +
            "<li><b>Brute Force</b> — ניסיון שיטתי של כל הצירופים האפשריים</li>" +
            "<li><b>Dictionary Attack</b> — שימוש ברשימת סיסמאות נפוצות</li>" +
            "<li><b>Credential Stuffing</b> — שימוש בסיסמאות שדלפו מאתר אחר</li>" +
            "<li><b>Keylogger</b> — תוכנה שמקליטה כל הקשה על המקלדת</li>" +
            "</ul>" +
            "<div style='background-color:#2a2d3d; padding:15px; border-radius:10px; border-right:5px solid #2ecc71;'>" +
            "<h3 style='color:#2ecc71; margin-top:0;'>✔ כללי ברזל לסיסמה חזקה:</h3>" +
            "<ul><li>לפחות <b>12 תווים</b></li>" +
            "<li>שילוב אותיות גדולות וקטנות, ספרות וסימנים מיוחדים</li>" +
            "<li><b>סיסמה שונה לכל שירות!</b></li>" +
            "<li>הפעלת <b>אימות דו-שלבי (MFA/2FA)</b> בכל מקום</li></ul></div>"
        ));

        slideVideos.add("videos/06_password_attack.mp4");
        slides.add(htmlWrap("<h1 style='color:#2ecc71; text-align:center;'>🎬 סרטון: תקיפת סיסמאות</h1>" +
            "<p style='text-align:center; color:#aaa;'>לחצו על ▶ נגן לצפייה בסרטון ההסבר</p>"));

        // ── 7. שיטות הגנה בסייבר (Cyber Security Practices) ──
        slideVideos.add(null);
        slides.add(htmlWrap(
            "<h1 style='color: #9b59b6; border-bottom: 2px solid #9b59b6; padding-bottom: 10px;'>🛡️ שיטות הגנה בסייבר</h1>" +
            "<p>הגנה אפקטיבית דורשת שילוב של טכנולוגיה, נהלים והתנהגות נכונה של עובדים.</p>" +
            "<div style='background-color:#2a2d3d; padding:15px; border-radius:10px; border-right:5px solid #9b59b6;'>" +
            "<h3 style='color:#9b59b6; margin-top:0;'>🔒 עשרת הדיברות של אבטחת סייבר:</h3>" +
            "<ul style='line-height:1.8;'>" +
            "<li>1. <b>עדכנו תוכנות</b> — עדכוני אבטחה סוגרים פרצות ידועות</li>" +
            "<li>2. <b>השתמשו בסיסמאות חזקות</b> ושונות לכל שירות</li>" +
            "<li>3. <b>הפעילו אימות דו-שלבי (2FA)</b> בכל מקום אפשרי</li>" +
            "<li>4. <b>גבו נתונים</b> באופן קבוע — מגן מפני כופרה</li>" +
            "<li>5. <b>היזהרו ממיילים חשודים</b> — אל תלחצו על קישורים לא מוכרים</li>" +
            "<li>6. <b>השתמשו ב-VPN</b> ברשתות ציבוריות</li>" +
            "<li>7. <b>נעלו את המחשב</b> כשעוזבים את העמדה</li>" +
            "<li>8. <b>אל תורידו תוכנות</b> ממקורות לא מוכרים</li>" +
            "<li>9. <b>דווחו על אירועים</b> חשודים מיד ל-IT</li>" +
            "<li>10. <b>השתתפו בהדרכות</b> אבטחה באופן קבוע</li>" +
            "</ul></div>"
        ));

        slideVideos.add("videos/07_security_practices.mp4");
        slides.add(htmlWrap("<h1 style='color:#9b59b6; text-align:center;'>🎬 סרטון: שיטות הגנה בסייבר</h1>" +
            "<p style='text-align:center; color:#aaa;'>לחצו על ▶ נגן לצפייה בסרטון ההסבר</p>"));

        // ── 8. השפעת תקיפות סייבר ──
        slideVideos.add(null);
        slides.add(htmlWrap(
            "<h1 style='color: #e74c3c; border-bottom: 2px solid #e74c3c; padding-bottom: 10px;'>💥 השפעת תקיפות סייבר</h1>" +
            "<p>תקיפת סייבר יכולה <b>להשמיד ארגון</b> — מבחינה כלכלית, תדמיתית ואף משפטית.</p>" +
            "<div style='background-color:#2a2d3d; padding:15px; border-radius:10px; border-right:5px solid #e74c3c;'>" +
            "<h3 style='color:#e74c3c; margin-top:0;'>📊 השפעות עיקריות:</h3>" +
            "<ul style='line-height:1.8;'>" +
            "<li><b>הפסד כספי:</b> עלות ממוצעת של פריצה — $4.45M. כולל קנסות, שחזור, ואובדן לקוחות</li>" +
            "<li><b>נזק תדמיתי:</b> אובדן אמון לקוחות ושותפים עסקיים</li>" +
            "<li><b>השבתה תפעולית:</b> מערכות קריטיות עצרו — בתי חולים, בנקים, תחבורה</li>" +
            "<li><b>גניבת קניין רוחני:</b> סודות מסחריים, פטנטים ומחקרים</li>" +
            "<li><b>השלכות משפטיות:</b> הפרת רגולציה (GDPR), תביעות ייצוגיות</li>" +
            "</ul></div>" +
            "<p><b>דוגמה:</b> מתקפת הכופרה WannaCry ב-2017 השביתה מעל 200,000 מחשבים ב-150 מדינות, כולל בתי חולים בבריטניה.</p>"
        ));

        slideVideos.add("videos/08_impact.mp4");
        slides.add(htmlWrap("<h1 style='color:#e74c3c; text-align:center;'>🎬 סרטון: השפעת תקיפות סייבר</h1>" +
            "<p style='text-align:center; color:#aaa;'>לחצו על ▶ נגן לצפייה בסרטון ההסבר</p>"));

        // ── 9. APT – איום מתקדם מתמשך ──
        slideVideos.add(null);
        slides.add(htmlWrap(
            "<h1 style='color: #f39c12; border-bottom: 2px solid #f39c12; padding-bottom: 10px;'>🎯 APT — איום מתקדם מתמשך</h1>" +
            "<p><b>Advanced Persistent Threat (APT)</b> הוא סוג תקיפה מתוחכם שבו תוקפים (לרוב קבוצות ממומנות על ידי מדינות) חודרים לרשת ארגונית ו<b>נשארים בה חודשים או שנים</b> מבלי להיחשף.</p>" +
            "<div style='background-color:#2a2d3d; padding:15px; border-radius:10px; border-right:5px solid #f39c12;'>" +
            "<h3 style='color:#f39c12; margin-top:0;'>🔍 מאפיינים:</h3>" +
            "<ul>" +
            "<li><b>ממוקד מטרה:</b> מכוון לארגון ספציפי, לא תקיפה אקראית</li>" +
            "<li><b>מתמשך:</b> התוקף נשאר ברשת לאורך זמן ואוסף מידע</li>" +
            "<li><b>מתקדם:</b> שימוש בכלים מותאמים אישית ו-Zero-Day exploits</li>" +
            "<li><b>שלבים:</b> חדירה → חיזוק אחיזה → תנועה רוחבית → שאיבת מידע</li>" +
            "</ul></div>" +
            "<p><b>דוגמאות:</b> SolarWinds (2020), Stuxnet (2010 — תקיפה ישראלית-אמריקאית על צנטריפוגות גרעין איראניות).</p>"
        ));

        slideVideos.add("videos/09_apt.mp4");
        slides.add(htmlWrap("<h1 style='color:#f39c12; text-align:center;'>🎬 סרטון: APT — איום מתקדם מתמשך</h1>" +
            "<p style='text-align:center; color:#aaa;'>לחצו על ▶ נגן לצפייה בסרטון ההסבר</p>"));

        // ── 10. מתקפת מניעת שירות — DDoS ──
        slideVideos.add(null);
        slides.add(htmlWrap(
            "<h1 style='color: #1abc9c; border-bottom: 2px solid #1abc9c; padding-bottom: 10px;'>🌊 מתקפת מניעת שירות (DDoS)</h1>" +
            "<p><b>Denial of Service (DoS / DDoS)</b> היא תקיפה שמטרתה <b>להשבית שירות</b> על ידי הצפתו בבקשות מזויפות עד שהשרת קורס.</p>" +
            "<div style='background-color:#2a2d3d; padding:15px; border-radius:10px; border-right:5px solid #1abc9c;'>" +
            "<h3 style='color:#1abc9c; margin-top:0;'>⚡ סוגים:</h3>" +
            "<ul>" +
            "<li><b>DoS (רגיל):</b> ממחשב אחד — קל יחסית לחסום</li>" +
            "<li><b>DDoS (מבוזר):</b> ממיליוני מחשבים נגועים (Botnet) — קשה מאוד לעצירה</li>" +
            "</ul></div>" +
            "<p><b>דוגמה:</b> ב-2016, מתקפת DDoS באמצעות Botnet Mirai (מכשירי IoT נגועים) השביתה את Dyn DNS והפילה את Twitter, Netflix ו-Reddit.</p>" +
            "<p><b>🛡️ הגנה:</b> שירותי CDN ו-DDoS Protection (כמו Cloudflare), ניטור תעבורה חריגה, תכנון קיבולת.</p>"
        ));

        slideVideos.add("videos/10_ddos.mp4");
        slides.add(htmlWrap("<h1 style='color:#1abc9c; text-align:center;'>🎬 סרטון: מתקפת DDoS</h1>" +
            "<p style='text-align:center; color:#aaa;'>לחצו על ▶ נגן לצפייה בסרטון ההסבר</p>"));

        // ── 11. SQL Injection ──
        slideVideos.add(null);
        slides.add(htmlWrap(
            "<h1 style='color: #e74c3c; border-bottom: 2px solid #e74c3c; padding-bottom: 10px;'>💉 SQL Injection — הזרקת SQL</h1>" +
            "<p><b>SQL Injection</b> היא תקיפה שבה התוקף מזריק פקודות SQL זדוניות דרך שדות קלט באתר (כמו טופס התחברות) כדי לגשת למסד הנתונים.</p>" +
            "<div style='background-color:#2a2d3d; padding:15px; border-radius:10px; border-right:5px solid #e74c3c;'>" +
            "<h3 style='color:#e74c3c; margin-top:0;'>🔍 דוגמה לתקיפה:</h3>" +
            "<p>במקום לכתוב שם משתמש, התוקף כותב:</p>" +
            "<p style='font-family:monospace; background:#000; padding:8px; color:#0f0;'>admin' OR '1'='1' --</p>" +
            "<p>זה גורם למערכת לאשר כניסה בלי סיסמה!</p></div>" +
            "<h3>מה התוקף יכול לעשות?</h3>" +
            "<ul>" +
            "<li>לקרוא את כל טבלת המשתמשים והסיסמאות</li>" +
            "<li>למחוק או לשנות נתונים במסד</li>" +
            "<li>לקבל הרשאות מנהל</li>" +
            "</ul>" +
            "<p><b>🛡️ הגנה:</b> שימוש ב-Prepared Statements, סינון קלט, עקרון Least Privilege.</p>"
        ));

        slideVideos.add("videos/11_sql_injection.mp4");
        slides.add(htmlWrap("<h1 style='color:#e74c3c; text-align:center;'>🎬 סרטון: SQL Injection</h1>" +
            "<p style='text-align:center; color:#aaa;'>לחצו על ▶ נגן לצפייה בסרטון ההסבר</p>"));

        // ── סיכום ──
        slideVideos.add(null);
        slides.add(htmlWrap(
            "<h1 style='color: #f1c40f; text-align: center; font-size: 34px;'>🏆 סיכום הקורס</h1>" +
            "<p style='text-align:center; font-size:20px;'>למדתם את הנושאים הבאים:</p>" +
            "<div style='margin-left:10%; margin-right:10%; font-size:16px;'>" +
            "<ul style='line-height:2;'>" +
            "<li>✅ מהי תקיפת סייבר ואבטחת סייבר</li>" +
            "<li>✅ תוכנות זדוניות (Malware)</li>" +
            "<li>✅ פישינג (Phishing)</li>" +
            "<li>✅ תקיפת Man-in-the-Middle</li>" +
            "<li>✅ תקיפת סיסמאות ואימות דו-שלבי</li>" +
            "<li>✅ שיטות הגנה בסייבר</li>" +
            "<li>✅ השפעת תקיפות סייבר</li>" +
            "<li>✅ APT — איום מתקדם מתמשך</li>" +
            "<li>✅ מתקפת DDoS</li>" +
            "<li>✅ SQL Injection</li>" +
            "</ul></div>" +
            "<br><center><div style='background-color:#2a2d3d; padding:20px; border-radius:10px; width:70%; margin:auto;'>" +
            "<span style='color:#54A0FF; font-weight:bold; font-size:26px;'>מוכנים למבחן? 🎓</span><br><br>" +
            "לחצו על <b>'מעבר למבחן'</b> כדי לבחון את הידע שלכם!</div></center>"
        ));

    }

    private void showSlide(){
        contentArea.setText(slides.get(current));
        contentArea.setCaretPosition(0);

        int posInTopic = current - slideOffset + 1;
        progressLabel.setText("שקף " + posInTopic + " מתוך " + slideCount);

        prev.setVisible(current > slideOffset);
        if (current >= slideOffset + slideCount - 1) {
            next.setVisible(false);
            exam.setVisible(true);
        } else {
            next.setVisible(true);
            exam.setVisible(false);
        }

        // Determine if this is a video slide
        String vid = (current < slideVideos.size()) ? slideVideos.get(current) : null;
        boolean isVideoSlide = (vid != null && !vid.isEmpty());
        videoBtn.setVisible(false);

        // On a video slide that is the last slide, disable finish until video ends
        if (isVideoSlide && current >= slideOffset + slideCount - 1) {
            exam.setEnabled(false);
            exam.setToolTipText("צפו בסרטון עד הסוף כדי לסיים");
        } else {
            exam.setEnabled(true);
            exam.setToolTipText(null);
        }

        // Stop any active video FIRST before changing layout
        stopActiveVideo();

        // Swap layout: video slides get small title + big video, text slides get full text
        centerPanel.removeAll();
        videoContainer.removeAll();
        videoContainer.setVisible(false);

        if (isVideoSlide) {
            scrollPane.setPreferredSize(new java.awt.Dimension(0, 70));
            centerPanel.add(scrollPane, BorderLayout.NORTH);
            centerPanel.add(videoContainer, BorderLayout.CENTER);
            // Embed and auto-play video
            embedInlineVideo(vid);
        } else {
            scrollPane.setPreferredSize(null);
            centerPanel.add(scrollPane, BorderLayout.CENTER);
        }

        // Force layout refresh
        centerPanel.revalidate();
        centerPanel.repaint();
    }

    private javafx.scene.media.MediaPlayer activeMediaPlayer; // track for stop on slide change

    /** Stops and disposes the active media player synchronously */
    private void stopActiveVideo() {
        if (activeMediaPlayer != null) {
            final javafx.scene.media.MediaPlayer mp = activeMediaPlayer;
            activeMediaPlayer = null;
            final java.util.concurrent.CountDownLatch latch = new java.util.concurrent.CountDownLatch(1);
            javafx.application.Platform.runLater(() -> {
                try { mp.stop(); mp.dispose(); } catch (Exception ignored) {}
                finally { latch.countDown(); }
            });
            try { latch.await(3, java.util.concurrent.TimeUnit.SECONDS); } catch (InterruptedException ignored) {}
        }
        if (currentFxPanel != null) {
            videoContainer.remove(currentFxPanel);
            currentFxPanel = null;
        }
    }

    /** Embeds a video inline below the slide text using JavaFX MediaPlayer (MP4) with Hebrew subtitle overlay */
    private void embedInlineVideo(String vid) {
        if (vid == null || vid.isEmpty()) {
            return;
        }

        // Resolve video path to a file:// URI
        java.io.File videoFile;
        String videoUri = vid;
        if (!vid.startsWith("file:") && !vid.startsWith("http")) {
            videoFile = new java.io.File(vid);
            if (!videoFile.isAbsolute()) {
                videoFile = new java.io.File(System.getProperty("user.dir"), vid);
            }
            videoUri = videoFile.toURI().toString();
        } else {
            videoFile = new java.io.File(vid);
        }

        // Load subtitle entries from .he.srt file
        java.util.List<double[]> subTimes = new java.util.ArrayList<>();
        java.util.List<String> subTexts = new java.util.ArrayList<>();
        loadSubtitles(videoFile.getAbsolutePath(), subTimes, subTexts);

        javafx.embed.swing.JFXPanel fxPanel = new javafx.embed.swing.JFXPanel();
        currentFxPanel = fxPanel;
        videoContainer.add(fxPanel, BorderLayout.CENTER);

        String finalUri = videoUri;
        javafx.application.Platform.runLater(() -> {
            try {
                javafx.scene.media.Media media = new javafx.scene.media.Media(finalUri);
                javafx.scene.media.MediaPlayer player = new javafx.scene.media.MediaPlayer(media);
                activeMediaPlayer = player;
                javafx.scene.media.MediaView mediaView = new javafx.scene.media.MediaView(player);
                mediaView.setPreserveRatio(true);

                // Subtitle overlay label with Hebrew-compatible font
                javafx.scene.control.Label subtitleLabel = new javafx.scene.control.Label("");
                subtitleLabel.setFont(javafx.scene.text.Font.font("Arial Hebrew", javafx.scene.text.FontWeight.BOLD, 20));
                subtitleLabel.setStyle(
                    "-fx-text-fill: white;" +
                    "-fx-background-color: rgba(0,0,0,0.75); -fx-padding: 8 20;" +
                    "-fx-background-radius: 8;");
                subtitleLabel.setWrapText(true);
                subtitleLabel.setMaxWidth(900);
                subtitleLabel.setAlignment(javafx.geometry.Pos.CENTER);
                subtitleLabel.setNodeOrientation(javafx.geometry.NodeOrientation.RIGHT_TO_LEFT);

                // Update subtitle based on current time
                player.currentTimeProperty().addListener((obs, o, n) -> {
                    double ms = n.toMillis();
                    String text = "";
                    for (int i = 0; i < subTimes.size(); i++) {
                        if (ms >= subTimes.get(i)[0] && ms <= subTimes.get(i)[1]) {
                            text = subTexts.get(i);
                            break;
                        }
                    }
                    subtitleLabel.setText(text);
                    subtitleLabel.setVisible(!text.isEmpty());
                });

                // Transport controls
                javafx.scene.control.Button playPauseBtn = new javafx.scene.control.Button("⏸ השהה");
                playPauseBtn.setStyle("-fx-font-size:14; -fx-background-color:#007BFF; -fx-text-fill:white; -fx-padding:6 18; -fx-cursor:hand;");
                playPauseBtn.setOnAction(e -> {
                    if (player.getStatus() == javafx.scene.media.MediaPlayer.Status.PLAYING) {
                        player.pause();
                        playPauseBtn.setText("▶ נגן");
                    } else {
                        player.play();
                        playPauseBtn.setText("⏸ השהה");
                    }
                });

                javafx.scene.control.Button stopBtn = new javafx.scene.control.Button("⏹");
                stopBtn.setStyle("-fx-font-size:14; -fx-background-color:#444; -fx-text-fill:white; -fx-padding:6 14;");
                stopBtn.setOnAction(e -> { player.stop(); playPauseBtn.setText("▶ נגן"); });

                javafx.scene.control.Slider seekSlider = new javafx.scene.control.Slider(0, 100, 0);
                seekSlider.setPrefWidth(300);
                javafx.scene.layout.HBox.setHgrow(seekSlider, javafx.scene.layout.Priority.ALWAYS);

                player.currentTimeProperty().addListener((obs, o, n) -> {
                    if (!seekSlider.isValueChanging() && player.getTotalDuration() != null) {
                        double total = player.getTotalDuration().toMillis();
                        if (total > 0) seekSlider.setValue(n.toMillis() / total * 100);
                    }
                });
                seekSlider.setOnMouseReleased(e -> {
                    if (player.getTotalDuration() != null)
                        player.seek(javafx.util.Duration.millis(seekSlider.getValue() / 100.0 * player.getTotalDuration().toMillis()));
                });

                javafx.scene.control.Slider volSlider = new javafx.scene.control.Slider(0, 1, 0.7);
                volSlider.setPrefWidth(80);
                player.volumeProperty().bind(volSlider.valueProperty());

                javafx.scene.control.Label volLabel = new javafx.scene.control.Label("🔊");
                volLabel.setStyle("-fx-text-fill:white; -fx-font-size:14;");

                javafx.scene.layout.HBox controls = new javafx.scene.layout.HBox(10,
                    playPauseBtn, stopBtn, seekSlider, volLabel, volSlider);
                controls.setAlignment(javafx.geometry.Pos.CENTER);
                controls.setPadding(new javafx.geometry.Insets(8));
                controls.setStyle("-fx-background-color:#1a1a2e;");

                // Video pane with subtitle overlay at the bottom
                javafx.scene.layout.StackPane videoPane = new javafx.scene.layout.StackPane();
                videoPane.setStyle("-fx-background-color:black;");
                javafx.scene.layout.VBox.setVgrow(videoPane, javafx.scene.layout.Priority.ALWAYS);

                javafx.scene.layout.StackPane subContainer = new javafx.scene.layout.StackPane(subtitleLabel);
                subContainer.setAlignment(javafx.geometry.Pos.BOTTOM_CENTER);
                subContainer.setPadding(new javafx.geometry.Insets(0, 0, 30, 0));
                subContainer.setPickOnBounds(false);

                videoPane.getChildren().addAll(mediaView, subContainer);

                mediaView.fitWidthProperty().bind(videoPane.widthProperty());
                mediaView.fitHeightProperty().bind(videoPane.heightProperty().subtract(10));

                javafx.scene.layout.VBox root = new javafx.scene.layout.VBox(videoPane, controls);
                root.setStyle("-fx-background-color:black;");

                javafx.scene.Scene scene = new javafx.scene.Scene(root);
                fxPanel.setScene(scene);

                // Error handler
                player.setOnError(() -> {
                    System.err.println("MediaPlayer error: " + player.getError());
                });

                // Enable finish button when video ends
                player.setOnEndOfMedia(() -> {
                    javax.swing.SwingUtilities.invokeLater(() -> {
                        exam.setEnabled(true);
                        exam.setToolTipText(null);
                    });
                });

                // Auto-play the video
                player.setAutoPlay(true);
            } catch (Exception ex) {
                ex.printStackTrace();
            }
        });

        videoContainer.setVisible(true);
        videoContainer.revalidate();
        videoContainer.repaint();
    }

    /** Loads subtitle entries from a .he.srt file matching the video path */
    private void loadSubtitles(String videoPath, java.util.List<double[]> times, java.util.List<String> texts) {
        // Derive SRT path: videos/04_phishing.mp4 → videos/04_phishing.he.srt
        String srtPath = videoPath.replaceAll("\\.mp4$", ".he.srt");
        java.io.File srtFile = new java.io.File(srtPath);
        if (!srtFile.exists()) return;

        try (java.io.BufferedReader br = new java.io.BufferedReader(
                new java.io.InputStreamReader(new java.io.FileInputStream(srtFile), "UTF-8"))) {
            String line;
            while ((line = br.readLine()) != null) {
                line = line.trim();
                // Look for timestamp line: 00:00:01,500 --> 00:00:05,000
                if (line.contains("-->")) {
                    String[] parts = line.split("\\s*-->\\s*");
                    if (parts.length == 2) {
                        double startMs = parseSrtTimestamp(parts[0].trim());
                        double endMs = parseSrtTimestamp(parts[1].trim());
                        // Read subtitle text lines until blank line
                        StringBuilder sb = new StringBuilder();
                        while ((line = br.readLine()) != null && !line.trim().isEmpty()) {
                            if (sb.length() > 0) sb.append("\n");
                            sb.append(line.trim());
                        }
                        if (sb.length() > 0) {
                            times.add(new double[]{startMs, endMs});
                            texts.add(sb.toString());
                        }
                    }
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    /** Parse SRT timestamp "HH:MM:SS,mmm" to milliseconds */
    private double parseSrtTimestamp(String ts) {
        String[] main = ts.split(",");
        String[] hms = main[0].split(":");
        int h = Integer.parseInt(hms[0]);
        int m = Integer.parseInt(hms[1]);
        int s = Integer.parseInt(hms[2]);
        int ms = main.length > 1 ? Integer.parseInt(main[1]) : 0;
        return h * 3600000.0 + m * 60000.0 + s * 1000.0 + ms;
    }

    private void next(){
        if(current < slideOffset + slideCount - 1){
            current++;
            showSlide();
        }
    }

    private void prev(){
        if(current > slideOffset){
            current--;
            showSlide();
        }
    }
}