import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { createPasswordResetStore, hashPassword, hashResetToken } from '../server/passwordResetStore.js';

const fixture = () => {
  const directory = mkdtempSync(join(tmpdir(), 'shieldx-reset-store-'));
  const databasePath = join(directory, 'auth.db');
  const db = new DatabaseSync(databasePath);
  db.exec(`
    CREATE TABLE users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      email TEXT NOT NULL
    );
    CREATE TABLE password_recovery_tokens (
      user_id INTEGER PRIMARY KEY,
      token_hash TEXT NOT NULL,
      expires_at INTEGER NOT NULL,
      FOREIGN KEY(user_id) REFERENCES users(id)
    );
  `);
  db.prepare('INSERT INTO users (username, password, email) VALUES (?, ?, ?)').run(
    'test-user',
    'old-password-hash',
    'test@example.com'
  );
  db.close();
  return { directory, databasePath };
};

test('stores only a token hash, consumes once, and updates the password atomically', () => {
  const { directory, databasePath } = fixture();
  const store = createPasswordResetStore(databasePath);
  const user = store.findUserByEmail('TEST@example.com');
  const rawToken = 'raw-secret-reset-token';
  const tokenHash = hashResetToken(rawToken);
  store.create(user.id, tokenHash, Date.now() + 60_000);

  assert.deepEqual(store.peek(tokenHash), { email: 'test@example.com' });
  const newHash = hashPassword('StrongPassword123!');
  assert.deepEqual(store.consume(tokenHash, newHash), { email: 'test@example.com', userId: user.id });
  assert.equal(store.peek(tokenHash), null);
  assert.equal(store.consume(tokenHash, newHash), null);
  store.close();

  const db = new DatabaseSync(databasePath);
  const tokenRow = db.prepare('SELECT token_hash, used_at FROM password_recovery_tokens').get();
  const userRow = db.prepare('SELECT password FROM users WHERE id = ?').get(user.id);
  assert.equal(tokenRow.token_hash, tokenHash);
  assert.notEqual(tokenRow.token_hash, rawToken);
  assert.ok(tokenRow.used_at);
  assert.match(userRow.password, /^scrypt\$/);
  db.close();
  rmSync(directory, { recursive: true, force: true });
});

test('rejects invalid and expired tokens', () => {
  const { directory, databasePath } = fixture();
  const store = createPasswordResetStore(databasePath);
  const user = store.findUserByEmail('test@example.com');
  const expiredHash = hashResetToken('expired-token');
  store.create(user.id, expiredHash, Date.now() - 1);
  assert.equal(store.peek(expiredHash), null);
  assert.equal(store.peek(hashResetToken('invalid-token')), null);
  assert.equal(store.consume(expiredHash, hashPassword('StrongPassword123!')), null);
  store.close();
  rmSync(directory, { recursive: true, force: true });
});
