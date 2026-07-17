// src/components/SubjectCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';

export default function SubjectCard({ subject, isUnlocked, isCompleted, score }) {
  const { id, title, difficulty, estimatedTime, emoji, color, description } = subject;

  const cardContent = <>
    <div className="mb-4 flex items-start justify-between">
      <span className="text-3xl filter drop-shadow-[0_0_8px_rgba(255,255,255,0.1)]">{emoji}</span>
      <div className="flex gap-2">
        <span className="rounded-full border border-gray-700/30 bg-gray-800 px-2.5 py-1 text-xs font-semibold text-gray-400">{difficulty}</span>
        <span className="rounded-full border border-gray-700/30 bg-gray-800 px-2.5 py-1 text-xs font-semibold text-gray-400">{estimatedTime}</span>
      </div>
    </div>
    <h3 className="mb-2 text-lg font-bold text-gray-100">{title}</h3>
    <p className="mb-6 line-clamp-2 text-sm leading-relaxed text-gray-400">{description}</p>
    <div className="mt-auto flex items-center justify-between">
      {isUnlocked ? <span className="text-xs font-bold text-[#00e6ff] opacity-0 transition group-hover:opacity-100">לחץ לפתיחת הקורס ←</span> : <span className="flex items-center gap-1.5 text-xs font-bold text-gray-500">🔒 נעול</span>}
      {isCompleted && <span className="rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-400">הושלם ({score}%)</span>}
    </div>
  </>;

  const cardClassName = `group relative block overflow-hidden rounded-2xl border bg-gray-900/60 p-6 transition-all duration-300 ${
        isUnlocked
          ? 'cursor-pointer border-gray-800 shadow-lg hover:-translate-y-1 hover:border-[#00e6ff]/40 hover:shadow-cyan-950/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#00e6ff]'
          : 'cursor-not-allowed border-gray-950 opacity-40'
      }`;
  const cardStyle = { borderRight: isUnlocked ? `4px solid ${color}` : '4px solid #1f2937' };

  return isUnlocked
    ? <Link to={`/subject/${id}`} className={cardClassName} style={cardStyle} aria-label={`פתיחת הקורס ${title}`}>{cardContent}</Link>
    : <div className={cardClassName} style={cardStyle} aria-disabled="true">{cardContent}</div>;
}
