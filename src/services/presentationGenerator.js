const STOP_WORDS = new Set([
  'של', 'על', 'עם', 'את', 'זה', 'זו', 'הוא', 'היא', 'אני', 'איך', 'מה', 'למה', 'כמו',
  'גם', 'או', 'אם', 'כי', 'כל', 'לא', 'כן', 'יותר', 'עבור', 'בנושא', 'מצגת', 'שקופיות'
]);

const clean = (value = '') => value.replace(/\s+/g, ' ').trim();

const splitSource = (source = '') => source
  .split(/(?:\n{2,}|(?<=[.!?])\s+)/)
  .map(clean)
  .filter((part) => part.length > 18);

const keywords = (text = '') => clean(text)
  .toLowerCase()
  .split(/[^\p{L}\p{N}-]+/u)
  .filter((word) => word.length > 2 && !STOP_WORDS.has(word));

const rankSource = (prompt, sourceParts) => {
  const promptWords = new Set(keywords(prompt));
  return sourceParts
    .map((text, index) => ({
      text,
      source: index + 1,
      score: keywords(text).reduce((score, word) => score + (promptWords.has(word) ? 3 : 0), 0)
    }))
    .sort((a, b) => b.score - a.score || a.source - b.source);
};

const CYBER_FACTS = {
  פישינג: [
    'פישינג הוא ניסיון לגרום לאדם למסור מידע או לבצע פעולה מסוכנת באמצעות התחזות.',
    'סימני אזהרה נפוצים: דחיפות חריגה, כתובת שולח חשודה, קישור לא צפוי ובקשה לפרטים רגישים.',
    'Spear Phishing מותאם לאדם או לארגון מסוים ולכן הוא אמין וממוקד יותר.'
  ],
  סיסמאות: [
    'סיסמה חזקה היא ארוכה, ייחודית ואינה מבוססת על מידע שקל לנחש.',
    'מנהל סיסמאות מאפשר להשתמש בסיסמה שונה בכל שירות.',
    'אימות רב־שלבי מצמצם סיכון גם כאשר הסיסמה נחשפה.'
  ],
  כופרה: [
    'כופרה מצפינה מידע או משביתה מערכות ודורשת תשלום תמורת השחרור.',
    'גיבוי מבודד, עדכוני אבטחה והרשאות מינימליות מצמצמים את הנזק.',
    'בעת חשד יש לנתק את התחנה מהרשת ולדווח מיד לצוות האבטחה.'
  ],
  ענן: [
    'אבטחת ענן נשענת על אחריות משותפת בין ספק הענן לארגון.',
    'הרשאות יתר ותצורה שגויה הן גורמי סיכון מרכזיים.',
    'ניטור, הצפנה ו־MFA הם בקרות בסיסיות בסביבת ענן.'
  ]
};

const detectFacts = (prompt) => {
  const entry = Object.entries(CYBER_FACTS).find(([key]) => prompt.includes(key));
  return entry?.[1] || [
    `הנושא “${clean(prompt)}” משפיע על התנהלות העובדים ועל רמת הסיכון הארגונית.`,
    'הגנה יעילה משלבת מודעות, תהליך עבודה ברור ובקרות טכנולוגיות.',
    'בכל אירוע חריג יש לעצור, לבדוק ולדווח בערוץ הארגוני המתאים.'
  ];
};

const sourceBullet = (ranked, index, fallback) => {
  const match = ranked[index];
  return match
    ? { text: match.text, citation: match.source }
    : { text: fallback, citation: null };
};

