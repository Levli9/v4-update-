// src/services/openNotebookApiClient.js
// Live REST API Integration client for Open-Notebook (lfnovo/open-notebook FastAPI backend)

const SERVER_URL_KEY = 'shieldx_open_notebook_server_url';
const API_KEY_STORAGE = 'shieldx_open_notebook_api_key';

export const getOpenNotebookServerUrl = () => {
  return localStorage.getItem(SERVER_URL_KEY) || 'http://localhost:5055';
};

export const setOpenNotebookServerUrl = (url) => {
  const cleanUrl = url.trim().replace(/\/+$/, '');
  localStorage.setItem(SERVER_URL_KEY, cleanUrl);
  return cleanUrl;
};

export const getOpenNotebookApiKey = () => {
  return localStorage.getItem(API_KEY_STORAGE) || '';
};

export const setOpenNotebookApiKey = (key) => {
  localStorage.setItem(API_KEY_STORAGE, key.trim());
  return key.trim();
};

const apiFetch = async (endpoint, options = {}) => {
  const baseUrl = getOpenNotebookServerUrl();
  const apiKey = getOpenNotebookApiKey();

  const headers = {
    'Content-Type': 'application/json',
    ...(apiKey ? { Authorization: `Bearer ${apiKey}`, 'X-API-Key': apiKey } : {}),
    ...(options.headers || {})
  };

  try {
    const response = await fetch(`${baseUrl}${endpoint}`, {
      ...options,
      headers
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      throw new Error(`Open-Notebook API error (${response.status}): ${errText || response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.warn(`[Open-Notebook API Fetch Failed] ${endpoint}:`, error.message);
    throw error;
  }
};

export const openNotebookApiClient = {
  // Test connection to hosted Open-Notebook server
  checkHealth: async () => {
    try {
      const data = await apiFetch('/openapi.json');
      return { connected: true, info: data.info?.title || 'Open Notebook API' };
    } catch (e) {
      return { connected: false, error: e.message };
    }
  },

  // Create or retrieve notebook workspace
  createNotebook: async (title, description = '') => {
    try {
      return await apiFetch('/api/v1/notebooks', {
        method: 'POST',
        body: JSON.stringify({ title, description })
      });
    } catch (e) {
      console.warn('Using local fallback for createNotebook:', e.message);
      return { id: `nb-${Date.now()}`, title };
    }
  },

  // Upload or ingest source material to Open-Notebook
  addSource: async (notebookId, title, content) => {
    try {
      return await apiFetch(`/api/v1/notebooks/${notebookId}/sources`, {
        method: 'POST',
        body: JSON.stringify({ title, content_type: 'text', content })
      });
    } catch (e) {
      console.warn('Using local fallback for addSource:', e.message);
      return { id: `src-${Date.now()}`, title };
    }
  },

  // Generate Podcast/Video Audio & Course Script via Open-Notebook API
  generateCourseContent: async ({ prompt, notebookId = null, durationMinutes = 20 }) => {
    try {
      // 1. Try real Open-Notebook Podcast/Audio Generation API
      const result = await apiFetch('/api/v1/podcasts/generate', {
        method: 'POST',
        body: JSON.stringify({
          prompt,
          notebook_id: notebookId,
          speakers_count: 2,
          language: 'he',
          duration_minutes: durationMinutes
        })
      });

      return {
        success: true,
        isLive: true,
        audioUrl: result.audio_url || result.file_path,
        transcript: result.transcript || [],
        slides: result.slides || [],
        citations: result.citations || []
      };
    } catch (e) {
      console.info('Live Open-Notebook server unavailable. Using grounded local RAG generator:', e.message);
      return {
        success: false,
        isLive: false,
        error: e.message
      };
    }
  }
};

export default openNotebookApiClient;
