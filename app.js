// Modern Static Web Application with Groq API Content Generator - Cyber Security Training System

// ==========================================
// 1. DATABASE & INITIAL SEED (localStorage)
// ==========================================
const DEFAULT_USERS = [
  { username: "Yaniv123", password: "Yaniv123", full_name: "יניב", role: "manager", department: "הנהלה", email: "thebeastcom71@gmail.com" },
  { username: "Lev123", password: "Lev123", full_name: "לב", role: "manager", department: "הנהלה", email: "thebeastcom71@gmail.com" },
  { username: "Yaniv123_emp", password: "Yaniv123", full_name: "יניב (עובד)", role: "employee", department: "פיתוח", email: "thebeastcom71@gmail.com" },
  { username: "Lev123_emp", password: "Lev123", full_name: "לב (עובד)", role: "employee", department: "מכירות", email: "thebeastcom71@gmail.com" }
];

const TOPICS = [
  { id: 0, emoji: "🛡️", name: "מבוא: מהי תקיפת סייבר?", color: "#00e6ff" },
  { id: 1, emoji: "🔑", name: "סיסמאות ואימות משתמשים", color: "#9d4edd" },
  { id: 2, emoji: "🎣", name: "פישינג והנדסה חברתית", color: "#ffb703" },
  { id: 3, emoji: "🦠", name: "תוכנות זדוניות וכופרה", color: "#ff007f" },
  { id: 4, emoji: "🧑‍💻", name: "מתקפת Man-in-the-Middle (MITM)", color: "#00e676" },
  { id: 5, emoji: "💻", name: "כתיבת קוד מאובטח", color: "#4cc9f0" },
  { id: 6, emoji: "🗄️", name: "אבטחת מסדי נתונים ו-SQLi", color: "#f72585" },
  { id: 7, emoji: "🌐", name: "אבטחת רשתות וענן", color: "#3a86c8" },
  { id: 8, emoji: "🎯", name: "איומים מתקדמים מתמשכים (APT)", color: "#f3722c" },
  { id: 9, emoji: "💥", name: "מתקפות מניעת שירות (DDoS)", color: "#f94144" },
  { id: 10, emoji: "📋", name: "מדיניות אבטחת מידע וניהול סיכונים", color: "#90be6d" }
];

// Offline fallback generator database
const OFFLINE_COURSES = {
  "sql injection": {
    courseTitle: "אבטחת מסדי נתונים ומתקפת SQL Injection",
    slides: [
      { title: "מבוא ל-SQL Injection", content: "הזרקת קוד SQL (SQL Injection) היא אחת הפגיעויות הנפוצות ביותר ברשת. היא מתרחשת כאשר קלט של משתמש משולב ישירות בשאילתת מסד נתונים ללא סינון מתאים.", bullets: ["חשיפת מידע רגיש", "עקיפת מנגנוני הזדהות", "שינוי או מחיקה של נתונים", "השתלטות על השרת המארח"] },
      { title: "איך זה עובד?", content: "כאשר המערכת מבצעת חיבור מחרוזות ישיר: <br><code style='color:var(--primary)'>SELECT * FROM users WHERE user = '\" + input + \"'</code><br>אם התוקף מזין: <code style='color:var(--danger)'>' OR '1'='1</code> השאילתה הופכת לתמיד נכונה, ומחזירה את כל המשתמשים ללא צורך בסיסמה.", bullets: ["ניצול חוסר סינון קלט", "עקיפת בדיקות לוגיות", "מניפולציה של מבנה השאילתה"] },
      { title: "דרכי הגנה והתמודדות", content: "הגנה מפני SQLi מחייבת שימוש בפרמטריזציה (Prepared Statements). כך, מסד הנתונים מתייחס לקלט כאל ערך מילולי בלבד ולא כאל חלק מהפקודה הלוגית.", bullets: ["שימוש בשאילתות מוכנות (Prepared Statements)", "אימות וסינון קלטים קפדני (Validation)", "צמצום הרשאות הגישה של המשתמש במסד הנתונים"] }
    ],
    quiz: [
      { question: "כיצד מתבצעת מתקפת SQL Injection?", options: ["הצפת השרת בבקשות חיבור", "הזרקת פקודות SQL לשדות קלט שאינם מסוננים", "חסימת גישה פיזית למסד הנתונים", "הצפנת קבצי השרת ובקשת כופר"], correctAnswer: "הזרקת פקודות SQL לשדות קלט שאינם מסוננים", explanation: "מתקפת SQLi מנצלת את העובדה שהקוד אינו מסנן קלט משתמש כראוי ומשלב אותו ישירות בשאילתת מסד הנתונים." },
      { question: "מהי הדרך הטובה ביותר למנוע SQL Injection?", options: ["שימוש בסיסמאות מורכבות לשרת", "שימוש ב-Prepared Statements (פרמטריזציה)", "התקנת אנטי-וירוס על מסד הנתונים", "סגירת החיבור לרשת הציבורית"], correctAnswer: "שימוש ב-Prepared Statements (פרמטריזציה)", explanation: "שאילתות מוכנות מפרידות באופן מוחלט בין המבנה הלוגי של השאילתה לבין הפרמטרים שמתקבלים מהמשתמש." }
    ]
  },
  "ransomware": {
    courseTitle: "תוכנות כופר (Ransomware) - מניעה והתגוננות",
    slides: [
      { title: "מהי תוכנת כופר?", content: "תוכנת כופר היא סוג של נוזקה המיועדת לחסום גישה למערכת מחשב או להצפין את כל הקבצים המאוחסנים בה עד לתשלום סכום כסף (לרוב במטבעות קריפטוגרפיים).", bullets: ["הצפנה חזקה (AES/RSA)", "השבתה מוחלטת של פעילות עסקית", "דרישת כופר על מסכים נעולים", "סחיטה כפולה (איום בהדלפת מידע)"] },
      { title: "וקטורי תקיפה נפוצים", content: "תוכנות כופר מגיעות לרוב באמצעות דואר אלקטרוני זדוני (פישינג), ניצול חולשות אבטחה בשרתים החשופים לרשת (כמו RDP), או הורדת קבצים נגועים מאתרים זדוניים.", bullets: ["קבצי דוא\"ל מצורפים מתחזים", "שרתי גישה מרחוק לא מאובטחים", "הורדת תוכנות פיראטיות וקראקים"] },
      { title: "הגנה ושחזור מאסון", content: "ההגנה הטובה ביותר היא מניעה וגיבויים מנותקים. אם הקבצים מגובים במקום מאובטח שאינו נגיש ישירות לרשת הפגועה, ניתן לשחזר את המערכת ללא תשלום כופר.", bullets: ["מדיניות גיבויים קשיחה ומנותקת (Offline Backups)", "עדכוני אבטחה שוטפים למערכת ההפעלה", "העלאת מודעות עובדים לפישינג"] }
    ],
    quiz: [
      { question: "מהו המאפיין הייחודי של תוכנת כופר?", options: ["היא עוקבת אחר תנועות העכבר של המשתמש", "היא מצפינה את קבצי המשתמש ודורשת תשלום עבור המפתח", "היא מאיצה את מהירות המעבד של המחשב", "היא משתפת קבצים ברשתות חברתיות אוטומטית"], correctAnswer: "היא מצפינה את קבצי המשתמש ודורשת תשלום עבור המפתח", explanation: "תוכנות כופר נועלות קבצים על ידי הצפנה ודורשות תשלום כופר תמורת מפתח הפענוח." },
      { question: "מהו קו ההגנה היעיל ביותר לשחזור ממתקפת כופרה?", options: ["חיבור מחדש מהיר לרשת האינטרנט", "שימוש בגיבויים מנותקים ומאובטחים (Offline Backups)", "תשלום מיידי של הכופר לתוקפים", "החלפת כרטיס המסך במחשב"], correctAnswer: "שימוש בגיבויים מנותקים ומאובטחים (Offline Backups)", explanation: "גיבויים מנותקים מאפשרים שחזור נתונים מלא ללא כניעה לסחיטה של התוקפים." }
    ]
  }
};

