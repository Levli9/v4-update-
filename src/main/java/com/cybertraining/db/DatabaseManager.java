package com.cybertraining.db;

import com.cybertraining.model.Course;
import com.cybertraining.model.Question;
import com.cybertraining.model.User;

import com.cybertraining.model.Result;

import java.sql.*;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class DatabaseManager {

    private static final String DB_URL = "jdbc:sqlite:data/auth.db";

    private List<Course> courses = new ArrayList<>();
    private Map<Integer, List<Question>> questions = new HashMap<>();

    public DatabaseManager() {
        try {
            createDataDirIfNeeded();
            createTables();
        } catch (SQLException e) {
            e.printStackTrace();
        }

        seedCourses();
        seedQuestions();
    }

    private void createDataDirIfNeeded() {
        try {
            java.nio.file.Path p = java.nio.file.Paths.get("data");
            if (!java.nio.file.Files.exists(p)) {
                java.nio.file.Files.createDirectories(p);
            }
        } catch (Exception ignored) {
        }
    }

    private Connection getConnection() throws SQLException {
        try {
            Class.forName("org.sqlite.JDBC");
        } catch (ClassNotFoundException e) {
            throw new SQLException("SQLite JDBC driver not found", e);
        }
        return DriverManager.getConnection(DB_URL);
    }

    public void createTables() throws SQLException {
        try (Connection c = getConnection(); Statement s = c.createStatement()) {
            s.execute("PRAGMA foreign_keys = ON;");
            s.execute("CREATE TABLE IF NOT EXISTS users ("
                    + "id INTEGER PRIMARY KEY AUTOINCREMENT,"
                    + "username TEXT NOT NULL UNIQUE,"
                    + "password TEXT NOT NULL,"
                    + "full_name TEXT,"
                    + "role TEXT,"
                    + "department TEXT,"
                    + "email TEXT NOT NULL,"
                    + "created_at INTEGER"
                    + ");");
            // results table
                s.execute("CREATE TABLE IF NOT EXISTS results ("
                    + "id INTEGER PRIMARY KEY AUTOINCREMENT,"
                    + "user_id INTEGER NOT NULL,"
                    + "course_id INTEGER,"
                    + "score INTEGER NOT NULL,"
                    + "timestamp INTEGER NOT NULL,"
                    + "duration INTEGER NOT NULL DEFAULT 0,"
                    + "FOREIGN KEY(user_id) REFERENCES users(id)"
                    + ");");
            // migrate existing users table if some columns are missing (older DB schema)
            try (PreparedStatement ps = c.prepareStatement("PRAGMA table_info(users)")) {
                try (ResultSet rs = ps.executeQuery()) {
                    java.util.Set<String> cols = new java.util.HashSet<>();
                    while (rs.next()) cols.add(rs.getString("name"));
                    if (!cols.contains("full_name")) s.execute("ALTER TABLE users ADD COLUMN full_name TEXT;");
                    if (!cols.contains("role")) s.execute("ALTER TABLE users ADD COLUMN role TEXT;");
                    if (!cols.contains("department")) s.execute("ALTER TABLE users ADD COLUMN department TEXT;");
                    if (!cols.contains("email")) s.execute("ALTER TABLE users ADD COLUMN email TEXT NOT NULL DEFAULT '';");
                    if (!cols.contains("created_at")) s.execute("ALTER TABLE users ADD COLUMN created_at INTEGER;");
                }
            }
            // migrate results table to add duration column if missing
            try (PreparedStatement ps2 = c.prepareStatement("PRAGMA table_info(results)")) {
                try (ResultSet rs2 = ps2.executeQuery()) {
                    java.util.Set<String> rcols = new java.util.HashSet<>();
                    while (rs2.next()) rcols.add(rs2.getString("name"));
                    if (!rcols.contains("duration")) {
                        try {
                            s.execute("ALTER TABLE results ADD COLUMN duration INTEGER DEFAULT 0;");
                        } catch (SQLException ignored) {}
                    }
                }
            }
            // topic_progress table for tracking learning completion per topic
            s.execute("CREATE TABLE IF NOT EXISTS topic_progress ("
                    + "user_id INTEGER NOT NULL,"
                    + "topic_index INTEGER NOT NULL,"
                    + "completed_at INTEGER NOT NULL,"
                    + "PRIMARY KEY(user_id, topic_index),"
                    + "FOREIGN KEY(user_id) REFERENCES users(id)"
                    + ");");

            // Normalize existing role values (support Hebrew/English variants)
            try {
                // If role contains Hebrew 'מנהל' or English 'admin' -> set to 'manager'
                s.executeUpdate("UPDATE users SET role = 'manager' WHERE role LIKE '%מנהל%' OR role LIKE '%admin%';");
                // If role contains Hebrew 'עובד' or is empty/null -> set to 'employee'
                s.executeUpdate("UPDATE users SET role = 'employee' WHERE role IS NULL OR role = '' OR role LIKE '%עובד%' OR role LIKE '%employee%';");
            } catch (SQLException ignored) {
            }
        }
    }

    public User registerUser(String username, String password, String fullName, String roleDisplay, String department, String email) {
        if (username == null || username.trim().isEmpty() || password == null || password.isEmpty() || email == null || email.trim().isEmpty()) {
            return null;
        }

        // if username already exists, avoid SQL exception and return null
        try {
            User existing = getUserByUsername(username);
            if (existing != null) return null;
        } catch (Exception ignored) {}

        // normalize role
        String role = "employee";
        if (roleDisplay != null && roleDisplay.toLowerCase().contains("מנהל")) role = "manager";
        if (roleDisplay != null && roleDisplay.toLowerCase().contains("admin")) role = "manager";

        // build INSERT dynamically based on which columns exist in the users table
        java.util.Set<String> cols = new java.util.HashSet<>();
        try (Connection c = getConnection(); PreparedStatement ps = c.prepareStatement("PRAGMA table_info(users)", Statement.RETURN_GENERATED_KEYS)) {
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) cols.add(rs.getString("name"));
            }

            java.util.List<String> insertCols = new java.util.ArrayList<>();
            insertCols.add("username");
            insertCols.add("password");
            if (cols.contains("full_name")) insertCols.add("full_name");
            if (cols.contains("role")) insertCols.add("role");
            if (cols.contains("department")) insertCols.add("department");
            if (cols.contains("email")) insertCols.add("email");
            if (cols.contains("created_at")) insertCols.add("created_at");

            StringBuilder sql = new StringBuilder("INSERT INTO users(");
            sql.append(String.join(",", insertCols));
            sql.append(") VALUES(");
            sql.append(String.join(",", java.util.Collections.nCopies(insertCols.size(), "?")));
            sql.append(")");

            try (PreparedStatement ins = c.prepareStatement(sql.toString(), Statement.RETURN_GENERATED_KEYS)) {
                int idx = 1;
                ins.setString(idx++, username);
                ins.setString(idx++, password);
                if (cols.contains("full_name")) ins.setString(idx++, fullName);
                if (cols.contains("role")) ins.setString(idx++, role);
                if (cols.contains("department")) ins.setString(idx++, department);
                if (cols.contains("email")) ins.setString(idx++, email);
                if (cols.contains("created_at")) ins.setLong(idx++, Instant.now().getEpochSecond());

                ins.executeUpdate();
                try (ResultSet keys = ins.getGeneratedKeys()) {
                    if (keys.next()) {
                        int id = keys.getInt(1);
                        return new User(id, username, password, fullName, role, department, email);
                    }
                }
            }
        } catch (SQLException e) {
            // log SQL error to help debugging (unique constraint or other DB issues)
            e.printStackTrace();
            return null;
        }

        return null;
    }

    public User authenticate(String username, String password) {
        // Deprecated - use getUserByUsername + BCrypt in AuthenticationService
        return null;
    }

    public User getUserByUsername(String username) {
        String sql = "SELECT * FROM users WHERE username = ? LIMIT 1";
        try (Connection c = getConnection(); PreparedStatement ps = c.prepareStatement(sql)) {
            ps.setString(1, username);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    ResultSetMetaData md = rs.getMetaData();
                    java.util.Set<String> present = new java.util.HashSet<>();
                    for (int i = 1; i <= md.getColumnCount(); i++) present.add(md.getColumnName(i));
                    int id = rs.getInt("id");
                    String user = rs.getString("username");
                    String pass = rs.getString("password");
                    String full = present.contains("full_name") ? rs.getString("full_name") : "";
                    String role = present.contains("role") ? rs.getString("role") : "employee";
                    String dept = present.contains("department") ? rs.getString("department") : "";
                    String email = present.contains("email") ? rs.getString("email") : "";
                    return new User(id, user, pass, full, role, dept, email);
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return null;
    }

    public User getUserById(int id) {
        String sql = "SELECT * FROM users WHERE id = ? LIMIT 1";
        try (Connection c = getConnection(); PreparedStatement ps = c.prepareStatement(sql)) {
            ps.setInt(1, id);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    ResultSetMetaData md = rs.getMetaData();
                    java.util.Set<String> present = new java.util.HashSet<>();
                    for (int i = 1; i <= md.getColumnCount(); i++) present.add(md.getColumnName(i));
                    String user = rs.getString("username");
                    String pass = rs.getString("password");
                    String full = present.contains("full_name") ? rs.getString("full_name") : "";
                    String role = present.contains("role") ? rs.getString("role") : "employee";
                    String dept = present.contains("department") ? rs.getString("department") : "";
                    String email = present.contains("email") ? rs.getString("email") : "";
                    return new User(id, user, pass, full, role, dept, email);
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return null;
    }

    public User getUserByEmail(String email) {
        String sql = "SELECT * FROM users WHERE email = ? LIMIT 1";
        try (Connection c = getConnection(); PreparedStatement ps = c.prepareStatement(sql)) {
            ps.setString(1, email);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    ResultSetMetaData md = rs.getMetaData();
                    java.util.Set<String> present = new java.util.HashSet<>();
                    for (int i = 1; i <= md.getColumnCount(); i++) present.add(md.getColumnName(i));
                    int id = rs.getInt("id");
                    String user = rs.getString("username");
                    String pass = rs.getString("password");
                    String full = present.contains("full_name") ? rs.getString("full_name") : "";
                    String role = present.contains("role") ? rs.getString("role") : "employee";
                    String dept = present.contains("department") ? rs.getString("department") : "";
                    String userEmail = present.contains("email") ? rs.getString("email") : "";
                    return new User(id, user, pass, full, role, dept, userEmail);
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return null;
    }

    public boolean updateUserPassword(int userId, String hashedPassword) {
        String sql = "UPDATE users SET password = ? WHERE id = ?";
        try (Connection c = getConnection(); PreparedStatement ps = c.prepareStatement(sql)) {
            ps.setString(1, hashedPassword);
            ps.setInt(2, userId);
            int rowsAffected = ps.executeUpdate();
            return rowsAffected > 0;
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    public boolean updatePasswordByEmail(String email, String hashedPassword) {
        String sql = "UPDATE users SET password = ? WHERE LOWER(email) = LOWER(?)";
        try (Connection c = getConnection(); PreparedStatement ps = c.prepareStatement(sql)) {
            ps.setString(1, hashedPassword);
            ps.setString(2, email.trim());
            int rowsAffected = ps.executeUpdate();
            System.out.println("[DB] Password update: " + rowsAffected + " row(s) affected for email: " + email);
            return rowsAffected > 0;
        } catch (SQLException e) {
            System.err.println("[DB] Failed to update password by email: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }

    public User authenticate(String username, String password, String roleDisplay) {
        // roleDisplay is ignored for now; keep backward compatible
        return authenticate(username, password);
    }

    public List<Course> getCourses() {
        return courses;
    }

    public List<Question> getQuestionsForCourse(int courseId) {
        return questions.get(courseId);
    }

    public List<Result> getResults() {
        List<Result> out = new ArrayList<>();
        String sql = "SELECT id, user_id, course_id, score, timestamp, duration FROM results ORDER BY timestamp DESC";
        try (Connection c = getConnection(); PreparedStatement ps = c.prepareStatement(sql); ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                int userId = rs.getInt("user_id");
                int courseId = rs.getInt("course_id");
                int score = rs.getInt("score");
                long ts = rs.getLong("timestamp");
                long duration = 0L;
                try { duration = rs.getLong("duration"); } catch (Exception ignored) {}
                User u = getUserById(userId);
                Course course = null;
                for (Course cr : courses) if (cr.getId() == courseId) course = cr;
                Result r = new Result(u, course, score);
                // override timestamp
                try {
                    java.lang.reflect.Field f = Result.class.getDeclaredField("timestamp");
                    f.setAccessible(true);
                    f.setLong(r, ts);
                } catch (Exception ignored) {}
                try {
                    java.lang.reflect.Field fd = Result.class.getDeclaredField("durationSeconds");
                    fd.setAccessible(true);
                    fd.setLong(r, duration);
                } catch (Exception ignored) {}
                out.add(r);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return out;
    }

    public void saveResult(Result result) {
        String sql = "INSERT INTO results(user_id, course_id, score, timestamp, duration) VALUES(?,?,?,?,?)";
        try (Connection c = getConnection(); PreparedStatement ps = c.prepareStatement(sql)) {
            ps.setInt(1, result.getUser() != null ? result.getUser().getId() : 0);
            ps.setInt(2, result.getCourse() != null ? result.getCourse().getId() : 0);
            ps.setInt(3, result.getScore());
            ps.setLong(4, result.getTimestamp());
            ps.setLong(5, result.getDurationSeconds());
            ps.executeUpdate();
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    public int getUserCount() {
        try (Connection c = getConnection(); Statement s = c.createStatement(); ResultSet rs = s.executeQuery("SELECT COUNT(*) AS c FROM users")) {
            if (rs.next()) return rs.getInt("c");
        } catch (SQLException ignored) {
        }
        return 0;
    }

    // Dashboard metrics methods
    public double getAverageScoreForCourse(int courseId) {
        String sql = "SELECT AVG(score) AS avg_score FROM results WHERE course_id = ?";
        try (Connection c = getConnection(); PreparedStatement ps = c.prepareStatement(sql)) {
            ps.setInt(1, courseId);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) return rs.getDouble("avg_score");
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return 0.0;
    }

    public int getCompletionRateForCourse(int courseId) {
        // percentage of users who have any result for this course
        String sql = "SELECT COUNT(DISTINCT user_id) AS c FROM results WHERE course_id = ?";
        int usersWithResults = 0;
        try (Connection c = getConnection(); PreparedStatement ps = c.prepareStatement(sql)) {
            ps.setInt(1, courseId);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) usersWithResults = rs.getInt("c");
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        int total = getUserCount();
        if (total == 0) return 0;
        return (int) Math.round((usersWithResults * 100.0) / total);
    }

    public int countHighRiskEmployees(int courseId, int threshold) {
        // count users whose latest score for this course is below threshold
        String sql = "SELECT user_id, MAX(timestamp) as ts FROM results WHERE course_id = ? GROUP BY user_id";
        int count = 0;
        try (Connection c = getConnection(); PreparedStatement ps = c.prepareStatement(sql)) {
            ps.setInt(1, courseId);
            try (ResultSet rs = ps.executeQuery()) {
                java.util.List<Integer> users = new java.util.ArrayList<>();
                while (rs.next()) users.add(rs.getInt("user_id"));
                for (Integer uid : users) {
                    // get latest score for uid
                    String q = "SELECT score FROM results WHERE course_id = ? AND user_id = ? ORDER BY timestamp DESC LIMIT 1";
                    try (PreparedStatement ps2 = c.prepareStatement(q)) {
                        ps2.setInt(1, courseId);
                        ps2.setInt(2, uid);
                        try (ResultSet rs2 = ps2.executeQuery()) {
                            if (rs2.next()) {
                                int s = rs2.getInt("score");
                                if (s < threshold) count++;
                            }
                        }
                    }
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return count;
    }

    public int getMonthlyProgressPercent(int courseId) {
        // compute percent change between current month average and previous month average
        java.time.ZoneId zid = java.time.ZoneId.systemDefault();
        java.time.LocalDate now = java.time.LocalDate.now(zid);
        java.time.LocalDate firstOfThis = now.withDayOfMonth(1);
        java.time.LocalDate firstOfPrev = firstOfThis.minusMonths(1);
        long thisStart = firstOfThis.atStartOfDay(zid).toEpochSecond();
        long prevStart = firstOfPrev.atStartOfDay(zid).toEpochSecond();

        String sql = "SELECT AVG(score) AS avg_score FROM results WHERE course_id = ? AND timestamp >= ?";
        double thisAvg = 0.0;
        try (Connection c = getConnection(); PreparedStatement ps = c.prepareStatement(sql)) {
            ps.setInt(1, courseId);
            ps.setLong(2, thisStart);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) thisAvg = rs.getDouble("avg_score");
            }
        } catch (SQLException ignored) {}

        double prevAvg = 0.0;
        String sql2 = "SELECT AVG(score) AS avg_score FROM results WHERE course_id = ? AND timestamp >= ? AND timestamp < ?";
        try (Connection c = getConnection(); PreparedStatement ps = c.prepareStatement(sql2)) {
            ps.setInt(1, courseId);
            ps.setLong(2, prevStart);
            ps.setLong(3, thisStart);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) prevAvg = rs.getDouble("avg_score");
            }
        } catch (SQLException ignored) {}

        if (prevAvg == 0) return 0;
        return (int) Math.round(((thisAvg - prevAvg) / prevAvg) * 100.0);
    }

    public java.util.List<Result> getLatestResultsForCourse(int courseId, int limit) {
        java.util.List<Result> out = new java.util.ArrayList<>();
        String sql = "SELECT user_id, score, timestamp, duration FROM results WHERE course_id = ? ORDER BY timestamp DESC LIMIT ?";
        try (Connection c = getConnection(); PreparedStatement ps = c.prepareStatement(sql)) {
            ps.setInt(1, courseId);
            ps.setInt(2, limit);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    int uid = rs.getInt("user_id");
                    int score = rs.getInt("score");
                    long ts = rs.getLong("timestamp");
                    User u = getUserById(uid);
                    Course course = null;
                    for (Course cr : courses) if (cr.getId() == courseId) course = cr;
                    Result r = new Result(u, course, score);
                    try {
                        java.lang.reflect.Field f = Result.class.getDeclaredField("timestamp");
                        f.setAccessible(true);
                        f.setLong(r, ts);
                    } catch (Exception ignored) {}
                    try {
                        java.lang.reflect.Field fd = Result.class.getDeclaredField("durationSeconds");
                        fd.setAccessible(true);
                        fd.setLong(r, rs.getLong("duration"));
                    } catch (Exception ignored) {}
                    out.add(r);
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return out;
    }

    public void markTopicCompleted(int userId, int topicIndex) {
        String sql = "INSERT OR REPLACE INTO topic_progress(user_id, topic_index, completed_at) VALUES(?,?,?)";
        try (Connection c = getConnection(); PreparedStatement ps = c.prepareStatement(sql)) {
            ps.setInt(1, userId);
            ps.setInt(2, topicIndex);
            ps.setLong(3, Instant.now().getEpochSecond());
            ps.executeUpdate();
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    public java.util.Set<Integer> getCompletedTopics(int userId) {
        java.util.Set<Integer> completed = new java.util.HashSet<>();
        String sql = "SELECT topic_index FROM topic_progress WHERE user_id = ?";
        try (Connection c = getConnection(); PreparedStatement ps = c.prepareStatement(sql)) {
            ps.setInt(1, userId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) completed.add(rs.getInt("topic_index"));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return completed;
    }

    private void seedCourses() {
        Course course = new Course(
                1,
                "יסודות אבטחת מידע",
                "קורס בסיסי המלמד את עקרונות אבטחת המידע בארגון."
        );

        courses.add(course);
    }

    private void seedQuestions() {
        // Try to load questions from data/questions.json (JSON array of objects)
        java.nio.file.Path qpath = java.nio.file.Paths.get("data/questions.json");
        if (java.nio.file.Files.exists(qpath)) {
            try {
                String json = new String(java.nio.file.Files.readAllBytes(qpath), java.nio.charset.StandardCharsets.UTF_8);
                // Use Gson to parse the JSON into a helper class
                com.google.gson.Gson gson = new com.google.gson.Gson();
                QuestionEntry[] entries = gson.fromJson(json, QuestionEntry[].class);
                List<Question> list = new ArrayList<>();
                for (QuestionEntry e : entries) {
                    String[] ans = e.answers != null ? e.answers : new String[]{"א", "ב", "ג", "ד"};
                    int idx = e.correctIndex >= 0 && e.correctIndex < ans.length ? e.correctIndex : 0;
                    list.add(new Question(e.category, e.question, ans, idx));
                }
                questions.put(1, list);
                return;
            } catch (Exception ex) {
                ex.printStackTrace();
                // fall through to default seed
            }
        }

        // Fallback single example question if JSON not available or parsing failed
        List<Question> list = new ArrayList<>();
        list.add(new Question("פישינג (Phishing)", "מה מעורר חשד בהודעת דואר אלקטרוני?", new String[]{"קישור לאתר פנימי", "בקשה לשנות סיסמה באופן דחוף עקב פריצה", "הזמנה לפגישת לוח שנה קבועה", "מייל רשמי ממשאבי אנוש"}, 1));
        questions.put(1, list);
    }

    // Helper class for JSON parsing
    private static class QuestionEntry {
        String category;
        String question;
        String[] answers;
        int correctIndex;
    }

}