const buildCoursePackage = ({ subject, audience, difficulty, duration, language, slides }) => ({
  metadata: { subject, audience, difficulty, duration, language, status: 'draft', version: 1 },
  modules: slides.slice(1).map((slide, index) => ({ id: index + 1, title: slide.title, objective: slide.subtitle, estimatedMinutes: Math.max(3, Math.round(Number(duration) / Math.max(1, slides.length - 1))) })),
  videoScript: slides.slice(1).map((slide, index) => ({ scene: index + 1, title: slide.title, narration: `${slide.title}. ${slide.bullets.map((bullet) => bullet.text).join(' ')}`, visualDirection: `אנימציית הדרכה ארגונית בנושא ${slide.title}` })),
  questionTypes: ['בחירה מרובה', 'גרירת פריטים', 'התאמת זוגות', 'סדר פעולות', 'לחיצה על אזור בתמונה', 'סימולציה', 'תרחיש'],
  quizzes: [
    { type: 'multipleChoice', title: 'בחירת התגובה הבטוחה' },
    { type: 'dragDrop', title: 'מיון התנהגויות לבטוח ומסוכן' },
    { type: 'match', title: 'התאמת מושג להגדרה' },
    { type: 'order', title: 'סידור שלבי התגובה לאירוע' },
    { type: 'hotspot', title: 'איתור סימן חשוד בתמונה' },
    { type: 'simulation', title: 'סימולציה אינטראקטיבית' },
    { type: 'scenario', title: 'תרחיש מהעבודה' }
  ],
  finalExam: { questions: 10, pointsPerQuestion: 10, passScore: 80, randomized: true },
  media: {
    imagePrompts: slides.slice(1, 5).map((slide) => `איור הדרכה מקצועי, ${slide.title}, סגנון ShieldX, ללא טקסט`),
    charts: ['גרף התקדמות בקורס', 'השוואת ביצועים לפני ואחרי ההדרכה'],
    narrationLanguage: language,
    subtitles: true
  },
  certificate: { enabled: true, title: `תעודת השלמה — ${subject}`, passScore: 80 },
  publishing: { status: 'draft', scheduledAt: null, archived: false, versionHistory: [] }
});

