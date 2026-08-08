const url = 'https://hmslyanhdkrhwpfvdqis.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhtc2x5YW5oZGtyaHdwZnZkcWlzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU0ODQ0MzUsImV4cCI6MjEwMTA2MDQzNX0.0EzkIidOlCjqvEAxal2MxEkaWxTpB51aLmxUItlmUwU';

const call = async (path, body) => {
  const response = await fetch(`${url}/auth/v1/${path}`, {
    method: 'POST',
    headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const data = await response.json().catch(() => ({}));
  return { data, error: response.ok ? null : { message: data.msg || data.message || 'שגיאת אימות' } };
};

const restCall = async (table, method, body, query = '') => {
  const response = await fetch(`${url}/rest/v1/${table}${query}`, {
    method,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation'
    },
    body: body ? JSON.stringify(body) : undefined
  });
  const data = await response.json().catch(() => ([]));
  return { data, error: response.ok ? null : { message: data.msg || data.message || 'שגיאת מסד נתונים' } };
};

export const supabase = {
  auth: {
    signUp: ({ email, password, options }) => call('signup', { email, password, data: options?.data || {} }),
    resetPasswordForEmail: (email, { redirectTo }) => call('recover', { email, redirect_to: redirectTo }),
    signInWithOAuth: ({ provider, options }) => {
      const redirectTo = options?.redirectTo || window.location.origin;
      window.location.href = `${url}/auth/v1/authorize?provider=${provider}&redirect_to=${encodeURIComponent(redirectTo)}`;
    }
  },
  from: (table) => ({
    insert: (data) => restCall(table, 'POST', data),
    select: (query = '') => restCall(table, 'GET', null, query ? `?${query}` : ''),
    update: (data, matchQuery = '') => restCall(table, 'PATCH', data, matchQuery ? `?${matchQuery}` : '')
  })
};



