// src/pages/Login.jsx
import React, { useState, useEffect } from 'react';
import { Camera, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import ShieldXLogo from '../components/ShieldXLogo';
import ShieldXWordmark from '../components/ShieldXWordmark';
import PasswordInput from '../components/PasswordInput';
import { prepareProfileImage } from '../services/imageService';
import loginBackground from '../assets/login-cybersecurity.jpg';

export default function Login() {
  const { login, register, users, requestPasswordReset, validateResetToken, submitPasswordReset, changePassword } = useApp();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('login'); // 'login' or 'register'
  
  // Login State
  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginStep, setLoginStep] = useState(1); // 1: credentials, 2: 2FA OTP
  const [loginOtpCode, setLoginOtpCode] = useState('');
  const [generatedLoginOtp, setGeneratedLoginOtp] = useState(null);
  const [loginOtpStatusMsg, setLoginOtpStatusMsg] = useState('');

  // Register State
  const [regUser, setRegUser] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPass, setRegPass] = useState('');
  const [regRole, setRegRole] = useState('employee');
  const [regDepartment, setRegDepartment] = useState('כללי');
  const [regAvatar, setRegAvatar] = useState('');
  const [regImageError, setRegImageError] = useState('');
  const [regSuccess, setRegSuccess] = useState('');
  const [regError, setRegError] = useState('');

  // Recovery State (Forgot Password modal)
  const [isRecoveryOpen, setIsRecoveryOpen] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoveryStep, setRecoveryStep] = useState(1); // 1 or 2
  const [recoveryStatusMsg, setRecoveryStatusMsg] = useState('');
  const [brevoStatus, setBrevoStatus] = useState(''); // 'sent', 'error', etc.

  // Password Reset URL Token State
  const [resetToken, setResetToken] = useState(null);
  const [tokenEmail, setTokenEmail] = useState('');
  const [isVerifyingToken, setIsVerifyingToken] = useState(false);
  const [tokenError, setTokenError] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');
  const [resetError, setResetError] = useState('');

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setLoginError('');
    const res = login(loginUser, loginPass);
    if (!res.success) {
      setLoginError(res.message);
    } else {
      const destination = res.user?.role === 'admin' ? '/admin' : '/';
      window.location.hash = `#${destination}`;
      navigate(destination, { replace: true });
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setRegError('');
    setRegSuccess('');

    // Strict Password Validation Rules
    if (regPass.length < 12) {
      setRegError("❌ הסיסמה חייבת להכיל לפחות 12 תווים!");
      return;
    }
    if (!/[A-Z]/.test(regPass)) {
      setRegError("❌ הסיסמה חייבת להכיל לפחות אות אחת גדולה (A-Z)!");
      return;
    }
    if (!/[a-z]/.test(regPass)) {
      setRegError("❌ הסיסמה חייבת להכיל לפחות אות אחת קטנה (a-z)!");
      return;
    }
    if (!/[0-9]/.test(regPass)) {
      setRegError("❌ הסיסמה חייבת להכיל לפחות ספרה אחת (0-9)!");
      return;
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(regPass)) {
      setRegError("❌ הסיסמה חייבת להכיל לפחות תו מיוחד אחד (למשל !@#$)!");
      return;
    }

    const res = await register(regUser, regPass, regEmail, regAvatar, regRole, regDepartment);
    if (res.success) {
      setRegSuccess('ההרשמה נשלחה בהצלחה וממתינה לאישור מנהל המערכת. לאחר האישור ניתן יהיה להתחבר.');
      setRegUser('');
      setRegEmail('');
      setRegPass('');
      setRegAvatar('');
      setRegRole('employee');
      setRegDepartment('כללי');
    } else {
      setRegError(res.message);
    }
  };

  const handleRegistrationImage = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setRegImageError('');
    try {
      setRegAvatar(await prepareProfileImage(file));
    } catch (error) {
      setRegImageError(error.message);
    }
    event.target.value = '';
  };

  useEffect(() => {
    // Check if URL hash has token parameter
    const hash = window.location.hash || '';
    if (hash.includes('/reset-password')) {
      const queryStr = hash.split('?')[1] || '';
      const params = new URLSearchParams(queryStr);
      const token = params.get('token');
      if (token) {
        setResetToken(token);
        verifyToken(token);
      }
    }
  }, []);

  const verifyToken = async (token) => {
    setIsVerifyingToken(true);
    setTokenError('');
    const res = await validateResetToken(token);
    setIsVerifyingToken(false);
    if (res.success) {
      setTokenEmail(res.email);
    } else {
      setTokenError(res.message || 'הקישור אינו תקין או פג תוקף.');
    }
  };

  const handlePasswordResetSubmit = async (e) => {
    e.preventDefault();
    setResetError('');

    if (newPassword.length < 12) {
      setResetError("❌ הסיסמה חייבת להכיל לפחות 12 תווים!");
      return;
    }
    if (!/[A-Z]/.test(newPassword)) {
      setResetError("❌ הסיסמה חייבת להכיל לפחות אות אחת גדולה (A-Z)!");
      return;
    }
    if (!/[a-z]/.test(newPassword)) {
      setResetError("❌ הסיסמה חייבת להכיל לפחות אות אחת קטנה (a-z)!");
      return;
    }
    if (!/[0-9]/.test(newPassword)) {
      setResetError("❌ הסיסמה חייבת להכיל לפחות ספרה אחת (0-9)!");
      return;
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) {
      setResetError("❌ הסיסמה חייבת להכיל לפחות תו מיוחד אחד (למשל !@#$)!");
      return;
    }
    if (newPassword !== confirmPassword) {
      setResetError("❌ הסיסמאות אינן תואמות!");
      return;
    }

    const res = await submitPasswordReset(resetToken, newPassword);
    if (res.success) {
      setResetSuccess("הסיסמה שונתה בהצלחה במערכת! כעת תוכל להתחבר.");
    } else {
      setResetError(`❌ שגיאה: ${res.message}`);
    }
  };

  const startRecovery = async () => {
    setBrevoStatus('');
    setRecoveryStatusMsg('');
    const match = users.find(u => u.email.toLowerCase() === recoveryEmail.trim().toLowerCase());
    if (!match) {
      alert("❌ דואר אלקטרוני זה אינו רשום במערכת!");
      return;
    }

    setBrevoStatus('sending');
    setRecoveryStatusMsg('שולח בקשת שחזור...');

    const result = await requestPasswordReset(match.email);
    
    if (result.success) {
      setBrevoStatus('sent');
      setRecoveryStatusMsg(`קישור לאיפוס סיסמה נשלח בהצלחה לכתובת ${match.email} באמצעות Brevo API. אנא בדוק את תיבת הדואר הנכנס שלך.`);
      setRecoveryStep(2);
    } else {
      setBrevoStatus('error');
      setRecoveryStatusMsg(`שגיאה בשליחת המייל: ${result.message}`);
    }
  };

  const closeRecovery = () => {
    setIsRecoveryOpen(false);
    setRecoveryEmail('');
    setRecoveryStep(1);
    setRecoveryStatusMsg('');
    setBrevoStatus('');
  };

  if (resetToken) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center scale-[1.02]"
          style={{ backgroundImage: `url(${loginBackground})` }}
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-[linear-gradient(110deg,rgba(2,5,14,0.97)_0%,rgba(3,8,20,0.82)_48%,rgba(3,6,15,0.58)_100%)]" aria-hidden="true" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_0%,rgba(0,0,0,0.48)_100%)]" aria-hidden="true" />

        <div className="max-w-md w-full space-y-8 bg-[#080d18]/88 border border-cyan-400/20 rounded-3xl p-8 shadow-[0_30px_90px_rgba(0,0,0,0.72)] backdrop-blur-xl relative z-10" dir="rtl">
          <div className="text-center">
            <div className="flex justify-center">
              <ShieldXLogo />
            </div>
            <h2 className="mt-5 text-2xl font-extrabold text-white">איפוס סיסמה חדשה</h2>
            {tokenEmail && <p className="mt-2 text-sm text-gray-400">איפוס סיסמה עבור: <span className="text-[#00e6ff] font-bold">{tokenEmail}</span></p>}
          </div>

          {isVerifyingToken && (
            <div className="text-center py-8 text-[#00e6ff] font-bold animate-pulse">
              מבצע אימות מול שרת Brevo...
            </div>
          )}

          {tokenError && (
            <div className="space-y-4 text-center">
              <div className="rounded-xl border border-red-500/20 bg-red-950/20 p-4 text-center text-sm font-bold text-red-400">
                {tokenError}
              </div>
              <button
                onClick={() => {
                  setResetToken(null);
                  window.location.hash = '#/';
                }}
                className="w-full py-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-white font-extrabold text-sm transition-all"
              >
                חזור לדף ההתחברות
              </button>
            </div>
          )}

          {!isVerifyingToken && !tokenError && (
            <form onSubmit={handlePasswordResetSubmit} className="space-y-6">
              {resetError && <div className="rounded-xl border border-red-500/20 bg-red-950/20 p-3 text-center text-xs font-bold text-red-450">{resetError}</div>}
              {resetSuccess ? (
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/20 p-4 text-center text-xs font-bold leading-6 text-emerald-400">
                  <span className="mb-1 block text-lg">✓</span>
                  <div>{resetSuccess}</div>
                  <button
                    type="button"
                    onClick={() => {
                      setResetToken(null);
                      setResetSuccess('');
                      window.location.hash = '#/';
                    }}
                    className="mt-3 block w-full py-3 rounded-xl bg-[#00e6ff] hover:bg-[#00b8d4] text-black font-black text-sm transition-colors"
                  >
                    התחבר כעת
                  </button>
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 mb-2">סיסמה חדשה</label>
                      <PasswordInput
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="לפחות 12 תווים, אות גדולה, קטנה, מספר ותו מיוחד"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 mb-2">אימות סיסמה חדשה</label>
                      <PasswordInput
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="הקלד שוב את הסיסמה החדשה"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-black font-extrabold text-sm transition-all"
                  >
                    שמור סיסמה והתחבר
                  </button>
                </>
              )}
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center scale-[1.02]"
        style={{ backgroundImage: `url(${loginBackground})` }}
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-[linear-gradient(110deg,rgba(2,5,14,0.97)_0%,rgba(3,8,20,0.82)_48%,rgba(3,6,15,0.58)_100%)]" aria-hidden="true" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_0%,rgba(0,0,0,0.48)_100%)]" aria-hidden="true" />

      <div className="max-w-md w-full space-y-8 bg-[#080d18]/88 border border-cyan-400/20 rounded-3xl p-8 shadow-[0_30px_90px_rgba(0,0,0,0.72)] backdrop-blur-xl relative z-10">
        
        {/* Title */}
        <div className="text-center">
          <div className="flex justify-center">
            <ShieldXLogo />
          </div>
          <h2 className="mt-5 flex flex-wrap items-center justify-center gap-x-2 gap-y-2 text-2xl font-extrabold text-white">
            <span>ברוכים הבאים למערכת</span>
            <ShieldXWordmark className="text-[1.08em]" />
          </h2>
          <p className="mt-2 text-sm text-gray-400 font-semibold">מערכת הדרכת עובדים בתחום הסייבר</p>
        </div>

        {/* Tab Selectors */}
        <div className="flex border-b border-gray-850">
          <button
            onClick={() => { setActiveTab('login'); setRegError(''); setRegSuccess(''); }}
            className={`flex-1 text-center py-3 font-bold text-sm border-b-2 transition-all ${
              activeTab === 'login' ? 'border-[#00e6ff] text-[#00e6ff]' : 'border-transparent text-gray-400'
            }`}
          >
            התחברות
          </button>
          <button
            onClick={() => { setActiveTab('register'); setLoginError(''); }}
            className={`flex-1 text-center py-3 font-bold text-sm border-b-2 transition-all ${
              activeTab === 'register' ? 'border-[#9d4edd] text-[#9d4edd]' : 'border-transparent text-gray-400'
            }`}
          >
            הרשמה
          </button>
        </div>

        {/* Login Form */}
        {activeTab === 'login' && (
          <form className="mt-6 space-y-6" onSubmit={handleLoginSubmit}>
            {loginError && (
              <div className="p-3 text-xs bg-red-950/20 border border-red-500/20 text-red-400 rounded-lg text-center">
                {loginError}
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-2">שם משתמש</label>
                <input
                  type="text"
                  required
                  value={loginUser}
                  onChange={(e) => setLoginUser(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-gray-950/60 border border-gray-850 text-white text-sm focus:border-[#00e6ff] focus:outline-none transition-all"
                  placeholder="הזן שם משתמש..."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-2">סיסמה</label>
                <PasswordInput
                  required
                  value={loginPass}
                  onChange={(e) => setLoginPass(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-gray-950/60 border border-gray-850 text-white text-sm focus:border-[#00e6ff] focus:outline-none transition-all"
                  placeholder="הזן סיסמה..."
                />
              </div>
            </div>

            <div className="flex justify-between items-center text-xs">
              <button
                type="button"
                onClick={() => setIsRecoveryOpen(true)}
                className="text-gray-400 hover:text-[#00e6ff] transition-colors"
              >
                שכחת את הסיסמה?
              </button>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-[#00e6ff] hover:bg-[#00e6ff]/90 text-black font-extrabold text-sm transition-all shadow-lg shadow-cyan-950/30"
            >
              התחבר למערכת
            </button>
          </form>
        )}

        {/* Register Form */}
        {activeTab === 'register' && (
          <form className="mt-6 space-y-6" onSubmit={handleRegisterSubmit}>
            <div className="space-y-4">
              <div className="flex flex-col items-center rounded-2xl border border-gray-800 bg-gray-950/35 p-4">
                <div className="profile-avatar profile-avatar--large">
                  {regAvatar ? <img src={regAvatar} alt="תצוגה מקדימה של תמונת הפרופיל" /> : <span>👤</span>}
                </div>
                <div className="mt-3 flex flex-wrap justify-center gap-2">
                  <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-[#9d4edd]/25 bg-[#9d4edd]/10 px-4 py-2 text-xs font-bold text-purple-300 transition-colors hover:bg-[#9d4edd]/20">
                    <Camera size={15} />
                    {regAvatar ? 'החלפת תמונה' : 'הוספת תמונת פרופיל'}
                    <input type="file" accept="image/png,image/jpeg,image/webp" onChange={handleRegistrationImage} className="sr-only" />
                  </label>
                  {regAvatar && (
                    <button type="button" onClick={() => setRegAvatar('')} className="flex items-center gap-1.5 rounded-xl border border-rose-500/20 px-3 py-2 text-xs font-bold text-rose-400">
                      <Trash2 size={14} /> הסרה
                    </button>
                  )}
                </div>
                <p className="mt-2 text-center text-[10px] text-gray-600">לא חובה · PNG, JPG או WEBP עד 8MB</p>
                {regImageError && <p className="mt-2 text-center text-xs font-bold text-rose-400">{regImageError}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-2">שם משתמש</label>
                <input
                  type="text"
                  required
                  value={regUser}
                  onChange={(e) => setRegUser(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-gray-950/60 border border-gray-850 text-white text-sm focus:border-[#9d4edd] focus:outline-none transition-all"
                  placeholder="שם משתמש ייחודי..."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-2">כתובת דואר אלקטרוני</label>
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-gray-950/60 border border-gray-850 text-white text-sm focus:border-[#9d4edd] focus:outline-none transition-all"
                  placeholder="name@company.com"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-2">סיסמה</label>
                <PasswordInput
                  required
                  value={regPass}
                  onChange={(e) => setRegPass(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-gray-950/60 border border-gray-850 text-white text-sm focus:border-[#9d4edd] focus:outline-none transition-all"
                  placeholder="לפחות 12 תווים, אותיות (A-a), ספרות ותו מיוחד..."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-2">סוג חשבון מבוקש</label>
                <div className="grid grid-cols-2 gap-2 rounded-xl border border-gray-800 bg-gray-950/40 p-2">
                  <button type="button" onClick={() => setRegRole('employee')} className={`rounded-lg px-3 py-2.5 text-xs font-black transition-all ${regRole === 'employee' ? 'bg-[#00e6ff] text-black' : 'text-gray-500 hover:text-white'}`}>עובד רגיל</button>
                  <button type="button" onClick={() => setRegRole('manager')} className={`rounded-lg px-3 py-2.5 text-xs font-black transition-all ${regRole === 'manager' ? 'bg-[#9d4edd] text-white' : 'text-gray-500 hover:text-white'}`}>מנהל</button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-2">מחלקה</label>
                <select value={regDepartment} onChange={(event) => setRegDepartment(event.target.value)} className="w-full rounded-xl border border-gray-850 bg-gray-950/60 px-4 py-3 text-sm text-white outline-none transition-all focus:border-[#9d4edd]">
                  <option value="כללי">כללי</option>
                  <option value="פיתוח (R&D)">פיתוח (R&amp;D)</option>
                  <option value="אבטחת מידע (Security)">אבטחת מידע (Security)</option>
                  <option value="משאבי אנוש">משאבי אנוש</option>
                  <option value="כספים (Finance)">כספים (Finance)</option>
                  <option value="תפעול (Operations)">תפעול (Operations)</option>
                </select>
              </div>

              <div className="rounded-xl border border-gray-800 bg-gray-950/40 px-4 py-3 text-xs text-gray-400">
                🛡️ כל חשבון חדש, עובד או מנהל, מופעל רק לאחר אישור מנהל המערכת.
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-[#9d4edd] hover:bg-[#9d4edd]/90 text-white font-extrabold text-sm transition-all shadow-lg shadow-purple-950/30"
            >
              הרשמה למערכת
            </button>
            {(regError || regSuccess) && <div aria-live="polite" aria-atomic="true">
              {regError && <div className="rounded-xl border border-red-500/20 bg-red-950/20 p-3 text-center text-xs font-bold text-red-400">{regError}</div>}
              {regSuccess && (
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/20 p-4 text-center text-xs font-bold leading-6 text-emerald-400">
                  <span className="mb-1 block text-lg">✓</span>
                  <div>{regSuccess}</div>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('login');
                      setRegSuccess('');
                      setRegError('');
                    }}
                    className="mt-3 block w-full py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-black font-black text-xs transition-colors"
                  >
                    חזור למסך ההתחברות
                  </button>
                </div>
              )}
            </div>}
          </form>
        )}

      </div>

      {/* Background neon blur lights */}
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-[#9d4edd] opacity-[0.03] blur-3xl rounded-full pointer-events-none"></div>

      {/* Recovery Modal */}
      {isRecoveryOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" dir="rtl">
          <div className="max-w-md w-full bg-[#0d0d1f] border border-gray-800 rounded-3xl p-6 relative">
            <button 
              onClick={closeRecovery}
              className="absolute top-4 left-4 text-gray-500 hover:text-white"
            >
              ✕
            </button>

            <h3 className="text-xl font-bold text-white mb-4">שחזור סיסמה ארגוני</h3>
            
            {recoveryStep === 1 ? (
              <div className="space-y-4">
                <p className="text-xs text-gray-400">הזן את הדואר האלקטרוני הרשום כדי לקבל קישור לאיפוס סיסמה ישירות לתיבת המייל שלך באמצעות Brevo API.</p>
                
                {recoveryStatusMsg && (
                  <div className={`rounded-xl border p-3 text-center text-xs font-bold ${
                    brevoStatus === 'error' 
                      ? 'border-red-500/20 bg-red-950/20 text-red-400' 
                      : 'border-cyan-500/20 bg-cyan-950/20 text-cyan-400'
                  }`}>
                    {recoveryStatusMsg}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-2">אימייל ארגוני</label>
                  <input
                    type="email"
                    value={recoveryEmail}
                    onChange={(e) => setRecoveryEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-gray-950/60 border border-gray-850 text-white text-sm focus:border-[#00e6ff] focus:outline-none"
                    placeholder="name@company.com"
                  />
                </div>
                <button
                  onClick={startRecovery}
                  disabled={brevoStatus === 'sending'}
                  className="w-full py-3 rounded-xl bg-[#00e6ff] hover:bg-[#00b8d4] text-black font-extrabold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {brevoStatus === 'sending' ? 'שולח...' : 'שלח קישור שחזור'}
                </button>
              </div>
            ) : (
              <div className="space-y-4 text-center">
                <p className="text-sm text-emerald-400 bg-emerald-950/20 border border-emerald-500/20 p-4 rounded-xl leading-relaxed">
                  {recoveryStatusMsg}
                </p>
                <div className="text-xs text-gray-400 py-2">
                  לאחר הלחיצה על הקישור במייל, תוכל להגדיר סיסמה חדשה ולהתחבר מחדש.
                </div>
                <button
                  onClick={closeRecovery}
                  className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-black font-extrabold text-sm transition-all"
                >
                  סגור והמתן למייל
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
