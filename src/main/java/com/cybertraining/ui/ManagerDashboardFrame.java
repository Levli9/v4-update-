package com.cybertraining.ui;

import java.awt.BorderLayout;
import java.awt.Component;
import java.awt.Dimension;
import java.awt.FlowLayout;


import javax.swing.Box;
import javax.swing.BoxLayout;
import javax.swing.JButton;
import javax.swing.JFrame;
import javax.swing.JLabel;
import javax.swing.JScrollPane;
import javax.swing.JTable;
import javax.swing.table.DefaultTableModel;
import javax.swing.border.EmptyBorder;
import javax.swing.JPanel;

import com.cybertraining.db.DatabaseManager;
import com.cybertraining.model.User;

public class ManagerDashboardFrame extends JFrame {
    private DatabaseManager db;
    private javax.swing.Timer refreshTimer;
    private JLabel avgValueLabel, completionValueLabel, highRiskValueLabel, monthlyValueLabel;
    private DefaultTableModel tableModel;

    // filter controls (kept as fields so refreshMetrics can read them)
    private javax.swing.JComboBox<String> deptCombo;
    private javax.swing.JComboBox<String> dateRangeCombo;
    private javax.swing.JComboBox<String> courseCombo;

    // chart panels (kept so we can replace data on refresh)
    private SimpleChartPanel pieChart;
    private SimpleChartPanel barChart;

