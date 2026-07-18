import crypto from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';
import bcrypt from 'bcryptjs';

const SESSION_TOKEN_BYTES = 32;
const BCRYPT_ROUNDS = 12;

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

const verifyScryptPassword = (password, encoded) => {
  const [, saltHex, hashHex] = String(encoded).split('$');
  if (!saltHex || !hashHex) return false;

  try {
    const expected = Buffer.from(hashHex, 'hex');
    const actual = crypto.scryptSync(password, Buffer.from(saltHex, 'hex'), expected.length);
    return expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
  } catch {
    return false;
  }
};

export const hashAuthPassword = (password) => bcrypt.hashSync(password, BCRYPT_ROUNDS);

export const verifyAuthPassword = (password, encoded = '') => {
  if (/^\$2[aby]\$\d{2}\$/.test(encoded)) {
    return bcrypt.compareSync(password, encoded);
  }
  if (encoded.startsWith('scrypt$')) {
    return verifyScryptPassword(password, encoded);
  }
  return false;
};

const addColumn = (db, table, definition) => {
  const columnName = definition.split(/\s+/)[0];
  const columns = db.prepare(`PRAGMA table_info(${table})`).all();
  if (!columns.some((column) => column.name === columnName)) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${definition}`);
  }
};

const toPublicUser = (record) => record ? ({
  id: Number(record.id),
  username: record.username,
  fullName: record.full_name || '',
  role: ['admin', 'manager'].includes(record.role) ? record.role : 'employee',
  requestedRole: record.requested_role === 'manager' ? 'manager' : 'employee',
  department: record.department || 'כללי',
  email: record.email,
  avatar: record.avatar || '',
  status: ['pending', 'rejected'].includes(record.status) ? record.status : 'approved',
  createdAt: record.created_at ? new Date(Number(record.created_at)).toISOString() : null,
  lastLogin: record.last_login ? new Date(Number(record.last_login)).toISOString() : null
}) : null;

export const createAuthStore = (databasePath, { sessionExpiryHours = 12 } = {}) => {
  const db = new DatabaseSync(databasePath);
  db.exec('PRAGMA foreign_keys = ON');
  db.exec('PRAGMA busy_timeout = 5000');
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      full_name TEXT,
      role TEXT,
      department TEXT,
      email TEXT NOT NULL,
      created_at INTEGER
    )
  `);

  addColumn(db, 'users', "full_name TEXT NOT NULL DEFAULT ''");
  addColumn(db, 'users', "role TEXT NOT NULL DEFAULT 'employee'");
  addColumn(db, 'users', "department TEXT NOT NULL DEFAULT 'כללי'");
  addColumn(db, 'users', 'created_at INTEGER');
  addColumn(db, 'users', "status TEXT NOT NULL DEFAULT 'approved'");
  addColumn(db, 'users', "requested_role TEXT NOT NULL DEFAULT 'employee'");
  addColumn(db, 'users', "avatar TEXT NOT NULL DEFAULT ''");
  addColumn(db, 'users', 'updated_at INTEGER');
  addColumn(db, 'users', 'last_login INTEGER');
  db.prepare(`
    UPDATE users
    SET requested_role = role
    WHERE role IN ('manager', 'admin') AND requested_role = 'employee'
  `).run();

  db.exec(`
    CREATE TABLE IF NOT EXISTS auth_sessions (
      token_hash TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL,
      expires_at INTEGER NOT NULL,
      created_at INTEGER NOT NULL,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_auth_sessions_user_id ON auth_sessions(user_id);
    CREATE INDEX IF NOT EXISTS idx_auth_sessions_expires_at ON auth_sessions(expires_at);
  `);

  const sessionLifetimeMs = Math.max(1, Number(sessionExpiryHours) || 12) * 60 * 60 * 1000;

  const findById = (id) => db.prepare('SELECT * FROM users WHERE id = ? LIMIT 1').get(id) || null;

  const resolveSession = (token, now = Date.now()) => {
    if (!token) return null;
    db.prepare('DELETE FROM auth_sessions WHERE expires_at <= ?').run(now);
    const record = db.prepare(`
      SELECT u.*
      FROM auth_sessions s
      JOIN users u ON u.id = s.user_id
      WHERE s.token_hash = ? AND s.expires_at > ?
      LIMIT 1
    `).get(hashToken(token), now);
    return toPublicUser(record);
  };

  return {
    register({ username, password, email, requestedRole, department, avatar = '' }) {
      const duplicate = db.prepare(
        'SELECT id FROM users WHERE lower(username) = lower(?) OR lower(email) = lower(?) LIMIT 1'
      ).get(username, email);
      if (duplicate) return { duplicate: true };

      const now = Date.now();
      const result = db.prepare(`
        INSERT INTO users (
          username, password, full_name, role, requested_role, department, email,
          avatar, status, created_at, updated_at
        ) VALUES (?, ?, ?, 'employee', ?, ?, ?, ?, 'pending', ?, ?)
      `).run(
        username,
        hashAuthPassword(password),
        username,
        requestedRole === 'manager' ? 'manager' : 'employee',
        department,
        email,
        avatar,
        now,
        now
      );
      return { user: toPublicUser(findById(Number(result.lastInsertRowid))) };
    },

    authenticate(username, password) {
      const record = db.prepare('SELECT * FROM users WHERE lower(username) = lower(?) LIMIT 1').get(username);
      if (!record || !verifyAuthPassword(password, record.password)) return null;
      return toPublicUser(record);
    },

    createSession(userId, now = Date.now()) {
      const token = crypto.randomBytes(SESSION_TOKEN_BYTES).toString('base64url');
      const expiresAt = now + sessionLifetimeMs;
      db.prepare('INSERT INTO auth_sessions (token_hash, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)')
        .run(hashToken(token), userId, expiresAt, now);
      db.prepare('UPDATE users SET last_login = ?, updated_at = ? WHERE id = ?').run(now, now, userId);
      return { token, expiresAt, user: toPublicUser(findById(userId)) };
    },

    resolveSession,

    revokeSession(token) {
      if (token) db.prepare('DELETE FROM auth_sessions WHERE token_hash = ?').run(hashToken(token));
    },

    revokeUserSessions(userId) {
      db.prepare('DELETE FROM auth_sessions WHERE user_id = ?').run(userId);
    },

    listUsers(actor) {
      const rows = actor?.role === 'admin'
        ? db.prepare('SELECT * FROM users ORDER BY created_at DESC, id DESC').all()
        : db.prepare('SELECT * FROM users WHERE department = ? ORDER BY created_at DESC, id DESC')
          .all(actor?.department || '');
      return rows.map(toPublicUser);
    },

    reviewUser({ actor, userId, decision }) {
      const target = findById(userId);
      if (!target) return { error: 'NOT_FOUND' };
      if (target.role === 'admin' && actor.role !== 'admin') return { error: 'FORBIDDEN' };
      if (actor.role !== 'admin' && target.department !== actor.department) return { error: 'FORBIDDEN' };
      if (actor.role !== 'admin' && target.requested_role === 'manager') return { error: 'FORBIDDEN' };
      if (Number(target.id) === Number(actor.id) && decision !== 'approve') return { error: 'SELF_LOCK' };

      const status = decision === 'approve' ? 'approved' : decision === 'pending' ? 'pending' : 'rejected';
      const approvedRole = target.requested_role === 'manager' ? 'manager' : 'employee';
      db.prepare('UPDATE users SET status = ?, role = ?, updated_at = ? WHERE id = ?')
        .run(status, status === 'approved' ? approvedRole : target.role, Date.now(), userId);
      if (status !== 'approved') this.revokeUserSessions(userId);
      return { user: toPublicUser(findById(userId)) };
    },

    updateProfile(userId, { username, avatar }) {
      const duplicate = db.prepare('SELECT id FROM users WHERE lower(username) = lower(?) AND id <> ? LIMIT 1')
        .get(username, userId);
      if (duplicate) return { duplicate: true };
      db.prepare('UPDATE users SET username = ?, full_name = ?, avatar = ?, updated_at = ? WHERE id = ?')
        .run(username, username, avatar || '', Date.now(), userId);
      return { user: toPublicUser(findById(userId)) };
    },

    changePassword(userId, currentPassword, nextPassword) {
      const record = findById(userId);
      if (!record || !verifyAuthPassword(currentPassword, record.password)) return { invalidPassword: true };
      db.prepare('UPDATE users SET password = ?, updated_at = ? WHERE id = ?')
        .run(hashAuthPassword(nextPassword), Date.now(), userId);
      this.revokeUserSessions(userId);
      return { success: true };
    },

    close() {
      db.close();
    }
  };
};