function initDatabase() {
  // Seed Groq API Key automatically
  if (!localStorage.getItem("groq_api_key")) {
    localStorage.setItem("groq_api_key", "");
  }

  if (!localStorage.getItem("cyber_training_initialized")) {
    localStorage.setItem("users", JSON.stringify(DEFAULT_USERS));
    
    // Seed demo results
    const now = Date.now();
    const demoResults = [
      { id: 1, username: "Yaniv123_emp", courseId: 0, score: 70, duration: 120, timestamp: now - 86400000 * 5 },
      { id: 2, username: "Yaniv123_emp", courseId: 1, score: 78, duration: 150, timestamp: now - 86400000 * 4 },
      { id: 3, username: "Yaniv123_emp", courseId: 2, score: 85, duration: 140, timestamp: now - 86400000 * 3 },
      { id: 4, username: "Yaniv123_emp", courseId: 3, score: 92, duration: 110, timestamp: now - 86400000 * 2 },
      { id: 5, username: "Lev123_emp", courseId: 0, score: 60, duration: 200, timestamp: now - 86400000 * 4 },
      { id: 6, username: "Lev123_emp", courseId: 1, score: 68, duration: 180, timestamp: now - 86400000 * 3 },
      { id: 7, username: "Lev123_emp", courseId: 2, score: 75, duration: 160, timestamp: now - 86400000 * 2 }
    ];
    localStorage.setItem("results", JSON.stringify(demoResults));
    localStorage.setItem("completed_topics", JSON.stringify({
      "Yaniv123_emp": [0, 1, 2, 3],
      "Lev123_emp": [0, 1, 2]
    }));
    
    // Predefined AI courses history
    localStorage.setItem("ai_courses", JSON.stringify([]));
    
    localStorage.setItem("cyber_training_initialized", "true");
  }
}

// Helper methods to load database tables
function getUsers() { return JSON.parse(localStorage.getItem("users") || "[]"); }
function saveUsers(users) { localStorage.setItem("users", JSON.stringify(users)); }
function getResults() { return JSON.parse(localStorage.getItem("results") || "[]"); }
function saveResults(results) { localStorage.setItem("results", JSON.stringify(results)); }
function getCompletedTopics(username) {
  const all = JSON.parse(localStorage.getItem("completed_topics") || "{}");
  return all[username] || [];
}
function markTopicCompleted(username, topicId) {
  const all = JSON.parse(localStorage.getItem("completed_topics") || "{}");
  if (!all[username]) all[username] = [];
  if (!all[username].includes(topicId)) {
    all[username].push(topicId);
    localStorage.setItem("completed_topics", JSON.stringify(all));
  }
}

// ==========================================
// 2. STATE MANAGEMENT & ROUTING
// ==========================================
let currentUser = null;
let currentRole = null; // 'employee' or 'manager'
let currentTopic = null;
let currentSlideIndex = 0;
let currentQuizQuestions = [];
let currentQuizIndex = 0;
let currentQuizAnswers = [];
let readingStartTime = 0;

function navigate(viewId) {
  document.querySelectorAll(".view-section").forEach(view => {
    view.classList.remove("active");
  });
  const target = document.getElementById(viewId);
  if (target) {
    target.classList.add("active");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

function updateHeader() {
  const nav = document.getElementById("header-nav-items");
  if (!currentUser) {
    nav.innerHTML = `
      <div class="theme-switch" onclick="toggleTheme()"><i class="fas fa-moon"></i></div>
    `;
    return;
  }

  let switchViewBtn = "";
  const isSpecial = ["Yaniv123", "Lev123", "Yaniv123_emp", "Lev123_emp"].includes(currentUser.username);
  if (isSpecial) {
    switchViewBtn = `<button class="btn" onclick="showRoleSelection()"><i class="fas fa-exchange-alt"></i> החלף תצוגה</button>`;
  }

  nav.innerHTML = `
    <span style="color:var(--text-secondary); font-size:0.95rem;">שלום, <b>${currentUser.full_name}</b> (${currentRole === 'manager' ? 'מנהל' : 'עובד'})</span>
    ${switchViewBtn}
    <div class="theme-switch" onclick="toggleTheme()"><i class="fas fa-moon"></i></div>
    <button class="btn btn-danger" onclick="logout()"><i class="fas fa-sign-out-alt"></i> התנתק</button>
  `;
}

function showRoleSelection() {
  navigate("role-selection");
}

function logout() {
  currentUser = null;
  currentRole = null;
  updateHeader();
  navigate("welcome");
}

// Theme handling
function toggleTheme() {
  const currentTheme = document.body.getAttribute("data-theme");
  const newTheme = currentTheme === "light" ? "dark" : "light";
  document.body.setAttribute("data-theme", newTheme);
  const themeIcon = document.querySelector(".theme-switch i");
  if (themeIcon) {
    themeIcon.className = newTheme === "light" ? "fas fa-sun" : "fas fa-moon";
  }
}

// ==========================================
// 3. AUTHENTICATION & RECOVERY FLOW
// ==========================================
function initAuthEvents() {
  // Tab switching
  document.getElementById("tab-login").addEventListener("click", () => {
    document.getElementById("tab-login").classList.add("active");
    document.getElementById("tab-register").classList.remove("active");
    document.getElementById("login-form").style.display = "block";
    document.getElementById("register-form").style.display = "none";
  });
  
  document.getElementById("tab-register").addEventListener("click", () => {
    document.getElementById("tab-login").classList.remove("active");
    document.getElementById("tab-register").classList.add("active");
    document.getElementById("login-form").style.display = "none";
    document.getElementById("register-form").style.display = "block";
  });

  // Login execution
  document.getElementById("login-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const userVal = document.getElementById("login-username").value.trim();
    const passVal = document.getElementById("login-password").value;
    
    const users = getUsers();
    const match = users.find(u => u.username === userVal && u.password === passVal);
    
    if (match) {
      currentUser = match;
      const isSpecial = ["Yaniv123", "Lev123", "Yaniv123_emp", "Lev123_emp"].includes(match.username);
      
      if (isSpecial) {
        currentRole = match.role; // Default role
        updateHeader();
        navigate("role-selection");
      } else {
        currentRole = match.role;
        updateHeader();
        if (currentRole === "manager") {
          initManagerDashboard();
          navigate("manager-dashboard");
        } else {
          initEmployeePortal();
          navigate("employee-portal");
        }
      }
      
      // Clear form
      document.getElementById("login-username").value = "";
      document.getElementById("login-password").value = "";
    } else {
      alert("❌ שם משתמש או סיסמה שגויים!");
    }
  });

  // Register execution
  document.getElementById("register-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const userVal = document.getElementById("reg-username").value.trim();
    const passVal = document.getElementById("reg-password").value;
    const nameVal = document.getElementById("reg-name").value.trim();
    const emailVal = document.getElementById("reg-email").value.trim();
    const roleVal = document.getElementById("reg-role").value;
    const deptVal = document.getElementById("reg-dept").value;

    const users = getUsers();
    if (users.some(u => u.username === userVal)) {
      alert("❌ שם המשתמש כבר קיים במערכת!");
      return;
    }

    const newUser = {
      username: userVal,
      password: passVal,
      full_name: nameVal,
      role: roleVal,
      department: deptVal,
      email: emailVal
    };

    users.push(newUser);
    saveUsers(users);
    alert("✅ ההרשמה בוצעה בהצלחה! כעת תוכל להתחבר.");
    
    // Switch to login tab
    document.getElementById("tab-login").click();
    document.getElementById("login-username").value = userVal;
  });

  // Role Selection Button clicks
  document.getElementById("btn-select-employee").addEventListener("click", () => {
    currentRole = "employee";
    updateHeader();
    initEmployeePortal();
    navigate("employee-portal");
  });

  document.getElementById("btn-select-manager").addEventListener("click", () => {
    currentRole = "manager";
    updateHeader();
    initManagerDashboard();
    navigate("manager-dashboard");
  });
}