    /**
     * @param db
     * @param manager
     */
    public ManagerDashboardFrame(DatabaseManager db, User manager){

        this.db = db;

        GradientPanel bg = new GradientPanel(AppTheme.BG, AppTheme.BG2);
        bg.setLayout(new BorderLayout());

        // Header with centered title
        JPanel header = new JPanel(new BorderLayout());
        header.setOpaque(false);
        header.setBorder(new javax.swing.border.EmptyBorder(15, 20, 10, 20));

        JButton backButton = AppTheme.backButton("← התנתק");
        backButton.addActionListener(e -> {
            if (refreshTimer != null && refreshTimer.isRunning()) refreshTimer.stop();
            new WelcomeFrame(db);
        });

        JPanel rightHeader = new JPanel(new FlowLayout(FlowLayout.RIGHT, 0, 0));
        rightHeader.setOpaque(false);
        rightHeader.add(backButton);
        header.add(rightHeader, BorderLayout.EAST);

        JLabel headerTitle = new JLabel("📊 דשבורד מנהל - סטטיסטיקות הדרכה");
        headerTitle.setFont(AppTheme.TITLE);
        headerTitle.setForeground(AppTheme.TEXT);
        headerTitle.setHorizontalAlignment(javax.swing.SwingConstants.CENTER);
        header.add(headerTitle, BorderLayout.CENTER);

        // Welcome subtitle
        JLabel welcomeLabel = new JLabel("שלום, " + manager.getName() + " 👋");
        welcomeLabel.setFont(AppTheme.SUBTITLE);
        welcomeLabel.setForeground(AppTheme.MUTED);
        welcomeLabel.setHorizontalAlignment(javax.swing.SwingConstants.CENTER);

        JPanel headerContent = new JPanel();
        headerContent.setOpaque(false);
        headerContent.setLayout(new BoxLayout(headerContent, BoxLayout.Y_AXIS));
        headerTitle.setAlignmentX(Component.CENTER_ALIGNMENT);
        welcomeLabel.setAlignmentX(Component.CENTER_ALIGNMENT);
        headerContent.add(headerTitle);
        headerContent.add(Box.createVerticalStrut(5));
        headerContent.add(welcomeLabel);
        header.add(headerContent, BorderLayout.CENTER);

        bg.add(header, BorderLayout.NORTH);

        // Main split: left filters, right dashboard content
        JPanel main = new JPanel();
        main.setOpaque(false);
        main.setLayout(new BorderLayout(20, 0));

        // Left filters column
        JPanel left = new JPanel();
        left.setOpaque(false);
        left.setLayout(new BoxLayout(left, BoxLayout.Y_AXIS));
        left.setPreferredSize(new Dimension(250, 0));
        left.setBorder(new EmptyBorder(15, 15, 15, 15));

        // Filter header
        JLabel filterHeader = new JLabel("🔍 סינון נתונים");
        filterHeader.setFont(AppTheme.SUBTITLE);
        filterHeader.setForeground(AppTheme.TEXT);
        filterHeader.setAlignmentX(Component.RIGHT_ALIGNMENT);
        left.add(filterHeader);
        left.add(Box.createVerticalStrut(20));

        // --- Department filter ---
        JLabel deptLabel = AppTheme.createFieldLabel("מחלקה");
        deptLabel.setMaximumSize(new Dimension(220, 24));
        deptLabel.setAlignmentX(Component.RIGHT_ALIGNMENT);
        left.add(deptLabel);
        left.add(Box.createVerticalStrut(6));
        deptCombo = new javax.swing.JComboBox<>(new String[]{"כל המחלקות", "מכירות", "פיתוח", "משאבי אנוש", "לוגיסטיקה", "תמיכה"});
        deptCombo.setMaximumSize(new Dimension(220, 36));
        deptCombo.setPreferredSize(new Dimension(220, 36));
        deptCombo.setBackground(AppTheme.INPUT_BG);
        deptCombo.setForeground(AppTheme.TEXT);
        deptCombo.addActionListener(e -> refreshMetrics());
        left.add(deptCombo);
        left.add(Box.createVerticalStrut(20));

        // --- Date range filter ---
        JLabel dateLabel = AppTheme.createFieldLabel("טווח תאריכים");
        dateLabel.setMaximumSize(new Dimension(220, 24));
        dateLabel.setAlignmentX(Component.RIGHT_ALIGNMENT);
        left.add(dateLabel);
        left.add(Box.createVerticalStrut(6));
        dateRangeCombo = new javax.swing.JComboBox<>(new String[]{
            "הכל", "7 ימים אחרונים", "30 ימים אחרונים", "90 ימים אחרונים", "שנה אחרונה"
        });
        dateRangeCombo.setMaximumSize(new Dimension(220, 36));
        dateRangeCombo.setPreferredSize(new Dimension(220, 36));
        dateRangeCombo.setBackground(AppTheme.INPUT_BG);
        dateRangeCombo.setForeground(AppTheme.TEXT);
        dateRangeCombo.addActionListener(e -> refreshMetrics());
        left.add(dateRangeCombo);
        left.add(Box.createVerticalStrut(20));

        // --- Course / training unit filter ---
        JLabel courseLabel = AppTheme.createFieldLabel("יחידת הדרכה");
        courseLabel.setMaximumSize(new Dimension(220, 24));
        courseLabel.setAlignmentX(Component.RIGHT_ALIGNMENT);
        left.add(courseLabel);
        left.add(Box.createVerticalStrut(6));
        courseCombo = new javax.swing.JComboBox<>(new String[]{
            "כל ההדרכות", "יסודות אבטחת מידע"
        });
        courseCombo.setMaximumSize(new Dimension(220, 36));
        courseCombo.setPreferredSize(new Dimension(220, 36));
        courseCombo.setBackground(AppTheme.INPUT_BG);
        courseCombo.setForeground(AppTheme.TEXT);
        courseCombo.addActionListener(e -> refreshMetrics());
        courseCombo.setSelectedIndex(0); // Default to "כל ההדרכות" (All trainings)
        left.add(courseCombo);

        // push remaining space down so filters stay at the top
        left.add(Box.createVerticalGlue());

        main.add(left, BorderLayout.WEST);

        // Right content area (cards + charts + table)
        JPanel right = new JPanel();
        right.setOpaque(false);
        right.setLayout(new BoxLayout(right, BoxLayout.Y_AXIS));
        right.setBorder(new EmptyBorder(10, 10, 10, 20));

        // Top KPI cards row
        JPanel cardsRow = new JPanel(new java.awt.GridLayout(1, 4, 18, 0));
        cardsRow.setOpaque(false);
        cardsRow.setAlignmentX(Component.CENTER_ALIGNMENT);
        cardsRow.setMaximumSize(new Dimension(Integer.MAX_VALUE, 140));
        cardsRow.setBorder(new EmptyBorder(10, 0, 10, 0));
        // load live metrics into cards (labels kept as fields for refresh)
        cardsRow.add(dashboardCard("📈 ציון ארגוני ממוצע", "--", "#54A0FF"));
        cardsRow.add(dashboardCard("✅ השלמת הדרכה", "--", "#2ecc71"));
        cardsRow.add(dashboardCard("⚠️ עובדים בסיכון", "--", "#e74c3c"));
        cardsRow.add(dashboardCard("📊 התקדמות חודשית", "--", "#f39c12"));
        right.add(cardsRow);

        // Middle charts row (pie + bar + trend)
        JPanel chartsRow = new JPanel(new FlowLayout(FlowLayout.CENTER, 20, 12));
        chartsRow.setOpaque(false);
        chartsRow.setAlignmentX(Component.CENTER_ALIGNMENT);

        // prepare data from results
        java.util.List<com.cybertraining.model.Result> allResults = db.getResults();
        System.out.println("Found " + allResults.size() + " results in database");
        int validResults = 0;
        // score distribution buckets
        java.util.Map<String,Integer> distribution = new java.util.LinkedHashMap<>();
        distribution.put("0-49", 0);
        distribution.put("50-69", 0);
        distribution.put("70-84", 0);
        distribution.put("85-100", 0);
        // attempts per user map
        java.util.Map<Integer, Integer> attempts = new java.util.HashMap<>();
        java.util.Map<Integer, Integer> latestScore = new java.util.HashMap<>();
        java.util.Map<Integer, Long> latestTs = new java.util.HashMap<>();

        for (com.cybertraining.model.Result r : allResults) {
            // Check course filter
            boolean courseMatches = false;
            String selectedCourse = (String) courseCombo.getSelectedItem();
            if ("כל ההדרכות".equals(selectedCourse)) {
                courseMatches = true; // Include all courses
            } else if ("יסודות אבטחת מידע".equals(selectedCourse)) {
                courseMatches = r.getCourse() != null && r.getCourse().getId() == 1;
            }
            if (!courseMatches) continue;
            validResults++;
            int s = r.getScore();
            if (s < 50) distribution.put("0-49", distribution.get("0-49") + 1);
            else if (s < 70) distribution.put("50-69", distribution.get("50-69") + 1);
            else if (s < 85) distribution.put("70-84", distribution.get("70-84") + 1);
            else distribution.put("85-100", distribution.get("85-100") + 1);

            com.cybertraining.model.User u = r.getUser();
            if (u == null) continue;
            int uid = u.getId();
            attempts.put(uid, attempts.getOrDefault(uid, 0) + 1);
            if (!latestTs.containsKey(uid) || r.getTimestamp() > latestTs.get(uid)) {
                latestTs.put(uid, r.getTimestamp());
                latestScore.put(uid, s);
            }
        }


        SimpleChartPanel pie = new SimpleChartPanel(SimpleChartPanel.Type.PIE, distribution);
        pie.setPreferredSize(new Dimension(420, 240));
        SimpleChartPanel bar = new SimpleChartPanel(SimpleChartPanel.Type.BAR, distribution);
        bar.setPreferredSize(new Dimension(420, 240));
        chartsRow.add(bar);
        chartsRow.add(pie);

        // assign to fields for refresh
        this.pieChart = pie;
        this.barChart = bar;

        // small trend placeholder (reuse chartPlaceholder area)
        chartsRow.add(chartPlaceholder("מגמת ביצועים ארגונית", 240, 200));
        right.add(chartsRow);

        // Heatmap / summary row
        JPanel heatRow = new JPanel(new FlowLayout(FlowLayout.CENTER, 12, 6));
        heatRow.setOpaque(false);
        heatRow.setAlignmentX(Component.CENTER_ALIGNMENT);
        heatRow.add(chartPlaceholder("📋 חוזקות וחולשות לפי נושא", 960, 120));
        right.add(heatRow);

        // Bottom area: employees list with attempts and recent results
        right.add(Box.createVerticalStrut(16));
        JPanel tableCard = AppTheme.cardPanel();
        tableCard.setLayout(new BoxLayout(tableCard, BoxLayout.Y_AXIS));
        tableCard.setPreferredSize(new Dimension(1200, 350));
        tableCard.setBorder(new EmptyBorder(15, 20, 15, 20));

        JLabel tableTitle = new JLabel("👥 פעולות נדרשות: סטטוס עובדים");
        tableTitle.setFont(AppTheme.SUBTITLE);
        tableTitle.setForeground(AppTheme.TEXT);
        tableTitle.setAlignmentX(Component.CENTER_ALIGNMENT);
        tableCard.add(tableTitle);
        tableCard.add(Box.createVerticalStrut(12));

        String[] cols = new String[]{"שם", "מחלקה", "ניסיונות", "ציון אחרון", "סטטוס הדרכה", "המלצה", "זמן אחרון"};
        tableModel = new DefaultTableModel(cols, 0) {
            @Override public boolean isCellEditable(int row, int column) { return false; }
        };

        // Build rows from attempts map
        java.util.List<Integer> uids = new java.util.ArrayList<>(attempts.keySet());
        // sort by attempts desc
        uids.sort((a,b) -> Integer.compare(attempts.get(b), attempts.get(a)));
        for (Integer uid : uids) {
            com.cybertraining.model.User u = db.getUserById(uid);
            String name = u != null ? u.getName() : "(משתמש)";
            String dept = u != null ? u.getDepartment() : "";
            int att = attempts.get(uid);
            int sc = latestScore.getOrDefault(uid, 0);
            long ts = latestTs.getOrDefault(uid, 0L);
            String status = sc >= 70 ? "עובר" : "זקוק לשיפור";
            String rec = sc >= 85 ? "אין צורך" : (sc >= 70 ? "חיזוק קצר" : "הדרכה מחודשת");
            String ttxt = ts == 0 ? "-" : new java.text.SimpleDateFormat("yyyy-MM-dd HH:mm").format(new java.util.Date(ts*1000));
            tableModel.addRow(new Object[]{name, dept, att, sc, status, rec, ttxt});
        }

        JTable table = new JTable(tableModel);
        table.setFont(AppTheme.TEXT_FONT);
        table.setRowHeight(36);
        table.setFillsViewportHeight(true);
        table.setShowGrid(false);
        table.setIntercellSpacing(new Dimension(0, 2));
        table.getTableHeader().setReorderingAllowed(false);
        table.getTableHeader().setBackground(new java.awt.Color(45, 50, 80));
        table.getTableHeader().setForeground(AppTheme.TEXT);
        table.getTableHeader().setFont(new java.awt.Font("Arial", java.awt.Font.BOLD, 13));
        table.setBackground(AppTheme.CARD);
        table.setForeground(AppTheme.TEXT);
        table.setSelectionBackground(new java.awt.Color(84, 160, 255, 60));
        table.setSelectionForeground(AppTheme.TEXT);

        JScrollPane sp = new JScrollPane(table);
        sp.getViewport().setBackground(AppTheme.CARD);
        sp.setBorder(null);
        tableCard.add(sp);
        right.add(tableCard);

        // start auto-refresh timer (every 3 seconds)
        refreshTimer = new javax.swing.Timer(3000, e -> refreshMetrics());
        refreshTimer.start();

        main.add(right, BorderLayout.CENTER);

        bg.add(main, BorderLayout.CENTER);

        AppTheme.applyRTL(bg);
        AppWindow.navigate(bg);
    }

