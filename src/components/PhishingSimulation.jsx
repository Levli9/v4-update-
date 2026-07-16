import React, { useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, Circle, Flag, Mail, Paperclip, RotateCcw, ShieldCheck } from 'lucide-react';

const warningSigns = {
  sender: 'כתובת השולח מחקה את שם החברה, אך משתמשת בספרה 1 במקום באות l.',
  urgency: 'הודעה שמאיימת בחסימה מיידית מנסה לגרום לך לפעול לפני שתבדוק.',
  details: 'ארגון אמין לא יבקש סיסמה או פרטי אשראי מלאים באמצעות הודעת דוא״ל.',
  link: 'הכתובת שאליה הקישור מוביל אינה הדומיין הרשמי של החברה.',
  attachment: 'קובץ ZIP בלתי צפוי עלול להכיל תוכנה זדונית ואין לפתוח אותו.'
};

const Hotspot = ({ id, selected, onToggle, children, className = '' }) => (
  <button
    type="button"
    onClick={() => onToggle(id)}
    aria-pressed={selected}
    className={`group relative rounded-lg border px-2 py-1 text-right transition-all ${
      selected
        ? 'border-amber-400/65 bg-amber-400/15 text-amber-200 shadow-[0_0_0_2px_rgba(251,191,36,0.08)]'
        : 'border-transparent hover:border-amber-400/35 hover:bg-amber-400/5'
    } ${className}`}
  >
    {children}
    {selected && <span className="absolute -left-2 -top-2 grid h-5 w-5 place-items-center rounded-full bg-amber-400 text-[10px] font-black text-black">✓</span>}
  </button>
);

