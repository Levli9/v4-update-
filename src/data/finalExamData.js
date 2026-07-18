export const FINAL_EXAM_PASS_SCORE = 80;

export const finalExamQuestions = [
  {
    id: 'final-1',
    topic: 'מבוא לסייבר',
    question: 'איזו פעולה מייצגת בצורה הטובה ביותר שמירה על שלמות המידע (Integrity)?',
    options: ['גיבוי המידע פעם בשנה', 'מניעת שינוי לא מורשה במידע', 'הצגת המידע לכל העובדים', 'מחיקת הרשאות מכל המשתמשים'],
    answer: 1,
    explanation: 'שלמות מבטיחה שהמידע לא שונה או שובש ללא הרשאה.'
  },
  {
    id: 'final-2',
    topic: 'סיסמאות ואימות',
    question: 'מהו השילוב הבטוח ביותר להגנה על חשבון ארגוני?',
    options: ['סיסמה קצרה שמחליפים בכל שבוע', 'אותה סיסמה בכל המערכות', 'סיסמה ייחודית וארוכה יחד עם MFA', 'שמירת הסיסמה בקובץ על שולחן העבודה'],
    answer: 2,
    explanation: 'סיסמה ייחודית וארוכה יחד עם גורם אימות נוסף מצמצמים משמעותית השתלטות על החשבון.'
  },
  {
    id: 'final-3',
    topic: 'פישינג',
    question: 'קיבלת הודעה דחופה מהמנכ״ל המבקשת העברה כספית לחשבון חדש. מה עושים קודם?',
    options: ['מבצעים מיד כדי לא לעכב', 'משיבים למייל ומבקשים אישור', 'מאמתים בערוץ תקשורת נפרד ומדווחים אם יש חשד', 'מעבירים לעובד אחר'],
    answer: 2,
    explanation: 'בקשה חריגה מאמתים בערוץ נפרד ואמין, ולא דרך פרטי הקשר שבהודעה החשודה.'
  },
  {
    id: 'final-4',
    topic: 'כופרה ותוכנות זדוניות',
    question: 'מהי הפעולה הראשונה הנכונה כשעולה חשד שכופרה פועלת בתחנה?',
    options: ['משלמים את הכופר', 'מנתקים מהרשת ומדווחים לצוות האבטחה', 'ממשיכים לעבוד כרגיל', 'מפרסמים צילום מסך ברשת חברתית'],
    answer: 1,
    explanation: 'ניתוק מהרשת עשוי לעצור התפשטות, והדיווח מאפשר תגובה ארגונית מהירה.'
  },
  {
    id: 'final-5',
    topic: 'רשתות ותקשורת',
    question: 'מדוע מסוכן להתחבר ל־Wi-Fi ציבורי ולגשת למידע רגיש ללא הגנה?',
    options: ['כי הסוללה נגמרת מהר', 'כי תוקף עלול ליירט או לשנות את התקשורת', 'כי המחשב יהיה איטי', 'כי האחסון יתמלא'],
    answer: 1,
    explanation: 'ברשת לא מהימנה תוקף עלול לבצע יירוט מסוג Man-in-the-Middle.'
  },
  {
    id: 'final-6',
    topic: 'קוד מאובטח',
    question: 'איזו שיטה מסייעת למנוע SQL Injection?',
    options: ['חיבור מחרוזת הקלט ישירות לשאילתה', 'שאילתות מפרמטרות ואימות קלט', 'הסתרת כפתור השליחה', 'החלפת צבע מסך ההתחברות'],
    answer: 1,
    explanation: 'שאילתות מפרמטרות מפרידות בין פקודות SQL לבין נתוני המשתמש.'
  },
  {
    id: 'final-7',
    topic: 'אבטחת מידע וענן',
    question: 'מה פירוש עקרון ההרשאה המינימלית?',
    options: ['כל עובד מקבל הרשאת מנהל', 'נותנים רק את ההרשאות הדרושות לתפקיד ולזמן הדרוש', 'אין צורך בבדיקת הרשאות', 'משתפים חשבון אחד לכל המחלקה'],
    answer: 1,
    explanation: 'הרשאה מינימלית מצמצמת חשיפה ונזק במקרה של טעות או פריצה.'
  },
  {
    id: 'final-8',
    topic: 'איומים מתקדמים',
    question: 'מה מאפיין מתקפת APT?',
    options: ['תקיפה אקראית וקצרה בלבד', 'פעילות ממושכת, ממוקדת ושקטה בתוך הארגון', 'רק הודעת ספאם אחת', 'תקלה טבעית בחומרה'],
    answer: 1,
    explanation: 'APT היא מתקפה מתמשכת וממוקדת שמנסה לשמור על אחיזה ולפעול ללא גילוי.'
  },
  {
    id: 'final-9',
    topic: 'DDoS',
    question: 'מהי מטרתה העיקרית של מתקפת DDoS?',
    options: ['לשפר את זמינות השירות', 'להציף שירות בתעבורה ולמנוע שימוש תקין', 'להצפין קובץ יחיד', 'להחליף סיסמה למשתמש'],
    answer: 1,
    explanation: 'DDoS פוגעת בזמינות באמצעות עומס מבוזר ממקורות רבים.'
  },
  {
    id: 'final-10',
    topic: 'ניהול סיכונים',
    question: 'מהו סדר הפעולות הנכון כשמתגלה אירוע אבטחה?',
    options: ['להסתיר, למחוק ולהמשיך', 'לזהות, לדווח, להכיל, לטפל ולהפיק לקחים', 'לפרסם, להמתין ולכבות', 'להחליף מחשב ללא דיווח'],
    answer: 1,
    explanation: 'תגובה מסודרת כוללת זיהוי ודיווח, הכלה, טיפול, התאוששות והפקת לקחים.'
  }
];

