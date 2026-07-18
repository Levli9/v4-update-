import test from 'node:test';
import assert from 'node:assert/strict';
import { loadConfig } from '../server/config.js';

test('loads local defaults and preserves the frontend application path', () => {
  const config = loadConfig({
    FRONTEND_URL: 'http://localhost:5173/v4-update-/',
    BACKEND_URL: 'http://localhost:5001',
    ALLOWED_ORIGINS: 'http://localhost:5173'
  });
  assert.equal(config.frontendUrl, 'http://localhost:5173/v4-update-');
  assert.deepEqual(config.allowedOrigins, ['http://localhost:5173']);
  assert.equal(config.port, 5001);
});

test('rejects localhost and insecure URLs in production', () => {
  assert.throws(() => loadConfig({
    NODE_ENV: 'production',
    FRONTEND_URL: 'https://example.com/app',
    BACKEND_URL: 'http://localhost:5001'
  }), /localhost|HTTPS/);
});

test('requires server-only Brevo settings in production', () => {
  assert.throws(() => loadConfig({
    NODE_ENV: 'production',
    FRONTEND_URL: 'https://app.example.com',
    BACKEND_URL: 'https://api.example.com'
  }), /BREVO_API_KEY/);
});

test('normalizes CORS configuration to origins only', () => {
  const config = loadConfig({
    FRONTEND_URL: 'https://app.example.com/path',
    BACKEND_URL: 'https://api.example.com',
    ALLOWED_ORIGINS: 'https://app.example.com/path,https://admin.example.com/'
  });
  assert.deepEqual(config.allowedOrigins, ['https://app.example.com', 'https://admin.example.com']);
});
