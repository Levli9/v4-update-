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
      type: 'cover',
      title: subject,
      subtitle: `מצגת הדרכה עבור ${audience}`,
      bullets: [],
      accent: '#00e6ff'
    },
    {
      type: 'content',
      title: 'למה הנושא חשוב?',
      subtitle: 'התמונה הגדולה',
      bullets: [
        sourceBullet(ranked, 0, facts[0]),
        sourceBullet(ranked, 1, 'טעות אנוש קטנה יכולה להפוך לאירוע אבטחה משמעותי.'),
        sourceBullet(ranked, 2, 'המטרה היא לזהות את הסיכון לפני שמבצעים פעולה.')
      ],
      accent: '#9d4edd'
    },
    {
      type: 'content',
      title: 'סימנים שצריך לזהות',
      subtitle: 'עוצרים לפני שפועלים',
      bullets: [
        sourceBullet(ranked, 3, facts[1]),
        sourceBullet(ranked, 4, 'בקשה חריגה, לחץ זמן או שינוי פתאומי בתהליך הם דגל אדום.'),
        sourceBullet(ranked, 5, 'בודקים את המקור בערוץ נוסף ואמין לפני שממשיכים.')
      ],
      accent: '#ffb703'
    },
    {
      type: 'steps',
      title: 'מודל פעולה: עצור, בדוק, דווח',
      subtitle: 'שלושה צעדים פשוטים',
      bullets: [
        { text: 'עצור — אל תלחץ, אל תפתח ואל תמסור מידע.', citation: null },
        { text: 'בדוק — אמת את השולח, הכתובת, ההקשר והבקשה.', citation: null },
        { text: 'דווח — העבר לצוות האבטחה ושמור את הראיות.', citation: null }
      ],
      accent: '#10b981'
    },
    {
      type: 'scenario',
      title: 'תרחיש מהשטח',
      subtitle: 'מה היית עושה?',
      bullets: [
        sourceBullet(ranked, 6, `קיבלת הודעה דחופה הקשורה ל־${subject} ובה בקשה לבצע פעולה לא שגרתית.`),
        { text: 'סמנו אילו פרטים דורשים אימות לפני פעולה.', citation: null },
        { text: 'בחרו למי מדווחים ומה שומרים כתיעוד.', citation: null }
      ],
      accent: '#f43f5e'
    },
    {
      type: 'checklist',
      title: 'צ׳קליסט לעובד',
      subtitle: 'לפני שממשיכים',
      bullets: [
        { text: 'האם אני מזהה בוודאות את המקור?', citation: null },
        { text: 'האם הבקשה תואמת לתהליך העבודה הרגיל?', citation: null },
        { text: 'האם אימתתי את הבקשה בערוץ נפרד?', citation: null },
        sourceBullet(ranked, 7, facts[2])
      ],
      accent: '#4cc9f0'
    },
    {
      type: 'quiz',
      title: 'בדיקת הבנה',
      subtitle: 'שאלת סיכום',
      bullets: [
        { text: `מהי הפעולה הראשונה הנכונה כאשר מזהים סימן חשוד בנושא ${subject}?`, citation: null },
        { text: 'א. לבצע מיד כדי לא לעכב את העבודה', citation: null },
        { text: 'ב. לעצור, לאמת ולדווח', citation: null },
        { text: 'ג. להעביר לעובד אחר', citation: null }
      ],
      accent: '#a855f7'
    },
    {
      type: 'summary',
      title: 'שלושה דברים לזכור',
      subtitle: 'סיכום',
      bullets: facts.map((text) => ({ text, citation: null })),
      accent: '#00e6ff'
    }
  ];

  const selected = slides.slice(0, requestedCount - 1);
  selected.push(slides[slides.length - 1]);

  const result = {
    id: `deck-${Date.now()}`,
    title: subject,
    audience,
    createdAt: new Date().toISOString(),
    mode: 'local',
    sources: sourceParts.map((text, index) => ({ id: index + 1, text })),
    slides: selected
  };
  return { ...result, coursePackage: buildCoursePackage({ subject, audience, difficulty, duration, language, slides: selected }) };
}

export async function generatePresentation(input) {
  try {
    const response = await fetch('/api/generate-course', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'שירות ה-AI לא זמין כרגע. נסו שוב בעוד רגע.');
    }

    const data = await response.json();
    return { ...data, mode: 'ai' };
  } catch (error) {
    console.warn('API call failed, falling back to local simulation:', error.message);
    // If the backend failed due to lack of API key, bubble up that error instead of silent fallback
    if (error.message.includes('ספק AI אינו מוגדר') || error.message.includes('API key')) {
      throw error;
    }
    
    // Otherwise fallback to local generator
    await new Promise((resolve) => window.setTimeout(resolve, 1500));
    return generateLocalPresentation(input);
  }
}

export async function refineSlide(action, slide, topic) {
  const response = await fetch('/api/refine-slide', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, slide, topic })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'תקלה בעריכת השקופית באמצעות AI.');
  }

  return await response.json();
}