export function generateLocalPresentation({ prompt, sourceText, audience = 'עובדי החברה', slideCount = 7, difficulty = 'בינוני', duration = 30, language = 'עברית' }) {
  const subject = clean(prompt) || 'מודעות סייבר ארגונית';
  const sourceParts = splitSource(sourceText);
  const ranked = rankSource(subject, sourceParts);
  const facts = detectFacts(subject);
  const requestedCount = Math.min(12, Math.max(5, Number(slideCount) || 7));

  const slides = [
    {
      id: 1,
      title: subject,
      content: `ברוכים הבאים לשיעור הדרכה מיוחד בנושא ${subject}. במצגת זו נלמד על עקרונות המפתח, דרכי התמודדות והנחיות עבודה נכונות.`,
      bulletPoints: [
        `קהל יעד: ${audience}`,
        `רמת קושי: ${difficulty}`,
        'חשוב לשמור על ערנות ולדווח על כל אירוע חריג'
      ],
      speakerNotes: 'הציגו את עצמכם והסבירו על חשיבות המודעות לנושא זה בארגון.',
      visualSuggestion: 'שקף פתיחה מעוצב עם לוגו ShieldX ואנימציה קלה.'
    },
    {
      id: 2,
      title: 'למה הנושא חשוב?',
      content: facts[0] || 'טעות אנוש קטנה יכולה להוביל לפגיעה חמורה במערכות המידע של הארגון.',
      bulletPoints: [
        'טעות אנוש קטנה יכולה להפוך לאירוע אבטחה משמעותי',
        'המטרה היא לזהות את הסיכון לפני שמבצעים פעולה',
        'שמירה על סודיות ושלמות המידע היא באחריות כולנו'
      ],
      speakerNotes: 'הדגישו כי מודעות העובדים היא קו ההגנה הראשון של הארגון.',
      visualSuggestion: 'תרשים המציג את קווי ההגנה הארגוניים.'
    },
    {
      id: 3,
      title: 'סימנים שצריך לזהות',
      content: facts[1] || 'בקשות חריגות, לחץ זמן מוגזם או דרישות לשינוי תהליכים שגרתיים הם סימני אזהרה קלאסיים.',
      bulletPoints: [
        'בקשה חריגה או שינוי פתאומי בתהליך העבודה',
        'לחץ זמן מוגזם מצד השולח לקבלת מענה מהיר',
        'אי התאמה בכתובת המייל או בפרטי הקשר'
      ],
      speakerNotes: 'עברו על הדוגמאות והסבירו כיצד תוקפים משתמשים במניפולציות פסיכולוגיות.',
      visualSuggestion: 'צילום מסך של הודעה חשודה עם סימוני אזהרה בטורקיז.'
    },
    {
      id: 4,
      title: 'מודל פעולה מומלץ',
      content: 'כאשר נתקלים במצב חשוד, יש לפעול לפי מודל שלושת השלבים של ShieldX: עצור, בדוק, דווח.',
      bulletPoints: [
        'עצור — אל תלחץ, אל תפתח קבצים ואל תמסור מידע',
        'בדוק — אמת את פרטי השולח והבקשה בערוץ תקשורת נפרד',
        'דווח — העבר דיווח מפורט לצוות האבטחה והמתן להנחיות'
      ],
      speakerNotes: 'פרטו על כל אחד מהשלבים ותנו דוגמה מעשית.',
      visualSuggestion: 'אנימציה של שלושה שלבים מונפשים בסגנון סייבר.'
    },
    {
      id: 5,
      title: 'תרחיש מהשטח',
      content: `נניח שקיבלתם הודעה דחופה הקשורה ל־${subject} ובה בקשה לביצוע פעולה שאינה בשגרה.`,
      bulletPoints: [
        'האם אתם מזהים בוודאות את המקור?',
        'האם הבקשה תואמת את הנהלים הרגילים?',
        'האם יש צורך לאמת בערוץ תקשורת נפרד?'
      ],
      speakerNotes: 'שאלו את המשתתפים כיצד היו פועלים במצב זה.',
      visualSuggestion: 'איור של עובד מול מחשב עם תיבת התראה מהבהבת.'
    },
    {
      id: 6,
      title: 'צ׳קליסט בטיחות יומי',
      content: facts[2] || 'יישום בקרות בסיסיות בשגרת העבודה שלכם יצמצם משמעותית את סיכוני האבטחה.',
      bulletPoints: [
        'בדיקת שולח וכתובת מייל לפני פתיחת קישורים',
        'אימות בקשות כספיות או הרשאות בערוץ נפרד',
        'נעילת מסך המחשב בכל יציאה מהעמדה'
      ],
      speakerNotes: 'עודדו את העובדים להדפיס או לשמור את הצ׳קליסט.',
      visualSuggestion: 'צ׳קליסט מעוצב עם תיבות סימון ירוקות.'
    },
    {
      id: 7,
      title: 'סיכום ומסקנות',
      content: 'הגנה על הארגון היא מאמץ משותף. כל עובד ועובדת מהווים חוליה קריטית בשרשרת האבטחה.',
      bulletPoints: [
        'עצירה ובדיקה מונעות את רוב תקיפות הסייבר',
        'דיווח מהיר מאפשר לצוות האבטחה להגן על כלל החברה',
        'המשך מודעות ולמידה שוטפת הם המפתח להצלחה'
      ],
      speakerNotes: 'הודו למשתתפים על ההקשבה ופתחו את הבמה לשאלות.',
      visualSuggestion: 'סמל ShieldX זוהר בטורקיז עם הכיתוב תודה רבה.'
    }
  ];

  const selected = slides.slice(0, requestedCount - 1);
  selected.push(slides[slides.length - 1]);

  const finalExam = [
    {
      question: `מהי המטרה העיקרית של הדרכה בנושא ${subject}?`,
      answers: [
        'להגביר את המודעות ולצמצם סיכוני אבטחה בארגון',
        'להפוך את כל העובדים למתכנתי מחשבים',
        'לשנות את הגדרות הרשת בכל המחשבים',
        'להתקין תוכנות חדשות ללא אישור'
      ],
      correctAnswerIndex: 0,
      explanation: 'הדרכת מודעות מיועדת לצמצם סיכונים על ידי הגברת ערנות העובדים.'
    },
    {
      question: 'נתקלתם בהודעה חשודה המבקשת פעולה דחופה. מהי הפעולה הראשונה הנכונה?',
      answers: [
        'לעצור, לאמת בערוץ נפרד ולדווח לצוות האבטחה',
        'לבצע מיד כדי לא לעכב את העבודה',
        'להשיב להודעה ולשאול אם זה בטוח',
        'להעביר את ההודעה לעובדים אחרים במחלקה'
      ],
      correctAnswerIndex: 0,
      explanation: 'אימות בערוץ נפרד ודיווח לצוות האבטחה מונעים פגיעה במערכות.'
    },
    {
      question: 'מה פירוש השלב "עצור" במותג הפעולה הארגוני?',
      answers: [
        'לא ללחוץ על קישורים, לא לפתוח קבצים ולא למסור מידע לפני אימות',
        'לכבות את המחשב וללכת הביתה',
        'להמתין לסוף יום העבודה לפני שמדווחים',
        'למחוק את ההודעה ללא בדיקה'
      ],
      correctAnswerIndex: 0,
      explanation: 'עצירה מונעת הפעלה מיידית של קוד זדוני או חשיפת מידע.'
    }
  ];

  return {
    id: `deck-${Date.now()}`,
    title: subject,
    description: `קורס הדרכה מקיף בנושא ${subject} המיועד עבור ${audience}.`,
    learningObjectives: [
      `הבנת סיכוני האבטחה הקשורים ל-${subject}`,
      'זיהוי סימני אזהרה ודגלים אדומים בשגרת העבודה',
      'פעולה נכונה על פי נהלי ShieldX למניעת אירועי סייבר'
    ],
    slides: selected.map((s, idx) => ({ ...s, id: idx + 1 })),
    finalExam,
    mode: 'local'
  };
}

