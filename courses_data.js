// =============================================================
// DETAILED COURSE DATA – 11 Cybersecurity Topics
// 4-5 slides per topic, each with title, content, bullets, visual, and video script
// =============================================================

const DETAILED_OFFLINE_COURSES = {

  // ─────────────────────────────────────────────
  // TOPIC 0: מבוא: מהי תקיפת סייבר?
  // ─────────────────────────────────────────────
  0: {
    courseTitle: "מבוא: מהי תקיפת סייבר?",
    videoScript: [
      { time: 0,  text: "🛡️ ברוכים הבאים לקורס מבוא לסייבר" },
      { time: 3,  text: "סייבר הוא לא רק עניין של האקרים עם קפוצ'ון שחור..." },
      { time: 7,  text: "זו מלחמה יומיומית על המידע שלך, הארגון שלך, והפרטיות שלך." },
      { time: 12, text: "📊 בכל 39 שניות מתרחשת מתקפת סייבר בעולם." },
      { time: 17, text: "עמודי התווך של אבטחת מידע: סודיות, שלמות וזמינות – CIA Triad." },
      { time: 23, text: "ישנם 3 סוגי תוקפים: Script Kiddies, Hacktivists, ו-Nation-State." },
      { time: 30, text: "✅ הצעד הראשון להגנה – להכיר את האויב וסוגי האיומים." },
      { time: 35, text: "🎯 מוכן להתחיל? בוא נצלול פנימה!" }
    ],
    slides: [
      {
        type: "title",
        title: "מבוא: מהי תקיפת סייבר?",
        subtitle: "הבנת הנוף הדיגיטלי המאוים ועקרונות ה-CIA Triad",
        icon: "🛡️",
        content: "",
        bullets: [],
        visual: `<div class="slide-title-visual">
          <svg viewBox="0 0 300 280" width="100%" height="100%">
            <defs>
              <radialGradient id="glow0" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stop-color="#00e6ff" stop-opacity="0.3"/>
                <stop offset="100%" stop-color="#00e6ff" stop-opacity="0"/>
              </radialGradient>
            </defs>
            <circle cx="150" cy="140" r="120" fill="url(#glow0)"/>
            <text x="150" y="160" text-anchor="middle" font-size="80">🛡️</text>
            <circle cx="150" cy="140" r="110" fill="none" stroke="#00e6ff" stroke-width="1.5" stroke-dasharray="6,4" opacity="0.5">
              <animateTransform attributeName="transform" type="rotate" from="0 150 140" to="360 150 140" dur="20s" repeatCount="indefinite"/>
            </circle>
            <circle cx="150" cy="140" r="90" fill="none" stroke="#9d4edd" stroke-width="1" stroke-dasharray="4,6" opacity="0.3">
              <animateTransform attributeName="transform" type="rotate" from="360 150 140" to="0 150 140" dur="15s" repeatCount="indefinite"/>
            </circle>
          </svg>
        </div>`
      },
      {
        type: "content",
        title: "שלושת עמודי אבטחת המידע – CIA Triad",
        content: "כל מדיניות אבטחת מידע נשענת על שלושה עקרונות יסוד שנקראים CIA Triad. פגיעה באחד מהם מייצגת סוג אחר של כשל אבטחתי.",
        bullets: ["🔒 סודיות (Confidentiality) – רק מורשים רואים את המידע", "✅ שלמות (Integrity) – המידע לא שונה שלא כדין", "⚡ זמינות (Availability) – המידע זמין כשצריך"],
        visual: `<svg viewBox="0 0 300 260" width="100%" height="100%">
          <polygon points="150,20 280,240 20,240" fill="none" stroke="#00e6ff" stroke-width="2" opacity="0.3"/>
          <circle cx="150" cy="90" r="40" fill="rgba(0,230,255,0.15)" stroke="#00e6ff" stroke-width="2"/>
          <text x="150" y="85" text-anchor="middle" fill="#00e6ff" font-size="18" font-weight="700">C</text>
          <text x="150" y="103" text-anchor="middle" fill="#fff" font-size="9">סודיות</text>
          <circle cx="55" cy="215" r="40" fill="rgba(157,78,221,0.15)" stroke="#9d4edd" stroke-width="2"/>
          <text x="55" y="210" text-anchor="middle" fill="#9d4edd" font-size="18" font-weight="700">I</text>
          <text x="55" y="228" text-anchor="middle" fill="#fff" font-size="9">שלמות</text>
          <circle cx="245" cy="215" r="40" fill="rgba(0,230,118,0.15)" stroke="#00e676" stroke-width="2"/>
          <text x="245" y="210" text-anchor="middle" fill="#00e676" font-size="18" font-weight="700">A</text>
          <text x="245" y="228" text-anchor="middle" fill="#fff" font-size="9">זמינות</text>
          <line x1="150" y1="130" x2="80" y2="195" stroke="#fff" stroke-width="1" opacity="0.3"/>
          <line x1="150" y1="130" x2="220" y2="195" stroke="#fff" stroke-width="1" opacity="0.3"/>
          <line x1="80" y1="215" x2="205" y2="215" stroke="#fff" stroke-width="1" opacity="0.3"/>
          <text x="150" y="170" text-anchor="middle" fill="#fff" font-size="10" opacity="0.5">CIA</text>
        </svg>`
      },
      {
        type: "content",
        title: "מי עומד מאחורי מתקפות הסייבר?",
        content: "לא כל האקר הוא מה שאתה חושב. ישנם מספר סוגים של שחקנים בעולם הסייבר, כל אחד עם מניעים ויכולות שונות.",
        bullets: ["👶 Script Kiddies – מתחילים שמשתמשים בכלים של אחרים", "🏴 Hacktivists – אידיאולוגים פוליטיים כמו Anonymous", "🎯 Nation-State – תוקפים ממומנים על ידי מדינות (כמו APT)", "💰 Cybercriminals – פשע מאורגן המחפש רווח כספי"],
        visual: `<svg viewBox="0 0 300 260" width="100%" height="100%">
          <rect x="10" y="10" width="130" height="110" rx="12" fill="rgba(255,183,3,0.1)" stroke="#ffb703" stroke-width="1.5"/>
          <text x="75" y="55" text-anchor="middle" font-size="28">👶</text>
          <text x="75" y="78" text-anchor="middle" fill="#ffb703" font-size="10" font-weight="700">Script Kiddie</text>
          <text x="75" y="92" text-anchor="middle" fill="#aaa" font-size="8">יכולות נמוכות</text>
          <text x="75" y="105" text-anchor="middle" fill="#aaa" font-size="8">כלים מוכנים</text>
          <rect x="160" y="10" width="130" height="110" rx="12" fill="rgba(247,37,133,0.1)" stroke="#f72585" stroke-width="1.5"/>
          <text x="225" y="55" text-anchor="middle" font-size="28">🏴</text>
          <text x="225" y="78" text-anchor="middle" fill="#f72585" font-size="10" font-weight="700">Hacktivist</text>
          <text x="225" y="92" text-anchor="middle" fill="#aaa" font-size="8">מניע אידיאולוגי</text>
          <text x="225" y="105" text-anchor="middle" fill="#aaa" font-size="8">DDoS, Defacement</text>
          <rect x="10" y="135" width="130" height="110" rx="12" fill="rgba(243,114,44,0.1)" stroke="#f3722c" stroke-width="1.5"/>
          <text x="75" y="180" text-anchor="middle" font-size="28">🎯</text>
          <text x="75" y="203" text-anchor="middle" fill="#f3722c" font-size="10" font-weight="700">Nation-State</text>
          <text x="75" y="217" text-anchor="middle" fill="#aaa" font-size="8">ממומן ומתוחכם</text>
          <text x="75" y="231" text-anchor="middle" fill="#aaa" font-size="8">מטרות ממשלתיות</text>
          <rect x="160" y="135" width="130" height="110" rx="12" fill="rgba(0,230,118,0.1)" stroke="#00e676" stroke-width="1.5"/>
          <text x="225" y="180" text-anchor="middle" font-size="28">💰</text>
          <text x="225" y="203" text-anchor="middle" fill="#00e676" font-size="10" font-weight="700">Cybercriminal</text>
          <text x="225" y="217" text-anchor="middle" fill="#aaa" font-size="8">רווח כספי</text>
          <text x="225" y="231" text-anchor="middle" fill="#aaa" font-size="8">כופרה, גניבה</text>
        </svg>`
      },
      {
        type: "content",
        title: "סטטיסטיקות מדאיגות – 2024",
        content: "נתוני הסייבר העולמיים מראים תמונה חמורה שמחייבת כל ארגון לקחת את הנושא ברצינות מרבית.",
        bullets: ["⚡ מתקפה חדשה כל 39 שניות בעולם", "💸 עלות ממוצעת של פרצת נתונים: 4.45 מיליון דולר", "🎯 95% מהפרצות נגרמות מטעויות אנוש", "📈 עלייה של 300% במתקפות סייבר מאז 2020"],
        visual: `<svg viewBox="0 0 300 260" width="100%" height="100%">
          <text x="150" y="25" text-anchor="middle" fill="#aaa" font-size="11">מגמת מתקפות סייבר (2020-2024)</text>
          <line x1="40" y1="200" x2="280" y2="200" stroke="#444" stroke-width="1"/>
          <line x1="40" y1="50" x2="40" y2="200" stroke="#444" stroke-width="1"/>
          <text x="35" y="200" text-anchor="end" fill="#666" font-size="8">0</text>
          <text x="35" y="150" text-anchor="end" fill="#666" font-size="8">50K</text>
          <text x="35" y="100" text-anchor="end" fill="#666" font-size="8">100K</text>
          <text x="35" y="50" text-anchor="end" fill="#666" font-size="8">150K</text>
          <polyline points="60,190 110,175 160,150 210,110 260,55" fill="none" stroke="#f94144" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
          <circle cx="60" cy="190" r="4" fill="#f94144"/>
          <circle cx="110" cy="175" r="4" fill="#f94144"/>
          <circle cx="160" cy="150" r="4" fill="#f94144"/>
          <circle cx="210" cy="110" r="4" fill="#f94144"/>
          <circle cx="260" cy="55" r="6" fill="#f94144"/>
          <text x="60" y="212" text-anchor="middle" fill="#666" font-size="8">2020</text>
          <text x="110" y="212" text-anchor="middle" fill="#666" font-size="8">2021</text>
          <text x="160" y="212" text-anchor="middle" fill="#666" font-size="8">2022</text>
          <text x="210" y="212" text-anchor="middle" fill="#666" font-size="8">2023</text>
          <text x="260" y="212" text-anchor="middle" fill="#f94144" font-size="8" font-weight="700">2024</text>
          <text x="268" y="52" fill="#f94144" font-size="9" font-weight="700">▲+300%</text>
        </svg>`
      },
      {
        type: "summary",
        title: "3 דברים שצריך לזכור 🎯",
        content: "סיכום הנושא – עקרונות היסוד שיסייעו לך להישאר מוגן.",
        bullets: ["🔐 CIA Triad – סודיות, שלמות וזמינות הם עמודי אבטחת המידע", "👤 95% מהמתקפות מנצלות טעות אנוש – אתה קו ההגנה הראשון!", "🚨 הכרת סוגי התוקפים עוזרת לזהות ולמנוע מראש"],
        visual: `<div style="display:flex; flex-direction:column; gap:12px; width:100%;">
          <div style="background:rgba(0,230,255,0.08); border:1px solid rgba(0,230,255,0.3); border-radius:10px; padding:16px; display:flex; align-items:center; gap:12px;">
            <span style="font-size:2rem;">🔐</span>
            <div><div style="font-weight:700; color:#00e6ff;">CIA Triad</div><div style="font-size:0.8rem; color:#aaa;">הבסיס לכל אבטחת מידע</div></div>
          </div>
          <div style="background:rgba(255,183,3,0.08); border:1px solid rgba(255,183,3,0.3); border-radius:10px; padding:16px; display:flex; align-items:center; gap:12px;">
            <span style="font-size:2rem;">👤</span>
            <div><div style="font-weight:700; color:#ffb703;">גורם אנושי</div><div style="font-size:0.8rem; color:#aaa;">95% מהפרצות – טעות אנוש</div></div>
          </div>
          <div style="background:rgba(0,230,118,0.08); border:1px solid rgba(0,230,118,0.3); border-radius:10px; padding:16px; display:flex; align-items:center; gap:12px;">
            <span style="font-size:2rem;">🚨</span>
            <div><div style="font-weight:700; color:#00e676;">זיהוי תוקפים</div><div style="font-size:0.8rem; color:#aaa;">הכרת האויב = הגנה טובה יותר</div></div>
          </div>
        </div>`
      }
    ],
    quiz: []
  },

  // ─────────────────────────────────────────────
  // TOPIC 1: סיסמאות ואימות משתמשים
  // ─────────────────────────────────────────────
  1: {
    courseTitle: "סיסמאות ואימות משתמשים",
    videoScript: [
      { time: 0,  text: "🔑 כולם יודעים שצריך סיסמה חזקה. אבל מה זה אומר בפועל?" },
      { time: 5,  text: "תוקף מודרני יכול לנסות 10 מיליארד סיסמאות בשנייה אחת." },
      { time: 10, text: "סיסמה של 6 ספרות? 0.001 שניות לפירוץ. של 12 תווים? 34,000 שנה!" },
      { time: 17, text: "💡 הכלל: אורך, מגוון, ייחודיות – שלושת עמודי הסיסמה החזקה." },
      { time: 23, text: "🔐 אימות דו-שלבי (MFA) הוא המגן הנוסף שכמעט אי אפשר לעקוף." },
      { time: 29, text: "✅ סיסמה חזקה + MFA = אבטחת חשבון ברמה של בנק." },
      { time: 35, text: "🎯 בוא ניצור יחד סיסמה חזקה!" }
    ],
    slides: [
      {
        type: "title",
        title: "סיסמאות ואימות משתמשים",
        subtitle: "מדוע סיסמאות נפרצות וכיצד להגן על עצמך",
        icon: "🔑",
        content: "",
        bullets: [],
        visual: `<div class="slide-title-visual">
          <svg viewBox="0 0 300 280" width="100%" height="100%">
            <text x="150" y="160" text-anchor="middle" font-size="80">🔑</text>
            <circle cx="150" cy="140" r="110" fill="none" stroke="#9d4edd" stroke-width="1.5" stroke-dasharray="6,4" opacity="0.4">
              <animateTransform attributeName="transform" type="rotate" from="0 150 140" to="360 150 140" dur="18s" repeatCount="indefinite"/>
            </circle>
          </svg>
        </div>`
      },
      {
        type: "content",
        title: "כמה מהר תוקף פורץ סיסמה שלך?",
        content: "טכנולוגיות Brute Force מודרניות יכולות לנסות מיליארדי שילובים בשנייה. אורך הסיסמה הוא ההבדל בין שניות לאלפי שנים.",
        bullets: ["⚡ סיסמה של 4 ספרות – 0.001 שנייה לפירוץ!", "🕐 סיסמה של 8 תווים מעורבים – ~7 שנים", "🏆 סיסמה של 12+ תווים עם סימנים – 34,000 שנה+", "❌ '123456' היא הסיסמה הנפוצה ביותר בעולם"],
        visual: `<svg viewBox="0 0 300 260" width="100%" height="100%">
          <text x="150" y="20" text-anchor="middle" fill="#aaa" font-size="11">זמן פירוץ לפי אורך סיסמה</text>
          <rect x="30" y="50" width="240" height="25" rx="4" fill="rgba(249,65,68,0.2)" stroke="#f94144" stroke-width="1"/>
          <rect x="30" y="50" width="240" height="25" rx="4" fill="#f94144" opacity="0.7"/>
          <text x="155" y="67" text-anchor="middle" fill="#fff" font-size="9" font-weight="700">4 ספרות – 0.001 שנייה ❌</text>
          <rect x="30" y="90" width="200" height="25" rx="4" fill="rgba(249,65,68,0.2)" stroke="#f94144" stroke-width="1"/>
          <rect x="30" y="90" width="130" height="25" rx="4" fill="#ffb703" opacity="0.7"/>
          <text x="155" y="107" text-anchor="middle" fill="#fff" font-size="9" font-weight="700">8 תווים – 7 שנים ⚠️</text>
          <rect x="30" y="130" width="200" height="25" rx="4" fill="rgba(0,230,118,0.1)" stroke="#00e676" stroke-width="1"/>
          <rect x="30" y="130" width="60" height="25" rx="4" fill="#00e676" opacity="0.7"/>
          <text x="155" y="147" text-anchor="middle" fill="#fff" font-size="9" font-weight="700">12 תווים – 34,000 שנה ✅</text>
          <rect x="30" y="170" width="200" height="25" rx="4" fill="rgba(0,230,118,0.1)" stroke="#00e676" stroke-width="1"/>
          <rect x="30" y="170" width="20" height="25" rx="4" fill="#00e676" opacity="0.9"/>
          <text x="155" y="187" text-anchor="middle" fill="#fff" font-size="9" font-weight="700">16+ תווים – בלתי ניתן לפירוץ 🏆</text>
          <text x="150" y="230" text-anchor="middle" fill="#aaa" font-size="10">⬆️ כל תו שמוסיפים = פי 95 יותר קשה לפירוץ</text>
        </svg>`
      },
      {
        type: "interactive",
        title: "בדוק את חוזק הסיסמה שלך",
        content: "הקלד סיסמה ובדוק בזמן אמת כמה היא חזקה לפי פרמטרי האבטחה.",
        bullets: ["✅ לפחות 12 תווים", "✅ אותיות גדולות וקטנות", "✅ מספרים וסימנים מיוחדים (!@#$)", "✅ לא מילה מהמילון"],
        visual: `<div style="width:100%;">
          <input type="password" id="pwd-check" placeholder="הקלד סיסמה לבדיקה..." style="width:100%; padding:10px 14px; border-radius:8px; border:2px solid #444; background:#111; color:#fff; font-size:1rem; margin-bottom:12px; box-sizing:border-box; direction:rtl;" oninput="checkPwd(this.value)">
          <div style="height:8px; background:#222; border-radius:4px; overflow:hidden; margin-bottom:8px;">
            <div id="pwd-bar" style="width:0%; height:100%; border-radius:4px; transition:all 0.4s ease;"></div>
          </div>
          <div id="pwd-label" style="text-align:center; font-weight:700; color:#666; font-size:0.9rem; margin-bottom:12px;">הקלד סיסמה...</div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px;">
            <div id="chk-len" style="padding:6px 10px; border-radius:6px; background:#1a1a1a; border:1px solid #333; font-size:0.8rem; color:#666;">❌ 12+ תווים</div>
            <div id="chk-up" style="padding:6px 10px; border-radius:6px; background:#1a1a1a; border:1px solid #333; font-size:0.8rem; color:#666;">❌ אות גדולה</div>
            <div id="chk-num" style="padding:6px 10px; border-radius:6px; background:#1a1a1a; border:1px solid #333; font-size:0.8rem; color:#666;">❌ מספר</div>
            <div id="chk-sym" style="padding:6px 10px; border-radius:6px; background:#1a1a1a; border:1px solid #333; font-size:0.8rem; color:#666;">❌ סמל מיוחד</div>
          </div>
        </div>
        <script>
        function checkPwd(v) {
          const len = v.length >= 12;
          const up = /[A-Z]/.test(v);
          const num = /[0-9]/.test(v);
          const sym = /[^A-Za-z0-9]/.test(v);
          let score = [len,up,num,sym].filter(Boolean).length;
          const bar = document.getElementById('pwd-bar');
          const lbl = document.getElementById('pwd-label');
          const colors = ['','#f94144','#ffb703','#ffb703','#00e676'];
          const labels = ['','חלשה מאוד ❌','בינונית ⚠️','טובה 👍','חזקה מאוד! 🏆'];
          bar.style.width = (score * 25) + '%';
          bar.style.background = colors[score] || '#333';
          lbl.style.color = colors[score] || '#666';
          lbl.textContent = v.length ? labels[score] : 'הקלד סיסמה...';
          const update = (id, ok, txt) => {
            const el = document.getElementById(id);
            if(el){ el.style.background = ok ? 'rgba(0,230,118,0.1)' : '#1a1a1a'; el.style.borderColor = ok ? '#00e676' : '#333'; el.style.color = ok ? '#00e676' : '#666'; el.textContent = (ok?'✅':'❌') + ' ' + txt; }
          };
          update('chk-len', len, '12+ תווים');
          update('chk-up', up, 'אות גדולה');
          update('chk-num', num, 'מספר');
          update('chk-sym', sym, 'סמל מיוחד');
        }
        </script>`
      },
      {
        type: "content",
        title: "אימות דו-שלבי (MFA) – השריון הנוסף",
        content: "גם אם סיסמתך נגנבה, MFA מונע מהתוקף להיכנס. זהו הכלי הבודד שמוריד את הסיכוי לפריצה ב-99.9%.",
        bullets: ["📱 SMS / OTP App (Google Authenticator)", "🔑 מפתח פיזי (YubiKey) – האבטחה החזקה ביותר", "👁️ ביומטריה – טביעת אצבע, זיהוי פנים", "⚠️ MFA ב-SMS פחות מאובטח מ-OTP App"],
        visual: `<svg viewBox="0 0 300 260" width="100%" height="100%">
          <rect x="100" y="10" width="100" height="50" rx="8" fill="rgba(157,78,221,0.15)" stroke="#9d4edd" stroke-width="2"/>
          <text x="150" y="40" text-anchor="middle" fill="#9d4edd" font-size="11" font-weight="700">סיסמה</text>
          <text x="150" y="53" text-anchor="middle" fill="#aaa" font-size="8">שלב 1</text>
          <line x1="150" y1="60" x2="150" y2="90" stroke="#9d4edd" stroke-width="2" stroke-dasharray="4,3"/>
          <polygon points="145,88 155,88 150,95" fill="#9d4edd"/>
          <rect x="80" y="95" width="140" height="50" rx="8" fill="rgba(0,230,255,0.15)" stroke="#00e6ff" stroke-width="2"/>
          <text x="150" y="118" text-anchor="middle" fill="#00e6ff" font-size="11" font-weight="700">קוד OTP</text>
          <text x="150" y="133" text-anchor="middle" fill="#aaa" font-size="8">שלב 2 (תוקפת 30 שניות)</text>
          <line x1="150" y1="145" x2="150" y2="175" stroke="#00e6ff" stroke-width="2" stroke-dasharray="4,3"/>
          <polygon points="145,173 155,173 150,180" fill="#00e6ff"/>
          <rect x="70" y="180" width="160" height="50" rx="8" fill="rgba(0,230,118,0.15)" stroke="#00e676" stroke-width="2"/>
          <text x="150" y="208" text-anchor="middle" fill="#00e676" font-size="14" font-weight="700">✅ כניסה מאושרת</text>
          <text x="150" y="223" text-anchor="middle" fill="#aaa" font-size="9">גם אם הסיסמה נגנבה – בלתי ניתן לעקוף!</text>
        </svg>`
      },
      {
        type: "summary",
        title: "3 דברים שצריך לזכור 🎯",
        content: "נקודות המפתח לאבטחת חשבונות עם סיסמאות ואימות חזקים.",
        bullets: ["📏 12+ תווים עם מגוון סימנים = כמעט בלתי ניתן לפירוץ", "🔐 MFA מוריד סיכוי פריצה ב-99.9% – חובה להפעיל!", "🔄 סיסמה שונה לכל שירות – השתמש ב-Password Manager"],
        visual: `<div style="display:flex; flex-direction:column; gap:12px; width:100%;">
          <div style="background:rgba(157,78,221,0.08); border:1px solid rgba(157,78,221,0.3); border-radius:10px; padding:16px; display:flex; align-items:center; gap:12px;">
            <span style="font-size:2rem;">📏</span>
            <div><div style="font-weight:700; color:#9d4edd;">אורך = ביטחון</div><div style="font-size:0.8rem; color:#aaa;">12+ תווים מעורבים</div></div>
          </div>
          <div style="background:rgba(0,230,255,0.08); border:1px solid rgba(0,230,255,0.3); border-radius:10px; padding:16px; display:flex; align-items:center; gap:12px;">
            <span style="font-size:2rem;">🔐</span>
            <div><div style="font-weight:700; color:#00e6ff;">MFA חובה</div><div style="font-size:0.8rem; color:#aaa;">שכבת הגנה נוספת קריטית</div></div>
          </div>
          <div style="background:rgba(0,230,118,0.08); border:1px solid rgba(0,230,118,0.3); border-radius:10px; padding:16px; display:flex; align-items:center; gap:12px;">
            <span style="font-size:2rem;">🔄</span>
            <div><div style="font-weight:700; color:#00e676;">ייחודיות</div><div style="font-size:0.8rem; color:#aaa;">סיסמה שונה לכל שירות</div></div>
          </div>
        </div>`
      }
    ],
    quiz: []
  },

  // ─────────────────────────────────────────────
  // TOPIC 2: פישינג והנדסה חברתית
  // ─────────────────────────────────────────────
  2: {
    courseTitle: "פישינג והנדסה חברתית",
    videoScript: [
      { time: 0,  text: "🎣 פישינג – מתקפת הסייבר הנפוצה ביותר בעולם." },
      { time: 4,  text: "91% מכלל המתקפות על ארגונים מתחילות באימייל פישינג." },
      { time: 9,  text: "תוקפים מתחזים לבנק, לבוס שלך, לגוגל – כל מי שאתה סומך עליו." },
      { time: 15, text: "⚠️ 3 סימני האזהרה: כתובת שולח מזויפת, דחיפות מלאכותית, קישור חשוד." },
      { time: 22, text: "💡 לפני שלוחצים על קישור – תמיד hover מעל הקישור ובדוק לאן הוא מוביל." },
      { time: 28, text: "🚫 לעולם אל תזין פרטים אחרי לחיצה על קישור מאימייל!" },
      { time: 33, text: "✅ כשיש ספק – מחק ודווח למחלקת אבטחת מידע." }
    ],
    slides: [
      {
        type: "title",
        title: "פישינג והנדסה חברתית",
        subtitle: "כיצד תוקפים מנצלים אמון כדי לגנוב מידע",
        icon: "🎣",
        content: "",
        bullets: [],
        visual: `<div class="slide-title-visual">
          <svg viewBox="0 0 300 280" width="100%" height="100%">
            <text x="150" y="160" text-anchor="middle" font-size="80">🎣</text>
            <circle cx="150" cy="140" r="110" fill="none" stroke="#ffb703" stroke-width="1.5" stroke-dasharray="6,4" opacity="0.4">
              <animateTransform attributeName="transform" type="rotate" from="0 150 140" to="360 150 140" dur="16s" repeatCount="indefinite"/>
            </circle>
          </svg>
        </div>`
      },
      {
        type: "content",
        title: "סוגי מתקפות פישינג",
        content: "פישינג הוא לא רק אימייל! ישנן צורות רבות של הנדסה חברתית שמטרתן לגנוב מידע על ידי מניפולציה פסיכולוגית.",
        bullets: ["📧 Email Phishing – אימייל המתחזה לגוף מוכר", "🎯 Spear Phishing – מותאם אישית למטרה ספציפית", "📱 Smishing – פישינג באמצעות SMS", "📞 Vishing – פישינג טלפוני (התחזות לתמיכה טכנית)"],
        visual: `<svg viewBox="0 0 300 260" width="100%" height="100%">
          <circle cx="150" cy="130" r="35" fill="rgba(255,183,3,0.15)" stroke="#ffb703" stroke-width="2"/>
          <text x="150" y="125" text-anchor="middle" fill="#ffb703" font-size="12" font-weight="700">תוקף</text>
          <text x="150" y="140" text-anchor="middle" fill="#ffb703" font-size="9">פישינג</text>
          <rect x="10" y="20" width="80" height="40" rx="6" fill="rgba(249,65,68,0.1)" stroke="#f94144" stroke-width="1.5"/>
          <text x="50" y="44" text-anchor="middle" fill="#f94144" font-size="9" font-weight="700">📧 Email</text>
          <line x1="92" y1="105" x2="115" y2="108" stroke="#f94144" stroke-width="1.5" stroke-dasharray="3,3"/>
          <rect x="210" y="20" width="80" height="40" rx="6" fill="rgba(247,37,133,0.1)" stroke="#f72585" stroke-width="1.5"/>
          <text x="250" y="44" text-anchor="middle" fill="#f72585" font-size="9" font-weight="700">🎯 Spear</text>
          <line x1="208" y1="105" x2="185" y2="108" stroke="#f72585" stroke-width="1.5" stroke-dasharray="3,3"/>
          <rect x="10" y="215" width="80" height="40" rx="6" fill="rgba(76,201,240,0.1)" stroke="#4cc9f0" stroke-width="1.5"/>
          <text x="50" y="239" text-anchor="middle" fill="#4cc9f0" font-size="9" font-weight="700">📱 Smishing</text>
          <line x1="92" y1="155" x2="115" y2="152" stroke="#4cc9f0" stroke-width="1.5" stroke-dasharray="3,3"/>
          <rect x="210" y="215" width="80" height="40" rx="6" fill="rgba(0,230,118,0.1)" stroke="#00e676" stroke-width="1.5"/>
          <text x="250" y="239" text-anchor="middle" fill="#00e676" font-size="9" font-weight="700">📞 Vishing</text>
          <line x1="208" y1="155" x2="185" y2="152" stroke="#00e676" stroke-width="1.5" stroke-dasharray="3,3"/>
        </svg>`
      },
      {
        type: "content",
        title: "אנטומיה של אימייל פישינג אמיתי",
        content: "בוא נפרק אימייל פישינג אמיתי ונראה אילו מנגנונים פסיכולוגיים הוא משתמש בהם.",
        bullets: ["❌ כתובת שולח מזויפת – נראית דומה אבל שגויה", "⏰ יצירת דחיפות – 'חשבונך ייסגר בתוך 24 שעות'", "🔗 קישור מסתיר כתובת זדונית", "😨 פחד + דחיפות = פעולה ללא מחשבה"],
        visual: `<div style="padding:12px; background:#0d0d14; border:1px solid #333; border-radius:8px; width:100%; font-family:monospace; text-align:right; font-size:0.75rem; line-height:1.8;">
          <div style="border-bottom:1px solid #222; padding-bottom:6px; margin-bottom:8px;">
            <span style="color:#888;">מאת: </span><span style="color:#f94144; text-decoration:underline; border:1px dashed #f94144; padding:1px 4px;">security@paypa1-verify.com</span> <span style="color:#f94144; font-size:0.7rem;">⚠️ כתובת מזויפת!</span><br>
            <span style="color:#888;">נושא: </span><span style="color:#ffb703; font-weight:700;">🚨 חשבונך הושעה! פעולה נדרשת תוך 24 שעות</span>
          </div>
          <div style="color:#ddd; margin-bottom:10px; line-height:1.6;">
            שלום לקוח יקר,<br>
            זיהינו פעילות חשודה בחשבונך. <span style="color:#f94144;">עליך לאמת את זהותך מיידית.</span>
          </div>
          <div style="text-align:center; margin:10px 0;">
            <span style="background:#003087; color:#fff; padding:6px 16px; border-radius:3px; font-size:0.8rem; cursor:pointer; display:inline-block;" title="http://paypal.evil-hacker.ru/login">אמת את החשבון שלך</span>
          </div>
          <div style="color:#555; font-size:0.65rem; border-top:1px solid #222; padding-top:6px;">
            💡 <span style="color:#00e676;">Hover</span> על הכפתור וראה לאן הוא מוביל → <span style="color:#f94144;">evil-hacker.ru</span>
          </div>
        </div>`
      },
      {
        type: "content",
        title: "5 שלבים לזיהוי פישינג",
        content: "עקוב אחרי 5 הצעדים הפשוטים האלה לפני שאתה מגיב לכל הודעה חשודה.",
        bullets: ["1️⃣ בדוק את כתובת השולח המלאה (לא רק השם)", "2️⃣ Hover על קישורים ובדוק לאן הם מובילים", "3️⃣ כל בקשה לפרטים אישיים = חשד מידי", "4️⃣ ספקות? כנס ישירות לאתר הרשמי – לא דרך הקישור", "5️⃣ דווח למחלקת IT – עדיף לטעות ולדווח מאשר להתפשר"],
        visual: `<svg viewBox="0 0 300 260" width="100%" height="100%">
          <circle cx="150" cy="10" r="0" fill="none"/>
          <g transform="translate(0,15)">
            <rect x="30" y="0" width="240" height="35" rx="8" fill="rgba(0,230,255,0.08)" stroke="#00e6ff" stroke-width="1.2"/>
            <text x="50" y="22" fill="#00e6ff" font-size="13">1️⃣</text>
            <text x="70" y="22" fill="#fff" font-size="10">בדוק כתובת שולח</text>
            <rect x="30" y="45" width="240" height="35" rx="8" fill="rgba(0,230,118,0.08)" stroke="#00e676" stroke-width="1.2"/>
            <text x="50" y="67" fill="#00e676" font-size="13">2️⃣</text>
            <text x="70" y="67" fill="#fff" font-size="10">Hover על קישורים</text>
            <rect x="30" y="90" width="240" height="35" rx="8" fill="rgba(255,183,3,0.08)" stroke="#ffb703" stroke-width="1.2"/>
            <text x="50" y="112" fill="#ffb703" font-size="13">3️⃣</text>
            <text x="70" y="112" fill="#fff" font-size="10">חשד לכל בקשת פרטים</text>
            <rect x="30" y="135" width="240" height="35" rx="8" fill="rgba(157,78,221,0.08)" stroke="#9d4edd" stroke-width="1.2"/>
            <text x="50" y="157" fill="#9d4edd" font-size="13">4️⃣</text>
            <text x="70" y="157" fill="#fff" font-size="10">כנס ישירות לאתר הרשמי</text>
            <rect x="30" y="180" width="240" height="35" rx="8" fill="rgba(249,65,68,0.08)" stroke="#f94144" stroke-width="1.2"/>
            <text x="50" y="202" fill="#f94144" font-size="13">5️⃣</text>
            <text x="70" y="202" fill="#fff" font-size="10">דווח ל-IT תמיד!</text>
          </g>
        </svg>`
      },
      {
        type: "summary",
        title: "3 דברים שצריך לזכור 🎯",
        content: "כיצד להגן על עצמך ועל הארגון מפני מתקפות פישינג.",
        bullets: ["🔍 תמיד בדוק כתובת שולח לפני כל פעולה", "🚫 לעולם אל תזין פרטים אחרי קישור מאימייל", "📢 כשיש ספק – מחק ודווח מיד למחלקת IT"],
        visual: `<div style="display:flex; flex-direction:column; gap:12px; width:100%;">
          <div style="background:rgba(255,183,3,0.08); border:1px solid rgba(255,183,3,0.3); border-radius:10px; padding:16px; display:flex; align-items:center; gap:12px;">
            <span style="font-size:2rem;">🔍</span>
            <div><div style="font-weight:700; color:#ffb703;">בדיקת שולח</div><div style="font-size:0.8rem; color:#aaa;">כל אימייל חשוד? בדוק כתובת מלאה</div></div>
          </div>
          <div style="background:rgba(249,65,68,0.08); border:1px solid rgba(249,65,68,0.3); border-radius:10px; padding:16px; display:flex; align-items:center; gap:12px;">
            <span style="font-size:2rem;">🚫</span>
            <div><div style="font-weight:700; color:#f94144;">אל תזין פרטים</div><div style="font-size:0.8rem; color:#aaa;">לעולם לא דרך קישור מאימייל</div></div>
          </div>
          <div style="background:rgba(0,230,118,0.08); border:1px solid rgba(0,230,118,0.3); border-radius:10px; padding:16px; display:flex; align-items:center; gap:12px;">
            <span style="font-size:2rem;">📢</span>
            <div><div style="font-weight:700; color:#00e676;">דווח תמיד</div><div style="font-size:0.8rem; color:#aaa;">כשיש ספק – דווח ל-IT</div></div>
          </div>
        </div>`
      }
    ],
    quiz: []
  },

  // ─────────────────────────────────────────────
  // TOPIC 3: תוכנות זדוניות וכופרה
  // ─────────────────────────────────────────────
  3: {
    courseTitle: "תוכנות זדוניות וכופרה",
    videoScript: [
      { time: 0,  text: "🦠 תוכנות זדוניות – האיום שמסתתר בתוך קובץ רגיל." },
      { time: 5,  text: "Ransomware הצפין מעל 4,000 ארגונים ב-2023 בלבד." },
      { time: 10, text: "ממה מגיע? קובץ PDF, מסמך Word, או אפילו USB שמישהו 'שכח'." },
      { time: 16, text: "🔒 ברגע שכופרה מופעלת – אין דרך חזרה ללא גיבוי." },
      { time: 21, text: "💡 3 הגנות קריטיות: אנטי-וירוס מעודכן, גיבויים, ועדכוני מערכת." },
      { time: 27, text: "🚫 לעולם אל תשלם כופר – זה לא מבטיח החזרת הקבצים." },
      { time: 33, text: "✅ גיבוי שוטף = אפס נזק ממתקפת כופרה." }
    ],
    slides: [
      {
        type: "title",
        title: "תוכנות זדוניות וכופרה",
        subtitle: "הכרת סוגי המלוור וכיצד להגן על המערכות",
        icon: "🦠",
        content: "",
        bullets: [],
        visual: `<div class="slide-title-visual">
          <svg viewBox="0 0 300 280" width="100%" height="100%">
            <text x="150" y="160" text-anchor="middle" font-size="80">🦠</text>
            <circle cx="150" cy="140" r="110" fill="none" stroke="#ff007f" stroke-width="1.5" stroke-dasharray="6,4" opacity="0.4">
              <animateTransform attributeName="transform" type="rotate" from="0 150 140" to="360 150 140" dur="12s" repeatCount="indefinite"/>
            </circle>
          </svg>
        </div>`
      },
      {
        type: "content",
        title: "סוגי תוכנות זדוניות",
        content: "ישנם סוגים רבים של Malware, כל אחד עם שיטת תקיפה ומטרה שונה.",
        bullets: ["🦠 Virus – מתפשט ומדביק קבצים אחרים", "🐛 Worm – מתרבה ברשת ללא צורך בהפעלה", "🔒 Ransomware – מצפין קבצים ודורש כופר", "🕵️ Spyware – מרגל ושולח מידע לתוקף", "🚪 Trojan – מסתתר בתוכנה לגיטימית"],
        visual: `<svg viewBox="0 0 300 260" width="100%" height="100%">
          <text x="150" y="20" text-anchor="middle" fill="#aaa" font-size="11">השוואת סוגי Malware</text>
          <rect x="20" y="35" width="260" height="28" rx="6" fill="rgba(249,65,68,0.12)" stroke="#f94144" stroke-width="1.2"/>
          <text x="35" y="53" fill="#f94144" font-size="11">🦠</text>
          <text x="52" y="53" fill="#fff" font-size="10" font-weight="600">Virus</text>
          <text x="200" y="53" fill="#f94144" font-size="9">מדביק קבצים</text>
          <rect x="20" y="72" width="260" height="28" rx="6" fill="rgba(255,183,3,0.12)" stroke="#ffb703" stroke-width="1.2"/>
          <text x="35" y="90" fill="#ffb703" font-size="11">🐛</text>
          <text x="52" y="90" fill="#fff" font-size="10" font-weight="600">Worm</text>
          <text x="200" y="90" fill="#ffb703" font-size="9">מתרבה ברשת</text>
          <rect x="20" y="109" width="260" height="28" rx="6" fill="rgba(255,0,127,0.12)" stroke="#ff007f" stroke-width="1.2"/>
          <text x="35" y="127" fill="#ff007f" font-size="11">🔒</text>
          <text x="52" y="127" fill="#fff" font-size="10" font-weight="600">Ransomware</text>
          <text x="200" y="127" fill="#ff007f" font-size="9">מצפין ודורש כופר</text>
          <rect x="20" y="146" width="260" height="28" rx="6" fill="rgba(157,78,221,0.12)" stroke="#9d4edd" stroke-width="1.2"/>
          <text x="35" y="164" fill="#9d4edd" font-size="11">🕵️</text>
          <text x="52" y="164" fill="#fff" font-size="10" font-weight="600">Spyware</text>
          <text x="200" y="164" fill="#9d4edd" font-size="9">מרגל ושולח מידע</text>
          <rect x="20" y="183" width="260" height="28" rx="6" fill="rgba(76,201,240,0.12)" stroke="#4cc9f0" stroke-width="1.2"/>
          <text x="35" y="201" fill="#4cc9f0" font-size="11">🐴</text>
          <text x="52" y="201" fill="#fff" font-size="10" font-weight="600">Trojan</text>
          <text x="200" y="201" fill="#4cc9f0" font-size="9">מסתתר בתוכנה רגילה</text>
        </svg>`
      },
      {
        type: "content",
        title: "סימולציה – מסך כופרה אמיתי",
        content: "כך נראה מחשב שנפגע ממתקפת כופרה. הקבצים מוצפנים ואין אפשרות לגשת אליהם ללא מפתח הפענוח.",
        bullets: ["⚡ ההצפנה קורית תוך שניות ממתן ההרשאה", "💰 דמי הכופר הממוצעים: 812,000 דולר (2023)", "📁 42% מהקורבנות שילמו – ורק 65% קיבלו קבציהם בחזרה", "🔄 ארגונים עם גיבוי תקין התאוששו ללא תשלום"],
        visual: `<div style="background:#1a0005; border:3px solid #ff007f; padding:16px; border-radius:10px; text-align:center; color:#fff; box-shadow: 0 0 30px rgba(255,0,127,0.25); width:100%;">
          <div style="font-size:2rem; margin-bottom:8px;">🔒</div>
          <h3 style="color:#ff007f; margin-bottom:6px; font-size:1.1rem;">⚠️ YOUR FILES HAVE BEEN ENCRYPTED ⚠️</h3>
          <p style="font-size:0.75rem; line-height:1.5; color:#ddd; margin-bottom:10px;">All your documents, photos and databases have been encrypted with military-grade AES-256 encryption.</p>
          <div style="background:#220306; padding:8px; margin:8px 0; font-family:monospace; border-radius:5px; border:1px solid #ff007f; font-size:0.7rem; word-break:break-all; color:#ff007f;">BTC Address: 1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa</div>
          <div style="display:flex; justify-content:space-between; font-size:0.7rem; color:#aaa; margin-top:8px;">
            <span>⏱️ Deadline: 72:00:00</span>
            <span>💰 0.15 BTC (~$6,800)</span>
          </div>
          <div style="margin-top:10px; padding:6px; background:rgba(0,230,118,0.1); border-radius:5px; font-size:0.7rem; color:#00e676; border:1px solid rgba(0,230,118,0.3);">💡 סימולציה בלבד – לצורכי הדרכה</div>
        </div>`
      },
      {
        type: "content",
        title: "שרשרת ההדבקה – כיצד Malware נכנס?",
        content: "הבנת שרשרת ההדבקה (Infection Chain) מאפשרת לנו לנתק אותה בכל שלב.",
        bullets: ["1️⃣ וקטור כניסה: אימייל, קובץ USB, אתר נגוע", "2️⃣ הפעלה: קובץ Macro במסמך Word, הורדה מוסתרת", "3️⃣ התפשטות: מחפש נקודות תורפה ברשת הארגונית", "4️⃣ פעולה: הצפנה, גניבה, מחיקה"],
        visual: `<svg viewBox="0 0 300 220" width="100%" height="100%">
          <defs><marker id="arr" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#f94144"/></marker></defs>
          <rect x="15" y="85" width="60" height="50" rx="8" fill="rgba(255,183,3,0.1)" stroke="#ffb703" stroke-width="1.5"/>
          <text x="45" y="108" text-anchor="middle" fill="#ffb703" font-size="9" font-weight="700">1. כניסה</text>
          <text x="45" y="122" text-anchor="middle" fill="#aaa" font-size="8">אימייל / USB</text>
          <line x1="75" y1="110" x2="88" y2="110" stroke="#f94144" stroke-width="1.5" marker-end="url(#arr)"/>
          <rect x="90" y="85" width="60" height="50" rx="8" fill="rgba(249,65,68,0.1)" stroke="#f94144" stroke-width="1.5"/>
          <text x="120" y="108" text-anchor="middle" fill="#f94144" font-size="9" font-weight="700">2. הפעלה</text>
          <text x="120" y="122" text-anchor="middle" fill="#aaa" font-size="8">קובץ זדוני</text>
          <line x1="150" y1="110" x2="163" y2="110" stroke="#f94144" stroke-width="1.5" marker-end="url(#arr)"/>
          <rect x="165" y="85" width="60" height="50" rx="8" fill="rgba(255,0,127,0.1)" stroke="#ff007f" stroke-width="1.5"/>
          <text x="195" y="108" text-anchor="middle" fill="#ff007f" font-size="9" font-weight="700">3. התפשטות</text>
          <text x="195" y="122" text-anchor="middle" fill="#aaa" font-size="8">רשת ארגונית</text>
          <line x1="225" y1="110" x2="238" y2="110" stroke="#f94144" stroke-width="1.5" marker-end="url(#arr)"/>
          <rect x="240" y="85" width="55" height="50" rx="8" fill="rgba(157,78,221,0.1)" stroke="#9d4edd" stroke-width="1.5"/>
          <text x="267" y="108" text-anchor="middle" fill="#9d4edd" font-size="9" font-weight="700">4. פעולה</text>
          <text x="267" y="122" text-anchor="middle" fill="#aaa" font-size="8">הצפנה/גניבה</text>
          <rect x="15" y="165" width="280" height="30" rx="6" fill="rgba(0,230,118,0.05)" stroke="#00e676" stroke-width="1" stroke-dasharray="4,3"/>
          <text x="155" y="185" text-anchor="middle" fill="#00e676" font-size="9">✅ ניתן לנתק בכל שלב: אנטי-וירוס, הרשאות מוגבלות, גיבוי</text>
        </svg>`
      },
      {
        type: "summary",
        title: "3 דברים שצריך לזכור 🎯",
        content: "כיצד להגן על הארגון מפני תוכנות זדוניות וכופרה.",
        bullets: ["💾 גיבוי שוטף = אפס נזק ממתקפת כופרה", "🚫 לעולם אל תפתח קבצים ממקורות לא מוכרים", "🔄 עדכן תמיד – עדכוני אבטחה סוגרים פרצות קריטיות"],
        visual: `<div style="display:flex; flex-direction:column; gap:12px; width:100%;">
          <div style="background:rgba(255,0,127,0.08); border:1px solid rgba(255,0,127,0.3); border-radius:10px; padding:16px; display:flex; align-items:center; gap:12px;">
            <span style="font-size:2rem;">💾</span>
            <div><div style="font-weight:700; color:#ff007f;">גיבוי קריטי</div><div style="font-size:0.8rem; color:#aaa;">גיבוי שוטף = הגנה מלאה מכופרה</div></div>
          </div>
          <div style="background:rgba(249,65,68,0.08); border:1px solid rgba(249,65,68,0.3); border-radius:10px; padding:16px; display:flex; align-items:center; gap:12px;">
            <span style="font-size:2rem;">🚫</span>
            <div><div style="font-weight:700; color:#f94144;">אל תפתח קבצים</div><div style="font-size:0.8rem; color:#aaa;">ממקורות לא מוכרים</div></div>
          </div>
          <div style="background:rgba(0,230,118,0.08); border:1px solid rgba(0,230,118,0.3); border-radius:10px; padding:16px; display:flex; align-items:center; gap:12px;">
            <span style="font-size:2rem;">🔄</span>
            <div><div style="font-weight:700; color:#00e676;">עדכונים חובה</div><div style="font-size:0.8rem; color:#aaa;">עדכוני מערכת = סגירת פרצות</div></div>
          </div>
        </div>`
      }
    ],
    quiz: []
  },

  // ─────────────────────────────────────────────
  // TOPIC 4: מתקפת MITM
  // ─────────────────────────────────────────────
  4: {
    courseTitle: "מתקפת Man-in-the-Middle (MITM)",
    videoScript: [
      { time: 0,  text: "🧑‍💻 MITM – תוקף שיושב בלי ידיעתך בין שני צדדים." },
      { time: 5,  text: "אתה חושב שאתה מדבר עם הבנק – אבל מישהו מאזין ומשנה." },
      { time: 11, text: "Wi-Fi פתוח בקפה? התוקף יכול לראות כל מה שאתה שולח." },
      { time: 17, text: "🔒 HTTPS (המנעול הירוק) = ההגנה הבסיסית ביותר." },
      { time: 22, text: "VPN יוצר מנהרה מוצפנת שחוסמת האזנה מכל מנסה ליירט." },
      { time: 28, text: "⚠️ אזהרת אבטחה בדפדפן? לעולם אל תתעלם ממנה!" },
      { time: 34, text: "✅ רשת ציבורית + VPN = בטוח. רשת ציבורית בלבד = מסוכן." }
    ],
    slides: [
      {
        type: "title",
        title: "מתקפת Man-in-the-Middle",
        subtitle: "כיצד תוקפים יורטים תקשורת ומה אפשר לעשות",
        icon: "🧑‍💻",
        content: "",
        bullets: [],
        visual: `<div class="slide-title-visual">
          <svg viewBox="0 0 300 280" width="100%" height="100%">
            <text x="150" y="160" text-anchor="middle" font-size="80">🧑‍💻</text>
            <circle cx="150" cy="140" r="110" fill="none" stroke="#00e676" stroke-width="1.5" stroke-dasharray="6,4" opacity="0.4">
              <animateTransform attributeName="transform" type="rotate" from="0 150 140" to="360 150 140" dur="14s" repeatCount="indefinite"/>
            </circle>
          </svg>
        </div>`
      },
      {
        type: "content",
        title: "כיצד פועלת מתקפת MITM?",
        content: "בתקיפה זו, תוקף ממקם את עצמו בין שני צדדים המתקשרים, מיירט ואף משנה את המידע העובר ביניהם בלא ידיעתם.",
        bullets: ["👤 עובד מתחבר לשרת הארגון ברשת ציבורית", "🕵️ תוקף מיירט את הנתיב ומתחזה לשני הצדדים", "📝 יכול לקרוא, לשנות ואפילו להחדיר קוד זדוני", "🔴 נפוץ ב-Wi-Fi ציבורי, ARP Spoofing, DNS Spoofing"],
        visual: `<svg viewBox="0 0 300 240" width="100%" height="100%">
          <circle cx="40" cy="80" r="28" fill="rgba(0,230,255,0.15)" stroke="#00e6ff" stroke-width="2"/>
          <text x="40" y="76" text-anchor="middle" font-size="16">👤</text>
          <text x="40" y="92" text-anchor="middle" fill="#00e6ff" font-size="9">עובד</text>
          <circle cx="260" cy="80" r="28" fill="rgba(0,230,118,0.15)" stroke="#00e676" stroke-width="2"/>
          <text x="260" y="76" text-anchor="middle" font-size="16">🏦</text>
          <text x="260" y="92" text-anchor="middle" fill="#00e676" font-size="9">שרת</text>
          <line x1="68" y1="80" x2="232" y2="80" stroke="#444" stroke-width="1.5" stroke-dasharray="5,5"/>
          <text x="150" y="72" text-anchor="middle" fill="#444" font-size="9">תקשורת מוצפנת (HTTPS)</text>
          <circle cx="150" cy="175" r="32" fill="rgba(249,65,68,0.2)" stroke="#f94144" stroke-width="2.5"/>
          <text x="150" y="171" text-anchor="middle" font-size="18">🕵️</text>
          <text x="150" y="190" text-anchor="middle" fill="#f94144" font-size="9" font-weight="700">תוקף MITM</text>
          <path d="M 68 95 Q 110 160 120 165" fill="none" stroke="#f94144" stroke-width="2" stroke-dasharray="4,3"/>
          <path d="M 232 95 Q 190 160 180 165" fill="none" stroke="#f94144" stroke-width="2" stroke-dasharray="4,3"/>
          <text x="150" y="225" text-anchor="middle" fill="#f94144" font-size="10" font-weight="700">⚡ יורט ומשנה נתונים בזמן אמת</text>
        </svg>`
      },
      {
        type: "content",
        title: "שיטות MITM נפוצות",
        content: "תוקפים משתמשים במגוון טכניקות כדי להתמקם בתווך בין הקורבן ליעד.",
        bullets: ["📡 Evil Twin – נקודת Wi-Fi מזויפת עם שם מוכר", "🔄 ARP Spoofing – זיוף כתובות MAC ברשת מקומית", "💉 SSL Stripping – הורדה מ-HTTPS ל-HTTP", "🌐 DNS Spoofing – הפניה לאתר זדוני מזויף"],
        visual: `<svg viewBox="0 0 300 260" width="100%" height="100%">
          <text x="150" y="18" text-anchor="middle" fill="#aaa" font-size="11">שיטות MITM ורמת הסכנה</text>
          <rect x="20" y="30" width="260" height="45" rx="8" fill="rgba(249,65,68,0.1)" stroke="#f94144" stroke-width="1.5"/>
          <text x="35" y="52" fill="#f94144" font-size="11">📡</text>
          <text x="55" y="52" fill="#fff" font-size="10" font-weight="700">Evil Twin Wi-Fi</text>
          <text x="55" y="66" fill="#aaa" font-size="8">רשת מזויפת עם שם זהה לרשת האמיתית</text>
          <text x="250" y="52" fill="#f94144" font-size="9">🔴 גבוה</text>
          <rect x="20" y="85" width="260" height="45" rx="8" fill="rgba(255,183,3,0.1)" stroke="#ffb703" stroke-width="1.5"/>
          <text x="35" y="107" fill="#ffb703" font-size="11">🔄</text>
          <text x="55" y="107" fill="#fff" font-size="10" font-weight="700">ARP Spoofing</text>
          <text x="55" y="121" fill="#aaa" font-size="8">זיוף כתובות ברשת מקומית</text>
          <text x="250" y="107" fill="#ffb703" font-size="9">🟠 בינוני</text>
          <rect x="20" y="140" width="260" height="45" rx="8" fill="rgba(157,78,221,0.1)" stroke="#9d4edd" stroke-width="1.5"/>
          <text x="35" y="162" fill="#9d4edd" font-size="11">💉</text>
          <text x="55" y="162" fill="#fff" font-size="10" font-weight="700">SSL Stripping</text>
          <text x="55" y="176" fill="#aaa" font-size="8">הסרת הצפנת HTTPS</text>
          <text x="250" y="162" fill="#9d4edd" font-size="9">🔴 גבוה</text>
          <rect x="20" y="195" width="260" height="45" rx="8" fill="rgba(76,201,240,0.1)" stroke="#4cc9f0" stroke-width="1.5"/>
          <text x="35" y="217" fill="#4cc9f0" font-size="11">🌐</text>
          <text x="55" y="217" fill="#fff" font-size="10" font-weight="700">DNS Spoofing</text>
          <text x="55" y="231" fill="#aaa" font-size="8">הפניה לאתר מזויף</text>
          <text x="250" y="217" fill="#f94144" font-size="9">🔴 גבוה</text>
        </svg>`
      },
      {
        type: "content",
        title: "כיצד להגן על עצמך?",
        content: "ישנן מספר שכבות הגנה שיחסמו כמעט כל ניסיון MITM.",
        bullets: ["🔒 השתמש רק ב-HTTPS – בדוק את המנעול הירוק!", "🌐 VPN בכל רשת ציבורית – מנהרת הצפנה מלאה", "⚠️ לעולם אל תתעלם מאזהרות אבטחה בדפדפן", "📡 Wi-Fi ארגוני? ודא שמשתמשים ב-802.1X Authentication"],
        visual: `<svg viewBox="0 0 300 240" width="100%" height="100%">
          <rect x="20" y="20" width="260" height="200" rx="12" fill="rgba(0,230,118,0.03)" stroke="#00e676" stroke-width="1" stroke-dasharray="4,4"/>
          <text x="150" y="18" text-anchor="middle" fill="#00e676" font-size="10" font-weight="700">שכבות הגנה מפני MITM</text>
          <rect x="35" y="35" width="230" height="35" rx="6" fill="rgba(0,230,255,0.1)" stroke="#00e6ff" stroke-width="1.2"/>
          <text x="55" y="57" fill="#00e6ff" font-size="10">🔒 HTTPS</text>
          <text x="120" y="57" fill="#aaa" font-size="9">הצפנת תקשורת בסיסית</text>
          <rect x="35" y="80" width="230" height="35" rx="6" fill="rgba(157,78,221,0.1)" stroke="#9d4edd" stroke-width="1.2"/>
          <text x="55" y="102" fill="#9d4edd" font-size="10">🌐 VPN</text>
          <text x="120" y="102" fill="#aaa" font-size="9">מנהרה מוצפנת מלאה</text>
          <rect x="35" y="125" width="230" height="35" rx="6" fill="rgba(255,183,3,0.1)" stroke="#ffb703" stroke-width="1.2"/>
          <text x="55" y="147" fill="#ffb703" font-size="10">🛡️ TLS 1.3</text>
          <text x="120" y="147" fill="#aaa" font-size="9">פרוטוקול הצפנה מתקדם</text>
          <rect x="35" y="170" width="230" height="35" rx="6" fill="rgba(0,230,118,0.1)" stroke="#00e676" stroke-width="1.2"/>
          <text x="55" y="192" fill="#00e676" font-size="10">📜 Certificate Pinning</text>
          <text x="155" y="192" fill="#aaa" font-size="9">אימות תעודה</text>
        </svg>`
      },
      {
        type: "summary",
        title: "3 דברים שצריך לזכור 🎯",
        content: "ההגנות החיוניות מפני מתקפות MITM.",
        bullets: ["🔒 תמיד HTTPS – בדוק את המנעול לפני כל פעולה רגישה", "🌐 VPN חובה ברשתות Wi-Fi ציבוריות", "⚠️ אזהרת אבטחה בדפדפן = עצור ואל תמשיך!"],
        visual: `<div style="display:flex; flex-direction:column; gap:12px; width:100%;">
          <div style="background:rgba(0,230,118,0.08); border:1px solid rgba(0,230,118,0.3); border-radius:10px; padding:16px; display:flex; align-items:center; gap:12px;">
            <span style="font-size:2rem;">🔒</span>
            <div><div style="font-weight:700; color:#00e676;">HTTPS בלבד</div><div style="font-size:0.8rem; color:#aaa;">המנעול = הצפנת תקשורת</div></div>
          </div>
          <div style="background:rgba(157,78,221,0.08); border:1px solid rgba(157,78,221,0.3); border-radius:10px; padding:16px; display:flex; align-items:center; gap:12px;">
            <span style="font-size:2rem;">🌐</span>
            <div><div style="font-weight:700; color:#9d4edd;">VPN ברשת ציבורית</div><div style="font-size:0.8rem; color:#aaa;">מנהרה מוצפנת שחוסמת ציתות</div></div>
          </div>
          <div style="background:rgba(255,183,3,0.08); border:1px solid rgba(255,183,3,0.3); border-radius:10px; padding:16px; display:flex; align-items:center; gap:12px;">
            <span style="font-size:2rem;">⚠️</span>
            <div><div style="font-weight:700; color:#ffb703;">אזהרות דפדפן</div><div style="font-size:0.8rem; color:#aaa;">לעולם אל תתעלם – עצור ויצא!</div></div>
          </div>
        </div>`
      }
    ],
    quiz: []
  },

  // ─────────────────────────────────────────────
  // TOPIC 5: כתיבת קוד מאובטח
  // ─────────────────────────────────────────────
  5: {
    courseTitle: "כתיבת קוד מאובטח",
    videoScript: [
      { time: 0,  text: "💻 קוד מאובטח – הבסיס לכל מוצר דיגיטלי בטוח." },
      { time: 5,  text: "60% מהפרצות הגדולות ב-2023 התחילו מבאג בקוד שנכתב לא נכון." },
      { time: 11, text: "XSS, SQLi, IDOR – שמות שכל מפתח חייב להכיר." },
      { time: 16, text: "✅ עיקרון ה-Least Privilege – תן רק מה שצריך, לא יותר." },
      { time: 21, text: "🔍 Code Review + Static Analysis = מניעת 80% מהפרצות." },
      { time: 27, text: "💡 Input Validation – לעולם אל תסמוך על קלט מהמשתמש." },
      { time: 33, text: "✅ קוד מאובטח = לא מוסיף פיצ'רים, מונע נזק." }
    ],
    slides: [
      {
        type: "title",
        title: "כתיבת קוד מאובטח",
        subtitle: "עקרונות Secure Coding ומניעת פרצות נפוצות",
        icon: "💻",
        content: "",
        bullets: [],
        visual: `<div class="slide-title-visual">
          <svg viewBox="0 0 300 280" width="100%" height="100%">
            <text x="150" y="160" text-anchor="middle" font-size="80">💻</text>
            <circle cx="150" cy="140" r="110" fill="none" stroke="#4cc9f0" stroke-width="1.5" stroke-dasharray="6,4" opacity="0.4">
              <animateTransform attributeName="transform" type="rotate" from="0 150 140" to="360 150 140" dur="22s" repeatCount="indefinite"/>
            </circle>
          </svg>
        </div>`
      },
      {
        type: "content",
        title: "OWASP Top 10 – הפרצות הנפוצות ביותר",
        content: "OWASP מפרסמת את רשימת 10 הפרצות הנפוצות ביותר ביישומי Web. מפתח שמכיר את הרשימה הזאת – מונע 80% מהתקיפות.",
        bullets: ["🔴 A1: Broken Access Control – גישה לא מורשית", "🔴 A2: Cryptographic Failures – הצפנה לא תקינה", "🔴 A3: Injection – XSS, SQLi, Command Injection", "🟡 A4: Insecure Design – ארכיטקטורה פגומה"],
        visual: `<svg viewBox="0 0 300 260" width="100%" height="100%">
          <text x="150" y="18" text-anchor="middle" fill="#aaa" font-size="10">OWASP Top 4 – רמות חומרה</text>
          <rect x="15" y="30" width="195" height="30" rx="5" fill="rgba(249,65,68,0.15)" stroke="#f94144" stroke-width="1.5"/>
          <rect x="15" y="30" width="195" height="30" rx="5" fill="#f94144"/>
          <text x="120" y="50" text-anchor="middle" fill="#fff" font-size="9" font-weight="700">A1: Broken Access Control</text>
          <text x="220" y="50" fill="#f94144" font-size="8">Critical</text>
          <rect x="15" y="70" width="170" height="30" rx="5" fill="#f3722c"/>
          <text x="100" y="90" text-anchor="middle" fill="#fff" font-size="9" font-weight="700">A2: Crypto Failures</text>
          <text x="200" y="90" fill="#f3722c" font-size="8">High</text>
          <rect x="15" y="110" width="155" height="30" rx="5" fill="#ffb703"/>
          <text x="95" y="130" text-anchor="middle" fill="#fff" font-size="9" font-weight="700">A3: Injection</text>
          <text x="185" y="130" fill="#ffb703" font-size="8">High</text>
          <rect x="15" y="150" width="130" height="30" rx="5" fill="#4cc9f0"/>
          <text x="80" y="170" text-anchor="middle" fill="#fff" font-size="9" font-weight="700">A4: Insecure Design</text>
          <text x="160" y="170" fill="#4cc9f0" font-size="8">Medium</text>
          <line x1="215" y1="190" x2="215" y2="30" stroke="#444" stroke-width="1" stroke-dasharray="3,3"/>
          <text x="215" y="205" text-anchor="middle" fill="#aaa" font-size="8">סרגל סיכון</text>
        </svg>`
      },
      {
        type: "content",
        title: "XSS מול קוד מאובטח – השוואה חיה",
        content: "Cross-Site Scripting (XSS) היא אחת הפרצות הנפוצות ביותר. הפתרון הוא פשוט: לא לסמוך על קלט המשתמש.",
        bullets: ["❌ innerHTML = מאפשר הזרקת HTML/JS זדוני", "✅ textContent = מציג טקסט בלבד, בטוח", "🔒 Content Security Policy (CSP) – שכבת הגנה נוספת", "🔍 Sanitize = ניקוי קלט לפני שימוש"],
        visual: `<div style="display:flex; flex-direction:column; gap:10px; width:100%;">
          <div style="background:#1a0a0a; border:1.5px solid #f94144; border-radius:8px; padding:12px;">
            <div style="color:#f94144; font-size:0.75rem; font-weight:700; margin-bottom:6px;">❌ קוד פגיע – XSS</div>
            <pre style="color:#ccc; font-size:0.75rem; margin:0; font-family:monospace; direction:ltr; text-align:left; overflow-x:auto;">// הזרקת JavaScript זדוני!
const q = getParam('search');
div.innerHTML = q;
// תוקף שולח: &lt;script&gt;steal()&lt;/script&gt;</pre>
          </div>
          <div style="background:#0a1a0a; border:1.5px solid #00e676; border-radius:8px; padding:12px;">
            <div style="color:#00e676; font-size:0.75rem; font-weight:700; margin-bottom:6px;">✅ קוד מאובטח</div>
            <pre style="color:#ccc; font-size:0.75rem; margin:0; font-family:monospace; direction:ltr; text-align:left; overflow-x:auto;">// textContent מציג טקסט בלבד
const q = sanitize(getParam('search'));
div.textContent = q;
// הסקריפט מוצג כטקסט – לא מופעל!</pre>
          </div>
        </div>`
      },
      {
        type: "content",
        title: "עקרונות Secure Coding",
        content: "5 עקרונות בסיסיים שכל מפתח חייב ליישם בכל שורת קוד.",
        bullets: ["🔐 Least Privilege – תן הרשאות מינימליות הכרחיות", "🧹 Input Validation – אמת כל קלט, לעולם אל תסמוך", "🔑 Never hardcode secrets – סיסמאות אינן בקוד!", "📝 Logging – רשום אירועי אבטחה לניתוח", "🔄 Dependency Updates – עדכן ספריות תדיר"],
        visual: `<svg viewBox="0 0 300 260" width="100%" height="100%">
          <polygon points="150,15 285,240 15,240" fill="none" stroke="#4cc9f0" stroke-width="1.5" opacity="0.3"/>
          <text x="150" y="240" text-anchor="middle" fill="#aaa" font-size="9">פירמידת Secure Coding</text>
          <rect x="110" y="30" width="80" height="28" rx="5" fill="rgba(249,65,68,0.2)" stroke="#f94144" stroke-width="1.2"/>
          <text x="150" y="48" text-anchor="middle" fill="#f94144" font-size="8" font-weight="700">Least Privilege</text>
          <rect x="80" y="70" width="140" height="28" rx="5" fill="rgba(255,183,3,0.2)" stroke="#ffb703" stroke-width="1.2"/>
          <text x="150" y="88" text-anchor="middle" fill="#ffb703" font-size="8" font-weight="700">Input Validation</text>
          <rect x="55" y="110" width="190" height="28" rx="5" fill="rgba(157,78,221,0.2)" stroke="#9d4edd" stroke-width="1.2"/>
          <text x="150" y="128" text-anchor="middle" fill="#9d4edd" font-size="8" font-weight="700">No Hardcoded Secrets</text>
          <rect x="35" y="150" width="230" height="28" rx="5" fill="rgba(76,201,240,0.2)" stroke="#4cc9f0" stroke-width="1.2"/>
          <text x="150" y="168" text-anchor="middle" fill="#4cc9f0" font-size="8" font-weight="700">Logging & Monitoring</text>
          <rect x="20" y="190" width="260" height="28" rx="5" fill="rgba(0,230,118,0.2)" stroke="#00e676" stroke-width="1.2"/>
          <text x="150" y="208" text-anchor="middle" fill="#00e676" font-size="8" font-weight="700">Dependency Updates</text>
        </svg>`
      },
      {
        type: "summary",
        title: "3 דברים שצריך לזכור 🎯",
        content: "עקרונות הליבה לכתיבת קוד מאובטח.",
        bullets: ["🧹 אמת תמיד קלט – לעולם אל תסמוך על משתמש", "🔐 Least Privilege – תן את המינימום ההכרחי", "🔑 לעולם אל תשים סיסמאות ישירות בקוד"],
        visual: `<div style="display:flex; flex-direction:column; gap:12px; width:100%;">
          <div style="background:rgba(76,201,240,0.08); border:1px solid rgba(76,201,240,0.3); border-radius:10px; padding:16px; display:flex; align-items:center; gap:12px;">
            <span style="font-size:2rem;">🧹</span>
            <div><div style="font-weight:700; color:#4cc9f0;">Input Validation</div><div style="font-size:0.8rem; color:#aaa;">כל קלט – חשוד עד שמוכח אחרת</div></div>
          </div>
          <div style="background:rgba(249,65,68,0.08); border:1px solid rgba(249,65,68,0.3); border-radius:10px; padding:16px; display:flex; align-items:center; gap:12px;">
            <span style="font-size:2rem;">🔐</span>
            <div><div style="font-weight:700; color:#f94144;">Least Privilege</div><div style="font-size:0.8rem; color:#aaa;">הרשאות מינימום – תמיד</div></div>
          </div>
          <div style="background:rgba(255,183,3,0.08); border:1px solid rgba(255,183,3,0.3); border-radius:10px; padding:16px; display:flex; align-items:center; gap:12px;">
            <span style="font-size:2rem;">🔑</span>
            <div><div style="font-weight:700; color:#ffb703;">ללא Hardcoded Secrets</div><div style="font-size:0.8rem; color:#aaa;">סיסמאות? רק ב-Environment Variables</div></div>
          </div>
        </div>`
      }
    ],
    quiz: []
  },

  // ─────────────────────────────────────────────
  // TOPIC 6: אבטחת מסדי נתונים ו-SQLi
  // ─────────────────────────────────────────────
  6: {
    courseTitle: "אבטחת מסדי נתונים ו-SQLi",
    videoScript: [
      { time: 0,  text: "🗄️ SQL Injection – מתקפה שמאפשרת לתוקף לקרוא ולמחוק כל מסד נתונים." },
      { time: 6,  text: "2023: פריצת MOVEit – SQL Injection חשפה נתונים של 60 מיליון אנשים." },
      { time: 12, text: "איך זה עובד? תוקף מזריק קוד SQL לתוך שדה הטקסט שלך." },
      { time: 17, text: "✅ Parameterized Queries – הפתרון הפשוט שמונע 100% מה-SQLi." },
      { time: 23, text: "🔐 Principle of Least Privilege גם במסד הנתונים – משתמש DB מוגבל." },
      { time: 29, text: "🔍 WAF (Web Application Firewall) – שכבת הגנה נוספת." },
      { time: 35, text: "✅ Parameterized Queries = כתיבת קוד נכונה = אפס SQLi." }
    ],
    slides: [
      {
        type: "title",
        title: "אבטחת מסדי נתונים ו-SQLi",
        subtitle: "SQL Injection – הבנה, ניצול ומניעה",
        icon: "🗄️",
        content: "",
        bullets: [],
        visual: `<div class="slide-title-visual">
          <svg viewBox="0 0 300 280" width="100%" height="100%">
            <text x="150" y="160" text-anchor="middle" font-size="80">🗄️</text>
            <circle cx="150" cy="140" r="110" fill="none" stroke="#f72585" stroke-width="1.5" stroke-dasharray="6,4" opacity="0.4">
              <animateTransform attributeName="transform" type="rotate" from="0 150 140" to="360 150 140" dur="19s" repeatCount="indefinite"/>
            </circle>
          </svg>
        </div>`
      },
      {
        type: "content",
        title: "כיצד עובדת מתקפת SQL Injection?",
        content: "SQL Injection מאפשרת לתוקף להזריק קוד SQL לתוך שאילתות מסד הנתונים, ובכך לעקוף הזדהות, לגנוב או למחוק נתונים.",
        bullets: ["😈 תוקף מזין: ' OR '1'='1 בשדה סיסמה", "⚡ השאילתה מחזירה את כל השורות = כניסה ללא סיסמה!", "📦 ניתן לחלץ מידע, לשנות, למחוק ואפילו להריץ פקודות", "🌍 SQLi עדיין בין 3 הפרצות הנפוצות בעולם"],
        visual: `<div style="width:100%; font-family:monospace; font-size:0.75rem; direction:ltr; text-align:left;">
          <div style="background:#0d0d14; border:1px solid #333; border-radius:6px; padding:10px; margin-bottom:8px;">
            <div style="color:#888; margin-bottom:5px; font-family:sans-serif; direction:rtl; text-align:right; font-size:0.7rem;">שאילתה מקורית:</div>
            <span style="color:#4cc9f0;">SELECT</span> <span style="color:#fff;">*</span> <span style="color:#4cc9f0;">FROM</span> <span style="color:#fff;">users</span> <span style="color:#4cc9f0;">WHERE</span><br>
            &nbsp;&nbsp;<span style="color:#fff;">username=</span><span style="color:#00e676;">'admin'</span> <span style="color:#4cc9f0;">AND</span> <span style="color:#fff;">password=</span><span style="color:#f94144;">'[קלט המשתמש]'</span>
          </div>
          <div style="background:#1a0505; border:1.5px solid #f94144; border-radius:6px; padding:10px;">
            <div style="color:#f94144; margin-bottom:5px; font-family:sans-serif; direction:rtl; text-align:right; font-size:0.7rem;">⚠️ אחרי הזרקת SQL:</div>
            <span style="color:#4cc9f0;">SELECT</span> <span style="color:#fff;">*</span> <span style="color:#4cc9f0;">FROM</span> <span style="color:#fff;">users</span> <span style="color:#4cc9f0;">WHERE</span><br>
            &nbsp;&nbsp;<span style="color:#fff;">username=</span><span style="color:#00e676;">'admin'</span> <span style="color:#4cc9f0;">AND</span> <span style="color:#fff;">password=</span><span style="color:#f94144;">'' OR '1'='1'</span><br>
            <span style="color:#888; font-family:sans-serif; direction:rtl; text-align:right; display:block; margin-top:5px; font-size:0.65rem;">→ '1'='1' תמיד נכון = כניסה לכל חשבון!</span>
          </div>
        </div>`
      },
      {
        type: "content",
        title: "Parameterized Queries – הפתרון",
        content: "ה-Parameterized Query (שאילתה מפרמטרת) היא הפתרון הפשוט, היעיל ב-100% נגד SQL Injection.",
        bullets: ["✅ הפרמטרים מועברים בנפרד מהשאילתה עצמה", "🔒 מסד הנתונים מפרש אותם כנתונים בלבד – לא כקוד", "📚 נתמך בכל שפות הפיתוח – Python, Java, JS, PHP", "🛠️ ORM (כמו SQLAlchemy) – מגן אוטומטית"],
        visual: `<div style="display:flex; flex-direction:column; gap:8px; width:100%;">
          <div style="background:#1a0505; border:1.5px solid #f94144; border-radius:8px; padding:10px;">
            <div style="color:#f94144; font-size:0.7rem; font-weight:700; margin-bottom:5px; font-family:sans-serif;">❌ פגיע:</div>
            <pre style="color:#ccc; font-size:0.7rem; margin:0; font-family:monospace; direction:ltr;">query = "SELECT * FROM users WHERE pass='" + userInput + "'"
cursor.execute(query)  # מסוכן!</pre>
          </div>
          <div style="background:#051a05; border:1.5px solid #00e676; border-radius:8px; padding:10px;">
            <div style="color:#00e676; font-size:0.7rem; font-weight:700; margin-bottom:5px; font-family:sans-serif;">✅ מאובטח – Parameterized:</div>
            <pre style="color:#ccc; font-size:0.7rem; margin:0; font-family:monospace; direction:ltr;">query = "SELECT * FROM users WHERE pass=?"
cursor.execute(query, (userInput,))  # בטוח!</pre>
          </div>
          <div style="background:rgba(0,230,255,0.05); border:1px solid rgba(0,230,255,0.2); border-radius:8px; padding:8px; text-align:center; font-size:0.75rem; color:#00e6ff;">
            💡 הפרמטר <code>?</code> מופרד מהשאילתה – SQLi בלתי אפשרי!
          </div>
        </div>`
      },
      {
        type: "content",
        title: "הגנות שכבתיות על מסד הנתונים",
        content: "הגנה על מסד הנתונים אינה מסתכמת רק בקוד – יש לבנות מספר שכבות הגנה.",
        bullets: ["🔐 Least Privilege ל-DB User – רק SELECT, לא DROP", "🔥 WAF – חומת אש לאפליקציה שמסנן SQLi", "🔍 Audit Logging – תיעוד כל שאילתה חריגה", "🔒 Encryption at Rest – הנתונים מוצפנים גם כשנשמרים"],
        visual: `<svg viewBox="0 0 300 240" width="100%" height="100%">
          <text x="150" y="18" text-anchor="middle" fill="#aaa" font-size="10">ארכיטקטורת הגנה על DB</text>
          <rect x="110" y="25" width="80" height="35" rx="6" fill="rgba(249,65,68,0.1)" stroke="#f94144" stroke-width="1.5"/>
          <text x="150" y="47" text-anchor="middle" fill="#f94144" font-size="9" font-weight="700">🌐 Internet</text>
          <line x1="150" y1="60" x2="150" y2="80" stroke="#f94144" stroke-width="1.5" stroke-dasharray="4,3"/>
          <rect x="90" y="80" width="120" height="35" rx="6" fill="rgba(255,183,3,0.1)" stroke="#ffb703" stroke-width="1.5"/>
          <text x="150" y="102" text-anchor="middle" fill="#ffb703" font-size="9" font-weight="700">🔥 WAF Filter</text>
          <line x1="150" y1="115" x2="150" y2="135" stroke="#ffb703" stroke-width="1.5"/>
          <rect x="70" y="135" width="160" height="35" rx="6" fill="rgba(76,201,240,0.1)" stroke="#4cc9f0" stroke-width="1.5"/>
          <text x="150" y="157" text-anchor="middle" fill="#4cc9f0" font-size="9" font-weight="700">💻 App Layer (Parameterized)</text>
          <line x1="150" y1="170" x2="150" y2="190" stroke="#4cc9f0" stroke-width="1.5"/>
          <rect x="50" y="190" width="200" height="35" rx="6" fill="rgba(0,230,118,0.1)" stroke="#00e676" stroke-width="1.5"/>
          <text x="150" y="212" text-anchor="middle" fill="#00e676" font-size="9" font-weight="700">🗄️ DB (Least Privilege + Encrypted)</text>
        </svg>`
      },
      {
        type: "summary",
        title: "3 דברים שצריך לזכור 🎯",
        content: "כיצד להגן על מסדי נתונים מפני SQL Injection.",
        bullets: ["🔒 Parameterized Queries – הפתרון ב-100% נגד SQLi", "🔐 Least Privilege ל-DB – משתמש מוגבל לשאילתות בלבד", "🔥 WAF + Logging – שכבות הגנה נוספות קריטיות"],
        visual: `<div style="display:flex; flex-direction:column; gap:12px; width:100%;">
          <div style="background:rgba(247,37,133,0.08); border:1px solid rgba(247,37,133,0.3); border-radius:10px; padding:16px; display:flex; align-items:center; gap:12px;">
            <span style="font-size:2rem;">🔒</span>
            <div><div style="font-weight:700; color:#f72585;">Parameterized Queries</div><div style="font-size:0.8rem; color:#aaa;">מונע 100% מהתקיפות SQLi</div></div>
          </div>
          <div style="background:rgba(0,230,255,0.08); border:1px solid rgba(0,230,255,0.3); border-radius:10px; padding:16px; display:flex; align-items:center; gap:12px;">
            <span style="font-size:2rem;">🔐</span>
            <div><div style="font-weight:700; color:#00e6ff;">Least Privilege</div><div style="font-size:0.8rem; color:#aaa;">DB User עם הרשאות מינימליות</div></div>
          </div>
          <div style="background:rgba(255,183,3,0.08); border:1px solid rgba(255,183,3,0.3); border-radius:10px; padding:16px; display:flex; align-items:center; gap:12px;">
            <span style="font-size:2rem;">🔥</span>
            <div><div style="font-weight:700; color:#ffb703;">WAF + Monitoring</div><div style="font-size:0.8rem; color:#aaa;">חומת אש + ניטור = שכבה נוספת</div></div>
          </div>
        </div>`
      }
    ],
    quiz: []
  },

  // ─────────────────────────────────────────────
  // TOPIC 7: אבטחת רשתות וענן
  // ─────────────────────────────────────────────
  7: {
    courseTitle: "אבטחת רשתות וענן",
    videoScript: [
      { time: 0,  text: "🌐 בעולם הענן – מה שהיה 'בפנים' כבר לא קיים." },
      { time: 5,  text: "94% מהארגונים משתמשים כיום בשירותי ענן. ואיתם – סיכונים חדשים." },
      { time: 11, text: "Zero Trust – אל תסמוך על אף אחד, גם לא מבפנים." },
      { time: 16, text: "🔥 Firewall + IDS/IPS = שמירה על שער הרשת." },
      { time: 21, text: "🌐 Network Segmentation – מחיצות ברשת שמגבילות נזק." },
      { time: 27, text: "☁️ Shared Responsibility Model – ה-Cloud Provider אחראי לתשתית, אתה לנתונים." },
      { time: 34, text: "✅ פגיעה אחת בענן = פגיעה בהכל. הגן בכל שכבה." }
    ],
    slides: [
      {
        type: "title",
        title: "אבטחת רשתות וענן",
        subtitle: "Zero Trust, Firewall, ו-Cloud Security",
        icon: "🌐",
        content: "",
        bullets: [],
        visual: `<div class="slide-title-visual">
          <svg viewBox="0 0 300 280" width="100%" height="100%">
            <text x="150" y="160" text-anchor="middle" font-size="80">🌐</text>
            <circle cx="150" cy="140" r="110" fill="none" stroke="#3a86c8" stroke-width="1.5" stroke-dasharray="6,4" opacity="0.4">
              <animateTransform attributeName="transform" type="rotate" from="0 150 140" to="360 150 140" dur="25s" repeatCount="indefinite"/>
            </circle>
          </svg>
        </div>`
      },
      {
        type: "content",
        title: "עקרון Zero Trust",
        content: "ארכיטקטורת Zero Trust מבוססת על עיקרון אחד: 'Never Trust, Always Verify'. גם משתמש פנימי ברשת הארגון מחויב לאימות.",
        bullets: ["🚫 אין 'בפנים' ו'בחוץ' – כל גישה מאומתת מחדש", "🔐 Micro-segmentation – חלוקת הרשת לאזורי אבטחה", "📱 Device Trust – גם המכשיר עצמו חייב להיות אמין", "🔄 Continuous Verification – אימות מתמשך לאורך כל ה-Session"],
        visual: `<svg viewBox="0 0 300 240" width="100%" height="100%">
          <text x="150" y="18" text-anchor="middle" fill="#aaa" font-size="10">ארכיטקטורת Zero Trust</text>
          <circle cx="150" cy="130" r="50" fill="rgba(58,134,200,0.1)" stroke="#3a86c8" stroke-width="2"/>
          <text x="150" y="125" text-anchor="middle" fill="#3a86c8" font-size="10" font-weight="700">Zero Trust</text>
          <text x="150" y="140" text-anchor="middle" fill="#3a86c8" font-size="8">Core</text>
          <circle cx="60" cy="55" r="25" fill="rgba(0,230,255,0.1)" stroke="#00e6ff" stroke-width="1.5"/>
          <text x="60" y="50" text-anchor="middle" fill="#00e6ff" font-size="8">Identity</text>
          <text x="60" y="63" text-anchor="middle" fill="#00e6ff" font-size="8">Verify</text>
          <line x1="83" y1="72" x2="110" y2="95" stroke="#00e6ff" stroke-width="1" opacity="0.5"/>
          <circle cx="240" cy="55" r="25" fill="rgba(157,78,221,0.1)" stroke="#9d4edd" stroke-width="1.5"/>
          <text x="240" y="50" text-anchor="middle" fill="#9d4edd" font-size="8">Device</text>
          <text x="240" y="63" text-anchor="middle" fill="#9d4edd" font-size="8">Trust</text>
          <line x1="217" y1="72" x2="190" y2="95" stroke="#9d4edd" stroke-width="1" opacity="0.5"/>
          <circle cx="60" cy="205" r="25" fill="rgba(0,230,118,0.1)" stroke="#00e676" stroke-width="1.5"/>
          <text x="60" y="200" text-anchor="middle" fill="#00e676" font-size="8">Network</text>
          <text x="60" y="213" text-anchor="middle" fill="#00e676" font-size="8">Segment</text>
          <line x1="83" y1="188" x2="110" y2="165" stroke="#00e676" stroke-width="1" opacity="0.5"/>
          <circle cx="240" cy="205" r="25" fill="rgba(255,183,3,0.1)" stroke="#ffb703" stroke-width="1.5"/>
          <text x="240" y="200" text-anchor="middle" fill="#ffb703" font-size="8">Data</text>
          <text x="240" y="213" text-anchor="middle" fill="#ffb703" font-size="8">Encrypt</text>
          <line x1="217" y1="188" x2="190" y2="165" stroke="#ffb703" stroke-width="1" opacity="0.5"/>
        </svg>`
      },
      {
        type: "content",
        title: "Shared Responsibility בענן",
        content: "בענן, האחריות מחולקת בין ה-Provider (AWS/Azure/GCP) לבין הלקוח (הארגון). רוב הפרצות בענן הן אשמת הלקוח, לא ה-Provider.",
        bullets: ["☁️ Provider אחראי: תשתית, חומרה, רשת פיזית", "👤 לקוח אחראי: נתונים, הרשאות, הגדרות, קוד", "⚠️ S3 Bucket ציבורי = טעות נפוצה = פרצת מידע", "🔒 IAM Roles & Policies = ניהול הרשאות ענן"],
        visual: `<svg viewBox="0 0 300 240" width="100%" height="100%">
          <text x="150" y="18" text-anchor="middle" fill="#aaa" font-size="10">Shared Responsibility Model</text>
          <rect x="15" y="30" width="270" height="30" rx="5" fill="rgba(58,134,200,0.15)" stroke="#3a86c8" stroke-width="1.5"/>
          <text x="150" y="50" text-anchor="middle" fill="#3a86c8" font-size="9" font-weight="700">☁️ Cloud Provider: תשתית, שרתים, רשת</text>
          <rect x="15" y="70" width="270" height="30" rx="5" fill="rgba(58,134,200,0.1)" stroke="#3a86c8" stroke-width="1"/>
          <text x="150" y="90" text-anchor="middle" fill="#3a86c8" font-size="9">מכונות וירטואליות, Storage</text>
          <line x1="150" y1="100" x2="150" y2="115" stroke="#444" stroke-width="1" stroke-dasharray="3,3"/>
          <text x="150" y="128" text-anchor="middle" fill="#aaa" font-size="10" font-weight="700">───── קו אחריות ─────</text>
          <rect x="15" y="140" width="270" height="30" rx="5" fill="rgba(249,65,68,0.15)" stroke="#f94144" stroke-width="1.5"/>
          <text x="150" y="160" text-anchor="middle" fill="#f94144" font-size="9" font-weight="700">👤 לקוח: נתונים, קוד, הרשאות, הגדרות</text>
          <rect x="15" y="180" width="270" height="30" rx="5" fill="rgba(249,65,68,0.1)" stroke="#f94144" stroke-width="1"/>
          <text x="150" y="200" text-anchor="middle" fill="#f94144" font-size="9">IAM, S3 Permissions, Encryption, App Code</text>
          <text x="150" y="228" text-anchor="middle" fill="#ffb703" font-size="9">⚠️ 99% מפרצות הענן = טעויות הגדרה של הלקוח!</text>
        </svg>`
      },
      {
        type: "content",
        title: "כלי הגנת רשת עיקריים",
        content: "הגנה על רשת ארגונית מצריכה שימוש בכמה כלים מרכזיים שמשלימים אחד את השני.",
        bullets: ["🔥 Firewall – שומר על שער הרשת, מסנן תעבורה", "🔍 IDS/IPS – זיהוי ומניעת חדירות בזמן אמת", "🌐 SIEM – ניטור וניתוח אירועי אבטחה מרכזי", "🔐 VPN & Zero Trust Gateway – גישה מרחוק מאובטחת"],
        visual: `<svg viewBox="0 0 300 240" width="100%" height="100%">
          <text x="150" y="18" text-anchor="middle" fill="#aaa" font-size="10">שכבות הגנת רשת</text>
          <rect x="15" y="30" width="270" height="35" rx="6" fill="rgba(249,65,68,0.1)" stroke="#f94144" stroke-width="1.5"/>
          <text x="45" y="52" fill="#f94144" font-size="14">🔥</text>
          <text x="65" y="48" fill="#fff" font-size="10" font-weight="700">Firewall</text>
          <text x="65" y="60" fill="#aaa" font-size="8">מסנן תעבורה בכניסה ויציאה</text>
          <rect x="15" y="78" width="270" height="35" rx="6" fill="rgba(255,183,3,0.1)" stroke="#ffb703" stroke-width="1.5"/>
          <text x="45" y="100" fill="#ffb703" font-size="14">🔍</text>
          <text x="65" y="96" fill="#fff" font-size="10" font-weight="700">IDS / IPS</text>
          <text x="65" y="108" fill="#aaa" font-size="8">זיהוי ומניעת חדירות</text>
          <rect x="15" y="126" width="270" height="35" rx="6" fill="rgba(58,134,200,0.1)" stroke="#3a86c8" stroke-width="1.5"/>
          <text x="45" y="148" fill="#3a86c8" font-size="14">📊</text>
          <text x="65" y="144" fill="#fff" font-size="10" font-weight="700">SIEM</text>
          <text x="65" y="156" fill="#aaa" font-size="8">ניתוח אירועי אבטחה מרכזי</text>
          <rect x="15" y="174" width="270" height="35" rx="6" fill="rgba(0,230,118,0.1)" stroke="#00e676" stroke-width="1.5"/>
          <text x="45" y="196" fill="#00e676" font-size="14">🌐</text>
          <text x="65" y="192" fill="#fff" font-size="10" font-weight="700">VPN + Zero Trust</text>
          <text x="65" y="204" fill="#aaa" font-size="8">גישה מרחוק מאובטחת ואימות מתמשך</text>
        </svg>`
      },
      {
        type: "summary",
        title: "3 דברים שצריך לזכור 🎯",
        content: "עקרונות הליבה לאבטחת רשתות וסביבות ענן.",
        bullets: ["🚫 Zero Trust – לעולם אל תסמוך, תמיד אמת", "☁️ בענן – אתה אחראי לנתונים, הרשאות והגדרות", "🔥 Firewall + IDS + SIEM = הגנה שכבתית"],
        visual: `<div style="display:flex; flex-direction:column; gap:12px; width:100%;">
          <div style="background:rgba(58,134,200,0.08); border:1px solid rgba(58,134,200,0.3); border-radius:10px; padding:16px; display:flex; align-items:center; gap:12px;">
            <span style="font-size:2rem;">🚫</span>
            <div><div style="font-weight:700; color:#3a86c8;">Zero Trust</div><div style="font-size:0.8rem; color:#aaa;">לעולם אל תסמוך על אף גישה</div></div>
          </div>
          <div style="background:rgba(249,65,68,0.08); border:1px solid rgba(249,65,68,0.3); border-radius:10px; padding:16px; display:flex; align-items:center; gap:12px;">
            <span style="font-size:2rem;">☁️</span>
            <div><div style="font-weight:700; color:#f94144;">אחריות ענן</div><div style="font-size:0.8rem; color:#aaa;">הגדרות שגויות = פרצת מידע</div></div>
          </div>
          <div style="background:rgba(255,183,3,0.08); border:1px solid rgba(255,183,3,0.3); border-radius:10px; padding:16px; display:flex; align-items:center; gap:12px;">
            <span style="font-size:2rem;">🔥</span>
            <div><div style="font-weight:700; color:#ffb703;">הגנה שכבתית</div><div style="font-size:0.8rem; color:#aaa;">Firewall + IDS + SIEM + VPN</div></div>
          </div>
        </div>`
      }
    ],
    quiz: []
  },

  // ─────────────────────────────────────────────
  // TOPIC 8: APT
  // ─────────────────────────────────────────────
  8: {
    courseTitle: "איומים מתקדמים מתמשכים (APT)",
    videoScript: [
      { time: 0,  text: "🎯 APT – Advanced Persistent Threat. המתקפה שאינה נוצצת אך קטלנית." },
      { time: 6,  text: "הארכה הממוצעת שתוקף APT נמצא ברשת לפני שמגלים אותו: 197 יום!" },
      { time: 12, text: "תוקפי APT הם לרוב גורמים ממלכתיים עם תקציב ומשאבים ענקיים." },
      { time: 18, text: "Cyber Kill Chain – 7 שלבים של מתקפת APT." },
      { time: 23, text: "🔍 Threat Hunting + EDR = הדרך לגלות APT לפני שיאוחר." },
      { time: 29, text: "💡 Anomaly Detection – גילוי פעולות חריגות בתוך הרשת." },
      { time: 35, text: "✅ ניטור מתמשך הוא הדרך היחידה להילחם ב-APT." }
    ],
    slides: [
      {
        type: "title",
        title: "איומים מתקדמים מתמשכים (APT)",
        subtitle: "Cyber Kill Chain ואסטרטגיות גילוי והתמודדות",
        icon: "🎯",
        content: "",
        bullets: [],
        visual: `<div class="slide-title-visual">
          <svg viewBox="0 0 300 280" width="100%" height="100%">
            <text x="150" y="160" text-anchor="middle" font-size="80">🎯</text>
            <circle cx="150" cy="140" r="110" fill="none" stroke="#f3722c" stroke-width="1.5" stroke-dasharray="6,4" opacity="0.4">
              <animateTransform attributeName="transform" type="rotate" from="0 150 140" to="360 150 140" dur="30s" repeatCount="indefinite"/>
            </circle>
          </svg>
        </div>`
      },
      {
        type: "content",
        title: "מה הופך APT לכה מסוכן?",
        content: "APT שונה ממתקפה רגילה בכך שהוא שקט, ממושך ומכוון למטרה ספציפית – לרוב ריגול תאגידי או ממשלתי.",
        bullets: ["⏱️ 197 יום ממוצע עד גילוי – תוקף פועל בשקט חודשים!", "🏛️ תוקפים: Nation-State, APT28, Lazarus, Fancy Bear", "🎯 מטרות: מידע מסווג, קניין רוחני, תשתיות קריטיות", "🕵️ TTP (Tactics, Techniques, Procedures) – מיפוי שיטות"],
        visual: `<svg viewBox="0 0 300 240" width="100%" height="100%">
          <text x="150" y="18" text-anchor="middle" fill="#aaa" font-size="10">APT לעומת מתקפה רגילה</text>
          <rect x="15" y="30" width="125" height="180" rx="8" fill="rgba(249,65,68,0.05)" stroke="#f94144" stroke-width="1.2"/>
          <text x="77" y="50" text-anchor="middle" fill="#f94144" font-size="10" font-weight="700">APT 🎯</text>
          <text x="77" y="72" text-anchor="middle" fill="#aaa" font-size="8">⏱️ חודשים-שנים</text>
          <text x="77" y="90" text-anchor="middle" fill="#aaa" font-size="8">🎯 מטרה ספציפית</text>
          <text x="77" y="108" text-anchor="middle" fill="#aaa" font-size="8">🤫 שקט ובלתי גלוי</text>
          <text x="77" y="126" text-anchor="middle" fill="#aaa" font-size="8">🏛️ ממומן ממלכתי</text>
          <text x="77" y="144" text-anchor="middle" fill="#aaa" font-size="8">💎 ריגול, גניבת IP</text>
          <text x="77" y="162" text-anchor="middle" fill="#aaa" font-size="8">🔬 כלים מותאמים</text>
          <text x="77" y="180" text-anchor="middle" fill="#aaa" font-size="8">📍 Persistence</text>
          <rect x="160" y="30" width="125" height="180" rx="8" fill="rgba(255,183,3,0.05)" stroke="#ffb703" stroke-width="1.2"/>
          <text x="222" y="50" text-anchor="middle" fill="#ffb703" font-size="10" font-weight="700">מתקפה רגילה ⚡</text>
          <text x="222" y="72" text-anchor="middle" fill="#aaa" font-size="8">⏱️ שעות-ימים</text>
          <text x="222" y="90" text-anchor="middle" fill="#aaa" font-size="8">🎲 הזדמנותית</text>
          <text x="222" y="108" text-anchor="middle" fill="#aaa" font-size="8">📢 גלויה לעיתים</text>
          <text x="222" y="126" text-anchor="middle" fill="#aaa" font-size="8">💰 פשע מאורגן</text>
          <text x="222" y="144" text-anchor="middle" fill="#aaa" font-size="8">💵 כסף מהיר</text>
          <text x="222" y="162" text-anchor="middle" fill="#aaa" font-size="8">🔧 כלים מוכנים</text>
          <text x="222" y="180" text-anchor="middle" fill="#aaa" font-size="8">🚪 פנה ויצא</text>
        </svg>`
      },
      {
        type: "content",
        title: "Cyber Kill Chain – 7 שלבי המתקפה",
        content: "Lockheed Martin פיתחה את מודל ה-Kill Chain המתאר את 7 שלבי מתקפת APT. נתק אחד מהם – ותפסיק את המתקפה.",
        bullets: ["1️⃣ Reconnaissance – איסוף מודיעין על המטרה", "2️⃣ Weaponization – יצירת כלי תקיפה מותאם", "3️⃣ Delivery – משלוח הנשק (פישינג, USB)", "4️⃣ Exploitation → Installation → C2 → Action"],
        visual: `<svg viewBox="0 0 300 220" width="100%" height="100%">
          <defs><marker id="arrk" markerWidth="5" markerHeight="5" refX="2.5" refY="2.5" orient="auto"><path d="M0,0 L5,2.5 L0,5 Z" fill="#f3722c"/></marker></defs>
          <text x="150" y="18" text-anchor="middle" fill="#aaa" font-size="10">Cyber Kill Chain</text>
          <rect x="5" y="90" width="38" height="35" rx="5" fill="rgba(58,134,200,0.15)" stroke="#3a86c8" stroke-width="1.2"/>
          <text x="24" y="110" text-anchor="middle" fill="#3a86c8" font-size="7" font-weight="700">Recon</text>
          <line x1="43" y1="107" x2="48" y2="107" stroke="#f3722c" stroke-width="1.5" marker-end="url(#arrk)"/>
          <rect x="50" y="90" width="38" height="35" rx="5" fill="rgba(255,183,3,0.15)" stroke="#ffb703" stroke-width="1.2"/>
          <text x="69" y="110" text-anchor="middle" fill="#ffb703" font-size="7" font-weight="700">Weapon</text>
          <line x1="88" y1="107" x2="93" y2="107" stroke="#f3722c" stroke-width="1.5" marker-end="url(#arrk)"/>
          <rect x="95" y="90" width="38" height="35" rx="5" fill="rgba(243,114,44,0.15)" stroke="#f3722c" stroke-width="1.2"/>
          <text x="114" y="110" text-anchor="middle" fill="#f3722c" font-size="7" font-weight="700">Delivery</text>
          <line x1="133" y1="107" x2="138" y2="107" stroke="#f3722c" stroke-width="1.5" marker-end="url(#arrk)"/>
          <rect x="140" y="90" width="38" height="35" rx="5" fill="rgba(249,65,68,0.15)" stroke="#f94144" stroke-width="1.2"/>
          <text x="159" y="110" text-anchor="middle" fill="#f94144" font-size="7" font-weight="700">Exploit</text>
          <line x1="178" y1="107" x2="183" y2="107" stroke="#f3722c" stroke-width="1.5" marker-end="url(#arrk)"/>
          <rect x="185" y="75" width="38" height="35" rx="5" fill="rgba(249,65,68,0.2)" stroke="#f94144" stroke-width="1.5"/>
          <text x="204" y="97" text-anchor="middle" fill="#f94144" font-size="7" font-weight="700">Install</text>
          <line x1="223" y1="92" x2="228" y2="92" stroke="#f3722c" stroke-width="1.5" marker-end="url(#arrk)"/>
          <rect x="230" y="60" width="38" height="35" rx="5" fill="rgba(249,65,68,0.25)" stroke="#f94144" stroke-width="2"/>
          <text x="249" y="82" text-anchor="middle" fill="#f94144" font-size="7" font-weight="700">C&amp;C</text>
          <line x1="249" y1="95" x2="249" y2="108" stroke="#f3722c" stroke-width="1.5" marker-end="url(#arrk)"/>
          <rect x="215" y="110" width="68" height="35" rx="5" fill="rgba(157,78,221,0.2)" stroke="#9d4edd" stroke-width="2"/>
          <text x="249" y="132" text-anchor="middle" fill="#9d4edd" font-size="7" font-weight="700">Action 🎯</text>
          <rect x="5" y="165" width="290" height="25" rx="5" fill="rgba(0,230,118,0.05)" stroke="#00e676" stroke-width="1" stroke-dasharray="3,3"/>
          <text x="150" y="182" text-anchor="middle" fill="#00e676" font-size="8">✅ ניתוק בכל שלב = עצירת המתקפה</text>
        </svg>`
      },
      {
        type: "content",
        title: "כיצד מגלים ומתמודדים עם APT?",
        content: "גילוי APT מצריך ניטור מתמשך, כלי גילוי מתקדמים ונהלי Incident Response מוגדרים.",
        bullets: ["🔍 EDR (Endpoint Detection & Response) – ניטור נקודקי קצה", "🕵️ Threat Hunting – ציד פרו-אקטיבי של איומים", "📊 SIEM + UEBA – גילוי התנהגות חריגה", "📋 Incident Response Plan – נוהל תגובה מוגדר מראש"],
        visual: `<svg viewBox="0 0 300 240" width="100%" height="100%">
          <circle cx="150" cy="120" r="55" fill="rgba(243,114,44,0.08)" stroke="#f3722c" stroke-width="2"/>
          <text x="150" y="115" text-anchor="middle" fill="#f3722c" font-size="11" font-weight="700">APT</text>
          <text x="150" y="130" text-anchor="middle" fill="#aaa" font-size="8">Detection</text>
          <rect x="10" y="10" width="80" height="40" rx="6" fill="rgba(0,230,255,0.1)" stroke="#00e6ff" stroke-width="1.2"/>
          <text x="50" y="35" text-anchor="middle" fill="#00e6ff" font-size="9" font-weight="700">🔍 EDR</text>
          <line x1="90" y1="35" x2="100" y2="90" stroke="#00e6ff" stroke-width="1" stroke-dasharray="3,3"/>
          <rect x="210" y="10" width="80" height="40" rx="6" fill="rgba(157,78,221,0.1)" stroke="#9d4edd" stroke-width="1.2"/>
          <text x="250" y="35" text-anchor="middle" fill="#9d4edd" font-size="9" font-weight="700">🕵️ Hunting</text>
          <line x1="210" y1="35" x2="200" y2="90" stroke="#9d4edd" stroke-width="1" stroke-dasharray="3,3"/>
          <rect x="10" y="190" width="80" height="40" rx="6" fill="rgba(0,230,118,0.1)" stroke="#00e676" stroke-width="1.2"/>
          <text x="50" y="215" text-anchor="middle" fill="#00e676" font-size="9" font-weight="700">📊 SIEM</text>
          <line x1="90" y1="205" x2="100" y2="155" stroke="#00e676" stroke-width="1" stroke-dasharray="3,3"/>
          <rect x="210" y="190" width="80" height="40" rx="6" fill="rgba(255,183,3,0.1)" stroke="#ffb703" stroke-width="1.2"/>
          <text x="250" y="215" text-anchor="middle" fill="#ffb703" font-size="9" font-weight="700">📋 IR Plan</text>
          <line x1="210" y1="205" x2="200" y2="155" stroke="#ffb703" stroke-width="1" stroke-dasharray="3,3"/>
        </svg>`
      },
      {
        type: "summary",
        title: "3 דברים שצריך לזכור 🎯",
        content: "עקרונות ההתמודדות עם איומים מתקדמים.",
        bullets: ["⏱️ 197 יום – APT פועל בשקט. ניטור מתמשך חובה!", "🔍 EDR + Threat Hunting = גילוי מוקדם", "📋 Incident Response Plan – חייב להיות מוכן לפני המתקפה"],
        visual: `<div style="display:flex; flex-direction:column; gap:12px; width:100%;">
          <div style="background:rgba(243,114,44,0.08); border:1px solid rgba(243,114,44,0.3); border-radius:10px; padding:16px; display:flex; align-items:center; gap:12px;">
            <span style="font-size:2rem;">⏱️</span>
            <div><div style="font-weight:700; color:#f3722c;">ניטור מתמשך</div><div style="font-size:0.8rem; color:#aaa;">APT שקט = 197 יום עד גילוי בממוצע</div></div>
          </div>
          <div style="background:rgba(0,230,255,0.08); border:1px solid rgba(0,230,255,0.3); border-radius:10px; padding:16px; display:flex; align-items:center; gap:12px;">
            <span style="font-size:2rem;">🔍</span>
            <div><div style="font-weight:700; color:#00e6ff;">EDR + Hunting</div><div style="font-size:0.8rem; color:#aaa;">גילוי פרו-אקטיבי = עצירה מוקדמת</div></div>
          </div>
          <div style="background:rgba(255,183,3,0.08); border:1px solid rgba(255,183,3,0.3); border-radius:10px; padding:16px; display:flex; align-items:center; gap:12px;">
            <span style="font-size:2rem;">📋</span>
            <div><div style="font-weight:700; color:#ffb703;">IR Plan מוכן</div><div style="font-size:0.8rem; color:#aaa;">מוכנות מראש = נזק מינימלי</div></div>
          </div>
        </div>`
      }
    ],
    quiz: []
  },

  // ─────────────────────────────────────────────
  // TOPIC 9: DDoS
  // ─────────────────────────────────────────────
  9: {
    courseTitle: "מתקפות מניעת שירות (DDoS)",
    videoScript: [
      { time: 0,  text: "💥 DDoS – הצפת שרת עד קריסה. פשוט אבל קטלני." },
      { time: 5,  text: "2023: מתקפת ה-DDoS הגדולה בהיסטוריה – 71 מיליון בקשות בשנייה!" },
      { time: 11, text: "Botnet – רשת מחשבים נגועים המשמשת כצבא דיגיטלי." },
      { time: 17, text: "🛡️ CDN + Rate Limiting = ההגנה הבסיסית מפני DDoS." },
      { time: 22, text: "Anycast Routing – פיזור התעבורה לשרתים מרובים ברחבי העולם." },
      { time: 28, text: "⚠️ DDoS יכול לשמש כהסחה בזמן שמתקפה אחרת מתרחשת!" },
      { time: 34, text: "✅ תוכנית תגובה + CDN + Rate Limiting = עמידות מפני DDoS." }
    ],
    slides: [
      {
        type: "title",
        title: "מתקפות מניעת שירות (DDoS)",
        subtitle: "הבנת מנגנון DDoS וכלי ההגנה",
        icon: "💥",
        content: "",
        bullets: [],
        visual: `<div class="slide-title-visual">
          <svg viewBox="0 0 300 280" width="100%" height="100%">
            <text x="150" y="160" text-anchor="middle" font-size="80">💥</text>
            <circle cx="150" cy="140" r="110" fill="none" stroke="#f94144" stroke-width="1.5" stroke-dasharray="6,4" opacity="0.4">
              <animateTransform attributeName="transform" type="rotate" from="0 150 140" to="360 150 140" dur="11s" repeatCount="indefinite"/>
            </circle>
          </svg>
        </div>`
      },
      {
        type: "content",
        title: "כיצד עובדת מתקפת DDoS?",
        content: "DDoS (Distributed Denial of Service) הוא הצפת שרת בתעבורה עצומה ממקורות מרובים, עד לקריסתו ואי-זמינות לגולשים לגיטימיים.",
        bullets: ["🤖 Botnet – רשת של מאות אלפי מחשבים נגועים", "📡 C&C Server – שרת שליטה שמתאם את ההתקפה", "💦 Volumetric Attack – הצפה בנפח תעבורה עצום", "🔄 Amplification – ניצול שרתי DNS/NTP להגברת עצמה"],
        visual: `<svg viewBox="0 0 300 240" width="100%" height="100%">
          <rect x="125" y="95" width="50" height="50" rx="8" fill="rgba(249,65,68,0.25)" stroke="#f94144" stroke-width="2.5"/>
          <text x="150" y="125" text-anchor="middle" fill="#fff" font-size="10" font-weight="700">🏦</text>
          <text x="150" y="138" text-anchor="middle" fill="#f94144" font-size="8">SERVER</text>
          <circle cx="30" cy="30" r="14" fill="rgba(255,183,3,0.2)" stroke="#ffb703" stroke-width="1.5"/>
          <text x="30" y="35" text-anchor="middle" fill="#ffb703" font-size="10">🤖</text>
          <line x1="44" y1="42" x2="125" y2="100" stroke="#f94144" stroke-width="1.5" stroke-dasharray="4,3"/>
          <circle cx="150" cy="20" r="14" fill="rgba(255,183,3,0.2)" stroke="#ffb703" stroke-width="1.5"/>
          <text x="150" y="25" text-anchor="middle" fill="#ffb703" font-size="10">🤖</text>
          <line x1="150" y1="34" x2="150" y2="95" stroke="#f94144" stroke-width="1.5" stroke-dasharray="4,3"/>
          <circle cx="270" cy="30" r="14" fill="rgba(255,183,3,0.2)" stroke="#ffb703" stroke-width="1.5"/>
          <text x="270" y="35" text-anchor="middle" fill="#ffb703" font-size="10">🤖</text>
          <line x1="256" y1="42" x2="175" y2="100" stroke="#f94144" stroke-width="1.5" stroke-dasharray="4,3"/>
          <circle cx="30" cy="210" r="14" fill="rgba(255,183,3,0.2)" stroke="#ffb703" stroke-width="1.5"/>
          <text x="30" y="215" text-anchor="middle" fill="#ffb703" font-size="10">🤖</text>
          <line x1="44" y1="198" x2="125" y2="145" stroke="#f94144" stroke-width="1.5" stroke-dasharray="4,3"/>
          <circle cx="270" cy="210" r="14" fill="rgba(255,183,3,0.2)" stroke="#ffb703" stroke-width="1.5"/>
          <text x="270" y="215" text-anchor="middle" fill="#ffb703" font-size="10">🤖</text>
          <line x1="256" y1="198" x2="175" y2="145" stroke="#f94144" stroke-width="1.5" stroke-dasharray="4,3"/>
          <text x="150" y="230" text-anchor="middle" fill="#f94144" font-size="9" font-weight="700">בוטנט: אלפי מחשבים מציפים שרת אחד</text>
        </svg>`
      },
      {
        type: "content",
        title: "סוגי מתקפות DDoS",
        content: "ישנם מספר סוגים של מתקפות DDoS, כל אחת מכוונת לשכבה שונה של הפרוטוקול.",
        bullets: ["🌊 Volumetric – הצפה בנפח: UDP Flood, ICMP Flood", "📡 Protocol – ניצול פרוטוקולי רשת: SYN Flood, Ping of Death", "🎯 Application Layer – מתקפה על שכבת האפליקציה: HTTP Flood", "💡 Amplification – שימוש ב-DNS/NTP להגברת עצמה פי 70!"],
        visual: `<svg viewBox="0 0 300 240" width="100%" height="100%">
          <text x="150" y="18" text-anchor="middle" fill="#aaa" font-size="10">מתקפות DDoS לפי שכבת OSI</text>
          <rect x="15" y="30" width="270" height="38" rx="6" fill="rgba(249,65,68,0.12)" stroke="#f94144" stroke-width="1.5"/>
          <text x="25" y="48" fill="#f94144" font-size="10">🌊</text>
          <text x="42" y="48" fill="#fff" font-size="10" font-weight="700">Volumetric</text>
          <text x="42" y="61" fill="#aaa" font-size="8">שכבה 3-4: UDP/ICMP Flood – עד Tbps!</text>
          <rect x="15" y="78" width="270" height="38" rx="6" fill="rgba(255,183,3,0.12)" stroke="#ffb703" stroke-width="1.5"/>
          <text x="25" y="96" fill="#ffb703" font-size="10">📡</text>
          <text x="42" y="96" fill="#fff" font-size="10" font-weight="700">Protocol Attack</text>
          <text x="42" y="109" fill="#aaa" font-size="8">שכבה 3-4: SYN Flood – מנצל Handshake</text>
          <rect x="15" y="126" width="270" height="38" rx="6" fill="rgba(157,78,221,0.12)" stroke="#9d4edd" stroke-width="1.5"/>
          <text x="25" y="144" fill="#9d4edd" font-size="10">🎯</text>
          <text x="42" y="144" fill="#fff" font-size="10" font-weight="700">Application Layer</text>
          <text x="42" y="157" fill="#aaa" font-size="8">שכבה 7: HTTP Flood – קשה לסינון</text>
          <rect x="15" y="174" width="270" height="38" rx="6" fill="rgba(76,201,240,0.12)" stroke="#4cc9f0" stroke-width="1.5"/>
          <text x="25" y="192" fill="#4cc9f0" font-size="10">💡</text>
          <text x="42" y="192" fill="#fff" font-size="10" font-weight="700">Amplification</text>
          <text x="42" y="205" fill="#aaa" font-size="8">DNS/NTP – הגברת עצמה פי 70</text>
        </svg>`
      },
      {
        type: "content",
        title: "הגנות מפני DDoS",
        content: "הגנה מפני DDoS מצריכה שכבות מגן שיסננו תעבורה זדונית לפני שתגיע לשרת.",
        bullets: ["🌍 CDN (Cloudflare, Akamai) – פיזור התעבורה גלובלי", "🚦 Rate Limiting – הגבלת קצב בקשות ממקור יחיד", "🔍 Traffic Scrubbing – ניקוי תעבורה זדונית", "📊 Anycast Routing – ניתוב לשרתים קרובים"],
        visual: `<svg viewBox="0 0 300 240" width="100%" height="100%">
          <text x="150" y="18" text-anchor="middle" fill="#aaa" font-size="10">שכבות הגנת DDoS</text>
          <circle cx="150" cy="50" r="20" fill="rgba(249,65,68,0.1)" stroke="#f94144" stroke-width="1.5"/>
          <text x="150" y="54" text-anchor="middle" fill="#f94144" font-size="9">DDoS</text>
          <line x1="150" y1="70" x2="150" y2="88" stroke="#f94144" stroke-width="1.5" stroke-dasharray="4,3"/>
          <rect x="70" y="90" width="160" height="28" rx="6" fill="rgba(255,183,3,0.12)" stroke="#ffb703" stroke-width="1.5"/>
          <text x="150" y="109" text-anchor="middle" fill="#ffb703" font-size="9" font-weight="700">🌍 CDN – פיזור גלובלי</text>
          <line x1="150" y1="118" x2="150" y2="135" stroke="#ffb703" stroke-width="1.5"/>
          <rect x="60" y="137" width="180" height="28" rx="6" fill="rgba(76,201,240,0.12)" stroke="#4cc9f0" stroke-width="1.5"/>
          <text x="150" y="156" text-anchor="middle" fill="#4cc9f0" font-size="9" font-weight="700">🚦 Rate Limiting + WAF</text>
          <line x1="150" y1="165" x2="150" y2="182" stroke="#4cc9f0" stroke-width="1.5"/>
          <rect x="50" y="184" width="200" height="28" rx="6" fill="rgba(0,230,118,0.12)" stroke="#00e676" stroke-width="1.5"/>
          <text x="150" y="203" text-anchor="middle" fill="#00e676" font-size="9" font-weight="700">🏦 Server – קולט תעבורה נקייה</text>
        </svg>`
      },
      {
        type: "summary",
        title: "3 דברים שצריך לזכור 🎯",
        content: "ההגנות הבסיסיות מפני מתקפות DDoS.",
        bullets: ["🌍 CDN – הפיזור הגלובלי מגן מפני Volumetric Attack", "🚦 Rate Limiting – מגביל בקשות חריגות ממקור אחד", "⚠️ DDoS עלול לשמש כהסחה – ניטור מלא בזמן מתקפה!"],
        visual: `<div style="display:flex; flex-direction:column; gap:12px; width:100%;">
          <div style="background:rgba(249,65,68,0.08); border:1px solid rgba(249,65,68,0.3); border-radius:10px; padding:16px; display:flex; align-items:center; gap:12px;">
            <span style="font-size:2rem;">🌍</span>
            <div><div style="font-weight:700; color:#f94144;">CDN חובה</div><div style="font-size:0.8rem; color:#aaa;">פיזור גלובלי = עמידות מפני הצפה</div></div>
          </div>
          <div style="background:rgba(76,201,240,0.08); border:1px solid rgba(76,201,240,0.3); border-radius:10px; padding:16px; display:flex; align-items:center; gap:12px;">
            <span style="font-size:2rem;">🚦</span>
            <div><div style="font-weight:700; color:#4cc9f0;">Rate Limiting</div><div style="font-size:0.8rem; color:#aaa;">הגבלת קצב = חסימת בוטנט</div></div>
          </div>
          <div style="background:rgba(255,183,3,0.08); border:1px solid rgba(255,183,3,0.3); border-radius:10px; padding:16px; display:flex; align-items:center; gap:12px;">
            <span style="font-size:2rem;">⚠️</span>
            <div><div style="font-weight:700; color:#ffb703;">ניטור מלא</div><div style="font-size:0.8rem; color:#aaa;">DDoS = הסחה למתקפה מקבילה!</div></div>
          </div>
        </div>`
      }
    ],
    quiz: []
  },

  // ─────────────────────────────────────────────
  // TOPIC 10: מדיניות אבטחת מידע וניהול סיכונים
  // ─────────────────────────────────────────────
  10: {
    courseTitle: "מדיניות אבטחת מידע וניהול סיכונים",
    videoScript: [
      { time: 0,  text: "📋 אבטחת מידע לא מסתיימת בטכנולוגיה – היא מתחילה במדיניות." },
      { time: 6,  text: "ארגון ללא מדיניות אבטחה ברורה = בית ללא מפתח." },
      { time: 11, text: "ISO 27001 + GDPR + PCI-DSS – תקנים שמגדירים את הרף." },
      { time: 17, text: "🔍 ניהול סיכונים: זהה, הערך, טפל וניטר – בלופ מתמשך." },
      { time: 23, text: "📝 Incident Response Plan – תגובה מסודרת = נזק מינימלי." },
      { time: 29, text: "👤 Security Awareness Training – העובד הוא קו ההגנה הראשון." },
      { time: 35, text: "✅ מדיניות + תרבות + טכנולוגיה = אבטחה אמיתית." }
    ],
    slides: [
      {
        type: "title",
        title: "מדיניות אבטחת מידע וניהול סיכונים",
        subtitle: "ISO 27001, GDPR, ניהול סיכונים ותגובה לאירועים",
        icon: "📋",
        content: "",
        bullets: [],
        visual: `<div class="slide-title-visual">
          <svg viewBox="0 0 300 280" width="100%" height="100%">
            <text x="150" y="160" text-anchor="middle" font-size="80">📋</text>
            <circle cx="150" cy="140" r="110" fill="none" stroke="#90be6d" stroke-width="1.5" stroke-dasharray="6,4" opacity="0.4">
              <animateTransform attributeName="transform" type="rotate" from="0 150 140" to="360 150 140" dur="28s" repeatCount="indefinite"/>
            </circle>
          </svg>
        </div>`
      },
      {
        type: "content",
        title: "מסגרות אבטחת מידע ותקנות",
        content: "ארגונים מחויבים לפעול לפי מסגרות ותקנות אבטחה מוגדרות, בין אם מחוק ובין אם כ-Best Practice.",
        bullets: ["📜 ISO 27001 – תקן בינלאומי לניהול אבטחת מידע", "🇪🇺 GDPR – תקנת הגנת נתונים אירופאית (קנס עד 4% מהמחזור)", "💳 PCI-DSS – חובה לכל ארגון שמעבד תשלומי כרטיס", "🏛️ SOC 2 – תקן אמינות לשירותי SaaS"],
        visual: `<svg viewBox="0 0 300 250" width="100%" height="100%">
          <text x="150" y="18" text-anchor="middle" fill="#aaa" font-size="10">מסגרות אבטחה ורמת קנסות</text>
          <rect x="15" y="30" width="270" height="45" rx="8" fill="rgba(144,190,109,0.1)" stroke="#90be6d" stroke-width="1.5"/>
          <text x="35" y="50" fill="#90be6d" font-size="14">📜</text>
          <text x="55" y="50" fill="#fff" font-size="10" font-weight="700">ISO 27001</text>
          <text x="55" y="65" fill="#aaa" font-size="8">תקן בינלאומי – ניהול אבטחת מידע</text>
          <text x="260" y="50" fill="#90be6d" font-size="9">Best Practice</text>
          <rect x="15" y="85" width="270" height="45" rx="8" fill="rgba(0,119,181,0.1)" stroke="#0077b5" stroke-width="1.5"/>
          <text x="35" y="105" fill="#0077b5" font-size="14">🇪🇺</text>
          <text x="55" y="105" fill="#fff" font-size="10" font-weight="700">GDPR</text>
          <text x="55" y="120" fill="#aaa" font-size="8">הגנת נתונים אירופאית – קנס עד 20M€</text>
          <text x="260" y="105" fill="#f94144" font-size="9">חובה חוקית</text>
          <rect x="15" y="140" width="270" height="45" rx="8" fill="rgba(76,201,240,0.1)" stroke="#4cc9f0" stroke-width="1.5"/>
          <text x="35" y="160" fill="#4cc9f0" font-size="14">💳</text>
          <text x="55" y="160" fill="#fff" font-size="10" font-weight="700">PCI-DSS</text>
          <text x="55" y="175" fill="#aaa" font-size="8">תשלומי כרטיס – חובה לכל חנות מקוונת</text>
          <text x="260" y="160" fill="#f94144" font-size="9">חובה חוקית</text>
          <rect x="15" y="195" width="270" height="40" rx="8" fill="rgba(157,78,221,0.1)" stroke="#9d4edd" stroke-width="1.5"/>
          <text x="35" y="218" fill="#9d4edd" font-size="14">🏛️</text>
          <text x="55" y="218" fill="#fff" font-size="10" font-weight="700">SOC 2</text>
          <text x="55" y="230" fill="#aaa" font-size="8">אמינות שירותי ענן ו-SaaS</text>
          <text x="260" y="218" fill="#9d4edd" font-size="9">תקן אמינות</text>
        </svg>`
      },
      {
        type: "content",
        title: "מחזור ניהול סיכונים",
        content: "ניהול סיכונים הוא תהליך מחזורי ומתמשך – לא פעולה חד-פעמית. הוא מצריך זיהוי, הערכה, טיפול וניטור מתמשך.",
        bullets: ["🔍 זיהוי סיכונים – מה יכול להשתבש?", "📊 הערכת סיכונים – מה ההסתברות והנזק הצפוי?", "🔧 טיפול בסיכון – הפחתה, העברה (ביטוח), קבלה", "📡 ניטור – בדיקה מתמשכת של סיכונים חדשים"],
        visual: `<svg viewBox="0 0 300 260" width="100%" height="100%">
          <circle cx="150" cy="130" r="100" fill="none" stroke="#90be6d" stroke-width="1" stroke-dasharray="4,4" opacity="0.3"/>
          <circle cx="150" cy="30" r="30" fill="rgba(0,230,255,0.1)" stroke="#00e6ff" stroke-width="2"/>
          <text x="150" y="26" text-anchor="middle" fill="#00e6ff" font-size="9" font-weight="700">🔍 זיהוי</text>
          <text x="150" y="40" text-anchor="middle" fill="#aaa" font-size="7">Identify</text>
          <circle cx="248" cy="130" r="30" fill="rgba(255,183,3,0.1)" stroke="#ffb703" stroke-width="2"/>
          <text x="248" y="126" text-anchor="middle" fill="#ffb703" font-size="9" font-weight="700">📊 הערכה</text>
          <text x="248" y="140" text-anchor="middle" fill="#aaa" font-size="7">Assess</text>
          <circle cx="150" cy="228" r="30" fill="rgba(157,78,221,0.1)" stroke="#9d4edd" stroke-width="2"/>
          <text x="150" y="224" text-anchor="middle" fill="#9d4edd" font-size="9" font-weight="700">🔧 טיפול</text>
          <text x="150" y="238" text-anchor="middle" fill="#aaa" font-size="7">Treat</text>
          <circle cx="52" cy="130" r="30" fill="rgba(0,230,118,0.1)" stroke="#00e676" stroke-width="2"/>
          <text x="52" y="126" text-anchor="middle" fill="#00e676" font-size="9" font-weight="700">📡 ניטור</text>
          <text x="52" y="140" text-anchor="middle" fill="#aaa" font-size="7">Monitor</text>
          <path d="M 175 55 Q 230 80 222 100" fill="none" stroke="#ffb703" stroke-width="1.5" stroke-dasharray="3,3"/>
          <path d="M 235 160 Q 220 210 175 220" fill="none" stroke="#9d4edd" stroke-width="1.5" stroke-dasharray="3,3"/>
          <path d="M 120 220 Q 80 200 68 160" fill="none" stroke="#00e676" stroke-width="1.5" stroke-dasharray="3,3"/>
          <path d="M 65 100 Q 80 50 125 38" fill="none" stroke="#00e6ff" stroke-width="1.5" stroke-dasharray="3,3"/>
          <text x="150" y="134" text-anchor="middle" fill="#90be6d" font-size="10" font-weight="700">Risk Mgmt</text>
          <text x="150" y="148" text-anchor="middle" fill="#aaa" font-size="8">מחזור מתמשך</text>
        </svg>`
      },
      {
        type: "content",
        title: "Incident Response – תגובה לאירוע",
        content: "Incident Response Plan (IRP) הוא נוהל תגובה מסודר לאירועי אבטחה. ארגון שמכין אותו מראש מצמצם נזק ב-50% בממוצע.",
        bullets: ["1️⃣ Preparation – הכנה מראש ותרגול", "2️⃣ Identification – זיהוי וסיווג האירוע", "3️⃣ Containment – בידוד ועצירת ההתפשטות", "4️⃣ Eradication + Recovery + Lessons Learned"],
        visual: `<svg viewBox="0 0 300 240" width="100%" height="100%">
          <defs><marker id="arrr" markerWidth="5" markerHeight="5" refX="2.5" refY="2.5" orient="auto"><path d="M0,0 L5,2.5 L0,5 Z" fill="#90be6d"/></marker></defs>
          <text x="150" y="18" text-anchor="middle" fill="#aaa" font-size="10">שלבי Incident Response</text>
          <rect x="15" y="30" width="270" height="30" rx="6" fill="rgba(0,230,255,0.1)" stroke="#00e6ff" stroke-width="1.2"/>
          <text x="28" y="50" fill="#00e6ff" font-size="12">1️⃣</text>
          <text x="50" y="50" fill="#fff" font-size="10" font-weight="700">Preparation – הכנת הנוהל מראש</text>
          <line x1="150" y1="60" x2="150" y2="75" stroke="#90be6d" stroke-width="1.5" marker-end="url(#arrr)"/>
          <rect x="15" y="77" width="270" height="30" rx="6" fill="rgba(255,183,3,0.1)" stroke="#ffb703" stroke-width="1.2"/>
          <text x="28" y="97" fill="#ffb703" font-size="12">2️⃣</text>
          <text x="50" y="97" fill="#fff" font-size="10" font-weight="700">Identification – זיהוי האירוע</text>
          <line x1="150" y1="107" x2="150" y2="122" stroke="#90be6d" stroke-width="1.5" marker-end="url(#arrr)"/>
          <rect x="15" y="124" width="270" height="30" rx="6" fill="rgba(249,65,68,0.1)" stroke="#f94144" stroke-width="1.2"/>
          <text x="28" y="144" fill="#f94144" font-size="12">3️⃣</text>
          <text x="50" y="144" fill="#fff" font-size="10" font-weight="700">Containment – בידוד ועצירה</text>
          <line x1="150" y1="154" x2="150" y2="169" stroke="#90be6d" stroke-width="1.5" marker-end="url(#arrr)"/>
          <rect x="15" y="171" width="270" height="30" rx="6" fill="rgba(0,230,118,0.1)" stroke="#00e676" stroke-width="1.2"/>
          <text x="28" y="191" fill="#00e676" font-size="12">4️⃣</text>
          <text x="50" y="191" fill="#fff" font-size="10" font-weight="700">Recovery + Lessons Learned</text>
        </svg>`
      },
      {
        type: "summary",
        title: "3 דברים שצריך לזכור 🎯",
        content: "עקרונות ניהול אבטחת המידע הארגונית.",
        bullets: ["📜 מדיניות ברורה + הכשרה = תרבות אבטחה", "🔄 ניהול סיכונים הוא מחזור מתמשך – לא פעולה חד-פעמית", "📋 Incident Response Plan – הכן אותו לפני שיצטרכו!"],
        visual: `<div style="display:flex; flex-direction:column; gap:12px; width:100%;">
          <div style="background:rgba(144,190,109,0.08); border:1px solid rgba(144,190,109,0.3); border-radius:10px; padding:16px; display:flex; align-items:center; gap:12px;">
            <span style="font-size:2rem;">📜</span>
            <div><div style="font-weight:700; color:#90be6d;">מדיניות + הכשרה</div><div style="font-size:0.8rem; color:#aaa;">תרבות אבטחה = ההגנה הטובה ביותר</div></div>
          </div>
          <div style="background:rgba(0,230,255,0.08); border:1px solid rgba(0,230,255,0.3); border-radius:10px; padding:16px; display:flex; align-items:center; gap:12px;">
            <span style="font-size:2rem;">🔄</span>
            <div><div style="font-weight:700; color:#00e6ff;">ניהול סיכונים</div><div style="font-size:0.8rem; color:#aaa;">מחזור מתמשך של זיהוי, הערכה, טיפול</div></div>
          </div>
          <div style="background:rgba(255,183,3,0.08); border:1px solid rgba(255,183,3,0.3); border-radius:10px; padding:16px; display:flex; align-items:center; gap:12px;">
            <span style="font-size:2rem;">📋</span>
            <div><div style="font-weight:700; color:#ffb703;">IR Plan מוכן</div><div style="font-size:0.8rem; color:#aaa;">הכן לפני שיצטרכו – לא אחרי!</div></div>
          </div>
        </div>`
      }
    ],
    quiz: []
  }

};
