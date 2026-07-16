// src/App.jsx
import React from 'react';
import { HashRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import Dashboard from './pages/Dashboard';
import SubjectView from './pages/SubjectView';
import Login from './pages/Login';
import ManagerDashboard from './pages/ManagerDashboard';
import RoleSelection from './pages/RoleSelection';
import ShieldXLogo from './components/ShieldXLogo';

function AppInner() {
  const { currentUser, activeViewRole, logout } = useApp();

  // If not logged in, force Login page
  if (!currentUser) {
    return <Login />;
  }

  const canAccessManager = currentUser.role === 'manager';
  const isManagerView = canAccessManager && activeViewRole === 'manager';

  return (
    <div className="min-h-screen bg-[#07070f] text-gray-100 font-sans selection:bg-[#00e6ff]/30 cyber-grid-bg">
      {/* Cyber-themed Header Navbar */}
      <header className="border-b border-gray-800 bg-[#0a0a14]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col gap-3 lg:grid lg:grid-cols-[1fr_auto_1fr] lg:items-center lg:gap-6">
          <div className="hidden lg:block" aria-hidden="true" />

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
          
          <nav className="flex items-center justify-center lg:justify-self-end gap-4 xl:gap-6 flex-wrap">
            {isManagerView ? (
              <Link to="/" className="hover:text-[#00e6ff] transition-colors font-semibold text-xs bg-cyan-950/20 border border-cyan-800/30 px-3 py-1.5 rounded-lg">
                📊 דשבורד מנהל
              </Link>
            ) : (
              <>
                <Link to="/" className="hover:text-[#00e6ff] transition-colors font-semibold text-xs">פורטל למידה</Link>
              </>
            )}

            <Link
              to="/select-role"
              className="text-xs font-bold px-3 py-1.5 rounded-lg bg-gray-900 border border-gray-800 hover:border-gray-700 text-gray-400 hover:text-white transition-all"
            >
              🔄 החלף ממשק תצוגה
            </Link>

            <div className="flex items-center gap-3 border-r border-gray-800 pr-6">
              <span className="text-xs text-gray-400 font-medium">שלום, <strong>{currentUser.username}</strong></span>
              <button 
                onClick={logout}
                className="text-xs font-bold text-rose-500 hover:text-rose-400 hover:bg-rose-950/20 px-2.5 py-1 rounded transition-all border border-transparent hover:border-rose-900/30"
              >
                התנתק 🚪
              </button>
            </div>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <Routes>
          {/* Dashboard Route changes dynamically depending on selected view role */}
          <Route path="/" element={isManagerView ? <ManagerDashboard /> : <Dashboard />} />
          <Route path="/subject/:id" element={<SubjectView />} />
          <Route path="/select-role" element={<RoleSelection />} />
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
