// src/pages/RoleSelection.jsx
import React from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

export default function RoleSelection() {
  const { setActiveViewRole } = useApp();
  const navigate = useNavigate();

  const handleSelect = (role) => {
    setActiveViewRole(role);
    navigate('/');
  };

  return (
    <div className="min-h-[70vh] flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-md w-full text-center space-y-8">
        <div>
          <h2 className="text-2xl font-extrabold text-white">בחירת סוג תצוגה</h2>
          <p className="text-xs text-gray-500 font-semibold mt-1">בחר את הממשק אליו תרצה לגשת כעת</p>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {/* Employee Card */}
          <div 
            onClick={() => handleSelect('employee')}
            className="group cursor-pointer bg-gray-900/60 border border-gray-800 hover:border-[#00e6ff] rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 shadow-lg hover:shadow-cyan-950/20"
          >
            <span className="text-4xl block mb-3 group-hover:scale-110 transition-transform">👤</span>
            <h3 className="text-lg font-bold text-gray-100 mb-1">ממשק עובד</h3>
            <p className="text-xs text-gray-400">גישה ללמידה, מעבדות, מבדקים ומעקב התקדמות אישי</p>
          </div>

          {/* Manager Card */}
          <div 
            onClick={() => handleSelect('manager')}
            className="group cursor-pointer bg-gray-900/60 border border-gray-800 hover:border-[#9d4edd] rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 shadow-lg hover:shadow-purple-950/20"
          >
            <span className="text-4xl block mb-3 group-hover:scale-110 transition-transform">📊</span>
            <h3 className="text-lg font-bold text-gray-100 mb-1">ממשק מנהל</h3>
            <p className="text-xs text-gray-400">דשבורד מעקב כללי, ציוני מחלקות וסטטיסטיקת עובדים</p>
          </div>
        </div>
      </div>
    </div>
  );
}
