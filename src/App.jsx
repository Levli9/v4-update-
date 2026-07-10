// src/App.jsx
import React from 'react';
import { HashRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Dashboard from './pages/Dashboard';
import SubjectView from './pages/SubjectView';
import Profile from './pages/Profile';

function App() {
  return (
    <AppProvider>
      <Router>
        <div className="min-h-screen bg-[#07070f] text-gray-100 font-sans selection:bg-[#00e6ff]/30 cyber-grid-bg">
          {/* Cyber-themed Header Navbar */}
          <header className="border-b border-gray-800 bg-[#0a0a14]/80 backdrop-blur-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
              <Link to="/" className="flex items-center gap-2 font-bold text-xl text-[#00e6ff] tracking-wide">
                <span className="text-2xl">🛡️</span>
                <span>מערכת הדרכת סייבר React SPA</span>
              </Link>
              
              <nav className="flex items-center gap-6">
                <Link to="/" className="hover:text-[#00e6ff] transition-colors font-semibold text-sm">לוח בקרה</Link>
                <Link to="/profile" className="hover:text-[#9d4edd] transition-colors font-semibold text-sm">פרופיל הישגים</Link>
              </nav>
            </div>
          </header>

          <main className="max-w-7xl mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/subject/:id" element={<SubjectView />} />
              <Route path="/profile" element={<Profile />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AppProvider>
  );
}

export default App;
