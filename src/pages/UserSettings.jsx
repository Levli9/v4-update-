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
  const { currentUser, updateCurrentProfile, updateCurrentPassword, setActiveViewRole } = useApp();
  const [username, setUsername] = useState(currentUser.username);
  const [avatar, setAvatar] = useState(currentUser.avatar || '');
  const [profileMessage, setProfileMessage] = useState(null);
  const [imageError, setImageError] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState(null);
  const [activeSection, setActiveSection] = useState('profile');

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
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">הגדרות משתמש</h1>
          <p className="mt-1 text-xs font-semibold text-gray-500">ניהול פרטים אישיים, תמונת פרופיל וסיסמה</p>
        </div>
        <Link to="/" onClick={() => setActiveViewRole('employee')} className="rounded-xl border border-gray-800 bg-gray-900 px-4 py-2 text-xs font-bold text-gray-400 transition-colors hover:border-gray-700 hover:text-white">
          חזרה לפורטל הלמידה
        </Link>
      </div>

      <div className="overflow-hidden rounded-3xl border border-gray-800 bg-gray-900/45 shadow-2xl">
        <div className="grid grid-cols-2 border-b border-gray-800 bg-gray-950/40 p-2">
          <button type="button" onClick={() => setActiveSection('profile')} className={`flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-xs font-black transition-all ${activeSection === 'profile' ? 'bg-[#00e6ff] text-black shadow-lg shadow-cyan-950/30' : 'text-gray-500 hover:text-white'}`}><UserRound size={17} /> פרופיל אישי</button>
          <button type="button" onClick={() => setActiveSection('security')} className={`flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-xs font-black transition-all ${activeSection === 'security' ? 'bg-[#9d4edd] text-white shadow-lg shadow-purple-950/30' : 'text-gray-500 hover:text-white'}`}><KeyRound size={17} /> אבטחה וסיסמה</button>
        </div>

        {activeSection === 'profile' && <form onSubmit={handleProfileSubmit} className="p-6 sm:p-8">
          <div className="grid items-center gap-7 sm:grid-cols-[auto_1fr]">
            <div className="flex flex-col items-center">
              <div className="profile-avatar profile-avatar--large shadow-[0_0_30px_rgba(0,230,255,0.08)]">{avatar ? <img src={avatar} alt={`תמונת הפרופיל של ${username}`} /> : <span>👤</span>}</div>
              <div className="mt-3 flex gap-2">
                <label className="grid h-9 w-9 cursor-pointer place-items-center rounded-lg bg-[#00e6ff] text-black transition-transform hover:scale-105" title="העלאת תמונה"><Camera size={16} /><input type="file" accept="image/png,image/jpeg,image/webp" onChange={handleImageChange} className="sr-only" /></label>
                {avatar && <button type="button" onClick={() => setAvatar('')} className="grid h-9 w-9 place-items-center rounded-lg border border-rose-500/20 text-rose-400 hover:bg-rose-500/10" title="הסרת תמונה"><Trash2 size={15} /></button>}
              </div>
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-white">פרטי הפרופיל</h2>
              <p className="mt-1 text-[11px] font-semibold text-gray-500">עדכון השם והתמונה שמוצגים ברחבי המערכת</p>
              <label className="mt-5 block text-xs font-semibold text-gray-400">שם משתמש<input type="text" value={username} onChange={(event) => setUsername(event.target.value)} minLength={3} required className="mt-2 w-full rounded-xl border border-gray-800 bg-gray-950/70 px-4 py-3 text-sm text-white outline-none transition-colors focus:border-[#00e6ff]" /></label>
              <p className="mt-2 text-[9px] text-gray-600">PNG, JPG או WEBP עד 8MB · התמונה תיחתך לריבוע</p>
              {imageError && <p className="mt-2 text-xs font-bold text-rose-400">{imageError}</p>}
            </div>
          </div>
          {profileMessage && <p className={`mt-5 rounded-xl border p-3 text-xs font-bold ${messageClass(profileMessage.type)}`}>{profileMessage.text}</p>}
          <div className="mt-6 flex justify-end"><button type="submit" className="flex items-center gap-2 rounded-xl bg-[#00e6ff] px-6 py-3 text-xs font-black text-black hover:bg-[#4df4ff]"><Save size={16} /> שמירת שינויים</button></div>
        </form>}

        {activeSection === 'security' && <form onSubmit={handlePasswordSubmit} className="p-6 sm:p-8">
          <div className="mb-6"><h2 className="text-lg font-extrabold text-white">החלפת סיסמה</h2><p className="mt-1 text-[11px] font-semibold text-gray-500">בחר סיסמה ייחודית וחזקה שאינה בשימוש במערכות אחרות</p></div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-xs font-semibold text-gray-400 sm:col-span-2">סיסמה נוכחית<input type="password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} required autoComplete="current-password" className="mt-2 w-full rounded-xl border border-gray-800 bg-gray-950/70 px-4 py-3 text-sm text-white outline-none focus:border-[#9d4edd]" /></label>
            <label className="block text-xs font-semibold text-gray-400">סיסמה חדשה<input type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} required autoComplete="new-password" className="mt-2 w-full rounded-xl border border-gray-800 bg-gray-950/70 px-4 py-3 text-sm text-white outline-none focus:border-[#9d4edd]" /></label>
            <label className="block text-xs font-semibold text-gray-400">אימות סיסמה<input type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required autoComplete="new-password" className="mt-2 w-full rounded-xl border border-gray-800 bg-gray-950/70 px-4 py-3 text-sm text-white outline-none focus:border-[#9d4edd]" /></label>
          </div>
          <div className="mt-4 rounded-xl border border-purple-500/10 bg-purple-500/5 px-4 py-3 text-[10px] font-semibold text-gray-500">לפחות 12 תווים · אות גדולה וקטנה באנגלית · מספר · תו מיוחד</div>
          {passwordMessage && <p className={`mt-4 rounded-xl border p-3 text-xs font-bold ${messageClass(passwordMessage.type)}`}>{passwordMessage.text}</p>}
          <div className="mt-6 flex justify-end"><button type="submit" className="flex items-center gap-2 rounded-xl bg-[#9d4edd] px-6 py-3 text-xs font-black text-white hover:bg-purple-500"><KeyRound size={16} /> עדכון סיסמה</button></div>
        </form>}
      </div>
    </div>
  );
}
