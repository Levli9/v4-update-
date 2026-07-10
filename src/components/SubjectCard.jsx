// src/components/SubjectCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';

export default function SubjectCard({ subject, isUnlocked, isCompleted, score }) {
  const { id, title, difficulty, estimatedTime, emoji, color, description } = subject;
  
  return (
    <div 
      className={`relative overflow-hidden rounded-2xl border bg-gray-900/60 p-6 transition-all duration-300 ${
        isUnlocked 
          ? 'border-gray-800 hover:border-gray-700 hover:-translate-y-1 shadow-lg hover:shadow-cyan-950/20' 
          : 'border-gray-950 opacity-40 cursor-not-allowed'
      }`}
      style={{
        borderRight: isUnlocked ? `4px solid ${color}` : '4px solid #1f2937'
      }}
    >
      <div className="flex justify-between items-start mb-4">
        <span className="text-3xl filter drop-shadow-[0_0_8px_rgba(255,255,255,0.1)]">{emoji}</span>
        <div className="flex gap-2">
          <span className="text-xs px-2.5 py-1 rounded-full bg-gray-800 text-gray-400 font-semibold border border-gray-700/30">
            {difficulty}
          </span>
          <span className="text-xs px-2.5 py-1 rounded-full bg-gray-800 text-gray-400 font-semibold border border-gray-700/30">
            {estimatedTime}
          </span>
        </div>
      </div>

      <h3 className="text-lg font-bold text-gray-100 mb-2">{title}</h3>
      <p className="text-sm text-gray-400 mb-6 line-clamp-2 leading-relaxed">{description}</p>

      <div className="flex justify-between items-center mt-auto">
        {isUnlocked ? (
          <Link 
            to={`/subject/${id}`} 
            className="text-xs font-bold px-4 py-2 rounded-lg bg-gray-800 hover:bg-[#00e6ff] hover:text-black transition-all duration-200 border border-gray-700"
          >
            {isCompleted ? 'חזור על החומר' : 'התחל למידה'}
          </Link>
        ) : (
          <div className="flex items-center gap-1.5 text-xs text-gray-500 font-bold">
            <span>🔒 נעול</span>
          </div>
        )}

        {isCompleted && (
          <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
            הושלם ({score}%)
          </span>
        )}
      </div>
    </div>
  );
}