    private void refreshMetrics() {
        // update KPI labels
        double avg = db.getAverageScoreForCourse(1);
        int completion = db.getCompletionRateForCourse(1);
        int highRisk = db.countHighRiskEmployees(1, 50);
        int monthly = db.getMonthlyProgressPercent(1);
        if (avgValueLabel != null) avgValueLabel.setText(String.format("%d%%", (int)Math.round(avg)));
        if (completionValueLabel != null) completionValueLabel.setText(String.format("%d%%", completion));
        if (highRiskValueLabel != null) highRiskValueLabel.setText(String.valueOf(highRisk));
        if (monthlyValueLabel != null) monthlyValueLabel.setText((monthly >= 0 ? "+" : "") + monthly + "%");

        // refresh table rows and recalculate distribution for charts
        java.util.List<com.cybertraining.model.Result> allResults = db.getResults();
        java.util.Map<Integer, Integer> attempts = new java.util.HashMap<>();
        java.util.Map<Integer, Integer> latestScore = new java.util.HashMap<>();
        java.util.Map<Integer, Long> latestTs = new java.util.HashMap<>();

        // recalculate distribution for charts
        java.util.Map<String,Integer> distribution = new java.util.LinkedHashMap<>();
        distribution.put("0-49", 0);
        distribution.put("50-69", 0);
        distribution.put("70-84", 0);
        distribution.put("85-100", 0);

        for (com.cybertraining.model.Result r : allResults) {
            // Check course filter
            boolean courseMatches = false;
            String selectedCourse = (String) courseCombo.getSelectedItem();
            if ("כל ההדרכות".equals(selectedCourse)) {
                courseMatches = true; // Include all courses
            } else if ("יסודות אבטחת מידע".equals(selectedCourse)) {
                courseMatches = r.getCourse() != null && r.getCourse().getId() == 1;
            }
            if (!courseMatches) continue;
            int s = r.getScore();
            if (s < 50) distribution.put("0-49", distribution.get("0-49") + 1);
            else if (s < 70) distribution.put("50-69", distribution.get("50-69") + 1);
            else if (s < 85) distribution.put("70-84", distribution.get("70-84") + 1);
            else distribution.put("85-100", distribution.get("85-100") + 1);

            com.cybertraining.model.User u = r.getUser();
            if (u == null) continue;
            int uid = u.getId();
            attempts.put(uid, attempts.getOrDefault(uid, 0) + 1);
            if (!latestTs.containsKey(uid) || r.getTimestamp() > latestTs.get(uid)) {
                latestTs.put(uid, r.getTimestamp());
                latestScore.put(uid, r.getScore());
            }
        }

        // update charts with new data
        if (pieChart != null) pieChart.updateData(distribution);
        if (barChart != null) barChart.updateData(distribution);

        // rebuild table model
        if (tableModel == null) return;
        tableModel.setRowCount(0);
        java.util.List<Integer> uids = new java.util.ArrayList<>(attempts.keySet());
        uids.sort((a,b) -> Integer.compare(attempts.get(b), attempts.get(a)));
        for (Integer uid : uids) {
            com.cybertraining.model.User u = db.getUserById(uid);
            String name = u != null ? u.getName() : "(משתמש)";
            String dept = u != null ? u.getDepartment() : "";
            int att = attempts.get(uid);
            int sc = latestScore.getOrDefault(uid, 0);
            long ts = latestTs.getOrDefault(uid, 0L);
            String status = sc >= 70 ? "עובר" : "זקוק לשיפור";
            String rec = sc >= 85 ? "אין צורך" : (sc >= 70 ? "חיזוק קצר" : "הדרכה מחודשת");
            String ttxt = ts == 0 ? "-" : new java.text.SimpleDateFormat("yyyy-MM-dd HH:mm").format(new java.util.Date(ts*1000));
            tableModel.addRow(new Object[]{name, dept, att, sc, status, rec, ttxt});
        }
    }

