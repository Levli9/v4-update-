package com.cybertraining.ui;

import java.awt.BorderLayout;
import java.awt.Component;
import java.awt.Dimension;
import java.awt.FlowLayout;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Locale;


import javax.swing.Box;
import javax.swing.BoxLayout;
import javax.swing.JButton;
import javax.swing.JComboBox;
import javax.swing.DefaultComboBoxModel;
import javax.swing.JFrame;
import javax.swing.JLabel;
import javax.swing.JList;
import javax.swing.JScrollPane;
import javax.swing.JTable;
import javax.swing.JTextArea;
import javax.swing.DefaultListCellRenderer;
import javax.swing.table.DefaultTableModel;
import javax.swing.border.EmptyBorder;
import javax.swing.JPanel;

import com.cybertraining.db.DatabaseManager;
import com.cybertraining.model.User;

public class ManagerDashboardFrame extends JFrame {
    private DatabaseManager db;
    private javax.swing.Timer refreshTimer;
    private javax.swing.Timer clockTimer;
    private JLabel avgValueLabel, completionValueLabel, highRiskValueLabel, monthlyValueLabel;
    private JLabel liveDateTimeLabel;
    private DefaultTableModel tableModel;

    // filter controls (kept as fields so refreshMetrics can read them)
    private javax.swing.JComboBox<String> deptCombo;
    private javax.swing.JComboBox<String> dateRangeCombo;
    private javax.swing.JComboBox<String> courseCombo;
    private javax.swing.JComboBox<String> employeeCombo;
    private final java.util.Map<String, Integer> employeeOptionToId = new java.util.LinkedHashMap<>();

    // chart panels (kept so we can replace data on refresh)
    private SimpleChartPanel pieChart;
    private SimpleChartPanel barChart;

    // insights panels (live text)
    private JTextArea trendTextArea;

    private static final String[] PORTAL_TOPICS = {
        "מהי תקיפת סייבר?",
        "מהי אבטחת סייבר?",
        "תוכנות זדוניות (Malware)",
        "פישינג (Phishing)",
        "Man-in-the-Middle",
        "תקיפת סיסמאות",
        "שיטות הגנה בסייבר",
        "השפעת תקיפות סייבר",
        "APT — איום מתקדם מתמשך",
        "מתקפת DDoS",
        "SQL Injection"
    };

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

        liveDateTimeLabel = new JLabel("");
        liveDateTimeLabel.setFont(AppTheme.TEXT_FONT);
        liveDateTimeLabel.setForeground(AppTheme.MUTED);
        liveDateTimeLabel.setHorizontalAlignment(javax.swing.SwingConstants.CENTER);

        JPanel headerContent = new JPanel();
        headerContent.setOpaque(false);
        headerContent.setLayout(new BoxLayout(headerContent, BoxLayout.Y_AXIS));
        headerTitle.setAlignmentX(Component.CENTER_ALIGNMENT);
        welcomeLabel.setAlignmentX(Component.CENTER_ALIGNMENT);
        liveDateTimeLabel.setAlignmentX(Component.CENTER_ALIGNMENT);
        headerContent.add(headerTitle);
        headerContent.add(Box.createVerticalStrut(5));
        headerContent.add(welcomeLabel);
        headerContent.add(Box.createVerticalStrut(3));
        headerContent.add(liveDateTimeLabel);
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

