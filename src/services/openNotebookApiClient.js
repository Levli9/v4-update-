// src/services/openNotebookApiClient.js
// Live REST API Integration client for Open-Notebook (lfnovo/open-notebook FastAPI backend)

import openNotebookServerEngine from './openNotebookServerEngine';

const SERVER_URL_KEY = 'shieldx_open_notebook_server_url';
const API_KEY_STORAGE = 'shieldx_open_notebook_api_key';

export const getOpenNotebookServerUrl = () => {
  const url = localStorage.getItem(SERVER_URL_KEY) || '';
  // On HTTPS origins (e.g. Vercel), HTTP localhost requests are blocked by browsers (Mixed Content). Clear local localhost.
  if (typeof window !== 'undefined' && window.location.protocol === 'https:' && url.includes('localhost')) {
    localStorage.removeItem(SERVER_URL_KEY);
    return '';
  }
  return url;
};

export const setOpenNotebookServerUrl = (url) => {
  const cleanUrl = url.trim().replace(/\/+$/, '');
  if (!cleanUrl) {
    localStorage.removeItem(SERVER_URL_KEY);
    return '';
  }
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
  if (!baseUrl) {
    throw new Error('טרם הוזנה כתובת שרת מרוחק');
  }
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
    throw error;
  }
};

export const openNotebookApiClient = {
  // Test connection to hosted Open-Notebook server or Serverless engine
  checkHealth: async () => {
    const baseUrl = getOpenNotebookServerUrl();
    if (baseUrl) {
      try {
        const data = await apiFetch('/openapi.json');
        return { connected: true, isLiveRemote: true, info: data.info?.title || 'Open Notebook API' };
      } catch (e) {
        // Fallback to embedded serverless engine
        const spec = openNotebookServerEngine.getOpenApiSpec();
        return { 
          connected: true, 
          isServerless: true, 
          info: `${spec.info.title} (מנוע מובנה פעיל)` 
        };
      }
    }

    // Default: Embedded Serverless Engine
    const spec = openNotebookServerEngine.getOpenApiSpec();
    return { 
      connected: true, 
      isServerless: true, 
      info: `${spec.info.title} (מנוע מובנה פעיל)` 
    };
  },

  // Create or retrieve notebook workspace
  createNotebook: async (title, description = '') => {
    try {
      return await apiFetch('/api/v1/notebooks', {
        method: 'POST',
        body: JSON.stringify({ title, description })
      });
    } catch (e) {
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
      return { id: `src-${Date.now()}`, title };
    }
  },

  // Generate Podcast/Video Audio & Course Script via Open-Notebook API / Serverless
  generateCourseContent: async ({ prompt, sourceText = '', audience = 'עובדי החברה', slideCount = 7, duration = 30 }) => {
    const baseUrl = getOpenNotebookServerUrl();
    if (baseUrl) {
      try {
        const result = await apiFetch('/api/v1/podcasts/generate', {
          method: 'POST',
          body: JSON.stringify({
            prompt,
            speakers_count: 2,
            language: 'he',
            duration_minutes: duration
          })
        });

        return {
          success: true,
          isLiveRemote: true,
          audioUrl: result.audio_url || result.file_path,
          transcript: result.transcript || [],
          slides: result.slides || [],
          citations: result.citations || []
        };
      } catch (e) {
        console.info('Live Open-Notebook remote server unavailable. Using serverless engine:', e.message);
      }
    }

    // Serverless Open-Notebook Engine Execution
    const serverlessResult = await openNotebookServerEngine.generateContentPackage({
      prompt,
      sourceText,
      audience,
      slideCount,
      duration
    });

    return serverlessResult;
  }
};

export default openNotebookApiClient;
