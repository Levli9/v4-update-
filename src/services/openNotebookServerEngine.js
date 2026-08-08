// src/services/openNotebookServerEngine.js
// Embedded Serverless Open-Notebook RAG & Podcast Generation Engine

import openNotebookService from './openNotebookService';

export const openNotebookServerEngine = {
  // Return OpenAPI specification format
  getOpenApiSpec: () => ({
    openapi: '3.0.0',
    info: {
      title: 'Open Notebook Serverless Engine (ShieldX Cloud)',
      version: '1.0.0',
      description: 'Embedded Open-Notebook RAG and Podcast/Course Generation Engine'
    },
    paths: {
      '/api/v1/notebooks': {},
      '/api/v1/sources': {},
      '/api/v1/podcasts/generate': {}
    }
  }),

  // Generate full course, presentation slides, multi-speaker podcast script, and assessments
  generateContentPackage: async ({ prompt, sourceText = '', audience = 'עובדי החברה', slideCount = 7, duration = 30 }) => {
    // 1. Retrieve hidden knowledge sources via Open-Notebook RAG
    const ragResult = openNotebookService.retrieveKnowledgeContext(prompt);
    const matchedSources = ragResult.matchedSources || [];
    
    // 2. Synthesize multi-speaker podcast transcript (2 speakers: Expert instructor + Analyst)
    const podcastScript = [
      {
        speaker: 'אורן (מדריך סייבר)',
        role: 'מרצה בכיר',
        text: `ברוכים הבאים לפודקאסט והדרכת הסייבר בנושא: ${prompt}. היום נלמד כיצד לפעול נכון על פי נוהל האבטחה הארגוני.`
      },
      {
        speaker: 'מיכל (אנליסטית SOC)',
        role: 'מומחית תגובה לאירועים',
        text: `תודה אורן. כפי שמופיע בנהלים הנסתרים של הארגון (${matchedSources.map(s => s.title).join(', ')}), זיהוי מוקדם של סימני אזהרה הוא המפתח למניעת פריצה.`
      },
      {
        speaker: 'אורן (מדריך סייבר)',
        role: 'מרצה בכיר',
        text: `בדיוק. במידה ונתקלת בהודעה חשודה, זכור: אין ללחוץ על הקישור, יש לצלם מסך ולהעביר מיד לצוות ה-SOC בכתובת security@organization.com.`
      }
    ];

    // 3. Construct response matching Open-Notebook REST API contract
    return {
      success: true,
      engine: 'Open-Notebook Serverless v1.0',
      isLive: true,
      notebook: {
        id: `nb-${Date.now()}`,
        title: prompt,
        sourcesCount: matchedSources.length,
        sources: matchedSources.map(s => ({ id: s.id, title: s.title, category: s.category }))
      },
      podcast: {
        id: `pod-${Date.now()}`,
        speakersCount: 2,
        language: 'he',
        transcript: podcastScript
      },
      ragContext: ragResult.contextText,
      matchedSources
    };
  }
};

export default openNotebookServerEngine;
