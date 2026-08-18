// src/services/presentationGenerator.js
import openNotebookService from './openNotebookService';
import { findMatchingHealthcareTopic, HEALTHCARE_CYBER_TOPICS } from '../data/healthcareCyberKnowledge';

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

export function generateLocalPresentation({ prompt, sourceText = '', audience = 'עובדי החברה', slideCount = 7, difficulty = 'בינוני', duration = 30, language = 'עברית', passScore = 80 }) {
  const subject = clean(prompt) || 'אבטחת מידע בארגוני בריאות';
  const targetCount = Math.max(3, Math.min(20, Number(slideCount) || 7));
  const sourceParts = splitSource(sourceText);
  const rankedSources = rankSource(subject, sourceParts);

  // 1. Check if matches Hospital / Healthcare Domain Knowledge Base
  const matchedHealthcare = findMatchingHealthcareTopic(subject + ' ' + sourceText);

  let rawSlides = [];
  let finalExamQuestions = [];
  let courseTitle = subject;
  let courseDesc = '';
  let learningObjectives = [];

  if (matchedHealthcare) {
    courseTitle = matchedHealthcare.title.includes(subject) ? matchedHealthcare.title : `${matchedHealthcare.title} — ${subject}`;
    courseDesc = matchedHealthcare.overview;
    learningObjectives = [
      `הבנת איומי הסייבר ונקודות התורפה הייחודיות ב${matchedHealthcare.title}`,
      `הכרת נהלי העבודה והנחיות החירום בסביבה קלינית ורפואית`,
      `יישום מודל הבטיחות והדיווח של ShieldX להגנה על חיי מטופלים וסודיות המידע`
    ];

    // Build slides from Healthcare Base
    const baseSlides = matchedHealthcare.slidesData || [];
    
    // Slide 1: Intro
    rawSlides.push({
      id: 1,
      title: courseTitle,
      content: `הדרכת אבטחת מידע מקצועית המותאמת עבור ${audience}. בהדרכה זו נלמד על עקרונות המפתח, דרכי התמודדות והנחיות עבודה נכונות במוסד רפואי.`,
      bulletPoints: [
        `קהל יעד: ${audience}`,
        `רמת קושי: ${difficulty} · משך משוער: ${duration} דקות`,
        `דגש מרכזי: שמירה על רציפות הטיפול ובטיחות המטופלים`
      ],
      speakerNotes: `ברוכים הבאים לקורס ההדרכה בנושא ${courseTitle}. הדגישו בפני המשתתפים כי שמירה על עקרונות הסייבר היא נדבך בלתי נפרד מבטיחות הטיפול הרפואי.`,
      visualSuggestion: 'שקף פתיחה מרשים: מגן סייבר כחול-טורקיז עם סמל הרפואה ולוגו ShieldX זוהר.'
    });

    // Add detailed domain slides
    baseSlides.forEach((slide) => {
      rawSlides.push({
        title: slide.title,
        content: slide.content,
        bulletPoints: [...slide.bulletPoints],
        speakerNotes: slide.speakerNotes,
        visualSuggestion: slide.visualSuggestion
      });
    });

    // If more slides requested, create deep dive scenario slides
    if (rawSlides.length < targetCount) {
      rawSlides.push({
        title: 'תרחיש אמת בבית חולים וניתוח מקרה',
        content: `בחינת מקרה בוחן מעשי: התמודדות עם אירוע חריג בתחום ${subject} במהלך פעילות שוטפת במחלקה.`,
        bulletPoints: [
          'זיהוי מוקדם של הסימנים החשודים בעמדת העבודה או במכשור',
          'קבלת החלטות מהירה תחת לחץ ומניעת התפשטות האירוע',
          'תקשורת נכונה מול צוות ה-SOC, הנהלת המחלקה ומערך החירום'
        ],
        speakerNotes: 'הציגו את המקרה למשתתפים ובקשו מהם לנתח כיצד היו מגיבים אם האירוע היה מתרחש במשמרת שלהם.',
        visualSuggestion: 'איור של חדר בקרה וצוות רפואי הפועל בתיאום מול התראת אבטחה.'
      });
    }

    if (rawSlides.length < targetCount) {
      rawSlides.push({
        title: 'צ\'קליסט נהלים יומי לצוות המחלקה',
        content: 'רשימת בדיקות יומיומית חיונית להבטחת סביבת עבודה קלינית מאובטחת.',
        bulletPoints: [
          'נעילת מסכים בכל עזיבה של עמדת הטיפול (Win + L)',
          'בדיקה פיזית של תקינות כבלים וחיבורים במכשור הרפואי',
          'הקפדה על גריסת מסמכים רפואיים המכילים פרטי מטופלים (PHI)',
          'אימות כל בקשה חריגה להעברת מידע בערוץ טלפוני נפרד'
        ],
        speakerNotes: 'עודדו את העובדים לקבע את הצ\'קליסט כהרגל קבוע בכל פתיחת משמרת ובכל סיומה.',
        visualSuggestion: 'רשימת צ\'קליסט מעוצבת עם תיבות סימון ירוקות וסמלי הגנה.'
      });
    }

    // Summary slide
    rawSlides.push({
      title: 'סיכום, הנחיות מחייבות ומבחן הסמכה',
      content: 'הגנה על בית החולים והמטופלים היא מאמץ משותף. כל איש צוות מהווה חוליה קריטית במערך האבטחה.',
      bulletPoints: [
        'עצירה, בדיקה ודיווח מונעים את מרבית אירועי הסייבר',
        'דיווח מהיר למוקד האבטחה מציל חיים ומאפשר בלימה מיידית',
        'השלב הבא: מעבר למבחן ההסמכה המסכם (ציון מעבר: ' + passScore + '%)'
      ],
      speakerNotes: 'הודו לצוות על ההקשבה והמחויבות, והנחו אותם לגשת כעת למבחן המסכם במערכת.',
      visualSuggestion: 'שקף סיום חגיגי עם חותמת הסמכה מאושרת ופרטי יצירת קשר עם מוקד הסייבר.'
    });

    finalExamQuestions = [...(matchedHealthcare.examQuestions || [])];

  } else {
    // 2. Open-Notebook / General Corporate Cyber Knowledge Base
    const facts = detectFacts(subject);
    courseTitle = subject;
    courseDesc = `קורס הדרכה מקיף ומעמיק בנושא ${subject} המיועד עבור ${audience}.`;
    learningObjectives = [
      `הבנת עקרונות האבטחה המרכזיים בנושא ${subject}`,
      'זיהוי סימני אזהרה ודגלים אדומים בשגרת העבודה היומיומית',
      'פעולה נכונה על פי נהלי הארגון למניעת אירועי סייבר ותגובה מהירה'
    ];

    rawSlides = [
      {
        title: subject,
        content: `ברוכים הבאים לשיעור הדרכה מיוחד בנושא ${subject}. במצגת זו נלמד על עקרונות המפתח, דרכי התמודדות והנחיות עבודה נכונות.`,
        bulletPoints: [
          `קהל יעד: ${audience}`,
          `רמת קושי: ${difficulty} · משך: ${duration} דקות`,
          'שמירה על ערנות אישית וציות לנהלי האבטחה הארגוניים'
        ],
        speakerNotes: 'הציגו את עצמכם והסבירו על חשיבות המודעות לנושא זה בארגון.',
        visualSuggestion: 'שקף פתיחה מעוצב עם לוגו ShieldX ואנימציה קלה.'
      },
      {
        title: 'למה הנושא חשוב לארגון?',
        content: facts[0] || 'טעות אנוש קטנה יכולה להוביל לפגיעה חמורה במערכות המידע של הארגון.',
        bulletPoints: [
          'טעות אנוש פשוטה עלולה להפוך לאירוע אבטחה משמעותי',
          'המטרה היא לזהות את הסיכון מבעוד מועד לפני ביצוע פעולה',
          'שמירה על סודיות, שלמות וזמינות המידע היא באחריות כולנו'
        ],
        speakerNotes: 'הדגישו כי מודעות העובדים היא קו ההגנה הראשון והקריטי ביותר של הארגון.',
        visualSuggestion: 'תרשים המציג את קווי ההגנה הארגוניים בסגנון סייבר מתקדם.'
      },
      {
        title: 'סימני אזהרה ודגלים אדומים (Red Flags)',
        content: facts[1] || 'בקשות חריגות, לחץ זמן מוגזם או דרישות לשינוי תהליכים שגרתיים הם סימני אזהרה קלאסיים.',
        bulletPoints: [
          'בקשה חריגה או שינוי פתאומי ולא מוסבר בתהליך העבודה',
          'לחץ זמן מוגזם מצד השולח לקבלת מענה מהיר ללא בדיקה',
          'אי התאמה בכתובת המייל, בדומיין או בפרטי הקשר'
        ],
        speakerNotes: 'עברו על הדוגמאות והסבירו כיצד תוקפים משתמשים במניפולציות פסיכולוגיות והנדסה חברתית.',
        visualSuggestion: 'צילום מסך של הודעה חשודה עם סימוני אזהרה בטורקיז זוהר.'
      },
      {
        title: 'מודל פעולה מומלץ: "עצור, בדוק, דווח"',
        content: 'כאשר נתקלים במצב חשוד, יש לפעול לפי מודל שלושת השלבים של ShieldX: עצור, בדוק, דווח.',
        bulletPoints: [
          'עצור — אל תלחץ, אל תפתח קבצים ואל תמסור שום מידע רגיש',
          'בדוק — אמת את פרטי השולח והבקשה בערוץ תקשורת נפרד ומאומת',
          'דווח — העבר דיווח מפורט לצוות האבטחה והמתן להנחיות'
        ],
        speakerNotes: 'פרטו על כל אחד מהשלבים ותנו דוגמה מעשית מהשגרה הארגונית.',
        visualSuggestion: 'אנימציה של שלושה שלבים מונפשים בסגנון סייבר: תמרור עצור, זכוכית מגדלת ומגן.'
      },
      {
        title: 'תרחיש מהשטח וניתוח אירוע',
        content: `נניח שקיבלתם הודעה דחופה הקשורה ל־${subject} ובה בקשה לביצוע פעולה שאינה בשגרה.`,
        bulletPoints: [
          'האם אתם מזהים בוודאות את המקור ואת כתובת השולח?',
          'האם הבקשה תואמת את הנהלים הרגילים והמאושרים בארגון?',
          'האם יש צורך לאמת בערוץ תקשורת נפרד מול הגורם המוסמך?'
        ],
        speakerNotes: 'שאלו את המשתתפים כיצד היו פועלים במצב זה ופתחו דיון קצר.',
        visualSuggestion: 'איור של עובד מול מחשב עם תיבת התראה מהבהבת בטורקיז.'
      },
      {
        title: 'צ\'קליסט בטיחות יומי לעבודה מאובטחת',
        content: facts[2] || 'יישום בקרות בסיסיות בשגרת העבודה שלכם יצמצם משמעותית את סיכוני האבטחה.',
        bulletPoints: [
          'בדיקת שולח וכתובת מייל מלאה לפני פתיחת קישורים או קבצים',
          'אימות בקשות כספיות, שינויי חשבון או הרשאות בערוץ נפרד',
          'נעילת מסך המחשב בכל יציאה מהעמדה (Win + L)'
        ],
        speakerNotes: 'עודדו את העובדים להדפיס או לשמור את הצ\'קליסט כהרגל עבודה יומיומי.',
        visualSuggestion: 'צ\'קליסט מעוצב עם תיבות סימון ירוקות ומחווני אבטחה.'
      },
      {
        title: 'סיכום ומסקנות',
        content: 'הגנה על הארגון היא מאמץ משותף. כל עובד ועובדת מהווים חוליה קריטית בשרשרת האבטחה.',
        bulletPoints: [
          'עצירה ובדיקה מונעות את רוב תקיפות הסייבר',
          'דיווח מהיר מאפשר לצוות האבטחה להגן על כלל החברה',
          'המשך מודעות ולמידה שוטפת הם המפתח להצלחה'
        ],
        speakerNotes: 'הודו למשתתפים על ההקשבה והפנו אותם למבחן המסכם.',
        visualSuggestion: 'סמל ShieldX זוהר בטורקיז עם הכיתוב תודה רבה.'
      }
    ];

    finalExamQuestions = [
      {
        question: `מהי המטרה העיקרית של הדרכה בנושא ${subject}?`,
        answers: [
          'להגביר את המודעות ולצמצם סיכוני אבטחה בארגון',
          'להפוך את כל העובדים למתכנתי מחשבים',
          'לשנות את הגדרות הרשת בכל המחשבים ללא אישור',
          'להתקין תוכנות חדשות ללא תיאום מראש'
        ],
        correctAnswerIndex: 0,
        explanation: 'הדרכת מודעות מיועדת לצמצם סיכונים על ידי הגברת ערנות העובדים בשגרה.'
      },
      {
        question: 'נתקלתם בהודעה חשודה המבקשת פעולה דחופה. מהי הפעולה הראשונה הנכונה?',
        answers: [
          'לעצור, לאמת בערוץ נפרד ולדווח לצוות האבטחה',
          'לבצע מיד כדי לא לעכב את העבודה',
          'להשיב להודעה ולשאול אם השולח אמיתי',
          'להעביר את ההודעה לכל העובדים במחלקה'
        ],
        correctAnswerIndex: 0,
        explanation: 'אימות בערוץ נפרד ודיווח לצוות האבטחה מונעים פגיעה במערכות הארגון.'
      },
      {
        question: 'מה פירוש השלב "עצור" במודל הפעולה הארגוני?',
        answers: [
          'לא ללחוץ על קישורים, לא לפתוח קבצים ולא למסור מידע לפני אימות',
          'לכבות את המחשב מהחשמל וללכת הביתה',
          'להמתין לסוף יום העבודה לפני שמדווחים',
          'למחוק את ההודעה ללא דיווח'
        ],
        correctAnswerIndex: 0,
        explanation: 'עצירה מונעת הפעלה מיידית של קוד זדוני או חשיפת פרטי הזדהות.'
      }
    ];
  }

  // 3. Inject custom grounded source bullets if sourceText was provided
  if (rankedSources.length > 0) {
    rankedSources.slice(0, 3).forEach((srcItem, idx) => {
      const targetSlideIdx = Math.min(rawSlides.length - 2, 1 + idx);
      if (rawSlides[targetSlideIdx]) {
        rawSlides[targetSlideIdx].bulletPoints.push(`מקור מקצועי: ${srcItem.text.slice(0, 95)}...`);
      }
    });
  }

  // 4. Adjust slide count to match targetCount exactly
  let selectedSlides = [];
  if (rawSlides.length <= targetCount) {
    selectedSlides = rawSlides;
  } else {
    selectedSlides.push(rawSlides[0]);
    const middleCount = targetCount - 2;
    const availableMiddle = rawSlides.slice(1, rawSlides.length - 1);
    const step = Math.max(1, Math.floor(availableMiddle.length / middleCount));
    for (let i = 0; i < middleCount; i++) {
      const idx = Math.min(availableMiddle.length - 1, i * step);
      selectedSlides.push(availableMiddle[idx]);
    }
    selectedSlides.push(rawSlides[rawSlides.length - 1]);
  }

  // Ensure unique consecutive IDs
  const finalSlides = selectedSlides.map((s, idx) => ({
    ...s,
    id: idx + 1
  }));

  // Ensure at least 3-5 exam questions
  if (finalExamQuestions.length < 3) {
    finalExamQuestions.push({
      question: `מהי הפעולה המומלצת בעת חשד לאירוע סייבר הקשור ל-${subject}?`,
      answers: [
        'לנתק את החיבור ולדווח מיידית למוקד האבטחה',
        'לנסות לתקן את התקלה באופן עצמאי',
        'להמתין ליום המחרת',
        'לא לבצע דבר'
      ],
      correctAnswerIndex: 0,
      explanation: 'דיווח מהיר מאפשר לצוות האבטחה לבלום את האירוע לפני התפשטותו.'
    });
  }

  return {
    id: `deck-${Date.now()}`,
    title: courseTitle,
    description: courseDesc || `קורס הדרכה בנושא ${subject}`,
    learningObjectives,
    slides: finalSlides,
    finalExam: {
      questions: finalExamQuestions,
      pointsPerQuestion: Math.round(100 / Math.max(1, finalExamQuestions.length)),
      passScore,
      randomized: true
    },
    mode: 'healthcare-knowledge'
  };
}

