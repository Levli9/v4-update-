// src/pages/Dashboard.jsx
import React from 'react';
import { useApp } from '../context/AppContext';
import { subjectsData } from '../data/subjectsData';
import SubjectCard from '../components/SubjectCard';

export default function Dashboard() {
  const { userProgress } = useApp();
  const totalSubjects = subjectsData.length;
  const completedCount = userProgress.completedSubjects.length;
  const progressPct = Math.round((completedCount / totalSubjects) * 100);

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
            עקוב אחר התקדמותך בנושאי הסייבר השונים, בצע סימולציות ומעבדות קוד, ועבור את מבדקי הידע כדי להתקדם לנושאים הבאים.
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
          {subjectsData.map((subject, idx) => {
            const isCompleted = userProgress.completedSubjects.includes(subject.id);
            const score = userProgress.scores[subject.id] || 0;
            // Topic 0 is always unlocked. The subsequent ones are unlocked if the previous one is completed.
            const isUnlocked = subject.id === 0 || userProgress.completedSubjects.includes(subject.id - 1);

            return (
              <SubjectCard 
                key={subject.id}
                subject={subject}
                isUnlocked={isUnlocked}
                isCompleted={isCompleted}
                score={score}
              />
            );
          })}
        </div>
      </section>
    </div>
  );
}
