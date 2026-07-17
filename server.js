// server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5001;

// --- AI Providers Layer ---
async function callGemini(promptText, systemInstruction) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY is not defined in environment.');

  // Use Gemini 1.5 Flash
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: `${systemInstruction}\n\nUser Input:\n${promptText}` }] }],
      generationConfig: {
        responseMimeType: "application/json"
      }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Empty response from Gemini API.');
  return text;
}

async function callOpenAI(promptText, systemInstruction) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY is not defined in environment.');

  const url = 'https://api.openai.com/v1/chat/completions';
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemInstruction },
        { role: 'user', content: promptText }
      ],
      response_format: { type: "json_object" }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error('Empty response from OpenAI API.');
  return text;
}

async function callGroq(promptText, systemInstruction) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('GROQ_API_KEY is not defined in environment.');

  const url = 'https://api.groq.com/openai/v1/chat/completions';
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemInstruction },
        { role: 'user', content: promptText }
      ],
      response_format: { type: "json_object" }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Groq API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error('Empty response from Groq API.');
  return text;
}

// Unified Dispatcher
async function queryAI(promptText, systemInstruction) {
  // Try Gemini first, then OpenAI, then Groq
  if (process.env.GEMINI_API_KEY) {
    return await callGemini(promptText, systemInstruction);
  } else if (process.env.OPENAI_API_KEY) {
    return await callOpenAI(promptText, systemInstruction);
  } else if (process.env.GROQ_API_KEY) {
    return await callGroq(promptText, systemInstruction);
  } else {
    throw new Error('ספק AI אינו מוגדר במשתני הסביבה. אנא הגדירו את GEMINI_API_KEY, OPENAI_API_KEY או GROQ_API_KEY בשרת.');
  }
}

// Clean markdown code block markers
function cleanJsonResponse(rawText) {
  let cleaned = rawText.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(json)?/, '').replace(/```$/, '').trim();
  }
  return cleaned;
}

// --- Endpoints ---

// 1. Generate Course
app.post('/api/generate-course', async (req, res) => {
  const { prompt, sourceText, audience, slideCount, difficulty, duration, language, passScore } = req.body;

  // Input Validation
  if (!prompt || !prompt.trim()) {
    return res.status(400).json({ error: 'נושא הקורס הוא שדה חובה.' });
  }

  const count = Math.min(20, Math.max(3, Number(slideCount) || 7));

  const systemInstruction = `You are a professional cyber security instructional designer.
Generate a complete, premium training course about the specified topic.
Return ONLY a valid JSON object matching the schema below. Do not wrap it in anything else. Do not output conversational text.

JSON Structure:
{
  "title": "שם הקורס בעברית",
  "description": "תיאור קצר של הקורס בעברית",
  "learningObjectives": [
    "מטרת למידה בעברית 1",
    "מטרת למידה בעברית 2"
  ],
  "slides": [
    {
      "id": 1,
      "title": "כותרת השקופית בעברית",
      "content": "תוכן מפורט של השקופית בעברית (2-4 משפטים מקצועיים)",
      "bulletPoints": [
        "נקודה מרכזית בעברית 1",
        "נקודה מרכזית בעברית 2",
        "נקודה מרכזית בעברית 3"
      ],
      "speakerNotes": "הערות למדריך או קריינות מומלצת בעברית",
      "visualSuggestion": "הצעה מפורטת לאיור או תמונה (סגנון ShieldX, ללא טקסט)"
    }
  ],
  "finalExam": [
    {
      "question": "שאלה בעברית",
      "answers": [
        "תשובה 1",
        "תשובה 2",
        "תשובה 3",
        "תשובה 4"
      ],
      "correctAnswerIndex": 0,
      "explanation": "הסבר מפורט לתשובה הנכונה בעברית"
    }
  ]
}

Guidelines:
- Language: The language parameter is "${language || 'עברית'}". Write the content in this language.
- Target Audience: "${audience || 'עובדי החברה'}".
- Difficulty Level: "${difficulty || 'בינוני'}".
- Estimated Duration: "${duration || 30} minutes".
- Slide Count: You must generate EXACTLY ${count} slides.
- Final Exam: Generate exactly ${Math.max(3, Math.min(10, count))} multiple-choice questions for the final exam.
- Source Material: If provided, base the facts, definitions, and questions on the following source text. Cite parts of it in visualSuggestion or content if appropriate:
${sourceText || 'No source text provided.'}
`;

  try {
    const rawResult = await queryAI(
      `צור קורס מקיף ומעמיק בנושא: "${prompt}"`,
      systemInstruction
    );
    const cleaned = cleanJsonResponse(rawResult);
    const parsed = JSON.parse(cleaned);

    // Validate structure
    if (!parsed.title || !parsed.slides || !Array.isArray(parsed.slides)) {
      throw new Error('AI response is missing title or slides array.');
    }

    res.json(parsed);
  } catch (error) {
    console.error('API Error during course generation:', error);
    res.status(550).json({ error: `תקלה ביצירת הקורס: ${error.message}` });
  }
});

// 2. Refine Slide
app.post('/api/refine-slide', async (req, res) => {
  const { action, slide, topic } = req.body;

  if (!slide || !action) {
    return res.status(400).json({ error: 'שקופית ופעולה הן שדות חובה.' });
  }

  let instruction = '';
  switch (action) {
    case 'shorten':
      instruction = 'קצר ותמצת את התוכן ואת נקודות המפתח של השקופית הזו באופן משמעותי.';
      break;
    case 'expand':
      instruction = 'הרחב והעמק את התוכן ואת נקודות המפתח של השקופית הזו, והוסף הסברים מקצועיים.';
      break;
    case 'simplify':
      instruction = 'פשט את הניסוח של השקופית כך שיהיה קל וברור להבנה ללא מונחים מסובכים מדי.';
      break;
    case 'professional':
      instruction = 'שכתב את השקופית הזו בסגנון כתיבה רשמי, מקצועי וארגוני ברמה גבוהה.';
      break;
    case 'regenerate':
      instruction = 'צור מחדש את כל השקופית הזו מהתחלה על בסיס הנושא הכללי.';
      break;
    default:
      return res.status(400).json({ error: 'פעולת עריכה לא תקינה.' });
  }

  const systemInstruction = `You are a professional cyber security editor.
Modify the following slide according to this instruction: "${instruction}".
Return ONLY a valid JSON object matching the original slide schema. Do not wrap it in anything else. Do not output conversational text.

Original Slide Schema:
{
  "id": ${slide.id},
  "title": "כותרת השקופית",
  "content": "תוכן השקופית",
  "bulletPoints": [
    "נקודה 1",
    "נקודה 2"
  ],
  "speakerNotes": "הערות למדריך",
  "visualSuggestion": "הצעה לאיור"
}

Ensure the output is in the same language as the original slide (usually Hebrew) and matches the course topic: "${topic || 'אבטחת מידע'}".
`;

  try {
    const rawResult = await queryAI(
      `ערוך את השקופית הבאה:\n${JSON.stringify(slide, null, 2)}`,
      systemInstruction
    );
    const cleaned = cleanJsonResponse(rawResult);
    const parsed = JSON.parse(cleaned);

    res.json(parsed);
  } catch (error) {
    console.error('API Error during slide refinement:', error);
    res.status(550).json({ error: `תקלה בעריכת השקופית: ${error.message}` });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`[ShieldX Backend] Running on http://localhost:${PORT}`);
});
