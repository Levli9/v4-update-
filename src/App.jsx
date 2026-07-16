// src/App.jsx
import React, { useEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route, Link } from 'react-router-dom';
import {
  Accessibility,
  BookOpen,
  ChevronDown,
  ChevronLeft,
  Contrast,
  Eye,
  Heading,
  Image,
  LayoutDashboard,
  Link2,
  LogOut,
  Menu,
  Minus,
  Moon,
  MousePointer2,
  Plus,
  RotateCcw,
  Sun,
  Type,
  X,
  ZoomIn
} from 'lucide-react';
import { AppProvider, useApp } from './context/AppContext';
import Dashboard from './pages/Dashboard';
import SubjectView from './pages/SubjectView';
import Login from './pages/Login';
import ManagerDashboard from './pages/ManagerDashboard';
import UserSettings from './pages/UserSettings';
import ShieldXLogo from './components/ShieldXLogo';

const DEFAULT_ACCESSIBILITY = {
  monochrome: false,
  theme: 'night',
  fontScale: 0,
  readableFont: false,
  pageZoom: false,
  cursor: 'default',
  imageDescriptions: false,
  highlightHeadings: false,
  highlightLinks: false
};

const getSavedAccessibility = () => {
  try {
    const saved = JSON.parse(localStorage.getItem('shieldx_accessibility') || '{}');
    const theme = saved.theme || (saved.lightContrast ? 'day' : 'night');
    const migrated = { ...DEFAULT_ACCESSIBILITY, ...saved, theme };
    delete migrated.darkContrast;
    delete migrated.lightContrast;
    return migrated;
  } catch {
    return DEFAULT_ACCESSIBILITY;
  }
};

