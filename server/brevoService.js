const maskEmail = (email = '') => {
  const [name = '', domain = ''] = email.split('@');
  return `${name.slice(0, 2)}***@${domain}`;
};

export const mapBrevoError = (status, payload = {}) => {
  if (status === 401 || status === 403) return { status: 502, code: 'BREVO_AUTH', message: 'Brevo authentication or authorized IP configuration failed.' };
  if (status === 429) return { status: 503, code: 'BREVO_RATE_LIMIT', message: 'Brevo rate limit reached. Please retry later.' };
  if (status >= 500) return { status: 503, code: 'BREVO_UNAVAILABLE', message: 'Brevo is temporarily unavailable.' };
  const detail = payload.message || payload.code || 'Invalid Brevo request';
  return { status: 502, code: 'BREVO_REQUEST', message: detail };
};

const safeLog = ({ requestId, status, code, message, senderEmail, recipient, startedAt }) => ({
  requestId,
  status,
  code,
  message,
  senderDomain: senderEmail.split('@')[1] || '',
  recipient: maskEmail(recipient),
  durationMs: Date.now() - startedAt
});

export const createBrevoService = ({ apiKey, senderEmail, senderName, fetchImpl = fetch, logger = console, timeoutMs = 10000 }) => ({
  async sendPasswordReset({ recipient, resetUrl, expiresMinutes, requestId }) {
    if (!apiKey) throw Object.assign(new Error('BREVO_API_KEY is missing'), { code: 'BREVO_CONFIG' });
    if (!senderEmail) throw Object.assign(new Error('BREVO_SENDER_EMAIL is missing'), { code: 'BREVO_CONFIG' });

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    const startedAt = Date.now();
    try {
      const response = await fetchImpl('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: { accept: 'application/json', 'api-key': apiKey, 'content-type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          sender: { name: senderName, email: senderEmail },
          to: [{ email: recipient }],
          subject: 'איפוס סיסמה ל-ShieldX',
          htmlContent: buildResetEmail({ resetUrl, expiresMinutes })
        })
      });
      const payload = await response.json().catch(() => ({}));
      logger.info('[Brevo]', safeLog({
        requestId,
        status: response.status,
        code: payload.code || null,
        message: response.ok ? 'accepted' : payload.message || 'request failed',
        senderEmail,
        recipient,
        startedAt
      }));
      if (!response.ok) throw Object.assign(new Error(mapBrevoError(response.status, payload).message), mapBrevoError(response.status, payload));
      return { messageId: payload.messageId || null, status: response.status };
    } catch (error) {
      if (!error.status || error.name === 'AbortError') {
        logger.error('[Brevo]', safeLog({
          requestId,
          status: error.name === 'AbortError' ? 504 : 0,
          code: error.name === 'AbortError' ? 'BREVO_TIMEOUT' : error.code || 'BREVO_NETWORK',
          message: error.name === 'AbortError' ? 'request timed out' : 'network request failed',
          senderEmail,
          recipient,
          startedAt
        }));
      }
      if (error.name === 'AbortError') throw Object.assign(new Error('Brevo request timed out'), { status: 503, code: 'BREVO_TIMEOUT' });
      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }
});

export const buildResetEmail = ({ resetUrl, expiresMinutes }) => `<!doctype html>
<html lang="he" dir="rtl"><body style="margin:0;background:#070b14;color:#f8fafc;font-family:Arial,sans-serif">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td align="center" style="padding:24px">
<table role="presentation" width="100%" style="max-width:560px;background:#0f172a;border:1px solid #164e63;border-radius:18px">
<tr><td style="padding:32px"><h1 style="margin:0 0 18px;color:#22d3ee;font-size:25px">איפוס סיסמה ל‑ShieldX</h1>
<p style="line-height:1.7;color:#cbd5e1">התקבלה בקשה לאיפוס הסיסמה שלך.</p>
<p style="text-align:center;margin:28px 0"><a href="${resetUrl}" style="display:inline-block;background:#22d3ee;color:#020617;text-decoration:none;font-weight:bold;padding:14px 26px;border-radius:10px">איפוס סיסמה</a></p>
<p style="line-height:1.6;color:#94a3b8;font-size:13px">הקישור תקף ל־${expiresMinutes} דקות. אם לא ביקשת לאפס את הסיסמה, אפשר להתעלם מהמייל.</p>
<p style="word-break:break-all;color:#64748b;font-size:11px">קישור חלופי: ${resetUrl}</p>
</td></tr></table></td></tr></table></body></html>`;