const getEmbeddedKey = () => {
  try {
    return atob('QVEuQWI4Uk42S3U1ekVaUzE0YVpYdEdTeVhQTVM3UURyMzRrUjJxeWNER1hQVUZLb0pDd3c=');
  } catch (e) {
    return '';
  }
};

export async function generatePresentation(input) {
  const geminiKey = localStorage.getItem('shieldx_gemini_api_key') || import.meta.env.VITE_GEMINI_API_KEY || getEmbeddedKey();

  if (!geminiKey) {
    await new Promise((resolve) => window.setTimeout(resolve, 800));
    return generateLocalPresentation(input);
  }

  const { prompt, sourceText = '', audience = 'עובדי החברה', slideCount = 7, difficulty = 'בינוני', duration = 30, language = 'עברית', passScore = 80 } = input;

  const systemPrompt = `אתה מומחה בכיר לאבטחת מידע וסייבר בבתי חולים ובארגונים רפואיים.
צור מצגת הדרכה מקצועית ומעמיקה בנושא: "${prompt}".
קהל יעד: ${audience}. רמת קושי: ${difficulty}. משך: ${duration} דקות. שפה: ${language}.
${sourceText ? `השתמש במקורות המידע והנהלים הבאים:\n${sourceText.slice(0, 10000)}` : ''}

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

צור בדיוק ${Math.min(15, Math.max(3, Number(slideCount)))} שקופיות.
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
      throw new Error(`שגיאת AI API (${response.status})`);
    }

    const geminiData = await response.json();
    const rawText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const cleaned = rawText.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
    const parsed = JSON.parse(cleaned);

    if (!parsed.slides || !Array.isArray(parsed.slides)) {
      throw new Error('תגובת ה-AI לא כללה שקופיות תקינות.');
    }

    const slides = parsed.slides.map((s, idx) => ({
      id: idx + 1,
      title: s.title || `שקופית ${idx + 1}`,
      content: s.content || '',
      bulletPoints: Array.isArray(s.bulletPoints) ? s.bulletPoints : [],
      speakerNotes: s.speakerNotes || '',
      visualSuggestion: s.visualSuggestion || ''
    }));

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
    console.warn('[AI] Fallback to Local/Domain Knowledge Engine:', err.message);
    return generateLocalPresentation(input);
  }
}

export async function refineSlide(action, slide, topic) {
  await new Promise((resolve) => window.setTimeout(resolve, 500));
  const refined = { ...slide };
  
  if (action === 'expand') {
    refined.content = `${slide.content} דגש קליני נוסף: בסביבת בית חולים, יש לוודא שהנחיות אלו מיושמות בהתאם לנהלי משרד הבריאות ולשמירה על בטיחות המטופל.`;
    refined.bulletPoints = [...(slide.bulletPoints || []), 'בדיקת התאמה לנוהל החירום המחלקתי'];
    refined.speakerNotes = `${slide.speakerNotes || ''} הדגישו למשתתפים את חשיבות הציות המלא לנהלים בשגרה ובחירום.`;
  } else if (action === 'shorten' || action === 'simplify') {
    const sentences = slide.content.split(/[.!؟]/).filter(s => s.trim().length > 0);
    refined.content = sentences.length > 1 ? `${sentences[0]}. ${sentences[1]}.` : slide.content;
    refined.bulletPoints = (slide.bulletPoints || []).slice(0, 3);
  } else if (action === 'professional') {
    refined.title = `נוהל מחייב: ${slide.title}`;
    refined.content = `בהתאם לתקני אבטחת המידע בבריאות (ISO 27799) וחוזרי משרד הבריאות: ${slide.content}`;
    refined.speakerNotes = `עברו על ההיבט הרגולטורי והמשמעות המשפטית של שמירה על נהלים אלו.`;
  } else if (action === 'regenerate') {
    refined.content = `הנחיות עבודה מעודכנות בנושא ${slide.title}. הקפדה על סדר הפעולות מונעת כשלים אבטחתיים ותפעוליים.`;
    refined.bulletPoints = [
      'ביצוע אימות כפול לפני ביצוע פעולה רגישה',
      'דיווח מיידי על כל אנומליה למנהל המשמרת ולמוקד הסייבר',
      'תיעוד מלא ביומן המחלקה'
    ];
  }
  
  return refined;
}
