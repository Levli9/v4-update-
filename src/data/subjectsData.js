// src/data/subjectsData.js
export const subjectsData = [
  {
    id: 0,
    title: "מבוא: מהי תקיפת סייבר?",
    difficulty: "מתחיל",
    estimatedTime: "15 דק׳",
    emoji: "🛡️",
    color: "#00e6ff",
    description: "הבנת הנוף הדיגיטלי המאוים ועקרונות ה-CIA Triad.",
    slides: [
      {
        title: "שלושת עמודי אבטחת המידע – CIA Triad",
        content: "כל מדיניות אבטחת מידע נשענת על שלושה עקרונות יסוד: סודיות (Confidentiality), שלמות (Integrity), וזמינות (Availability). פגיעה באחד מהם מייצגת סוג אחר של כשל אבטחתי.",
        bullets: [
          "סודיות – רק משתמשים מורשים יכולים לגשת למידע.",
          "שלמות – מניעת שינוי או מחיקה בלתי מורשים של מידע.",
          "זמינות – מידע ומערכות צריכים להיות נגישים למורשים בעת הצורך."
        ]
      },
      {
        title: "מי עומד מאחורי מתקפות הסייבר?",
        content: "תוקפים בעולם הסייבר מתחלקים לקבוצות שונות בעלות אינטרסים ויכולות מגוונות:",
        bullets: [
          "Script Kiddies – חובבנים המשתמשים בכלים מוכנים ללא הבנה מעמיקה.",
          "Cybercriminals – פושעים מתוחכמים המונעים בעיקר מרווח פיננסי.",
          "Hacktivists – קבוצות המבצעות פריצות למטרות אידיאולוגיות או פוליטיות.",
          "Nation-States – תקיפות בחסות מדינות בעלות משאבים אדירים למטרות ריגול או פגיעה בתשתיות."
        ]
      }
    ],
    simulations: [
      {
        type: "phishing-analyzer"
      }
    ],
    quizzes: [
      {
        id: "q1_1",
        question: "מה מייצגת האות I במודל ה-CIA?",
        options: [
          "סודיות (Information)",
          "שלמות (Integrity)",
          "זמינות (Availability)",
          "אימות (Identity)"
        ],
        answer: 1,
        explanation: "האות I מייצגת Integrity (שלמות) - העיקרון שמונע שינוי לא מורשה של המידע."
      },
      {
        id: "q1_2",
        question: "מי מהתוקפים מונע בעיקר מאידיאולוגיה פוליטית?",
        options: [
          "Script Kiddies",
          "Cybercriminals",
          "Hacktivists",
          "Nation-State Developers"
        ],
        answer: 2,
        explanation: "Hacktivists מבצעים פריצות למטרות חברתיות, פוליטיות או אידיאולוגיות."
      }
    ]
  },
  {
    id: 1,
    title: "סיסמאות ואימות משתמשים",
    difficulty: "מתחיל",
    estimatedTime: "20 דק׳",
    emoji: "🔑",
    color: "#9d4edd",
    description: "כיצד ליצור סיסמאות חזקות וליישם אימות דו-שלבי (MFA).",
    slides: [
      {
        title: "חוזק סיסמאות ומנגנון Brute Force",
        content: "מערכות Brute Force מסוגלות לנסות מיליארדי שילובים בשנייה. אורך הסיסמה ומגוון התווים שלה קובעים את הזמן הנדרש לפריצתה.",
        bullets: [
          "אורך מומלץ: לפחות 12 תווים.",
          "שילוב תווים: אותיות גדולות, קטנות, מספרים וסימנים מיוחדים.",
          "מנהל סיסמאות: פתרון מומלץ למניעת שימוש חוזר בסיסמאות."
        ]
      }
    ],
    simulations: [
      {
        type: "password-validator"
      }
    ],
    quizzes: [
      {
        id: "q2_1",
        question: "מהי השיטה המומלצת ביותר למנוע גניבת חשבונות גם אם הסיסמה נפרצה?",
        options: [
          "שינוי סיסמה מדי שבוע",
          "הפעלת אימות דו-שלבי (MFA)",
          "שימוש בתווים מיוחדים בלבד",
          "מחיקת היסטוריית הדפדפן"
        ],
        answer: 1,
        explanation: "MFA מוסיף שכבת הגנה נוספת שדורשת אימות זיהוי נפרד, מה שמונע כניסה גם עם סיסמה נכונה."
      }
    ]
  },
  {
    id: 2,
    title: "פישינג והנדסה חברתית",
    difficulty: "בינוני",
    estimatedTime: "25 דק׳",
    emoji: "🎣",
    color: "#ffb703",
    description: "זיהוי הודעות דוא\"ל מזויפות ומניעת מתקפות הנדסה חברתית.",
    slides: [
      {
        title: "מהו פישינג (Phishing)?",
        content: "פישינג הוא שיטת תקיפה שבה מתחזה התוקף לגורם אמין כדי לגרום לקורבן לחשוף מידע רגיש, ללחוץ על קישור זדוני או להוריד קובץ נגוע.",
        bullets: [
          "דחיפות מוגזמת או איומים ('חשבונך ייחסם תוך 24 שעות').",
          "דומיינים מזויפים הנראים דומים למקור (למשל: paypa1.com).",
          "בקשה לפרטי זיהוי רגישים או כרטיסי אשראי."
        ]
      }
    ],
    simulations: [
      {
        type: "phishing-analyzer"
      }
    ],
    quizzes: [
      {
        id: "q3_1",
        question: "איזה מהבאים הוא סימן אזהרה קלאסי לפישינג?",
        options: [
          "הודעה בשפה רשמית עם לוגו נקי",
          "דרישה לפעולה דחופה תחת איום של השעיית החשבון",
          "קישור שמוביל לאתר הרשמי של השירות",
          "שימוש באימות דו-שלבי"
        ],
        answer: 1,
        explanation: "הנדסה חברתית מנצלת לחץ פסיכולוגי כמו פחד או דחיפות כדי למנוע חשיבה הגיונית."
      }
    ]
  },
  {
    id: 3,
    title: "תוכנות זדוניות וכופרה",
    difficulty: "בינוני",
    estimatedTime: "20 דק׳",
    emoji: "🦠",
    color: "#ff007f",
    description: "סוגי Malware וכיצד למנוע הדבקה והצפנת קבצים.",
    slides: [],
    simulations: [],
    quizzes: []
  },
  {
    id: 4,
    title: "מתקפת Man-in-the-Middle",
    difficulty: "מתקדם",
    estimatedTime: "25 דק׳",
    emoji: "🧑‍💻",
    color: "#00e676",
    description: "כיצד תוקפים מיירטים תקשורת ברשתות Wi-Fi ציבוריות.",
    slides: [],
    simulations: [],
    quizzes: []
  },
  {
    id: 5,
    title: "כתיבת קוד מאובטח",
    difficulty: "מתקדם",
    estimatedTime: "30 דק׳",
    emoji: "💻",
    color: "#4cc9f0",
    description: "עקרונות פיתוח מאובטח ומניעת פרצות XSS ו-SQL Injection.",
    slides: [],
    simulations: [],
    quizzes: []
  },
  {
    id: 6,
    title: "אבטחת מסדי נתונים",
    difficulty: "מתקדם",
    estimatedTime: "25 דק׳",
    emoji: "🗄️",
    color: "#f72585",
    description: "הגנה על המידע הארגוני המאוחסן ושימוש בשאילתות מפרמטרות.",
    slides: [],
    simulations: [],
    quizzes: []
  },
  {
    id: 7,
    title: "אבטחת רשתות וענן",
    difficulty: "בינוני",
    estimatedTime: "20 דק׳",
    emoji: "🌐",
    color: "#3a86c8",
    description: "עקרונות Zero Trust, שימוש ב-Firewall והגדרות ענן מאובטחות.",
    slides: [],
    simulations: [],
    quizzes: []
  },
  {
    id: 8,
    title: "איומים מתקדמים מתמשכים (APT)",
    difficulty: "מתקדם",
    estimatedTime: "30 דק׳",
    emoji: "🎯",
    color: "#f3722c",
    description: "ריגול סייבר מתקדם, שלבי ה-Cyber Kill Chain וציד איומים.",
    slides: [],
    simulations: [],
    quizzes: []
  },
  {
    id: 9,
    title: "מתקפות מניעת שירות (DDoS)",
    difficulty: "בינוני",
    estimatedTime: "15 דק׳",
    emoji: "💥",
    color: "#f94144",
    description: "הצפת שרתים באמצעות רשתות בוטנט ושימוש ב-CDN להגנה.",
    slides: [],
    simulations: [],
    quizzes: []
  },
  {
    id: 10,
    title: "מדיניות אבטחה וניהול סיכונים",
    difficulty: "מתחיל",
    estimatedTime: "20 דק׳",
    emoji: "📋",
    color: "#90be6d",
    description: "תקני אבטחה בינלאומיים כגון ISO 27001 ונוהל תגובה לאירועים.",
    slides: [],
    simulations: [],
    quizzes: []
  }
];
export default subjectsData;
