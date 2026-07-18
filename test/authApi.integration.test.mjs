import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { hashResetToken } from '../server/passwordResetStore.js';

const directory = mkdtempSync(join(tmpdir(), 'shieldx-api-integration-'));
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
  'api-user',
  'old-password-hash',
  'api-user@example.com'
);
db.close();

Object.assign(process.env, {
  NODE_ENV: 'test',
  AUTH_DATABASE_PATH: databasePath,
  FRONTEND_URL: 'http://localhost:5173/v4-update-/',
  BACKEND_URL: 'http://localhost:5001',
  ALLOWED_ORIGINS: 'http://localhost:5173',
  BREVO_API_KEY: '',
  BREVO_SENDER_EMAIL: ''
});

const { app, closeServerResources } = await import(`../server.js?integration=${Date.now()}`);

const routeHandler = (path, method) => {
  const route = app.router.stack.find((layer) => layer.route?.path === path)?.route;
  return route?.stack.find((layer) => layer.method === method)?.handle;
};

const invoke = async (path, method, body = {}) => {
  const handler = routeHandler(path, method);
  assert.ok(handler, `Missing ${method.toUpperCase()} ${path}`);
  const result = { status: 200, body: undefined };
  const req = { body, ip: '127.0.0.1' };
  const res = {
    status(status) {
      result.status = status;
      return this;
    },
    json(payload) {
      result.body = payload;
      return this;
    }
  };
  await handler(req, res);
  return result;
};

const invokeCors = async ({ origin, method = 'GET' }) => {
  const middleware = app.router.stack.find((layer) => layer.name === 'corsMiddleware')?.handle;
  assert.ok(middleware);
  const headers = new Map();
  const req = { method, headers: { origin } };
  let finish;
  const completed = new Promise((resolve) => {
    finish = resolve;
  });
  const res = {
    statusCode: 200,
    setHeader(name, value) {
      headers.set(name.toLowerCase(), value);
    },
    getHeader(name) {
      return headers.get(name.toLowerCase());
    },
    removeHeader(name) {
      headers.delete(name.toLowerCase());
    },
    end() {
      this.ended = true;
      finish();
    }
  };
  middleware(req, res, finish);
  const error = await completed;
  return { error, res, headers };
};

after(() => {
  closeServerResources();
  rmSync(directory, { recursive: true, force: true });
});

test('health endpoint works', async () => {
  const result = await invoke('/api/health', 'get');
  assert.equal(result.status, 200);
  assert.deepEqual(result.body, { status: 'ok', service: 'shieldx-api' });
});

test('CORS allows the configured origin, supports preflight and rejects another origin', async () => {
  const allowed = await invokeCors({ origin: 'http://localhost:5173' });
  assert.equal(allowed.error, undefined);
  assert.equal(allowed.headers.get('access-control-allow-origin'), 'http://localhost:5173');

  const preflight = await invokeCors({ origin: 'http://localhost:5173', method: 'OPTIONS' });
  assert.equal(preflight.error, undefined);
  assert.equal(preflight.res.statusCode, 204);
  assert.equal(preflight.res.ended, true);

  const rejected = await invokeCors({ origin: 'https://attacker.example' });
  assert.equal(rejected.error?.status, 403);
});

test('forgot-password validates email and prevents user enumeration', async () => {
  const invalid = await invoke('/api/auth/forgot-password', 'post', { email: 'not-an-email' });
  assert.equal(invalid.status, 400);

  const existing = await invoke('/api/auth/forgot-password', 'post', { email: 'api-user@example.com' });
  const missing = await invoke('/api/auth/forgot-password', 'post', { email: 'missing@example.com' });
  assert.equal(existing.status, 202);
  assert.equal(missing.status, 202);
  assert.deepEqual(existing.body, missing.body);
  assert.deepEqual(Object.keys(existing.body), ['message']);
});

test('forgot-password rate limits repeated IP requests', async () => {
  let last;
  for (let index = 0; index < 4; index += 1) {
    last = await invoke('/api/auth/forgot-password', 'post', { email: `rate-${index}@example.com` });
  }
  assert.equal(last.status, 429);
});

test('valid, expired, invalid and used tokens are handled safely', async () => {
  const writable = new DatabaseSync(databasePath);
  const user = writable.prepare('SELECT id FROM users WHERE email = ?').get('api-user@example.com');
  const rawToken = 'integration-valid-token';
  writable.prepare(`INSERT OR REPLACE INTO password_recovery_tokens
    (user_id, token_hash, expires_at, used_at) VALUES (?, ?, ?, NULL)`)
    .run(user.id, hashResetToken(rawToken), Date.now() + 60_000);
  writable.close();

  const valid = await invoke('/api/auth/validate-reset-token', 'post', { token: rawToken });
  assert.equal(valid.status, 200);
  assert.equal(valid.body.success, true);

  const mismatch = await invoke('/api/auth/reset-password', 'post', {
    token: rawToken,
    password: 'StrongPassword123!',
    confirmPassword: 'DifferentPassword123!'
  });
  assert.equal(mismatch.status, 400);

  const reset = await invoke('/api/auth/reset-password', 'post', {
    token: rawToken,
    password: 'StrongPassword123!',
    confirmPassword: 'StrongPassword123!'
  });
  assert.equal(reset.status, 200);
  assert.equal(reset.body.success, true);

  const reused = await invoke('/api/auth/reset-password', 'post', {
    token: rawToken,
    password: 'StrongPassword123!',
    confirmPassword: 'StrongPassword123!'
  });
  assert.equal(reused.status, 400);

  const expiredDb = new DatabaseSync(databasePath);
  expiredDb.prepare(`INSERT OR REPLACE INTO password_recovery_tokens
    (user_id, token_hash, expires_at, used_at) VALUES (?, ?, ?, NULL)`)
    .run(user.id, hashResetToken('expired-token'), Date.now() - 1);
  expiredDb.close();

  const expired = await invoke('/api/auth/validate-reset-token', 'post', { token: 'expired-token' });
  const invalid = await invoke('/api/auth/validate-reset-token', 'post', { token: 'invalid-token' });
  assert.equal(expired.status, 400);
  assert.equal(invalid.status, 400);
  assert.deepEqual(expired.body, invalid.body);
});
