// server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

dotenv.config();

const TOKENS_FILE = path.join(process.cwd(), 'data', 'reset_tokens.json');

function readTokens() {
  try {
    if (!fs.existsSync(TOKENS_FILE)) {
      return [];
    }
    const data = fs.readFileSync(TOKENS_FILE, 'utf8');
    return JSON.parse(data || '[]');
  } catch (error) {
    console.error('Failed to read reset tokens:', error);
    return [];
  }
}

function writeTokens(tokens) {
  try {
    fs.writeFileSync(TOKENS_FILE, JSON.stringify(tokens, null, 2), 'utf8');
  } catch (error) {
    console.error('Failed to write reset tokens:', error);
  }
}

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

// --- Password Recovery Endpoints ---

// 1. Request Password Reset Link
app.post('/api/forgot-password', async (req, res) => {
  const { email, origin, senderEmail: customSenderEmail } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'אימייל הוא שדה חובה' });
  }

  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = customSenderEmail || process.env.BREVO_SENDER_EMAIL || 'security@cyber-academy.com';

  if (!apiKey) {
    console.error('[Brevo Error] BREVO_API_KEY is not defined in environment variables.');
    return res.status(500).json({ error: 'מפתח Brevo API לא מוגדר בשרת. פנה למנהל המערכת.' });
  }

  // Generate secure token
  const token = crypto.randomBytes(24).toString('hex');
  const expiresAt = Date.now() + 3600000; // 1 hour expiration

  // Save token
  const tokens = readTokens();
  // Filter out any existing tokens for this email
  const filteredTokens = tokens.filter(t => t.email.toLowerCase() !== email.toLowerCase());
  filteredTokens.push({ email, token, expiresAt });
  writeTokens(filteredTokens);

  // Send email
  const resetLink = `${origin}/#/reset-password?token=${token}`;
  console.log(`[Forgot Password] Generated reset link for ${email}: ${resetLink}`);

  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "api-key": apiKey,
        "content-type": "application/json"
      },
      body: JSON.stringify({
        sender: { name: "אקדמיית סייבר", email: senderEmail },
        to: [{ email: email }],
        subject: "שחזור סיסמה - אקדמיית סייבר",
        htmlContent: `
          <div style="direction: rtl; text-align: right; font-family: sans-serif; padding: 25px; background-color: #07070f; color: #ffffff; border-radius: 12px; border: 1px solid #1a1a2e; max-width: 500px; margin: 0 auto;">
            <h2 style="color: #00e6ff; border-bottom: 2px solid #1a1a2e; padding-bottom: 12px; margin-bottom: 20px;">🛡️ שחזור סיסמה - אקדמיית סייבר</h2>
            <p style="font-size: 15px; color: #d1d5db; line-height: 1.6;">שלום,</p>
            <p style="font-size: 15px; color: #d1d5db; line-height: 1.6;">התקבל אצלנו תהליך שחזור סיסמה עבור החשבון שלך במערכת הדרכת הסייבר הארגונית.</p>
            <p style="font-size: 15px; color: #d1d5db; line-height: 1.6;">כדי לאפס את הסיסמה, לחץ על הכפתור למטה:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" style="display: inline-block; background: linear-gradient(135deg, #00e6ff, #00b8d4); color: #000000; font-weight: 800; text-decoration: none; padding: 12px 30px; border-radius: 8px; font-size: 15px; box-shadow: 0 0 15px rgba(0, 230, 255, 0.35);">איפוס סיסמה</a>
            </div>
            <p style="font-size: 13px; color: #9ca3af; line-height: 1.6;">הקישור יהיה בתוקף לשעה הקרובה בלבד. אם לא ביקשת לשחזר את הסיסמה, ניתן להתעלם מאימייל זה בבטחה.</p>
            <hr style="border-top: 1px solid #1a1a2e; margin: 25px 0;" />
            <p style="font-size: 11px; color: #4b5563; text-align: center;">נשלח אוטומטית על ידי מערכת הדרכת סייבר SPA</p>
          </div>
        `
      })
    });

    if (response.ok) {
      console.log(`[Forgot Password] Email sent successfully to ${email}`);
      return res.json({ success: true, message: 'אימייל לשחזור סיסמה נשלח בהצלחה.' });
    } else {
      const err = await response.json().catch(() => ({}));
      const errMsg = err.message || `קוד שגיאה: ${response.status}`;
      console.error(`[Brevo API Error] Failed to send email to ${email}:`, err);
      return res.status(502).json({ error: `שגיאת Brevo: ${errMsg}` });
    }
  } catch (error) {
    console.error(`[Forgot Password Connection Error] Failed to send email to ${email}:`, error);
    return res.status(500).json({ error: `שגיאת שרת תקשורת: ${error.message}` });
  }
});

// 2. Validate Password Reset Token
app.post('/api/validate-token', (req, res) => {
  const { token } = req.body;
  if (!token) {
    return res.status(400).json({ error: 'טוקן הוא שדה חובה' });
  }

  const tokens = readTokens();
  const found = tokens.find(t => t.token === token);

  if (!found) {
    return res.status(404).json({ error: 'הקישור אינו תקין או פג תוקף' });
  }

  if (Date.now() > found.expiresAt) {
    // Cleanup expired token
    const filtered = tokens.filter(t => t.token !== token);
    writeTokens(filtered);
    return res.status(410).json({ error: 'פג תוקפו של קישור זה. אנא בקש קישור חדש.' });
  }

  return res.json({ success: true, email: found.email });
});

// 3. Confirm Password Reset and Consume Token
app.post('/api/reset-password', (req, res) => {
  const { token } = req.body;
  if (!token) {
    return res.status(400).json({ error: 'טוקן הוא שדה חובה' });
  }

  const tokens = readTokens();
  const found = tokens.find(t => t.token === token);

  if (!found || Date.now() > found.expiresAt) {
    return res.status(400).json({ error: 'הקישור פג תוקף או אינו קיים' });
  }

  // Remove the token from tokens list
  const filtered = tokens.filter(t => t.token !== token);
  writeTokens(filtered);

  return res.json({ success: true, email: found.email });
});

// Start Server
app.listen(PORT, () => {
  console.log(`[ShieldX Backend] Running on http://localhost:${PORT}`);
});