export async function generatePresentation(input) {
  // Read Gemini API key saved by admin panel
  const geminiKey = localStorage.getItem('shieldx_gemini_api_key') || '';

  // If no key → fall back to local generator immediately
  if (!geminiKey) {
    console.info('[AI] No Gemini API key configured — using local generator.');
    await new Promise((resolve) => window.setTimeout(resolve, 1200));
    return generateLocalPresentation(input);
  }

  const { prompt, sourceText = '', audience = 'עובדי החברה', slideCount = 7, difficulty = 'בינוני', duration = 30, language = 'עברית', passScore = 80 } = input;

  const systemPrompt = `אתה מומחה לבניית קורסי הדרכה ארגוניים בתחום אבטחת מידע וסייבר.
צור מצגת הדרכה מקצועית בנושא: "${prompt}".
קהל יעד: ${audience}. רמת קושי: ${difficulty}. משך: ${duration} דקות. שפה: ${language}.
${sourceText ? `השתמש גם בתוכן הבא שהמשתמש סיפק:\n${sourceText.slice(0, 3000)}` : ''}

החזר JSON בדיוק בפורמט הבא (ללא markdown, רק JSON טהור):
{
  "title": "כותרת הקורס",
  "description": "תיאור קצר",
  "learningObjectives": ["מטרה 1", "מטרה 2", "מטרה 3"],
  "slides": [
    {
      "id": 1,
      "title": "כותרת השקופית",
      "content": "תוכן ראשי של השקופית (2-3 משפטים)",
      "bulletPoints": ["נקודה 1", "נקודה 2", "נקודה 3"],
      "speakerNotes": "הערות למרצה",
      "visualSuggestion": "תיאור ויזואלי מוצע"
    }
  ],
  "finalExam": {
    "questions": [
      {
        "question": "שאלה בנושא",
        "answers": ["תשובה נכונה", "תשובה שגויה 1", "תשובה שגויה 2", "תשובה שגויה 3"],
        "correctAnswerIndex": 0,
        "explanation": "הסבר קצר"
      }
    ]
  }
}

צור בדיוק ${Math.min(12, Math.max(4, Number(slideCount)))} שקופיות.
צור בדיוק 5 שאלות מבחן בסוף.
ציון מעבר: ${passScore}.
הכל בעברית. אל תוסיף markdown, code blocks או טקסט מחוץ ל-JSON.`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: systemPrompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 8192,
            responseMimeType: 'application/json'
          }
        })
      }
    );

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      const errMsg = errData?.error?.message || `שגיאת Gemini API (${response.status})`;
      throw new Error(errMsg);
    }

    const geminiData = await response.json();
    const rawText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // Parse JSON — strip any accidental markdown fences
    const cleaned = rawText.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
    const parsed = JSON.parse(cleaned);

    if (!parsed.slides || !Array.isArray(parsed.slides)) {
      throw new Error('תגובת ה-AI לא כללה שקופיות תקינות.');
    }

    // Normalise slide schema
    const slides = parsed.slides.map((s, idx) => ({
      id: idx + 1,
      title: s.title || `שקופית ${idx + 1}`,
      content: s.content || '',
      bulletPoints: Array.isArray(s.bulletPoints) ? s.bulletPoints : [],
      speakerNotes: s.speakerNotes || '',
      visualSuggestion: s.visualSuggestion || ''
    }));

    // Normalise exam questions
    const questions = Array.isArray(parsed.finalExam?.questions)
      ? parsed.finalExam.questions.map((q) => ({
          question: q.question || '',
          answers: Array.isArray(q.answers) ? q.answers : ['א', 'ב', 'ג', 'ד'],
          correctAnswerIndex: typeof q.correctAnswerIndex === 'number' ? q.correctAnswerIndex : 0,
          explanation: q.explanation || ''
        }))
      : [];

    return {
      id: `deck-${Date.now()}`,
      title: parsed.title || prompt,
      description: parsed.description || '',
      learningObjectives: Array.isArray(parsed.learningObjectives) ? parsed.learningObjectives : [],
      slides,
      finalExam: {
        questions,
        pointsPerQuestion: 10,
        passScore,
        randomized: true
      },
      mode: 'gemini'
    };

  } catch (err) {
    console.warn('[AI] Gemini call failed:', err.message);
    // Surface API key errors clearly without fallback
    if (err.message.includes('API_KEY') || err.message.includes('API key') || err.message.includes('401') || err.message.includes('403')) {
      throw new Error(`🔑 מפתח Gemini API שגוי או לא תקין. בדוק את המפתח בהגדרות Admin. (${err.message})`);
    }
    // Other errors → silent fallback to local
    await new Promise((resolve) => window.setTimeout(resolve, 800));
    return generateLocalPresentation(input);
  }
}

