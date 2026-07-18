import crypto from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';

export const hashResetToken = (token) => crypto.createHash('sha256').update(token).digest('hex');
export const hashPassword = (password) => {
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync(password, salt, 64);
  return `scrypt$${salt.toString('hex')}$${hash.toString('hex')}`;
};

export const createPasswordResetStore = (databasePath) => {
  const db = new DatabaseSync(databasePath);
  db.exec('PRAGMA foreign_keys = ON');
  db.exec(`
    CREATE TABLE IF NOT EXISTS password_recovery_tokens (
      user_id INTEGER PRIMARY KEY,
      token_hash TEXT NOT NULL,
      expires_at INTEGER NOT NULL,
      used_at INTEGER,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);
  const columns = db.prepare('PRAGMA table_info(password_recovery_tokens)').all();
  if (!columns.some((column) => column.name === 'used_at')) {
    db.exec('ALTER TABLE password_recovery_tokens ADD COLUMN used_at INTEGER');
  }

  return {
    findUserByEmail(email) {
      const matches = db.prepare('SELECT id, email FROM users WHERE lower(email) = lower(?) LIMIT 2').all(email);
      return matches.length === 1 ? matches[0] : null;
    },
    create(userId, tokenHash, expiresAt) {
      db.prepare('DELETE FROM password_recovery_tokens WHERE user_id = ?').run(userId);
      db.prepare('INSERT INTO password_recovery_tokens (user_id, token_hash, expires_at, used_at) VALUES (?, ?, ?, NULL)')
        .run(userId, tokenHash, expiresAt);
    },
    remove(userId) {
      db.prepare('DELETE FROM password_recovery_tokens WHERE user_id = ?').run(userId);
    },
    peek(tokenHash, now = Date.now()) {
      const record = db.prepare(`SELECT u.email, pr.expires_at, pr.used_at
        FROM password_recovery_tokens pr JOIN users u ON u.id = pr.user_id
        WHERE pr.token_hash = ? LIMIT 1`).get(tokenHash);
      return record && !record.used_at && Number(record.expires_at) > now ? { email: record.email } : null;
    },
    consume(tokenHash, newPasswordHash, now = Date.now()) {
      db.exec('BEGIN IMMEDIATE');
      try {
        const record = db.prepare(`SELECT pr.user_id, pr.expires_at, pr.used_at, u.email
          FROM password_recovery_tokens pr JOIN users u ON u.id = pr.user_id
          WHERE pr.token_hash = ? LIMIT 1`).get(tokenHash);
        if (!record || record.used_at || Number(record.expires_at) <= now) {
          db.exec('ROLLBACK');
          return null;
        }
        db.prepare('UPDATE users SET password = ? WHERE id = ?').run(newPasswordHash, record.user_id);
        db.prepare('UPDATE password_recovery_tokens SET used_at = ? WHERE user_id = ?').run(now, record.user_id);
        db.exec('COMMIT');
        return { email: record.email, userId: Number(record.user_id) };
      } catch (error) {
        db.exec('ROLLBACK');
        throw error;
      }
    },
    close() {
      db.close();
    }
  };
};
