import React, { useState } from 'react';
import { Camera, Trash2, Save, Lock, Mail, Building2, User, Shield, Clock, Key, ChevronLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { prepareProfileImage } from '../services/imageService';
import { Link } from 'react-router-dom';

const roleLabel = (role) => {
  if (role === 'admin') return 'מנהל מערכת';
  if (role === 'manager') return 'מנהל';
  return 'עובד';
};

const roleColor = (role) => {
  if (role === 'admin') return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
  if (role === 'manager') return 'text-purple-400 bg-purple-500/10 border-purple-500/20';
  return 'text-[#00e6ff] bg-[#00e6ff]/10 border-[#00e6ff]/20';
};

const validatePassword = (password) => {
  if (password.length < 12) return 'הסיסמה חייבת להכיל לפחות 12 תווים.';
  if (!/[A-Z]/.test(password)) return 'הסיסמה חייבת להכיל אות גדולה באנגלית.';
  if (!/[a-z]/.test(password)) return 'הסיסמה חייבת להכיל אות קטנה באנגלית.';
  if (!/[0-9]/.test(password)) return 'הסיסמה חייבת להכיל לפחות ספרה אחת.';
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return 'הסיסמה חייבת להכיל תו מיוחד.';
  return '';
};

export default function UserProfile() {
  const { currentUser, updateCurrentProfile, updateCurrentPassword } = useApp();

  // --- Profile state ---
  const [username, setUsername] = useState(currentUser.username);
  const [avatar, setAvatar] = useState(currentUser.avatar || '');
  const [profileMsg, setProfileMsg] = useState(null);
  const [imageError, setImageError] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // --- Password state ---
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [pwdMsg, setPwdMsg] = useState(null);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  // --- Avatar upload ---
  const handleImageChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setImageError('');
    setProfileMsg(null);
    try {
      const compressed = await prepareProfileImage(file, 128);
      setIsSavingProfile(true);
      const result = await updateCurrentProfile({ username: currentUser.username, avatar: compressed });
      setIsSavingProfile(false);
      if (!result.success) throw new Error(result.message);
      setAvatar(compressed);
      setProfileMsg({ type: 'success', text: 'תמונת הפרופיל עודכנה בהצלחה.' });
    } catch (err) {
      setImageError(err.message);
    }
    event.target.value = '';
  };

  const handleRemoveAvatar = async () => {
    setIsSavingProfile(true);
    const result = await updateCurrentProfile({ username: currentUser.username, avatar: '' });
    setIsSavingProfile(false);
    if (result.success) {
      setAvatar('');
      setProfileMsg({ type: 'success', text: 'תמונת הפרופיל הוסרה.' });
      setImageError('');
    }
  };

  const handleSaveUsername = async (e) => {
    e.preventDefault();
    if (isSavingProfile) return;
    setIsSavingProfile(true);
    const result = await updateCurrentProfile({ username, avatar });
    setIsSavingProfile(false);
    setProfileMsg({ type: result.success ? 'success' : 'error', text: result.message });
  };

  // --- Password change ---
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (isSavingPassword) return;
    setPwdMsg(null);
    if (newPwd !== confirmPwd) {
      setPwdMsg({ type: 'error', text: 'הסיסמאות החדשות אינן תואמות.' });
      return;
    }
    const validationError = validatePassword(newPwd);
    if (validationError) {
      setPwdMsg({ type: 'error', text: validationError });
      return;
    }
    setIsSavingPassword(true);
    const result = await updateCurrentPassword(currentPwd, newPwd);
    setIsSavingPassword(false);
    if (result.success) {
      setCurrentPwd(''); setNewPwd(''); setConfirmPwd('');
    }
    setPwdMsg({ type: result.success ? 'success' : 'error', text: result.message });
  };

  const joinedDate = currentUser.createdAt
    ? new Intl.DateTimeFormat('he-IL', { dateStyle: 'long' }).format(new Date(currentUser.createdAt))
    : 'לא ידוע';

  const lastActivity = currentUser.lastActivity
    ? new Intl.DateTimeFormat('he-IL', { dateStyle: 'long', timeStyle: 'short' }).format(new Date(currentUser.lastActivity))
    : 'לא זמין';

  return (
    <div className="mx-auto max-w-3xl space-y-6" dir="rtl">

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">הפרופיל שלי</h1>
          <p className="mt-1 text-xs font-semibold text-gray-500">עריכת פרטים אישיים, תמונה וסיסמה</p>
        </div>
        <Link
          to="/"
          className="flex items-center gap-1.5 rounded-xl border border-gray-800 bg-gray-900/50 px-4 py-2 text-xs font-bold text-gray-400 hover:border-gray-700 hover:text-white transition-colors"
        >
          <ChevronLeft size={15} />
          חזרה
        </Link>
      </div>

      {/* ── TOP: Avatar + Basic Info Card ── */}
      <div className="overflow-hidden rounded-3xl border border-gray-800 bg-gray-900/45 shadow-2xl">
        {/* Gradient top bar */}
        <div className="h-24 bg-gradient-to-l from-[#00e6ff]/15 via-purple-500/10 to-transparent" />

        <div className="px-6 pb-6">
          {/* Avatar */}
          <div className="-mt-12 mb-5 flex items-end justify-between">
            <div className="relative group">
              <div className="h-24 w-24 overflow-hidden rounded-2xl border-4 border-gray-900 bg-gray-950 flex items-center justify-center shadow-xl">
                {avatar
                  ? <img src={avatar} alt="avatar" className="h-full w-full object-cover" />
                  : <span className="text-5xl text-gray-700">👤</span>
                }
              </div>

              {/* Upload button */}
              <label className="absolute -bottom-1 -right-1 grid h-8 w-8 cursor-pointer place-items-center rounded-xl bg-[#00e6ff] text-black shadow-lg hover:scale-110 transition-transform" title="שנה תמונה">
                <Camera size={15} />
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>

              {/* Remove button */}
              {avatar && (
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  className="absolute -top-1 -right-1 grid h-7 w-7 place-items-center rounded-lg bg-rose-500/90 text-white shadow-md hover:scale-110 transition-transform"
                  title="הסר תמונה"
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>

            {/* Role Badge */}
            <span className={`rounded-full border px-3 py-1 text-xs font-black ${roleColor(currentUser.role)}`}>
              {roleLabel(currentUser.role)}
            </span>
          </div>

          {/* Username title */}
          <h2 className="text-xl font-black text-white">{currentUser.username}</h2>
          <p className="mt-0.5 text-xs text-gray-500">{currentUser.email}</p>

          {/* Error for image */}
          {imageError && <p className="mt-2 text-[11px] font-bold text-rose-400">{imageError}</p>}
        </div>
      </div>

      {/* ── User Details Row ── */}
      <div className="grid gap-4 sm:grid-cols-2">

        {/* Email */}
        <div className="flex items-center gap-3 rounded-2xl border border-gray-800 bg-gray-900/40 px-4 py-3.5">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Mail size={16} />
          </span>
          <div className="min-w-0">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">דואר אלקטרוני</p>
            <p className="mt-0.5 truncate text-sm font-bold text-white">{currentUser.email || '—'}</p>
          </div>
        </div>

        {/* Department */}
        <div className="flex items-center gap-3 rounded-2xl border border-gray-800 bg-gray-900/40 px-4 py-3.5">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Building2 size={16} />
          </span>
          <div className="min-w-0">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">מחלקה / יחידה</p>
            <p className="mt-0.5 truncate text-sm font-bold text-white">{currentUser.department || '—'}</p>
          </div>
        </div>

        {/* Role */}
        <div className="flex items-center gap-3 rounded-2xl border border-gray-800 bg-gray-900/40 px-4 py-3.5">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Shield size={16} />
          </span>
          <div className="min-w-0">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">הרשאה</p>
            <p className="mt-0.5 truncate text-sm font-bold text-white">{roleLabel(currentUser.role)}</p>
          </div>
        </div>

        {/* Last Activity */}
        <div className="flex items-center gap-3 rounded-2xl border border-gray-800 bg-gray-900/40 px-4 py-3.5">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Clock size={16} />
          </span>
          <div className="min-w-0">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">כניסה אחרונה</p>
            <p className="mt-0.5 truncate text-sm font-bold text-white">{lastActivity}</p>
          </div>
        </div>
      </div>

      {/* ── Edit Username Card ── */}
      <div className="overflow-hidden rounded-3xl border border-gray-800 bg-gray-900/45 p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-gray-800">
          <User size={16} className="text-[#00e6ff]" />
          <h3 className="text-sm font-black text-white">עריכת שם משתמש</h3>
        </div>

        <form onSubmit={handleSaveUsername} className="flex gap-3">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="flex-1 rounded-xl border border-gray-800 bg-gray-950 px-4 py-2.5 text-sm text-white focus:border-[#00e6ff] focus:outline-none transition-colors"
            placeholder="שם משתמש חדש"
            minLength={3}
            required
          />
          <button
            type="submit"
            className="flex items-center gap-2 rounded-xl bg-[#00e6ff] px-5 py-2.5 text-xs font-black text-black hover:brightness-110 transition shrink-0"
          >
            <Save size={14} />
            שמור
          </button>
        </form>

        {profileMsg && (
          <p className={`text-[11px] font-bold ${profileMsg.type === 'success' ? 'text-emerald-400' : 'text-rose-400'}`}>
            {profileMsg.text}
          </p>
        )}
      </div>

      {/* ── Change Password Card ── */}
      <div className="overflow-hidden rounded-3xl border border-gray-800 bg-gray-900/45 p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-gray-800">
          <Key size={16} className="text-amber-400" />
          <h3 className="text-sm font-black text-white">שינוי סיסמה</h3>
        </div>

        <form onSubmit={handleChangePassword} className="space-y-3">
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">סיסמה נוכחית</label>
            <input
              type="password"
              value={currentPwd}
              onChange={(e) => setCurrentPwd(e.target.value)}
              className="w-full rounded-xl border border-gray-800 bg-gray-950 px-4 py-2.5 text-sm text-white focus:border-amber-500/50 focus:outline-none transition-colors"
              placeholder="הקלד סיסמה נוכחית"
              required
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">סיסמה חדשה</label>
              <input
                type="password"
                value={newPwd}
                onChange={(e) => setNewPwd(e.target.value)}
                className="w-full rounded-xl border border-gray-800 bg-gray-950 px-4 py-2.5 text-sm text-white focus:border-amber-500/50 focus:outline-none transition-colors"
                placeholder="לפחות 12 תווים"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">אימות סיסמה חדשה</label>
              <input
                type="password"
                value={confirmPwd}
                onChange={(e) => setConfirmPwd(e.target.value)}
                className="w-full rounded-xl border border-gray-800 bg-gray-950 px-4 py-2.5 text-sm text-white focus:border-amber-500/50 focus:outline-none transition-colors"
                placeholder="חזור על הסיסמה החדשה"
                required
              />
            </div>
          </div>

          <ul className="grid grid-cols-2 gap-1 rounded-xl bg-gray-950/60 border border-gray-900 p-3 text-[10px] text-gray-500 font-semibold">
            {[
              ['לפחות 12 תווים', newPwd.length >= 12],
              ['אות גדולה באנגלית', /[A-Z]/.test(newPwd)],
              ['אות קטנה באנגלית', /[a-z]/.test(newPwd)],
              ['לפחות ספרה אחת', /[0-9]/.test(newPwd)],
              ['תו מיוחד (!@#...)', /[!@#$%^&*(),.?":{}|<>]/.test(newPwd)],
            ].map(([label, ok]) => (
              <li key={label} className={`flex items-center gap-1 transition-colors ${ok ? 'text-emerald-400' : ''}`}>
                <span>{ok ? '✓' : '○'}</span> {label}
              </li>
            ))}
          </ul>

          <div className="flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/10 px-5 py-2.5 text-xs font-black text-amber-300 hover:bg-amber-500/20 transition"
            >
              <Lock size={14} />
              עדכן סיסמה
            </button>
          </div>
        </form>

        {pwdMsg && (
          <p className={`text-[11px] font-bold ${pwdMsg.type === 'success' ? 'text-emerald-400' : 'text-rose-400'}`}>
            {pwdMsg.text}
          </p>
        )}
      </div>

    </div>
  );
}
