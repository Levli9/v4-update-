// src/context/AppContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { nosqlDb } from '../services/nosqlStorage';
import { hashPassword, verifyPassword } from '../services/hashService';

const AppContext = createContext();

const usersCollection = nosqlDb.collection('users');

export const AppProvider = ({ children }) => {
  // ── User Database ──
  const [users, setUsers] = useState(() => {
    let saved = usersCollection.find();
    
    // Auto-migrate passwords and force-correct default accounts (remove special role)
    if (saved && saved.length > 0) {
      let migrated = false;
      saved = saved.map(u => {
        const usernameLwr = u.username.toLowerCase();
        
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
        return usersCollection.find();
      }
      return saved;
    }
    
    // Default original users (mapped with standard manager/employee roles)
    const defaults = [
      {
        username: "Yaniv123",
        password: hashPassword("yaniv123"),
        email: "thebeastcom71@gmail.com",
        role: "manager",
        progress: { completedSubjects: [0, 1], scores: { 0: 90, 1: 85 }, badges: ["צעד ראשון"], xp: 200 }
      },
      {
        username: "Lev123",
        password: hashPassword("lev123"),
        email: "thebeastcom71@gmail.com",
        role: "manager",
        progress: { completedSubjects: [0], scores: { 0: 80 }, badges: ["צעד ראשון"], xp: 100 }
      },
      {
        username: "Yaniv123_emp",
        password: hashPassword("yaniv123"),
        email: "thebeastcom71@gmail.com",
        role: "employee",
        progress: { completedSubjects: [], scores: {}, badges: [], xp: 0 }
      },
      {
        username: "Lev123_emp",
        password: hashPassword("lev123"),
        email: "thebeastcom71@gmail.com",
        role: "employee",
        progress: { completedSubjects: [], scores: {}, badges: [], xp: 0 }
      }
    ];

    // Populate NoSQL database with defaults
    defaults.forEach(u => usersCollection.insertOne(u));
    return usersCollection.find();
  });

  // ── Session State ──
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('cyber_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [activeViewRole, setActiveViewRole] = useState(() => {
    const saved = localStorage.getItem('cyber_active_view_role');
    return saved ? saved : null; // 'employee' or 'manager'
  });

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
      setCurrentUser(match);
      setActiveViewRole(match.role);
      return { success: true };
    }
    return { success: false, message: "שם משתמש או סיסמה שגויים!" };
  };

  const register = (username, password, email) => {
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
      // Self-registration always creates an employee. Manager access is assigned separately.
      role: 'employee',
      progress: { completedSubjects: [], scores: {}, badges: [], xp: 0 }
    };

    usersCollection.insertOne(newUser);
    setUsers(usersCollection.find());
    return { success: true };
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
        completedSubjects: updatedCompleted,
        scores: updatedScores,
        badges: updatedBadges,
        xp: prevProgress.xp + (isNewCompletion ? 100 : 20)
      };

      // Update in NoSQL DB
      usersCollection.updateOne({ username: currentUser.username }, { progress: updatedProgress });
      setUsers(usersCollection.find());

      // Sync current session state
      setCurrentUser(prev => ({ ...prev, progress: updatedProgress }));
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
  const userProgress = currentUser?.progress || { completedSubjects: [], scores: {}, badges: [], xp: 0 };

  return (
    <AppContext.Provider value={{
      users,
      currentUser,
      activeViewRole,
      userProgress,
      login,
      register,
      logout,
      changePassword,
      completeSubject,
      sendBrevoRecoveryCode,
      setActiveViewRole
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
export default AppContext;
