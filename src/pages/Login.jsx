// src/pages/Login.jsx
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function Login() {
  const { login, register, users, sendBrevoRecoveryCode, changePassword } = useApp();
  
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
  const [regRole, setRegRole] = useState('employee'); // 'employee', 'manager', 'special'
  const [regSuccess, setRegSuccess] = useState('');
  const [regError, setRegError] = useState('');

  // Recovery State
  const [isRecoveryOpen, setIsRecoveryOpen] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoveryCode, setRecoveryCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState(null);
  const [recoveryUserObj, setRecoveryUserObj] = useState(null);
  const [recoveryStep, setRecoveryStep] = useState(1); // 1 or 2
  const [recoveryStatusMsg, setRecoveryStatusMsg] = useState('');
  const [brevoStatus, setBrevoStatus] = useState(''); // 'sent' or 'fallback'

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');

    if (loginStep === 1) {
      const match = users.find(u => u.username.toLowerCase() === loginUser.trim().toLowerCase() && u.password === loginPass);
      if (!match) {
        setLoginError("שם משתמש או סיסמה שגויים!");
        return;
      }

      // Generate 2FA OTP
      const otp = Math.floor(100000 + Math.random() * 900000);
      setGeneratedLoginOtp(otp);

      // Send OTP via Brevo API
      const isSent = await sendBrevoRecoveryCode(match.email, otp);
      if (isSent) {
        setLoginOtpStatusMsg(`קוד אימות דו-שלבי (2FA) נשלח לכתובת ${match.email} באמצעות Brevo.`);
      } else {
        setLoginOtpStatusMsg(`לא מוגדר מפתח Brevo API. קוד הדמיה לצורך בדיקה: ${otp}`);
      }

      setLoginStep(2);
    } else {
      // Validate OTP Code
      if (parseInt(loginOtpCode, 10) === generatedLoginOtp) {
        const res = login(loginUser, loginPass);
        if (!res.success) {
          setLoginError(res.message);
          setLoginStep(1);
        }
      } else {
        setLoginError("❌ קוד אימות לא נכון!");
      }
    }
  };

  const handleRegisterSubmit = (e) => {
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

    const res = register(regUser, regPass, regEmail, regRole);
    if (res.success) {
      setRegSuccess("ההרשמה בוצעה בהצלחה! כעת ניתן להתחבר.");
      setRegUser('');
      setRegEmail('');
      setRegPass('');
    } else {
      setRegError(res.message);
    }
  };

  const startRecovery = async () => {
    setBrevoStatus('');
    const match = users.find(u => u.email.toLowerCase() === recoveryEmail.trim().toLowerCase());
    if (!match) {
      alert("❌ דואר אלקטרוני זה אינו רשום במערכת!");
      return;
    }

    const code = Math.floor(100000 + Math.random() * 900000);
    setGeneratedCode(code);
    setRecoveryUserObj(match);

    // Try sending email via Brevo SMTP API
    const isSent = await sendBrevoRecoveryCode(match.email, code);
    
    if (isSent) {
      setBrevoStatus('sent');
      setRecoveryStatusMsg(`קוד אימות נשלח בהצלחה לכתובת ${match.email} באמצעות Brevo API.`);
    } else {
      setBrevoStatus('fallback');
      setRecoveryStatusMsg(`לא הוגדר מפתח Brevo API תקין. הקוד שלך להדמיה הוא: ${code}`);
    }

    setRecoveryStep(2);
  };

  const verifyCodeAndReset = () => {
    if (parseInt(recoveryCode, 10) === generatedCode) {
      const newPass = prompt("אנא הזן סיסמה חדשה (מינימום 4 תווים):");
      if (newPass && newPass.length >= 4) {
        changePassword(recoveryUserObj.username, newPass);
        alert("✅ הסיסמה שונתה בהצלחה! כעת ניתן להתחבר עם הסיסמה החדשה.");
        closeRecovery();
      } else {
        alert("❌ סיסמה לא תקינה או קצרה מדי!");
      }
    } else {
      alert("❌ קוד אימות לא נכון!");
    }
  };

  const closeRecovery = () => {
    setIsRecoveryOpen(false);
    setRecoveryEmail('');
    setRecoveryCode('');
    setGeneratedCode(null);
    setRecoveryUserObj(null);
    setRecoveryStep(1);
    setRecoveryStatusMsg('');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-md w-full space-y-8 bg-gray-900/60 border border-gray-800 rounded-3xl p-8 shadow-2xl backdrop-blur-md relative z-10">
        
        {/* Title */}
        <div className="text-center">
          <span className="text-5xl filter drop-shadow-[0_0_15px_rgba(0,230,255,0.25)]">🛡️</span>
          <h2 className="mt-4 text-2xl font-extrabold text-white">אקדמיית סייבר ארגונית</h2>
          <p className="mt-2 text-xs text-gray-500 font-semibold">אבטחת מידע והתמודדות עם איומים</p>
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
            
            {loginStep === 1 ? (
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
                  <input
                    type="password"
                    required
                    value={loginPass}
                    onChange={(e) => setLoginPass(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-gray-950/60 border border-gray-850 text-white text-sm focus:border-[#00e6ff] focus:outline-none transition-all"
                    placeholder="הזן סיסמה..."
                  />
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
                  המשך לאימות OTP
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-3 text-xs bg-[#00e6ff]/5 border border-[#00e6ff]/10 text-cyan-455 rounded-xl leading-relaxed">
                  {loginOtpStatusMsg}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-2">קוד אימות (6 ספרות)</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={loginOtpCode}
                    onChange={(e) => setLoginOtpCode(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-gray-950/60 border border-gray-850 text-white text-sm focus:border-[#00e6ff] focus:outline-none text-center tracking-widest font-bold"
                    placeholder="123456"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-450 text-black font-extrabold text-sm transition-all shadow-lg"
                >
                  אמת קוד והתחבר
                </button>
                <button
                  type="button"
                  onClick={() => { setLoginStep(1); setLoginOtpCode(''); }}
                  className="w-full py-2.5 rounded-xl bg-transparent border border-gray-850 hover:border-gray-800 text-gray-400 text-xs font-bold transition-all"
                >
                  חזור להזנת פרטים
                </button>
              </div>
            )}
          </form>
        )}

        {/* Register Form */}
        {activeTab === 'register' && (
          <form className="mt-6 space-y-6" onSubmit={handleRegisterSubmit}>
            {regError && (
              <div className="p-3 text-xs bg-red-950/20 border border-red-500/20 text-red-400 rounded-lg text-center">
                {regError}
              </div>
            )}
            {regSuccess && (
              <div className="p-3 text-xs bg-emerald-950/20 border border-emerald-500/20 text-emerald-455 rounded-lg text-center">
                {regSuccess}
              </div>
            )}

            <div className="space-y-4">
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
                <input
                  type="password"
                  required
                  value={regPass}
                  onChange={(e) => setRegPass(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-gray-950/60 border border-gray-850 text-white text-sm focus:border-[#9d4edd] focus:outline-none transition-all"
                  placeholder="לפחות 12 תווים, אותיות (A-a), ספרות ותו מיוחד..."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-2">תפקיד במערכת</label>
                <select
                  value={regRole}
                  onChange={(e) => setRegRole(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-gray-950/60 border border-gray-850 text-white text-sm focus:border-[#9d4edd] focus:outline-none transition-all"
                >
                  <option value="employee">עובד (Employee)</option>
                  <option value="manager">מנהל (Manager)</option>
                  <option value="special">תצוגה כפולה (Special)</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-[#9d4edd] hover:bg-[#9d4edd]/90 text-white font-extrabold text-sm transition-all shadow-lg shadow-purple-950/30"
            >
              הרשמה למערכת
            </button>
          </form>
        )}

      </div>

      {/* Background neon blur lights */}
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-[#9d4edd] opacity-[0.03] blur-3xl rounded-full pointer-events-none"></div>

      {/* Recovery Modal */}
      {isRecoveryOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
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
                <p className="text-xs text-gray-400">הזן את הדואר האלקטרוני הרשום כדי לקבל קוד שחזור באמצעות Brevo API.</p>
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
                  className="w-full py-3 rounded-xl bg-[#00e6ff] text-black font-extrabold text-sm transition-all"
                >
                  שלח קוד אימות
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-xs text-[#00e6ff] bg-[#00e6ff]/5 border border-[#00e6ff]/10 p-3 rounded-xl leading-relaxed">
                  {recoveryStatusMsg}
                </p>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-2">קוד אימות (6 ספרות)</label>
                  <input
                    type="text"
                    maxLength={6}
                    value={recoveryCode}
                    onChange={(e) => setRecoveryCode(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-gray-950/60 border border-gray-850 text-white text-sm focus:border-[#00e6ff] focus:outline-none text-center tracking-widest font-bold"
                    placeholder="123456"
                  />
                </div>
                <button
                  onClick={verifyCodeAndReset}
                  className="w-full py-3 rounded-xl bg-emerald-500 text-black font-extrabold text-sm transition-all"
                >
                  אמת קוד והמשך
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