export default function PhishingSimulation({ onComplete }) {
  const [selected, setSelected] = useState([]);
  const [checked, setChecked] = useState(false);
  const [completed, setCompleted] = useState(false);

  const total = Object.keys(warningSigns).length;
  const selectedCount = selected.length;
  const allFound = selectedCount === total;
  const currentExplanation = selected.length ? warningSigns[selected[selected.length - 1]] : null;

  const progress = useMemo(() => Math.round((selectedCount / total) * 100), [selectedCount, total]);

  const toggle = (id) => {
    if (completed) return;
    setChecked(false);
    setSelected((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  };

  const verify = () => {
    setChecked(true);
    if (allFound) {
      setCompleted(true);
      onComplete?.();
    }
  };

  const reset = () => {
    setSelected([]);
    setChecked(false);
    setCompleted(false);
  };

  return (
    <div className="overflow-hidden rounded-3xl border border-gray-800 bg-[#090c14] shadow-2xl">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-800 bg-gray-900/65 px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl border border-amber-400/25 bg-amber-400/10 text-amber-400"><Mail size={20} /></span>
          <div>
            <h3 className="font-extrabold text-white">זיהוי מייל פישינג</h3>
            <p className="mt-0.5 text-[11px] font-semibold text-gray-500">סמן בתוך ההודעה את כל סימני האזהרה</p>
          </div>
        </div>
        <button type="button" onClick={reset} className="flex items-center gap-2 rounded-xl border border-gray-800 px-3 py-2 text-xs font-bold text-gray-400 transition-colors hover:text-white">
          <RotateCcw size={14} /> התחלה מחדש
        </button>
      </header>

      <div className="grid gap-5 p-5 lg:grid-cols-[0.72fr_1.28fr]">
        <aside className="order-2 space-y-4 rounded-2xl border border-gray-800 bg-gray-900/40 p-5 lg:order-1">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">המשימה שלך</span>
            <p className="mt-2 text-sm font-bold leading-relaxed text-gray-200">קיבלת הודעה שנראית כאילו נשלחה ממחלקת הכספים. מצא את חמשת הסימנים שמעידים שזו הונאה.</p>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between text-[11px] font-bold">
              <span className="text-gray-400">נמצאו {selectedCount} מתוך {total}</span>
              <span className="text-amber-400">{progress}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-gray-800"><div className="h-full rounded-full bg-amber-400 transition-all" style={{ width: `${progress}%` }} /></div>
          </div>

          <ul className="space-y-2 text-xs font-semibold">
            {Object.entries(warningSigns).map(([key, explanation]) => (
              <li key={key} className={`flex items-start gap-2 rounded-lg border p-2.5 ${selected.includes(key) ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-300' : 'border-gray-800 text-gray-500'}`}>
                {selected.includes(key) ? <CheckCircle2 size={16} className="mt-0.5 shrink-0" /> : <Circle size={16} className="mt-0.5 shrink-0" />}
                <span>{selected.includes(key) ? explanation : 'סימן אזהרה שטרם זוהה'}</span>
              </li>
            ))}
          </ul>

          {currentExplanation && <div className="rounded-xl border border-cyan-500/15 bg-cyan-500/5 p-3 text-[11px] leading-relaxed text-cyan-200"><strong>למה זה חשוד?</strong><br />{currentExplanation}</div>}
        </aside>

        <section className="order-1 overflow-hidden rounded-2xl border border-gray-700 bg-[#f6f8fb] text-slate-800 shadow-xl lg:order-2" aria-label="הודעת דוא״ל חשודה">
          <div className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-3">
            <div className="flex items-center gap-2 text-sm font-black"><Mail size={18} className="text-blue-600" /> תיבת דואר נכנס</div>
            <span className="rounded-full bg-rose-50 px-2.5 py-1 text-[10px] font-bold text-rose-600">הודעה חיצונית</span>
          </div>
          <div className="space-y-4 p-5 text-right">
            <div className="space-y-1 border-b border-slate-200 pb-4 text-xs">
              <div className="flex flex-wrap items-center gap-2"><strong>מאת:</strong><Hotspot id="sender" selected={selected.includes('sender')} onToggle={toggle}><span dir="ltr">Finance Team &lt;billing@shieldx-finance.co&gt;</span></Hotspot></div>
              <div className="flex flex-wrap items-center gap-2"><strong>אל:</strong><span dir="ltr">Lev123@shieldx.co.il</span></div>
              <div className="flex flex-wrap items-center gap-2"><strong>נושא:</strong><Hotspot id="urgency" selected={selected.includes('urgency')} onToggle={toggle} className="font-black text-rose-700">דחוף ביותר: חשבונך ייחסם בעוד 30 דקות</Hotspot></div>
            </div>

            <div className="space-y-4 text-sm leading-7">
              <p>שלום,</p>
              <p>בבדיקה האחרונה זוהתה בעיית אבטחה בחשבון העובד שלך.</p>
              <Hotspot id="details" selected={selected.includes('details')} onToggle={toggle} className="block w-full bg-rose-50/60">
                כדי למנוע חסימה, יש להזין מיד את שם המשתמש, הסיסמה ופרטי כרטיס האשראי לצורך אימות זהות.
              </Hotspot>
              <div className="text-center">
                <Hotspot id="link" selected={selected.includes('link')} onToggle={toggle} className="inline-flex flex-col items-center bg-blue-600 px-6 py-2.5 font-black text-white hover:bg-blue-700">
                  <span>אימות החשבון עכשיו</span>
                  <span dir="ltr" className="mt-1 text-[9px] font-normal text-blue-100">shieldx-security-check.web-login.co</span>
                </Hotspot>
              </div>
              <Hotspot id="attachment" selected={selected.includes('attachment')} onToggle={toggle} className="flex w-full items-center gap-3 border-slate-200 bg-white p-3 shadow-sm">
                <Paperclip size={20} className="text-slate-500" />
                <span><strong dir="ltr">Security_Update.zip</strong><small className="mt-0.5 block text-slate-500">קובץ מצורף · 2.4MB</small></span>
              </Hotspot>
              <p className="text-slate-500">בברכה,<br />צוות הכספים והאבטחה</p>
            </div>
          </div>
        </section>
      </div>

      <footer className="border-t border-gray-800 bg-gray-950/55 p-5">
        {completed ? (
          <div className="flex items-center justify-center gap-3 rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-4 text-sm font-black text-emerald-300"><ShieldCheck size={22} /> מצוין! זיהית את כל הסכנות והודעת הפישינג דווחה.</div>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className={`flex items-center gap-2 text-xs font-bold ${checked ? 'text-amber-300' : 'text-gray-500'}`}>{checked && <AlertTriangle size={16} />} {checked ? `נשארו עוד ${total - selectedCount} סימנים. בדוק את כל חלקי המייל.` : 'לחץ על פרטים חשודים בתוך המייל ואז בדוק את הפתרון.'}</p>
            <button type="button" onClick={verify} disabled={selectedCount === 0} className="flex items-center gap-2 rounded-xl bg-amber-400 px-5 py-3 text-xs font-black text-black transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-40"><Flag size={15} /> בדיקת הסימונים</button>
          </div>
        )}
      </footer>
    </div>
  );
}
