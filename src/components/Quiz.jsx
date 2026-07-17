import React, { useState } from 'react';
import { ArrowDown, ArrowRight, ArrowUp, Braces, CheckCircle2, GripVertical, Link2, Puzzle, RotateCcw, Sparkles } from 'lucide-react';

const shuffle = (items) => [...items].sort(() => Math.random() - 0.5);

const pickQuestions = (pool, count) => {
  const interactive = pool.filter((question) => question.type && question.type !== 'multipleChoice');
  const multipleChoice = pool.filter((question) => !question.type || question.type === 'multipleChoice');
  return shuffle([
    ...interactive.slice(0, Math.min(interactive.length, count)),
    ...shuffle(multipleChoice).slice(0, Math.max(0, count - interactive.length))
  ]).slice(0, count);
};

const initialAnswer = (question) => {
  if (!question) return null;
  if (question.type === 'order') return shuffle(question.items);
  if (question.type === 'match' || question.type === 'dragDrop') return {};
  if (question.type === 'fillBlank' || question.type === 'codeChallenge') return '';
  return null;
};

const normalize = (value) => String(value ?? '').trim().toLowerCase().replace(/[־–—-]/g, ' ').replace(/\s+/g, ' ');

export default function Quiz({ questions, onQuizComplete, onQuestionAnswered, targetCount = 10, adaptiveLabel = 'מסלול רגיל' }) {
  const [activeQuestions, setActiveQuestions] = useState(() => pickQuestions(questions || [], Math.min(targetCount, questions?.length || 0)));
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answer, setAnswer] = useState(() => initialAnswer(activeQuestions[0]));
  const [isAnswered, setIsAnswered] = useState(false);
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [draggedItem, setDraggedItem] = useState(null);
  const [responses, setResponses] = useState({});

  if (!questions || questions.length === 0 || activeQuestions.length === 0) {
    return <div className="py-8 text-center text-gray-400">לא הוגדרו שאלות מבדק לנושא זה עדיין.</div>;
  }

  const currentQuestion = activeQuestions[currentIdx];

  const isCorrectAnswer = () => {
    switch (currentQuestion.type) {
      case 'fillBlank':
        return currentQuestion.acceptedAnswers.some((accepted) => normalize(answer).includes(normalize(accepted)));
      case 'match':
        return currentQuestion.pairs.every(([left, right]) => answer[left] === right);
      case 'order':
        return currentQuestion.items.every((item, index) => answer[index] === item);
      case 'dragDrop':
        return Object.entries(currentQuestion.categories).every(([category, items]) => items.every((item) => answer[item] === category));
      case 'codeChallenge':
        return currentQuestion.expectedTokens.every((token) => normalize(answer).includes(normalize(token)));
      default:
        return answer === currentQuestion.answer;
    }
  };

  const canSubmit = (() => {
    if (currentQuestion.type === 'match') return Object.keys(answer).length === currentQuestion.pairs.length;
    if (currentQuestion.type === 'dragDrop') return Object.keys(answer).length === Object.values(currentQuestion.categories).flat().length;
    if (currentQuestion.type === 'fillBlank' || currentQuestion.type === 'codeChallenge') return answer.trim().length > 0;
    if (currentQuestion.type === 'order') return answer.length === currentQuestion.items.length;
    return answer !== null;
  })();

  const checkAnswer = () => {
    const correct = isCorrectAnswer();
    setLastAnswerCorrect(correct);
    if (correct) setCorrectAnswers((value) => value + 1);
    setIsAnswered(true);
    setResponses((current) => ({ ...current, [currentIdx]: { answer, isAnswered: true, correct } }));
    onQuestionAnswered?.(currentIdx, correct, currentQuestion);
  };

  const openQuestion = (questionIndex) => {
    const saved = responses[questionIndex];
    setCurrentIdx(questionIndex);
    setAnswer(saved?.answer ?? initialAnswer(activeQuestions[questionIndex]));
    setIsAnswered(Boolean(saved?.isAnswered));
    setLastAnswerCorrect(Boolean(saved?.correct));
    setDraggedItem(null);
  };

  const proceedToNext = () => {
    if (currentIdx < activeQuestions.length - 1) {
      openQuestion(currentIdx + 1);
      return;
    }
    const finalScore = Math.round((correctAnswers / activeQuestions.length) * 100);
    setShowResults(true);
    onQuizComplete?.(finalScore);
  };

  const retry = () => {
    const retryCount = Math.min(correctAnswers / activeQuestions.length < 0.8 ? 12 : targetCount, questions.length);
    const nextQuestions = pickQuestions(questions, retryCount);
    setActiveQuestions(nextQuestions);
    setCurrentIdx(0);
    setAnswer(initialAnswer(nextQuestions[0]));
    setIsAnswered(false);
    setLastAnswerCorrect(false);
    setCorrectAnswers(0);
    setShowResults(false);
    setDraggedItem(null);
    setResponses({});
  };

  const moveOrderItem = (index, direction) => {
    if (isAnswered) return;
    const target = index + direction;
    if (target < 0 || target >= answer.length) return;
    const next = [...answer];
    [next[index], next[target]] = [next[target], next[index]];
    setAnswer(next);
  };

  const placeDraggedItem = (category) => {
    if (!draggedItem || isAnswered) return;
    setAnswer((current) => ({ ...current, [draggedItem]: category }));
    setDraggedItem(null);
  };

  const renderMultipleChoice = () => (
    <div className={`grid gap-3 ${currentQuestion.type === 'scenario' || currentQuestion.type === 'simulation' ? 'sm:grid-cols-2' : ''}`}>
      {currentQuestion.options.map((option, index) => {
        let style = 'border-gray-800 bg-gray-900/40 text-gray-300 hover:border-gray-700';
        if (answer === index) style = 'border-[#00e6ff] bg-[#00e6ff]/10 text-white';
        if (isAnswered && index === currentQuestion.answer) style = 'border-emerald-500 bg-emerald-500/10 text-emerald-300';
        else if (isAnswered && answer === index) style = 'border-rose-500 bg-rose-500/10 text-rose-300';
        return <button type="button" key={option} onClick={() => !isAnswered && setAnswer(index)} className={`min-h-16 rounded-xl border p-4 text-right text-sm font-semibold transition-all ${style}`}>{option}</button>;
      })}
    </div>
  );

  const renderQuestion = () => {
    switch (currentQuestion.type) {
      case 'fillBlank':
        return <div className="rounded-2xl border border-cyan-500/15 bg-cyan-500/5 p-5"><label className="text-xs font-bold text-gray-400">השלמת המשפט<input value={answer} onChange={(event) => setAnswer(event.target.value)} disabled={isAnswered} className="mt-3 w-full rounded-xl border border-gray-700 bg-gray-950 px-4 py-3 text-center text-base font-black text-white outline-none focus:border-[#00e6ff]" placeholder="הקלד את המונח החסר..." /></label></div>;
      case 'match': {
        const rightOptions = currentQuestion.pairs.map((pair) => pair[1]);
        return <div className="space-y-3">{currentQuestion.pairs.map(([left]) => <div key={left} className="grid items-center gap-3 rounded-xl border border-gray-800 bg-gray-900/35 p-3 sm:grid-cols-[1fr_auto_1fr]"><strong className="text-sm text-white">{left}</strong><Link2 size={16} className="hidden text-purple-400 sm:block" /><select value={answer[left] || ''} disabled={isAnswered} onChange={(event) => setAnswer((current) => ({ ...current, [left]: event.target.value }))} className="rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-xs text-gray-200"><option value="">בחר התאמה...</option>{rightOptions.map((right) => <option key={right} value={right}>{right}</option>)}</select></div>)}</div>;
      }
      case 'order':
        return <div className="space-y-2">{answer.map((item, index) => <div key={item} className="flex items-center gap-3 rounded-xl border border-gray-800 bg-gray-900/40 p-3"><span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-amber-400/10 text-xs font-black text-amber-300">{index + 1}</span><span className="flex-1 text-sm font-semibold text-gray-200">{item}</span><button type="button" disabled={index === 0 || isAnswered} onClick={() => moveOrderItem(index, -1)} className="p-1 text-gray-500 hover:text-white disabled:opacity-20"><ArrowUp size={17} /></button><button type="button" disabled={index === answer.length - 1 || isAnswered} onClick={() => moveOrderItem(index, 1)} className="p-1 text-gray-500 hover:text-white disabled:opacity-20"><ArrowDown size={17} /></button></div>)}</div>;
      case 'dragDrop': {
        const allItems = Object.values(currentQuestion.categories).flat();
        const unassigned = allItems.filter((item) => !answer[item]);
        return <div className="space-y-4">
          <div className="rounded-2xl border border-dashed border-gray-700 bg-gray-950/45 p-4"><p className="mb-3 flex items-center gap-2 text-[11px] font-bold text-gray-500"><GripVertical size={15} /> גרור מצב אל הצד המתאים, או לחץ עליו ואז על יעד</p><div className="flex min-h-12 flex-wrap gap-2">{unassigned.map((item) => <button key={item} type="button" draggable={!isAnswered} onDragStart={(event) => { event.dataTransfer.setData('text/plain', item); setDraggedItem(item); }} onClick={() => !isAnswered && setDraggedItem(item)} className={`cursor-grab rounded-xl border px-3 py-2 text-xs font-bold transition ${draggedItem === item ? 'border-[#00e6ff] bg-[#00e6ff]/10 text-[#00e6ff]' : 'border-gray-700 bg-gray-900 text-gray-300'}`}><GripVertical size={14} className="ml-1 inline" />{item}</button>)}</div></div>
          <div className="grid gap-3 sm:grid-cols-2">{Object.keys(currentQuestion.categories).map((category, categoryIndex) => <button key={category} type="button" onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); const item = event.dataTransfer.getData('text/plain'); setDraggedItem(item); setAnswer((current) => ({ ...current, [item]: category })); }} onClick={() => placeDraggedItem(category)} className={`min-h-36 rounded-2xl border-2 border-dashed p-4 text-right transition ${categoryIndex === 0 ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-rose-500/30 bg-rose-500/5'}`}><strong className={categoryIndex === 0 ? 'text-emerald-300' : 'text-rose-300'}>{categoryIndex === 0 ? '← ' : '→ '}{category}</strong><div className="mt-3 flex flex-wrap gap-2">{allItems.filter((item) => answer[item] === category).map((item) => <span key={item} className="rounded-lg border border-white/10 bg-black/20 px-2.5 py-2 text-[11px] font-bold text-gray-200">{item}</span>)}</div></button>)}</div>
        </div>;
      }
      case 'codeChallenge':
        return <div className="overflow-hidden rounded-2xl border border-gray-700 bg-black"><div className="flex items-center gap-2 border-b border-gray-800 px-4 py-2 text-[10px] font-bold text-emerald-400"><Braces size={15} /> ShieldX Code Challenge</div><textarea dir="ltr" value={answer || currentQuestion.starterCode} onFocus={() => !answer && setAnswer(currentQuestion.starterCode)} onChange={(event) => setAnswer(event.target.value)} disabled={isAnswered} rows={7} spellCheck="false" className="w-full resize-none bg-black p-4 font-mono text-sm leading-7 text-emerald-300 outline-none" /></div>;
      case 'hotspot':
        return <div className="overflow-hidden rounded-2xl border border-gray-700 bg-[#f4f7fb] p-4 text-slate-800"><div className="mb-3 flex items-center justify-between border-b border-slate-200 pb-3 text-xs"><strong>הודעה חדשה</strong><span className="text-slate-400">בחר אזור חשוד</span></div><div className="grid grid-cols-2 gap-3">{currentQuestion.options.map((option, index) => <button key={option} type="button" disabled={isAnswered} onClick={() => setAnswer(index)} className={`min-h-20 rounded-xl border-2 border-dashed p-3 text-right text-xs font-bold transition ${answer === index ? 'border-rose-500 bg-rose-50 text-rose-700' : 'border-slate-300 bg-white hover:border-cyan-500'}`}>{index === 0 ? 'מאת: ' : ''}{option}</button>)}</div></div>;
      default:
        return renderMultipleChoice();
    }
  };

  if (showResults) {
    const scorePct = Math.round((correctAnswers / activeQuestions.length) * 100);
    const passed = scorePct >= 80;
    return <div className="mx-auto max-w-2xl rounded-3xl border border-gray-800 bg-[#0d0d1f] p-8 text-center shadow-2xl"><Sparkles size={34} className={`mx-auto ${passed ? 'text-emerald-400' : 'text-amber-400'}`} /><h3 className="mt-4 text-2xl font-black">תוצאות המבדק</h3><div className={`my-5 text-6xl font-black ${passed ? 'text-emerald-400' : 'text-rose-500'}`}>{scorePct}%</div><p className="text-sm leading-relaxed text-gray-300">{passed ? 'עברת בהצלחה. ההתקדמות נשמרה ותעודת ההסמכה מוכנה.' : 'המערכת העבירה אותך למסלול חיזוק. בניסיון הבא תקבל יותר תרגולים ושאלות משתנות.'}</p><button type="button" onClick={retry} className="mx-auto mt-6 flex items-center gap-2 rounded-xl border border-gray-700 bg-gray-800 px-6 py-3 text-xs font-black hover:bg-gray-700"><RotateCcw size={16} /> ניסיון חדש עם שאלות אחרות</button></div>;
  }

  const progressPct = Math.round(((currentIdx + (isAnswered ? 1 : 0)) / activeQuestions.length) * 100);
  return (
    <div className="mx-auto max-w-3xl rounded-3xl border border-gray-800 bg-[#0d0d1f] p-5 shadow-2xl sm:p-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3"><div><h3 className="text-xl font-black text-gray-100">מבדק ידע אדפטיבי</h3><p className="mt-1 text-[10px] font-bold text-[#00e6ff]">{adaptiveLabel} · שאלות מעורבות ומשתנות</p></div><span className="rounded-lg bg-gray-800 px-3 py-1.5 text-xs font-bold text-gray-400">שאלה {currentIdx + 1} מתוך {activeQuestions.length}</span></div>
      <div className="mb-6 h-1.5 overflow-hidden rounded-full bg-gray-800"><div className="h-full rounded-full bg-gradient-to-l from-[#00e6ff] to-[#9d4edd] transition-all" style={{ width: `${progressPct}%` }} /></div>
      <div className="mb-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-gray-600"><Puzzle size={14} /> {currentQuestion.type === 'dragDrop' ? 'Drag & Drop' : currentQuestion.type === 'hotspot' ? 'לחיצה על אזור בתמונה' : currentQuestion.type === 'codeChallenge' ? 'Code Challenge' : currentQuestion.type === 'match' ? 'Match' : currentQuestion.type === 'order' ? 'סדר פעולות' : currentQuestion.type === 'fillBlank' ? 'השלמת משפט' : currentQuestion.type === 'simulation' ? 'סימולציה' : currentQuestion.type === 'scenario' ? 'תרחיש' : 'שאלה אמריקאית'}</div>
      <p className="mb-6 text-base font-bold leading-7 text-gray-100">{currentQuestion.question}</p>
      {renderQuestion()}
      {isAnswered && <div className={`mt-5 rounded-xl border p-4 text-xs leading-relaxed ${lastAnswerCorrect ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300' : 'border-rose-500/20 bg-rose-500/10 text-rose-300'}`}><strong>{lastAnswerCorrect ? '✓ נכון. ' : '✕ לא מדויק. '}</strong>{currentQuestion.explanation}</div>}
      <div className="mt-6 flex items-center justify-between gap-3">
        <div>{currentIdx > 0 && <button type="button" onClick={() => openQuestion(currentIdx - 1)} className="flex items-center gap-2 rounded-xl border border-gray-700 bg-gray-900 px-5 py-3 text-sm font-black text-gray-300 transition hover:border-gray-600 hover:bg-gray-800 hover:text-white"><ArrowRight size={17} /> שאלה קודמת</button>}</div>
        {!isAnswered ? <button type="button" onClick={checkAnswer} disabled={!canSubmit} className="rounded-xl bg-[#00e6ff] px-6 py-3 text-sm font-black text-black transition hover:bg-[#4df4ff] disabled:cursor-not-allowed disabled:opacity-35">בדיקת תשובה</button> : <button type="button" onClick={proceedToNext} className="flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 text-sm font-black text-black hover:bg-emerald-400">{currentIdx < activeQuestions.length - 1 ? 'למשימה הבאה' : 'לתוצאות'} <CheckCircle2 size={17} /></button>}
      </div>
    </div>
  );
}