// Password recovery simulator modal
function openRecoveryModal() {
  const modal = document.getElementById("recovery-modal");
  modal.classList.add("active");
}

function closeRecoveryModal() {
  const modal = document.getElementById("recovery-modal");
  modal.classList.remove("active");
  document.getElementById("recovery-step-1").style.display = "block";
  document.getElementById("recovery-step-2").style.display = "none";
}

function sendRecoveryCode() {
  const email = document.getElementById("recovery-email").value.trim();
  const users = getUsers();
  const match = users.find(u => u.email === email);

  if (!match) {
    alert("❌ דואר אלקטרוני זה אינו רשום במערכת!");
    return;
  }

  // Simulate code generation
  const tempCode = Math.floor(100000 + Math.random() * 900000);
  window.currentRecoveryCode = tempCode;
  window.recoveryUser = match;

  document.getElementById("recovery-step-1").style.display = "none";
  document.getElementById("recovery-step-2").style.display = "block";
  
  document.getElementById("recovery-sent-msg").innerHTML = `
    קוד אימות נשלח לכתובת <b>${email}</b>.<br>
    <span style="color:var(--primary); font-size:0.85rem;">[הדמיית דואר: הקוד שלך הוא <b>${tempCode}</b>]</span>
  `;
}

function verifyRecoveryCode() {
  const inputCode = document.getElementById("recovery-code").value.trim();
  if (inputCode == window.currentRecoveryCode) {
    const newPass = prompt("אנא הזן סיסמה חדשה:");
    if (newPass && newPass.length >= 4) {
      const users = getUsers();
      const idx = users.findIndex(u => u.username === window.recoveryUser.username);
      if (idx !== -1) {
        users[idx].password = newPass;
        saveUsers(users);
        alert("✅ הסיסמה שונתה בהצלחה! כעת תוכל להתחבר עם הסיסמה החדשה.");
        closeRecoveryModal();
      }
    } else {
      alert("❌ סיסמה קצרה מדי!");
    }
  } else {
    alert("❌ קוד אימות לא נכון!");
  }
}

// ==========================================
// 4. EMPLOYEE PORTAL & COURSE LEARNING
// ==========================================
const DETAILED_OFFLINE_COURSES = {
  0: {
    title: "מבוא: מהי תקיפת סייבר?",
    slides: [
      { title: "מושגי יסוד בסייבר", content: "אבטחת מידע עוסקת בהגנה על מערכות, רשתות ונתונים מפני גישה, שינוי או השמדה לא מורשים. שלושת עמודי התווך של אבטחת מידע הם עקרונות ה־CIA: סודיות, שלמות וזמינות.", bullets: ["סודיות (Confidentiality) - הגבלת גישה למידע מורשה בלבד", "שלמות (Integrity) - מניעת שינוי נתונים שלא כדין", "זמינות (Availability) - הבטחת גישה למידע כאשר הוא נדרש"] },
      { title: "משולש ה-CIA הלכה למעשה", content: "כל פגיעה באחד מרכיבי השילוש מייצגת סוג אחר של כשל אבטחתי. לדוגמה, הדלפת פרטי אשראי פוגעת בסודיות, שינוי יתרת חשבון בבנק פוגע בשלמות, והשבתת אתר פוגעת בזמינות.", bullets: ["פגיעה בסודיות: פריצה למאגר נתונים", "פגיעה בשלמות: מניפולציה של קבצי רישום", "פגיעה בזמינות: מתקפת מניעת שירות (DDoS)"] }
    ]
  },
  1: {
    title: "סיסמאות ואימות משתמשים",
    slides: [
      { title: "מדוע סיסמאות נפרצות?", content: "תוקפים משתמשים בשיטות מתוחכמות כגון Brute Force (ניחוש כוח גס) ומתקפות מילון (Dictionary Attacks) המנסות מיליוני שילובים בשניות.", bullets: ["שימוש בסיסמאות נפוצות כגון '123456'", "שימוש חוזר באותה סיסמה במספר אתרים", "פרטיות נמוכה של סיסמאות שנכתבות פיזית"] },
      { title: "כללים לסיסמה חזקה", content: "סיסמה חזקה צריכה להכיל לפחות 12 תווים, הכוללים שילוב של אותיות גדולות וקטנות, מספרים וסימנים מיוחדים. מומלץ להשתמש במנהל סיסמאות (Password Manager).", bullets: ["אורך מעל 12 תווים", "שילוב מגוון תווים (Aa1@)", "שימוש באימות דו-שלבי (MFA) כקו הגנה קריטי נוסף"] }
    ]
  },
  2: {
    title: "פישינג והנדסה חברתית",
    slides: [
      { title: "מהו פישינג (Phishing)?", content: "מתקפת פישינג היא ניסיון להונות משתמשים כדי לחשוף מידע רגיש (כמו סיסמאות או כרטיסי אשראי) על ידי התחזות לגוף אמין בדואר אלקטרוני, הודעות SMS או רשתות חברתיות.", bullets: ["התחזות לבנקים, שירותי דואר או מנהל מערכת", "יצירת תחושת דחיפות לחצים לפעולה מהירה", "שימוש בדומיינים דומים אך מזויפים"] },
      { title: "סימני אזהרה בפישינג", content: "תמיד בדוק את כתובת השולח האמיתית, חפש שגיאות כתיב או פניות כלליות ולא אישיות, והימנע לחלוטין מלחיצה על קישורים חיצוניים המבקשים הזנת סיסמה מיידית.", bullets: ["כתובת שולח שונה במעט מהדומיין האמיתי", "בקשות לא שגרתיות להעברות כספים או איפוס סיסמה", "קבצים מצורפים חשודים כגון סיומות כפולות"] }
    ]
  },
  4: {
    title: "מתקפת Man-in-the-Middle (MITM)",
    slides: [
      { title: "אנטומיה של מתקפת MITM", content: "במתקפת 'אדם באמצע', תוקף מתמקם בחשאי בנתיב התקשורת שבין שני צדדים (למשל, הדפדפן שלך לשרת הבנק), ומסוגל ליירט, לקרוא ולשנות את המידע העובר ביניהם ללא ידיעתם.", bullets: ["יירוט נתונים רגישים בזמן אמת", "שינוי תוכן התעבורה (למשל, כתובת יעד להעברת כספים)", "נפוץ במיוחד ברשתות Wi-Fi ציבוריות לא מאובטחות"] },
      { title: "צפה בהדגמת וידאו (הדמיה)", content: "סרטון הדרכה בנושא MITM מציג כיצד תוקף מנצל רשת אלחוטית פתוחה כדי ליירט תעבורת HTTP לא מוצפנת.", bullets: ["ניטור חבילות מידע (Wireshark)", "סכנות בחיבור HTTP פשוט", "עדיפות עליונה לחיבורי HTTPS מוצפנים"] },
      { title: "מסמך אנטומיה מפורט (PDF)", content: "לפניך קובץ מסמך המפרט את דרכי ההתגוננות הארגוניות ממתקפות MITM, כולל שימוש ב-VPN, הצפנת תקשורת מקצה לקצה והקשחת שרתי DNS.", bullets: ["הקשחת הצפנה", "שימוש ברשת פרטית VPN בארגון", "מניעת ARP Spoofing ברמת המתגים"] }
    ]
  }
};

