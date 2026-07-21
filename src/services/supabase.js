const url = 'https://kjckatnchzetvcpqcswb.supabase.co';
const key = 'sb_publishable_7K2zsZTqipihLKK9hLYhtg_HvJl7rTk';

const call = async (path, body) => {
  const response = await fetch(`${url}/auth/v1/${path}`, {
    method: 'POST',
    headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const data = await response.json().catch(() => ({}));
  return { data, error: response.ok ? null : { message: data.msg || data.message || 'שגיאת אימות' } };
};

export const supabase = {
  auth: {
    signUp: ({ email, password, options }) => call('signup', { email, password, data: options?.data || {} }),
    resetPasswordForEmail: (email, { redirectTo }) => call('recover', { email, redirect_to: redirectTo })
  }
};