function AppInner() {
  const { currentUser, activeViewRole, logout, setActiveViewRole } = useApp();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAccessibilityOpen, setIsAccessibilityOpen] = useState(false);
  const [accessibility, setAccessibility] = useState(getSavedAccessibility);

  useEffect(() => {
    if (!isMenuOpen) return undefined;

    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setIsMenuOpen(false);
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
      'a11y-cursor-white': accessibility.cursor === 'white',
      'a11y-highlight-headings': accessibility.highlightHeadings,
      'a11y-highlight-links': accessibility.highlightLinks
    };

    Object.entries(classMap).forEach(([className, enabled]) => {
      root.classList.toggle(className, enabled);
    });
    root.style.fontSize = `${100 + accessibility.fontScale * 12}%`;

    document.querySelectorAll('img').forEach((image) => {
      if (accessibility.imageDescriptions) {
        image.setAttribute('data-a11y-description', image.alt || image.title || 'תמונה');
        if (!image.getAttribute('aria-label')) {
          image.setAttribute('aria-label', image.alt || image.title || 'תמונה');
          image.setAttribute('data-a11y-added-label', 'true');
        }
      } else {
        image.removeAttribute('data-a11y-description');
        if (image.getAttribute('data-a11y-added-label') === 'true') {
          image.removeAttribute('aria-label');
          image.removeAttribute('data-a11y-added-label');
        }
      }
    });
  }, [accessibility]);

  // If not logged in, force Login page
  if (!currentUser) {
    return <Login />;
  }

  const canAccessManager = currentUser.role === 'manager';
  const isManagerView = canAccessManager && activeViewRole === 'manager';

  const openLearningPortal = () => {
    setActiveViewRole('employee');
    setIsMenuOpen(false);
  };

  const openManagerDashboard = () => {
    if (!canAccessManager) return;
    setActiveViewRole('manager');
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    setIsMenuOpen(false);
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
    accessibility.cursor !== 'default',
    accessibility.imageDescriptions,
    accessibility.highlightHeadings,
    accessibility.highlightLinks
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-[#07070f] text-gray-100 font-sans selection:bg-[#00e6ff]/30 cyber-grid-bg">
      {/* Cyber-themed Header Navbar */}
      <header className="border-b border-gray-800 bg-[#0a0a14]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 grid grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-6">
          <div className="justify-self-start">
            <button
              type="button"
              onClick={() => setIsMenuOpen(true)}
              aria-label="פתיחת תוכן העניינים"
              aria-expanded={isMenuOpen}
              aria-controls="shieldx-app-menu"
              className="group relative grid h-11 w-12 place-items-center rounded-xl border border-[#00e6ff]/25 bg-[#0f1828] text-[#00e6ff] shadow-[0_0_18px_rgba(0,230,255,0.08)] transition-all hover:border-[#00e6ff]/60 hover:bg-[#132238] hover:shadow-[0_0_22px_rgba(0,230,255,0.18)] focus:outline-none focus:ring-2 focus:ring-[#00e6ff]/40"
            >
              <Menu size={25} strokeWidth={2.4} className="transition-transform group-hover:scale-110" />
            </button>
          </div>

          <Link
            to="/"
            className="shieldx-brand justify-self-center flex items-center justify-center gap-3 text-center"
            aria-label="ShieldX — מערכת הדרכת עובדים בתחום הסייבר"
          >
            <ShieldXLogo compact />
            <span className="flex flex-col items-center leading-tight">
              <span className="text-2xl font-black tracking-[0.08em] text-white" dir="ltr">
                Shield<span className="text-[#00e6ff]">X</span>
              </span>
              <span className="mt-1 text-[11px] sm:text-xs font-semibold text-gray-400 tracking-wide">
                מערכת הדרכת עובדים בתחום הסייבר
              </span>
            </span>
          </Link>
          
          <div className="justify-self-end min-w-0">
            <Link to="/settings" className="hidden sm:flex items-center gap-2 rounded-xl border border-gray-800 bg-gray-900/45 px-3 py-2 transition-colors hover:border-[#00e6ff]/35 hover:bg-gray-900" aria-label="פתיחת הגדרות המשתמש">
              <span className="profile-avatar profile-avatar--small">
                {currentUser.avatar ? <img src={currentUser.avatar} alt="" /> : <span>👤</span>}
              </span>
              <span className="min-w-0 max-w-36 leading-tight">
                <span className="block truncate text-xs text-gray-400">
                  שלום, <strong className="text-gray-200">{currentUser.username}</strong>
                </span>
                <span className={`mt-1 block text-[10px] font-bold ${canAccessManager ? 'text-purple-400' : 'text-[#00e6ff]'}`}>
                  {canAccessManager ? 'מנהל' : 'עובד רגיל'}
                </span>
              </span>
            </Link>
            <div className="h-11 w-12 sm:hidden" aria-hidden="true" />
          </div>
        </div>
      </header>

      {isMenuOpen && (
        <div className="fixed inset-0 z-[70]" role="presentation">
          <button
            type="button"
            className="shieldx-menu-backdrop absolute inset-0 h-full w-full cursor-default bg-black/70 backdrop-blur-sm"
            onClick={() => setIsMenuOpen(false)}
            aria-label="סגירת תוכן העניינים"
          />

          <aside
            id="shieldx-app-menu"
            role="dialog"
            aria-modal="true"
            aria-label="תוכן העניינים"
            className={`shieldx-menu-drawer absolute inset-y-0 right-0 flex flex-col border-l border-[#00e6ff]/15 bg-[#0a0d17] shadow-[-20px_0_60px_rgba(0,0,0,0.55)] transition-[width] duration-300 ${
              isAccessibilityOpen ? 'w-[min(94vw,560px)]' : 'w-[min(88vw,360px)]'
            }`}
          >
            <div className="flex items-center justify-between border-b border-gray-800 px-5 py-5">
              <div className="flex items-center gap-3">
                <ShieldXLogo compact />
                <div>
                  <p className="text-lg font-black text-white">תוכן העניינים</p>
                  <p className="text-[11px] font-semibold text-[#00e6ff]" dir="ltr">ShieldX Navigation</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsMenuOpen(false)}
                className="grid h-10 w-10 place-items-center rounded-xl border border-gray-800 bg-gray-900 text-gray-400 transition-colors hover:border-gray-700 hover:text-white"
                aria-label="סגירת התפריט"
              >
                <X size={20} />
              </button>
            </div>

            <nav className={`flex-1 px-4 py-5 ${isAccessibilityOpen ? 'overflow-hidden' : 'overflow-y-auto'}`} aria-label="ניווט ראשי">
              <div className={isAccessibilityOpen ? 'hidden' : ''}>
                <p className="mb-3 px-3 text-[10px] font-extrabold uppercase tracking-[0.18em] text-gray-600">למידה והדרכה</p>
                <div className="space-y-2">
                <Link
                  to="/"
                  onClick={openLearningPortal}
                  className={`shieldx-menu-item ${!isManagerView ? 'shieldx-menu-item--active' : ''}`}
                >
                  <span className="shieldx-menu-item__icon"><BookOpen size={20} /></span>
                  <span className="flex-1">
                    <span className="block text-sm font-bold">פורטל למידה</span>
                    <span className="mt-0.5 block text-[11px] text-gray-500">קורסים, שיעורים ומבדקי ידע</span>
                  </span>
                  <ChevronLeft size={17} className="text-gray-600" />
                </Link>

                </div>

                {canAccessManager && (
                  <>
                    <p className="mb-3 mt-7 px-3 text-[10px] font-extrabold uppercase tracking-[0.18em] text-gray-600">ניהול</p>
                    <Link
                      to="/"
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
                  </>
                )}
              </div>

              <div className={`${isAccessibilityOpen ? '' : 'mt-7 border-t border-gray-800 pt-5'}`}>
                <button
                  type="button"
                  onClick={() => setIsAccessibilityOpen((open) => !open)}
                  className="flex w-full items-center gap-3 rounded-xl border border-gray-800 bg-gray-900/45 px-3 py-3 text-right transition-colors hover:border-[#00e6ff]/25 hover:bg-gray-900"
                  aria-expanded={isAccessibilityOpen}
                  aria-controls="shieldx-accessibility-panel"
                >
                  <span className="grid h-10 w-10 place-items-center rounded-xl border border-[#00e6ff]/15 bg-[#00e6ff]/10 text-[#00e6ff]">
                    <Accessibility size={22} />
                  </span>
                  <span className="flex-1">
                    <span className="block text-sm font-bold text-gray-100">נגישות</span>
                    <span className="mt-0.5 block text-[11px] text-gray-500">
                      {accessibilityActiveCount > 0 ? `${accessibilityActiveCount} התאמות פעילות` : 'התאמת התצוגה לצרכים שלך'}
                    </span>
                  </span>
                  <ChevronDown size={18} className={`text-gray-500 transition-transform ${isAccessibilityOpen ? 'rotate-180' : ''}`} />
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
                      <button type="button" onClick={() => toggleAccessibility('imageDescriptions')} className={`a11y-option ${accessibility.imageDescriptions ? 'a11y-option--active' : ''}`} aria-pressed={accessibility.imageDescriptions}>
                        <Image size={19} />
                        <span>תיאור תמונות</span>
                      </button>
                      <button type="button" onClick={() => toggleAccessibility('highlightHeadings')} className={`a11y-option ${accessibility.highlightHeadings ? 'a11y-option--active' : ''}`} aria-pressed={accessibility.highlightHeadings}>
                        <Heading size={19} />
                        <span>הדגשת כותרות</span>
                      </button>
                      <button type="button" onClick={() => toggleAccessibility('highlightLinks')} className={`a11y-option ${accessibility.highlightLinks ? 'a11y-option--active' : ''}`} aria-pressed={accessibility.highlightLinks}>
                        <Link2 size={19} />
                        <span>הדגשת קישורים</span>
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
              <Link to="/settings" onClick={() => setIsMenuOpen(false)} className="mb-3 flex items-center gap-3 rounded-xl border border-gray-800 bg-gray-900/60 p-3 transition-colors hover:border-[#00e6ff]/30" aria-label="פתיחת הגדרות המשתמש">
                <span className="profile-avatar">
                  {currentUser.avatar ? <img src={currentUser.avatar} alt="" /> : <span>👤</span>}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-gray-200">{currentUser.username}</p>
                  <p className={`text-[11px] font-bold ${canAccessManager ? 'text-purple-400' : 'text-[#00e6ff]'}`}>
                    {canAccessManager ? 'מנהל' : 'עובד רגיל'}
                  </p>
                </div>
                <ChevronLeft size={17} className="text-gray-600" />
              </Link>
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
          {/* Dashboard Route changes dynamically depending on selected view role */}
          <Route path="/" element={isManagerView ? <ManagerDashboard /> : <Dashboard />} />
          <Route path="/subject/:id" element={<SubjectView />} />
          <Route path="/settings" element={<UserSettings />} />
        </Routes>
      </main>
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