    @Override
    public void dispose() {
        if (refreshTimer != null && refreshTimer.isRunning()) refreshTimer.stop();
        super.dispose();
    }

    private JPanel dashboardCard(String title, String mainValue, String colorHex) {
        JPanel p = AppTheme.cardPanel();
        p.setLayout(new BoxLayout(p, BoxLayout.Y_AXIS));
        p.setPreferredSize(new Dimension(280, 130));

        // Add colored accent border on the right side
        if (colorHex != null) {
            java.awt.Color accentColor = java.awt.Color.decode(colorHex);
            p.setBorder(javax.swing.BorderFactory.createCompoundBorder(
                javax.swing.BorderFactory.createMatteBorder(0, 0, 0, 4, accentColor),
                new EmptyBorder(15, 20, 15, 20)
            ));
        }

        JLabel t = AppTheme.createFieldLabel(title);
        t.setForeground(AppTheme.MUTED);
        t.setAlignmentX(Component.CENTER_ALIGNMENT);
        t.setHorizontalAlignment(javax.swing.SwingConstants.CENTER);

        JLabel v = new JLabel(mainValue);
        v.setForeground(colorHex != null ? java.awt.Color.decode(colorHex) : AppTheme.TEXT);
        v.setFont(new java.awt.Font("Arial", java.awt.Font.BOLD, 36));
        v.setAlignmentX(Component.CENTER_ALIGNMENT);
        v.setHorizontalAlignment(javax.swing.SwingConstants.CENTER);

        // keep references for live updates
        String cleanTitle = title.replaceAll("^[^א-ת]*", "").trim();
        if (cleanTitle.startsWith("ציון")) avgValueLabel = v;
        else if (cleanTitle.startsWith("השלמת")) completionValueLabel = v;
        else if (cleanTitle.startsWith("עובדים")) highRiskValueLabel = v;
        else if (cleanTitle.startsWith("התקדמות")) monthlyValueLabel = v;

        p.add(Box.createVerticalGlue());
        p.add(t);
        p.add(Box.createVerticalStrut(10));
        p.add(v);
        p.add(Box.createVerticalGlue());

        return p;
    }

    private JPanel chartPlaceholder(String title, int w, int h) {
        JPanel p = AppTheme.cardPanel();
        p.setPreferredSize(new Dimension(w, h));
        p.setLayout(new BoxLayout(p, BoxLayout.Y_AXIS));
        p.setBorder(new EmptyBorder(12, 15, 12, 15));

        JLabel t = new JLabel(title);
        t.setFont(AppTheme.SUBTITLE);
        t.setForeground(AppTheme.TEXT);
        t.setAlignmentX(Component.CENTER_ALIGNMENT);
        p.add(t);
        p.add(Box.createVerticalStrut(8));

        JPanel box = new JPanel();
        box.setBackground(new java.awt.Color(40, 45, 70));
        box.setPreferredSize(new Dimension(w - 30, h - 50));
        box.setMaximumSize(new Dimension(w - 30, h - 50));

        JLabel placeholder = new JLabel("בקרוב...");
        placeholder.setForeground(AppTheme.MUTED);
        placeholder.setFont(AppTheme.TEXT_FONT);
        box.add(placeholder);

        p.add(box);
        return p;
    }

    
}