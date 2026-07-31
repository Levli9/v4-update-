const url = 'https://kjckatnchzetvcpqcswb.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtqY2thdG5jaHpldHZjcHFjc3diIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ2NTI0NzgsImV4cCI6MjEwMDIyODQ3OH0.nd3mk6xQjNIp6lklhmzZhiJInc0fodeiohXejYbD1Sw';

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