const shuffle = (items) => [...items]
  .map((item) => ({ item, sort: Math.random() }))
  .sort((a, b) => a.sort - b.sort)
  .map(({ item }) => item);

export function createFinalExamQuestionSet(subjects, count = 10) {
  const coursePools = subjects.map((subject) => ({
    subject,
    questions: (subject.quizzes || []).filter((question) =>
      Array.isArray(question.options)
      && question.options.length >= 2
      && Number.isInteger(question.answer)
    )
  })).filter((course) => course.questions.length > 0);

  const fromCourses = shuffle(coursePools).map(({ subject, questions }) => {
    const question = shuffle(questions)[0];
    return {
      id: `course-${subject.id}-${question.id || question.question}`,
      topic: subject.title,
      question: question.question,
      options: question.options,
      answer: question.answer,
      explanation: question.explanation
    };
  });

  const unique = [...fromCourses, ...shuffle(finalExamQuestions)].filter((question, index, collection) =>
    collection.findIndex((candidate) => candidate.question === question.question) === index
  );
  return unique.slice(0, count);
}

export function getCertificationReadiness(progress = {}, analytics = {}, subjects = []) {
  const normalizedSubjects = Array.isArray(subjects)
    ? subjects
    : Array.from({ length: Number(subjects) || 0 }, (_, id) => ({ id, videoUrl: true, simulations: [{}] }));
  const subjectIds = normalizedSubjects.map((subject) => subject.id);
  const videoSubjectIds = normalizedSubjects.filter((subject) => Boolean(subject.videoUrl)).map((subject) => subject.id);
  const labSubjectIds = normalizedSubjects.filter((subject) => subject.simulations?.length > 0).map((subject) => subject.id);
  const coursesDone = subjectIds.every((id) => progress.completedSubjects?.includes(id));
  const lessonsDone = subjectIds.every((id) => (
    progress.completedLessons?.includes(id) || progress.completedSubjects?.includes(id)
  ));
  const videosDone = videoSubjectIds.every((id) => analytics.videos?.[id]?.completed === true);
  const quizzesDone = subjectIds.every((id) => Number(progress.scores?.[id]) >= FINAL_EXAM_PASS_SCORE);
  const labsDone = labSubjectIds.every((id) => progress.completedLabs?.includes(id));
  return {
    coursesDone,
    lessonsDone,
    videosDone,
    quizzesDone,
    labsDone,
    unlocked: coursesDone && lessonsDone && videosDone && quizzesDone && labsDone
  };
}
