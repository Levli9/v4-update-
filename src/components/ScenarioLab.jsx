import React, { useState } from 'react';
import { CheckCircle2, Circle, RotateCcw, ShieldCheck, Target } from 'lucide-react';

export default function ScenarioLab({ scenario, color = '#00e6ff', onComplete }) {
  const [selected, setSelected] = useState(null);
  const [checked, setChecked] = useState(false);
  const isCorrect = checked && selected === scenario.correctIndex;

  const verify = () => {
    if (selected === null) return;
    setChecked(true);
    if (selected === scenario.correctIndex) onComplete?.();
  };

  const reset = () => {
    setSelected(null);
    setChecked(false);
  };

  return (
    <div className="overflow-hidden rounded-3xl border border-gray-800 bg-[#090c14] shadow-2xl">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-800 bg-gray-900/65 px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl border bg-gray-950/55" style={{ color, borderColor: `${color}45`, backgroundColor: `${color}12` }}><Target size={21} /></span>
          <div>
            <h3 className="font-extrabold text-white">{scenario.title}</h3>
            <p className="mt-0.5 text-[11px] font-semibold text-gray-500">תרחיש החלטה מעשי · בחר את התגובה הבטוחה ביותר</p>
          </div>
        </div>
        <button type="button" onClick={reset} className="flex items-center gap-2 rounded-xl border border-gray-800 px-3 py-2 text-xs font-bold text-gray-400 transition-colors hover:text-white"><RotateCcw size={14} /> התחלה מחדש</button>
      </header>

      <div className="grid gap-5 p-5 lg:grid-cols-[0.7fr_1.3fr]">
        <aside className="order-2 rounded-2xl border border-gray-800 bg-gray-950/45 p-5 lg:order-1">
          <span className="text-[10px] font-black uppercase tracking-wider" style={{ color }}>עקרונות מפתח</span>
          <ul className="mt-4 space-y-3">
            {scenario.principles.map((principle, index) => (
              <li key={principle} className="flex items-center gap-2.5 rounded-xl border border-gray-800 bg-gray-900/50 p-3 text-xs font-bold text-gray-300">
                <span className="grid h-6 w-6 place-items-center rounded-lg text-[10px] font-black" style={{ color, backgroundColor: `${color}14` }}>{index + 1}</span>
                {principle}
              </li>
            ))}
          </ul>
          <div className="mt-5 rounded-xl border border-gray-800 bg-gray-900/40 p-3 text-[11px] leading-relaxed text-gray-500">המטרה היא לבחור פעולה שמצמצמת נזק, שומרת ראיות ומערבת את הגורם הארגוני המתאים.</div>
        </aside>

        <section className="order-1 rounded-2xl border border-gray-800 bg-gray-900/35 p-5 sm:p-6 lg:order-2">
          <div className="rounded-2xl border p-4 text-sm font-bold leading-7 text-gray-100" style={{ borderColor: `${color}2f`, backgroundColor: `${color}0d` }}>{scenario.prompt}</div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {scenario.options.map((option, index) => {
              const selectedOption = selected === index;
              const optionIsCorrect = checked && index === scenario.correctIndex;
              const optionIsWrong = checked && selectedOption && index !== scenario.correctIndex;
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => { setSelected(index); setChecked(false); }}
                  className={`flex min-h-20 items-start gap-3 rounded-2xl border p-4 text-right text-xs font-bold leading-relaxed transition-all ${optionIsCorrect ? 'border-emerald-500/45 bg-emerald-500/10 text-emerald-200' : optionIsWrong ? 'border-rose-500/45 bg-rose-500/10 text-rose-200' : selectedOption ? 'text-white' : 'border-gray-800 bg-gray-950/45 text-gray-400 hover:border-gray-700 hover:text-white'}`}
                  style={selectedOption && !checked ? { borderColor: `${color}78`, backgroundColor: `${color}12` } : undefined}
                >
                  {optionIsCorrect ? <CheckCircle2 size={18} className="mt-0.5 shrink-0" /> : <Circle size={18} className="mt-0.5 shrink-0" />}
                  <span>{option}</span>
                </button>
              );
            })}
          </div>

          {checked && (
            <div className={`mt-5 rounded-xl border p-4 text-xs font-bold leading-relaxed ${isCorrect ? 'border-emerald-500/25 bg-emerald-500/10 text-emerald-300' : 'border-rose-500/25 bg-rose-500/10 text-rose-300'}`}>
              {isCorrect ? <span className="flex items-center gap-2"><ShieldCheck size={18} /> מצוין. {scenario.feedback}</span> : `לא בדיוק. נסה שוב וחפש את הפעולה שמצמצמת את הסיכון באופן מיידי.`}
            </div>
          )}

          <div className="mt-5 flex justify-end">
            <button type="button" onClick={verify} disabled={selected === null || isCorrect} className="rounded-xl px-6 py-3 text-xs font-black text-black transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40" style={{ backgroundColor: color }}>בדיקת ההחלטה</button>
          </div>
        </section>
      </div>
    </div>
  );
}

