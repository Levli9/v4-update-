// src/context/AppContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { nosqlDb } from '../services/nosqlStorage';
import { hashPassword, verifyPassword } from '../services/hashService';

const AppContext = createContext();

const usersCollection = nosqlDb.collection('users');

const normalizeProgress = (savedProgress = {}) => ({
  completedSubjects: [],
  completedLabs: [],
  scores: {},
  badges: [],
  xp: 0,
  ...savedProgress
});

const ago = (days, hours = 0) => new Date(Date.now() - ((days * 24 + hours) * 60 * 60 * 1000)).toISOString();
const progress = (completedSubjects, scores, xp) => ({
  completedSubjects,
  completedLabs: [],
  scores,
  badges: completedSubjects.length >= 11 ? ['צעד ראשון', 'חצי הדרך', 'מאסטר סייבר'] : completedSubjects.length >= 5 ? ['צעד ראשון', 'חצי הדרך'] : completedSubjects.length ? ['צעד ראשון'] : [],
  xp
});

const seedCertificationDemoData = () => {
  const demoResults = [
    { username: 'DanaBar', score: 90, passed: true, daysAgo: 1 },
    { username: 'NoaCohen', score: 70, passed: false, daysAgo: 2 }
  ];
  demoResults.forEach(({ username, score, passed, daysAgo }) => {
    const user = usersCollection.findOne({ username });
    if (!user || user.progress?.finalExam) return;
    const allSubjects = Array.from({ length: 11 }, (_, index) => index);
    const scores = Object.fromEntries(allSubjects.map((id) => [id, user.progress?.scores?.[id] || 84 + (id % 12)]));
    const analytics = buildDemoAnalytics({ ...user, role: 'employee', progress: { ...user.progress, completedSubjects: allSubjects, scores } });
    const attemptedAt = ago(daysAgo);
    const finalExam = {
      status: passed ? 'passed' : 'failed',
      passed,
      score,
      lastScore: score,
      bestScore: score,
      attempts: 1,
      lastAttemptAt: attemptedAt,
      passedAt: passed ? attemptedAt : null,
      history: [{ attempt: 1, score, passed, correctCount: score / 10, wrongCount: 10 - score / 10, attemptedAt, answers: [] }]
    };
    usersCollection.updateOne({ username }, {
      progress: { ...user.progress, completedSubjects: allSubjects, completedLabs: allSubjects, scores, finalExam },
      analytics
    });
  });
};

const buildDemoAnalytics = (user) => {
  if (user.role !== 'employee') return { videos: {}, quizzes: {}, courses: {} };
  const seed = [...user.username].reduce((total, character) => total + character.charCodeAt(0), 0);
  const completed = user.progress.completedSubjects;
  const videos = {};
  const quizzes = {};
  const courses = {};

  completed.forEach((subjectId, index) => {
    const durationSeconds = 430 + ((subjectId * 37 + seed) % 170);
    const watchSeconds = Math.round(durationSeconds * (0.82 + ((seed + index) % 18) / 100));
    videos[subjectId] = { watchSeconds, durationSeconds, lastPosition: durationSeconds, completed: true, sessions: 1 + ((seed + index) % 3), updatedAt: ago(index + 1) };
    quizzes[subjectId] = Array.from({ length: 10 }, (_, questionIndex) => ({ attempts: 1 + ((seed + questionIndex + subjectId) % 2), correct: ((seed + questionIndex * 3 + subjectId) % 10) > 2 ? 1 : 0 }));
    const minutes = 18 + ((seed + subjectId * 7) % 39);
    courses[subjectId] = { startedAt: ago(index + 3), completedAt: ago(index + 2), durationMinutes: minutes };
  });

  const nextSubject = Math.min(10, completed.length);
  if (!completed.includes(nextSubject)) {
    const durationSeconds = 480 + ((seed + nextSubject) % 90);
    const lastPosition = Math.round(durationSeconds * (0.18 + (seed % 50) / 100));
    videos[nextSubject] = { watchSeconds: lastPosition, durationSeconds, lastPosition, completed: false, sessions: 1, updatedAt: ago((seed % 9) + 1) };
    courses[nextSubject] = { startedAt: ago((seed % 9) + 1) };
  }
  return { videos, quizzes, courses };
};

