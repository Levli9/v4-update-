// src/pages/ManagerDashboard.jsx
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { subjectsData } from '../data/subjectsData';
import { Link } from 'react-router-dom';

export default function ManagerDashboard() {
  const { users, currentUser } = useApp();
  const [activeTab, setActiveTab] = useState('stats'); // 'stats' or 'employees'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // Department mapping helper
  const getMockDept = (username) => {
    if (!username) return 'כללי';
    if (username.toLowerCase().includes('yaniv')) return 'פיתוח (R&D)';
    if (username.toLowerCase().includes('lev')) return 'אבטחת מידע (Security)';
    if (username.toLowerCase().includes('emp')) return 'תפעול (Operations)';
    const depts = ['פיתוח (R&D)', 'שיווק ומכירות', 'משאבי אנוש', 'כספים (Finance)'];
    return depts[username.length % depts.length];
  };

  const managerDept = getMockDept(currentUser?.username || '');
  const isGlobalAdmin = currentUser?.username.toLowerCase() === 'lev123' || currentUser?.username.toLowerCase() === 'yaniv123';

  // ── Data Calculations ──
  const allEmployees = users.filter(u => u.role === 'employee');
  const employees = isGlobalAdmin 
    ? allEmployees 
    : allEmployees.filter(emp => getMockDept(emp.username) === managerDept);

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
  let safeCount = 0;
  let vulnerableCount = 0;

  employees.forEach(emp => {
    const xp = emp.progress?.xp || 0;
    if (xp > maxXP) {
      maxXP = xp;
      bestStudent = emp;
    }

    const scores = Object.values(emp.progress?.scores || {});
    const avg = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    if (avg >= 80) {
      safeCount++;
    } else {
      vulnerableCount++;
    }
  });

  // Department calculations
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
      {/* Back Button and Title Row */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <Link 
          to="/select-role" 
          className="px-4 py-2 rounded-xl bg-gray-900 border border-gray-850 hover:border-gray-700 text-xs font-bold text-gray-400 hover:text-white transition-all flex items-center gap-2"
        >
          ← חזרה למסך בחירת תפקיד
        </Link>
        {!isGlobalAdmin && (
          <span className="px-3.5 py-1.5 rounded-lg bg-cyan-950/20 border border-cyan-800/30 text-cyan-400 text-xs font-bold">
            🛡️ תצוגת מנהל מחלקה: <strong>{managerDept}</strong>
          </span>
        )}
      </div>

      {/* Title & Tab Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-800 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-white">דשבורד בקרה וניהול ארגוני</h1>
          <p className="text-xs text-gray-500 font-semibold mt-1">معקב התקדמות וציוני אבטחת מידע של העובדים</p>
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
            
            {/* Card 1 - Employees */}
            <div className="bg-gradient-to-br from-gray-900/80 to-gray-950/80 border border-gray-800 rounded-3xl p-6 flex items-center justify-between relative overflow-hidden shadow-xl">
              <div className="space-y-1 z-10 text-right">
                <div className="text-3xl font-black text-white">{totalEmployees}</div>
                <div className="text-[10px] text-gray-500 font-extrabold tracking-wider uppercase">עובדים במחלקה</div>
              </div>
              <div className="p-4 bg-[#00e6ff]/5 rounded-2xl border border-[#00e6ff]/10 text-[#00e6ff] text-2xl z-10">
                👥
              </div>
              <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-[#00e6ff]/5 rounded-full blur-xl"></div>
            </div>

            {/* Card 2 - Resilience Index */}
            <div className="bg-gradient-to-br from-gray-900/80 to-gray-950/80 border border-gray-800 rounded-3xl p-6 flex items-center justify-between relative overflow-hidden shadow-xl">
              <div className="space-y-1 z-10 text-right">
                <div className="text-3xl font-black text-amber-400">{averageScore}%</div>
                <div className="text-[10px] text-gray-500 font-extrabold tracking-wider uppercase">מדד חוסן ממוצע</div>
              </div>
              <div className="p-4 bg-amber-400/5 rounded-2xl border border-amber-450/10 text-amber-400 text-2xl z-10">
                ⚡
              </div>
              <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-amber-450/5 rounded-full blur-xl"></div>
            </div>

            {/* Card 3 - Safe Employees */}
            <div className="bg-gradient-to-br from-gray-900/80 to-gray-950/80 border border-gray-800 rounded-3xl p-6 flex items-center justify-between relative overflow-hidden shadow-xl">
              <div className="space-y-1 z-10 text-right">
                <div className="text-3xl font-black text-emerald-400">{safeCount}</div>
                <div className="text-[10px] text-gray-500 font-extrabold tracking-wider uppercase">עובדים מוגנים (ציונים 80+)</div>
              </div>
              <div className="p-4 bg-emerald-50/5 rounded-2xl border border-emerald-500/10 text-emerald-405 text-2xl z-10">
                🛡️
              </div>
              <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-emerald-500/5 rounded-full blur-xl"></div>
            </div>

            {/* Card 4 - Vulnerable Employees */}
            <div className="bg-gradient-to-br from-gray-900/80 to-gray-950/80 border border-gray-800 rounded-3xl p-6 flex items-center justify-between relative overflow-hidden shadow-xl">
              <div className="space-y-1 z-10 text-right">
                <div className="text-3xl font-black text-rose-500">{vulnerableCount}</div>
                <div className="text-[10px] text-gray-500 font-extrabold tracking-wider uppercase">חשופים לסיכון (ציונים מתחת 80)</div>
              </div>
              <div className="p-4 bg-rose-500/5 rounded-2xl border border-rose-500/10 text-rose-500 text-2xl z-10">
                ⚠️
              </div>
              <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-rose-500/5 rounded-full blur-xl"></div>
            </div>

          </div>

          {/* Charts & Best Student Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Chart Card */}
            <div className="lg:col-span-2 bg-gray-900/40 border border-gray-800 rounded-3xl p-6">
              <h3 className="text-sm font-bold text-gray-200 mb-6 flex items-center gap-2 text-right justify-start">
                <span>📊</span> ביצועי מחלקות ורמות חוסן אבטחתי
              </h3>
              
              {deptChartData.length === 0 ? (
                <div className="text-center py-12 text-gray-500 text-xs font-semibold">
                  אין מספיק נתונים להצגת גרף מחלקות.
                </div>
              ) : (
                <div className="space-y-6">
                  {deptChartData.map(dept => (
                    <div key={dept.name} className="space-y-2">
                      <div className="flex justify-between text-xs font-bold text-gray-300">
                        <span>{dept.name}</span>
                        <span className={dept.avgScore >= 80 ? 'text-emerald-400' : 'text-amber-400'}>
                          {dept.avgScore}% חוסן
                        </span>
                      </div>
                      <div className="h-4 bg-gray-950 rounded-xl overflow-hidden border border-gray-850 p-0.5">
                        <div 
                          className={`h-full rounded-lg transition-all duration-500 bg-gradient-to-l ${
                            dept.avgScore >= 80 ? 'from-emerald-500 to-teal-500' : 'from-amber-400 to-orange-500'
                          }`}
                          style={{ width: `${dept.avgScore}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}

                  {/* Safety Ratio Visual Bar */}
                  <div className="pt-6 border-t border-gray-850 space-y-3">
                    <h4 className="text-xs font-bold text-gray-400 text-right">יחס חוסן עובדים כללי:</h4>
                    <div className="h-6 w-full rounded-xl overflow-hidden flex border border-gray-850">
                      {safeCount + vulnerableCount > 0 ? (
                        <>
                          <div 
                            className="bg-emerald-500 flex items-center justify-center text-[10px] font-black text-black transition-all"
                            style={{ width: `${(safeCount / (safeCount + vulnerableCount)) * 100}%` }}
                          >
                            {safeCount > 0 && `${Math.round((safeCount / (safeCount + vulnerableCount)) * 100)}% מוגנים`}
                          </div>
                          <div 
                            className="bg-rose-500 flex items-center justify-center text-[10px] font-black text-black transition-all"
                            style={{ width: `${(vulnerableCount / (safeCount + vulnerableCount)) * 100}%` }}
                          >
                            {vulnerableCount > 0 && `${Math.round((vulnerableCount / (safeCount + vulnerableCount)) * 100)}% חשופים`}
                          </div>
                        </>
                      ) : (
                        <div className="w-full bg-gray-900 flex items-center justify-center text-xs text-gray-500">אין נתונים</div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Circular Gauge and Best student display */}
            <div className="bg-gray-900/40 border border-gray-800 rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden">
              
              {/* Circular SVG Posture Gauge */}
              <div className="flex flex-col items-center justify-center text-center py-4 border-b border-gray-850">
                <span className="text-xs font-bold text-gray-400 mb-4">ציון חוסן ארגוני משוקלל</span>
                <div className="relative w-32 h-32 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" stroke="#1f2937" strokeWidth="8" fill="transparent" />
                    <circle 
                      cx="50" 
                      cy="50" 
                      r="40" 
                      stroke={averageScore >= 80 ? '#10b981' : '#f59e0b'} 
                      strokeWidth="8" 
                      fill="transparent" 
                      strokeDasharray="251.2"
                      strokeDashoffset={251.2 - (251.2 * averageScore) / 100}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute text-2xl font-black text-white">{averageScore}%</div>
                </div>
              </div>

              {/* Best student display */}
              <div className="flex flex-col justify-center items-center text-center pt-6">
                <span className="text-4xl filter drop-shadow-[0_0_12px_rgba(255,183,3,0.3)] mb-2">🏆</span>
                <h3 className="text-xs font-bold text-gray-300">מוביל החודש בסייבר במחלקה</h3>
                {bestStudent ? (
                  <>
                    <h4 className="text-lg font-extrabold text-[#00e6ff] mt-2">{bestStudent.username}</h4>
                    <p className="text-[10px] text-gray-400 mt-1">
                      מחלקה: <strong>{getMockDept(bestStudent.username)}</strong>
                    </p>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      צברו: <strong>{bestStudent.progress?.xp || 0} XP</strong> • הושלמו <strong>{(bestStudent.progress?.completedSubjects || []).length}</strong> נושאים
                    </p>
                  </>
                ) : (
                  <p className="text-[10px] text-gray-500 mt-2">טרם נצברו נקודות XP.</p>
                )}
              </div>
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
                      <tr 
                        key={emp.username} 
                        onClick={() => setSelectedEmployee(emp)}
                        className="hover:bg-gray-800/20 transition-colors cursor-pointer"
                      >
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

      {/* Employee Details Modal */}
      {selectedEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-[#0b0b14] border border-gray-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl relative">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-850 flex justify-between items-center bg-gray-950/40">
              <div className="text-right">
                <h3 className="text-lg font-bold text-white">📋 גיליון הישגים וציונים</h3>
                <p className="text-xs text-gray-500 mt-1">עבור העובד: <strong>{selectedEmployee.username}</strong> ({getMockDept(selectedEmployee.username)})</p>
              </div>
              <button 
                onClick={() => setSelectedEmployee(null)}
                className="w-8 h-8 rounded-lg bg-gray-900 border border-gray-800 text-gray-400 hover:text-white flex items-center justify-center transition-all text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 max-h-[380px] overflow-y-auto space-y-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-gray-900/40 border border-gray-850 p-3 rounded-2xl">
                  <div className="text-lg font-extrabold text-[#00e6ff]">{(selectedEmployee.progress?.completedSubjects || []).length} / 11</div>
                  <div className="text-[10px] text-gray-500 font-bold mt-0.5">נושאים שהושלמו</div>
                </div>
                <div className="bg-gray-900/40 border border-gray-850 p-3 rounded-2xl">
                  <div className="text-lg font-extrabold text-[#9d4edd]">{selectedEmployee.progress?.xp || 0}</div>
                  <div className="text-[10px] text-gray-500 font-bold mt-0.5">נקודות XP שנצברו</div>
                </div>
                <div className="bg-gray-900/40 border border-gray-850 p-3 rounded-2xl">
                  <div className="text-lg font-extrabold text-amber-400">
                    {(() => {
                      const scs = Object.values(selectedEmployee.progress?.scores || {});
                      return scs.length > 0 ? `${Math.round(scs.reduce((a,b)=>a+b, 0) / scs.length)}%` : '---';
                    })()}
                  </div>
                  <div className="text-[10px] text-gray-500 font-bold mt-0.5">ציון ממוצע</div>
                </div>
              </div>

              {/* Badges List */}
              {selectedEmployee.progress?.badges && selectedEmployee.progress.badges.length > 0 && (
                <div className="bg-gray-950/40 border border-gray-850 p-4 rounded-2xl text-right">
                  <h4 className="text-xs font-bold text-gray-400 mb-2">🏅 מדליות והישגים:</h4>
                  <div className="flex gap-2 flex-wrap justify-start">
                    {selectedEmployee.progress.badges.map(badge => (
                      <span key={badge} className="px-2.5 py-1 text-[10px] font-bold bg-[#9d4edd]/10 border border-[#9d4edd]/20 text-[#a25cf2] rounded-lg">
                        ⭐ {badge}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Topics List Table */}
              <div className="border border-gray-850 rounded-2xl overflow-hidden">
                <table className="w-full text-right border-collapse text-xs">
                  <thead>
                    <tr className="bg-gray-950/60 border-b border-gray-850 text-gray-400 font-bold">
                      <th className="p-3">נושא הלימוד</th>
                      <th className="p-3 text-center font-bold">סטטוס</th>
                      <th className="p-3 text-center font-bold">ציון במבחן</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-850">
                    {subjectsData.map(subject => {
                      const isCompleted = (selectedEmployee.progress?.completedSubjects || []).includes(subject.id);
                      const score = selectedEmployee.progress?.scores?.[subject.id];
                      return (
                        <tr key={subject.id} className="hover:bg-gray-900/20 transition-colors">
                          <td className="p-3 font-semibold text-gray-200">
                            <span className="ml-2">{subject.emoji}</span>
                            {subject.title}
                          </td>
                          <td className="p-3 text-center">
                            {isCompleted ? (
                              <span className="text-emerald-450 font-bold">✓ הושלם</span>
                            ) : (
                              <span className="text-gray-600 font-semibold">טרם התחיל</span>
                            )}
                          </td>
                          <td className="p-3 text-center font-bold text-white">
                            {score !== undefined ? `${score}%` : '---'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-850 bg-gray-950/40 text-left">
              <button 
                onClick={() => setSelectedEmployee(null)}
                className="px-5 py-2 rounded-xl bg-gray-900 border border-gray-800 hover:border-gray-700 text-gray-300 font-bold text-xs transition-all"
              >
                סגור חלון
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
