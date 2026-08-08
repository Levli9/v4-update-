import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, LockKeyhole, ShieldCheck, Trophy, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import BackButton from '../components/BackButton';
import { useApp } from '../context/AppContext';
import { subjectsData } from '../data/subjectsData';
import { createFinalExamQuestionSet, FINAL_EXAM_PASS_SCORE, getCertificationReadiness } from '../data/finalExamData';
import { downloadCertificatePdf } from '../services/certificateService';

export default function FinalExam() {
  const { userProgress, currentUser, submitFinalExam, updatePresence } = useApp();
  const [examQuestions, setExamQuestions] = useState(() => createFinalExamQuestionSet(subjectsData));
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const completedCount = userProgress.completedSubjects?.length || 0;
  const readiness = getCertificationReadiness(userProgress, currentUser?.analytics, subjectsData.length);
  const isUnlocked = readiness.unlocked;
  const previousResult = userProgress.finalExam;
  const answeredCount = Object.keys(answers).length;

  const [examStartTime] = useState(() => Date.now());

  useEffect(() => {
    if (!isUnlocked) return undefined;
    updatePresence('final-exam');
    const heartbeat = window.setInterval(() => updatePresence('final-exam'), 30000);
    return () => { window.clearInterval(heartbeat); updatePresence('idle'); };
  }, [isUnlocked]);

  const scorePreview = useMemo(() => examQuestions.reduce((total, question, index) => (
    total + (answers[index] === question.answer ? 10 : 0)
  ), 0), [answers, examQuestions]);

  const finishExam = () => {
    if (answeredCount !== examQuestions.length) return;
    const timeSpentSeconds = Math.max(1, Math.round((Date.now() - examStartTime) / 1000));
    const answerHistory = examQuestions.map((question, index) => ({
      questionId: question.id,
      topic: question.topic,
      question: question.question,
      selectedAnswer: answers[index],
      correctAnswer: question.answer,
      correct: answers[index] === question.answer,
      explanation: question.explanation
    }));
    const correctCount = answerHistory.filter((answer) => answer.correct).length;
    const submitted = submitFinalExam(scorePreview, { answers: answerHistory, correctCount, wrongCount: examQuestions.length - correctCount, durationSeconds: timeSpentSeconds });
    setResult({ ...submitted, passed: scorePreview >= FINAL_EXAM_PASS_SCORE, score: scorePreview, currentAttempt: answerHistory, correctCount, wrongCount: examQuestions.length - correctCount, durationSeconds: timeSpentSeconds });
    updatePresence('idle');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!isUnlocked) {
    return <div className="mx-auto max-w-3xl" dir="rtl">
      <div className="mb-6 flex justify-end"><BackButton /></div>
      <section className="rounded-3xl border border-gray-800 bg-gray-900/55 p-8 text-center shadow-2xl">
        <div className="mx-auto grid h-20 w-20 place-items-center rounded-3xl border border-gray-700 bg-gray-950 text-gray-500"><LockKeyhole size={34} /></div>
        <h1 className="mt-5 text-2xl font-black text-white">המבחן המסכם עדיין נעול</h1>
        <div className="mx-auto mt-4 max-w-md rounded-2xl border border-rose-500/30 bg-rose-500/10 px-5 py-4 text-rose-300" role="status">
          <strong className="block text-sm font-black">🔴 טרם הוסמכת</strong>
          <span className="mt-1 block text-[11px] font-bold leading-5 text-rose-300/75">אין לך עדיין הסמכת ShieldX פעילה. יש להשלים את ההכשרה ולעבור את המבחן המסכם בציון 80 ומעלה.</span>
        </div>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-gray-400">יש להשלים את כל הקורסים לפני שניתן לגשת למבחן המסכם.</p>
        <div className="mx-auto mt-6 max-w-md"><div className="mb-2 flex justify-between text-xs font-bold text-gray-500"><span>{completedCount}/{subjectsData.length}</span><span>התקדמות לפתיחת המבחן</span></div><div className="h-3 overflow-hidden rounded-full bg-gray-950"><div className="h-full rounded-full bg-gradient-to-l from-[#00e6ff] to-[#9d4edd]" style={{ width: `${Math.round((completedCount / subjectsData.length) * 100)}%` }} /></div></div>
        <div className="mx-auto mt-5 grid max-w-xl grid-cols-2 gap-2 text-[11px] font-bold sm:grid-cols-4">{[['100% קורסים', readiness.coursesDone], ['כל הסרטונים', readiness.videosDone], ['כל התרגולים', readiness.labsDone], ['כל המבדקים', readiness.quizzesDone]].map(([label, done]) => <span key={label} className={`rounded-xl border px-3 py-2 ${done ? 'border-emerald-500/20 bg-emerald-500/8 text-emerald-400' : 'border-gray-800 bg-gray-950 text-gray-600'}`}>{done ? '✓' : '○'} {label}</span>)}</div>
        <Link to="/" className="mt-7 inline-flex rounded-xl bg-[#00e6ff] px-6 py-3 text-sm font-black text-black">חזרה לקורסים</Link>
      </section>
    </div>;
  }

  if (result) {
    return <div className="mx-auto max-w-3xl" dir="rtl">
      <div className="mb-6 flex justify-end"><BackButton /></div>
      <section className={`rounded-3xl border p-8 text-center shadow-2xl ${result.passed ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-rose-500/30 bg-rose-500/5'}`}>
        <div className={`mx-auto grid h-24 w-24 place-items-center rounded-full border ${result.passed ? 'border-emerald-400/30 bg-emerald-500/10 text-emerald-400' : 'border-rose-400/30 bg-rose-500/10 text-rose-400'}`}>{result.passed ? <Trophy size={44} /> : <XCircle size={44} />}</div>
        <p className="mt-6 text-xs font-black tracking-widest text-gray-500">הציון הסופי שלך</p>
        <p className={`mt-1 text-7xl font-black ${result.passed ? 'text-emerald-400' : 'text-rose-400'}`}>{result.score}</p>
        <h1 className="mt-4 text-2xl font-black text-white">{result.passed ? 'עברת את המבחן בהצלחה!' : 'עדיין לא עברת את המבחן'}</h1>
        <p className="mt-2 text-sm text-gray-400">{result.passed ? 'המנהל קיבל התראה והסטטוס שלך עודכן במערכת.' : `ציון המעבר הוא ${FINAL_EXAM_PASS_SCORE}. אפשר לחזור על החומר ולנסות שוב.`}</p>
        <div className="mx-auto mt-6 grid max-w-md grid-cols-2 gap-3"><div className="rounded-2xl border border-emerald-500/15 bg-emerald-500/5 p-4"><strong className="block text-2xl text-emerald-400">{result.correctCount}</strong><span className="text-xs font-bold text-gray-500">תשובות נכונות</span></div><div className="rounded-2xl border border-rose-500/15 bg-rose-500/5 p-4"><strong className="block text-2xl text-rose-400">{result.wrongCount}</strong><span className="text-xs font-bold text-gray-500">תשובות שגויות</span></div></div>
        <div className="mt-7 flex flex-wrap justify-center gap-3"><Link to="/" className="rounded-xl border border-gray-700 bg-gray-900 px-5 py-3 text-xs font-bold text-gray-200">לפורטל הלמידה</Link>{result.passed && <button type="button" onClick={() => downloadCertificatePdf({ username: currentUser.username, courseTitle: 'הסמכת הסייבר הארגונית', score: result.score })} className="rounded-xl bg-emerald-500 px-5 py-3 text-xs font-black text-black">הורדת תעודת הסמכה</button>}{!result.passed && <button type="button" onClick={() => { setAnswers({}); setExamQuestions(createFinalExamQuestionSet(subjectsData)); setResult(null); }} className="rounded-xl bg-[#00e6ff] px-5 py-3 text-xs font-black text-black">ניסיון נוסף</button>}</div>
      </section>
      <section className="mt-6 rounded-3xl border border-gray-800 bg-gray-900/45 p-6 text-right"><h2 className="text-lg font-black text-white">משוב מפורט</h2><div className="mt-4 space-y-3">{result.currentAttempt.map((answer, index) => <div key={answer.questionId} className={`rounded-2xl border p-4 ${answer.correct ? 'border-emerald-500/15 bg-emerald-500/5' : 'border-rose-500/15 bg-rose-500/5'}`}><div className="flex items-start gap-3">{answer.correct ? <CheckCircle2 className="mt-0.5 shrink-0 text-emerald-400" size={18} /> : <XCircle className="mt-0.5 shrink-0 text-rose-400" size={18} />}<div><p className="text-xs font-black text-white">{index + 1}. {answer.question}</p><p className="mt-2 text-[11px] font-semibold leading-6 text-gray-400">{answer.explanation}</p>{!answer.correct && <p className="mt-1 text-[10px] font-bold text-emerald-400">התשובה הנכונה: {examQuestions[index].options[answer.correctAnswer]}</p>}</div></div></div>)}</div></section>
    </div>;
  }

  return <div className="mx-auto max-w-4xl" dir="rtl">
    <div className="mb-6 flex items-start justify-between gap-4"><div><span className="inline-flex items-center gap-2 rounded-full border border-purple-500/20 bg-purple-500/10 px-3 py-1 text-xs font-black text-purple-300"><ShieldCheck size={15} /> מבחן הסמכה</span><h1 className="mt-3 text-3xl font-black text-white">המבחן המסכם של ShieldX</h1><p className="mt-2 text-sm text-gray-400">10 שאלות · 10 נקודות לכל שאלה · ציון מעבר {FINAL_EXAM_PASS_SCORE}</p></div><BackButton /></div>
    {previousResult && <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gray-800 bg-gray-900/45 p-4 text-xs"><span className="text-gray-400">הניסיון הטוב ביותר שלך: <strong className={previousResult.passed ? 'text-emerald-400' : 'text-amber-400'}>{previousResult.bestScore ?? previousResult.score}</strong></span><span className={`rounded-lg px-3 py-1 font-black ${previousResult.passed ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>{previousResult.passed ? 'עבר' : 'לא עבר'}</span></div>}
    <div className="mb-5 sticky top-24 z-20 rounded-2xl border border-gray-800 bg-[#0a0d17]/95 p-4 shadow-xl backdrop-blur"><div className="flex justify-between text-xs font-bold text-gray-400"><span>{answeredCount}/10 שאלות נענו</span><span>כל שאלה שווה 10 נקודות</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-900"><div className="h-full bg-gradient-to-l from-[#00e6ff] to-purple-500 transition-all" style={{ width: `${answeredCount * 10}%` }} /></div></div>
    <div className="space-y-5">{examQuestions.map((question, questionIndex) => <section key={question.id} className="rounded-3xl border border-gray-800 bg-gray-900/50 p-6"><div className="mb-4 flex items-center justify-between gap-3"><span className="rounded-lg bg-gray-950 px-2.5 py-1 text-[10px] font-black text-[#00e6ff]">{question.topic}</span><span className="text-xs font-black text-gray-500">שאלה {questionIndex + 1} מתוך 10</span></div><h2 className="text-base font-bold leading-7 text-white">{question.question}</h2><div className="mt-5 grid gap-3">{question.options.map((option, optionIndex) => <button key={option} type="button" onClick={() => setAnswers((current) => ({ ...current, [questionIndex]: optionIndex }))} className={`flex items-center gap-3 rounded-2xl border p-4 text-right text-sm font-semibold transition ${answers[questionIndex] === optionIndex ? 'border-[#00e6ff] bg-[#00e6ff]/10 text-white' : 'border-gray-800 bg-gray-950/35 text-gray-400 hover:border-gray-700 hover:text-gray-200'}`}><span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border text-xs ${answers[questionIndex] === optionIndex ? 'border-[#00e6ff] bg-[#00e6ff] text-black' : 'border-gray-700'}`}>{String.fromCharCode(1488 + optionIndex)}</span>{option}</button>)}</div></section>)}</div>
    <div className="mt-7 rounded-3xl border border-gray-800 bg-gray-900/65 p-6 text-center"><button type="button" onClick={finishExam} disabled={answeredCount !== examQuestions.length} className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-8 py-4 text-sm font-black text-[#03130e] transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-35"><CheckCircle2 size={19} /> סיום וקבלת ציון</button>{answeredCount !== examQuestions.length && <p className="mt-3 text-[11px] font-bold text-gray-600">יש לענות על כל השאלות לפני הגשת המבחן.</p>}</div>
  </div>;
}
