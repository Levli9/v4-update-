import React, { useState } from 'react';
import { Award, Camera, KeyRound, Save, Trash2, UserRound } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { prepareProfileImage } from '../services/imageService';
import BackButton from '../components/BackButton';
import LearningTimeline from '../components/LearningTimeline';
import PasswordInput from '../components/PasswordInput';

const validatePassword = (password) => {
  if (password.length < 12) return 'הסיסמה החדשה חייבת להכיל לפחות 12 תווים.';
  if (!/[A-Z]/.test(password)) return 'הסיסמה חייבת להכיל אות גדולה באנגלית.';
  if (!/[a-z]/.test(password)) return 'הסיסמה חייבת להכיל אות קטנה באנגלית.';
  if (!/[0-9]/.test(password)) return 'הסיסמה חייבת להכיל לפחות ספרה אחת.';
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return 'הסיסמה חייבת להכיל תו מיוחד.';
  return '';
};

export default function UserSettings() {
  const { currentUser, setActiveViewRole } = useApp();

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">הסמכות ותעודות</h1>
          <p className="mt-1 text-xs font-semibold text-gray-500">צפייה בסטטוס ההסמכה, תעודות רשמיות וציר הזמן הלימודי שלך</p>
        </div>
        <BackButton onClick={() => setActiveViewRole('employee')} />
      </div>

      <div className="overflow-hidden rounded-3xl border border-gray-800 bg-gray-900/45 shadow-2xl p-6 sm:p-8 space-y-7">
        
        {/* Certification Status Box */}
        <div className={`rounded-2xl border p-5 ${
          currentUser.progress?.finalExam?.passed 
            ? 'border-emerald-500/20 bg-emerald-500/5' 
            : currentUser.progress?.finalExam 
            ? 'border-rose-500/20 bg-rose-500/5' 
            : 'border-gray-800 bg-gray-950/35'
        }`}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="flex items-center gap-3">
              <span className={`grid h-10 w-10 place-items-center rounded-xl ${
                currentUser.progress?.finalExam?.passed ? 'bg-emerald-500/10 text-emerald-400' : 'bg-gray-900 text-gray-600'
              }`}>
                <Award size={20} />
              </span>
              <span>
                <strong className="block text-sm text-white">סטטוס הסמכה</strong>
                <small className="mt-1 block text-[10px] font-bold text-gray-500">
                  {currentUser.progress?.finalExam?.passed 
                    ? `תאריך מעבר: ${new Intl.DateTimeFormat('he-IL', { dateStyle: 'short' }).format(new Date(currentUser.progress.finalExam.passedAt))}` 
                    : 'יש לעבור את המבחן המסכם בציון 80 ומעלה'}
                </small>
              </span>
            </span>
            <span className={`rounded-full px-3 py-1.5 text-xs font-black ${
              currentUser.progress?.finalExam?.passed 
                ? 'bg-emerald-500/10 text-emerald-400' 
                : currentUser.progress?.finalExam 
                ? 'bg-rose-500/10 text-rose-400' 
                : 'bg-gray-800 text-gray-500'
            }`}>
              {currentUser.progress?.finalExam?.passed ? '🟢 מוסמך (Certified)' : currentUser.progress?.finalExam ? '🔴 לא מוסמך' : '⚪ טרם ניגש'}
            </span>
          </div>
          
          {currentUser.progress?.finalExam && (
            <div className="mt-4 grid grid-cols-2 gap-3 border-t border-white/5 pt-4 text-center text-xs">
              <span>
                <strong className="block text-lg text-white">{currentUser.progress.finalExam.lastScore}</strong>
                <small className="text-gray-600">ציון אחרון</small>
              </span>
              <span>
                <strong className="block text-lg text-white">{currentUser.progress.finalExam.attempts}</strong>
                <small className="text-gray-600">ניסיונות</small>
              </span>
            </div>
          )}
        </div>

        {/* Official Cyber Certificate Component */}
        {currentUser.progress?.finalExam?.passed && (
          <div className="relative overflow-hidden rounded-3xl border-2 border-emerald-500/30 bg-[#07080f] p-6 sm:p-10 text-center shadow-[0_0_50px_rgba(16,185,129,0.1)]">
            {/* Decorative background grids & glow */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.06),transparent_70%)] pointer-events-none" />
            <div className="absolute -top-12 -left-12 w-48 h-48 bg-emerald-500/5 blur-3xl rounded-full pointer-events-none" />
            <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-emerald-500/5 blur-3xl rounded-full pointer-events-none" />
            
            <div className="border border-emerald-500/10 rounded-2xl p-6 sm:p-8 relative z-10">
              <div className="mx-auto w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/20 mb-6">
                <Award size={36} className="text-emerald-400 animate-pulse" />
              </div>
              
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">תעודת הסמכה רשמית</p>
              <h2 className="text-2xl sm:text-3xl font-black text-white mt-2 mb-6 tracking-wide">SHIELDX CERTIFIED</h2>
              
              <p className="text-xs text-gray-500 font-semibold">תעודה זו מוענקת בזאת ל:</p>
              <h3 className="text-xl sm:text-2xl font-black text-[#00e6ff] my-4 tracking-wider">{currentUser.username}</h3>
              
              <p className="text-xs text-gray-400 max-w-md mx-auto leading-relaxed">
                על השלמה מלאה של מסלול ההכשרה באבטחת מידע וסייבר, מעבר בהצלחה של כלל המעבדות המעשיות, מבדקי הידע השוטפים, ומבחן ההסמכה המסכם של מערכת <strong className="text-white">ShieldX</strong>.
              </p>
              
              <div className="mt-8 grid grid-cols-2 gap-6 border-t border-gray-800 pt-6 text-right max-w-xs mx-auto">
                <div>
                  <span className="text-[9px] text-gray-600 block font-bold">תאריך הסמכה</span>
                  <strong className="text-[11px] text-gray-300">
                    {new Intl.DateTimeFormat('he-IL', { dateStyle: 'long' }).format(new Date(currentUser.progress.finalExam.passedAt))}
                  </strong>
                </div>
                <div>
                  <span className="text-[9px] text-gray-600 block font-bold">מזהה תעודה</span>
                  <strong className="text-[11px] font-mono text-emerald-400 uppercase">
                    SX-{currentUser.username.substring(0, 3).toUpperCase()}-{Math.round(new Date(currentUser.progress.finalExam.passedAt).getTime() / 100000)}
                  </strong>
                </div>
              </div>
              
              <div className="mt-8 flex justify-center items-center gap-2 text-[9px] text-gray-600 font-bold">
                🛡️ אבטחת מידע מאושרת על ידי הנהלת ShieldX
              </div>
            </div>
          </div>
        )}

        {/* Learning Timeline */}
        <div className="border-t border-gray-800 pt-7">
          <h3 className="mb-4 text-sm font-black text-white">ציר הזמן הלימודי שלי</h3>
          <LearningTimeline user={currentUser} />
        </div>

      </div>
    </div>
  );
}
