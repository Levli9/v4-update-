// src/pages/ManagerDashboard.jsx
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { subjectsData } from '../data/subjectsData';

export default function ManagerDashboard() {
  const { users } = useApp();
  const [activeTab, setActiveTab] = useState('stats'); // 'stats' or 'employees'
  const [searchQuery, setSearchQuery] = useState('');

  // ── Data Calculations ──
  const employees = users.filter(u => u.role === 'employee' || u.role === 'special');
  const totalEmployees = employees.length;

  // Average Score across all completed quizzes
  let totalScoreSum = 0;
  let totalExamsTaken = 0;
  let totalCompletedSubjects = 0;

  employees.forEach(emp => {
    const scores = Object.values(emp.progress?.scores || {});
    scores.forEach(s => {
      totalScoreSum += s;
      totalExamsTaken += 1;
    });
    totalCompletedSubjects += (emp.progress?.completedSubjects || []).length;
  });

  const averageScore = totalExamsTaken > 0 ? Math.round(totalScoreSum / totalExamsTaken) : 0;
  
  // Overall completion percentage
  const totalPossibleCompletions = totalEmployees * subjectsData.length;
  const overallCompletionPct = totalPossibleCompletions > 0 
    ? Math.round((totalCompletedSubjects / totalPossibleCompletions) * 100)
    : 0;

  // Best student (highest XP or highest average score)
  let bestStudent = null;
  let maxXP = -1;
  employees.forEach(emp => {
    const xp = emp.progress?.xp || 0;
    if (xp > maxXP) {
      maxXP = xp;
      bestStudent = emp;
    }
  });

  // Department calculations (Mock departments mapped from emails or usernames)
  // Let's group users into mock departments: "פיתוח", "שיווק", "משאבי אנוש"
  const getMockDept = (username) => {
    if (username === 'admin') return 'הנהלה';
    if (username === 'special') return 'פיתוח';
    if (username === 'user') return 'שיווק';
    // Fallback based on name length
    const depts = ['פיתוח', 'שיווק', 'משאבי אנוש', 'כספים'];
    return depts[username.length % depts.length];
  };

  const deptStats = {};
  employees.forEach(emp => {
    const dept = getMockDept(emp.username);
    if (!deptStats[dept]) {
      deptStats[dept] = { scoreSum: 0, count: 0 };
    }
    const scores = Object.values(emp.progress?.scores || {});
    if (scores.length > 0) {
      const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
      deptStats[dept].scoreSum += avg;
      deptStats[dept].count += 1;
    }
  });

  const deptChartData = Object.keys(deptStats).map(dept => {
    const stats = deptStats[dept];
    return {
      name: dept,
      avgScore: stats.count > 0 ? Math.round(stats.scoreSum / stats.count) : 0
    };
  });

  // Filtered employees list for table
  const filteredEmployees = employees.filter(emp => {
    const query = searchQuery.toLowerCase();
    const matchesUser = emp.username.toLowerCase().includes(query);
    const matchesEmail = emp.email.toLowerCase().includes(query);
    const matchesDept = getMockDept(emp.username).toLowerCase().includes(query);
    return matchesUser || matchesEmail || matchesDept;
  });

  return (
    <div className="space-y-8">
      {/* Title & Tab Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-800 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-white">דשבורד בקרה וניהול ארגוני</h1>
          <p className="text-xs text-gray-500 font-semibold mt-1">מעקב התקדמות וציוני אבטחת מידע של העובדים</p>
        </div>

        {/* Tab Selector Buttons */}
        <div className="flex bg-gray-900 border border-gray-850 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-5 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'stats' ? 'bg-[#00e6ff] text-black shadow-md' : 'text-gray-400 hover:text-white'
            }`}
          >
            סטטיסטיקה ודוחות
          </button>
          <button
            onClick={() => setActiveTab('employees')}
            className={`px-5 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'employees' ? 'bg-[#00e6ff] text-black shadow-md' : 'text-gray-400 hover:text-white'
            }`}
          >
            מעקב עובדים
          </button>
        </div>
      </div>

      {/* STATS VIEW */}
      {activeTab === 'stats' && (
        <div className="space-y-8">
          {/* Stat Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Card 1 */}
            <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-5 flex items-center gap-4 relative overflow-hidden">
              <span className="text-3xl p-3 bg-gray-950 rounded-xl border border-gray-850">👥</span>
              <div>
                <div className="text-2xl font-extrabold text-white">{totalEmployees}</div>
                <div className="text-[10px] text-gray-500 font-bold">עובדים רשומים</div>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-5 flex items-center gap-4 relative overflow-hidden">
              <span className="text-3xl p-3 bg-gray-950 rounded-xl border border-gray-850 text-amber-400">⭐</span>
              <div>
                <div className="text-2xl font-extrabold text-white">{averageScore}%</div>
                <div className="text-[10px] text-gray-500 font-bold">ממוצע ציונים כללי</div>
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-5 flex items-center gap-4 relative overflow-hidden">
              <span className="text-3xl p-3 bg-gray-950 rounded-xl border border-gray-850 text-[#9d4edd]">📊</span>
              <div>
                <div className="text-2xl font-extrabold text-white">{totalExamsTaken}</div>
                <div className="text-[10px] text-gray-500 font-bold">מבדקי ידע שבוצעו</div>
              </div>
            </div>

            {/* Card 4 */}
            <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-5 flex items-center gap-4 relative overflow-hidden">
              <span className="text-3xl p-3 bg-gray-950 rounded-xl border border-gray-850 text-emerald-400">🎓</span>
              <div>
                <div className="text-2xl font-extrabold text-white">{overallCompletionPct}%</div>
                <div className="text-[10px] text-gray-500 font-bold">אחוז השלמה כולל</div>
              </div>
            </div>

          </div>

          {/* Charts & Best Student Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Chart Card */}
            <div className="lg:col-span-2 bg-gray-900/40 border border-gray-800 rounded-2xl p-6">
              <h3 className="text-md font-bold text-gray-200 mb-6 flex items-center gap-2">
                <span>📈</span> ממוצע ציונים לפי מחלקה
              </h3>
              
              {deptChartData.length === 0 ? (
                <div className="text-center py-12 text-gray-500 text-xs font-semibold">
                  אין מספיק נתונים להצגת גרף מחלקות.
                </div>
              ) : (
                <div className="space-y-4">
                  {deptChartData.map(dept => (
                    <div key={dept.name} className="space-y-1">
                      <div className="flex justify-between text-xs font-bold text-gray-400">
                        <span>{dept.name}</span>
                        <span>{dept.avgScore}%</span>
                      </div>
                      <div className="h-3 bg-gray-950 rounded-lg overflow-hidden border border-gray-850">
                        <div 
                          className="h-full bg-gradient-to-l from-[#00e6ff] to-cyan-500 rounded-lg transition-all duration-300"
                          style={{ width: `${dept.avgScore}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Best student display */}
            <div className="bg-gray-900/40 border border-gray-800 rounded-2xl p-6 flex flex-col justify-center items-center text-center">
              <span className="text-5xl filter drop-shadow-[0_0_12px_rgba(255,183,3,0.3)] mb-4">🏆</span>
              <h3 className="text-md font-bold text-gray-200">מוביל החודש בסייבר</h3>
              {bestStudent ? (
                <>
                  <h4 className="text-xl font-extrabold text-[#00e6ff] mt-3">{bestStudent.username}</h4>
                  <p className="text-xs text-gray-400 mt-2">
                    מחלקה: <strong>{getMockDept(bestStudent.username)}</strong>
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    צברו: <strong>{bestStudent.progress?.xp || 0} XP</strong> • הושלמו <strong>{(bestStudent.progress?.completedSubjects || []).length}</strong> נושאים
                  </p>
                </>
              ) : (
                <p className="text-xs text-gray-500 mt-4">טרם נצברו נקודות XP.</p>
              )}
            </div>

          </div>
        </div>
      )}

      {/* EMPLOYEES TABLE VIEW */}
      {activeTab === 'employees' && (
        <div className="bg-gray-900/40 border border-gray-800 rounded-2xl p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h3 className="text-md font-bold text-gray-200">רשימת עובדים ומעקב למידה</h3>
            
            {/* Search Input */}
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:max-w-xs px-4 py-2 rounded-xl bg-gray-950 border border-gray-850 text-white text-xs focus:border-[#00e6ff] focus:outline-none"
              placeholder="חפש עובד, אימייל או מחלקה..."
            />
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto border border-gray-850 rounded-xl">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-gray-950/60 border-b border-gray-850 text-xs font-bold text-gray-400">
                  <th className="p-4">שם עובד</th>
                  <th className="p-4">מחלקה</th>
                  <th className="p-4 text-center">נושאים שהושלמו</th>
                  <th className="p-4 text-center">נקודות XP</th>
                  <th className="p-4 text-center">ציון ממוצע</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-850 text-xs">
                {filteredEmployees.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-500">
                      לא נמצאו עובדים התואמים את החיפוש.
                    </td>
                  </tr>
                ) : (
                  filteredEmployees.map(emp => {
                    const completedCount = (emp.progress?.completedSubjects || []).length;
                    const scores = Object.values(emp.progress?.scores || {});
                    const avgScore = scores.length > 0 
                      ? Math.round(scores.reduce((a,b)=>a+b, 0) / scores.length)
                      : 0;

                    return (
                      <tr key={emp.username} className="hover:bg-gray-800/10 transition-colors">
                        <td className="p-4 font-bold text-white">
                          <div>{emp.username}</div>
                          <div className="text-[10px] text-gray-500 font-semibold">{emp.email}</div>
                        </td>
                        <td className="p-4 text-gray-300 font-semibold">{getMockDept(emp.username)}</td>
                        <td className="p-4 text-center text-gray-300 font-bold">{completedCount} / 11</td>
                        <td className="p-4 text-center font-bold text-[#9d4edd]">{emp.progress?.xp || 0}</td>
                        <td className="p-4 text-center">
                          <span className={`px-2 py-1 rounded font-bold ${
                            avgScore >= 80 ? 'bg-emerald-500/10 text-emerald-400' : avgScore > 0 ? 'bg-amber-500/10 text-amber-400' : 'bg-gray-850 text-gray-500'
                          }`}>
                            {avgScore > 0 ? `${avgScore}%` : '---'}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