function initEmployeePortal() {
  const completed = getCompletedTopics(currentUser.username);
  const grid = document.getElementById("topics-grid");
  grid.innerHTML = "";

  TOPICS.forEach(topic => {
    const isDone = completed.includes(topic.id);
    const badge = isDone ? `<div class="topic-badge"><i class="fas fa-check-circle"></i> הושלם</div>` : "";
    
    const card = document.createElement("div");
    card.className = "card topic-card";
    card.style.setProperty("--accent-color", topic.color);
    card.innerHTML = `
      ${badge}
      <div class="topic-emoji">${topic.emoji}</div>
      <div>
        <h3>${topic.name}</h3>
        <p style="color:var(--text-secondary); font-size:0.85rem; margin-top:8px;">לחץ להתחלת הלמידה</p>
      </div>
    `;
    
    card.addEventListener("click", () => startLearningTopic(topic.id));
    grid.appendChild(card);
  });

  const examStrip = document.getElementById("exam-strip-wrapper");
  if (completed.length === TOPICS.length) {
    examStrip.style.display = "block";
  } else {
    examStrip.style.display = "none";
  }

  document.getElementById("portal-stats").innerHTML = `
    סיימת <b>${completed.length}</b> מתוך <b>${TOPICS.length}</b> נושאים. 
    (${Math.round(completed.length / TOPICS.length * 100)}% השלמה)
  `;
}

function startLearningTopic(topicId) {
  currentTopic = TOPICS.find(t => t.id === topicId);
  currentSlideIndex = 0;
  
  const courseData = DETAILED_OFFLINE_COURSES[topicId] || {
    title: currentTopic.name,
    slides: [
      { title: `מבוא ל-${currentTopic.name}`, content: `זהו שקף הדרכה מובנה בנושא ${currentTopic.name}. כאן יוצגו מושגי היסוד, הסברים טכניים ושיטות התמודדות רלוונטיות לעובדים בארגון.`, bullets: ["נקודה ראשונה למיקוד", "עקרונות הגנה חשובים", "תרגול נכון של הגנת סייבר"] },
      { title: `יישום מעשי: ${currentTopic.name}`, content: `על מנת ליישם נכון את עקרונות ההגנה ב-${currentTopic.name}, יש לפעול לפי הנהלים המפורטים, לדווח על חריגות למנהל האבטחה, ולהימנע מפעולות מסוכנות.`, bullets: ["מניעת תקלות והפרות אבטחה", "דיווח מיידי לצוות ה-SOC", "בדיקות סדירות של תקינות המערכות"] }
    ]
  };
  
  currentTopic.courseData = courseData;
  readingStartTime = Date.now();
  
  buildSlideSidebar();
  renderCurrentSlide();
  navigate("learning-screen");
}

function buildSlideSidebar() {
  const sidebarList = document.getElementById("slide-menu");
  sidebarList.innerHTML = "";
  
  currentTopic.courseData.slides.forEach((slide, idx) => {
    const li = document.createElement("li");
    li.className = `slide-menu-item ${idx === currentSlideIndex ? 'active' : ''}`;
    li.innerHTML = `
      <i class="far fa-file-alt"></i>
      <span>שקף ${idx + 1}: ${slide.title}</span>
    `;
    li.addEventListener("click", () => {
      currentSlideIndex = idx;
      renderCurrentSlide();
      updateSidebarActive();
    });
    sidebarList.appendChild(li);
  });
}

function updateSidebarActive() {
  const items = document.querySelectorAll("#slide-menu .slide-menu-item");
  items.forEach((item, idx) => {
    if (idx === currentSlideIndex) item.classList.add("active");
    else item.classList.remove("active");
  });
}

