const BASE_URL = import.meta.env.BASE_URL;
const material = (id, title, category, summary, pages) => ({
  id,
  title,
  category,
  type: 'חומר לימודי',
  summary,
  pages,
  url: `${BASE_URL}docs/${id}.pdf`,
  thumbnail: `${BASE_URL}docs/thumbnails/${id}.png`
});

export const knowledgeDocuments = [
  material('cyber-defense-management', 'ניהול הגנת סייבר בארגון', 'ניהול סייבר', 'עקרונות ניהול מערך הגנת הסייבר, ממשל ארגוני, אחריות מנהלים ותפקיד ה-CISO.', 20),
  material('infosec-organization', 'מבנה ותפקידי גוף אבטחת המידע', 'INFOSEC', 'מבנה מקצועי של גוף אבטחת מידע, תחומי אחריות, ממשקים ותפקידי מפתח.', 25),
  material('cyber-threats-and-infosec', 'מפת איומי הסייבר ומבנה ארגוני INFOSEC', 'איומים', 'סוגי איומים, גורמי תקיפה, נכסים ארגוניים והתאמת מבנה ההגנה לאיום.', 28),
  material('zero-trust', 'ארכיטקטורת Zero Trust', 'ארכיטקטורה', 'עקרונות אפס אמון, אימות מתמשך, הרשאה מינימלית וסגמנטציה.', 21),
  material('risk-management-foundations', 'יסודות ניהול סיכוני סייבר', 'ניהול סיכונים', 'זיהוי נכסים, איומים וחולשות, הערכת הסתברות והשפעה ותעדוף סיכונים.', 19),
  material('risk-management-methodologies', 'מתודולוגיות לניהול סיכוני סייבר', 'ניהול סיכונים', 'מסגרות עבודה, מדדי סיכון, תוכניות טיפול ומעקב אחר סיכונים ארגוניים.', 30),
  material('cyber-intelligence-mitre-attack', 'מודיעין סייבר ומודל MITRE ATT&CK', 'מודיעין סייבר', 'מחזור מודיעין, טקטיקות וטכניקות תקיפה ומיפוי הגנות באמצעות MITRE ATT&CK.', 26),
  material('supply-chain-security-foundations', 'הגנת סייבר בשרשרת האספקה', 'שרשרת אספקה', 'סיכוני צד שלישי, ספקים, תלות טכנולוגית ובקרות להגנת שרשרת האספקה.', 25),
  material('supply-chain-risk-management', 'ניהול סיכוני שרשרת האספקה', 'שרשרת אספקה', 'בדיקת ספקים, דרישות חוזיות, ניטור מתמשך ותגובה לאירוע אצל צד שלישי.', 31),
  material('xdr-edr-solutions', 'פתרונות XDR ו-EDR להגנת הארגון', 'טכנולוגיות הגנה', 'יכולות זיהוי ותגובה בתחנות קצה, קורלציה בין מקורות וניהול אירועים.', 28),
  material('cyber-mission-control', 'Modern Cyber Mission Control', 'מרכז הגנה', 'בניית מרכז שליטה מודרני, תמונת מצב, תהליכי SOC וקבלת החלטות בזמן אמת.', 32),
  material('business-continuity', 'המשכיות עסקית והתאוששות מאסון', 'BCP ו-DRP', 'ניתוח השפעה עסקית, יעדי התאוששות ותכנון המשכיות תפעולית בזמן משבר.', 36),
  material('cyber-budget-planning', 'תכנון תקציב להגנת סייבר והמשכיות עסקית', 'תקציב וממשל', 'בניית תקציב מבוסס סיכון, תעדוף השקעות והצגת ערך להנהלה.', 20)
];
