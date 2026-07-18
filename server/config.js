const parseUrl = (name, value, { required = false } = {}) => {
  if (!value) {
    if (required) throw new Error(`${name} is required`);
    return '';
  }
  let parsed;
  try {
    parsed = new URL(value);
  } catch {
    throw new Error(`${name} must be a valid absolute URL`);
  }
  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new Error(`${name} must use http or https`);
  }
  return parsed.toString().replace(/\/$/, '');
};

export const loadConfig = (env = process.env) => {
  const production = env.NODE_ENV === 'production';
  const frontendUrl = parseUrl('FRONTEND_URL', env.FRONTEND_URL, { required: production });
  const backendUrl = parseUrl('BACKEND_URL', env.BACKEND_URL, { required: production });
  const brevoApiKey = env.BREVO_API_KEY || '';
  const brevoSenderEmail = env.BREVO_SENDER_EMAIL || '';

  if (production && frontendUrl.includes('localhost')) throw new Error('FRONTEND_URL cannot use localhost in production');
  if (production && backendUrl.includes('localhost')) throw new Error('BACKEND_URL cannot use localhost in production');
  if (production && (!frontendUrl.startsWith('https://') || !backendUrl.startsWith('https://'))) {
    throw new Error('FRONTEND_URL and BACKEND_URL must use HTTPS in production');
  }
  if (production && (!brevoApiKey || !brevoSenderEmail)) {
    throw new Error('BREVO_API_KEY and BREVO_SENDER_EMAIL are required in production');
  }
  if (brevoSenderEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(brevoSenderEmail)) {
    throw new Error('BREVO_SENDER_EMAIL must be a valid email address');
  }

  const allowedOrigins = (env.ALLOWED_ORIGINS || frontendUrl || 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)
    .map((origin) => parseUrl('ALLOWED_ORIGINS', origin))
    .map((origin) => new URL(origin).origin);

  return {
    production,
    port: Number(env.PORT) || 5001,
    frontendUrl: frontendUrl || 'http://localhost:5173',
    backendUrl: backendUrl || 'http://localhost:5001',
    allowedOrigins: [...new Set(allowedOrigins)],
    brevoApiKey,
    brevoSenderEmail,
    brevoSenderName: env.BREVO_SENDER_NAME || 'ShieldX',
    resetExpiryMinutes: Math.max(5, Number(env.PASSWORD_RESET_EXPIRY_MINUTES) || 30),
    sessionExpiryHours: Math.min(168, Math.max(1, Number(env.AUTH_SESSION_EXPIRY_HOURS) || 12)),
    aiTimeoutMs: Math.min(120_000, Math.max(5_000, Number(env.AI_REQUEST_TIMEOUT_MS) || 45_000)),
    databasePath: env.AUTH_DATABASE_PATH || 'data/auth.db'
  };
};