function renderCurrentSlide() {
  const slide = currentTopic.courseData.slides[currentSlideIndex];
  document.getElementById("learning-topic-title").innerText = currentTopic.name;
  
  const contentArea = document.getElementById("slide-content-viewport");
  contentArea.innerHTML = "";
  
  const slideHeader = document.createElement("div");
  slideHeader.className = "slide-header";
  slideHeader.innerHTML = `<h2>${slide.title}</h2>`;
  contentArea.appendChild(slideHeader);
  
  const slideBody = document.createElement("div");
  slideBody.className = "slide-text";
  
  let bulletHTML = "<ul>";
  slide.bullets.forEach(b => {
    bulletHTML += `<li>${b}</li>`;
  });
  bulletHTML += "</ul>";
  
  slideBody.innerHTML = `
    <p>${slide.content}</p>
    ${bulletHTML}
  `;
  contentArea.appendChild(slideBody);

  // MITM custom media
  if (currentTopic.id === 4) {
    if (currentSlideIndex === 1) {
      const mediaDiv = document.createElement("div");
      mediaDiv.className = "media-container";
      mediaDiv.innerHTML = `
        <video controls autoplay muted style="width:100%; max-height:350px;">
          <source src="data/generated-videos/training-1776270463079-training.mp4" type="video/mp4">
          <source src="https://www.w3schools.com/html/mov_bbb.mp4" type="video/mp4">
          הדפדפן שלך אינו תומך בניגון וידאו.
        </video>
      `;
      contentArea.appendChild(mediaDiv);
    } else if (currentSlideIndex === 2) {
      const pdfSim = document.createElement("div");
      pdfSim.className = "pdf-viewer-sim";
      pdfSim.innerHTML = `
        <div class="pdf-page">
          <div class="pdf-header-sim">
            <span>אנטומיה של מתקפת MITM - עמוד 1</span>
            <span>סיווג: פנימי</span>
          </div>
          <h3 style="color:#0077b6; margin-bottom:12px;">מנגנון מתקפת אדם באמצע (ARP Spoofing)</h3>
          <p style="line-height:1.6; margin-bottom:10px;">מתקפת MITM מתבססת רבות על זיוף כתובות פיזיות ברשת המקומית. התוקף שולח הודעות ARP מזויפות לרשת כדי קישור כתובת ה-MAC שלו עם כתובת ה-IP של נתב ברירת המחדל.</p>
        </div>
        <div class="pdf-page">
          <div class="pdf-header-sim">
            <span>אנטומיה של מתקפת MITM - עמוד 2</span>
            <span>סיווג: פנימי</span>
          </div>
          <h3 style="color:#0077b6; margin-bottom:12px;">מניעה והתגוננות ברשת הארגונית</h3>
          <ul style="margin-right:20px; line-height:1.6;">
            <li>אכיפת הצפנת HTTPS קשיחה (HSTS).</li>
            <li>שימוש ברשתות VPN מאובטחות.</li>
            <li>מניעת ARP Spoofing ברמת המתגים.</li>
          </ul>
        </div>
      `;
      contentArea.appendChild(pdfSim);
    }
  }

  const prevBtn = document.getElementById("btn-prev-slide");
  const nextBtn = document.getElementById("btn-next-slide");
  
  if (currentSlideIndex === 0) {
    prevBtn.style.visibility = "hidden";
  } else {
    prevBtn.style.visibility = "visible";
  }

  if (currentSlideIndex === currentTopic.courseData.slides.length - 1) {
    nextBtn.innerHTML = `<i class="fas fa-graduation-cap"></i> מעבר למבחן הנושא`;
  } else {
    nextBtn.innerHTML = `הבא <i class="fas fa-chevron-left"></i>`;
  }
}

function prevSlide() {
  if (currentSlideIndex > 0) {
    currentSlideIndex--;
    renderCurrentSlide();
    updateSidebarActive();
  }
}

function nextSlide() {
  const maxSlides = currentTopic.courseData.slides.length;
  if (currentSlideIndex < maxSlides - 1) {
    currentSlideIndex++;
    renderCurrentSlide();
    updateSidebarActive();
  } else {
    startTopicExam();
  }
}

// ==========================================
// 5. QUIZ ENGINE
// ==========================================
function startTopicExam() {
  currentQuizIndex = 0;
  currentQuizAnswers = [];
  
  let categoryName = currentTopic.name.split(":")[0];
  if (currentTopic.id === 0) categoryName = "יסודות";
  else if (currentTopic.id === 1) categoryName = "סיסמאות";
  else if (currentTopic.id === 2) categoryName = "פישינג";
  else if (currentTopic.id === 3) categoryName = "זדוניות";
  else if (currentTopic.id === 4) categoryName = "תקשורת";
  else if (currentTopic.id === 5) categoryName = "תאימות";
  else if (currentTopic.id === 6) categoryName = "רשתות";
  else if (currentTopic.id === 7) categoryName = "רשתות";
  else if (currentTopic.id === 8) categoryName = "איומים";
  else if (currentTopic.id === 9) categoryName = "התקפות רשת";
  else if (currentTopic.id === 10) categoryName = "מדיניות";

  let matchQs = QUESTIONS.filter(q => q.category.includes(categoryName) || categoryName.includes(q.category));
  if (matchQs.length === 0) {
    matchQs = [...QUESTIONS].sort(() => 0.5 - Math.random()).slice(0, 5);
  }
  
  currentQuizQuestions = matchQs.slice(0, 5);
  document.getElementById("quiz-title").innerText = `בחן נושא: ${currentTopic.name}`;
  renderQuizQuestion();
  navigate("quiz-screen");
}

function startFinalExam() {
  currentTopic = { id: 99, name: "מבחן הסמכה סופי" };
  currentQuizIndex = 0;
  currentQuizAnswers = [];
  
  currentQuizQuestions = [...QUESTIONS].sort(() => 0.5 - Math.random()).slice(0, 10);
  document.getElementById("quiz-title").innerText = "🎓 מבחן הסמכה סופי - אבטחת מידע בארגון";
  renderQuizQuestion();
  navigate("quiz-screen");
}

function renderQuizQuestion() {
  const q = currentQuizQuestions[currentQuizIndex];
  
  const progressPercent = (currentQuizIndex / currentQuizQuestions.length) * 100;
  document.getElementById("quiz-progress").style.width = `${progressPercent}%`;
  document.getElementById("quiz-progress-text").innerText = `שאלה ${currentQuizIndex + 1} מתוך ${currentQuizQuestions.length}`;
  
  document.getElementById("quiz-question-text").innerText = q.question;
  
  const optionsDiv = document.getElementById("quiz-options-container");
  optionsDiv.innerHTML = "";
  
  q.answers.forEach((ans, idx) => {
    const opt = document.createElement("div");
    opt.className = "quiz-option";
    opt.innerHTML = `
      <span style="width:24px; height:24px; border:2px solid var(--primary); border-radius:50%; display:inline-flex; justify-content:center; align-items:center; font-size:0.75rem; font-weight:700;">${String.fromCharCode(1600 + idx)}</span>
      <span>${ans}</span>
    `;
    opt.addEventListener("click", () => selectQuizOption(idx));
    optionsDiv.appendChild(opt);
  });

  document.getElementById("quiz-feedback-box").style.display = "none";
  document.getElementById("btn-next-question").style.display = "none";
}

