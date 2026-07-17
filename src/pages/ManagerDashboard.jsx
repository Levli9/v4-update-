// src/pages/ManagerDashboard.jsx
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { subjectsData } from '../data/subjectsData';
import BackButton from '../components/BackButton';
import LearningTimeline from '../components/LearningTimeline';

export default function ManagerDashboard() {
  const { users, currentUser, setActiveViewRole } = useApp();
  const [activeTab, setActiveTab] = useState('stats'); // 'stats' or 'employees'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [finalStatusFilter, setFinalStatusFilter] = useState('all');

  // Department mapping helper
  const getMockDept = (userOrUsername) => {
    const userRecord = typeof userOrUsername === 'object'
      ? userOrUsername
      : users.find((user) => user.username === userOrUsername);
    if (userRecord?.department) return userRecord.department;
    const username = typeof userOrUsername === 'string' ? userOrUsername : userOrUsername?.username;
    if (!username) return 'כללי';
    if (username.toLowerCase().includes('yaniv')) return 'פיתוח (R&D)';
    if (username.toLowerCase().includes('lev')) return 'אבטחת מידע (Security)';
    if (username.toLowerCase().includes('emp')) return 'תפעול (Operations)';
    const depts = ['פיתוח (R&D)', 'שיווק ומכירות', 'משאבי אנוש', 'כספים (Finance)'];
    return depts[username.length % depts.length];
  };

  const getShortDeptName = (department = '') => {
    const normalized = department.toLowerCase();
    if (normalized.includes('r&d') || normalized.includes('פיתוח')) return 'פיתוח';
    if (normalized.includes('security') || normalized.includes('אבטחת')) return 'אבטחת מידע';
    if (normalized.includes('משאבי')) return 'משאבי אנוש';
    if (normalized.includes('finance') || normalized.includes('כספים')) return 'כספים';
    if (normalized.includes('operations') || normalized.includes('תפעול')) return 'תפעול';
    if (normalized.includes('שיווק')) return 'שיווק ומכירות';
    return department.replace(/\s*\([^)]*\)\s*/g, '').trim();
  };

  const managerDept = getMockDept(currentUser?.username || '');
  const isGlobalAdmin = currentUser?.role === 'admin' || currentUser?.username.toLowerCase() === 'lev123' || currentUser?.username.toLowerCase() === 'yaniv123';

  // ── Data Calculations ──
  const allEmployees = users.filter(u => u.role === 'employee');
  const scopedEmployees = isGlobalAdmin
    ? allEmployees
    : allEmployees.filter(emp => getMockDept(emp.username) === managerDept);

  const departmentOptions = [...new Set(scopedEmployees.map(emp => getMockDept(emp.username)))].sort();
  const employees = selectedDepartment === 'all'
    ? scopedEmployees
    : scopedEmployees.filter(emp => getMockDept(emp.username) === selectedDepartment);

  const totalEmployees = employees.length;

  // Average Score across all completed quizzes
  let totalScoreSum = 0;
  let totalExamsTaken = 0;
  let totalCompletedSubjects = 0;
  let passedAssessments = 0;
  let failedAssessments = 0;

  employees.forEach(emp => {
    const scores = Object.values(emp.progress?.scores || {});
    scores.forEach(s => {
      totalScoreSum += s;
      totalExamsTaken += 1;
      if (s >= 80) passedAssessments += 1;
      else failedAssessments += 1;
    });
    totalCompletedSubjects += (emp.progress?.completedSubjects || []).length;
  });

  const averageScore = totalExamsTaken > 0 ? Math.round(totalScoreSum / totalExamsTaken) : 0;
  const passRate = totalExamsTaken > 0 ? Math.round((passedAssessments / totalExamsTaken) * 100) : 0;
  const participatingCount = employees.filter(emp => (emp.progress?.completedSubjects || []).length > 0).length;
  const notStartedCount = totalEmployees - participatingCount;
  const participationRate = totalEmployees > 0 ? Math.round((participatingCount / totalEmployees) * 100) : 0;
  const activeSince = Date.now() - (30 * 24 * 60 * 60 * 1000);
  const activeEmployeesCount = employees.filter(emp => {
    const activityDate = emp.lastActivity || emp.lastLogin;
    return activityDate && new Date(activityDate).getTime() >= activeSince;
  }).length;
  
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
    if (scores.length > 0 && avg >= 80) {
      safeCount++;
    } else if (scores.length > 0) {
      vulnerableCount++;
    }
  });

  // Department calculations
  const deptStats = {};
  employees.forEach(emp => {
    const dept = getMockDept(emp.username);
    if (!deptStats[dept]) {
      deptStats[dept] = { scoreSum: 0, scoreCount: 0, employeeCount: 0, completedSubjects: 0 };
    }
    deptStats[dept].employeeCount += 1;
    deptStats[dept].completedSubjects += (emp.progress?.completedSubjects || []).length;
    const scores = Object.values(emp.progress?.scores || {});
    if (scores.length > 0) {
      const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
      deptStats[dept].scoreSum += avg;
      deptStats[dept].scoreCount += 1;
    }
  });

  const deptChartData = Object.keys(deptStats).map(dept => {
    const stats = deptStats[dept];
    return {
      name: dept,
      avgScore: stats.scoreCount > 0 ? Math.round(stats.scoreSum / stats.scoreCount) : 0,
      completionRate: stats.employeeCount > 0
        ? Math.round((stats.completedSubjects / (stats.employeeCount * subjectsData.length)) * 100)
        : 0,
      employeeCount: stats.employeeCount
    };
  });

  const completedProgramCount = employees.filter(emp => (emp.progress?.completedSubjects || []).length >= subjectsData.length).length;
  const inProgressCount = Math.max(0, totalEmployees - notStartedCount - completedProgramCount);
  const unassessedCount = Math.max(0, totalEmployees - safeCount - vulnerableCount);

  const createDonut = (segments, total) => {
    if (!total) return '#1f2937';
    let cursor = 0;
    const stops = segments.map(({ value, color }) => {
      const start = cursor;
      cursor += (value / total) * 100;
      return `${color} ${start}% ${cursor}%`;
    });
    return `conic-gradient(${stops.join(', ')})`;
  };

  const learningDonut = createDonut([
    { value: completedProgramCount, color: '#10b981' },
    { value: inProgressCount, color: '#00e6ff' },
    { value: notStartedCount, color: '#475569' }
  ], totalEmployees);

  const assessmentDonut = createDonut([
    { value: safeCount, color: '#10b981' },
    { value: vulnerableCount, color: '#f43f5e' },
    { value: unassessedCount, color: '#475569' }
  ], totalEmployees);

  const topicPerformance = subjectsData.map(subject => {
    const scores = employees
      .map(emp => emp.progress?.scores?.[subject.id])
      .filter(score => typeof score === 'number');
    const completed = employees.filter(emp => (emp.progress?.completedSubjects || []).includes(subject.id)).length;
    return {
      id: subject.id,
      title: subject.title,
      emoji: subject.emoji,
      attempts: scores.length,
      completed,
      completionRate: totalEmployees ? Math.round((completed / totalEmployees) * 100) : 0,
      avgScore: scores.length ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) : 0
    };
  });

  const bestDepartment = [...deptChartData].sort((a, b) => (b.avgScore + b.completionRate) - (a.avgScore + a.completionRate))[0];
  const organizationHealth = Math.round((averageScore * 0.4) + (overallCompletionPct * 0.35) + (participationRate * 0.25));
  const organizationHealthLabel = organizationHealth >= 80 ? 'מצב טוב' : organizationHealth >= 60 ? 'דורש שיפור' : 'סיכון גבוה';
  const employeeRiskPoints = employees.map(emp => {
    const completed = (emp.progress?.completedSubjects || []).length;
    const scores = Object.values(emp.progress?.scores || {});
    return {
      ...emp,
      completionRate: subjectsData.length ? Math.round((completed / subjectsData.length) * 100) : 0,
      avgScore: scores.length ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) : 0,
      hasAssessment: scores.length > 0
    };
  });
  const criticalEmployees = employeeRiskPoints.filter(emp => emp.completionRate < 40 || (emp.hasAssessment && emp.avgScore < 70)).length;
  const finalExamPassed = employees.filter((emp) => emp.progress?.finalExam?.passed).length;
  const finalExamFailed = employees.filter((emp) => emp.progress?.finalExam && !emp.progress.finalExam.passed).length;
  const finalExamNotTaken = Math.max(0, totalEmployees - finalExamPassed - finalExamFailed);
  const finalExamAttempts = employees.reduce((total, emp) => total + (emp.progress?.finalExam?.attempts || 0), 0);
  const finalExamSuccessRate = finalExamAttempts
    ? Math.round((employees.reduce((total, emp) => total + (emp.progress?.finalExam?.history || []).filter((attempt) => attempt.passed).length, 0) / finalExamAttempts) * 100)
    : 0;
  const certificationNotifications = employees
    .filter((emp) => emp.progress?.finalExam?.history?.length)
    .flatMap((emp) => emp.progress.finalExam.history.map((attempt) => ({ ...attempt, username: emp.username, department: getMockDept(emp) })))
    .sort((a, b) => new Date(b.attemptedAt) - new Date(a.attemptedAt))
    .slice(0, 8);
  const now = Date.now();
  const isPresenceLive = (emp) => emp.presence?.lastSeen && now - new Date(emp.presence.lastSeen).getTime() < 90000;
  const learningNow = employees.filter((emp) => isPresenceLive(emp) && emp.presence.activity === 'learning').length;
  const testingNow = employees.filter((emp) => isPresenceLive(emp) && emp.presence.activity === 'final-exam').length;
  const inactiveThisWeek = employees.filter((emp) => !emp.lastActivity || now - new Date(emp.lastActivity).getTime() > 7 * 86400000).length;
  const completedRecently = employees.filter((emp) => Object.values(emp.analytics?.courses || {}).some((course) => course.completedAt && now - new Date(course.completedAt).getTime() < 24 * 3600000)).length;
  const certifiedRecently = employees.filter((emp) => emp.progress?.finalExam?.passedAt && now - new Date(emp.progress.finalExam.passedAt).getTime() < 24 * 3600000).length;
  const managementInsights = [
    finalExamPassed > 0 && { tone: 'emerald', icon: '🎓', title: `${finalExamPassed} עובדים מוסמכים`, text: `${finalExamSuccessRate}% הצלחה בניסיונות המבחן המסכם.` },
    finalExamFailed > 0 && { tone: 'rose', icon: '📕', title: `${finalExamFailed} עובדים טרם עברו את המבחן המסכם`, text: 'מומלץ להקצות חזרה ממוקדת על הנושאים החלשים וניסיון נוסף.' },
    notStartedCount > 0 && { tone: 'rose', icon: '🚨', title: `${notStartedCount} עובדים טרם התחילו`, text: 'מומלץ לשלוח תזכורת ולהגדיר מועד יעד להתחלת הלמידה.' },
    failedAssessments > 0 && { tone: 'amber', icon: '📝', title: `${failedAssessments} מבדקים מתחת לציון המעבר`, text: 'כדאי להקצות חזרה על החומר ולתאם ניסיון נוסף.' },
    activeEmployeesCount < totalEmployees && { tone: 'purple', icon: '🕒', title: `${totalEmployees - activeEmployeesCount} עובדים ללא פעילות ב־30 יום`, text: 'יש לבדוק זמינות, עומס עבודה או צורך בסיוע אישי.' },
    overallCompletionPct >= 80 && { tone: 'emerald', icon: '🏆', title: 'יעד ההשלמה הארגוני הושג', text: 'רמת ההשלמה גבוהה. מומלץ להתמקד בנושאים עם הציון הנמוך ביותר.' }
  ].filter(Boolean);

  const exportManagementReport = () => {
    const headers = ['עובד', 'מחלקה', 'השלמת קורסים', 'ציון ממוצע', 'נקודות XP', 'מבחן מסכם', 'ציון אחרון', 'ניסיונות', 'פעילות אחרונה', 'סטטוס'];
    const rows = employeeRiskPoints.map(emp => [
      emp.username,
      getMockDept(emp.username),
      `${emp.completionRate}%`,
      emp.hasAssessment ? `${emp.avgScore}%` : 'ללא מבדק',
      emp.progress?.xp || 0,
      emp.progress?.finalExam?.passed ? 'עבר בהצלחה' : emp.progress?.finalExam ? 'לא עבר' : 'טרם ניגש',
      emp.progress?.finalExam?.lastScore ?? '',
      emp.progress?.finalExam?.attempts || 0,
      formatActivityDate(emp.lastActivity || emp.lastLogin),
      emp.completionRate === 0 ? 'טרם התחיל' : emp.completionRate === 100 ? 'הושלם' : 'בתהליך'
    ]);
    const csv = [headers, ...rows]
      .map(row => row.map(value => `"${String(value).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `shieldx-management-report-${new Date().toISOString().slice(0, 10)}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const employeesNeedingAttention = employees
    .map(emp => {
      const completed = (emp.progress?.completedSubjects || []).length;
      const scores = Object.values(emp.progress?.scores || {});
      const avg = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;
      return {
        ...emp,
        completed,
        avg,
        priority: completed === 0 ? 3 : avg !== null && avg < 80 ? 2 : completed < subjectsData.length / 2 ? 1 : 0
      };
    })
    .filter(emp => emp.priority > 0)
    .sort((a, b) => b.priority - a.priority || a.completed - b.completed)
    .slice(0, 5);

  const recentActivity = employees
    .filter(emp => emp.lastActivity || emp.lastLogin)
    .sort((a, b) => new Date(b.lastActivity || b.lastLogin) - new Date(a.lastActivity || a.lastLogin))
    .slice(0, 5);

  const formatActivityDate = (date) => date
    ? new Intl.DateTimeFormat('he-IL', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(date))
    : 'אין פעילות';

  // Filtered employees list for table
  const filteredEmployees = employees.filter(emp => {
    const query = searchQuery.toLowerCase();
    const matchesUser = emp.username.toLowerCase().includes(query);
    const matchesEmail = emp.email.toLowerCase().includes(query);
    const matchesDept = getMockDept(emp.username).toLowerCase().includes(query);
    const exam = emp.progress?.finalExam;
    const examStatus = exam?.passed ? 'passed' : exam ? 'failed' : 'not-taken';
    const matchesFinalStatus = finalStatusFilter === 'all' || finalStatusFilter === examStatus;
    return (matchesUser || matchesEmail || matchesDept) && matchesFinalStatus;
  });

  return (
    <div className="space-y-8">
      {/* Back Button and Title Row */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <BackButton onClick={() => setActiveViewRole('employee')} />
        {!isGlobalAdmin && (
          <span className="px-3.5 py-1.5 rounded-lg bg-cyan-950/20 border border-cyan-800/30 text-cyan-400 text-xs font-bold">
            🛡️ תצוגת מנהל מחלקה: <strong>{managerDept}</strong>
          </span>
        )}
      </div>

      {/* Title & Tab Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-800 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-white">דשבורד מנהלים</h1>
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
          <section className="rounded-3xl border border-gray-800 bg-gray-900/45 p-4"><div className="mb-3 flex items-center justify-between gap-3 px-1"><span className="text-[9px] font-bold text-gray-600">נתוני עובדים בלבד · מתעדכן בזמן אמת</span><h2 className="text-sm font-black text-white">👥 מעקב עובדים בזמן אמת</h2></div><div className="grid grid-cols-2 gap-3 md:grid-cols-5">
            {[[`🟢 ${learningNow}`, 'עובדים לומדים עכשיו'], [`🟡 ${testingNow}`, 'עובדים במבחן כרגע'], [`🔴 ${inactiveThisWeek}`, 'עובדים שלא התחברו השבוע'], [`🔵 ${completedRecently}`, 'עובדים שסיימו קורס היום'], [`🟣 ${certifiedRecently}`, 'עובדים שהוסמכו היום']].map(([value, label]) => <div key={label} className="rounded-2xl border border-gray-800 bg-gray-950/45 p-3 text-center"><strong className="block text-lg text-white">{value}</strong><span className="mt-1 block text-[9px] font-bold text-gray-600">{label}</span></div>)}
          </div>
          </section>
          <section className="relative overflow-hidden rounded-[2rem] border border-[#00e6ff]/20 bg-gradient-to-l from-[#071b2a] via-[#0b1120] to-[#151126] p-6 shadow-[0_25px_80px_rgba(0,0,0,0.35)] sm:p-8">
            <div className="absolute -left-16 -top-20 h-64 w-64 rounded-full bg-purple-500/10 blur-3xl" />
            <div className="absolute -bottom-24 right-12 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />
            <div className="relative grid items-center gap-7 lg:grid-cols-[auto_1fr_auto]">
              <div className="relative grid h-36 w-36 place-items-center rounded-full" style={{ background: `conic-gradient(${organizationHealth >= 80 ? '#10b981' : organizationHealth >= 60 ? '#f59e0b' : '#f43f5e'} ${organizationHealth}%, #1f2937 ${organizationHealth}% 100%)` }}>
                <div className="grid h-24 w-24 place-items-center rounded-full border border-white/10 bg-[#09101d] text-center">
                  <span><strong className="block text-3xl text-white">{organizationHealth}</strong><small className="text-[9px] font-black text-gray-500">מתוך 100</small></span>
                </div>
              </div>
              <div className="text-right">
                <span className={`inline-flex rounded-full px-3 py-1 text-[10px] font-black ${organizationHealth >= 80 ? 'bg-emerald-500/10 text-emerald-400' : organizationHealth >= 60 ? 'bg-amber-500/10 text-amber-400' : 'bg-rose-500/10 text-rose-400'}`}>{organizationHealthLabel}</span>
                <h2 className="mt-3 text-2xl font-black text-white">תמונת מצב ניהולית מלאה</h2>
                <p className="mt-2 max-w-2xl text-xs font-semibold leading-relaxed text-gray-400">ציון הבריאות משקלל ציוני מבדקים, השלמת מסלולים והשתתפות עובדים. הנתונים מחושבים בזמן אמת עבור {selectedDepartment === 'all' ? 'כל המחלקות' : selectedDepartment}.</p>
                <div className="mt-5 flex flex-wrap gap-3 text-[10px] font-bold">
                  <span className="rounded-lg border border-gray-700 bg-black/20 px-3 py-2 text-gray-300">🚨 {criticalEmployees} עובדים בסיכון</span>
                  <span className="rounded-lg border border-gray-700 bg-black/20 px-3 py-2 text-gray-300">📚 {overallCompletionPct}% השלמה</span>
                  <span className="rounded-lg border border-gray-700 bg-black/20 px-3 py-2 text-gray-300">📝 {passRate}% מעבר</span>
                  <span className="rounded-lg border border-gray-700 bg-black/20 px-3 py-2 text-gray-300">🟢 {activeEmployeesCount} פעילים</span>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                {isGlobalAdmin && <select value={selectedDepartment} onChange={event => setSelectedDepartment(event.target.value)} className="rounded-xl border border-gray-700 bg-gray-950/80 px-4 py-3 text-xs font-bold text-gray-200 outline-none focus:border-cyan-400">
                  <option value="all">כל המחלקות</option>
                  {departmentOptions.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                </select>}
                <button type="button" onClick={exportManagementReport} className="rounded-xl border border-cyan-400/25 bg-cyan-400/10 px-5 py-3 text-xs font-black text-cyan-300 transition-colors hover:bg-cyan-400/20">⬇ ייצוא דו״ח CSV</button>
                <span className="text-center text-[9px] font-semibold text-gray-600">עודכן: {new Intl.DateTimeFormat('he-IL', { timeStyle: 'short' }).format(new Date())}</span>
              </div>
            </div>
          </section>

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

          {/* Live learning indicators */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'השתתפות בלמידה', value: `${participationRate}%`, detail: `${participatingCount} מתוך ${totalEmployees} עובדים`, icon: '🎯', color: 'text-cyan-400' },
              { label: 'השלמת כלל הקורסים', value: `${overallCompletionPct}%`, detail: `${totalCompletedSubjects} השלמות בפועל`, icon: '✅', color: 'text-emerald-400' },
              { label: 'שיעור מעבר במבדקים', value: `${passRate}%`, detail: `${passedAssessments} עברו מתוך ${totalExamsTaken}`, icon: '📝', color: 'text-purple-400' },
              { label: 'עובדים פעילים ב־30 יום', value: activeEmployeesCount, detail: `${notStartedCount} טרם התחילו ללמוד`, icon: '🟢', color: 'text-amber-400' }
            ].map(metric => (
              <div key={metric.label} className="rounded-2xl border border-gray-800 bg-gray-900/40 p-5 text-right shadow-lg">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <span className="text-xl" aria-hidden="true">{metric.icon}</span>
                  <span className={`text-2xl font-black ${metric.color}`}>{metric.value}</span>
                </div>
                <p className="text-xs font-extrabold text-gray-200">{metric.label}</p>
                <p className="mt-1 text-[10px] font-semibold text-gray-500">{metric.detail}</p>
              </div>
            ))}
          </div>

          {/* Executive visual overview */}
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            <section className="rounded-3xl border border-cyan-500/15 bg-gradient-to-br from-gray-900/75 to-gray-950/75 p-6 shadow-xl">
              <div className="mb-6 flex items-center justify-between">
                <span className="rounded-lg bg-cyan-500/10 px-2.5 py-1 text-[10px] font-black text-cyan-400">{participationRate}% השתתפות</span>
                <h3 className="text-sm font-extrabold text-white">סטטוס מסלול הלמידה</h3>
              </div>
              <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-around xl:flex-col">
                <div className="relative grid h-40 w-40 place-items-center rounded-full shadow-[0_0_35px_rgba(0,230,255,0.08)]" style={{ background: learningDonut }}>
                  <div className="grid h-24 w-24 place-items-center rounded-full border border-gray-800 bg-[#0a0d17] text-center">
                    <span><strong className="block text-2xl text-white">{totalEmployees}</strong><small className="text-[10px] font-bold text-gray-500">עובדים</small></span>
                  </div>
                </div>
                <div className="w-full space-y-3 text-xs font-bold">
                  {[
                    ['#10b981', 'סיימו את המסלול', completedProgramCount],
                    ['#00e6ff', 'בתהליך למידה', inProgressCount],
                    ['#475569', 'טרם התחילו', notStartedCount]
                  ].map(([color, label, value]) => (
                    <div key={label} className="flex items-center justify-between rounded-xl bg-gray-950/40 px-3 py-2.5">
                      <strong className="text-white">{value}</strong>
                      <span className="flex items-center gap-2 text-gray-400"><i className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-purple-500/15 bg-gradient-to-br from-gray-900/75 to-gray-950/75 p-6 shadow-xl">
              <div className="mb-6 flex items-center justify-between">
                <span className="rounded-lg bg-purple-500/10 px-2.5 py-1 text-[10px] font-black text-purple-400">{totalExamsTaken} ניסיונות</span>
                <h3 className="text-sm font-extrabold text-white">חוסן לפי תוצאות עובדים</h3>
              </div>
              <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-around xl:flex-col">
                <div className="relative grid h-40 w-40 place-items-center rounded-full shadow-[0_0_35px_rgba(157,78,221,0.12)]" style={{ background: assessmentDonut }}>
                  <div className="grid h-24 w-24 place-items-center rounded-full border border-gray-800 bg-[#0a0d17] text-center">
                    <span><strong className="block text-2xl text-white">{passRate}%</strong><small className="text-[10px] font-bold text-gray-500">שיעור מעבר</small></span>
                  </div>
                </div>
                <div className="w-full space-y-3 text-xs font-bold">
                  {[
                    ['#10b981', 'עובדים מוגנים', safeCount],
                    ['#f43f5e', 'דורשים חיזוק', vulnerableCount],
                    ['#475569', 'ללא מבדק', unassessedCount]
                  ].map(([color, label, value]) => (
                    <div key={label} className="flex items-center justify-between rounded-xl bg-gray-950/40 px-3 py-2.5">
                      <strong className="text-white">{value}</strong>
                      <span className="flex items-center gap-2 text-gray-400"><i className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-amber-500/15 bg-gradient-to-br from-gray-900/75 to-gray-950/75 p-6 shadow-xl">
              <div className="mb-6 flex items-center justify-between">
                <span className="text-[10px] font-bold text-gray-500">חוסן מול השלמה</span>
                <h3 className="text-sm font-extrabold text-white">השוואת מחלקות</h3>
              </div>
              {deptChartData.length ? (
                <div className="overflow-x-auto pb-2">
                  <div className="grid h-[300px] min-w-[560px] items-end gap-3 border-b border-gray-800 px-2 pb-3" style={{ gridTemplateColumns: `repeat(${deptChartData.length}, minmax(88px, 1fr))` }}>
                    {deptChartData.map(dept => (
                      <div key={dept.name} className="flex h-[270px] min-w-0 flex-col items-center justify-end">
                        <div className="flex h-[210px] items-end gap-2">
                          <div className="w-7 rounded-t-lg bg-gradient-to-t from-cyan-700 to-cyan-400 transition-all" style={{ height: `${Math.max(4, dept.completionRate)}%` }} title={`${dept.completionRate}% השלמה`} />
                          <div className="w-7 rounded-t-lg bg-gradient-to-t from-amber-700 to-amber-400 transition-all" style={{ height: `${Math.max(4, dept.avgScore)}%` }} title={`${dept.avgScore}% חוסן`} />
                        </div>
                        <span className="mt-3 flex min-h-10 w-full items-start justify-center px-1 text-center text-[10px] font-bold leading-4 text-gray-400" title={dept.name}>
                          {getShortDeptName(dept.name)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : <p className="py-20 text-center text-xs text-gray-500">אין נתוני מחלקות להצגה.</p>}
              <div className="mt-4 flex justify-center gap-5 text-[10px] font-bold text-gray-500">
                <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-sm bg-cyan-400" /> השלמה</span>
                <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-sm bg-amber-400" /> חוסן</span>
              </div>
            </section>
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
                      <div className="flex justify-between gap-4 text-xs font-bold text-gray-300">
                        <span>{dept.name} <span className="text-gray-600">({dept.employeeCount} עובדים)</span></span>
                        <span className="flex gap-3">
                          <span className="text-cyan-400">{dept.completionRate}% השלמה</span>
                          <span className={dept.avgScore >= 80 ? 'text-emerald-400' : 'text-amber-400'}>{dept.avgScore}% חוסן</span>
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <section className="rounded-3xl border border-rose-500/15 bg-gray-900/40 p-6" aria-labelledby="attention-heading">
              <div className="mb-5 flex items-center justify-between gap-3">
                <span className="rounded-xl bg-rose-500/10 px-3 py-1 text-[10px] font-black text-rose-400">{employeesNeedingAttention.length} לטיפול</span>
                <h3 id="attention-heading" className="text-sm font-extrabold text-gray-100">⚠️ עובדים שדורשים תשומת לב</h3>
              </div>
              {employeesNeedingAttention.length === 0 ? (
                <p className="rounded-2xl border border-emerald-500/15 bg-emerald-500/5 p-5 text-center text-xs font-bold text-emerald-400">כל העובדים עומדים ביעדי הלמידה כרגע.</p>
              ) : (
                <div className="space-y-3">
                  {employeesNeedingAttention.map(emp => (
                    <button key={emp.username} onClick={() => setSelectedEmployee(emp)} className="flex w-full items-center justify-between gap-4 rounded-2xl border border-gray-800 bg-gray-950/35 p-4 text-right transition-colors hover:border-rose-500/30">
                      <span className="rounded-lg bg-rose-500/10 px-2.5 py-1 text-[10px] font-black text-rose-400">
                        {emp.completed === 0 ? 'טרם התחיל' : emp.avg !== null && emp.avg < 80 ? `ממוצע ${emp.avg}%` : 'התקדמות נמוכה'}
                      </span>
                      <span>
                        <strong className="block text-xs text-white">{emp.username}</strong>
                        <small className="mt-1 block text-[10px] font-semibold text-gray-500">{getMockDept(emp.username)} · {emp.completed} מתוך {subjectsData.length} נושאים</small>
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </section>

            <section className="rounded-3xl border border-cyan-500/15 bg-gray-900/40 p-6" aria-labelledby="activity-heading">
              <h3 id="activity-heading" className="mb-5 text-right text-sm font-extrabold text-gray-100">🕒 פעילות עובדים אחרונה</h3>
              {recentActivity.length === 0 ? (
                <p className="rounded-2xl border border-gray-800 bg-gray-950/35 p-5 text-center text-xs font-bold text-gray-500">הפעילות תופיע לאחר כניסה או השלמת שיעור.</p>
              ) : (
                <div className="space-y-3">
                  {recentActivity.map(emp => (
                    <button key={emp.username} onClick={() => setSelectedEmployee(emp)} className="flex w-full items-center justify-between gap-4 rounded-2xl border border-gray-800 bg-gray-950/35 p-4 text-right transition-colors hover:border-cyan-500/30">
                      <time className="text-[10px] font-bold text-cyan-400">{formatActivityDate(emp.lastActivity || emp.lastLogin)}</time>
                      <span>
                        <strong className="block text-xs text-white">{emp.username}</strong>
                        <small className="mt-1 block text-[10px] font-semibold text-gray-500">{emp.lastActivity ? 'התקדמות בלמידה' : 'כניסה למערכת'}</small>
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </section>
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.35fr_0.65fr]">
            <section className="rounded-3xl border border-gray-800 bg-gray-900/40 p-6" aria-labelledby="topics-heading">
              <div className="mb-6 flex items-center justify-between gap-4">
                <span className="text-[10px] font-bold text-gray-500">נתונים לפי {subjectsData.length} נושאי לימוד</span>
                <h3 id="topics-heading" className="text-sm font-extrabold text-white">📚 ביצועים לפי נושא</h3>
              </div>
              <div className="max-h-[430px] space-y-4 overflow-y-auto pl-2">
                {topicPerformance.map(topic => (
                  <div key={topic.id} className="rounded-2xl border border-gray-800 bg-gray-950/35 p-4">
                    <div className="mb-3 flex items-center justify-between gap-4 text-xs">
                      <span className="flex shrink-0 gap-3 font-black"><b className={topic.avgScore >= 80 ? 'text-emerald-400' : topic.attempts ? 'text-amber-400' : 'text-gray-600'}>{topic.attempts ? `${topic.avgScore}% ציון` : 'ללא ציון'}</b><b className="text-cyan-400">{topic.completionRate}% השלמה</b></span>
                      <span className="truncate font-bold text-gray-200">{topic.emoji} {topic.title}</span>
                    </div>
                    <div className="relative h-2.5 overflow-hidden rounded-full bg-gray-900">
                      <div className="absolute inset-y-0 right-0 rounded-full bg-gradient-to-l from-cyan-400 to-blue-600" style={{ width: `${topic.completionRate}%` }} />
                    </div>
                    <p className="mt-2 text-[9px] font-semibold text-gray-600">{topic.completed} השלימו · {topic.attempts} ניגשו למבדק</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-3xl border border-[#00e6ff]/15 bg-gradient-to-br from-[#0c1723]/80 to-gray-950/80 p-6" aria-labelledby="insights-heading">
              <h3 id="insights-heading" className="text-sm font-extrabold text-white">💡 תובנות והמלצות למנהל</h3>
              {bestDepartment && <div className="my-5 rounded-2xl border border-amber-400/15 bg-amber-400/5 p-4 text-right">
                <p className="text-[10px] font-black text-amber-400">מחלקה מובילה</p>
                <p className="mt-1 text-sm font-extrabold text-white">{bestDepartment.name}</p>
                <p className="mt-1 text-[10px] font-semibold text-gray-500">{bestDepartment.avgScore}% חוסן · {bestDepartment.completionRate}% השלמה</p>
              </div>}
              <div className="space-y-3">
                {(managementInsights.length ? managementInsights : [{ tone: 'emerald', icon: '✅', title: 'אין התראות דחופות', text: 'הנתונים תקינים. המשך לעקוב אחר ההשלמה והציונים.' }]).map((insight, index) => (
                  <div key={`${insight.title}-${index}`} className="rounded-2xl border border-gray-800 bg-gray-950/45 p-4 text-right">
                    <div className="flex items-start gap-3">
                      <span className="text-lg">{insight.icon}</span>
                      <span><strong className="block text-xs text-white">{insight.title}</strong><small className="mt-1.5 block text-[10px] font-semibold leading-relaxed text-gray-500">{insight.text}</small></span>
                    </div>
                  </div>
                ))}
              </div>
              <button type="button" onClick={() => setActiveTab('employees')} className="mt-5 w-full rounded-xl bg-[#00e6ff] py-3 text-xs font-black text-black transition-colors hover:bg-cyan-300">פתיחת מעקב העובדים</button>
            </section>
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <section className="rounded-3xl border border-gray-800 bg-gray-900/40 p-6">
              <div className="mb-5 flex items-center justify-between gap-4">
                <span className="text-[10px] font-bold text-gray-500">כל נקודה מייצגת עובד</span>
                <h3 className="text-sm font-extrabold text-white">🎯 מטריצת סיכון עובדים</h3>
              </div>
              <div className="relative h-[360px] overflow-hidden rounded-2xl border border-gray-800 bg-gray-950/55">
                <div className="absolute inset-x-0 top-1/2 border-t border-dashed border-gray-700" />
                <div className="absolute inset-y-0 left-1/2 border-l border-dashed border-gray-700" />
                <span className="absolute right-3 top-3 text-[9px] font-black text-emerald-500/70">מוכנות גבוהה</span>
                <span className="absolute bottom-3 right-3 text-[9px] font-black text-amber-500/70">התקדמות גבוהה / ציון נמוך</span>
                <span className="absolute left-3 top-3 text-[9px] font-black text-cyan-500/70">ציון טוב / התקדמות נמוכה</span>
                <span className="absolute bottom-3 left-3 text-[9px] font-black text-rose-500/70">סיכון גבוה</span>
                {employeeRiskPoints.map((emp, index) => (
                  <button key={emp.username} type="button" onClick={() => setSelectedEmployee(emp)} title={`${emp.username}: ${emp.completionRate}% השלמה, ${emp.hasAssessment ? `${emp.avgScore}% ציון` : 'ללא ציון'}`} className={`absolute grid h-9 w-9 place-items-center rounded-full border-2 text-[9px] font-black text-white shadow-lg transition-transform hover:z-10 hover:scale-125 ${emp.completionRate >= 50 && emp.avgScore >= 80 ? 'border-emerald-300 bg-emerald-500' : emp.completionRate < 40 || (emp.hasAssessment && emp.avgScore < 70) ? 'border-rose-300 bg-rose-500' : 'border-amber-300 bg-amber-500'}`} style={{ right: `calc(${Math.min(94, Math.max(5, emp.completionRate))}% - 18px)`, bottom: `calc(${Math.min(90, Math.max(8, emp.hasAssessment ? emp.avgScore : 8))}% - 18px)`, margin: `${(index % 3) * 2}px` }}>
                    {emp.username.slice(0, 2).toUpperCase()}
                  </button>
                ))}
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[8px] font-bold text-gray-600">← שיעור השלמה →</span>
                <span className="absolute left-1 top-1/2 -rotate-90 text-[8px] font-bold text-gray-600">ציון ממוצע</span>
              </div>
            </section>

            <section className="rounded-3xl border border-gray-800 bg-gray-900/40 p-6">
              <div className="mb-5 flex items-center justify-between gap-4">
                <span className="text-[10px] font-bold text-gray-500">לחיצה על עובד פותחת פירוט מלא</span>
                <h3 className="text-sm font-extrabold text-white">🧩 מפת חום: עובדים מול נושאים</h3>
              </div>
              <div className="overflow-auto rounded-2xl border border-gray-800">
                <table className="min-w-[760px] w-full border-collapse text-[9px]">
                  <thead><tr className="bg-gray-950/80 text-gray-500"><th className="sticky right-0 z-10 bg-gray-950 p-3 text-right">עובד</th>{subjectsData.map(subject => <th key={subject.id} className="p-2 text-center" title={subject.title}><span className="text-base">{subject.emoji}</span></th>)}</tr></thead>
                  <tbody className="divide-y divide-gray-800">
                    {employeeRiskPoints.map(emp => <tr key={emp.username} className="hover:bg-gray-800/20">
                      <td className="sticky right-0 z-10 bg-[#0b0f19] p-3"><button type="button" onClick={() => setSelectedEmployee(emp)} className="font-bold text-gray-200 hover:text-cyan-400">{emp.username}</button></td>
                      {subjectsData.map(subject => {
                        const score = emp.progress?.scores?.[subject.id];
                        const completed = (emp.progress?.completedSubjects || []).includes(subject.id);
                        return <td key={subject.id} className="p-1.5 text-center"><span title={score !== undefined ? `${score}%` : completed ? 'הושלם ללא ציון' : 'טרם התחיל'} className={`mx-auto grid h-8 w-8 place-items-center rounded-lg font-black ${score >= 80 ? 'bg-emerald-500/25 text-emerald-300' : score !== undefined ? 'bg-rose-500/25 text-rose-300' : completed ? 'bg-cyan-500/20 text-cyan-300' : 'bg-gray-800/60 text-gray-700'}`}>{score !== undefined ? score : completed ? '✓' : '—'}</span></td>;
                      })}
                    </tr>)}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 flex flex-wrap justify-center gap-4 text-[9px] font-bold text-gray-500"><span>🟩 עבר בהצלחה</span><span>🟥 דורש חיזוק</span><span>🟦 הושלם</span><span>⬛ טרם התחיל</span></div>
            </section>
          </div>

          <section className="rounded-3xl border border-purple-500/15 bg-gradient-to-br from-gray-900/70 to-gray-950/80 p-6">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div className="flex gap-2 text-[10px] font-black"><span className="rounded-lg bg-emerald-500/10 px-3 py-1.5 text-emerald-400">{finalExamPassed} עברו</span><span className="rounded-lg bg-rose-500/10 px-3 py-1.5 text-rose-400">{finalExamFailed} לא עברו</span><span className="rounded-lg bg-gray-800 px-3 py-1.5 text-gray-500">{finalExamNotTaken} טרם ניגשו</span></div>
              <div className="text-right"><h3 className="text-sm font-extrabold text-white">🔔 מרכז התראות הסמכה</h3><p className="mt-1 text-[10px] font-semibold text-gray-600">תוצאות אחרונות מהמבחן המסכם</p></div>
            </div>
            {certificationNotifications.length ? <div className="grid gap-3 md:grid-cols-2">{certificationNotifications.map((notification) => <button key={`${notification.username}-${notification.attemptedAt}`} type="button" onClick={() => setSelectedEmployee(employees.find((emp) => emp.username === notification.username))} className={`flex items-center justify-between gap-4 rounded-2xl border p-4 text-right transition hover:border-purple-500/30 ${notification.passed ? 'border-emerald-500/15 bg-emerald-500/5' : 'border-rose-500/15 bg-rose-500/5'}`}><time className="shrink-0 text-[9px] font-bold text-gray-600">{formatActivityDate(notification.attemptedAt)}</time><span><strong className="block text-xs text-white">{notification.passed ? '🎓 עבר בהצלחה' : '⚠️ ניסיון שלא עבר'} — {notification.username}</strong><small className={`mt-1 block text-[10px] font-bold ${notification.passed ? 'text-emerald-400' : 'text-rose-400'}`}>ציון {notification.score} · {notification.department}</small></span></button>)}</div> : <p className="rounded-2xl border border-gray-800 bg-gray-950/40 p-6 text-center text-xs font-bold text-gray-600">התראות יופיעו לאחר שעובדים ייגשו למבחן המסכם.</p>}
          </section>
        </div>
      )}

      {/* EMPLOYEES TABLE VIEW */}
      {activeTab === 'employees' && (
        <div className="bg-gray-900/40 border border-gray-800 rounded-2xl p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h3 className="text-md font-bold text-gray-200">רשימת עובדים ומעקב למידה</h3>
            
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
              <select value={finalStatusFilter} onChange={(event) => setFinalStatusFilter(event.target.value)} className="rounded-xl border border-gray-850 bg-gray-950 px-4 py-2 text-xs font-bold text-gray-300 outline-none focus:border-purple-500"><option value="all">כל סטטוסי ההסמכה</option><option value="passed">עבר בהצלחה</option><option value="failed">לא עבר</option><option value="not-taken">טרם ניגש</option></select>
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full rounded-xl border border-gray-850 bg-gray-950 px-4 py-2 text-xs text-white focus:border-[#00e6ff] focus:outline-none sm:w-72" placeholder="חפש עובד, אימייל או מחלקה..." />
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto border border-gray-850 rounded-xl">
            <table className="min-w-[1150px] w-full text-right border-collapse">
              <thead>
                <tr className="bg-gray-950/60 border-b border-gray-850 text-xs font-bold text-gray-400">
                  <th className="p-4">שם עובד</th>
                  <th className="p-4">מחלקה</th>
                  <th className="p-4 text-center">נושאים שהושלמו</th>
                  <th className="p-4 text-center">נקודות XP</th>
                  <th className="p-4 text-center">ציון ממוצע</th>
                  <th className="p-4 text-center">סטטוס למידה</th>
                  <th className="p-4 text-center">מבחן מסכם</th>
                  <th className="p-4 text-center">ציון אחרון</th>
                  <th className="p-4 text-center">ניסיונות</th>
                  <th className="p-4 text-center">תאריך אחרון</th>
                  <th className="p-4">פעילות אחרונה</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-850 text-xs">
                {filteredEmployees.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="p-8 text-center text-gray-500">
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
                        <td className="p-4 text-center">
                          <span className={`rounded-lg px-2.5 py-1 text-[10px] font-black ${
                            completedCount === 0 ? 'bg-gray-850 text-gray-500' : completedCount === subjectsData.length ? 'bg-emerald-500/10 text-emerald-400' : 'bg-cyan-500/10 text-cyan-400'
                          }`}>
                            {completedCount === 0 ? 'טרם התחיל' : completedCount === subjectsData.length ? 'הושלם' : 'בתהליך'}
                          </span>
                        </td>
                        <td className="p-4 text-center"><span className={`rounded-lg px-2.5 py-1 text-[10px] font-black ${emp.progress?.finalExam?.passed ? 'bg-emerald-500/10 text-emerald-400' : emp.progress?.finalExam ? 'bg-rose-500/10 text-rose-400' : 'bg-gray-850 text-gray-500'}`}>{emp.progress?.finalExam?.passed ? '🟢 עבר' : emp.progress?.finalExam ? '🔴 לא עבר' : '⚪ טרם ניגש'}</span></td>
                        <td className="p-4 text-center font-black text-white">{emp.progress?.finalExam?.lastScore ?? '—'}</td>
                        <td className="p-4 text-center font-bold text-purple-400">{emp.progress?.finalExam?.attempts || 0}</td>
                        <td className="p-4 text-center text-[10px] font-semibold text-gray-500">{emp.progress?.finalExam?.lastAttemptAt ? formatActivityDate(emp.progress.finalExam.lastAttemptAt) : '—'}</td>
                        <td className="p-4 text-[10px] font-semibold text-gray-400">{formatActivityDate(emp.lastActivity || emp.lastLogin)}</td>
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

              <div className={`rounded-2xl border p-4 ${selectedEmployee.progress?.finalExam?.passed ? 'border-emerald-500/20 bg-emerald-500/5' : selectedEmployee.progress?.finalExam ? 'border-rose-500/20 bg-rose-500/5' : 'border-gray-850 bg-gray-950/40'}`}>
                <div className="flex flex-wrap items-center justify-between gap-3"><span><strong className="block text-xs text-white">מבחן הסמכה מסכם</strong><small className="mt-1 block text-[10px] font-semibold text-gray-500">{selectedEmployee.progress?.finalExam?.lastAttemptAt ? `ניסיון אחרון: ${formatActivityDate(selectedEmployee.progress.finalExam.lastAttemptAt)}` : 'העובד טרם ניגש'}</small></span><span className={`rounded-full px-3 py-1.5 text-[10px] font-black ${selectedEmployee.progress?.finalExam?.passed ? 'bg-emerald-500/10 text-emerald-400' : selectedEmployee.progress?.finalExam ? 'bg-rose-500/10 text-rose-400' : 'bg-gray-800 text-gray-500'}`}>{selectedEmployee.progress?.finalExam?.passed ? '🟢 מוסמך' : selectedEmployee.progress?.finalExam ? '🔴 לא מוסמך' : '⚪ טרם ניגש'}</span></div>
                {selectedEmployee.progress?.finalExam && <div className="mt-4 grid grid-cols-3 gap-3 border-t border-white/5 pt-4 text-center"><span><b className="block text-lg text-white">{selectedEmployee.progress.finalExam.lastScore}</b><small className="text-[9px] text-gray-600">ציון אחרון</small></span><span><b className="block text-lg text-white">{selectedEmployee.progress.finalExam.bestScore}</b><small className="text-[9px] text-gray-600">ציון מיטבי</small></span><span><b className="block text-lg text-white">{selectedEmployee.progress.finalExam.attempts}</b><small className="text-[9px] text-gray-600">ניסיונות</small></span></div>}
              </div>

              <div className="rounded-2xl border border-gray-850 bg-gray-950/30 p-4"><h4 className="mb-3 text-xs font-black text-gray-300">🕒 Learning Timeline</h4><LearningTimeline user={selectedEmployee} limit={8} /></div>

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
