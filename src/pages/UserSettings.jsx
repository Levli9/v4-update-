import React, { useState } from 'react';
import { Camera, KeyRound, Save, Trash2, UserRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { prepareProfileImage } from '../services/imageService';

const validatePassword = (password) => {
  if (password.length < 12) return 'הסיסמה החדשה חייבת להכיל לפחות 12 תווים.';
  if (!/[A-Z]/.test(password)) return 'הסיסמה חייבת להכיל אות גדולה באנגלית.';
  if (!/[a-z]/.test(password)) return 'הסיסמה חייבת להכיל אות קטנה באנגלית.';
  if (!/[0-9]/.test(password)) return 'הסיסמה חייבת להכיל לפחות ספרה אחת.';
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return 'הסיסמה חייבת להכיל תו מיוחד.';
  return '';
};

export default function UserSettings() {
  const { currentUser, updateCurrentProfile, updateCurrentPassword } = useApp();
  const [username, setUsername] = useState(currentUser.username);
  const [avatar, setAvatar] = useState(currentUser.avatar || '');
  const [profileMessage, setProfileMessage] = useState(null);
  const [imageError, setImageError] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState(null);

  const handleImageChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImageError('');
    try {
      setAvatar(await prepareProfileImage(file));
    } catch (error) {
      setImageError(error.message);
    }
    event.target.value = '';
  };

  const handleProfileSubmit = (event) => {
    event.preventDefault();
    const result = updateCurrentProfile({ username, avatar });
    setProfileMessage({ type: result.success ? 'success' : 'error', text: result.message });
  };

  const handlePasswordSubmit = (event) => {
    event.preventDefault();
    setPasswordMessage(null);

    const validationError = validatePassword(newPassword);
    if (validationError) {
      setPasswordMessage({ type: 'error', text: validationError });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'אימות הסיסמה אינו תואם לסיסמה החדשה.' });
      return;
    }

    const result = updateCurrentPassword(currentPassword, newPassword);
    setPasswordMessage({ type: result.success ? 'success' : 'error', text: result.message });
    if (result.success) {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  const messageClass = (type) => type === 'success'
    ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400'
    : 'border-rose-500/20 bg-rose-500/10 text-rose-400';

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">הגדרות משתמש</h1>
          <p className="mt-1 text-xs font-semibold text-gray-500">ניהול פרטים אישיים, תמונת פרופיל וסיסמה</p>
        </div>
        <Link to="/" className="rounded-xl border border-gray-800 bg-gray-900 px-4 py-2 text-xs font-bold text-gray-400 transition-colors hover:border-gray-700 hover:text-white">
          חזרה לפורטל הלמידה
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <form onSubmit={handleProfileSubmit} className="rounded-3xl border border-gray-800 bg-gray-900/60 p-6 shadow-xl">
          <div className="mb-6 flex items-center gap-3 border-b border-gray-800 pb-4">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#00e6ff]/10 text-[#00e6ff]"><UserRound size={21} /></span>
            <div>
              <h2 className="font-extrabold text-white">פרטי הפרופיל</h2>
              <p className="text-[11px] text-gray-500">התמונה והשם יוצגו ברחבי המערכת</p>
            </div>
          </div>

          <div className="mb-6 flex flex-col items-center">
            <div className="profile-avatar profile-avatar--large">
              {avatar ? <img src={avatar} alt={`תמונת הפרופיל של ${username}`} /> : <span>👤</span>}
            </div>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <label className="flex cursor-pointer items-center gap-2 rounded-xl bg-[#00e6ff] px-4 py-2 text-xs font-extrabold text-black transition-colors hover:bg-[#4df4ff]">
                <Camera size={16} />
                {avatar ? 'החלפת תמונה' : 'העלאת תמונה'}
                <input type="file" accept="image/png,image/jpeg,image/webp" onChange={handleImageChange} className="sr-only" />
              </label>
              {avatar && (
                <button type="button" onClick={() => setAvatar('')} className="flex items-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/5 px-4 py-2 text-xs font-bold text-rose-400 hover:bg-rose-500/10">
                  <Trash2 size={15} /> הסרת תמונה
                </button>
              )}
            </div>
            <p className="mt-2 text-center text-[10px] text-gray-600">PNG, JPG או WEBP עד 8MB. התמונה תיחתך לריבוע.</p>
            {imageError && <p className="mt-2 text-xs font-bold text-rose-400">{imageError}</p>}
          </div>

          <label className="block text-xs font-semibold text-gray-400">
            שם משתמש
            <input
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              minLength={3}
              required
              className="mt-2 w-full rounded-xl border border-gray-850 bg-gray-950/60 px-4 py-3 text-sm text-white outline-none transition-colors focus:border-[#00e6ff]"
            />
          </label>

          {profileMessage && <p className={`mt-4 rounded-xl border p-3 text-xs font-bold ${messageClass(profileMessage.type)}`}>{profileMessage.text}</p>}

          <button type="submit" className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#00e6ff] px-4 py-3 text-sm font-black text-black transition-colors hover:bg-[#4df4ff]">
            <Save size={17} /> שמירת פרטי הפרופיל
          </button>
        </form>

        <form onSubmit={handlePasswordSubmit} className="rounded-3xl border border-gray-800 bg-gray-900/60 p-6 shadow-xl">
          <div className="mb-6 flex items-center gap-3 border-b border-gray-800 pb-4">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#9d4edd]/10 text-purple-400"><KeyRound size={21} /></span>
            <div>
              <h2 className="font-extrabold text-white">החלפת סיסמה</h2>
              <p className="text-[11px] text-gray-500">נדרש להזין את הסיסמה הנוכחית</p>
            </div>
          </div>

          <div className="space-y-4">
            <label className="block text-xs font-semibold text-gray-400">
              סיסמה נוכחית
              <input type="password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} required autoComplete="current-password" className="mt-2 w-full rounded-xl border border-gray-850 bg-gray-950/60 px-4 py-3 text-sm text-white outline-none transition-colors focus:border-[#9d4edd]" />
            </label>
            <label className="block text-xs font-semibold text-gray-400">
              סיסמה חדשה
              <input type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} required autoComplete="new-password" className="mt-2 w-full rounded-xl border border-gray-850 bg-gray-950/60 px-4 py-3 text-sm text-white outline-none transition-colors focus:border-[#9d4edd]" />
            </label>
            <label className="block text-xs font-semibold text-gray-400">
              אימות סיסמה חדשה
              <input type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required autoComplete="new-password" className="mt-2 w-full rounded-xl border border-gray-850 bg-gray-950/60 px-4 py-3 text-sm text-white outline-none transition-colors focus:border-[#9d4edd]" />
            </label>
          </div>

          <p className="mt-4 text-[10px] leading-relaxed text-gray-600">לפחות 12 תווים, אות גדולה וקטנה באנגלית, מספר ותו מיוחד.</p>
          {passwordMessage && <p className={`mt-4 rounded-xl border p-3 text-xs font-bold ${messageClass(passwordMessage.type)}`}>{passwordMessage.text}</p>}

          <button type="submit" className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#9d4edd] px-4 py-3 text-sm font-black text-white transition-colors hover:bg-purple-500">
            <KeyRound size={17} /> החלפת סיסמה
          </button>
        </form>
      </div>
    </div>
  );
}