function selectQuizOption(optionIdx) {
  const q = currentQuizQuestions[currentQuizIndex];
  const options = document.querySelectorAll("#quiz-options-container .quiz-option");
  
  if (currentQuizAnswers[currentQuizIndex] !== undefined) return;
  
  currentQuizAnswers[currentQuizIndex] = optionIdx;
  
  options.forEach((opt, idx) => {
    if (idx === q.correctIndex) {
      opt.classList.add("correct");
    } else if (idx === optionIdx) {
      opt.classList.add("wrong");
    }
  });

  const feedbackBox = document.getElementById("quiz-feedback-box");
  feedbackBox.style.display = "block";
  if (optionIdx === q.correctIndex) {
    feedbackBox.style.borderColor = "var(--success)";
    feedbackBox.innerHTML = `<span style="color:var(--success); font-weight:700;">תשובה נכונה!</span> <br> ${q.explanation || 'הסבר קצר.'}`;
  } else {
    feedbackBox.style.borderColor = "var(--danger)";
    feedbackBox.innerHTML = `<span style="color:var(--danger); font-weight:700;">תשובה שגויה.</span> התשובה הנכונה היא: <b>${q.answers[q.correctIndex]}</b>. <br> ${q.explanation || 'הסבר קצר.'}`;
  }

  document.getElementById("btn-next-question").style.display = "inline-flex";
}

function nextQuestion() {
  if (currentQuizIndex < currentQuizQuestions.length - 1) {
    currentQuizIndex++;
    renderQuizQuestion();
  } else {
    showQuizResults();
  }
}

function showQuizResults() {
  let correctCount = 0;
  currentQuizQuestions.forEach((q, idx) => {
    if (currentQuizAnswers[idx] === q.correctIndex) correctCount++;
  });
  
  const score = Math.round((correctCount / currentQuizQuestions.length) * 100);
  const timeSpent = Math.round((Date.now() - readingStartTime) / 1000);
  
  const results = getResults();
  const newResult = {
    id: results.length + 1,
    username: currentUser.username,
    courseId: currentTopic.id,
    score: score,
    duration: timeSpent,
    timestamp: Date.now()
  };
  results.push(newResult);
  saveResults(results);
  
  if (currentTopic.id !== 99 && score >= 80) {
    markTopicCompleted(currentUser.username, currentTopic.id);
  }

  const resultCard = document.getElementById("result-viewport");
  resultCard.innerHTML = "";
  
  const circle = document.createElement("div");
  circle.className = "result-score-circle";
  circle.style.borderColor = score >= 80 ? "var(--success)" : "var(--danger)";
  circle.style.boxShadow = score >= 80 ? "0 0 20px rgba(0,230,118,0.3)" : "0 0 20px rgba(255,0,127,0.3)";
  circle.innerHTML = `
    <span class="result-score-num">${score}</span>
    <span class="result-score-label">ציון</span>
  `;
  resultCard.appendChild(circle);

  const title = document.createElement("h2");
  title.innerText = score >= 80 ? "🎉 כל הכבוד! עברת בהצלחה" : "😢 לא עברת, נסה שוב";
  resultCard.appendChild(title);

  const stats = document.createElement("p");
  stats.style.color = "var(--text-secondary)";
  stats.style.margin = "1rem 0 2rem";
  stats.innerHTML = `
    ענית נכון על <b>${correctCount}</b> מתוך <b>${currentQuizQuestions.length}</b> שאלות.<br>
    זמן ביצוע: <b>${timeSpent} שניות</b>.
  `;
  resultCard.appendChild(stats);

  const btnRow = document.createElement("div");
  btnRow.style.display = "flex";
  btnRow.style.gap = "15px";
  btnRow.style.justifyContent = "center";
  
  const returnBtn = document.createElement("button");
  returnBtn.className = "btn btn-primary";
  returnBtn.innerHTML = `<i class="fas fa-home"></i> חזרה לפורטל`;
  returnBtn.addEventListener("click", () => {
    initEmployeePortal();
    navigate("employee-portal");
  });
  btnRow.appendChild(returnBtn);

  if (score < 80 && currentTopic.id !== 99) {
    const retryBtn = document.createElement("button");
    retryBtn.className = "btn btn-secondary";
    retryBtn.innerHTML = `<i class="fas fa-sync-alt"></i> נסה שוב`;
    retryBtn.addEventListener("click", () => startLearningTopic(currentTopic.id));
    btnRow.appendChild(retryBtn);
  }
  
  resultCard.appendChild(btnRow);
  navigate("result-screen");
}

// ==========================================
// 6. MANAGER DASHBOARD
// ==========================================
function initManagerDashboard() {
  showDashboardTab("stats");
  
  // Set tab click events
  document.querySelectorAll(".auth-tab").forEach(tab => {
    tab.addEventListener("click", (e) => {
      // Find current tab target
      const tabId = tab.id.replace("tab-dash-", "");
      document.querySelectorAll(".auth-tab").forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      showDashboardTab(tabId);
    });
  });
}

function showDashboardTab(tabName) {
  // Hide all sections inside dashboard
  document.querySelectorAll(".dash-tab-section").forEach(sec => {
    sec.style.display = "none";
  });
  
  const target = document.getElementById(`dash-sec-${tabName}`);
  if (target) {
    target.style.display = "block";
    
    // Lazy initializers
    if (tabName === "stats") renderStatsTab();
    else if (tabName === "employees") renderEmployeesTab();
    else if (tabName === "ai-gen") {
      renderAiGenTab();
    }
  }
}

// Render company metrics and charts
function renderStatsTab() {
  const results = getResults();
  const users = getUsers().filter(u => u.role === "employee");
  
  const totalEmployees = users.length;
  const attemptsCount = results.length;
  
  let totalScore = 0;
  results.forEach(r => totalScore += r.score);
  const averageScore = attemptsCount > 0 ? Math.round(totalScore / attemptsCount) : 0;
  
  let totalCompleted = 0;
  users.forEach(u => {
    const c = getCompletedTopics(u.username);
    totalCompleted += c.length;
  });
  const avgCompletionPercent = totalEmployees > 0 ? Math.round((totalCompleted / (totalEmployees * TOPICS.length)) * 100) : 0;

  document.getElementById("stat-total-employees").innerText = totalEmployees;
  document.getElementById("stat-average-score").innerText = `${averageScore}%`;
  document.getElementById("stat-attempts").innerText = attemptsCount;
  document.getElementById("stat-completion").innerText = `${avgCompletionPercent}%`;

  const depts = {};
  results.forEach(res => {
    const user = getUsers().find(u => u.username === res.username);
    if (user) {
      if (!depts[user.department]) depts[user.department] = { sum: 0, count: 0 };
      depts[user.department].sum += res.score;
      depts[user.department].count++;
    }
  });

  const chart = document.getElementById("department-chart");
  chart.innerHTML = "";
  
  const departmentsList = Object.keys(depts);
  if (departmentsList.length === 0) {
    chart.innerHTML = `<p style="align-self:center; margin:0 auto; color:var(--text-muted)">אין נתונים זמינים להצגה בגרף</p>`;
    return;
  }

  departmentsList.forEach(dept => {
    const avg = Math.round(depts[dept].sum / depts[dept].count);
    
    const barItem = document.createElement("div");
    barItem.className = "bar-chart-item";
    barItem.innerHTML = `
      <div class="bar-chart-pill" style="height: ${avg}%;">
        <div class="bar-chart-tooltip">ממוצע: ${avg}%</div>
      </div>
      <div class="bar-chart-label" title="${dept}">${dept}</div>
    `;
    chart.appendChild(barItem);
  });
}

