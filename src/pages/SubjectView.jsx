// src/pages/SubjectView.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { CheckCircle2, Lightbulb, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import PhishingSimulation from '../components/PhishingSimulation';
import Quiz from '../components/Quiz';
import VideoPlayer from '../components/VideoPlayer';
import BackButton from '../components/BackButton';
import ScenarioLab from '../components/ScenarioLab';
import { subjectsData as builtInSubjects } from '../data/subjectsData';
import { courseApi } from '../services/apiClient';

export default function SubjectView() {
  const { id } = useParams();
  const { subjects = [], completeLesson, completeSubject, completeLab, recordQuizAnswer, trackVideoProgress, rateCourse, updatePresence, currentUser, userProgress, setActiveViewRole } = useApp();
  const subject = subjects.find(s => String(s.id) === String(id));
  const subjectId = subject?.id;

  const [activeTab, setActiveTab] = useState(subject?.videoUrl ? 'video' : 'learn'); // video, learn, lab, quiz
  const [slideIdx, setSlideIdx] = useState(0);

  const availableTabs = [];
  if (subject?.videoUrl) availableTabs.push('video');
  availableTabs.push('learn');
  if (subject?.simulations && subject.simulations.length > 0) availableTabs.push('lab');
  availableTabs.push('quiz');

  const currentTabIdx = availableTabs.indexOf(activeTab);
  const nextTab = currentTabIdx !== -1 && currentTabIdx < availableTabs.length - 1 ? availableTabs[currentTabIdx + 1] : null;

  const getTabLabel = (tab) => {
    switch (tab) {
      case 'video': return 'סרטון הסבר';
      case 'learn': return 'שיעור עיוני';
      case 'lab': return 'מעבדה וסימולציה';
      case 'quiz': return 'מבדק ידע';
      default: return '';
    }
  };
  const [labDone, setLabDone] = useState(false);
  const [revealedBullets, setRevealedBullets] = useState([]);
  const [lessonChoice, setLessonChoice] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);

  // Status checks for each tab completion
  const isVideoCompleted = Boolean(currentUser?.analytics?.videos?.[subjectId]?.completed);
  const isLearnCompleted = Boolean(userProgress?.completedLessons?.includes(subjectId));
  const isLabCompleted = Boolean(userProgress?.completedLabs?.includes(subjectId)) || labDone;
  const isQuizCompleted = Boolean(Number(userProgress?.scores?.[subjectId]) >= 80);

  // Automatically mark theory lesson as completed when the user reads to the last slide
  useEffect(() => {
    if (subject?.slides && subject.slides.length > 0 && slideIdx === subject.slides.length - 1) {
      completeLesson(subjectId);
    }
  }, [slideIdx, subject, subjectId]);

  useEffect(() => {
    setSlideIdx(0);
    setRevealedBullets([]);
    setLessonChoice(null);
  }, [subjectId]);

  useEffect(() => {
    updatePresence('learning', { subjectId });
    const heartbeat = window.setInterval(() => updatePresence('learning', { subjectId }), 30000);
    return () => { window.clearInterval(heartbeat); updatePresence('idle'); };
  }, [subjectId]);

  if (!subject) {
    return (
      <div className="text-center py-12 text-rose-500 font-bold">
        שגיאה: הנושא המבוקש לא נמצא במערכת.
      </div>
    );
  }

  const handleQuizComplete = (score) => {
    if (score >= 80) {
      // Just record quiz score in scores database
      completeSubject(subjectId, score);
      setShowFeedback(true);
    }
  };

  const handleLabComplete = () => {
    setLabDone(true);
    completeLab(subjectId);
  };

  const changeSlide = (nextIndex) => {
    setSlideIdx(nextIndex);
    setRevealedBullets([]);
    setLessonChoice(null);
  };

  const toggleLessonBullet = (index) => {
    setRevealedBullets((current) => current.includes(index)
      ? current.filter((item) => item !== index)
      : [...current, index]);
  };

  const isSwapped = ((subjectId || 0) + slideIdx) % 2 === 0;

  const safeButton = (
    <button
      type="button"
      onClick={() => setLessonChoice('safe')}
      className={`rounded-xl border p-3 text-right text-xs font-bold transition-all cursor-pointer ${
        lessonChoice === 'safe'
          ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
          : 'border-gray-800 bg-gray-950/40 text-gray-300 hover:border-amber-400/30 hover:bg-amber-400/5'
      }`}
    >
      עוצר, בודק בערוץ נפרד ומדווח לגורם המתאים
    </button>
  );

  const riskyButton = (
    <button
      type="button"
      onClick={() => setLessonChoice('risky')}
      className={`rounded-xl border p-3 text-right text-xs font-bold transition-all cursor-pointer ${
        lessonChoice === 'risky'
          ? 'border-rose-500/40 bg-rose-500/10 text-rose-300'
          : 'border-gray-800 bg-gray-950/40 text-gray-300 hover:border-amber-400/30 hover:bg-amber-400/5'
      }`}
    >
      ממשיך מיד כדי לא לעכב את העבודה
    </button>
  );

  return (
    <div className="space-y-6">
      {/* Header and Back navigation */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">{subject.title}</h2>
        </div>
        <BackButton onClick={() => setActiveViewRole('employee')} />
      </div>

      {/* Tabs Menu */}
      <div className="grid grid-cols-2 border-b border-gray-800 sm:flex" role="tablist" aria-label="חלקי הקורס">
        {subject.videoUrl && (
          <button
            onClick={() => setActiveTab('video')}
            className={`min-h-12 px-3 py-3 text-xs font-bold border-b-2 transition-all sm:flex-1 sm:px-5 sm:text-sm ${
              activeTab === 'video' ? 'border-[#00e6ff] text-[#00e6ff]' : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            🎬 סרטון הסבר {isVideoCompleted && <span className="text-emerald-400 font-bold mr-1">✓</span>}
          </button>
        )}
        <button
          onClick={() => setActiveTab('learn')}
          className={`min-h-12 px-3 py-3 text-xs font-bold border-b-2 transition-all sm:flex-1 sm:px-5 sm:text-sm ${
            activeTab === 'learn' ? 'border-[#00e6ff] text-[#00e6ff]' : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          📖 שיעור עיוני {isLearnCompleted && <span className="text-emerald-400 font-bold mr-1">✓</span>}
        </button>
        {subject.simulations && subject.simulations.length > 0 && (
          <button
            onClick={() => setActiveTab('lab')}
            className={`min-h-12 px-3 py-3 text-xs font-bold border-b-2 transition-all sm:flex-1 sm:px-5 sm:text-sm ${
              activeTab === 'lab' ? 'border-[#ffb703] text-[#ffb703]' : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            🎮 מעבדה וסימולציה {isLabCompleted && <span className="text-emerald-400 font-bold mr-1">✓</span>}
          </button>
        )}
        <button
          onClick={() => setActiveTab('quiz')}
          className={`min-h-12 px-3 py-3 text-xs font-bold border-b-2 transition-all sm:flex-1 sm:px-5 sm:text-sm ${
            activeTab === 'quiz' ? 'border-[#9d4edd] text-[#9d4edd]' : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          📝 מבדק ידע {isQuizCompleted && <span className="text-emerald-400 font-bold mr-1">✓</span>}
        </button>
      </div>

      {/* Tab Contents */}
      <div className="py-4">
        {activeTab === 'video' && (
          <div className="space-y-6">
            <VideoPlayer 
              videoUrl={subject.videoUrl} 
              videoScript={subject.videoScript} 
              emoji={subject.emoji} 
              color={subject.color} 
              initialTime={currentUser?.analytics?.videos?.[subjectId]?.lastPosition || 0}
              onAnalytics={(telemetry) => trackVideoProgress(subjectId, telemetry)}
            />
            {nextTab && (
              <div className="flex justify-end max-w-5xl mx-auto">
                <button
                  type="button"
                  onClick={() => setActiveTab(nextTab)}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#00e6ff] to-[#00b8d4] text-black font-black text-sm shadow-[0_0_15px_rgba(0,230,255,0.3)] hover:scale-102 hover:shadow-[0_0_22px_rgba(0,230,255,0.45)] transition-all cursor-pointer"
                >
                  המשך ל{getTabLabel(nextTab)} ←
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'learn' && (
          <div className="bg-gray-900/40 border border-gray-800 rounded-3xl p-5 sm:p-7 max-w-5xl mx-auto space-y-6 shadow-2xl shadow-black/20">
            {subject.slides && subject.slides.length > 0 ? (
              <>
                <div className="flex items-center gap-2" aria-label={`התקדמות בשיעור: שקף ${slideIdx + 1} מתוך ${subject.slides.length}`}>
                  {subject.slides.map((_, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => changeSlide(index)}
                      className={`h-1.5 flex-1 rounded-full transition-all ${index <= slideIdx ? 'bg-[#00e6ff]' : 'bg-gray-800 hover:bg-gray-700'}`}
                      aria-label={`מעבר לשקף ${index + 1}`}
                    />
                  ))}
                </div>

                <div className={`grid items-center gap-8 ${subject.slides[slideIdx].visual ? 'md:grid-cols-[1.15fr_0.85fr]' : ''}`}>
                  <div className="space-y-5 text-right">
                    <div className="border-b border-gray-800 pb-4">
                      <div className="mb-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-[#00e6ff]">
                        <Sparkles size={14} /> פרק {slideIdx + 1} · למידה פעילה
                      </div>
                      <h3 className="text-xl font-black text-white sm:text-2xl">{subject.slides[slideIdx].title}</h3>
                      {subject.slides[slideIdx].subtitle && <p className="mt-2 text-sm font-semibold text-[#00e6ff]">{subject.slides[slideIdx].subtitle}</p>}
                    </div>
                    {subject.slides[slideIdx].content && <p className="text-gray-300 text-sm leading-relaxed">{subject.slides[slideIdx].content}</p>}
                    {subject.slides[slideIdx].bullets?.length > 0 && (
                      <div className="space-y-2.5">
                        <p className="flex items-center gap-2 text-[11px] font-bold text-gray-500"><Lightbulb size={14} className="text-amber-400" /> לחץ על כל נקודה כדי לסמן שהבנת</p>
                        {subject.slides[slideIdx].bullets.map((b, i) => (
                          <button
                            type="button"
                            key={i}
                            onClick={() => toggleLessonBullet(i)}
                            className={`flex w-full items-start gap-2.5 rounded-xl border p-3 text-right text-xs transition-all ${revealedBullets.includes(i) ? 'border-emerald-500/30 bg-emerald-500/8 text-emerald-100' : 'border-gray-800 bg-gray-950/40 text-gray-300 hover:border-[#00e6ff]/25 hover:bg-[#00e6ff]/5'}`}
                          >
                            {revealedBullets.includes(i) ? <CheckCircle2 size={17} className="shrink-0 text-emerald-400" /> : <span className="grid h-4 w-4 shrink-0 place-items-center rounded-full bg-[#00e6ff]/10 text-[9px] font-black text-[#00e6ff]">{i + 1}</span>}
                            <span className="flex-1">{b}</span>
                            {revealedBullets.includes(i) && <span className="text-[9px] font-black text-emerald-400">הבנתי</span>}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  {subject.slides[slideIdx].visual && builtInSubjects.includes(subject) && (
                    <div className="min-h-[250px] overflow-hidden rounded-2xl border border-[#00e6ff]/15 bg-gray-950/45 p-3">
                      <iframe
                        title={`המחשה לשקופית ${slideIdx + 1}`}
                        sandbox=""
                        srcDoc={`<!doctype html><html dir="rtl"><head><meta charset="utf-8"><style>html,body{margin:0;min-height:100%;background:transparent;color:#e5e7eb;font-family:Arial,sans-serif}body{display:flex;align-items:center;justify-content:center;padding:8px;box-sizing:border-box}svg{max-width:100%;height:auto}</style></head><body>${subject.slides[slideIdx].visual}</body></html>`}
                        className="h-[250px] w-full border-0"
                      />
                    </div>
                  )}
                </div>

                {subject.slides[slideIdx].type !== 'title' && (
                  <div className="rounded-2xl border border-amber-400/15 bg-gradient-to-l from-amber-400/[0.07] to-transparent p-4 sm:p-5">
                    <div className="flex items-center gap-2 text-xs font-black text-amber-300"><span>⚡</span> עצירת חשיבה — מה היית עושה?</div>
                    <p className="mt-2 text-sm font-bold text-gray-200">קיבלת בעבודה הודעה או בקשה שקשורה לנושא הזה, אבל משהו בה מרגיש לא תקין. מה הצעד הראשון?</p>
                    <div className="mt-4 grid gap-2 sm:grid-cols-2">
                      {isSwapped ? (
                        <>
                          {riskyButton}
                          {safeButton}
                        </>
                      ) : (
                        <>
                          {safeButton}
                          {riskyButton}
                        </>
                      )}
                    </div>
                    {lessonChoice && <p className={`mt-3 rounded-lg px-3 py-2 text-xs font-bold ${lessonChoice === 'safe' ? 'bg-emerald-500/10 text-emerald-300' : 'bg-rose-500/10 text-rose-300'}`}>{lessonChoice === 'safe' ? '✓ נכון. עצירה, אימות ודיווח מונעים מרוב האירועים להפוך לנזק ממשי.' : 'כמעט. לחץ ודחיפות הם בדיוק מה שתוקפים מנצלים—כדאי לעצור ולאמת לפני שפועלים.'}</p>}
                  </div>
                )}

                <div className="flex justify-between items-center pt-6 border-t border-gray-800 mt-6">
                  <button
                    onClick={() => changeSlide(Math.max(0, slideIdx - 1))}
                    disabled={slideIdx === 0}
                    className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-750 text-xs font-bold border border-gray-700 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    הקודם
                  </button>
                  <span className="text-xs text-gray-500 font-bold">
                    שקף {slideIdx + 1} מתוך {subject.slides.length}
                  </span>
                  {slideIdx === subject.slides.length - 1 && nextTab ? (
                    <button
                      onClick={() => setActiveTab(nextTab)}
                      className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-[#00e6ff] to-[#00b8d4] text-black font-black text-xs shadow-[0_0_10px_rgba(0,230,255,0.2)] hover:scale-102 transition-all cursor-pointer"
                    >
                      מעבר ל{getTabLabel(nextTab)} ←
                    </button>
                  ) : (
                    <button
                      onClick={() => changeSlide(Math.min(subject.slides.length - 1, slideIdx + 1))}
                      disabled={slideIdx === subject.slides.length - 1}
                      className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-750 text-xs font-bold border border-gray-700 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      הבא
                    </button>
                  )}
                </div>
              </>
            ) : (
              <p className="text-center text-gray-500 py-12">השיעור העיוני בנושא זה נמצא בפיתוח.</p>
            )}
          </div>
        )}

        {activeTab === 'lab' && (
          <div className="max-w-5xl mx-auto">
            {subject.simulations[0].type === 'phishing-analyzer' ? (
              <PhishingSimulation onComplete={handleLabComplete} />
            ) : subject.simulations[0].type === 'scenario' ? (
              <ScenarioLab scenario={subject.simulations[0]} color={subject.color} onComplete={handleLabComplete} />
            ) : (
              <div className="bg-[#0b0b14] border border-gray-800 rounded-xl p-6 text-center space-y-4">
                <h4 className="text-xl font-bold">🖥️ סימולטור פקודות רשת</h4>
                <p className="text-xs text-gray-400">{subject.simulations[0].instructions}</p>
                <div className="bg-black border border-gray-800 rounded p-4 font-mono text-left text-xs text-green-400">
                  $ nmap -v scanme.nmap.org
                </div>
                <button
                  onClick={handleLabComplete}
                  className="px-6 py-2.5 rounded-lg bg-emerald-500 text-black font-bold text-sm"
                >
                  השלם מעבדה
                </button>
              </div>
            )}
            {labDone && subject.simulations[0].type !== 'terminal' && (
              <div className="text-center mt-6 text-xs text-emerald-400 font-bold">
                🎉 המעבדה הושלמה! כעת תוכל לעבור למבדק הידע.
              </div>
            )}
            {isLabCompleted && nextTab && (
              <div className="flex justify-center mt-6">
                <button
                  type="button"
                  onClick={() => setActiveTab(nextTab)}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#00e6ff] to-[#00b8d4] text-black font-black text-sm shadow-[0_0_15px_rgba(0,230,255,0.3)] hover:scale-102 hover:shadow-[0_0_22px_rgba(0,230,255,0.45)] transition-all cursor-pointer"
                >
                  המשך ל{getTabLabel(nextTab)} ←
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'quiz' && (
          <div className="space-y-5"><Quiz questions={subject.quizzes} onQuizComplete={handleQuizComplete} onQuestionAnswered={(questionIndex, correct) => recordQuizAnswer(subjectId, questionIndex, correct)} serverGrader={subject.serverGraded ? (answers) => courseApi.gradeQuiz(subject.courseId, answers) : null} />{showFeedback && <section className="mx-auto max-w-xl rounded-3xl border border-yellow-500/15 bg-yellow-500/5 p-6 text-center"><h3 className="text-base font-black text-white">איך היה הקורס?</h3><p className="mt-1 text-xs font-semibold text-gray-500">הדירוג שלך עוזר לנו לשפר את חוויית הלמידה</p><div className="mt-4 flex justify-center gap-2" dir="ltr">{[1,2,3,4,5].map((star) => <button key={star} type="button" onClick={() => rateCourse(subjectId, star)} className={`text-3xl transition hover:scale-125 ${star <= (currentUser?.progress?.courseRatings?.[subjectId]?.value || 0) ? 'text-yellow-400' : 'text-gray-700'}`} aria-label={`דירוג ${star} מתוך 5`}>★</button>)}</div></section>}</div>
        )}
      </div>
    </div>
  );
}
