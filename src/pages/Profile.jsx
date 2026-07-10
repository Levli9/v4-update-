// src/pages/Profile.jsx
import React from 'react';
import { useApp } from '../context/AppContext';

export default function Profile() {
  const { userProgress } = useApp();

  const badgesMetadata = {
    'צעד ראשון': { emoji: '🏆', desc: 'השלמת את נושא הסייבר הראשון שלך!' },
    'חצי הדרך': { emoji: '🎖️', desc: 'עברת 5 נושאי סייבר שונים!' },
    'מאסטר סייבר': { emoji: '👑', desc: 'השלמת את כל 11 נושאי אבטחת המידע!' }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Profile Overview */}
      <section className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6 text-center">
        <div className="w-20 h-20 bg-gradient-to-tr from-[#00e6ff] to-[#9d4edd] rounded-full mx-auto mb-4 flex items-center justify-center text-4xl">
          🛡️
        </div>
        <h2 className="text-xl font-bold text-white mb-1">משתמש אקדמיית סייבר</h2>
        <p className="text-xs text-gray-500 font-semibold mb-4">רמת למידה: מתקדם</p>
        
        <div className="flex justify-around items-center border-t border-gray-800 pt-6">
          <div>
            <div className="text-2xl font-extrabold text-[#00e6ff]">{userProgress.xp}</div>
            <div className="text-xs text-gray-500 font-bold">XP צבור</div>
          </div>
          <div className="w-px h-8 bg-gray-800"></div>
          <div>
            <div className="text-2xl font-extrabold text-[#9d4edd]">{userProgress.completedSubjects.length}</div>
            <div className="text-xs text-gray-500 font-bold">נושאים שעברו</div>
          </div>
        </div>
      </section>

      {/* Badges Section */}
      <section className="bg-gray-900/40 border border-gray-800 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-gray-200 mb-6">מדליות והישגים שהושגו</h3>
        
        {userProgress.badges.length === 0 ? (
          <p className="text-center py-6 text-sm text-gray-500">
            עדיין לא פתחת מדליות. השלם נושאים ומבדקים כדי להתחיל לצבור אותן!
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {userProgress.badges.map((badgeName) => {
              const meta = badgesMetadata[badgeName] || { emoji: '🎖️', desc: 'הישג מיוחד' };
              return (
                <div key={badgeName} className="flex items-center gap-4 bg-gray-950/60 border border-gray-850 p-4 rounded-xl">
                  <span className="text-3xl filter drop-shadow-[0_0_8px_rgba(255,255,255,0.15)]">{meta.emoji}</span>
                  <div className="text-right">
                    <h4 className="font-bold text-sm text-white">{badgeName}</h4>
                    <p className="text-[11px] text-gray-400 mt-1">{meta.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
