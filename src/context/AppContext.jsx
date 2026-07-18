import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { subjectsData } from '../data/subjectsData';
import { getCertificationReadiness } from '../data/finalExamData';
import { authApi, courseApi, getSessionToken, learningApi, passwordResetApi, setSessionToken } from '../services/apiClient';
import { nosqlDb } from '../services/nosqlStorage';

const AppContext = createContext();
const usersCollection = nosqlDb.collection('users');
const coursesCollection = nosqlDb.collection('courses');

export const normalizeProgress = (savedProgress = {}) => {
  const completedSubjects = Array.isArray(savedProgress.completedSubjects) ? savedProgress.completedSubjects : [];
  return {
    ...savedProgress,
    completedSubjects,
    completedLessons: Array.isArray(savedProgress.completedLessons)
      ? savedProgress.completedLessons
      : [...completedSubjects],
    completedLabs: Array.isArray(savedProgress.completedLabs) ? savedProgress.completedLabs : [],
    scores: savedProgress.scores && typeof savedProgress.scores === 'object' ? savedProgress.scores : {},
    badges: Array.isArray(savedProgress.badges) ? savedProgress.badges : [],
    xp: Math.max(0, Number(savedProgress.xp) || 0)
  };
};

const sanitizeLocalProfile = (profile = {}) => {
  const safeProfile = { ...profile };
  ['password', `plain${'Password'}`, 'superUser'].forEach((field) => delete safeProfile[field]);
  return { ...safeProfile, progress: normalizeProgress(safeProfile.progress) };
};

const isLegacyDemoProfile = (profile) => String(profile.email || '').toLowerCase().endsWith('@shieldx.demo');

const loadSafeProfiles = () => {
  const safeProfiles = usersCollection.find()
    .filter((profile) => !isLegacyDemoProfile(profile))
    .map(sanitizeLocalProfile);
  usersCollection.replaceAll(safeProfiles);
  return safeProfiles;
};

const findLocalProfile = (serverUser) => usersCollection.find().find((profile) => (
  Number(profile.serverId) === Number(serverUser.id)
  || String(profile.username).toLowerCase() === String(serverUser.username).toLowerCase()
));

const mergeServerUser = (serverUser) => {
  const local = findLocalProfile(serverUser);
  const merged = sanitizeLocalProfile({
    ...(local || {}),
    ...serverUser,
    serverId: serverUser.id,
    _id: local?._id || `server-${serverUser.id}`,
    progress: normalizeProgress(serverUser.progress ?? local?.progress),
    analytics: serverUser.analytics ?? local?.analytics ?? {},
    presence: serverUser.presence ?? local?.presence ?? {},
    lastActivity: serverUser.lastActivity ?? local?.lastActivity ?? null
  });

  if (local) usersCollection.updateOne({ _id: local._id }, merged);
  else usersCollection.insertOne(merged);
  return merged;
};

const updateLocalUser = (username, updater) => {
  const record = usersCollection.find().find(
    (user) => String(user.username).toLowerCase() === String(username).toLowerCase()
  );
  if (!record) return null;
  const fields = typeof updater === 'function' ? updater(record) : updater;
  return usersCollection.updateOne({ _id: record._id }, sanitizeLocalProfile(fields));
};

