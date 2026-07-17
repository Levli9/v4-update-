// src/App.jsx
import React, { useEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import {
  Accessibility,
  BookOpen,
  ChevronDown,
  ChevronLeft,
  Contrast,
  LayoutDashboard,
  LogOut,
  Menu,
  Minus,
  Moon,
  MousePointer2,
  Plus,
  RotateCcw,
  Sparkles,
  Sun,
  Type,
  UserCheck,
  X,
  ZoomIn,
  Award
} from 'lucide-react';
import { AppProvider, useApp } from './context/AppContext';
import Dashboard from './pages/Dashboard';
import SubjectView from './pages/SubjectView';
import Login from './pages/Login';
import ManagerDashboard from './pages/ManagerDashboard';
import UserSettings from './pages/UserSettings';
import UserProfile from './pages/UserProfile';
import AdminApprovals from './pages/AdminApprovals';
import AIPresentationStudio from './pages/AIPresentationStudio';
import FinalExam from './pages/FinalExam';
import KnowledgeLibrary from './pages/KnowledgeLibrary';
import GlobalSearch from './components/GlobalSearch';
import ShieldXLogo from './components/ShieldXLogo';
import ShieldXWordmark from './components/ShieldXWordmark';

const DEFAULT_ACCESSIBILITY = {
  monochrome: false,
  theme: 'night',
  fontScale: 0,
  readableFont: false,
  pageZoom: false,
  cursor: 'default'
};

const getSavedAccessibility = () => {
  try {
    const saved = JSON.parse(localStorage.getItem('shieldx_accessibility') || '{}');
    const theme = saved.theme || (saved.lightContrast ? 'day' : 'night');
    const migrated = { ...DEFAULT_ACCESSIBILITY, ...saved, theme };
    delete migrated.darkContrast;
    delete migrated.lightContrast;
    delete migrated.imageDescriptions;
    delete migrated.highlightHeadings;
    delete migrated.highlightLinks;
    return migrated;
  } catch {
    return DEFAULT_ACCESSIBILITY;
  }
};

function AppInner() {
  const { currentUser, logout, setActiveViewRole } = useApp();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAccessibilityOpen, setIsAccessibilityOpen] = useState(false);
  const [accessibility, setAccessibility] = useState(getSavedAccessibility);

  const closeMenu = () => {
    setIsMenuOpen(false);
    setIsAccessibilityOpen(false);
  };

  useEffect(() => {
    if (!isMenuOpen) return undefined;

    const closeOnEscape = (event) => {
      if (event.key === 'Escape') closeMenu();
    };

    document.addEventListener('keydown', closeOnEscape);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', closeOnEscape);
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  useEffect(() => {
    localStorage.setItem('shieldx_accessibility', JSON.stringify(accessibility));

    const root = document.documentElement;
    const classMap = {
      'a11y-monochrome': accessibility.monochrome,
      'theme-day': accessibility.theme === 'day',
      'a11y-readable-font': accessibility.readableFont,
      'a11y-page-zoom': accessibility.pageZoom,
      'a11y-cursor-black': accessibility.cursor === 'black',
      'a11y-cursor-white': accessibility.cursor === 'white'
    };

    Object.entries(classMap).forEach(([className, enabled]) => {
      root.classList.toggle(className, enabled);
    });
    root.style.fontSize = `${100 + accessibility.fontScale * 12}%`;

  }, [accessibility]);

  // If not logged in, force Login page
  if (!currentUser) {
    return <Login />;
  }

  const isAdmin = currentUser.role === 'admin';
  const canAccessManager = currentUser.role === 'manager' || isAdmin;
  const isManagerView = canAccessManager && location.pathname === '/manager';
  const isAdminView = isAdmin && location.pathname === '/admin';
  const isAIStudioView = canAccessManager && location.pathname === '/ai-studio';
  const isLearningPortalView = location.pathname === '/';
  const isFinalExamView = location.pathname === '/final-exam';
  const isKnowledgeView = location.pathname === '/knowledge';
  const isProfileView = location.pathname === '/settings';

  const openLearningPortal = () => {
    setActiveViewRole('employee');
    closeMenu();
  };

  const openManagerDashboard = () => {
    if (!canAccessManager) return;
    setActiveViewRole('manager');
    closeMenu();
  };

  const openAdminApprovals = () => {
    if (!isAdmin) return;
    closeMenu();
  };

  const handleLogout = () => {
    closeMenu();
    logout();
  };

  const toggleAccessibility = (key) => {
    setAccessibility((current) => ({ ...current, [key]: !current[key] }));
  };

  const setTheme = (theme) => {
    setAccessibility((current) => ({ ...current, theme }));
  };

  const changeFontScale = (amount) => {
    setAccessibility((current) => ({
      ...current,
      fontScale: Math.min(3, Math.max(-2, current.fontScale + amount))
    }));
  };

  const toggleCursor = (cursor) => {
    setAccessibility((current) => ({
      ...current,
      cursor: current.cursor === cursor ? 'default' : cursor
    }));
  };

  const resetAccessibility = () => {
    setAccessibility(DEFAULT_ACCESSIBILITY);
  };

  const accessibilityActiveCount = [
    accessibility.monochrome,
    accessibility.theme === 'day',
    accessibility.fontScale !== 0,
    accessibility.readableFont,
    accessibility.pageZoom,
    accessibility.cursor !== 'default'
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-[#07070f] text-gray-100 font-sans selection:bg-[#00e6ff]/30 cyber-grid-bg">
      {/* Cyber-themed Header Navbar */}
      <header className="border-b border-gray-800 bg-[#0a0a14]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 grid grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-6">
          <div className="justify-self-start">
            <div className="flex items-center gap-2"><button
              type="button"
              onClick={() => setIsMenuOpen(true)}
              aria-label="פתיחת תוכן העניינים"
              aria-expanded={isMenuOpen}
              aria-controls="shieldx-app-menu"
              className="group relative grid h-11 w-12 place-items-center rounded-xl border border-[#00e6ff]/25 bg-[#0f1828] text-[#00e6ff] shadow-[0_0_18px_rgba(0,230,255,0.08)] transition-all hover:border-[#00e6ff]/60 hover:bg-[#132238] hover:shadow-[0_0_22px_rgba(0,230,255,0.18)] focus:outline-none focus:ring-2 focus:ring-[#00e6ff]/40"
            >
              <Menu size={25} strokeWidth={2.4} className="transition-transform group-hover:scale-110" />
            </button><GlobalSearch buttonClassName="hidden h-11 items-center gap-2 rounded-xl border border-gray-800 bg-gray-900/50 px-3 text-xs font-bold text-gray-400 transition hover:border-[#00e6ff]/30 hover:text-white md:flex" /></div>
          </div>

          <Link
            to="/"
            onClick={openLearningPortal}
            className="shieldx-brand justify-self-center flex items-center justify-center gap-3 text-center"
            aria-label="ShieldX — מערכת הדרכת עובדים בתחום הסייבר"
          >
            <ShieldXLogo compact />
            <span className="flex flex-col items-center leading-tight">
              <ShieldXWordmark className="text-2xl tracking-[0.08em]" />
              <span className="mt-1 text-[11px] sm:text-xs font-semibold text-gray-400 tracking-wide">
                מערכת הדרכת עובדים בתחום הסייבר
              </span>
            </span>
          </Link>
          
          <div className="justify-self-end min-w-0 flex flex-row-reverse items-center gap-2">
            <button
              type="button"
              onClick={handleLogout}
              className="group flex h-11 items-center justify-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/5 px-3 text-rose-400 transition-all hover:border-rose-500/45 hover:bg-rose-500/10 hover:text-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-500/30"
              aria-label="התנתקות מהמערכת"
              title="התנתקות"
            >
              <LogOut size={17} className="transition-transform group-hover:-translate-x-0.5" />
              <span className="hidden text-xs font-bold lg:inline">התנתקות</span>
            </button>
            <Link to="/profile" className="hidden sm:flex items-center gap-2 rounded-xl border border-gray-800 bg-gray-900/45 px-3 py-2 transition-colors hover:border-[#00e6ff]/35 hover:bg-gray-900" aria-label="פתיחת פרופיל המשתמש">
              <span className="profile-avatar profile-avatar--small">
                {currentUser.avatar ? <img src={currentUser.avatar} alt="" /> : <span>👤</span>}
              </span>
              <span className="min-w-0 max-w-36 leading-tight">
                <span className="block truncate text-xs text-gray-400">
                  שלום, <strong className="text-gray-200">{currentUser.username}</strong>
                </span>
                <span className={`mt-1 block text-[10px] font-bold ${canAccessManager ? 'text-purple-400' : 'text-[#00e6ff]'}`}>
                  {isAdmin ? 'מנהל מערכת' : canAccessManager ? 'מנהל' : 'עובד רגיל'}
                </span>
              </span>
            </Link>
          </div>
        </div>
      </header>

      {isMenuOpen && (
        <div className="fixed inset-0 z-[70]" role="presentation">
          <button
            type="button"
            className="shieldx-menu-backdrop absolute inset-0 h-full w-full cursor-default bg-black/70 backdrop-blur-sm"
            onClick={closeMenu}
            aria-label="סגירת תוכן העניינים"
          />

          <aside
            id="shieldx-app-menu"
            role="dialog"
            aria-modal="true"
            aria-label="תוכן העניינים"
            className={`shieldx-menu-drawer absolute inset-y-0 right-0 flex flex-col border-l border-[#00e6ff]/15 bg-[#0a0d17] shadow-[-20px_0_60px_rgba(0,0,0,0.55)] transition-[width] duration-300 ${
              isAccessibilityOpen ? 'w-[min(92vw,500px)]' : 'w-[min(86vw,320px)]'
            }`}
          >
            <div className="flex items-center justify-between border-b border-gray-800 px-4 py-4">
              <div className="flex items-center gap-2.5">
                <ShieldXLogo compact />
                <div>
                  <p className="text-base font-black text-white">תוכן העניינים</p>
                  <p className="text-[10px] font-semibold text-[#00e6ff]" dir="ltr">ShieldX Navigation</p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeMenu}
                className="grid h-9 w-9 place-items-center rounded-lg border border-gray-800 bg-gray-900 text-gray-400 transition-colors hover:border-gray-700 hover:text-white"
                aria-label="סגירת התפריט"
              >
                <X size={20} />
              </button>
            </div>

            <nav className={`flex-1 px-3.5 py-4 ${isAccessibilityOpen ? 'overflow-hidden' : 'overflow-y-auto'}`} aria-label="ניווט ראשי">
              <div className={isAccessibilityOpen ? 'hidden' : ''}>
                <p className="mb-3 px-3 text-[10px] font-extrabold uppercase tracking-[0.18em] text-gray-600">למידה והדרכה</p>
                <div className="space-y-2">
                <Link
                  to="/"
                  onClick={openLearningPortal}
                  className={`shieldx-menu-item ${isLearningPortalView ? 'shieldx-menu-item--active' : ''}`}
                >
                  <span className="shieldx-menu-item__icon"><BookOpen size={20} /></span>
                  <span className="flex-1">
                    <span className="block text-sm font-bold">פורטל למידה</span>
                    <span className="mt-0.5 block text-[11px] text-gray-500">קורסים, שיעורים ומבדקי ידע</span>
                  </span>
                  <ChevronLeft size={17} className="text-gray-600" />
                </Link>

                <Link to="/final-exam" onClick={closeMenu} className={`shieldx-menu-item ${isFinalExamView ? 'shieldx-menu-item--active' : ''}`}><span className="shieldx-menu-item__icon"><UserCheck size={20} /></span><span className="flex-1"><span className="block text-sm font-bold">מבחן מסכם</span><span className="mt-0.5 block text-[11px] text-gray-500">הסמכה סופית לאחר השלמת המסלול</span></span><ChevronLeft size={17} className="text-gray-600" /></Link>
                <Link to="/knowledge" onClick={closeMenu} className={`shieldx-menu-item ${isKnowledgeView ? 'shieldx-menu-item--active' : ''}`}><span className="shieldx-menu-item__icon"><BookOpen size={20} /></span><span className="flex-1"><span className="block text-sm font-bold">ספריית ידע</span><span className="mt-0.5 block text-[11px] text-gray-500">נהלים, מסמכים וסימון קראתי</span></span><ChevronLeft size={17} className="text-gray-600" /></Link>
                <Link to="/settings" onClick={closeMenu} className={`shieldx-menu-item ${isProfileView ? 'shieldx-menu-item--active' : ''}`}><span className="shieldx-menu-item__icon"><Award size={20} /></span><span className="flex-1"><span className="block text-sm font-bold">הסמכות ותעודות</span><span className="mt-0.5 block text-[11px] text-gray-500">סטטוס הסמכה, תעודות וציר זמן אישי</span></span><ChevronLeft size={17} className="text-gray-600" /></Link>

                </div>

                {canAccessManager && (
                  <>
                    <p className="mb-3 mt-5 px-3 text-[10px] font-extrabold uppercase tracking-[0.18em] text-gray-600">ניהול</p>
                    <Link
                      to="/manager"
                      onClick={openManagerDashboard}
                      className={`shieldx-menu-item ${isManagerView ? 'shieldx-menu-item--active' : ''}`}
                    >
                      <span className="shieldx-menu-item__icon shieldx-menu-item__icon--purple"><LayoutDashboard size={20} /></span>
                      <span className="flex-1">
                        <span className="block text-sm font-bold">דשבורד מנהלים</span>
                        <span className="mt-0.5 block text-[11px] text-gray-500">מעקב עובדים, ציונים ודוחות</span>
                      </span>
                      <ChevronLeft size={17} className="text-gray-600" />
                    </Link>
                    <Link
                      to="/ai-studio"
                      onClick={closeMenu}
                      className={`shieldx-menu-item mt-2 ${isAIStudioView ? 'shieldx-menu-item--active' : ''}`}
                    >
                      <span className="shieldx-menu-item__icon"><Sparkles size={20} /></span>
                      <span className="flex-1">
                        <span className="block text-sm font-bold">AI Course Generator</span>
                        <span className="mt-0.5 block text-[11px] text-gray-500">יצירת קורס מלא מפרומפט ומחומר מקור</span>
                      </span>
                      <ChevronLeft size={17} className="text-gray-600" />
                    </Link>
                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={openAdminApprovals}
                        className={`shieldx-menu-item mt-2 ${isAdminView ? 'shieldx-menu-item--active' : ''}`}
                      >
                        <span className="shieldx-menu-item__icon shieldx-menu-item__icon--purple"><UserCheck size={20} /></span>
                        <span className="flex-1">
                          <span className="block text-sm font-bold">אישור משתמשים</span>
                          <span className="mt-0.5 block text-[11px] text-gray-500">אישור או דחיית נרשמים חדשים</span>
                        </span>
                        <ChevronLeft size={17} className="text-gray-600" />
                      </Link>
                    )}
                  </>
                )}
              </div>

              <div className={`${isAccessibilityOpen ? '' : 'mt-5 border-t border-gray-800 pt-4'}`}>
                <button
                  type="button"
                  onClick={() => setIsAccessibilityOpen((open) => !open)}
                  className="flex w-full items-center gap-2.5 rounded-xl border border-gray-800 bg-gray-900/35 px-3 py-2.5 text-right transition-colors hover:border-[#00e6ff]/25 hover:bg-gray-900/70"
                  aria-expanded={isAccessibilityOpen}
                  aria-controls="shieldx-accessibility-panel"
                >
                  <span className="grid h-8 w-8 place-items-center rounded-lg border border-[#00e6ff]/15 bg-[#00e6ff]/8 text-[#00e6ff]">
                    <Accessibility size={18} />
                  </span>
                  <span className="flex-1">
                    <span className="block text-[13px] font-bold text-gray-200">נגישות</span>
                    <span className="mt-0.5 block text-[10px] text-gray-500">
                      {accessibilityActiveCount > 0 ? `${accessibilityActiveCount} התאמות פעילות` : 'התאמת התצוגה לצרכים שלך'}
                    </span>
                  </span>
                  <ChevronDown size={16} className={`text-gray-500 transition-transform ${isAccessibilityOpen ? 'rotate-180' : ''}`} />
                </button>

                {isAccessibilityOpen && (
                  <div id="shieldx-accessibility-panel" className="mt-3 rounded-2xl border border-gray-800 bg-gray-950/55 p-3">
                    <div className="grid grid-cols-3 gap-2">
                      <button type="button" onClick={() => toggleAccessibility('monochrome')} className={`a11y-option ${accessibility.monochrome ? 'a11y-option--active' : ''}`} aria-pressed={accessibility.monochrome}>
                        <Contrast size={19} />
                        <span>מונוכרום</span>
                      </button>
                      <button type="button" onClick={() => setTheme('night')} className={`a11y-option ${accessibility.theme === 'night' ? 'a11y-option--active' : ''}`} aria-pressed={accessibility.theme === 'night'}>
                        <Moon size={19} />
                        <span>מצב לילה</span>
                      </button>
                      <button type="button" onClick={() => setTheme('day')} className={`a11y-option ${accessibility.theme === 'day' ? 'a11y-option--active' : ''}`} aria-pressed={accessibility.theme === 'day'}>
                        <Sun size={19} />
                        <span>מצב יום</span>
                      </button>
                      <button type="button" onClick={() => changeFontScale(1)} disabled={accessibility.fontScale >= 3} className="a11y-option disabled:cursor-not-allowed disabled:opacity-35">
                        <Plus size={19} />
                        <span>הגדלת גופן</span>
                      </button>
                      <button type="button" onClick={() => changeFontScale(-1)} disabled={accessibility.fontScale <= -2} className="a11y-option disabled:cursor-not-allowed disabled:opacity-35">
                        <Minus size={19} />
                        <span>הקטנת גופן</span>
                      </button>
                      <button type="button" onClick={() => toggleAccessibility('readableFont')} className={`a11y-option ${accessibility.readableFont ? 'a11y-option--active' : ''}`} aria-pressed={accessibility.readableFont}>
                        <Type size={19} />
                        <span>גופן קריא</span>
                      </button>
                      <button type="button" onClick={() => toggleAccessibility('pageZoom')} className={`a11y-option ${accessibility.pageZoom ? 'a11y-option--active' : ''}`} aria-pressed={accessibility.pageZoom}>
                        <ZoomIn size={19} />
                        <span>הגדלת תצוגה</span>
                      </button>
                      <button type="button" onClick={() => toggleCursor('black')} className={`a11y-option ${accessibility.cursor === 'black' ? 'a11y-option--active' : ''}`} aria-pressed={accessibility.cursor === 'black'}>
                        <MousePointer2 size={19} fill="currentColor" />
                        <span>סמן שחור גדול</span>
                      </button>
                      <button type="button" onClick={() => toggleCursor('white')} className={`a11y-option ${accessibility.cursor === 'white' ? 'a11y-option--active' : ''}`} aria-pressed={accessibility.cursor === 'white'}>
                        <MousePointer2 size={19} />
                        <span>סמן לבן גדול</span>
                      </button>
                    </div>

                    <div className="mt-3 flex items-center justify-between rounded-xl border border-gray-800 bg-gray-900/50 px-3 py-2">
                      <span className="text-[10px] font-semibold text-gray-500">גודל גופן: {100 + accessibility.fontScale * 12}%</span>
                      <button
                        type="button"
                        onClick={resetAccessibility}
                        disabled={accessibilityActiveCount === 0}
                        className="flex items-center gap-1.5 text-[11px] font-bold text-rose-400 transition-colors hover:text-rose-300 disabled:cursor-not-allowed disabled:opacity-35"
                      >
                        <RotateCcw size={14} />
                        בטל נגישות
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </nav>

            {!isAccessibilityOpen && <div className="border-t border-gray-800 bg-gray-950/40 p-4">
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-rose-500/15 bg-rose-500/5 px-4 py-3 text-xs font-bold text-rose-400 transition-colors hover:border-rose-500/35 hover:bg-rose-500/10"
              >
                <LogOut size={16} />
                התנתקות מהמערכת
              </button>
            </div>}
          </aside>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/manager" element={canAccessManager ? <ManagerDashboard /> : <Navigate to="/" replace />} />
          <Route path="/admin" element={isAdmin ? <AdminApprovals /> : <Navigate to="/" replace />} />
          <Route path="/ai-studio" element={canAccessManager ? <AIPresentationStudio /> : <Navigate to="/" replace />} />
          <Route path="/subject/:id" element={<SubjectView />} />
          <Route path="/final-exam" element={<FinalExam />} />
          <Route path="/knowledge" element={<KnowledgeLibrary />} />
          <Route path="/settings" element={<UserSettings />} />
          <Route path="/profile" element={<UserProfile />} />
        </Routes>
      </main>
      <footer className="border-t border-gray-900/80 px-4 py-5 text-center" dir="ltr">
        <span className="text-[10px] font-semibold tracking-[0.16em] text-gray-700">
          Developed by <span className="text-gray-500">Yaniv &amp; Lev</span>
        </span>
      </footer>
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <Router>
        <AppInner />
      </Router>
    </AppProvider>
  );
}

export default App;
