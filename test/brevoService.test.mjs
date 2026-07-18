import test from 'node:test';
import assert from 'node:assert/strict';
import { createBrevoService } from '../server/brevoService.js';

const response = (status, payload = {}) => ({
  ok: status >= 200 && status < 300,
  status,
  async json() {
    return payload;
  }
});

const createLogger = () => {
  const entries = [];
  return {
    entries,
    info(label, details) {
      entries.push({ level: 'info', label, details });
    },
    error(label, details) {
      entries.push({ level: 'error', label, details });
    }
  };
};

const createService = (fetchImpl, options = {}) => createBrevoService({
  apiKey: 'test-api-key',
  senderEmail: 'verified@example.com',
  senderName: 'ShieldX',
  fetchImpl,
  logger: options.logger || createLogger(),
  timeoutMs: options.timeoutMs || 100
});

test('accepts a real Brevo-style 201 response and creates an RTL reset email', async () => {
  let request;
  const logger = createLogger();
  const service = createService(async (url, options) => {
    request = { url, options };
    return response(201, { messageId: 'message-id' });
  }, { logger });

  const result = await service.sendPasswordReset({
    recipient: 'person@example.net',
    resetUrl: 'https://app.example.com/#/reset-password?token=test',
    expiresMinutes: 30,
    requestId: 'request-1'
  });

  assert.deepEqual(result, { messageId: 'message-id', status: 201 });
  assert.equal(request.url, 'https://api.brevo.com/v3/smtp/email');
  const body = JSON.parse(request.options.body);
  assert.equal(body.subject, 'איפוס סיסמה ל-ShieldX');
  assert.match(body.htmlContent, /dir="rtl"/);
  assert.match(body.htmlContent, /30/);
  assert.equal(logger.entries[0].details.message, 'accepted');
  assert.equal(logger.entries[0].details.recipient, 'pe***@example.net');
  assert.equal(JSON.stringify(logger.entries).includes('test-api-key'), false);
});

for (const [status, expectedCode] of [
  [400, 'BREVO_REQUEST'],
  [401, 'BREVO_AUTH'],
  [403, 'BREVO_AUTH'],
  [429, 'BREVO_RATE_LIMIT'],
  [503, 'BREVO_UNAVAILABLE']
]) {
  test(`maps Brevo ${status} safely`, async () => {
    const service = createService(async () => response(status, { code: 'provider_code', message: 'provider message' }));
    await assert.rejects(
      service.sendPasswordReset({
        recipient: 'person@example.net',
        resetUrl: 'https://app.example.com/reset',
        expiresMinutes: 30,
        requestId: `request-${status}`
      }),
      (error) => error.code === expectedCode
    );
  });
}

test('aborts a timed-out Brevo request', async () => {
  const service = createService((_url, { signal }) => new Promise((_resolve, reject) => {
    signal.addEventListener('abort', () => reject(Object.assign(new Error('aborted'), { name: 'AbortError' })));
  }), { timeoutMs: 5 });

  await assert.rejects(
    service.sendPasswordReset({
      recipient: 'person@example.net',
      resetUrl: 'https://app.example.com/reset',
      expiresMinutes: 30,
      requestId: 'request-timeout'
    }),
    (error) => error.code === 'BREVO_TIMEOUT'
  );
});
