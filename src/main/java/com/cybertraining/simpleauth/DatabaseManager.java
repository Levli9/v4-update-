package com.cybertraining.simpleauth;

import org.mindrot.jbcrypt.BCrypt;

import java.io.File;
import java.sql.*;

public class DatabaseManager {

    private final String dbPath;

    public DatabaseManager(String dbPath) {
        this.dbPath = dbPath;
        createDataDirIfNeeded();
        createTables();
    }

    private void createDataDirIfNeeded() {
        File f = new File("data");
        if (!f.exists()) f.mkdirs();
    }

    private Connection getConnection() throws SQLException {
        String url = "jdbc:sqlite:" + dbPath;
        return DriverManager.getConnection(url);
    }

    private void createTables() {
        String sql = "CREATE TABLE IF NOT EXISTS users (" +
            "id INTEGER PRIMARY KEY AUTOINCREMENT, " +
            "username TEXT UNIQUE NOT NULL, " +
            "password TEXT NOT NULL, " +
            "role TEXT NOT NULL" +
            ")";

        try (Connection c = getConnection(); Statement s = c.createStatement()) {
            s.execute(sql);
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
    }

    public boolean userExists(String username) {
        String q = "SELECT 1 FROM users WHERE username = ? LIMIT 1";
        try (Connection c = getConnection(); PreparedStatement p = c.prepareStatement(q)) {
            p.setString(1, username);
            try (ResultSet rs = p.executeQuery()) {
                return rs.next();
            }
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
    }

    public boolean registerUser(String username, String password, String role) {
        String hashed = BCrypt.hashpw(password, BCrypt.gensalt());
        String ins = "INSERT INTO users(username, password, role) VALUES(?,?,?)";
        try (Connection c = getConnection(); PreparedStatement p = c.prepareStatement(ins)) {
            p.setString(1, username);
            p.setString(2, hashed);
            p.setString(3, role);
            p.executeUpdate();
            return true;
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    public boolean authenticate(String username, String password) {
        String q = "SELECT password FROM users WHERE username = ? LIMIT 1";
        try (Connection c = getConnection(); PreparedStatement p = c.prepareStatement(q)) {
            p.setString(1, username);
            try (ResultSet rs = p.executeQuery()) {
                if (!rs.next()) return false;
                String hashed = rs.getString(1);
                return BCrypt.checkpw(password, hashed);
            }
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
    }

}