export async function refineSlide(action, slide, topic) {
  const geminiKey = localStorage.getItem('shieldx_gemini_api_key') || '';

  if (!geminiKey) {
    // Offline refinement — basic local transformation
    await new Promise((resolve) => window.setTimeout(resolve, 600));
    const refined = { ...slide };
    if (action === 'expand') {
      refined.content = `${slide.content} פירוט נוסף: ניתן להרחיב כאן את ההסבר עם דוגמאות נוספות מהשטח הרלוונטיות ל${topic}.`;
      refined.bulletPoints = [...(slide.bulletPoints || []), 'נקודה נוספת להרחבה'];
    } else if (action === 'simplify') {
      refined.content = slide.content.split('.').slice(0, 1).join('.') + '.';
    } else if (action === 'example') {
      refined.bulletPoints = [...(slide.bulletPoints || []), `דוגמה מעשית: מקרה אמיתי בתחום ${topic}`];
    }
    return refined;
  }

  const actionMap = {
    expand: 'הרחב את תוכן השקופית, הוסף פרטים ודוגמאות',
    simplify: 'פשט את השקופית לשפה ברורה יותר, קצר כל נקודה',
    example: 'הוסף דוגמה מעשית אמיתית לשקופית',
    quiz: 'הפוך את השקופית לשאלה אינטראקטיבית'
  };

  const refinePrompt = `${actionMap[action] || action} עבור שקופית זו בנושא "${topic}":
כותרת: ${slide.title}
תוכן: ${slide.content}
נקודות: ${(slide.bulletPoints || []).join(' | ')}

החזר JSON בלבד:
{
  "title": "...",
  "content": "...",
  "bulletPoints": ["...", "...", "..."],
  "speakerNotes": "...",
  "visualSuggestion": "..."
}`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: refinePrompt }] }],
        generationConfig: { temperature: 0.5, maxOutputTokens: 2048, responseMimeType: 'application/json' }
      })
    }
  );

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData?.error?.message || 'תקלה בעריכת השקופית באמצעות AI.');
  }

  const geminiData = await response.json();
  const rawText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  const cleaned = rawText.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
  return JSON.parse(cleaned);
}
