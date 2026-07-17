// src/components/SubjectCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';

export default function SubjectCard({ subject, isCompleted, score }) {
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
      <span className="text-xs font-bold text-[#00e6ff] opacity-0 transition group-hover:opacity-100">לחץ לפתיחת הקורס ←</span>
      {isCompleted && <span className="rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-400">הושלם ({score}%)</span>}
    </div>
  </>;

  const cardClassName = 'group relative block cursor-pointer overflow-hidden rounded-2xl border border-gray-800 bg-gray-900/60 p-6 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-[#00e6ff]/40 hover:shadow-cyan-950/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#00e6ff]';
  const cardStyle = { borderRight: `4px solid ${color}` };

  return <Link to={`/subject/${id}`} className={cardClassName} style={cardStyle} aria-label={`פתיחת הקורס ${title}`}>{cardContent}</Link>;
}