export const AppProvider = ({ children }) => {
  const [users, setUsers] = useState(loadSafeProfiles);
  const [currentUser, setCurrentUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [activeViewRole, setActiveViewRole] = useState('employee');
  const [customSubjects, setCustomSubjects] = useState(() => coursesCollection.find({ status: 'published' }));
  const persistTimer = useRef(null);
  const pendingLearningState = useRef(null);

  const subjects = useMemo(() => {
    const mappedCustom = customSubjects.map((course) => ({
      id: course.id,
      title: course.title,
      description: course.description || '',
      difficulty: course.difficulty || 'בינוני',
      estimatedTime: `${Number(course.duration) || 30} דק׳`,
      emoji: course.emoji || '🎓',
      color: course.color || '#00e6ff',
      slides: Array.isArray(course.slides) ? course.slides : [],
      videoScript: Array.isArray(course.videoScript) ? course.videoScript : [],
      serverGraded: true,
      courseId: course.id,
      quizzes: (course.finalExam || []).map((question, index) => ({
        id: `custom_q_${course.id}_${index}`,
        questionIndex: Number.isInteger(question.questionIndex) ? question.questionIndex : index,
        question: question.question,
        options: question.answers || question.options || []
      })),
      simulations: [],
      videoUrl: ''
    }));
    return [...subjectsData, ...mappedCustom];
  }, [customSubjects]);

  const refreshManagedUsers = async (actor) => {
    if (!['manager', 'admin'].includes(actor?.role)) return;
    try {
      const response = await authApi.listUsers();
      const serverProfiles = response.users.map(mergeServerUser);
      const serverIds = new Set(serverProfiles.map((profile) => Number(profile.serverId)));
      const preserved = usersCollection.find().filter((profile) => !serverIds.has(Number(profile.serverId)));
      setUsers([...serverProfiles, ...preserved]);
    } catch (error) {
      if (error.status !== 401) console.warn('[ShieldX users]', error.message);
    }
  };

  const refreshCourses = async (actor) => {
    try {
      const publishedResponse = await courseApi.list();
      let available = publishedResponse.courses;
      if (['manager', 'admin'].includes(actor?.role)) {
        const managedResponse = await courseApi.listManaged();
        const serverIds = new Set([...available, ...managedResponse.courses].map((course) => String(course.id)));
        const localOnly = coursesCollection.find().filter((course) => !serverIds.has(String(course.id)));
        for (const course of localOnly) {
          await courseApi.save(course, course.status === 'published' ? 'published' : 'draft');
        }
        const refreshedPublished = await courseApi.list();
        const refreshedManaged = await courseApi.listManaged();
        available = [...refreshedPublished.courses, ...refreshedManaged.courses]
          .filter((course, index, collection) => (
            collection.findIndex((candidate) => String(candidate.id) === String(course.id)) === index
          ));
      }
      coursesCollection.replaceAll(available);
      setCustomSubjects(available.filter((course) => course.status === 'published'));
    } catch (error) {
      console.warn('[ShieldX courses]', error.message);
    }
  };

  const establishSession = async (serverUser) => {
    let learning = {};
    try {
      learning = await learningApi.load();
    } catch (error) {
      console.warn('[ShieldX progress]', error.message);
    }
    const merged = mergeServerUser({ ...serverUser, ...learning });
    setCurrentUser(merged);
    setActiveViewRole('employee');
    setUsers(usersCollection.find());
    await Promise.all([refreshManagedUsers(merged), refreshCourses(merged)]);
    return merged;
  };

  useEffect(() => {
    const restoreSession = async () => {
      Object.keys(localStorage)
        .filter((key) => key.startsWith('shieldx_brevo_') || key === 'shieldx_gemini_api_key')
        .forEach((key) => localStorage.removeItem(key));
      localStorage.removeItem('shieldx_backend_url');
      localStorage.removeItem('cyber_current_user');
      localStorage.removeItem('cyber_active_view_role');

      if (!getSessionToken()) {
        setAuthReady(true);
        return;
      }
      try {
        const response = await authApi.session();
        await establishSession(response.user);
      } catch {
        setSessionToken('');
      } finally {
        setAuthReady(true);
      }
    };
    restoreSession();
  }, []);

  useEffect(() => {
    const syncUsersFromStorage = (event) => {
      if (event.key === 'users') setUsers(loadSafeProfiles());
    };
    window.addEventListener('storage', syncUsersFromStorage);
    return () => window.removeEventListener('storage', syncUsersFromStorage);
  }, []);

  useEffect(() => {
    if (currentUser?.role === 'employee' && activeViewRole === 'manager') {
      setActiveViewRole('employee');
    }
  }, [currentUser, activeViewRole]);

  useEffect(() => () => {
    if (persistTimer.current) window.clearTimeout(persistTimer.current);
  }, []);

  const login = async (username, password) => {
    try {
      const response = await authApi.login(username.trim(), password);
      setSessionToken(response.token);
      const user = await establishSession(response.user);
      return { success: true, user };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const register = async (username, password, email, avatar = '', role = 'employee', department = 'כללי') => {
    try {
      const response = await authApi.register({ username, password, email, avatar, role, department });
      return { success: true, message: response.message };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const reviewRegistration = async (username, decision) => {
    const target = users.find((user) => user.username === username);
    if (!target?.serverId) return { success: false, message: 'המשתמש לא נמצא במסד הנתונים של השרת.' };
    try {
      const response = await authApi.reviewUser(target.serverId, decision);
      mergeServerUser(response.user);
      setUsers(usersCollection.find());
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const logout = async () => {
    try {
      if (persistTimer.current) window.clearTimeout(persistTimer.current);
      if (pendingLearningState.current) await learningApi.save(pendingLearningState.current);
      pendingLearningState.current = null;
      if (getSessionToken()) await authApi.logout();
    } catch {
      setSessionToken('');
    } finally {
      setCurrentUser(null);
      setActiveViewRole('employee');
    }
  };

  const updateCurrentProfile = async ({ username, avatar }) => {
    if (!currentUser) return { success: false, message: 'לא נמצא משתמש מחובר.' };
    try {
      const response = await authApi.updateProfile({ username: username.trim(), avatar: avatar || '' });
      const updated = mergeServerUser(response.user);
      setCurrentUser(updated);
      setUsers(usersCollection.find());
      return { success: true, message: 'פרטי המשתמש עודכנו בהצלחה.' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const updateCurrentPassword = async (currentPassword, newPassword) => {
    try {
      const response = await authApi.changePassword(currentPassword, newPassword);
      setSessionToken('');
      setCurrentUser(null);
      return { success: true, message: response.message };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const publishCourse = async (course) => {
    if (!['manager', 'admin'].includes(currentUser?.role)) return { success: false };
    try {
      const response = await courseApi.save(course, 'published');
      const existing = coursesCollection.findOne({ id: course.id });
      if (existing) coursesCollection.updateOne({ _id: existing._id }, response.course);
      else coursesCollection.insertOne(response.course);
      setCustomSubjects(coursesCollection.find({ status: 'published' }));
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const saveCourseDraft = async (course) => {
    if (!['manager', 'admin'].includes(currentUser?.role)) return { success: false };
    try {
      const response = await courseApi.save(course, 'draft');
      const existing = coursesCollection.findOne({ id: course.id });
      if (existing) coursesCollection.updateOne({ _id: existing._id }, response.course);
      else coursesCollection.insertOne(response.course);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const deleteCourse = async (courseId) => {
    if (!['manager', 'admin'].includes(currentUser?.role)) return { success: false };
    try {
      await courseApi.remove(courseId);
      coursesCollection.deleteOne({ id: courseId });
      setCustomSubjects(coursesCollection.find({ status: 'published' }));
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const commitCurrentUserUpdate = (updater) => {
    if (!currentUser) return null;
    const updated = updateLocalUser(currentUser.username, updater);
    if (updated) {
      setCurrentUser(updated);
      setUsers(usersCollection.find());
      pendingLearningState.current = {
        progress: updated.progress,
        analytics: updated.analytics || {},
        presence: updated.presence || {},
        lastActivity: updated.lastActivity || null
      };
      if (persistTimer.current) window.clearTimeout(persistTimer.current);
      persistTimer.current = window.setTimeout(async () => {
        const state = pendingLearningState.current;
        pendingLearningState.current = null;
        try {
          await learningApi.save(state);
        } catch (error) {
          console.warn('[ShieldX progress save]', error.message);
          pendingLearningState.current = state;
        }
      }, 700);
    }
    return updated;
  };

  const trackVideoProgress = (subjectId, telemetry) => {
    if (!currentUser || currentUser.role === 'admin') return;
    commitCurrentUserUpdate((record) => {
      const analytics = record.analytics || { videos: {}, quizzes: {}, courses: {} };
      const previousVideo = analytics.videos?.[subjectId] || { watchSeconds: 0, sessions: 0 };
      const previousCourse = analytics.courses?.[subjectId] || {};
      return {
        ...record,
        analytics: {
          ...analytics,
          videos: {
            ...(analytics.videos || {}),
            [subjectId]: {
              ...previousVideo,
              watchSeconds: Math.max(0, Math.round((previousVideo.watchSeconds || 0) + (telemetry.watchedDelta || 0))),
              durationSeconds: Math.max(0, telemetry.duration || previousVideo.durationSeconds || 0),
              lastPosition: Math.max(0, telemetry.currentTime ?? previousVideo.lastPosition ?? 0),
              completed: Boolean(previousVideo.completed || telemetry.completed),
              sessions: (previousVideo.sessions || 0) + (telemetry.event === 'play' ? 1 : 0),
              updatedAt: new Date().toISOString()
            }
          },
          courses: {
            ...(analytics.courses || {}),
            [subjectId]: { ...previousCourse, startedAt: previousCourse.startedAt || new Date().toISOString() }
          }
        },
        lastActivity: new Date().toISOString()
      };
    });
  };

  const recordQuizAnswer = (subjectId, questionIndex, correct) => {
    if (!currentUser || currentUser.role === 'admin') return;
    commitCurrentUserUpdate((record) => {
      const analytics = record.analytics || { videos: {}, quizzes: {}, courses: {} };
      const topicStats = [...(analytics.quizzes?.[subjectId] || [])];
      const previous = topicStats[questionIndex] || { attempts: 0, correct: 0 };
      topicStats[questionIndex] = {
        attempts: previous.attempts + 1,
        correct: previous.correct + (correct ? 1 : 0)
      };
      return {
        ...record,
        analytics: { ...analytics, quizzes: { ...(analytics.quizzes || {}), [subjectId]: topicStats } },
        lastActivity: new Date().toISOString()
      };
    });
  };

  const completeLesson = (subjectId) => {
    if (!currentUser || currentUser.role === 'admin') return;
    commitCurrentUserUpdate((record) => {
      const previous = normalizeProgress(record.progress);
      const completedLessons = previous.completedLessons.includes(subjectId)
        ? previous.completedLessons
        : [...previous.completedLessons, subjectId];
      return { ...record, progress: { ...previous, completedLessons }, lastActivity: new Date().toISOString() };
    });
  };

  const completeLab = (subjectId) => {
    if (!currentUser || currentUser.role === 'admin') return;
    commitCurrentUserUpdate((record) => {
      const previous = normalizeProgress(record.progress);
      const completedLabs = previous.completedLabs.includes(subjectId)
        ? previous.completedLabs
        : [...previous.completedLabs, subjectId];
      return { ...record, progress: { ...previous, completedLabs }, lastActivity: new Date().toISOString() };
    });
  };

  const completeSubject = (subjectId, score) => {
    if (!currentUser || currentUser.role === 'admin' || !Number.isFinite(Number(score))) return;
    commitCurrentUserUpdate((record) => {
      const previous = normalizeProgress(record.progress);
      const passed = Number(score) >= 80;
      const isNewCompletion = passed && !previous.completedSubjects.includes(subjectId);
      const completedSubjects = isNewCompletion
        ? [...previous.completedSubjects, subjectId]
        : previous.completedSubjects;
      const badges = [...previous.badges];
      if (completedSubjects.length >= 1 && !badges.includes('צעד ראשון')) badges.push('צעד ראשון');
      if (completedSubjects.length >= 5 && !badges.includes('חצי הדרך')) badges.push('חצי הדרך');
      if (completedSubjects.length >= subjectsData.length && !badges.includes('מאסטר סייבר')) badges.push('מאסטר סייבר');
      return {
        ...record,
        progress: {
          ...previous,
          completedSubjects,
          scores: { ...previous.scores, [subjectId]: Math.max(Number(previous.scores[subjectId]) || 0, Number(score)) },
          badges,
          xp: previous.xp + (isNewCompletion ? 100 : 0)
        },
        lastActivity: new Date().toISOString()
      };
    });
  };

  const submitFinalExam = (score, attemptDetails = {}) => {
    if (!currentUser || currentUser.role === 'admin') return null;
    const record = findLocalProfile(currentUser);
    const readiness = getCertificationReadiness(record?.progress, record?.analytics, subjectsData);
    if (!readiness.unlocked) return null;

    const attemptedAt = new Date().toISOString();
    let finalExam = null;
    commitCurrentUserUpdate((userRecord) => {
      const previousProgress = normalizeProgress(userRecord.progress);
      const previousExam = previousProgress.finalExam || { attempts: 0, bestScore: 0, history: [] };
      const numericScore = Math.max(0, Math.min(100, Number(score) || 0));
      const passedThisAttempt = numericScore >= 80;
      const attempt = {
        attempt: previousExam.attempts + 1,
        score: numericScore,
        passed: passedThisAttempt,
        correctCount: attemptDetails.correctCount ?? 0,
        wrongCount: attemptDetails.wrongCount ?? 0,
        attemptedAt,
        answers: Array.isArray(attemptDetails.answers) ? attemptDetails.answers : []
      };
      finalExam = {
        status: previousExam.passed || passedThisAttempt ? 'passed' : 'failed',
        passed: Boolean(previousExam.passed || passedThisAttempt),
        score: numericScore,
        lastScore: numericScore,
        bestScore: Math.max(previousExam.bestScore || 0, numericScore),
        attempts: attempt.attempt,
        lastAttemptAt: attemptedAt,
        passedAt: previousExam.passedAt || (passedThisAttempt ? attemptedAt : null),
        history: [...(previousExam.history || []), attempt].slice(-20)
      };
      const badges = [...previousProgress.badges];
      if (passedThisAttempt && !badges.includes('מוסמך ShieldX')) badges.push('מוסמך ShieldX');
      return { ...userRecord, progress: { ...previousProgress, badges, finalExam }, lastActivity: attemptedAt };
    });
    return finalExam;
  };

  const rateCourse = (subjectId, value) => {
    if (!currentUser || !Number.isInteger(value) || value < 1 || value > 5) return;
    commitCurrentUserUpdate((record) => {
      const progress = normalizeProgress(record.progress);
      return {
        ...record,
        progress: {
          ...progress,
          courseRatings: {
            ...(progress.courseRatings || {}),
            [subjectId]: { value, ratedAt: new Date().toISOString() }
          }
        }
      };
    });
  };

  const updatePresence = (activity = 'idle', context = {}) => {
    if (!currentUser || currentUser.role === 'admin') return;
    commitCurrentUserUpdate((record) => ({
      ...record,
      presence: { activity, ...context, lastSeen: new Date().toISOString() },
      lastActivity: activity === 'idle' ? record.lastActivity : new Date().toISOString()
    }));
  };

  const markDocumentRead = (documentId) => {
    if (!currentUser) return;
    commitCurrentUserUpdate((record) => {
      const progress = normalizeProgress(record.progress);
      return {
        ...record,
        progress: {
          ...progress,
          readDocuments: {
            ...(progress.readDocuments || {}),
            [documentId]: { readAt: new Date().toISOString() }
          }
        }
      };
    });
  };

  const requestPasswordReset = async (email) => {
    try {
      return { success: true, ...(await passwordResetApi.request(email)) };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const validateResetToken = async (token) => {
    try {
      return await passwordResetApi.validate(token);
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const submitPasswordReset = async (token, newPassword, confirmPassword) => {
    try {
      await passwordResetApi.reset(token, newPassword, confirmPassword);
      setSessionToken('');
      setCurrentUser(null);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const userProgress = normalizeProgress(currentUser?.progress);

  return (
    <AppContext.Provider value={{
      users,
      currentUser,
      authReady,
      activeViewRole,
      userProgress,
      subjects,
      publishCourse,
      saveCourseDraft,
      deleteCourse,
      login,
      register,
      reviewRegistration,
      logout,
      updateCurrentProfile,
      updateCurrentPassword,
      completeLesson,
      completeSubject,
      completeLab,
      submitFinalExam,
      rateCourse,
      updatePresence,
      markDocumentRead,
      trackVideoProgress,
      recordQuizAnswer,
      requestPasswordReset,
      validateResetToken,
      submitPasswordReset,
      setActiveViewRole
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
export default AppContext;
