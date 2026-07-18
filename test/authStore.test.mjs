import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { createAuthStore, hashAuthPassword, verifyAuthPassword } from '../server/authStore.js';

const fixture = () => {
  const directory = mkdtempSync(join(tmpdir(), 'shieldx-auth-'));
  const databasePath = join(directory, 'auth.db');
  const db = new DatabaseSync(databasePath);
  db.exec(`
    CREATE TABLE users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      email TEXT NOT NULL
    )
  `);
  db.close();
  return { directory, databasePath };
};

test('hashes and verifies passwords without exposing credentials', () => {
  const hash = hashAuthPassword('StrongPassword123!');
  assert.match(hash, /^\$2[aby]\$12\$/);
  assert.notEqual(hash, 'StrongPassword123!');
  assert.equal(verifyAuthPassword('StrongPassword123!', hash), true);
  assert.equal(verifyAuthPassword('WrongPassword123!', hash), false);
});

test('registration, approval, sessions and password changes are enforced server-side', () => {
  const { directory, databasePath } = fixture();
  const store = createAuthStore(databasePath, { sessionExpiryHours: 1 });
  const registration = store.register({
    username: 'New.User',
    password: 'StrongPassword123!',
    email: 'new.user@example.com',
    requestedRole: 'manager',
    department: 'Security'
  });
  assert.equal(registration.user.status, 'pending');
  assert.equal(registration.user.requestedRole, 'manager');
  assert.equal('password' in registration.user, false);
  assert.equal(store.register({
    username: 'new.user',
    password: 'StrongPassword123!',
    email: 'different@example.com'
  }).duplicate, true);

  const authenticated = store.authenticate('new.user', 'StrongPassword123!');
  assert.equal(authenticated.id, registration.user.id);
  const reviewer = { id: 999, role: 'admin', department: 'Security' };
  const approved = store.reviewUser({ actor: reviewer, userId: authenticated.id, decision: 'approve' });
  assert.equal(approved.user.status, 'approved');
  assert.equal(approved.user.role, 'manager');

  const session = store.createSession(authenticated.id);
  assert.equal(store.resolveSession(session.token).username, 'New.User');
  assert.equal(store.resolveSession('invalid-token'), null);

  assert.equal(store.changePassword(authenticated.id, 'wrong', 'NextPassword123!').invalidPassword, true);
  assert.equal(store.changePassword(authenticated.id, 'StrongPassword123!', 'NextPassword123!').success, true);
  assert.equal(store.resolveSession(session.token), null);
  assert.equal(store.authenticate('New.User', 'StrongPassword123!'), null);
  assert.equal(store.authenticate('New.User', 'NextPassword123!').username, 'New.User');

  store.close();
  rmSync(directory, { recursive: true, force: true });
});
