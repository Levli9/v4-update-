// src/pages/SubjectView.jsx
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { subjectsData } from '../data/subjectsData';
import PhishingSimulation from '../components/PhishingSimulation';
import Quiz from '../components/Quiz';

export default function SubjectView() {
  const { id } = useParams();
  const subjectId = parseInt(id, 10);
  const subject = subjectsData.find(s => s.id === subjectId);
  const { completeSubject } = useApp();

  const [activeTab, setActiveTab] = useState('learn'); // learn, lab, quiz
  const [slideIdx, setSlideIdx] = useState(0);
  const [labDone, setLabDone] = useState(false);

  if (!subject) {
    return (
      <div className="text-center py-12 text-rose-500 font-bold">
        שגיאה: הנושא המבוקש לא נמצא במערכת.
      </div>
    );
  }

  const handleQuizComplete = (score) => {
    if (score >= 80) {
      completeSubject(subjectId, score);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Back navigation */}
      <div className="flex justify-between items-center">
        <div>
          <span className="text-xs px-2.5 py-1 rounded bg-[#00e6ff]/10 text-[#00e6ff] font-bold border border-[#00e6ff]/20">
            {subject.difficulty}
          </span>
          <h2 className="text-2xl font-bold mt-2">{subject.title}</h2>
        </div>
        <Link to="/" className="px-4 py-2 rounded-lg bg-gray-800 text-xs hover:bg-gray-700 font-bold border border-gray-700">
          חזרה ללוח הבקרה
        </Link>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-gray-800">
        <button
          onClick={() => setActiveTab('learn')}
          className={`px-6 py-3 text-sm font-bold border-b-2 transition-all ${
            activeTab === 'learn' ? 'border-[#00e6ff] text-[#00e6ff]' : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          📖 שיעור עיוני
        </button>
        {subject.simulations && subject.simulations.length > 0 && (
          <button
            onClick={() => setActiveTab('lab')}
            className={`px-6 py-3 text-sm font-bold border-b-2 transition-all ${
              activeTab === 'lab' ? 'border-[#ffb703] text-[#ffb703]' : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            🎮 מעבדה וסימולציה
          </button>
        )}
        <button
          onClick={() => setActiveTab('quiz')}
          className={`px-6 py-3 text-sm font-bold border-b-2 transition-all ${
            activeTab === 'quiz' ? 'border-[#9d4edd] text-[#9d4edd]' : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          📝 מבדק ידע
        </button>
      </div>

      {/* Tab Contents */}
      <div className="py-4">
        {activeTab === 'learn' && (
          <div className="bg-gray-900/40 border border-gray-800 rounded-2xl p-6 sm:p-8 max-w-3xl mx-auto space-y-6">
            {subject.slides && subject.slides.length > 0 ? (
              <>
                <h3 className="text-xl font-bold text-white border-b border-gray-800 pb-3">
                  {subject.slides[slideIdx].title}
                </h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  {subject.slides[slideIdx].content}
                </p>
                {subject.slides[slideIdx].bullets && (
                  <ul className="space-y-2.5">
                    {subject.slides[slideIdx].bullets.map((b, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-xs text-gray-400 bg-gray-950/40 border border-gray-850 p-3 rounded-lg">
                        <span className="text-[#00e6ff]">⚡</span>
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                )}

                <div className="flex justify-between items-center pt-6 border-t border-gray-800 mt-6">
                  <button
                    onClick={() => setSlideIdx(prev => Math.max(0, prev - 1))}
                    disabled={slideIdx === 0}
                    className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-750 text-xs font-bold border border-gray-700 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    הקודם
                  </button>
                  <span className="text-xs text-gray-500 font-bold">
                    שקף {slideIdx + 1} מתוך {subject.slides.length}
                  </span>
                  <button
                    onClick={() => setSlideIdx(prev => Math.min(subject.slides.length - 1, prev + 1))}
                    disabled={slideIdx === subject.slides.length - 1}
                    className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-750 text-xs font-bold border border-gray-700 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    הבא
                  </button>
                </div>
              </>
            ) : (
              <p className="text-center text-gray-500 py-12">השיעור העיוני בנושא זה נמצא בפיתוח.</p>
            )}
          </div>
        )}

        {activeTab === 'lab' && (
          <div className="max-w-2xl mx-auto">
            {subject.simulations[0].type === 'phishing-analyzer' ? (
              <PhishingSimulation onComplete={() => setLabDone(true)} />
            ) : (
              <div className="bg-[#0b0b14] border border-gray-800 rounded-xl p-6 text-center space-y-4">
                <h4 className="text-xl font-bold">🖥️ סימולטור פקודות רשת</h4>
                <p className="text-xs text-gray-400">{subject.simulations[0].instructions}</p>
                <div className="bg-black border border-gray-800 rounded p-4 font-mono text-left text-xs text-green-400">
                  $ nmap -v scanme.nmap.org
                </div>
                <button
                  onClick={() => setLabDone(true)}
                  className="px-6 py-2.5 rounded-lg bg-emerald-500 text-black font-bold text-sm"
                >
                  השלם מעבדה
                </button>
              </div>
            )}
            {labDone && (
              <div className="text-center mt-6 text-xs text-emerald-400 font-bold">
                🎉 המעבדה הושלמה! כעת תוכל לעבור למבדק הידע.
              </div>
            )}
          </div>
        )}

        {activeTab === 'quiz' && (
          <Quiz questions={subject.quizzes} onQuizComplete={handleQuizComplete} />
        )}
      </div>
    </div>
  );
}
