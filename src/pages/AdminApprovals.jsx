import React, { useMemo, useState } from 'react';
import { Check, Clock3, Copy, ShieldCheck, UserCheck, UserX, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

// ── User Detail Modal ──────────────────────────────────────────────────────────
function UserDetailModal({ user, onClose }) {
  const [copied, setCopied] = useState('');

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(label);
      setTimeout(() => setCopied(''), 1500);
    });
  };

  const isCertified = user.progress?.finalExam?.passed;
  const certDate = isCertified
    ? new Intl.DateTimeFormat('he-IL', { dateStyle: 'long' }).format(new Date(user.progress.finalExam.passedAt))
    : null;

  const completedCount = user.progress?.completedSubjects?.length || 0;
  const totalSubjects = 11;
  const progressPct = Math.round((completedCount / totalSubjects) * 100);

  const joinDate = user.createdAt
    ? new Intl.DateTimeFormat('he-IL', { dateStyle: 'long' }).format(new Date(user.createdAt))
    : 'דמו';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-gray-800 bg-gray-950 shadow-2xl shadow-black/60">

        {/* Header gradient banner */}
        <div className={`h-20 bg-gradient-to-l ${
          user.role === 'admin' ? 'from-rose-500/20 via-purple-500/15 to-transparent' :
          user.role === 'manager' ? 'from-purple-500/20 via-blue-500/10 to-transparent' :
          isCertified ? 'from-emerald-500/20 via-cyan-500/10 to-transparent' :
          'from-[#00e6ff]/10 via-gray-800/0 to-transparent'
        }`} />

        {/* Close */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-xl bg-gray-900 text-gray-500 hover:text-white transition"
        >
          <X size={16} />
        </button>

        <div className="px-6 pb-7">

          {/* Avatar + name */}
          <div className="-mt-10 flex items-end gap-3 mb-5">
            <div className="h-20 w-20 overflow-hidden rounded-2xl border-4 border-gray-950 bg-gray-900 flex items-center justify-center shadow-xl text-4xl shrink-0">
              {user.avatar ? <img src={user.avatar} alt="" className="h-full w-full object-cover" /> : '👤'}
            </div>
            <div className="pb-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-black text-white">{user.username}</h2>
                {isCertified && (
                  <span className="flex items-center gap-1 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2 py-0.5 text-[9px] font-black text-emerald-300">
                    🏅 מוסמך
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500">{user.email}</p>
            </div>
          </div>

          {/* Details grid */}
          <div className="space-y-2 text-xs">

            {/* Role + Dept */}
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-3">
                <p className="text-[9px] font-bold text-gray-600 uppercase tracking-wider mb-1">הרשאה</p>
                <p className="font-bold text-white">
                  {user.role === 'admin' ? '🛡️ מנהל מערכת' : user.role === 'manager' ? '👔 מנהל' : '👤 עובד'}
                </p>
              </div>
              <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-3">
                <p className="text-[9px] font-bold text-gray-600 uppercase tracking-wider mb-1">מחלקה</p>
                <p className="font-bold text-white truncate">{user.department || '—'}</p>
              </div>
            </div>

            {/* Status + XP */}
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-3">
                <p className="text-[9px] font-bold text-gray-600 uppercase tracking-wider mb-1">סטטוס</p>
                <p className={`font-bold ${
                  user.status === 'approved' ? 'text-emerald-400' :
                  user.status === 'rejected' ? 'text-rose-400' : 'text-amber-400'
                }`}>
                  {user.status === 'approved' ? '✓ פעיל' : user.status === 'rejected' ? '✕ חסום' : '⏳ ממתין'}
                </p>
              </div>
              <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-3">
                <p className="text-[9px] font-bold text-gray-600 uppercase tracking-wider mb-1">ניסיון XP</p>
                <p className="font-bold text-[#00e6ff]">{(user.progress?.xp || 0).toLocaleString()} XP</p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-3">
              <div className="flex justify-between mb-1.5">
                <p className="text-[9px] font-bold text-gray-600 uppercase tracking-wider">התקדמות קורסים</p>
                <p className="text-[9px] font-black text-white">{completedCount}/{totalSubjects} יחידות</p>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-800">
                <div
                  className="h-full rounded-full bg-gradient-to-l from-[#00e6ff] to-purple-500 transition-all"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              {isCertified && certDate && (
                <p className="mt-1.5 text-[10px] text-emerald-400 font-bold">✓ הוסמך ב-{certDate}</p>
              )}
            </div>

            {/* Registration info */}
            <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-3">
              <p className="text-[9px] font-bold text-gray-600 uppercase tracking-wider mb-1.5">פרטי רישום</p>
              <div className="flex items-center justify-between mb-1">
                <span className="text-gray-500">שם משתמש:</span>
                <div className="flex items-center gap-1">
                  <span className="font-bold text-white font-mono">{user.username}</span>
                  <button type="button" onClick={() => copyToClipboard(user.username, 'username')}
                    className="rounded-md bg-gray-800 p-0.5 hover:bg-gray-700 transition text-gray-500 hover:text-white">
                    {copied === 'username' ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">אימייל:</span>
                <div className="flex items-center gap-1">
                  <span className="font-bold text-white text-[10px]">{user.email || '—'}</span>
                  {user.email && (
                    <button type="button" onClick={() => copyToClipboard(user.email, 'email')}
                      className="rounded-md bg-gray-800 p-0.5 hover:bg-gray-700 transition text-gray-500 hover:text-white">
                      {copied === 'email' ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main AdminApprovals Component ─────────────────────────────────────────────
export default function AdminApprovals() {
  const { users, reviewRegistration } = useApp();
  const [message, setMessage] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [activeFilter, setActiveFilter] = useState('pending');
  const [reviewingUser, setReviewingUser] = useState('');

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

  const review = async (username, decision) => {
    if (reviewingUser) return;
    setReviewingUser(username);
    const result = await reviewRegistration(username, decision);
    setReviewingUser('');
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
      {selectedUser && (
        <UserDetailModal user={selectedUser} onClose={() => setSelectedUser(null)} />
      )}

      <section className="overflow-hidden rounded-3xl border border-gray-800 bg-gradient-to-l from-cyan-500/[0.08] via-gray-900/55 to-purple-500/[0.08] p-6 shadow-2xl sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-5">
          <div>
            <div className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-[#00e6ff]">
              <ShieldCheck size={15} /> ShieldX Access Control
            </div>
            <h1 className="text-2xl font-black text-white sm:text-3xl">ניהול ואישור משתמשים</h1>
            <p className="mt-2 text-xs font-semibold text-gray-500">
              בדיקת בקשות הרשמה · צפייה בפרטי חשבון · שינוי סטטוס
            </p>
          </div>
          
          {/* Clickable Status Filters */}
          <div className="grid grid-cols-3 gap-3 text-center w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setActiveFilter('pending')}
              className={`rounded-xl border px-5 py-3 transition-all cursor-pointer text-right flex flex-col justify-between min-w-28 ${
                activeFilter === 'pending'
                  ? 'border-amber-500 bg-amber-500/10 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                  : 'border-gray-800 bg-gray-900/40 hover:border-amber-500/40'
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
                  : 'border-gray-800 bg-gray-900/40 hover:border-emerald-500/40'
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
                  : 'border-gray-800 bg-gray-900/40 hover:border-rose-500/40'
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
                לחץ על שם משתמש לצפייה בפרטי החשבון וההתקדמות
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
            {filteredUsers.map((user) => {
              const isCertified = user.progress?.finalExam?.passed;
              return (
                <article key={user._id || user.username} className="flex flex-col gap-4 p-5 transition-colors hover:bg-gray-950/25 sm:flex-row sm:items-center">
                  {/* Clickable avatar + name area */}
                  <button
                    type="button"
                    onClick={() => setSelectedUser(user)}
                    className="flex items-center gap-3 text-right flex-1 min-w-0 group"
                  >
                    <div className="profile-avatar h-12 w-12 shrink-0 ring-2 ring-transparent group-hover:ring-[#00e6ff]/30 transition-all rounded-2xl">
                      {user.avatar ? <img src={user.avatar} alt="" /> : <span>👤</span>}
                    </div>
                    <div className="min-w-0 flex-1 text-right">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-black text-white group-hover:text-[#00e6ff] transition-colors">{user.username}</h3>
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
                        {isCertified && (
                          <span className="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2 py-0.5 text-[8px] font-black text-emerald-300">
                            🏅 מוסמך
                          </span>
                        )}
                      </div>
                      <p className="mt-1 truncate text-[11px] text-gray-500" dir="ltr">{user.email}</p>
                      <p className="mt-0.5 text-[10px] font-semibold text-gray-600">מחלקה: {user.department || 'כללי'}</p>
                    </div>
                    {/* Arrow hint */}
                    <span className="text-[9px] font-bold text-gray-700 group-hover:text-[#00e6ff] transition-colors shrink-0">פרטים ›</span>
                  </button>
                  
                  {/* Action Controls */}
                  <div className="flex gap-2 sm:shrink-0">
                    {user.status !== 'approved' && (
                      <button 
                        type="button" 
                        onClick={() => review(user.username, 'approve')} 
                        disabled={Boolean(reviewingUser)}
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-2.5 text-xs font-black text-emerald-300 transition hover:bg-emerald-500/20 sm:flex-none"
                      >
                        <Check size={16} /> אישור
                      </button>
                    )}
                    {user.status !== 'rejected' && (
                      <button 
                        type="button" 
                        onClick={() => review(user.username, 'reject')} 
                        disabled={Boolean(reviewingUser)}
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-rose-500/25 bg-rose-500/10 px-4 py-2.5 text-xs font-black text-rose-300 transition hover:bg-rose-500/20 sm:flex-none"
                      >
                        <X size={16} /> דחייה
                      </button>
                    )}
                    {user.status !== 'pending' && (
                      <button 
                        type="button" 
                        onClick={() => review(user.username, 'pending')} 
                        disabled={Boolean(reviewingUser)}
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-2.5 text-xs font-black text-amber-300 transition hover:bg-amber-500/20 sm:flex-none"
                      >
                        <Clock3 size={16} /> החזר להמתנה
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section className="overflow-hidden rounded-3xl border border-cyan-500/15 bg-cyan-500/5 p-6 sm:p-8 space-y-3">
        <h3 className="text-md font-black text-white">📧 שירות שחזור סיסמה</h3>
        <p className="text-xs leading-6 text-gray-400">
          מטעמי אבטחה, מפתחות Brevo ו־AI וכתובת שרת ה־API מוגדרים רק בסביבת השרת ואינם מוצגים או נשמרים בדפדפן.
          מנהל התשתית מגדיר את <span dir="ltr" className="font-mono text-cyan-300">BREVO_API_KEY</span>,
          <span dir="ltr" className="font-mono text-cyan-300"> BREVO_SENDER_EMAIL</span> ו־
          <span dir="ltr" className="font-mono text-cyan-300">VITE_API_BASE_URL</span> בזמן הפריסה.
        </p>
      </section>

      <div className="flex items-center gap-2 rounded-2xl border border-gray-800 bg-gray-950/35 p-4 text-[11px] font-semibold text-gray-500">
        <UserX size={17} className="text-rose-400" /> מנהל מערכת יכול לשנות את הסטטוס של כל משתמש בכל שלב - לאשר מחדש, לחסום, או להחזיר לבדיקה.
      </div>
    </div>
  );
}