        // --- Employee filter ---
        JLabel employeeLabel = AppTheme.createFieldLabel("עובד");
        employeeLabel.setMaximumSize(new Dimension(220, 24));
        employeeLabel.setAlignmentX(Component.RIGHT_ALIGNMENT);
        left.add(employeeLabel);
        left.add(Box.createVerticalStrut(6));
        employeeCombo = new javax.swing.JComboBox<>();
        employeeCombo.setMaximumSize(new Dimension(220, 36));
        employeeCombo.setPreferredSize(new Dimension(220, 36));
        styleFilterCombo(employeeCombo);
        populateEmployeeCombo();
        employeeCombo.addActionListener(e -> refreshMetrics());
        left.add(employeeCombo);
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
        styleFilterCombo(deptCombo);
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
        styleFilterCombo(dateRangeCombo);
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
        styleFilterCombo(courseCombo);
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
        cardsRow.setMaximumSize(new Dimension(Integer.MAX_VALUE, 150));
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
        chartsRow.setMaximumSize(new Dimension(Integer.MAX_VALUE, 350));

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
            if (!matchesFilters(r)) continue;
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
        pie.setPreferredSize(new Dimension(400, 250));
        SimpleChartPanel bar = new SimpleChartPanel(SimpleChartPanel.Type.BAR, distribution);
        bar.setPreferredSize(new Dimension(400, 250));
        chartsRow.add(chartCard("📊 התפלגות ציונים (עמודות)", bar, 430, 290));
        chartsRow.add(chartCard("🥧 התפלגות ציונים (עוגה)", pie, 430, 290));

        // assign to fields for refresh
        this.pieChart = pie;
        this.barChart = bar;

