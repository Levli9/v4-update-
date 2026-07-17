// src/components/SubjectCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function SubjectCard({ subject }) {
  const { id, title, difficulty, estimatedTime, emoji, color, description, videoUrl, slides = [], simulations = [] } = subject;
  const { currentUser, userProgress } = useApp();

  // Status checks for each component completion
  const isVideoCompleted = Boolean(currentUser?.analytics?.videos?.[id]?.completed);
  const isLearnCompleted = Boolean(userProgress?.completedSubjects?.includes(id));
  const isLabCompleted = Boolean(userProgress?.completedLabs?.includes(id));
  const isQuizCompleted = Boolean(Number(userProgress?.scores?.[id]) >= 80);

  const hasVideo = Boolean(videoUrl);
  const hasSlides = slides.length > 0;
  const hasLab = simulations.length > 0;

  let totalComponents = 0;
  let completedComponents = 0;

  if (hasVideo) {
    totalComponents++;
    if (isVideoCompleted) completedComponents++;
  }
  if (hasSlides) {
    totalComponents++;
    if (isLearnCompleted) completedComponents++;
  }
  if (hasLab) {
    totalComponents++;
    if (isLabCompleted) completedComponents++;
  }
  // Quiz is always counted
  totalComponents++;
  if (isQuizCompleted) completedComponents++;

  const progressPct = totalComponents > 0 ? Math.round((completedComponents / totalComponents) * 100) : 0;

  const cardContent = (
    <>
      <div className="mb-4 flex items-start justify-between">
        <span className="text-3xl filter drop-shadow-[0_0_8px_rgba(255,255,255,0.1)]">{emoji}</span>
        <div className="flex gap-2">
          <span className="rounded-full border border-gray-700/30 bg-gray-800 px-2.5 py-1 text-xs font-semibold text-gray-400">{difficulty}</span>
          <span className="rounded-full border border-gray-700/30 bg-gray-800 px-2.5 py-1 text-xs font-semibold text-gray-400">{estimatedTime}</span>
        </div>
      </div>
      <h3 className="mb-2 text-lg font-bold text-gray-100">{title}</h3>
      <p className="mb-5 line-clamp-2 text-sm leading-relaxed text-gray-400">{description}</p>
      
      {/* Chapter Progress Bar */}
      <div className="mt-auto pt-3 border-t border-gray-800/40 mb-4">
        <div className="flex justify-between text-[10px] font-bold text-gray-500 mb-1.5">
          <span>התקדמות בפרק</span>
          <span>{progressPct}%</span>
        </div>
        <div className="h-1.5 bg-gray-950 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-l from-[#00e6ff] to-[#9d4edd] transition-all duration-300 animate-pulse" 
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-[#00e6ff] opacity-0 transition group-hover:opacity-100">לחץ לפתיחת הקורס ←</span>
        <div className="flex items-center gap-2">
          {isQuizCompleted && (
            <span className="text-[10px] text-emerald-400 font-extrabold bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/10">
              ציון: {userProgress.scores[id]}%
            </span>
          )}
          {progressPct === 100 && (
            <span className="rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-400">
              הושלם ✓
            </span>
          )}
        </div>
      </div>
    </>
  );

  const cardClassName = 'group relative block cursor-pointer overflow-hidden rounded-2xl border border-gray-800 bg-gray-900/60 p-6 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-[#00e6ff]/40 hover:shadow-cyan-950/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#00e6ff]';
  const cardStyle = { borderRight: `4px solid ${color}` };

  return <Link to={`/subject/${id}`} className={cardClassName} style={cardStyle} aria-label={`פתיחת הקורס ${title}`}>{cardContent}</Link>;
}
