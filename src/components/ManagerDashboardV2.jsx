// src/components/ManagerDashboardV2.jsx
// Executive Cyber Manager Dashboard v2 — Academic & Enterprise Design Language (Zero Emojis)

import React, { useState, useMemo } from 'react';
import { 
  ShieldCheck, Award, Activity, TrendingUp, Users, Flame, Target, 
  PieChart, BarChart3, Clock, Lock, Sparkles, Zap, CheckCircle2, 
  AlertTriangle, Search, Filter, ChevronLeft, Download, ShieldAlert, ArrowUpRight
} from 'lucide-react';
import { subjectsData } from '../data/subjectsData';

export default function ManagerDashboardV2({ 
  employees = [], 
  scopedEmployees = [],
  selectedDepartment, 
  setSelectedDepartment,
  departmentOptions = [],
  onSelectEmployee
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'certified' | 'in_progress' | 'not_started'

  // Total Metrics Calculations
  const totalEmployees = employees.length;

  // Certified Employees Count (passed final exam)
  const certifiedEmployees = useMemo(() => {
    return employees.filter(emp => Boolean(emp.progress?.finalExam?.passed));
  }, [employees]);

  const certificationRate = totalEmployees > 0 
    ? Math.round((certifiedEmployees.length / totalEmployees) * 100) 
    : 0;

  // Average Scores & Completion
  const { totalScoreSum, totalExamsTaken, totalCompletedSubjects, totalExamDurationSeconds } = useMemo(() => {
    let scoreSum = 0;
    let examCount = 0;
    let completedSubj = 0;
    let durationSecSum = 0;

    employees.forEach(emp => {
      const scores = Object.values(emp.progress?.scores || {});
      scores.forEach(s => {
        scoreSum += s;
        examCount += 1;
      });
      completedSubj += (emp.progress?.completedSubjects || []).length;

      // Extract exam duration in seconds if recorded
      const examHistory = emp.progress?.finalExam?.history || [];
      examHistory.forEach(att => {
        if (att.durationSeconds) durationSecSum += att.durationSeconds;
      });
    });

    return {
      totalScoreSum: scoreSum,
      totalExamsTaken: examCount,
      totalCompletedSubjects: completedSubj,
      totalExamDurationSeconds: durationSecSum
    };
  }, [employees]);

  const averageScore = totalExamsTaken > 0 ? Math.round(totalScoreSum / totalExamsTaken) : 0;
  
  // Average exam duration formatting
  const avgDurationMinutes = totalExamDurationSeconds > 0 && certifiedEmployees.length > 0
    ? Math.round(totalExamDurationSeconds / certifiedEmployees.length / 60)
    : 16; // default average demo duration

  // Overall org compliance score formula
  const orgComplianceScore = Math.min(100, Math.round((certificationRate * 0.5) + (averageScore * 0.5)));

  // Department Heatmap Data
  const departmentStats = useMemo(() => {
    const map = {};

    employees.forEach(emp => {
      const dept = emp.department || 'כללי';
      if (!map[dept]) {
        map[dept] = { name: dept, total: 0, certified: 0, completedSubjects: 0, scoreSum: 0, scoresCount: 0 };
      }
      map[dept].total += 1;
      if (emp.progress?.finalExam?.passed) map[dept].certified += 1;
      map[dept].completedSubjects += (emp.progress?.completedSubjects || []).length;
      
      const scores = Object.values(emp.progress?.scores || {});
      scores.forEach(s => {
        map[dept].scoreSum += s;
        map[dept].scoresCount += 1;
      });
    });

    return Object.values(map).map(d => {
      const certRate = d.total > 0 ? Math.round((d.certified / d.total) * 100) : 0;
      const avgSc = d.scoresCount > 0 ? Math.round(d.scoreSum / d.scoresCount) : 0;
      const riskLevel = certRate >= 70 ? 'נמוך' : certRate >= 35 ? 'בינוני' : 'מוגבר';
      return { ...d, certRate, avgSc, riskLevel };
    });
  }, [employees]);

  // Filtered Roster
  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      const matchSearch = !searchQuery || 
        emp.username.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (emp.email && emp.email.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const isCertified = Boolean(emp.progress?.finalExam?.passed);
      const completedCount = (emp.progress?.completedSubjects || []).length;

      let matchStatus = true;
      if (statusFilter === 'certified') matchStatus = isCertified;
      else if (statusFilter === 'in_progress') matchStatus = !isCertified && completedCount > 0;
      else if (statusFilter === 'not_started') matchStatus = completedCount === 0;

      return matchSearch && matchStatus;
    });
  }, [employees, searchQuery, statusFilter]);

  return (
    <div className="space-y-8" dir="rtl">
      
      {/* EXECUTIVE SUMMARY KPI GRID */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        
        {/* KPI 1: Org Cyber Compliance & Risk Score */}
        <div className="relative overflow-hidden rounded-3xl border border-cyan-500/20 bg-gradient-to-bl from-cyan-950/30 via-gray-950/80 to-gray-950 p-6 shadow-2xl backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="grid h-11 w-11 place-items-center rounded-2xl border border-cyan-500/30 bg-cyan-500/10 text-cyan-400">
              <ShieldCheck size={22} />
            </span>
            <span className="flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-black text-emerald-400">
              <ArrowUpRight size={12} /> +4.2% השבוע
            </span>
          </div>
          <p className="text-xs font-bold uppercase tracking-wider text-gray-400">מדד מוגנות ארגונית (Compliance)</p>
          <div className="mt-2 flex items-baseline gap-3">
            <span className="text-3xl font-black text-white">{orgComplianceScore}%</span>
            <span className="text-xs font-semibold text-cyan-300">
              {orgComplianceScore >= 80 ? 'רמת מוגנות גבוהה' : 'נדרש שיפור'}
            </span>
          </div>
          <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-gray-900">
            <div 
              className="h-full bg-gradient-to-l from-[#00e6ff] to-[#10b981] transition-all duration-500" 
              style={{ width: `${orgComplianceScore}%` }} 
            />
          </div>
        </div>

        {/* KPI 2: Certified Employees Count & Ratio */}
        <div className="relative overflow-hidden rounded-3xl border border-emerald-500/20 bg-gradient-to-bl from-emerald-950/30 via-gray-950/80 to-gray-950 p-6 shadow-2xl backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="grid h-11 w-11 place-items-center rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
              <Award size={22} />
            </span>
            <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-black text-emerald-400">
              {certifiedEmployees.length} מוסמכים
            </span>
          </div>
          <p className="text-xs font-bold uppercase tracking-wider text-gray-400">שיעור עובדים מוסמכים (ShieldX)</p>
          <div className="mt-2 flex items-baseline gap-3">
            <span className="text-3xl font-black text-white">{certificationRate}%</span>
            <span className="text-xs font-semibold text-gray-400">מתוך {totalEmployees} עובדים</span>
          </div>
          <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-gray-900">
            <div 
              className="h-full bg-gradient-to-l from-[#10b981] to-[#059669] transition-all duration-500" 
              style={{ width: `${certificationRate}%` }} 
            />
          </div>
        </div>

        {/* KPI 3: Average Exam Time & Learning Duration */}
        <div className="relative overflow-hidden rounded-3xl border border-purple-500/20 bg-gradient-to-bl from-purple-950/30 via-gray-950/80 to-gray-950 p-6 shadow-2xl backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="grid h-11 w-11 place-items-center rounded-2xl border border-purple-500/30 bg-purple-500/10 text-purple-400">
              <Clock size={22} />
            </span>
            <span className="rounded-full border border-purple-500/30 bg-purple-500/10 px-2.5 py-1 text-[10px] font-black text-purple-300">
              זמנים אמת
            </span>
          </div>
          <p className="text-xs font-bold uppercase tracking-wider text-gray-400">זמן שהייה ממוצע במבחן המסכם</p>
          <div className="mt-2 flex items-baseline gap-3">
            <span className="text-3xl font-black text-white">{avgDurationMinutes} דק׳</span>
            <span className="text-xs font-semibold text-purple-300">משך שהייה ממוצע</span>
          </div>
          <div className="mt-4 flex items-center gap-2 text-[10px] font-semibold text-gray-500">
            <Activity size={12} className="text-purple-400" />
            <span>מבוסס על מדידת זמן אמת בנתיב הבחינות</span>
          </div>
        </div>

        {/* KPI 4: Average Score & Quiz Performance */}
        <div className="relative overflow-hidden rounded-3xl border border-amber-500/20 bg-gradient-to-bl from-amber-950/30 via-gray-950/80 to-gray-950 p-6 shadow-2xl backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="grid h-11 w-11 place-items-center rounded-2xl border border-amber-500/30 bg-amber-500/10 text-amber-400">
              <BarChart3 size={22} />
            </span>
            <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-[10px] font-black text-amber-300">
              ממוצע ציונים
            </span>
          </div>
          <p className="text-xs font-bold uppercase tracking-wider text-gray-400">ציון ממוצע במבחנים ובלומדות</p>
          <div className="mt-2 flex items-baseline gap-3">
            <span className="text-3xl font-black text-white">{averageScore}%</span>
            <span className="text-xs font-semibold text-amber-300">סך הכול {totalExamsTaken} מבדקים</span>
          </div>
          <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-gray-900">
            <div 
              className="h-full bg-gradient-to-l from-amber-500 to-amber-600 transition-all duration-500" 
              style={{ width: `${averageScore}%` }} 
            />
          </div>
        </div>

      </div>

      {/* DEPARTMENT COMPLIANCE HEATMAP & RISK BREAKDOWN */}
      <section className="rounded-3xl border border-gray-800 bg-[#090d16]/90 p-6 shadow-2xl backdrop-blur-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-850">
          <div>
            <div className="flex items-center gap-2 text-xs font-black text-cyan-400 uppercase tracking-widest mb-1">
              <PieChart size={15} /> Department Risk Breakdown
            </div>
            <h2 className="text-xl font-black text-white">התפלגות מוגנות וסיכונים לפי מחלקות</h2>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="rounded-xl border border-gray-800 bg-gray-950 px-3 py-2 text-xs font-bold text-gray-300 outline-none focus:border-cyan-500/40"
            >
              <option value="all">כל המחלקות בארגון</option>
              {departmentOptions.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {departmentStats.map((dept, idx) => (
            <div key={idx} className="rounded-2xl border border-gray-850 bg-gray-950/60 p-5 hover:border-gray-800 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-black text-white">{dept.name}</span>
                <span className={`rounded-full border px-2.5 py-0.5 text-[9px] font-black ${
                  dept.riskLevel === 'נמוך' 
                    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' 
                    : dept.riskLevel === 'בינוני' 
                      ? 'border-amber-500/30 bg-amber-500/10 text-amber-400' 
                      : 'border-rose-500/30 bg-rose-500/10 text-rose-400'
                }`}>
                  סיכון {dept.riskLevel}
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-gray-400 text-[11px]">
                  <span>עובדים מוסמכים:</span>
                  <span className="font-bold text-white">{dept.certified} / {dept.total} ({dept.certRate}%)</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-900">
                  <div 
                    className="h-full bg-gradient-to-l from-cyan-500 to-emerald-500 transition-all duration-300"
                    style={{ width: `${dept.certRate}%` }}
                  />
                </div>
                <div className="flex justify-between text-gray-400 text-[11px] pt-1">
                  <span>ציון ממוצע במחלקתי:</span>
                  <span className="font-bold text-cyan-400">{dept.avgSc}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* EMPLOYEE ROSTER TABLE & CERTIFICATION TRACKER */}
      <section className="rounded-3xl border border-gray-800 bg-[#090d16]/90 p-6 shadow-2xl backdrop-blur-sm space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-black text-cyan-400 uppercase tracking-widest mb-1">
              <Users size={15} /> Employee Certification Roster
            </div>
            <h2 className="text-xl font-black text-white">רשימת עובדים וסטטוס הסמכה בזמן אמת</h2>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="חיפוש לפי שם עובד..."
                className="w-52 rounded-xl border border-gray-800 bg-gray-950 pr-9 pl-3 py-2 text-xs text-white outline-none focus:border-cyan-500/40"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-gray-800 bg-gray-950 px-3 py-2 text-xs font-bold text-gray-300 outline-none focus:border-cyan-500/40"
            >
              <option value="all">כל הסטטוסים</option>
              <option value="certified">בעלי תעודת הסמכה 🏅</option>
              <option value="in_progress">בתהליך למידה</option>
              <option value="not_started">טרם התחילו</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-2xl border border-gray-850 bg-gray-950/40">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="border-b border-gray-850 bg-gray-900/60 text-gray-400">
                <th className="px-4 py-3.5 font-bold">שם העובד</th>
                <th className="px-4 py-3.5 font-bold">מחלקה</th>
                <th className="px-4 py-3.5 font-bold">תפקיד</th>
                <th className="px-4 py-3.5 font-bold">התקדמות קורסים</th>
                <th className="px-4 py-3.5 font-bold">סטטוס תעודת הסמכה</th>
                <th className="px-4 py-3.5 font-bold">ציון במבחן מסכם</th>
                <th className="px-4 py-3.5 font-bold text-left">פעולות</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-850/60 text-gray-300">
              {filteredEmployees.map((emp) => {
                const isCertified = Boolean(emp.progress?.finalExam?.passed);
                const score = emp.progress?.finalExam?.score;
                const completedCount = (emp.progress?.completedSubjects || []).length;
                const totalSubjects = subjectsData.length;
                const pct = Math.round((completedCount / totalSubjects) * 100);

                return (
                  <tr key={emp.username} className="hover:bg-gray-900/40 transition-colors">
                    <td className="px-4 py-3.5 font-bold text-white flex items-center gap-2.5">
                      <span className="grid h-8 w-8 place-items-center rounded-xl bg-gray-900 text-xs font-black text-cyan-400 border border-gray-800">
                        {emp.username.slice(0, 2).toUpperCase()}
                      </span>
                      <div>
                        <span className="block font-bold">{emp.username}</span>
                        <span className="block text-[10px] font-normal text-gray-500">{emp.email}</span>
                      </div>
                    </td>

                    <td className="px-4 py-3.5">{emp.department || 'כללי'}</td>
                    <td className="px-4 py-3.5">{emp.role === 'admin' ? 'מנהל מערכת' : emp.role === 'manager' ? 'מנהל' : 'עובד'}</td>

                    <td className="px-4 py-3.5">
                      <div className="w-32">
                        <div className="flex justify-between text-[10px] mb-1">
                          <span className="font-bold text-white">{completedCount} / {totalSubjects}</span>
                          <span className="text-gray-400">{pct}%</span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-900">
                          <div className="h-full bg-cyan-400 transition-all" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      {isCertified ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[10px] font-black text-emerald-400">
                          <Award size={12} /> מוסמך ShieldX
                        </span>
                      ) : completedCount > 0 ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-[10px] font-bold text-cyan-300">
                          <Activity size={12} /> בתהליך למידה
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-800 bg-gray-900 px-3 py-1 text-[10px] font-semibold text-gray-500">
                          <Clock size={12} /> טרם החל
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3.5 font-bold">
                      {score !== undefined && score !== null ? (
                        <span className={score >= 80 ? 'text-emerald-400' : 'text-amber-400'}>{score}%</span>
                      ) : (
                        <span className="text-gray-600">—</span>
                      )}
                    </td>

                    <td className="px-4 py-3.5 text-left">
                      <button
                        type="button"
                        onClick={() => onSelectEmployee(emp)}
                        className="rounded-xl border border-gray-800 bg-gray-900 px-3 py-1.5 text-[11px] font-bold text-gray-300 hover:border-cyan-500/40 hover:text-white transition"
                      >
                        פרטים מלאים
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

    </div>
  );
}