        chartsRow.add(createLiveTextCard("📈 מגמת ביצועים ארגונית", 320, 290, true));
        right.add(chartsRow);

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
            String rec = sc < 70 ? "לשנן את החומר (דחוף)" : (sc < 90 ? "לשנן את החומר" : "אין צורך");
            String ttxt = ts == 0 ? "-" : new java.text.SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new java.util.Date(normalizeTimestampToMillis(ts)));
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
        refreshTimer = new javax.swing.Timer(1000, e -> refreshMetrics());
        refreshTimer.start();

        // live date/time in header
        updateLiveDateTime();
        clockTimer = new javax.swing.Timer(1000, e -> updateLiveDateTime());
        clockTimer.start();

        // first paint should show actual data immediately
        refreshMetrics();

        main.add(right, BorderLayout.CENTER);

        bg.add(main, BorderLayout.CENTER);

        AppTheme.applyRTL(bg);
        AppWindow.navigate(bg);
    }

    private void refreshMetrics() {
        java.util.List<com.cybertraining.model.Result> filteredResults = getFilteredResults();

        // update KPI labels
        java.util.List<com.cybertraining.model.Result> allResultsForKpi = filteredResults;
        java.util.Map<Integer, Integer> latestScoreByUser = new java.util.HashMap<>();
        java.util.Map<Integer, Long> latestTsByUser = new java.util.HashMap<>();
        int scoreSum = 0;
        int scoreCount = 0;
        int completionUsers = 0;

        for (com.cybertraining.model.Result r : allResultsForKpi) {

            scoreSum += r.getScore();
            scoreCount++;

            com.cybertraining.model.User u = r.getUser();
            if (u == null) continue;
            int uid = u.getId();
            if (!latestTsByUser.containsKey(uid) || r.getTimestamp() > latestTsByUser.get(uid)) {
                latestTsByUser.put(uid, r.getTimestamp());
                latestScoreByUser.put(uid, r.getScore());
            }
        }

        completionUsers = latestScoreByUser.size();
        double avg = scoreCount == 0 ? 0 : ((double) scoreSum / scoreCount);
        int totalUsers = Math.max(1, db.getUserCount());
        int completion = (int) Math.round((completionUsers * 100.0) / totalUsers);
        int highRisk = 0;
        for (Integer sc : latestScoreByUser.values()) {
            if (sc < 50) highRisk++;
        }
        int monthly = db.getMonthlyProgressPercent(1);
        if (avgValueLabel != null) avgValueLabel.setText(String.format("%d%%", (int)Math.round(avg)));
        if (completionValueLabel != null) completionValueLabel.setText(String.format("%d%%", completion));
        if (highRiskValueLabel != null) highRiskValueLabel.setText(String.valueOf(highRisk));
        if (monthlyValueLabel != null) monthlyValueLabel.setText((monthly >= 0 ? "+" : "") + monthly + "%");

        // refresh table rows and recalculate distribution for charts
        java.util.List<com.cybertraining.model.Result> allResults = filteredResults;
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
            String rec = sc < 70 ? "לשנן את החומר (דחוף)" : (sc < 90 ? "לשנן את החומר" : "אין צורך");
            String ttxt = ts == 0 ? "-" : new java.text.SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new java.util.Date(normalizeTimestampToMillis(ts)));
            tableModel.addRow(new Object[]{name, dept, att, sc, status, rec, ttxt});
        }

        updateInsights(filteredResults, latestScore, latestTs, attempts, distribution);
    }

    @Override
    public void dispose() {
        if (refreshTimer != null && refreshTimer.isRunning()) refreshTimer.stop();
        if (clockTimer != null && clockTimer.isRunning()) clockTimer.stop();
        super.dispose();
    }

    private boolean matchesFilters(com.cybertraining.model.Result r) {
        if (r == null) return false;

        Integer selectedEmployeeId = getSelectedEmployeeId();
        if (selectedEmployeeId != null) {
            com.cybertraining.model.User ru = r.getUser();
            if (ru == null || ru.getId() != selectedEmployeeId) return false;
        }

        String selectedCourse = (String) courseCombo.getSelectedItem();
        if (!"כל ההדרכות".equals(selectedCourse)) {
            if ("יסודות אבטחת מידע".equals(selectedCourse)) {
                if (r.getCourse() == null || r.getCourse().getId() != 1) return false;
            }
        }

        String selectedDept = (String) deptCombo.getSelectedItem();
        if (selectedDept != null && !"כל המחלקות".equals(selectedDept)) {
            com.cybertraining.model.User user = r.getUser();
            String dept = user != null ? user.getDepartment() : null;
            if (dept == null || !selectedDept.equals(dept)) return false;
        }

        return matchesDateRange(r.getTimestamp());
    }

    private boolean matchesDateRange(long timestampRaw) {
        if (dateRangeCombo == null) return true;
        String selected = (String) dateRangeCombo.getSelectedItem();
        if (selected == null || "הכל".equals(selected)) return true;

        long now = Instant.now().toEpochMilli();
        long minTs;
        switch (selected) {
            case "7 ימים אחרונים":
                minTs = now - (7L * 24L * 60L * 60L * 1000L);
                break;
            case "30 ימים אחרונים":
                minTs = now - (30L * 24L * 60L * 60L * 1000L);
                break;
            case "90 ימים אחרונים":
                minTs = now - (90L * 24L * 60L * 60L * 1000L);
                break;
            case "שנה אחרונה":
                minTs = now - (365L * 24L * 60L * 60L * 1000L);
                break;
            default:
                return true;
        }
        long tsMillis = normalizeTimestampToMillis(timestampRaw);
        return tsMillis >= minTs;
    }

    private long normalizeTimestampToMillis(long timestampRaw) {
        if (timestampRaw <= 0) return 0L;
        // Heuristic: epoch seconds are around 1e9, epoch millis are around 1e12
        return timestampRaw < 100_000_000_000L ? (timestampRaw * 1000L) : timestampRaw;
    }

    private void updateLiveDateTime() {
        if (liveDateTimeLabel == null) return;
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss", new Locale("he", "IL"));
        String nowText = LocalDateTime.now(ZoneId.systemDefault()).format(formatter);
        liveDateTimeLabel.setText("🕒 " + nowText);
    }

    private void styleFilterCombo(javax.swing.JComboBox<String> combo) {
        combo.setBackground(java.awt.Color.WHITE);
        combo.setForeground(java.awt.Color.BLACK);
        combo.setFocusable(false);

        DefaultListCellRenderer renderer = new DefaultListCellRenderer() {
            @Override
            public Component getListCellRendererComponent(JList<?> list, Object value, int index, boolean isSelected, boolean cellHasFocus) {
                Component c = super.getListCellRendererComponent(list, value, index, isSelected, cellHasFocus);
                if (isSelected) {
                    c.setBackground(new java.awt.Color(220, 235, 255));
                    c.setForeground(java.awt.Color.BLACK);
                } else {
                    c.setBackground(java.awt.Color.WHITE);
                    c.setForeground(java.awt.Color.BLACK);
                }
                return c;
            }
        };
        combo.setRenderer(renderer);
    }

    private void populateEmployeeCombo() {
        if (employeeCombo == null) return;
        Object oldSelection = employeeCombo.getSelectedItem();

        employeeOptionToId.clear();
        DefaultComboBoxModel<String> model = new DefaultComboBoxModel<>();
        model.addElement("כל העובדים");

        java.util.Map<Integer, com.cybertraining.model.User> usersById = new java.util.LinkedHashMap<>();
        for (com.cybertraining.model.Result r : db.getResults()) {
            com.cybertraining.model.User u = r.getUser();
            if (u != null) usersById.put(u.getId(), u);
        }

        java.util.List<com.cybertraining.model.User> users = new java.util.ArrayList<>(usersById.values());
        users.sort(java.util.Comparator.comparing(u -> {
            String n = u.getName();
            return n == null ? "" : n;
        }));

        for (com.cybertraining.model.User u : users) {
            if (u.isManager()) continue;
            String displayName = (u.getName() == null || u.getName().trim().isEmpty()) ? u.getUsername() : u.getName();
            String option = displayName + " • " + u.getUsername();
            model.addElement(option);
            employeeOptionToId.put(option, u.getId());
        }

        employeeCombo.setModel(model);
        if (oldSelection != null) {
            employeeCombo.setSelectedItem(oldSelection);
            if (employeeCombo.getSelectedIndex() < 0) employeeCombo.setSelectedIndex(0);
        } else {
            employeeCombo.setSelectedIndex(0);
        }
    }

    private Integer getSelectedEmployeeId() {
        if (employeeCombo == null) return null;
        Object selected = employeeCombo.getSelectedItem();
        if (selected == null) return null;
        String key = selected.toString();
        if ("כל העובדים".equals(key)) return null;
        return employeeOptionToId.get(key);
    }

    private java.util.List<com.cybertraining.model.Result> getFilteredResults() {
        java.util.List<com.cybertraining.model.Result> filtered = new java.util.ArrayList<>();
        for (com.cybertraining.model.Result r : db.getResults()) {
            if (matchesFilters(r)) filtered.add(r);
        }
        return filtered;
    }

    private JPanel chartCard(String title, JPanel chart, int w, int h) {
        JPanel card = AppTheme.cardPanel();
        card.setLayout(new BorderLayout());
        card.setPreferredSize(new Dimension(w, h));
        card.setBorder(new EmptyBorder(10, 12, 10, 12));

        JLabel t = new JLabel(title, javax.swing.SwingConstants.CENTER);
        t.setFont(AppTheme.SUBTITLE);
        t.setForeground(AppTheme.TEXT);
        card.add(t, BorderLayout.NORTH);
        card.add(chart, BorderLayout.CENTER);
        return card;
    }

    private JPanel createLiveTextCard(String title, int w, int h, boolean trendCard) {
        JPanel p = AppTheme.cardPanel();
        p.setPreferredSize(new Dimension(w, h));
        p.setLayout(new BorderLayout(0, 8));
        p.setBorder(new EmptyBorder(12, 15, 12, 15));

        JLabel t = new JLabel(title, javax.swing.SwingConstants.CENTER);
        t.setFont(AppTheme.SUBTITLE);
        t.setForeground(AppTheme.TEXT);
        p.add(t, BorderLayout.NORTH);

        JTextArea area = new JTextArea();
        area.setEditable(false);
        area.setLineWrap(true);
        area.setWrapStyleWord(true);
        area.setFont(AppTheme.TEXT_FONT);
        area.setBackground(new java.awt.Color(40, 45, 70));
        area.setForeground(AppTheme.TEXT);
        area.setBorder(new EmptyBorder(10, 10, 10, 10));

        JScrollPane sc = new JScrollPane(area);
        sc.setBorder(null);
        sc.getViewport().setBackground(new java.awt.Color(40, 45, 70));
        p.add(sc, BorderLayout.CENTER);

        if (trendCard) trendTextArea = area;
        return p;
    }

    private void updateInsights(
            java.util.List<com.cybertraining.model.Result> filteredResults,
            java.util.Map<Integer, Integer> latestScore,
            java.util.Map<Integer, Long> latestTs,
            java.util.Map<Integer, Integer> attempts,
            java.util.Map<String, Integer> distribution) {

        if (trendTextArea == null) return;

        Integer selectedEmployeeId = getSelectedEmployeeId();
        if (selectedEmployeeId != null) {
            com.cybertraining.model.User user = db.getUserById(selectedEmployeeId);
            String userName = user != null ? user.getName() : "עובד";
            int latest = latestScore.getOrDefault(selectedEmployeeId, 0);
            int tries = attempts.getOrDefault(selectedEmployeeId, 0);

            java.util.List<com.cybertraining.model.Result> personal = new java.util.ArrayList<>();
            for (com.cybertraining.model.Result r : filteredResults) {
                com.cybertraining.model.User ru = r.getUser();
                if (ru != null && ru.getId() == selectedEmployeeId) personal.add(r);
            }
            personal.sort((a, b) -> Long.compare(b.getTimestamp(), a.getTimestamp()));

            int avg = 0;
            if (!personal.isEmpty()) {
                int sum = 0;
                for (com.cybertraining.model.Result r : personal) sum += r.getScore();
                avg = Math.round((float) sum / personal.size());
            }

            String pass = latest >= 70 ? "עובר" : "לא עובר";
            String rec = latest < 70 ? "לשנן את החומר (דחוף)" : (latest < 90 ? "לשנן את החומר" : "אין צורך");
            String trend = "יציב";
            if (personal.size() >= 2) {
                int d = personal.get(0).getScore() - personal.get(1).getScore();
                if (d > 0) trend = "במגמת שיפור (" + (d >= 0 ? "+" : "") + d + ")";
                else if (d < 0) trend = "במגמת ירידה (" + d + ")";
            }

            long lastTs = latestTs.getOrDefault(selectedEmployeeId, 0L);
            String lastTime = lastTs <= 0 ? "-" : new java.text.SimpleDateFormat("dd/MM/yyyy HH:mm:ss").format(new java.util.Date(normalizeTimestampToMillis(lastTs)));

            trendTextArea.setText(
                "עובד: " + userName + "\n"
                + "ציון אחרון: " + latest + "\n"
                + "סטטוס מעבר (70): " + pass + "\n"
                + "המלצה: " + rec + "\n"
                + "ממוצע אישי בטווח: " + avg + "\n"
                + "מס' ניסיונות: " + tries + "\n"
                + "מגמה: " + trend + "\n"
                + "ניסיון אחרון: " + lastTime
            );

            return;
        }

        int totalResults = filteredResults.size();
        int passCount = 0;
        int lowCount = 0;
        int sum = 0;
        for (Integer s : latestScore.values()) {
            sum += s;
            if (s >= 70) passCount++;
            if (s < 70) lowCount++;
        }
        int activeEmployees = latestScore.size();
        int avg = activeEmployees == 0 ? 0 : Math.round((float) sum / activeEmployees);
        int passRate = activeEmployees == 0 ? 0 : Math.round((passCount * 100f) / activeEmployees);

        Integer highBand = distribution.getOrDefault("85-100", 0);
        Integer midBand = distribution.getOrDefault("70-84", 0);

        trendTextArea.setText(
            "תוצאות בטווח המסונן: " + totalResults + "\n"
            + "עובדים פעילים: " + activeEmployees + "\n"
            + "ממוצע ציון אחרון: " + avg + "\n"
            + "אחוז מעבר (70): " + passRate + "%\n"
            + "מתחת ל-70: " + lowCount + " עובדים\n"
            + "85-100: " + highBand + " תוצאות | 70-84: " + midBand + " תוצאות"
        );

        // strengths/weaknesses section removed from this screen per request
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


}