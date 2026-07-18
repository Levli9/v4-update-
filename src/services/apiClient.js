const DEFAULT_TIMEOUT_MS = 10000;
const SESSION_KEY = 'shieldx_session_token';

export class ApiClientError extends Error {
  constructor(message, { status = 0, code = 'UNKNOWN', details = null } = {}) {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

const getApiBaseUrl = () => {
  const configured = String(import.meta.env.VITE_API_BASE_URL || '').trim().replace(/\/+$/, '');

  if (!configured) {
    if (import.meta.env.PROD && window.location.hostname.endsWith('github.io')) {
      throw new ApiClientError(
        'שרת המערכת אינו מוגדר באתר שפורסם. יש להגדיר VITE_API_BASE_URL בזמן הבנייה.',
        { code: 'API_CONFIGURATION' }
      );
    }
    return '';
  }

  let parsed;
  try {
    parsed = new URL(configured);
  } catch {
    throw new ApiClientError('כתובת שרת המערכת אינה תקינה.', { code: 'API_CONFIGURATION' });
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new ApiClientError('כתובת שרת המערכת חייבת להשתמש ב־HTTP או HTTPS.', { code: 'API_CONFIGURATION' });
  }
  if (import.meta.env.PROD && ['localhost', '127.0.0.1', '::1'].includes(parsed.hostname)) {
    throw new ApiClientError('לא ניתן להשתמש בשרת מקומי באתר שפורסם.', { code: 'API_CONFIGURATION' });
  }
  if (window.location.protocol === 'https:' && parsed.protocol !== 'https:') {
    throw new ApiClientError('האתר המאובטח דורש כתובת HTTPS לשרת.', { code: 'MIXED_CONTENT' });
  }
  return parsed.toString().replace(/\/+$/, '');
};

const friendlyHttpMessage = (status, payload) => {
  if (payload?.error) return payload.error;
  if (status === 400) return 'הנתונים שנשלחו אינם תקינים.';
  if (status === 401) return 'ההתחברות פגה. יש להתחבר מחדש.';
  if (status === 403) return 'הגישה לשרת נדחתה.';
  if (status === 409) return 'הנתון כבר קיים במערכת.';
  if (status === 413) return 'המידע שנשלח גדול מדי.';
  if (status === 429) return 'נשלחו יותר מדי בקשות. נסה שוב מאוחר יותר.';
  if (status >= 500) return 'שירות המערכת אינו זמין כרגע. נסה שוב מאוחר יותר.';
  return 'הבקשה לא הושלמה. נסה שוב.';
};

export const getSessionToken = () => {
  try {
    return window.sessionStorage.getItem(SESSION_KEY) || '';
  } catch {
    return '';
  }
};

export const setSessionToken = (token) => {
  try {
    if (token) window.sessionStorage.setItem(SESSION_KEY, token);
    else window.sessionStorage.removeItem(SESSION_KEY);
  } catch {
    // A blocked sessionStorage should result in a non-persistent session, not a crash.
  }
};

export const apiRequest = async (
  path,
  { method = 'GET', body, timeoutMs = DEFAULT_TIMEOUT_MS, authenticated = false } = {}
) => {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs);
  const token = authenticated ? getSessionToken() : '';

  try {
    const response = await fetch(`${getApiBaseUrl()}${path}`, {
      method,
      headers: {
        ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: controller.signal
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      if (authenticated && response.status === 401) setSessionToken('');
      throw new ApiClientError(friendlyHttpMessage(response.status, payload), {
        status: response.status,
        code: response.status === 429 ? 'RATE_LIMIT' : 'HTTP_ERROR',
        details: import.meta.env.DEV ? payload : null
      });
    }
    return payload;
  } catch (error) {
    if (error instanceof ApiClientError) throw error;
    if (import.meta.env.DEV) {
      console.error('[ShieldX API]', { path, name: error.name, message: error.message });
    }
    if (error.name === 'AbortError') {
      throw new ApiClientError('החיבור לשרת ארך זמן רב מדי. נסה שוב.', { code: 'TIMEOUT' });
    }
    throw new ApiClientError('לא ניתן להתחבר לשרת המערכת. ודא שהשרת פעיל ונסה שוב.', {
      code: 'NETWORK_ERROR'
    });
  } finally {
    window.clearTimeout(timeout);
  }
};

export const passwordResetApi = {
  request(email) {
    return apiRequest('/api/auth/forgot-password', {
      method: 'POST',
      body: { email }
    });
  },
  validate(token) {
    return apiRequest('/api/auth/validate-reset-token', {
      method: 'POST',
      body: { token }
    });
  },
  reset(token, password, confirmPassword) {
    return apiRequest('/api/auth/reset-password', {
      method: 'POST',
      body: { token, password, confirmPassword }
    });
  }
};

export const authApi = {
  register(payload) {
    return apiRequest('/api/auth/register', { method: 'POST', body: payload });
  },
  login(username, password) {
    return apiRequest('/api/auth/login', { method: 'POST', body: { username, password } });
  },
  session() {
    return apiRequest('/api/auth/session', { authenticated: true });
  },
  async logout() {
    try {
      await apiRequest('/api/auth/logout', { method: 'POST', authenticated: true });
    } finally {
      setSessionToken('');
    }
  },
  updateProfile(payload) {
    return apiRequest('/api/auth/profile', { method: 'PATCH', body: payload, authenticated: true });
  },
  changePassword(currentPassword, newPassword) {
    return apiRequest('/api/auth/change-password', {
      method: 'POST',
      body: { currentPassword, newPassword },
      authenticated: true
    });
  },
  listUsers() {
    return apiRequest('/api/admin/users', { authenticated: true });
  },
  reviewUser(id, decision) {
    return apiRequest(`/api/admin/users/${encodeURIComponent(id)}/status`, {
      method: 'PATCH',
      body: { decision },
      authenticated: true
    });
  }
};

export const aiApi = {
  generateCourse(payload) {
    return apiRequest('/api/generate-course', {
      method: 'POST',
      body: payload,
      authenticated: true,
      timeoutMs: 60_000
    });
  },
  refineSlide(action, slide, topic) {
    return apiRequest('/api/refine-slide', {
      method: 'POST',
      body: { action, slide, topic },
      authenticated: true,
      timeoutMs: 60_000
    });
  }
};

export const learningApi = {
  load() {
    return apiRequest('/api/learning/state', { authenticated: true });
  },
  save(state) {
    return apiRequest('/api/learning/state', {
      method: 'PUT',
      body: state,
      authenticated: true
    });
  }
};

export const courseApi = {
  list() {
    return apiRequest('/api/courses', { authenticated: true });
  },
  listManaged() {
    return apiRequest('/api/courses/manage', { authenticated: true });
  },
  save(course, status) {
    return apiRequest(`/api/courses/${encodeURIComponent(course.id)}`, {
      method: 'PUT',
      body: { course, status },
      authenticated: true
    });
  },
  remove(courseId) {
    return apiRequest(`/api/courses/${encodeURIComponent(courseId)}`, {
      method: 'DELETE',
      authenticated: true
    });
  },
  gradeQuiz(courseId, answers) {
    return apiRequest(`/api/courses/${encodeURIComponent(courseId)}/quiz/submit`, {
      method: 'POST',
      body: { answers },
      authenticated: true
    });
  }
};
