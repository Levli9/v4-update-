import { DatabaseSync } from 'node:sqlite';

const MAX_STATE_BYTES = 250_000;

const safeState = (value = {}) => {
  const progress = value.progress && typeof value.progress === 'object' ? value.progress : {};
  const analytics = value.analytics && typeof value.analytics === 'object' ? value.analytics : {};
  const normalized = {
    progress: {
      ...progress,
      completedSubjects: Array.isArray(progress.completedSubjects) ? progress.completedSubjects.slice(0, 500) : [],
      completedLessons: Array.isArray(progress.completedLessons) ? progress.completedLessons.slice(0, 500) : [],
      completedLabs: Array.isArray(progress.completedLabs) ? progress.completedLabs.slice(0, 500) : [],
      scores: Object.fromEntries(Object.entries(progress.scores || {}).slice(0, 500).map(([key, score]) => [
        String(key).slice(0, 80),
        Math.max(0, Math.min(100, Number(score) || 0))
      ])),
      badges: Array.isArray(progress.badges)
        ? progress.badges.slice(0, 50).map((badge) => String(badge).slice(0, 100))
        : [],
      xp: Math.max(0, Math.min(10_000_000, Number(progress.xp) || 0))
    },
    analytics,
    presence: value.presence && typeof value.presence === 'object' ? value.presence : {},
    lastActivity: value.lastActivity || null
  };
  const serialized = JSON.stringify(normalized);
  if (Buffer.byteLength(serialized, 'utf8') > MAX_STATE_BYTES) throw new Error('STATE_TOO_LARGE');
  return { normalized, serialized };
};

export const createLearningStore = (databasePath) => {
  const db = new DatabaseSync(databasePath);
  db.exec('PRAGMA foreign_keys = ON');
  db.exec('PRAGMA busy_timeout = 5000');
  db.exec(`
    CREATE TABLE IF NOT EXISTS results (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      course_id INTEGER,
      score INTEGER NOT NULL,
      timestamp INTEGER NOT NULL,
      duration INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS topic_progress (
      user_id INTEGER NOT NULL,
      topic_index INTEGER NOT NULL,
      completed_at INTEGER NOT NULL,
      PRIMARY KEY(user_id, topic_index),
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS user_learning_state (
      user_id INTEGER PRIMARY KEY,
      state_json TEXT NOT NULL,
      updated_at INTEGER NOT NULL,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  return {
    get(userId) {
      const row = db.prepare('SELECT state_json, updated_at FROM user_learning_state WHERE user_id = ?').get(userId);
      if (!row) return { progress: {}, analytics: {}, presence: {}, lastActivity: null };
      try {
        return { ...safeState(JSON.parse(row.state_json)).normalized, updatedAt: Number(row.updated_at) };
      } catch {
        return { progress: {}, analytics: {}, presence: {}, lastActivity: null };
      }
    },

    save(userId, state) {
      const { normalized, serialized } = safeState(state);
      const now = Date.now();
      const saveState = db.prepare(`
        INSERT INTO user_learning_state (user_id, state_json, updated_at)
        VALUES (?, ?, ?)
        ON CONFLICT(user_id) DO UPDATE SET state_json = excluded.state_json, updated_at = excluded.updated_at
      `);

      const completed = normalized.progress.completedSubjects;
      const scores = normalized.progress.scores;
      const upsertTopic = db.prepare(`
        INSERT INTO topic_progress (user_id, topic_index, completed_at)
        VALUES (?, ?, ?)
        ON CONFLICT(user_id, topic_index) DO UPDATE SET completed_at = excluded.completed_at
      `);
      const insertResult = db.prepare(`
        INSERT INTO results (user_id, course_id, score, timestamp, duration)
        SELECT ?, ?, ?, ?, 0
        WHERE NOT EXISTS (
          SELECT 1 FROM results
          WHERE user_id = ? AND course_id = ? AND score = ?
          ORDER BY id DESC LIMIT 1
        )
      `);

      db.exec('BEGIN IMMEDIATE');
      try {
        saveState.run(userId, serialized, now);
        for (const subjectId of completed) {
          if (!Number.isInteger(Number(subjectId))) continue;
          upsertTopic.run(userId, Number(subjectId), now);
          const score = Number(scores[subjectId]);
          if (Number.isFinite(score)) {
            insertResult.run(userId, Number(subjectId), score, now, userId, Number(subjectId), score);
          }
        }
        db.exec('COMMIT');
      } catch (error) {
        db.exec('ROLLBACK');
        throw error;
      }
      return { ...normalized, updatedAt: now };
    },

    close() {
      db.close();
    }
  };
};
