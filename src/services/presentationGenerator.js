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