const DEMO_USERS = [
  { username: 'admin', password: 'admin', email: 'admin@shieldx.demo', role: 'admin', department: 'הנהלת מערכת', progress: progress([], {}, 0) },
  { username: 'Yaniv123', password: 'yaniv123', email: 'yaniv.manager@shieldx.demo', role: 'manager', department: 'פיתוח (R&D)', progress: progress([0, 1, 2, 3, 4, 5], { 0: 96, 1: 92, 2: 88, 3: 94, 4: 86, 5: 91 }, 720), lastActivity: ago(0, 2) },
  { username: 'Lev123', password: 'lev123', email: 'lev.manager@shieldx.demo', role: 'manager', department: 'אבטחת מידע (Security)', progress: progress([0, 1, 2, 3, 4, 7, 8], { 0: 98, 1: 95, 2: 93, 3: 90, 4: 94, 7: 97, 8: 92 }, 860), lastActivity: ago(0, 1) },
  { username: 'MayaManager', password: 'Manager123!', email: 'maya.manager@shieldx.demo', role: 'manager', department: 'משאבי אנוש', progress: progress([0, 1, 2, 10], { 0: 91, 1: 89, 2: 87, 10: 94 }, 480), lastActivity: ago(1) },
  { username: 'RonManager', password: 'Manager123!', email: 'ron.manager@shieldx.demo', role: 'manager', department: 'כספים (Finance)', progress: progress([0, 1, 2, 6, 10], { 0: 88, 1: 84, 2: 90, 6: 86, 10: 92 }, 560), lastActivity: ago(2) },
  { username: 'NoaCohen', password: 'Employee123!', email: 'noa.cohen@shieldx.demo', role: 'employee', department: 'פיתוח (R&D)', progress: progress([0, 1, 2, 3, 4, 5, 7, 9], { 0: 94, 1: 88, 2: 91, 3: 86, 4: 82, 5: 89, 7: 93, 9: 85 }, 930), lastActivity: ago(0, 4) },
  { username: 'AmitLevi', password: 'Employee123!', email: 'amit.levi@shieldx.demo', role: 'employee', department: 'פיתוח (R&D)', progress: progress([0, 1, 2, 5, 7], { 0: 87, 1: 83, 2: 79, 5: 85, 7: 90 }, 580), lastActivity: ago(1, 3) },
  { username: 'DanaBar', password: 'Employee123!', email: 'dana.bar@shieldx.demo', role: 'employee', department: 'אבטחת מידע (Security)', progress: progress([0, 1, 2, 3, 4, 6, 7, 8, 9, 10], { 0: 99, 1: 96, 2: 98, 3: 94, 4: 97, 6: 93, 7: 96, 8: 91, 9: 95, 10: 94 }, 1220), lastActivity: ago(0, 1) },
  { username: 'OmerTal', password: 'Employee123!', email: 'omer.tal@shieldx.demo', role: 'employee', department: 'אבטחת מידע (Security)', progress: progress([0, 1, 2, 3, 4, 8], { 0: 91, 1: 86, 2: 88, 3: 84, 4: 90, 8: 82 }, 690), lastActivity: ago(3) },
  { username: 'ShiraKatz', password: 'Employee123!', email: 'shira.katz@shieldx.demo', role: 'employee', department: 'משאבי אנוש', progress: progress([0, 1, 2, 10], { 0: 89, 1: 92, 2: 84, 10: 90 }, 470), lastActivity: ago(2, 5) },
  { username: 'GilMor', password: 'Employee123!', email: 'gil.mor@shieldx.demo', role: 'employee', department: 'משאבי אנוש', progress: progress([0, 1], { 0: 76, 1: 81 }, 220), lastActivity: ago(8) },
  { username: 'YaelShah', password: 'Employee123!', email: 'yael.shah@shieldx.demo', role: 'employee', department: 'כספים (Finance)', progress: progress([0, 1, 2, 3, 6, 10], { 0: 93, 1: 90, 2: 88, 3: 91, 6: 87, 10: 95 }, 710), lastActivity: ago(1, 7) },
  { username: 'EitanRaz', password: 'Employee123!', email: 'eitan.raz@shieldx.demo', role: 'employee', department: 'כספים (Finance)', progress: progress([0, 1, 2], { 0: 82, 1: 74, 2: 78 }, 310), lastActivity: ago(12) },
  { username: 'LiorBen', password: 'Employee123!', email: 'lior.ben@shieldx.demo', role: 'employee', department: 'תפעול (Operations)', progress: progress([0, 1, 2, 3, 4, 7, 9], { 0: 90, 1: 86, 2: 84, 3: 88, 4: 81, 7: 89, 9: 92 }, 810), lastActivity: ago(0, 6) },
  { username: 'HilaDan', password: 'Employee123!', email: 'hila.dan@shieldx.demo', role: 'employee', department: 'תפעול (Operations)', progress: progress([], {}, 0), lastActivity: ago(35) }
].map((user) => ({ ...user, password: hashPassword(user.password), status: 'approved', analytics: buildDemoAnalytics(user) }));

