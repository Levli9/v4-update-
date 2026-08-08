// src/services/openNotebookService.js
// Open-Notebook RAG Engine: Persistent hidden organizational knowledge bases

const STORAGE_KEY = 'shieldx_open_notebook_sources';

const DEFAULT_SOURCES = [
  {
    id: 'source-phishing-protocol',
    title: 'נוהל ארגוני: זיהוי ודיווח על מתקפות פישינג והנדסה חברתית',
    category: 'נהלים ארגוניים',
    tags: ['פישינג', 'הנדסה חברתית', 'וואטסאפ', 'סמס', 'אימייל', 'דיווח'],
    content: `
נוהל אבטחת מידע - תגובה לאירועי פישינג והנדסה חברתית:
1. זיהוי הודעות חשודות:
   - כל הודעה המבקשת לעדכן פרטים אישיים, סיסמאות או כרטיסי אשראי תיחשב כפישינג עד להוכחת אחרת.
   - הודעות בוואטסאפ או סמס המכילות קישורים מקוצרים (bit.ly, tinyurl וכד') או שולח בלתי מוכר דורשות אימות טלפוני נפרד.
2. כללי עשה ואל תעשה:
   - אין ללחוץ על קישורים בהודעות לא צפויות.
   - אין להוריד קבצים מצורפים מנמענים לא מוכרים.
   - אין להזין את פרטי ההתחברות הארגוניים מחוץ לפורטל הרשמי.
3. תהליך הדיווח הארגוני:
   - בעת קבלת מייל או הודעה חשודה, יש ללחוץ על כפתור "דווח כפישינג" בתיבת הדואר או להעביר מיד לצוות ה-SOC בכתובת security@organization.com.
   - במידה ובוצעה לחיצה על קישור חשוד, יש לנתק מיד את המחשב/טלפון מהרשת הארגונית ולהודיע טלפונית למוקד התמיכה.
`
  },
  {
    id: 'source-password-mfa-policy',
    title: 'מדיניות ארגונית: ניהול סיסמאות ואימות רב-שלבי (MFA)',
    category: 'מדיניות אבטחה',
    tags: ['סיסמאות', 'MFA', 'אימות', 'אבטחת מידע', 'גישה'],
    content: `
מדיניות סיסמאות ואימות רב-שלבי:
1. דרישות סיסמה ארגונית:
   - אורך מינימלי: 12 תווים לפחות.
   - הרכב חובה: אותיות גדולות (A-Z), אותיות קטנות (a-z), ספרות (0-9) ותווים מיוחדים (!@#$%^&*).
   - איסור שימוש חוזר ב-10 הסיסמאות האחרונות.
2. אימות רב-שלבי (MFA):
   - חובת הפעלת MFA באמצעות אפליקציית אימות (Authenticator App) בכל התחברות מרחוק או למערכות ליבה.
   - איסור מוחלט על שיתוף קודי OTP או אישור בקשות Push לא מתוכננות (Push Fatigue).
3. ניהול סיסמאות:
   - יש להשתמש במנהל סיסמאות ארגוני מאושר (Password Manager).
   - חל איסור מוחלט על רישום סיסמאות בדף, בקובץ טקסט לא מוצפן או בדפדפן.
`
  },
  {
    id: 'source-ransomware-incident-response',
    title: 'נוהל חירום: התמודדות עם תוכנות כופר (Ransomware) ונוזקות',
    category: 'תגובה לאירועים',
    tags: ['כופרה', 'Ransomware', 'נוזקה', 'Malware', 'הצפנה', 'אירוע סייבר'],
    content: `
נוהל חירום ארגוני - תוכנות כופר ונוזקות:
1. זיהוי תסמינים ראשוניים:
   - הודעת כופר המופיעה על המסך או שינוי סיומות קבצים באופן פתאומי.
   - איטיות חריגה או נעילה של קבצים בשרתים משותפים.
2. תגובה מיידית (Containment):
   - ניתוק מיידי של הכבל הרשת (Ethernet) או כיבוי ה-Wi-Fi בתחנה.
   - אין לכבות את המחשב (כדי לשמור על זיכרון RAM לחקירה פורנזית) אלא לנתק תקשורת בלבד.
3. נוהל הדיווח והמשכיות:
   - דיווח מידי למנהל אבטחת המידע (CISO) ולצוות ה-SOC.
   - חל איסור מוחלט על שילום דמי כופר.
   - שחזור המערכות מבוצע אך ורק מתוך גיבויים מבודדים (Offline Backups).
`
  },
  {
    id: 'source-zero-trust-cloud-security',
    title: 'ארכיטקטורת אבטחה: Zero Trust וענן ארגוני',
    category: 'ארכיטקטורת אבטחה',
    tags: ['Zero Trust', 'ענן', 'Cloud', 'הרשאות', 'סגמנטציה'],
    content: `
עקרונות Zero Trust בארגון:
1. אפס אמון מובנה:
   - כל בקשת גישה למשאב ארגוני (פנימי או בענן) נבדקת ומאומתת, ללא קשר למיקום הפיזי של העובד.
2. עקרון הרשאה מינימלית (Least Privilege):
   - לכל עובד או מערכת מוקצות אך ורק ההרשאות הנדרשות לביצוע תפקידם (Just-In-Time Access).
3. סגמנטציה ואימות מתמשך:
   - חלוקת הרשת הארגונית והענן לסגמנטים מאובטחים למניעת תנועה רוחבית של תוקפים (Lateral Movement).
   - אימות מתמשך של תקינות התחנה והתנהגות המשתמש.
`
  }
];

