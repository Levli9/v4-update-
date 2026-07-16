// src/data/subjectsData.js
import DETAILED_OFFLINE_COURSES from './courses_data';

const rawSubjects = [
  {
    id: 0,
    title: "מבוא: מהי תקיפת סייבר?",
    difficulty: "מתחיל",
    estimatedTime: "15 דק׳",
    emoji: "🛡️",
    color: "#00e6ff",
    description: "הבנת הנוף הדיגיטלי המאוים ועקרונות ה-CIA Triad.",
    simulations: [{ type: "terminal", instructions: "השתמש בפקודת 'nmap -v scanme.nmap.org' כדי לסרוק פורטים פתוחים ברשת." }]
  },
  {
    id: 1,
    title: "סיסמאות ואימות משתמשים",
    difficulty: "מתחיל",
    estimatedTime: "20 דק׳",
    emoji: "🔑",
    color: "#9d4edd",
    description: "כיצד ליצור סיסמאות חזקות וליישם אימות דו-שלבי (MFA).",
    simulations: [{ type: "password-validator" }]
  },
  {
    id: 2,
    title: "פישינג והנדסה חברתית",
    difficulty: "בינוני",
    estimatedTime: "25 דק׳",
    emoji: "🎣",
    color: "#ffb703",
    description: "זיהוי הודעות דוא\"ל מזויפות ומניעת מתקפות הנדסה חברתית.",
    simulations: [{ type: "phishing-analyzer" }]
  },
  {
    id: 3,
    title: "תוכנות זדוניות וכופרה",
    difficulty: "בינוני",
    estimatedTime: "20 דק׳",
    emoji: "🦠",
    color: "#ff007f",
    description: "סוגי Malware וכיצד למנוע הדבקה והצפנת קבצים.",
    simulations: []
  },
  {
    id: 4,
    title: "מתקפת Man-in-the-Middle",
    difficulty: "מתקדם",
    estimatedTime: "25 דק׳",
    emoji: "🧑‍💻",
    color: "#00e676",
    description: "כיצד תוקפים מיירטים תקשורת ברשתות Wi-Fi ציבוריות.",
    simulations: []
  },
  {
    id: 5,
    title: "כתיבת קוד מאובטח",
    difficulty: "מתקדם",
    estimatedTime: "30 דק׳",
    emoji: "💻",
    color: "#4cc9f0",
    description: "עקרונות פיתוח מאובטח ומניעת פרצות XSS ו-SQL Injection.",
    simulations: []
  },
  {
    id: 6,
    title: "אבטחת מסדי נתונים",
    difficulty: "מתקדם",
    estimatedTime: "25 דק׳",
    emoji: "🗄️",
    color: "#f72585",
    description: "הגנה על המידע הארגוני המאוחסן ושימוש בשאילתות מפרמטרות.",
    simulations: []
  },
  {
    id: 7,
    title: "אבטחת רשתות וענן",
    difficulty: "בינוני",
    estimatedTime: "20 דק׳",
    emoji: "🌐",
    color: "#3a86c8",
    description: "עקרונות Zero Trust, שימוש ב-Firewall והגדרות ענן מאובטחות.",
    simulations: []
  },
  {
    id: 8,
    title: "איומים מתקדמים מתמשכים (APT)",
    difficulty: "מתקדם",
    estimatedTime: "30 דק׳",
    emoji: "🎯",
    color: "#f3722c",
    description: "ריגול סייבר מתקדם, שלבי ה-Cyber Kill Chain וציד איומים.",
    simulations: []
  },
  {
    id: 9,
    title: "מתקפות מניעת שירות (DDoS)",
    difficulty: "בינוני",
    estimatedTime: "15 דק׳",
    emoji: "💥",
    color: "#f94144",
    description: "הצפת שרתים באמצעות רשתות בוטנט ושימוש ב-CDN להגנה.",
    simulations: []
  },
  {
    id: 10,
    title: "מדיניות אבטחה וניהול סיכונים",
    difficulty: "מתחיל",
    estimatedTime: "20 דק׳",
    emoji: "📋",
    color: "#90be6d",
    description: "תקני אבטחה בינלאומיים כגון ISO 27001 ונוהל תגובה לאירועים.",
    simulations: []
  }
];

export const subjectsData = rawSubjects.map(subj => {
  const detailed = DETAILED_OFFLINE_COURSES[subj.id] || {};
  
  // Format quizzes options to match the React Quiz component expectations if needed
  const rawQuizzes = detailed.quizzes || detailed.quiz || [];
  const formattedQuizzes = rawQuizzes.map(q => {
    // If the format in the old json is answers / correctIndex
    const options = q.answers || q.options || [];
    const answer = q.correctIndex !== undefined ? q.correctIndex : q.answer;
    return {
      id: q.id || `q_${subj.id}_${Math.random()}`,
      question: q.question,
      options: options,
      answer: answer,
      explanation: q.explanation || "זוהי התשובה הנכונה על בסיס עקרונות אבטחת המידע שנלמדו."
    };
  });

  // Dynamic videoURL fallback template:
  // By default, if the user places an MP4 video under `videos/topic{id}.mp4` in their public/assets folder, it will play.
  // Otherwise, it falls back to the interactive TTS presentation.
  const videoUrl = localStorage.getItem(`cyber_video_url_${subj.id}`) || "";

  return {
    ...subj,
    slides: detailed.slides || [],
    videoScript: detailed.videoScript || [],
    quizzes: formattedQuizzes,
    videoUrl: videoUrl
  };
});

export default subjectsData;
