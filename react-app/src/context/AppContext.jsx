// src/context/AppContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [userProgress, setUserProgress] = useState(() => {
    const saved = localStorage.getItem('cyber_user_progress');
    return saved ? JSON.parse(saved) : {
      completedSubjects: [], // Array of completed subject IDs
      scores: {},            // Map of subjectId -> high score
      badges: [],            // Unlocked badges
      xp: 0
    };
  });

  useEffect(() => {
    localStorage.setItem('cyber_user_progress', JSON.stringify(userProgress));
  }, [userProgress]);

  const completeSubject = (subjectId, score) => {
    setUserProgress(prev => {
      const isNewCompletion = !prev.completedSubjects.includes(subjectId);
      const updatedCompleted = isNewCompletion
        ? [...prev.completedSubjects, subjectId]
        : prev.completedSubjects;

      const updatedScores = {
        ...prev.scores,
        [subjectId]: Math.max(prev.scores[subjectId] || 0, score)
      };

      const updatedBadges = [...prev.badges];
      if (updatedCompleted.length === 1 && !updatedBadges.includes('צעד ראשון')) {
        updatedBadges.push('צעד ראשון');
      }
      if (updatedCompleted.length === 5 && !updatedBadges.includes('חצי הדרך')) {
        updatedBadges.push('חצי הדרך');
      }
      if (updatedCompleted.length === 11 && !updatedBadges.includes('מאסטר סייבר')) {
        updatedBadges.push('מאסטר סייבר');
      }

      return {
        ...prev,
        completedSubjects: updatedCompleted,
        scores: updatedScores,
        badges: updatedBadges,
        xp: prev.xp + (isNewCompletion ? 100 : 20)
      };
    });
  };

  return (
    <AppContext.Provider value={{ userProgress, completeSubject }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
export default AppContext;