function renderEmployeesTab() {
  const users = getUsers().filter(u => u.role === "employee");
  const results = getResults();
  
  const tbody = document.getElementById("employees-table-body");
  tbody.innerHTML = "";

  users.forEach(user => {
    const userResults = results.filter(r => r.username === user.username);
    const completed = getCompletedTopics(user.username);
    
    let totalScore = 0;
    userResults.forEach(r => totalScore += r.score);
    const avgScore = userResults.length > 0 ? Math.round(totalScore / userResults.length) : 0;
    
    let scoreClass = "score-low";
    if (avgScore >= 80) scoreClass = "score-high";
    else if (avgScore >= 60) scoreClass = "score-mid";

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><b>${user.full_name}</b><br><span style="font-size:0.8rem; color:var(--text-muted)">@${user.username}</span></td>
      <td>${user.department}</td>
      <td>${completed.length} / ${TOPICS.length} (${Math.round(completed.length / TOPICS.length * 100)}%)</td>
      <td>${userResults.length} פעמים</td>
      <td><span class="score-badge ${scoreClass}">${avgScore}%</span></td>
      <td>
        <button class="btn btn-primary" onclick="showEmployeeHistoryModal('${user.username}')"><i class="fas fa-history"></i> היסטוריה</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function filterEmployeesTable() {
  const query = document.getElementById("employee-search").value.toLowerCase();
  const rows = document.querySelectorAll("#employees-table-body tr");
  
  rows.forEach(row => {
    const nameText = row.children[0].innerText.toLowerCase();
    const deptText = row.children[1].innerText.toLowerCase();
    if (nameText.includes(query) || deptText.includes(query)) {
      row.style.display = "";
    } else {
      row.style.display = "none";
    }
  });
}

function showEmployeeHistoryModal(username) {
  const user = getUsers().find(u => u.username === username);
  const results = getResults().filter(r => r.username === username);
  
  if (!user) return;

  const modal = document.getElementById("history-modal");
  document.getElementById("history-modal-title").innerText = `היסטוריית מבחנים - ${user.full_name}`;
  
  const container = document.getElementById("history-modal-body");
  container.innerHTML = "";

  if (results.length === 0) {
    container.innerHTML = `<p style="text-align:center; color:var(--text-secondary); padding:2rem;">העובד טרם ביצע מבחנים כלשהם במערכת.</p>`;
  } else {
    const sorted = [...results].sort((a, b) => b.timestamp - a.timestamp);
    
    let tableHTML = `
      <table style="width:100%;">
        <thead>
          <tr>
            <th>נושא המבחן</th>
            <th>ציון</th>
            <th>זמן ביצוע</th>
            <th>תאריך ושעה</th>
          </tr>
        </thead>
        <tbody>
    `;
    
    sorted.forEach(res => {
      let topicName = "מבחן מסכם";
      if (res.courseId !== 99) {
        const top = TOPICS.find(t => t.id === res.courseId);
        if (top) topicName = top.name;
      }
      
      const dateStr = new Date(res.timestamp).toLocaleString("he-IL");
      
      let badge = "score-low";
      if (res.score >= 80) badge = "score-high";
      else if (res.score >= 60) badge = "score-mid";

      tableHTML += `
        <tr>
          <td>${topicName}</td>
          <td><span class="score-badge ${badge}">${res.score}%</span></td>
          <td>${res.duration} שניות</td>
          <td>${dateStr}</td>
        </tr>
      `;
    });
    
    tableHTML += `</tbody></table>`;
    container.innerHTML = tableHTML;
  }

  modal.classList.add("active");
}

function closeHistoryModal() {
  document.getElementById("history-modal").classList.remove("active");
}

// ==========================================
// 7. AI TOPIC GENERATOR (Groq & Fallback)
// ==========================================
function renderAiGenTab() {
  // Load saved key if exists
  const key = localStorage.getItem("groq_api_key") || "";
  document.getElementById("groq-key-input").value = key;
  
  // Render past generated courses
  const list = document.getElementById("ai-courses-list");
  list.innerHTML = "";
  
  const history = JSON.parse(localStorage.getItem("ai_courses") || "[]");
  
  if (history.length === 0) {
    list.innerHTML = `<p style="text-align:center; color:var(--text-muted);">טרם נוצרו קורסים מותאמים אישית.</p>`;
    return;
  }
  
  history.forEach((course, idx) => {
    const item = document.createElement("div");
    item.className = "ai-history-item";
    item.innerHTML = `
      <div>
        <strong>${course.courseTitle}</strong><br>
        <span style="font-size:0.8rem; color:var(--text-muted);">${course.slides.length} שקפים • ${course.quiz.length} שאלות</span>
      </div>
      <button class="btn btn-primary" onclick="launchAiCourse(${idx})"><i class="fas fa-play"></i> התחל למידה</button>
    `;
    list.appendChild(item);
  });
}

function saveGroqKey() {
  const key = document.getElementById("groq-key-input").value.trim();
  localStorage.setItem("groq_api_key", key);
  alert("✅ מפתח ה-API של Groq נשמר בהצלחה בדפדפן שלך!");
}

async function generateCustomCourse() {
  const topic = document.getElementById("ai-topic-prompt").value.trim();
  if (!topic) {
    alert("אנא הזן נושא להדרכה!");
    return;
  }

  const loader = document.getElementById("ai-loader");
  const form = document.getElementById("ai-gen-form");
  
  form.style.display = "none";
  loader.style.display = "flex";
  
  const key = localStorage.getItem("groq_api_key") || "";
  
  try {
    let generatedData = null;
    
    if (key) {
      // Use real Groq API key client-side
      generatedData = await fetchFromGroqAPI(topic, key);
    } else {
      // Offline fallback simulator
      await new Promise(resolve => setTimeout(resolve, 2500)); // Simulate thinking
      generatedData = generateOfflineFallback(topic);
    }
    
    if (generatedData) {
      // Save course in history
      const history = JSON.parse(localStorage.getItem("ai_courses") || "[]");
      history.push(generatedData);
      localStorage.setItem("ai_courses", JSON.stringify(history));
      
      alert(`✅ הקורס "${generatedData.courseTitle}" נוצר בהצלחה!`);
    }
  } catch (error) {
    console.error(error);
    alert(`❌ שגיאה ביצירת הקורס: ${error.message}`);
  } finally {
    loader.style.display = "none";
    form.style.display = "block";
    renderAiGenTab();
  }
}

async function fetchFromGroqAPI(topic, apiKey) {
  const url = "https://api.groq.com/openai/v1/chat/completions";
  
  const systemPrompt = `You are a helpful cyber security expert assistant. 
  You must return a structured training course in Hebrew about the requested topic.
  You MUST respond ONLY with a JSON object. Do not include markdown codeblocks or backticks.
  The JSON structure must be exactly:
  {
    "courseTitle": "שם הקורס בעברית",
    "slides": [
      {
        "title": "כותרת שקף 1",
        "content": "תוכן מפורט של השקף בעברית (לפחות 3 משפטים)",
        "bullets": ["נקודת מיקוד 1", "נקודת מיקוד 2", "נקודת מיקוד 3"]
      }
    ],
    "quiz": [
      {
        "question": "שאלה 1?",
        "options": ["תשובה א", "תשובה ב", "תשובה ג", "תשובה ד"],
        "correctAnswer": "תשובה א",
        "explanation": "הסבר קצר מדוע התשובה נכונה"
      }
    ]
  }
  Generate at least 3 slides and 2 quiz questions. Make sure correct answers match exactly one of the options.`;

  const userPrompt = `צור הדרכה ומבחן בעברית בנושא: ${topic}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      response_format: { type: "json_object" }
    })
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`שגיאת שרת Groq: ${response.statusText} - ${errorText}`);
  }
  
  const data = await response.json();
  const textResponse = data.choices[0].message.content;
  return JSON.parse(textResponse);
}

function generateOfflineFallback(topic) {
  const normalized = topic.toLowerCase();
  
  // Search pre-configured offline matching
  for (const key in OFFLINE_COURSES) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return OFFLINE_COURSES[key];
    }
  }
  
  // Dynamic generic fallback course builder
  return {
    courseTitle: `הדרכה מותאמת אישית: ${topic}`,
    slides: [
      { 
        title: `מבוא ל-${topic}`, 
        content: `בעקבות הדרישה הגוברת בארגון, הדרכה זו מציגה את מושגי היסוד וההיבטים האבטחתיים בנושא: ${topic}. הנושא מהווה חלק בלתי נפרד מההתגוננות האקטיבית שלנו.`, 
        bullets: ["הגדרת הנושא והקשרו לארגון", "סביבת האיומים והפגיעויות העיקריות", "חשיבות הבנת הנושא על ידי כלל העובדים"] 
      },
      { 
        title: "ניתוח סיכונים ופגיעויות", 
        content: `חולשות אבטחה ב-${topic} עלולות להוביל לפגיעה חמורה במערכות המחשוב הארגוניות. תוקפים מנסים תדיר לנצל פרצות אלו כדי להשיג גישה ראשונית.`, 
        bullets: ["וקטורי תקיפה נפוצים", "ההשלכות של זיהוי מאוחר של פגיעות", "אמצעי זיהוי וניטור מערכתיים"] 
      },
      { 
        title: "נוהל עבודה בטוח והמלצות", 
        content: `על מנת לצמצם את סיכוני האבטחה ב-${topic}, כל עובד נדרש להקפיד על הנהלים הבאים: עדכון גרסאות תדיר, אי לחיצה על קישורים חשודים ושימוש בזהות מאומתת.`, 
        bullets: ["שימוש במערכות מאושרות בלבד", "דיווח על אירועים חריגים לצוות אבטחה", "ביצוע הדרכות רענון תקופתיות"] 
      }
    ],
    quiz: [
      { 
        question: `מהי המטרה העיקרית של הבנת אבטחת ${topic}?`, 
        options: ["צמצום סיכוני סייבר ושמירה על נתוני הארגון", "האצת מהירות הגלישה ברשת", "החלפת תוכנת אנטי-וירוס", "מחיקת מסדי נתונים ישנים"], 
        correctAnswer: "צמצום סיכוני סייבר ושמירה על נתוני הארגון", 
        explanation: "הבנת עקרונות האבטחה מסייעת להפחית סיכון של חדירה והדלפת מידע ארגוני." 
      },
      { 
        question: `כיצד מומלץ לנהוג כאשר עולה חשד לאירוע אבטחה ב-${topic}?`, 
        options: ["לדווח מייד למחלקת אבטחת מידע", "להתעלם ולהמשיך לעבוד כרגיל", "לנסות לתקן את התקלה באופן עצמאי", "לשתף את החשדות ברשתות החברתיות"], 
        correctAnswer: "לדווח מייד למחלקת אבטחת מידע", 
        explanation: "דיווח מהיר מאפשר לצוותי ה-SOC לחסום את המתקפה לפני התפשטותה." 
      }
    ]
  };
}

function launchAiCourse(historyIdx) {
  const history = JSON.parse(localStorage.getItem("ai_courses") || "[]");
  const course = history[historyIdx];
  
  if (!course) return;
  
  currentTopic = {
    id: 100 + historyIdx, // Unique id prefix for custom courses
    name: course.courseTitle,
    courseData: course
  };
  
  currentSlideIndex = 0;
  readingStartTime = Date.now();
  
  // Custom slide to quiz override
  currentTopic.courseData.slides.push({
    title: "סיכום ומסקנות",
    content: "סיימת בהצלחה את קריאת חומרי ההדרכה המותאמים אישית. לחץ על הכפתור כדי לעבור לבחן המותאם ולוודא את הבנת הנושא.",
    bullets: ["עמידה במדיניות אבטחת הארגון", "זיהוי ודיווח נכון", "מזל טוב על השלמת הקורס!"]
  });

  startCustomAiExam(course.quiz);
}

function startCustomAiExam(generatedQuiz) {
  currentQuizIndex = 0;
  currentQuizAnswers = [];
  
  currentQuizQuestions = generatedQuiz.map(q => {
    let corrIdx = q.options.indexOf(q.correctAnswer);
    if (corrIdx === -1) corrIdx = 0; // fallback
    return {
      category: "מחולל AI",
      question: q.question,
      answers: q.options,
      correctIndex: corrIdx,
      explanation: q.explanation
    };
  });

  buildSlideSidebar();
  renderCurrentSlide();
  navigate("learning-screen");
}

// ==========================================
// 8. APP INITIALIZATION ENTRY POINT
// ==========================================
window.addEventListener("DOMContentLoaded", () => {
  initDatabase();
  initAuthEvents();
  
  // Make global click triggers accessible to DOM
  window.openRecoveryModal = openRecoveryModal;
  window.closeRecoveryModal = closeRecoveryModal;
  window.sendRecoveryCode = sendRecoveryCode;
  window.verifyRecoveryCode = verifyRecoveryCode;
  window.prevSlide = prevSlide;
  window.nextSlide = nextSlide;
  window.nextQuestion = nextQuestion;
  window.startFinalExam = startFinalExam;
  window.closeHistoryModal = closeHistoryModal;
  window.saveGroqKey = saveGroqKey;
  window.generateCustomCourse = generateCustomCourse;
  window.launchAiCourse = launchAiCourse;
  window.toggleTheme = toggleTheme;
  window.logout = logout;
  window.showRoleSelection = showRoleSelection;
  window.filterEmployeesTable = filterEmployeesTable;
  
  // Route to welcome by default
  navigate("welcome");
});