const ensureDemoUsers = () => {
  const existing = usersCollection.find();
  DEMO_USERS.forEach((demoUser) => {
    if (!existing.some((user) => user.username.toLowerCase() === demoUser.username.toLowerCase())) {
      usersCollection.insertOne(demoUser);
    }
  });
};

export const AppProvider = ({ children }) => {
  // ── User Database ──
  const [users, setUsers] = useState(() => {
    let saved = usersCollection.find();
    
    // Auto-migrate passwords and force-correct default accounts (remove special role)
    if (saved && saved.length > 0) {
      let migrated = false;
      saved = saved.map(u => {
        const usernameLwr = u.username.toLowerCase();
        if (!u.status) {
          u.status = 'approved';
          usersCollection.updateOne({ username: u.username }, { status: 'approved' });
          migrated = true;
        }
        
        // Force roles migration
        if (usernameLwr === 'lev123' || usernameLwr === 'yaniv123') {
          if (u.role !== 'manager') {
            u.role = 'manager';
            usersCollection.updateOne({ username: u.username }, { role: 'manager' });
            migrated = true;
          }
        } else if (usernameLwr === 'lev123_emp' || usernameLwr === 'yaniv123_emp') {
          if (u.role !== 'employee') {
            u.role = 'employee';
            usersCollection.updateOne({ username: u.username }, { role: 'employee' });
            migrated = true;
          }
        } else if (u.role === 'special') {
          u.role = 'manager';
          usersCollection.updateOne({ username: u.username }, { role: 'manager' });
          migrated = true;
        }

        // Force password hashing
        if (usernameLwr === 'lev123' || usernameLwr === 'lev123_emp') {
          const correctHash = hashPassword('lev123');
          if (u.password !== correctHash) {
            u.password = correctHash;
            usersCollection.updateOne({ username: u.username }, { password: u.password });
            migrated = true;
          }
        } else if (usernameLwr === 'yaniv123' || usernameLwr === 'yaniv123_emp') {
          const correctHash = hashPassword('yaniv123');
          if (u.password !== correctHash) {
            u.password = correctHash;
            usersCollection.updateOne({ username: u.username }, { password: u.password });
            migrated = true;
          }
        } else if (!u.password.startsWith('$2b$12$')) {
          u.password = hashPassword(u.password);
          usersCollection.updateOne({ username: u.username }, { password: u.password });
          migrated = true;
        }
        return u;
      });
      if (migrated) {
        saved = usersCollection.find();
      }
      ensureDemoUsers();
      seedCertificationDemoData();
      return usersCollection.find();
    }
    
    // Default original users (mapped with standard manager/employee roles)
    ensureDemoUsers();
    seedCertificationDemoData();
    return usersCollection.find();
  });

  // ── Session State ──
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('cyber_current_user');
      if (!saved) return null;
      const parsed = JSON.parse(saved);
      if (!parsed?.username) return null;
      const freshRecord = usersCollection.findOne({ username: parsed.username });
      const restored = freshRecord || parsed;
      return { ...restored, progress: normalizeProgress(restored.progress) };
    } catch {
      localStorage.removeItem('cyber_current_user');
      return null;
    }
  });

  // The learning portal is always the default landing view, for managers and employees alike.
  const [activeViewRole, setActiveViewRole] = useState('employee');

  // Keep manager dashboards synchronized when another employee tab updates its progress.
  useEffect(() => {
    const syncUsersFromStorage = (event) => {
      if (event.key === 'users') setUsers(usersCollection.find());
    };
    window.addEventListener('storage', syncUsersFromStorage);
    return () => window.removeEventListener('storage', syncUsersFromStorage);
  }, []);

  useEffect(() => {
    localStorage.setItem('cyber_current_user', JSON.stringify(currentUser));
    if (currentUser) {
      localStorage.setItem('cyber_active_view_role', activeViewRole || currentUser.role);
    } else {
      localStorage.removeItem('cyber_active_view_role');
    }
  }, [currentUser, activeViewRole]);

  // Never allow an employee session to retain or restore the manager view.
  useEffect(() => {
    if (currentUser?.role !== 'manager' && activeViewRole === 'manager') {
      setActiveViewRole('employee');
    }
  }, [currentUser, activeViewRole]);

  // ── Auth Functions ──
  const login = (username, password) => {
    // Match username case-insensitively
    const match = users.find(u => u.username.toLowerCase() === username.trim().toLowerCase());
    if (match && verifyPassword(password, match.password)) {
      if (match.status === 'pending') {
        return { success: false, message: 'החשבון ממתין לאישור מנהל המערכת.' };
      }
      if (match.status === 'rejected') {
        return { success: false, message: 'בקשת ההרשמה נדחתה. יש לפנות למנהל המערכת.' };
      }
      const updatedUser = usersCollection.updateOne(
        { username: match.username },
        { lastLogin: new Date().toISOString() }
      ) || match;
      setUsers(usersCollection.find());
      setCurrentUser(updatedUser);
      setActiveViewRole('employee');
      return { success: true, user: updatedUser };
    }
    return { success: false, message: "שם משתמש או סיסמה שגויים!" };
  };

  const register = (username, password, email, avatar = '', role = 'employee', department = 'כללי') => {
    if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
      return { success: false, message: "שם משתמש זה כבר קיים במערכת!" };
    }
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      return { success: false, message: "אימייל זה כבר רשום במערכת!" };
    }

    const newUser = {
      username,
      password: hashPassword(password),
      email,
      role: role === 'manager' ? 'manager' : 'employee',
      requestedRole: role === 'manager' ? 'manager' : 'employee',
      department,
      status: 'pending',
      avatar,
      progress: { completedSubjects: [], scores: {}, badges: [], xp: 0 }
    };

    usersCollection.insertOne(newUser);
    setUsers(usersCollection.find());
    return { success: true, message: 'ההרשמה נשלחה לאישור מנהל המערכת.' };
  };

  const reviewRegistration = (username, decision) => {
    if (currentUser?.role !== 'admin') return { success: false, message: 'אין הרשאה לביצוע הפעולה.' };
    const status = decision === 'approve' ? 'approved' : 'rejected';
    const updated = usersCollection.updateOne({ username }, {
      status,
      reviewedAt: new Date().toISOString(),
      reviewedBy: currentUser.username
    });
    setUsers(usersCollection.find());
    return updated ? { success: true } : { success: false, message: 'המשתמש לא נמצא.' };
  };

  const logout = () => {
    setCurrentUser(null);
    setActiveViewRole(null);
  };

  const changePassword = (username, newPassword) => {
    // Check match and update in NoSQL DB
    const match = users.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (match) {
      usersCollection.updateOne({ username: match.username }, { password: hashPassword(newPassword) });
      setUsers(usersCollection.find());
      
      if (currentUser && currentUser.username.toLowerCase() === username.toLowerCase()) {
        setCurrentUser(prev => ({ ...prev, password: hashPassword(newPassword) }));
      }
    }
  };

  const updateCurrentProfile = ({ username, avatar }) => {
    if (!currentUser) return { success: false, message: 'לא נמצא משתמש מחובר.' };

    const normalizedUsername = username.trim();
    if (normalizedUsername.length < 3) {
      return { success: false, message: 'שם המשתמש חייב להכיל לפחות 3 תווים.' };
    }

    const isDuplicate = users.some(user =>
      user.username.toLowerCase() === normalizedUsername.toLowerCase()
      && user.username.toLowerCase() !== currentUser.username.toLowerCase()
    );
    if (isDuplicate) {
      return { success: false, message: 'שם המשתמש כבר קיים במערכת.' };
    }

    let updated;
    try {
      updated = usersCollection.updateOne(
        { username: currentUser.username },
        { username: normalizedUsername, avatar: avatar || '' }
      );
    } catch (error) {
      return { success: false, message: 'לא ניתן לשמור את התמונה בדפדפן. נסה תמונה קטנה יותר.' };
    }

    if (!updated) return { success: false, message: 'לא ניתן לעדכן את החשבון.' };
    setUsers(usersCollection.find());
    setCurrentUser(updated);
    return { success: true, message: 'פרטי המשתמש עודכנו בהצלחה.' };
  };

  const updateCurrentPassword = (currentPassword, newPassword) => {
    if (!currentUser || !verifyPassword(currentPassword, currentUser.password)) {
      return { success: false, message: 'הסיסמה הנוכחית אינה נכונה.' };
    }

    const newHash = hashPassword(newPassword);
    const updated = usersCollection.updateOne(
      { username: currentUser.username },
      { password: newHash }
    );

    if (!updated) return { success: false, message: 'לא ניתן לעדכן את הסיסמה.' };
    setUsers(usersCollection.find());
    setCurrentUser(updated);
    return { success: true, message: 'הסיסמה הוחלפה בהצלחה.' };
  };

  const trackVideoProgress = (subjectId, telemetry) => {
    if (!currentUser || currentUser.role === 'admin') return;
    const userRecord = usersCollection.findOne({ username: currentUser.username });
    if (!userRecord) return;

    const analytics = userRecord.analytics || { videos: {}, quizzes: {}, courses: {} };
    const previousVideo = analytics.videos?.[subjectId] || { watchSeconds: 0, sessions: 0 };
    const previousCourse = analytics.courses?.[subjectId] || {};
    const videoEntry = {
      ...previousVideo,
      watchSeconds: Math.round((previousVideo.watchSeconds || 0) + (telemetry.watchedDelta || 0)),
      durationSeconds: telemetry.duration || previousVideo.durationSeconds || 0,
      lastPosition: telemetry.currentTime ?? previousVideo.lastPosition ?? 0,
      completed: Boolean(previousVideo.completed || telemetry.completed),
      sessions: (previousVideo.sessions || 0) + (telemetry.event === 'play' ? 1 : 0),
      updatedAt: new Date().toISOString()
    };
    const updatedAnalytics = {
      ...analytics,
      videos: { ...(analytics.videos || {}), [subjectId]: videoEntry },
      courses: {
        ...(analytics.courses || {}),
        [subjectId]: { ...previousCourse, startedAt: previousCourse.startedAt || new Date().toISOString() }
      }
    };
    const updated = usersCollection.updateOne({ username: currentUser.username }, { analytics: updatedAnalytics, lastActivity: new Date().toISOString() });
    setUsers(usersCollection.find());
    if (updated) setCurrentUser(updated);
  };

  const recordQuizAnswer = (subjectId, questionIndex, correct) => {
    if (!currentUser || currentUser.role === 'admin') return;
    const userRecord = usersCollection.findOne({ username: currentUser.username });
    if (!userRecord) return;
    const analytics = userRecord.analytics || { videos: {}, quizzes: {}, courses: {} };
    const topicStats = [...(analytics.quizzes?.[subjectId] || Array.from({ length: 10 }, () => ({ attempts: 0, correct: 0 })) )];
    const current = topicStats[questionIndex] || { attempts: 0, correct: 0 };
    topicStats[questionIndex] = { attempts: current.attempts + 1, correct: current.correct + (correct ? 1 : 0) };
    const updatedAnalytics = { ...analytics, quizzes: { ...(analytics.quizzes || {}), [subjectId]: topicStats } };
    const updated = usersCollection.updateOne({ username: currentUser.username }, { analytics: updatedAnalytics, lastActivity: new Date().toISOString() });
    setUsers(usersCollection.find());
    if (updated) setCurrentUser(updated);
  };

  const completeLab = (subjectId) => {
    if (!currentUser || currentUser.role === 'admin') return;
    const userRecord = usersCollection.findOne({ username: currentUser.username });
    if (!userRecord) return;
    const previousProgress = userRecord.progress || {};
    const completedLabs = previousProgress.completedLabs?.includes(subjectId)
      ? previousProgress.completedLabs
      : [...(previousProgress.completedLabs || []), subjectId];
    const lastActivity = new Date().toISOString();
    const updated = usersCollection.updateOne({ username: currentUser.username }, {
      progress: { ...previousProgress, completedLabs },
      lastActivity
    });
    setUsers(usersCollection.find());
    if (updated) setCurrentUser(updated);
  };

  const submitFinalExam = (score, attemptDetails = {}) => {
    if (!currentUser || currentUser.role === 'admin') return null;
    const userRecord = usersCollection.findOne({ username: currentUser.username });
    if (!userRecord) return null;
    const attemptedAt = new Date().toISOString();
    const previousProgress = userRecord.progress || {};
    const previousExam = previousProgress.finalExam || { attempts: 0, bestScore: 0, history: [] };
    const passedThisAttempt = score >= 80;
    const passed = Boolean(previousExam.passed || passedThisAttempt);
    const attempt = {
      attempt: previousExam.attempts + 1,
      score,
      passed: passedThisAttempt,
      correctCount: attemptDetails.correctCount ?? Math.round(score / 10),
      wrongCount: attemptDetails.wrongCount ?? 10 - Math.round(score / 10),
      attemptedAt,
      answers: attemptDetails.answers || []
    };
    const finalExam = {
      status: passed ? 'passed' : 'failed',
      passed,
      score,
      lastScore: score,
      bestScore: Math.max(previousExam.bestScore || 0, score),
      attempts: attempt.attempt,
      lastAttemptAt: attemptedAt,
      passedAt: previousExam.passedAt || (passedThisAttempt ? attemptedAt : null),
      history: [...(previousExam.history || []), attempt]
    };
    const badges = [...(previousProgress.badges || [])];
    if (passedThisAttempt && !badges.includes('מוסמך ShieldX')) badges.push('מוסמך ShieldX');
    const updatedProgress = { ...previousProgress, badges, finalExam };
    const updated = usersCollection.updateOne({ username: currentUser.username }, {
      progress: updatedProgress,
      lastActivity: attemptedAt
    });
    setUsers(usersCollection.find());
    if (updated) setCurrentUser(updated);
    window.dispatchEvent(new CustomEvent('shieldx-certification-updated', { detail: { username: currentUser.username, ...attempt } }));
    return finalExam;
  };

  const rateCourse = (subjectId, value) => {
    if (!currentUser || value < 1 || value > 5) return;
    const userRecord = usersCollection.findOne({ username: currentUser.username });
    if (!userRecord) return;
    const previousProgress = userRecord.progress || {};
    const courseRatings = {
      ...(previousProgress.courseRatings || {}),
      [subjectId]: { value, ratedAt: new Date().toISOString() }
    };
    const updated = usersCollection.updateOne({ username: currentUser.username }, { progress: { ...previousProgress, courseRatings } });
    setUsers(usersCollection.find());
    if (updated) setCurrentUser(updated);
  };

  const updatePresence = (activity = 'idle', context = {}) => {
    if (!currentUser || currentUser.role === 'admin') return;
    const now = new Date().toISOString();
    const updated = usersCollection.updateOne({ username: currentUser.username }, {
      presence: { activity, ...context, lastSeen: now },
      lastActivity: activity === 'idle' ? currentUser.lastActivity : now
    });
    setUsers(usersCollection.find());
    if (updated) setCurrentUser(updated);
  };

  const markDocumentRead = (documentId) => {
    if (!currentUser) return;
    const userRecord = usersCollection.findOne({ username: currentUser.username });
    if (!userRecord) return;
    const previousProgress = userRecord.progress || {};
    const readDocuments = { ...(previousProgress.readDocuments || {}), [documentId]: { readAt: new Date().toISOString() } };
    const updated = usersCollection.updateOne({ username: currentUser.username }, { progress: { ...previousProgress, readDocuments }, lastActivity: new Date().toISOString() });
    setUsers(usersCollection.find());
    if (updated) setCurrentUser(updated);
  };

  // ── Progress & Learning Functions ──
  const completeSubject = (subjectId, score) => {
    if (!currentUser) return;

    const userRecord = usersCollection.findOne({ username: currentUser.username });
    if (userRecord) {
      const prevProgress = userRecord.progress || { completedSubjects: [], scores: {}, badges: [], xp: 0 };
      const isNewCompletion = !prevProgress.completedSubjects.includes(subjectId);
      
      const updatedCompleted = isNewCompletion
        ? [...prevProgress.completedSubjects, subjectId]
        : prevProgress.completedSubjects;

      const updatedScores = {
        ...prevProgress.scores,
        [subjectId]: Math.max(prevProgress.scores[subjectId] || 0, score)
      };

      const updatedBadges = [...prevProgress.badges];
      if (updatedCompleted.length === 1 && !updatedBadges.includes('צעד ראשון')) {
        updatedBadges.push('צעד ראשון');
      }
      if (updatedCompleted.length === 5 && !updatedBadges.includes('חצי הדרך')) {
        updatedBadges.push('חצי הדרך');
      }
      if (updatedCompleted.length === 11 && !updatedBadges.includes('מאסטר סייבר')) {
        updatedBadges.push('מאסטר סייבר');
      }

      const updatedProgress = {
        ...prevProgress,
        completedSubjects: updatedCompleted,
        scores: updatedScores,
        badges: updatedBadges,
        xp: prevProgress.xp + (isNewCompletion ? 100 : 20)
      };

      const analytics = userRecord.analytics || { videos: {}, quizzes: {}, courses: {} };
      const previousCourse = analytics.courses?.[subjectId] || {};
      const completedAt = new Date().toISOString();
      const durationMinutes = previousCourse.startedAt
        ? Math.max(1, Math.round((new Date(completedAt) - new Date(previousCourse.startedAt)) / 60000))
        : null;
      const updatedAnalytics = {
        ...analytics,
        courses: {
          ...(analytics.courses || {}),
          [subjectId]: { ...previousCourse, completedAt, durationMinutes }
        }
      };

      // Update in NoSQL DB
      const lastActivity = new Date().toISOString();
      usersCollection.updateOne({ username: currentUser.username }, { progress: updatedProgress, analytics: updatedAnalytics, lastActivity });
      setUsers(usersCollection.find());

      // Sync current session state
      setCurrentUser(prev => ({ ...prev, progress: updatedProgress, analytics: updatedAnalytics, lastActivity }));
    }
  };

  // ── Brevo API Password Recovery Integration ──
  const sendBrevoRecoveryCode = async (email, code) => {
    const apiKey = import.meta.env.VITE_BREVO_API_KEY;
    if (!apiKey) {
      console.warn("Brevo API Key (VITE_BREVO_API_KEY) is missing. Using simulator backup.");
      return false;
    }

    try {
      const response = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "accept": "application/json",
          "api-key": apiKey,
          "content-type": "application/json"
        },
        body: JSON.stringify({
          sender: { name: "אקדמיית סייבר", email: "security@cyber-academy.com" },
          to: [{ email: email }],
          subject: "קוד שחזור סיסמה - אקדמיית סייבר",
          htmlContent: `
            <div style="direction: rtl; text-align: right; font-family: sans-serif; padding: 25px; background-color: #07070f; color: #ffffff; border-radius: 12px; border: 1px solid #1a1a2e; max-width: 500px; margin: 0 auto;">
              <h2 style="color: #00e6ff; border-bottom: 2px solid #1a1a2e; padding-bottom: 12px; margin-bottom: 20px;">🛡️ שחזור סיסמה - אקדמיית סייבר</h2>
              <p style="font-size: 15px; color: #d1d5db; line-height: 1.6;">שלום,</p>
              <p style="font-size: 15px; color: #d1d5db; line-height: 1.6;">התקבל קוד לשחזור סיסמה עבור החשבון שלך במערכת הדרכת הסייבר הארגונית.</p>
              <div style="background: linear-gradient(135deg, #0d0d1f, #1a1a2e); border: 1px solid #00e6ff; padding: 18px; text-align: center; font-size: 28px; font-weight: 800; color: #00e6ff; border-radius: 8px; margin: 25px 0; letter-spacing: 4px; box-shadow: 0 0 15px rgba(0, 230, 255, 0.15);">
                ${code}
              </div>
              <p style="font-size: 13px; color: #9ca3af; line-height: 1.6;">אם לא ביקשת לשחזר את הסיסמה, ניתן להתעלם מאימייל זה בבטחה.</p>
              <hr style="border-top: 1px solid #1a1a2e; margin: 25px 0;" />
              <p style="font-size: 11px; color: #4b5563; text-align: center;">נשלח אוטומטית על ידי מערכת הדרכת סייבר SPA</p>
            </div>
          `
        })
      });
      return response.ok;
    } catch (e) {
      console.error("Failed to fetch Brevo API:", e);
      return false;
    }
  };

  // Helper shortcut for employee progress of current session
  const userProgress = normalizeProgress(currentUser?.progress);

  return (
    <AppContext.Provider value={{
      users,
      currentUser,
      activeViewRole,
      userProgress,
      login,
      register,
      reviewRegistration,
      logout,
      changePassword,
      updateCurrentProfile,
      updateCurrentPassword,
      completeSubject,
      completeLab,
      submitFinalExam,
      rateCourse,
      updatePresence,
      markDocumentRead,
      trackVideoProgress,
      recordQuizAnswer,
      sendBrevoRecoveryCode,
      setActiveViewRole
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
export default AppContext;
