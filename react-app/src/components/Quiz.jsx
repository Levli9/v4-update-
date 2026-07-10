// src/components/Quiz.jsx
import React, { useState } from 'react';

export default function Quiz({ questions, onQuizComplete }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [showResults, setShowResults] = useState(false);

  if (!questions || questions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        לא הוגדרו שאלות מבדק לנושא זה עדיין.
      </div>
    );
  }

  const currentQuestion = questions[currentIdx];

  const handleSelect = (idx) => {
    if (isAnswered) return;
    setSelectedOpt(idx);
  };

  const handleNext = () => {
    const correct = selectedOpt === currentQuestion.answer;
    if (correct) {
      setCorrectAnswers(prev => prev + 1);
    }
    
    setIsAnswered(true);
  };

  const proceedToNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(prev => prev + 1);
      setSelectedOpt(null);
      setIsAnswered(false);
    } else {
      const finalScore = Math.round((correctAnswers / questions.length) * 100);
      setShowResults(true);
      if (onQuizComplete) {
        onQuizComplete(finalScore);
      }
    }
  };

  if (showResults) {
    const scorePct = Math.round((correctAnswers / questions.length) * 100);
    const passed = scorePct >= 80;
    return (
      <div className="bg-[#0d0d1f] border border-gray-800 rounded-xl p-8 max-w-xl mx-auto text-center">
        <h3 className="text-2xl font-bold mb-4">תוצאות המבדק</h3>
        <div className={`text-5xl font-extrabold mb-6 ${passed ? 'text-emerald-400' : 'text-rose-500'}`}>
          {scorePct}%
        </div>
        <p className="text-gray-300 mb-6 leading-relaxed">
          {passed 
            ? '🎉 כל הכבוד! עברת את המבדק בהצלחה והנושא הבא פתוח בפניך.'
            : '❌ לא הגעת לציון המעבר המינימלי (80%). אנו ממליצים לחזור על החומר ולנסות שוב.'}
        </p>
        <button
          onClick={() => {
            setCurrentIdx(0);
            setSelectedOpt(null);
            setIsAnswered(false);
            setCorrectAnswers(0);
            setShowResults(false);
          }}
          className="px-6 py-2.5 rounded-lg bg-gray-800 hover:bg-gray-700 font-bold border border-gray-700"
        >
          נסה שוב
        </button>
      </div>
    );
  }

  return (
    <div className="bg-[#0d0d1f] border border-gray-800 rounded-xl p-8 max-w-xl mx-auto shadow-2xl">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-100">מבדק ידע אינטראקטיבי</h3>
        <span className="text-xs px-2.5 py-1 rounded bg-gray-800 text-gray-400">
          שאלה {currentIdx + 1} מתוך {questions.length}
        </span>
      </div>

      <p className="text-md text-gray-200 mb-6 leading-relaxed font-semibold">
        {currentQuestion.question}
      </p>

      <div className="space-y-3 mb-6">
        {currentQuestion.options.map((opt, i) => {
          let optStyle = 'border-gray-800 hover:border-gray-700 bg-gray-900/40 text-gray-300';
          if (selectedOpt === i) {
            optStyle = 'border-[#00e6ff] bg-[#00e6ff]/10 text-white font-semibold';
          }
          if (isAnswered) {
            if (i === currentQuestion.answer) {
              optStyle = 'border-emerald-500 bg-emerald-500/10 text-emerald-400 font-semibold';
            } else if (selectedOpt === i) {
              optStyle = 'border-rose-500 bg-rose-500/10 text-rose-400';
            } else {
              optStyle = 'border-gray-900 bg-gray-950 opacity-40 text-gray-600';
            }
          }

          return (
            <div
              key={i}
              onClick={() => handleSelect(i)}
              className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 ${optStyle}`}
            >
              {opt}
            </div>
          );
        })}
      </div>

      {isAnswered && (
        <div className="mb-6 p-4 rounded-lg bg-gray-850 border border-gray-800 text-xs text-gray-400 leading-relaxed">
          <strong>הסבר: </strong> {currentQuestion.explanation}
        </div>
      )}

      <div className="flex justify-end">
        {!isAnswered ? (
          <button
            onClick={handleNext}
            disabled={selectedOpt === null}
            className={`px-6 py-2.5 rounded-lg font-bold transition-all text-sm ${
              selectedOpt === null
                ? 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-850'
                : 'bg-[#00e6ff] text-black hover:bg-[#00e6ff]/90'
            }`}
          >
            אישור תשובה
          </button>
        ) : (
          <button
            onClick={proceedToNext}
            className="px-6 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-bold transition-all text-sm"
          >
            המשך {currentIdx < questions.length - 1 ? 'לשאלה הבאה' : 'לתוצאות'}
          </button>
        )}
      </div>
    </div>
  );
}
