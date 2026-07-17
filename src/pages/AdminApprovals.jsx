import React, { useMemo, useState } from 'react';
import { Check, Clock3, ShieldCheck, UserCheck, UserX, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function AdminApprovals() {
  const { users, reviewRegistration } = useApp();
  const [message, setMessage] = useState('');
  const [activeFilter, setActiveFilter] = useState('pending'); // 'pending', 'approved', 'rejected'

  const pendingCount = users.filter((user) => user.status === 'pending').length;
  const approvedCount = users.filter((user) => user.status === 'approved' && user.role !== 'admin').length;
  const rejectedCount = users.filter((user) => user.status === 'rejected').length;

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      if (activeFilter === 'approved') {
        return user.status === 'approved' && user.role !== 'admin';
      }
      return user.status === activeFilter;
    }).sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }, [users, activeFilter]);

  const review = (username, decision) => {
    const result = reviewRegistration(username, decision);
    if (result.success) {
      if (decision === 'approve') {
        setMessage(`המשתמש ${username} אושר בהצלחה.`);
      } else if (decision === 'pending') {
        setMessage(`המשתמש ${username} הועבר חזרה למצב המתנה.`);
      } else {
        setMessage(`בקשת המשתמש ${username} נדחתה.`);
      }
    } else {
      setMessage(result.message);
    }
  };

  return (
    <div className="space-y-7">
      <section className="overflow-hidden rounded-3xl border border-gray-800 bg-gradient-to-l from-cyan-500/[0.08] via-gray-900/55 to-purple-500/[0.08] p-6 shadow-2xl sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-5">
          <div>
            <div className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-[#00e6ff]"><ShieldCheck size={15} /> ShieldX Access Control</div>
            <h1 className="text-2xl font-black text-white sm:text-3xl">אישור משתמשים חדשים</h1>
            <p className="mt-2 text-xs font-semibold text-gray-500">בדיקת בקשות הרשמה של עובדים ומנהלים לפני הפעלת החשבון</p>
          </div>
          
          {/* Clickable Status Filters */}
          <div className="grid grid-cols-3 gap-3 text-center w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setActiveFilter('pending')}
              className={`rounded-xl border px-5 py-3 transition-all cursor-pointer text-right flex flex-col justify-between min-w-28 ${
                activeFilter === 'pending'
                  ? 'border-amber-500 bg-amber-500/10 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                  : 'border-gray-800 bg-gray-900/30 hover:border-amber-500/30'
              }`}
            >
              <span className="text-[10px] font-bold text-gray-500">ממתינים</span>
              <strong className="block text-2xl text-amber-300 mt-1">{pendingCount}</strong>
            </button>
            
            <button
              type="button"
              onClick={() => setActiveFilter('approved')}
              className={`rounded-xl border px-5 py-3 transition-all cursor-pointer text-right flex flex-col justify-between min-w-28 ${
                activeFilter === 'approved'
                  ? 'border-emerald-500 bg-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                  : 'border-gray-800 bg-gray-900/30 hover:border-emerald-500/30'
              }`}
            >
              <span className="text-[10px] font-bold text-gray-500">מאושרים</span>
              <strong className="block text-2xl text-emerald-300 mt-1">{approvedCount}</strong>
            </button>
            
            <button
              type="button"
              onClick={() => setActiveFilter('rejected')}
              className={`rounded-xl border px-5 py-3 transition-all cursor-pointer text-right flex flex-col justify-between min-w-28 ${
                activeFilter === 'rejected'
                  ? 'border-rose-500 bg-rose-500/10 shadow-[0_0_15px_rgba(239,68,68,0.2)]'
                  : 'border-gray-800 bg-gray-900/30 hover:border-rose-500/30'
              }`}
            >
              <span className="text-[10px] font-bold text-gray-500">נדחו</span>
              <strong className="block text-2xl text-rose-300 mt-1">{rejectedCount}</strong>
            </button>
          </div>
        </div>
      </section>

      {message && (
        <div className="rounded-xl border border-cyan-500/15 bg-cyan-500/5 px-4 py-3 text-xs font-bold text-cyan-200 flex justify-between items-center">
          <span>{message}</span>
          <button type="button" onClick={() => setMessage('')} className="text-cyan-400 hover:text-cyan-200">
            <X size={14} />
          </button>
        </div>
      )}

      <section className="overflow-hidden rounded-3xl border border-gray-800 bg-gray-900/45 shadow-2xl">
        <header className="flex items-center justify-between border-b border-gray-800 px-5 py-4">
          <div className="flex items-center gap-3">
            <span className={`grid h-10 w-10 place-items-center rounded-xl border ${
              activeFilter === 'approved'
                ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-300'
                : activeFilter === 'rejected'
                ? 'border-rose-500/20 bg-rose-500/5 text-rose-300'
                : 'border-amber-500/20 bg-amber-500/5 text-amber-300'
            }`}>
              {activeFilter === 'approved' ? <UserCheck size={19} /> : activeFilter === 'rejected' ? <UserX size={19} /> : <Clock3 size={19} />}
            </span>
            <div>
              <h2 className="font-black text-white">
                {activeFilter === 'approved' ? 'משתמשים מאושרים במערכת' : activeFilter === 'rejected' ? 'בקשות הצטרפות שנדחו' : 'בקשות שממתינות לבדיקה'}
              </h2>
              <p className="text-[10px] font-semibold text-gray-600">
                {activeFilter === 'approved' 
                  ? 'עובדים ומנהלים פעילים המורשים להתחבר · ניתן לשנות סטטוס בכל עת' 
                  : activeFilter === 'rejected' 
                  ? 'בקשות שסורבו · באפשרותך לאשר אותם או להעביר חזרה לבדיקה חוזרת' 
                  : 'אישור ✓ מפעיל את החשבון · דחייה ✕ חוסמת כניסה למערכת'}
              </p>
            </div>
          </div>
          <span className="rounded-full bg-gray-950 px-3 py-1 text-[10px] font-black text-gray-500">
            {filteredUsers.length} משתמשים
          </span>
        </header>

        {filteredUsers.length === 0 ? (
          <div className="grid min-h-64 place-items-center p-8 text-center">
            <div>
              <UserCheck size={42} className="mx-auto text-gray-600/70" />
              <h3 className="mt-4 font-black text-white">אין משתמשים בסטטוס זה</h3>
              <p className="mt-1 text-xs text-gray-600">לחץ על כפתורי הסינון למעלה למעבר בין מצבי המשתמשים.</p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-800/80">
            {filteredUsers.map((user) => (
              <article key={user._id || user.username} className="flex flex-col gap-4 p-5 transition-colors hover:bg-gray-950/25 sm:flex-row sm:items-center">
                <div className="profile-avatar h-12 w-12 shrink-0">{user.avatar ? <img src={user.avatar} alt="" /> : <span>👤</span>}</div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-black text-white">{user.username}</h3>
                    <span className={`rounded-full px-2.5 py-1 text-[9px] font-black ${user.requestedRole === 'manager' || user.role === 'manager' ? 'bg-purple-500/10 text-purple-300' : 'bg-cyan-500/10 text-cyan-300'}`}>
                      {user.requestedRole === 'manager' || user.role === 'manager' ? 'מנהל' : 'עובד רגיל'}
                    </span>
                    <span className={`rounded-full px-2 py-0.5 text-[8px] font-bold ${
                      user.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                      user.status === 'rejected' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                      'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}>
                      {user.status === 'approved' ? 'מאושר' : user.status === 'rejected' ? 'נדחה' : 'ממתין'}
                    </span>
                  </div>
                  <p className="mt-1 truncate text-[11px] text-gray-500" dir="ltr">{user.email}</p>
                  <p className="mt-1 text-[10px] font-semibold text-gray-600">מחלקה: {user.department || 'כללי'}</p>
                </div>
                
                {/* Context-aware Action Controls */}
                <div className="flex gap-2 sm:shrink-0">
                  {user.status !== 'approved' && (
                    <button 
                      type="button" 
                      onClick={() => review(user.username, 'approve')} 
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-2.5 text-xs font-black text-emerald-300 transition hover:bg-emerald-500/20 sm:flex-none"
                    >
                      <Check size={16} /> אישור
                    </button>
                  )}
                  {user.status !== 'rejected' && (
                    <button 
                      type="button" 
                      onClick={() => review(user.username, 'reject')} 
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-rose-500/25 bg-rose-500/10 px-4 py-2.5 text-xs font-black text-rose-300 transition hover:bg-rose-500/20 sm:flex-none"
                    >
                      <X size={16} /> דחייה
                    </button>
                  )}
                  {user.status !== 'pending' && (
                    <button 
                      type="button" 
                      onClick={() => review(user.username, 'pending')} 
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-2.5 text-xs font-black text-amber-300 transition hover:bg-amber-500/20 sm:flex-none"
                    >
                      <Clock3 size={16} /> החזר להמתנה
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <div className="flex items-center gap-2 rounded-2xl border border-gray-800 bg-gray-950/35 p-4 text-[11px] font-semibold text-gray-500"><UserX size={17} className="text-rose-400" /> מנהל מערכת יכול לשנות את הסטטוס של כל משתמש בכל שלב - לאשר מחדש, לחסום, או להחזיר לבדיקה.</div>
    </div>
  );
}

