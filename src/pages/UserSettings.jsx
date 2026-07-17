import React from 'react';
import { Award, Download } from 'lucide-react';
import { useApp } from '../context/AppContext';
import BackButton from '../components/BackButton';
import LearningTimeline from '../components/LearningTimeline';

const validatePassword = (password) => {
  if (password.length < 12) return 'הסיסמה החדשה חייבת להכיל לפחות 12 תווים.';
  if (!/[A-Z]/.test(password)) return 'הסיסמה חייבת להכיל אות גדולה באנגלית.';
  if (!/[a-z]/.test(password)) return 'הסיסמה חייבת להכיל אות קטנה באנגלית.';
  if (!/[0-9]/.test(password)) return 'הסיסמה חייבת להכיל לפחות ספרה אחת.';
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return 'הסיסמה חייבת להכיל תו מיוחד.';
  return '';
};

export default function UserSettings() {
  const { currentUser, setActiveViewRole } = useApp();

  const downloadCertificate = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1920;
    canvas.height = 1080;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 1. Background Gradient (cyber dark blue/black)
    const bgGrad = ctx.createRadialGradient(960, 540, 50, 960, 540, 1100);
    bgGrad.addColorStop(0, '#0d1321');
    bgGrad.addColorStop(1, '#05070a');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 1920, 1080);

    // 2. Futuristic grid lines
    ctx.strokeStyle = 'rgba(0, 230, 255, 0.04)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 1920; i += 40) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, 1080);
      ctx.stroke();
    }
    for (let j = 0; j < 1080; j += 40) {
      ctx.beginPath();
      ctx.moveTo(0, j);
      ctx.lineTo(1920, j);
      ctx.stroke();
    }

    // 3. Cybernetic outer borders
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 4;
    ctx.strokeRect(60, 60, 1800, 960);

    ctx.strokeStyle = 'rgba(0, 230, 255, 0.3)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(75, 75, 1770, 930);

    // Draw tech corner brackets
    ctx.fillStyle = '#00e6ff';
    // Top-left
    ctx.fillRect(50, 50, 60, 8);
    ctx.fillRect(50, 50, 8, 60);
    // Top-right
    ctx.fillRect(1810, 50, 60, 8);
    ctx.fillRect(1862, 50, 8, 60);
    // Bottom-left
    ctx.fillRect(50, 1022, 60, 8);
    ctx.fillRect(50, 970, 8, 60);
    // Bottom-right
    ctx.fillRect(1810, 1022, 60, 8);
    ctx.fillRect(1862, 970, 8, 60);

    // 4. Header: ShieldX Academy
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    ctx.fillStyle = '#00e6ff';
    ctx.font = 'bold 42px monospace';
    ctx.fillText('SHIELDX ACADEMY', 960, 180);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText('CYBERSECURITY EXCELLENCE', 960, 235);

    // Separator line
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.4)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(800, 275);
    ctx.lineTo(1120, 275);
    ctx.stroke();

    // 5. Title: CERTIFICATE OF COMPLETION
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 68px sans-serif';
    ctx.fillText('SHIELDX CERTIFIED', 960, 370);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.font = '20px sans-serif';
    ctx.fillText('תעודה זו מוענקת בזאת ל:', 960, 460);

    // 6. User Name (Big and Glowing)
    ctx.fillStyle = '#00e6ff';
    ctx.font = '900 78px sans-serif';
    ctx.fillText(currentUser.username, 960, 545);

    // 7. Achievement text
    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.font = '24px sans-serif';
    ctx.fillText('על השלמה מלאה של מסלול ההכשרה באבטחת מידע וסייבר,', 960, 650);
    ctx.fillText('מעבר בהצלחה של כלל המעבדות המעשיות, מבדקי הידע השוטפים,', 960, 695);
    ctx.fillText('ומבחן ההסמכה המסכם של מערכת ShieldX.', 960, 740);

    // 8. Bottom Meta Fields (Date & Certificate ID)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(400, 810);
    ctx.lineTo(1520, 810);
    ctx.stroke();

    const formattedDate = new Intl.DateTimeFormat('he-IL', { dateStyle: 'long' }).format(new Date(currentUser.progress.finalExam.passedAt));
    const certId = `SX-${currentUser.username.substring(0, 3).toUpperCase()}-${Math.round(new Date(currentUser.progress.finalExam.passedAt).getTime() / 100000)}`;

    // Left Column: Date
    ctx.textAlign = 'right';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText('תאריך הסמכה', 700, 860);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText(formattedDate, 700, 905);

    // Right Column: ID
    ctx.textAlign = 'left';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText('מזהה תעודה', 1220, 860);
    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 22px monospace';
    ctx.fillText(certId, 1220, 905);

    // 9. Auth badge at absolute bottom
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText('🛡️ אבטחת מידע מאושרת על ידי הנהלת ShieldX', 960, 990);

    // 10. Generate Download Link
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `ShieldX-Certificate-${currentUser.username}.png`;
    link.href = dataUrl;
    link.click();
  };

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">הסמכות ותעודות</h1>
          <p className="mt-1 text-xs font-semibold text-gray-500">צפייה בסטטוס ההסמכה, תעודות רשמיות וציר הזמן הלימודי שלך</p>
        </div>
        <BackButton onClick={() => setActiveViewRole('employee')} />
      </div>

      <div className="overflow-hidden rounded-3xl border border-gray-800 bg-gray-900/45 shadow-2xl p-6 sm:p-8 space-y-7">
        
        {/* Certification Status Box */}
        <div className={`rounded-2xl border p-5 ${
          currentUser.progress?.finalExam?.passed 
            ? 'border-emerald-500/20 bg-emerald-500/5' 
            : currentUser.progress?.finalExam 
            ? 'border-rose-500/20 bg-rose-500/5' 
            : 'border-gray-800 bg-gray-950/35'
        }`}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="flex items-center gap-3">
              <span className={`grid h-10 w-10 place-items-center rounded-xl ${
                currentUser.progress?.finalExam?.passed ? 'bg-emerald-500/10 text-emerald-400' : 'bg-gray-900 text-gray-600'
              }`}>
                <Award size={20} />
              </span>
              <span>
                <strong className="block text-sm text-white">סטטוס הסמכה</strong>
                <small className="mt-1 block text-[10px] font-bold text-gray-500">
                  {currentUser.progress?.finalExam?.passed 
                    ? `תאריך מעבר: ${new Intl.DateTimeFormat('he-IL', { dateStyle: 'short' }).format(new Date(currentUser.progress.finalExam.passedAt))}` 
                    : 'יש לעבור את המבחן המסכם בציון 80 ומעלה'}
                </small>
              </span>
            </span>
            <span className={`rounded-full px-3 py-1.5 text-xs font-black ${
              currentUser.progress?.finalExam?.passed 
                ? 'bg-emerald-500/10 text-emerald-400' 
                : currentUser.progress?.finalExam 
                ? 'bg-rose-500/10 text-rose-400' 
                : 'bg-gray-800 text-gray-500'
            }`}>
              {currentUser.progress?.finalExam?.passed ? '🟢 מוסמך (Certified)' : currentUser.progress?.finalExam ? '🔴 לא מוסמך' : '⚪ טרם ניגש'}
            </span>
          </div>
          
          {currentUser.progress?.finalExam && (
            <div className="mt-4 grid grid-cols-2 gap-3 border-t border-white/5 pt-4 text-center text-xs">
              <span>
                <strong className="block text-lg text-white">{currentUser.progress.finalExam.lastScore}</strong>
                <small className="text-gray-600">ציון אחרון</small>
              </span>
              <span>
                <strong className="block text-lg text-white">{currentUser.progress.finalExam.attempts}</strong>
                <small className="text-gray-600">ניסיונות</small>
              </span>
            </div>
          )}
        </div>

        {/* Official Cyber Certificate Component */}
        {currentUser.progress?.finalExam?.passed && (
          <div className="space-y-4">
            <div className="relative overflow-hidden rounded-3xl border-2 border-emerald-500/35 bg-[#06080e] p-6 sm:p-10 text-center shadow-[0_0_50px_rgba(16,185,129,0.08)] bg-[linear-gradient(rgba(0,230,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(0,230,255,0.015)_1px,transparent_1px)] bg-[size:30px_30px]">
              
              {/* Corner Sci-fi decorative borders */}
              <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-[#00e6ff] rounded-tl-md pointer-events-none" />
              <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-[#00e6ff] rounded-tr-md pointer-events-none" />
              <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-[#00e6ff] rounded-bl-md pointer-events-none" />
              <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-[#00e6ff] rounded-br-md pointer-events-none" />

              {/* Decorative side ticks */}
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-12 bg-emerald-500/30 rounded-r" />
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-12 bg-emerald-500/30 rounded-l" />

              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,230,255,0.03),transparent_75%)] pointer-events-none" />
              
              <div className="border border-emerald-500/10 rounded-2xl p-6 sm:p-8 relative z-10 bg-gray-950/20 backdrop-blur-xs">
                
                <div className="flex justify-between items-center text-[8px] font-mono text-gray-600 mb-4 px-2">
                  <span>SECURED LEVEL // SX-SEC-01</span>
                  <span>VERIFIED STATUS // OK</span>
                </div>

                <div className="mx-auto w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/20 mb-6">
                  <Award size={36} className="text-emerald-400 animate-pulse" />
                </div>
                
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#00e6ff]">תעודת הסמכה רשמית</p>
                <h2 className="text-2xl sm:text-3xl font-black text-white mt-2 mb-6 tracking-wide drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]">SHIELDX CERTIFIED</h2>
                
                <p className="text-xs text-gray-500 font-semibold">תעודה זו מוענקת בזאת ל:</p>
                <h3 className="text-2xl sm:text-3xl font-black text-[#00e6ff] my-4 tracking-wider drop-shadow-[0_0_15px_rgba(0,230,255,0.15)]">{currentUser.username}</h3>
                
                <p className="text-xs text-gray-400 max-w-md mx-auto leading-relaxed font-medium">
                  על השלמה מלאה של מסלול ההכשרה באבטחת מידע וסייבר, מעבר בהצלחה של כלל המעבדות המעשיות, מבדקי הידע השוטפים, ומבחן ההסמכה המסכם של מערכת <strong className="text-white">ShieldX</strong>.
                </p>
                
                <div className="mt-8 grid grid-cols-2 gap-6 border-t border-gray-800 pt-6 text-right max-w-xs mx-auto">
                  <div>
                    <span className="text-[9px] text-gray-600 block font-bold">תאריך הסמכה</span>
                    <strong className="text-[11px] text-gray-300">
                      {new Intl.DateTimeFormat('he-IL', { dateStyle: 'long' }).format(new Date(currentUser.progress.finalExam.passedAt))}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[9px] text-gray-600 block font-bold">מזהה תעודה</span>
                    <strong className="text-[11px] font-mono text-emerald-400 uppercase">
                      SX-{currentUser.username.substring(0, 3).toUpperCase()}-{Math.round(new Date(currentUser.progress.finalExam.passedAt).getTime() / 100000)}
                    </strong>
                  </div>
                </div>
                
                <div className="mt-8 flex justify-center items-center gap-2 text-[9px] text-gray-600 font-bold">
                  🛡️ אבטחת מידע מאושרת על ידי הנהלת ShieldX
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex justify-center">
              <button 
                type="button" 
                onClick={downloadCertificate}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-l from-emerald-500 to-teal-500 px-6 py-3 text-xs font-black text-[#001008] shadow-lg shadow-emerald-950/20 transition hover:brightness-110"
              >
                <Download size={16} />
                הורדת התעודה למחשב (PNG)
              </button>
            </div>
          </div>
        )}

        {/* Learning Timeline */}
        <div className="border-t border-gray-800 pt-7">
          <h3 className="mb-4 text-sm font-black text-white">ציר הזמן הלימודי שלי</h3>
          <LearningTimeline user={currentUser} />
        </div>

      </div>
    </div>
  );
}
