import React, { useMemo, useState } from 'react';
import { Check, Clock3, ShieldCheck, UserCheck, UserX, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function AdminApprovals() {
  const { users, reviewRegistration } = useApp();
  const [message, setMessage] = useState('');

  const pendingUsers = useMemo(
    () => users.filter((user) => user.status === 'pending').sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [users]
  );
  const approvedCount = users.filter((user) => user.status === 'approved' && user.role !== 'admin').length;
  const rejectedCount = users.filter((user) => user.status === 'rejected').length;

  const review = (username, decision) => {
    const result = reviewRegistration(username, decision);
    setMessage(result.success
      ? decision === 'approve' ? `המשתמש ${username} אושר בהצלחה.` : `בקשת ${username} נדחתה.`
      : result.message);
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
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-xl border border-amber-500/15 bg-amber-500/5 px-4 py-3"><strong className="block text-xl text-amber-300">{pendingUsers.length}</strong><span className="text-[9px] font-bold text-gray-500">ממתינים</span></div>
            <div className="rounded-xl border border-emerald-500/15 bg-emerald-500/5 px-4 py-3"><strong className="block text-xl text-emerald-300">{approvedCount}</strong><span className="text-[9px] font-bold text-gray-500">מאושרים</span></div>
            <div className="rounded-xl border border-rose-500/15 bg-rose-500/5 px-4 py-3"><strong className="block text-xl text-rose-300">{rejectedCount}</strong><span className="text-[9px] font-bold text-gray-500">נדחו</span></div>
          </div>
        </div>
      </section>

      {message && <div className="rounded-xl border border-cyan-500/15 bg-cyan-500/5 px-4 py-3 text-xs font-bold text-cyan-200">{message}</div>}

      <section className="overflow-hidden rounded-3xl border border-gray-800 bg-gray-900/45 shadow-2xl">
        <header className="flex items-center justify-between border-b border-gray-800 px-5 py-4">
          <div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl border border-amber-400/15 bg-amber-400/8 text-amber-300"><Clock3 size={19} /></span><div><h2 className="font-black text-white">בקשות שממתינות לבדיקה</h2><p className="text-[10px] font-semibold text-gray-600">אישור ✓ מפעיל את החשבון · דחייה ✕ חוסמת כניסה</p></div></div>
          <span className="rounded-full bg-gray-950 px-3 py-1 text-[10px] font-black text-gray-500">{pendingUsers.length} בקשות</span>
        </header>

        {pendingUsers.length === 0 ? (
          <div className="grid min-h-64 place-items-center p-8 text-center"><div><UserCheck size={42} className="mx-auto text-emerald-500/70" /><h3 className="mt-4 font-black text-white">אין בקשות ממתינות</h3><p className="mt-1 text-xs text-gray-600">כל המשתמשים החדשים נבדקו.</p></div></div>
        ) : (
          <div className="divide-y divide-gray-800/80">
            {pendingUsers.map((user) => (
              <article key={user._id || user.username} className="flex flex-col gap-4 p-5 transition-colors hover:bg-gray-950/25 sm:flex-row sm:items-center">
                <div className="profile-avatar h-12 w-12 shrink-0">{user.avatar ? <img src={user.avatar} alt="" /> : <span>👤</span>}</div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2"><h3 className="font-black text-white">{user.username}</h3><span className={`rounded-full px-2.5 py-1 text-[9px] font-black ${user.requestedRole === 'manager' ? 'bg-purple-500/10 text-purple-300' : 'bg-cyan-500/10 text-cyan-300'}`}>{user.requestedRole === 'manager' ? 'מנהל' : 'עובד רגיל'}</span></div>
                  <p className="mt-1 truncate text-[11px] text-gray-500" dir="ltr">{user.email}</p>
                  <p className="mt-1 text-[10px] font-semibold text-gray-600">מחלקה: {user.department || 'כללי'}</p>
                </div>
                <div className="flex gap-2 sm:shrink-0">
                  <button type="button" onClick={() => review(user.username, 'approve')} className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-5 py-3 text-xs font-black text-emerald-300 transition hover:bg-emerald-500/20 sm:flex-none"><Check size={17} /> אישור</button>
                  <button type="button" onClick={() => review(user.username, 'reject')} className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-rose-500/25 bg-rose-500/10 px-5 py-3 text-xs font-black text-rose-300 transition hover:bg-rose-500/20 sm:flex-none"><X size={17} /> דחייה</button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <div className="flex items-center gap-2 rounded-2xl border border-gray-800 bg-gray-950/35 p-4 text-[11px] font-semibold text-gray-500"><UserX size={17} className="text-rose-400" /> חשבון שנדחה לא יוכל להתחבר עד שמנהל המערכת ישנה את מצבו.</div>
    </div>
  );
}

