// src/pages/Dashboard.jsx
import React from 'react';
import { useApp } from '../context/AppContext';
import SubjectCard from '../components/SubjectCard';
import { Link } from 'react-router-dom';
import { Award, LockKeyhole } from 'lucide-react';
import { getCertificationReadiness } from '../data/finalExamData';

export default function Dashboard() {
  const { userProgress, currentUser, subjects = [] } = useApp();
  const totalSubjects = subjects.length;
  const completedCount = userProgress.completedSubjects.length;
  const progressPct = totalSubjects ? Math.round((completedCount / totalSubjects) * 100) : 0;
  const readiness = getCertificationReadiness(userProgress, currentUser?.analytics, subjects);
  const finalExam = userProgress.finalExam;

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <section className="bg-gradient-to-l from-gray-900 via-gray-900 to-[#0d0d1f] border border-gray-800 rounded-3xl p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#00e6ff] opacity-[0.03] blur-3xl rounded-full"></div>
        <div className="relative z-10 max-w-2xl text-right">
          <h1 className="text-3xl font-extrabold text-white mb-3">
            ברוך הבא למרכז למידת אבטחת המידע
          </h1>
          <p className="text-gray-400 text-md leading-relaxed mb-6">
            כל ההדרכות פתוחות עבורך. אפשר ללמוד בכל סדר, לבצע סימולציות ומעבדות קוד ולעקוב אחר ההתקדמות עד לפתיחת המבחן המסכם.
          </p>

          {/* Progress Tracker Card */}
          <div className="flex flex-col sm:flex-row items-center gap-6 bg-gray-950/60 border border-gray-800 p-5 rounded-2xl">
            <div className="flex-1 w-full">
              <div className="flex justify-between text-xs text-gray-400 font-bold mb-2">
                <span>{progressPct}% השלמה</span>
                <span>התקדמות כללית</span>
              </div>
              <div className="h-2.5 bg-gray-850 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-l from-[#00e6ff] to-[#9d4edd] transition-all duration-500" 
                  style={{ width: `${progressPct}%` }}
                ></div>
              </div>
            </div>
            
            <div className="flex gap-4 sm:border-r border-gray-800 pr-6 shrink-0">
              <div className="text-center">
                <div className="text-xl font-extrabold text-white">{completedCount}</div>
                <div className="text-[10px] text-gray-500 font-bold">נושאים שהושלמו</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-extrabold text-white">{userProgress.xp}</div>
                <div className="text-[10px] text-gray-500 font-bold">נקודות XP</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Grid of subjects */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-gray-200">נושאי הלימוד</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map((subject) => (
            <SubjectCard 
              key={subject.id}
              subject={subject}
            />
          ))}
        </div>
      </section>

      {/* Final Exam Section (moved below courses) */}
      <section className={`relative overflow-hidden rounded-3xl border p-6 sm:p-8 ${readiness.unlocked ? 'border-purple-500/30 bg-gradient-to-l from-purple-500/10 to-gray-900/70' : 'border-gray-800 bg-gray-900/45'}`}>
        <div className="absolute -left-20 -top-20 h-56 w-56 rounded-full bg-purple-500/10 blur-3xl" />
        <div className="relative flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div className="flex items-start gap-4">
            <div className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl border ${readiness.unlocked ? 'border-purple-400/30 bg-purple-500/15 text-purple-300' : 'border-gray-700 bg-gray-950 text-gray-600'}`}>{readiness.unlocked ? <Award size={28} /> : <LockKeyhole size={25} />}</div>
            <div><div className="flex flex-wrap items-center gap-2"><h2 className="text-xl font-black text-white">מבחן הסמכה מסכם</h2>{finalExam && <span className={`rounded-full px-2.5 py-1 text-[10px] font-black ${finalExam.passed ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>{finalExam.passed ? '🟢 מוסמך' : '🔴 לא מוסמך'}</span>}</div><p className="mt-2 text-sm leading-6 text-gray-400">10 שאלות מכל חומרי הקורס · ציון מעבר 80 · תיעוד מלא של התוצאה</p>{!readiness.unlocked && <p className="mt-3 text-xs font-bold text-amber-400">יש להשלים את כל הקורסים לפני שניתן לגשת למבחן המסכם.</p>}</div>
          </div>
          {readiness.unlocked ? <Link to="/final-exam" className="w-full rounded-xl bg-purple-500 px-6 py-3 text-center text-sm font-black text-white shadow-lg shadow-purple-950/30 sm:w-auto">{finalExam ? 'גישה למבחן נוסף' : 'התחלת מבחן מסכם'}</Link> : <button type="button" disabled className="w-full cursor-not-allowed rounded-xl border border-gray-800 bg-gray-950 px-6 py-3 text-sm font-black text-gray-600 sm:w-auto">מבחן מסכם נעול</button>}
        </div>
        {!readiness.unlocked && <div className="relative mt-5 grid grid-cols-2 gap-2 text-[10px] font-bold sm:grid-cols-5">{[['שיעורים', readiness.lessonsDone], ['קורסים', readiness.coursesDone], ['סרטונים', readiness.videosDone], ['תרגולים', readiness.labsDone], ['מבדקים', readiness.quizzesDone]].map(([label, done]) => <span key={label} className={`rounded-lg border px-3 py-2 text-center ${done ? 'border-emerald-500/15 bg-emerald-500/5 text-emerald-400' : 'border-gray-800 bg-gray-950/50 text-gray-600'}`}>{done ? '✓' : '○'} {label}</span>)}</div>}
      </section>
    </div>
  );
}