// Initialize sources in localStorage if not present
const getSources = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn('Failed loading Open-Notebook sources:', e);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SOURCES));
  return DEFAULT_SOURCES;
};

export const openNotebookService = {
  // Get all active persistent sources
  getSources,

  // Add a new hidden persistent organizational source (Admin / Manager)
  addSource: (title, category, content, tags = []) => {
    const sources = getSources();
    const newSource = {
      id: `source-${Date.now()}`,
      title: title.trim(),
      category: category.trim() || 'נהלים ארגוניים',
      tags: Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim()).filter(Boolean),
      content: content.trim(),
      createdAt: new Date().toISOString()
    };
    sources.unshift(newSource);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sources));
    return newSource;
  },

  // RAG Search Engine: Retrieve most relevant hidden knowledge snippets based on user free text prompt
  retrieveKnowledgeContext: (userPrompt = '') => {
    const sources = getSources();
    if (!userPrompt || !userPrompt.trim()) {
      return {
        contextText: sources.map(s => `[מקור: ${s.title}]\n${s.content}`).join('\n\n'),
        matchedSources: sources
      };
    }

    const cleanPrompt = userPrompt.toLowerCase();
    const promptWords = cleanPrompt.split(/\s+/).filter(w => w.length > 2);

    const scored = sources.map(source => {
      let score = 0;
      const textToSearch = `${source.title} ${source.category} ${source.tags.join(' ')} ${source.content}`.toLowerCase();

      promptWords.forEach(word => {
        if (textToSearch.includes(word)) score += 3;
      });

      source.tags.forEach(tag => {
        if (cleanPrompt.includes(tag.toLowerCase())) score += 5;
      });

      return { source, score };
    });

    scored.sort((a, b) => b.score - a.score);

    // Pick top matching sources (or all if scores are low)
    const topMatches = scored.filter(item => item.score > 0).map(item => item.source);
    const selected = topMatches.length > 0 ? topMatches : sources.slice(0, 2);

    const contextText = selected.map(s => `=== מקור ארגוני נסתר (Open-Notebook): ${s.title} ===\n${s.content.trim()}`).join('\n\n');

    return {
      contextText,
      matchedSources: selected
    };
  }
};

export default openNotebookService;
