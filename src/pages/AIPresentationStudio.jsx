import React, { useEffect, useState, useMemo } from 'react';
import { 
  Play, Save, Sparkles, Trash2, Copy, Plus, ArrowLeft, ArrowRight,
  Upload, CheckCircle2, Loader2, Edit3
} from 'lucide-react';
import BackButton from '../components/BackButton';
import { generatePresentation, refineSlide } from '../services/presentationGenerator';
import { normalizeDeck, PRESENTATION_THEMES } from '../services/presentationSchema';
import { useApp } from '../context/AppContext';

export default function AIPresentationStudio() {
  const { publishCourse, saveCourseDraft } = useApp();

  // Form States
  const [prompt, setPrompt] = useState('זיהוי מתקפת פישינג והדרך הנכונה לדווח עליה');
  const [sourceText, setSourceText] = useState('');
  const [audience, setAudience] = useState('עובדי החברה');
  const [slideCount, setSlideCount] = useState(7);
  const [difficulty, setDifficulty] = useState('בינוני');
  const [duration, setDuration] = useState(30);
  const [language, setLanguage] = useState('עברית');
  const [passScore, setPassScore] = useState(80);
  const [theme, setTheme] = useState('cyber');
  const [uploadError, setUploadError] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);

  // Deck & Editor States
  const [deck, setDeck] = useState(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState(0);
  const [isRefining, setIsRefining] = useState(false);
  const [isSavingCourse, setIsSavingCourse] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [activeTab, setActiveTab] = useState('notes'); // 'notes' | 'visual'

  // Load latest draft on component mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('shieldx_ai_presentation_draft');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && Array.isArray(parsed.slides) && parsed.slides.length > 0) {
          setDeck(parsed);
        } else {
          localStorage.removeItem('shieldx_ai_presentation_draft');
        }
      }
    } catch (e) {
      console.warn("Failed to load saved draft:", e);
    }
  }, []);

  // Auto-save draft locally whenever deck changes
  useEffect(() => {
    if (!deck) return;
    const timer = window.setTimeout(() => {
      localStorage.setItem('shieldx_ai_presentation_draft', JSON.stringify(deck));
    }, 400);
    return () => window.clearTimeout(timer);
  }, [deck]);

  // Stepper simulator during AI generation
  useEffect(() => {
    if (!isGenerating) {
      setGenerationStep(0);
      return;
    }
    const interval = setInterval(() => {
      setGenerationStep(prev => Math.min(3, prev + 1));
    }, 2800);
    return () => clearInterval(interval);
  }, [isGenerating]);

  // File Drag & Drop Handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const readSourceFile = async (file) => {
    setUploadError('');
    if (!file) return;
    if (file.size > 1024 * 1024) {
      setUploadError('קובץ המקור גדול מדי. ניתן להעלות קובץ TXT עד 1MB.');
      return;
    }
    if (file.type !== 'text/plain' && !file.name.toLowerCase().endsWith('.txt')) {
      setUploadError('בשלב זה נתמכת העלאה בטוחה של קובצי TXT בלבד. תוכן PDF או DOCX ניתן להדביק בתיבת הטקסט.');
      return;
    }
    try {
      const content = await file.text();
      if (!content.trim()) {
        setUploadError('קובץ המקור ריק.');
        return;
      }
      setSourceText(content.slice(0, 50_000));
      if (content.length > 50_000) setUploadError('נטענו 50,000 התווים הראשונים מהקובץ.');
    } catch {
      setUploadError('לא ניתן לקרוא את קובץ המקור.');
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragOver(false);
    await readSourceFile(e.dataTransfer.files?.[0]);
  };

  const handleFileChange = async (event) => {
    await readSourceFile(event.target.files?.[0]);
    event.target.value = '';
  };

  // Generate Course API Call
  const createDeck = async () => {
    if (!prompt.trim()) return;
    setError('');
    setSuccessMsg('');
    setIsGenerating(true);
    setGenerationStep(0);
    try {
      const result = await generatePresentation({
        prompt,
        sourceText,
        audience,
        slideCount,
        difficulty,
        duration,
        language,
        passScore
      });

      // Map to standard local schema structure
      const newDeck = { ...normalizeDeck(result, { prompt, language, theme }), audience, difficulty, duration, passScore };
      if (result.warning) setSuccessMsg(result.warning);
      // Progressive rendering: the editor becomes useful as each generated slide arrives.
      setDeck({ ...newDeck, slides: [] });
      for (let index = 0; index < newDeck.slides.length; index += 1) {
        await new Promise((resolve) => window.setTimeout(resolve, 110));
        setDeck((previous) => ({ ...previous, slides: [...previous.slides, newDeck.slides[index]] }));
        setGenerationStep(Math.min(3, Math.floor((index / Math.max(1, newDeck.slides.length)) * 4)));
      }
      setActiveSlide(0);
    } catch (err) {
      setError(err.message || 'שגיאה בחיבור לשרת ה-AI. אנא נסו שוב.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Save Course Draft
  const handleSaveDraft = async () => {
    if (!deck || isSavingCourse) return;
    setIsSavingCourse(true);
    const result = await saveCourseDraft(deck);
    setIsSavingCourse(false);
    if (!result.success) {
      setError(result.message || 'לא ניתן לשמור את הטיוטה.');
      return;
    }
    setSuccessMsg('הטיוטה נשמרה בהצלחה במסד הנתונים.');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  // Publish Course to Employees
  const handlePublish = async () => {
    if (!deck || isSavingCourse) return;
    if (!deck.title || deck.slides.length === 0 || !deck.finalExam || deck.finalExam.length === 0) {
      setError('לא ניתן לפרסם קורס ללא כותרת, שקופיות או שאלות מבחן.');
      return;
    }
    setIsSavingCourse(true);
    const result = await publishCourse(deck);
    setIsSavingCourse(false);
    if (!result.success) {
      setError(result.message || 'לא ניתן לפרסם את הקורס.');
      return;
    }
    setSuccessMsg('הקורס פורסם בהצלחה וזמין כעת לכל העובדים!');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => setSuccessMsg(''), 5000);
  };

  // AI Slide Refinement API Call
  const handleRefineSlide = async (actionType) => {
    if (!deck || isRefining) return;
    setError('');
    setIsRefining(true);
    try {
      const currentSlideObj = deck.slides[activeSlide];
      const updatedSlide = await refineSlide(actionType, currentSlideObj, deck.title);

      setDeck(prev => ({
        ...prev,
        slides: prev.slides.map((s, idx) => idx === activeSlide ? { ...s, ...updatedSlide } : s)
      }));
      setSuccessMsg('השקופית שוכתבה בהצלחה באמצעות AI.');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setError(err.message || 'שגיאה בעריכת השקופית באמצעות AI.');
    } finally {
      setIsRefining(false);
    }
  };

  // Slide Modification Actions
  const updateSlideField = (field, value) => {
    setDeck(prev => ({
      ...prev,
      slides: prev.slides.map((s, idx) => idx === activeSlide ? { ...s, [field]: value } : s)
    }));
  };

  const updateBulletPoint = (bulletIndex, value) => {
    setDeck(prev => {
      const currentSlideObj = prev.slides[activeSlide];
      const newBullets = [...(currentSlideObj.bulletPoints || [])];
      newBullets[bulletIndex] = value;
      return {
        ...prev,
        slides: prev.slides.map((s, idx) => idx === activeSlide ? { ...s, bulletPoints: newBullets } : s)
      };
    });
  };

  const addBulletPoint = () => {
    setDeck(prev => {
      const currentSlideObj = prev.slides[activeSlide];
      const newBullets = [...(currentSlideObj.bulletPoints || []), 'נקודה חדשה שנוספה'];
      return {
        ...prev,
        slides: prev.slides.map((s, idx) => idx === activeSlide ? { ...s, bulletPoints: newBullets } : s)
      };
    });
  };

  const removeBulletPoint = (bulletIndex) => {
    setDeck(prev => {
      const currentSlideObj = prev.slides[activeSlide];
      const newBullets = (currentSlideObj.bulletPoints || []).filter((_, idx) => idx !== bulletIndex);
      return {
        ...prev,
        slides: prev.slides.map((s, idx) => idx === activeSlide ? { ...s, bulletPoints: newBullets } : s)
      };
    });
  };

  const addNewSlide = () => {
    if (!deck) return;
    const newSlide = {
      id: deck.slides.length + 1,
      title: 'כותרת שקופית חדשה',
      content: 'הקלידו כאן תוכן מפורט עבור השקופית החדשה שלכם.',
      bulletPoints: ['נקודה ראשונה', 'נקודה שנייה'],
      speakerNotes: 'הערות מדריך לשקופית זו',
      visualSuggestion: 'איור טכנולוגי תומך'
    };
    setDeck(prev => ({
      ...prev,
      slides: [...prev.slides, newSlide]
    }));
    setActiveSlide(deck.slides.length);
  };

  const duplicateSlide = () => {
    if (!deck) return;
    const current = deck.slides[activeSlide];
    const duplicated = {
      ...current,
      id: deck.slides.length + 1,
      title: `${current.title} (העתק)`
    };
    setDeck(prev => {
      const updatedSlides = [...prev.slides];
      updatedSlides.splice(activeSlide + 1, 0, duplicated);
      return { ...prev, slides: updatedSlides };
    });
    setActiveSlide(activeSlide + 1);
  };

  const deleteActiveSlide = () => {
    if (!deck) return;
    if (deck.slides.length <= 1) {
      setError('לא ניתן למחוק את השקופית האחרונה בקורס.');
      return;
    }
    if (window.confirm('האם אתם בטוחים שברצונכם למחוק שקופית זו?')) {
      setDeck(prev => ({
        ...prev,
        slides: prev.slides.filter((_, idx) => idx !== activeSlide)
      }));
      setActiveSlide(prev => Math.max(0, prev - 1));
    }
  };

  const moveSlide = (direction) => {
    if (!deck) return;
    const targetIdx = direction === 'up' ? activeSlide - 1 : activeSlide + 1;
    if (targetIdx < 0 || targetIdx >= deck.slides.length) return;

    setDeck(prev => {
      const newSlides = [...prev.slides];
      const temp = newSlides[activeSlide];
      newSlides[activeSlide] = newSlides[targetIdx];
      newSlides[targetIdx] = temp;
      return { ...prev, slides: newSlides };
    });
    setActiveSlide(targetIdx);
  };

  const currentSlide = deck?.slides[activeSlide];

  return (
    <div className="mx-auto max-w-7xl pt-4" dir="rtl">
      {/* Top Header Card with Offset fixes */}
      <div className="mb-8 flex items-start justify-between gap-4 border-b border-gray-800/60 pb-5">
        <div>
          <span className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#00e6ff]/25 bg-[#00e6ff]/8 px-3 py-1 text-xs font-bold text-[#6ff4ff]">
            <Sparkles size={13} /> ShieldX AI Studio
          </span>
          <h1 className="text-3xl font-black text-white tracking-tight">AI Course Generator</h1>
          <p className="mt-2 text-sm text-gray-400">מחולל הקורסים והלומדות החכם של המערכת. הזינו נושא וקבלו סילבוס מושלם באופן מיידי.</p>
        </div>
        <BackButton />
      </div>

      {successMsg && (
        <div className="mb-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-sm font-bold text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.08)]">
          {successMsg}
        </div>
      )}

      {error && (
        <div className="mb-6 rounded-2xl border border-rose-500/20 bg-rose-500/5 p-4 text-sm font-bold text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.08)]">
          {error}
        </div>
      )}

      <div className="grid gap-8 xl:grid-cols-[1fr_400px]">
        
        {/* DISPLAY WORKSPACE (LEFT) */}
        <section className="min-w-0 order-2 xl:order-1">
          
          {/* 1. Blank State */}
          {!deck && !isGenerating && (
            <div className="grid min-h-[620px] place-items-center rounded-3xl border border-dashed border-gray-800 bg-[#0a0d17]/40 p-8 text-center backdrop-blur-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-[#00e6ff]/3 opacity-[0.02] blur-3xl rounded-full"></div>
              <div className="relative z-10">
                <div className="mx-auto grid h-24 w-24 place-items-center rounded-3xl border border-[#00e6ff]/15 bg-[#00e6ff]/5 text-[#00e6ff] shadow-[0_0_30px_rgba(0,230,255,0.08)]">
                  <Sparkles size={40} />
                </div>
                <h2 className="mt-6 text-2xl font-black text-white">המצגת והקורס שלך יופיעו כאן</h2>
                <p className="mt-3 max-w-lg text-sm leading-relaxed text-gray-500">
                  מלאו את הנושא הארגוני המבוקש בטופס הצידי, הגדירו את קהל היעד ומספר השקופיות, ולחצו על כפתור הייצור.
                  המערכת תעשה שימוש בשרת ה-AI המאובטח ותפרוס בפניכם לומדה שלמה הכוללת מצגת ומבחן הסמכה.
                </p>
                <div className="mt-8 flex justify-center gap-4 text-xs font-bold text-gray-500">
                  <span className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-[#00e6ff]" /> שקופיות תוכן</span>
                  <span className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-[#00e6ff]" /> הערות מדריך מפורטות</span>
                  <span className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-[#00e6ff]" /> שאלון הסמכה אוטומטי</span>
                </div>
              </div>
            </div>
          )}

          {/* 2. Loading State with Stepper */}
          {isGenerating && (
            <div className="grid min-h-[620px] place-items-center rounded-3xl border border-gray-850 bg-[#0a0d17]/70 p-8 text-center backdrop-blur-sm">
              <div className="max-w-md w-full">
                <Loader2 size={48} className="animate-spin text-[#00e6ff] mx-auto mb-6" />
                <h3 className="text-xl font-bold text-white mb-6">מייצר קורס באמצעות AI...</h3>
                
                <div className="space-y-4 text-right bg-gray-950/60 p-6 rounded-2xl border border-gray-900">
                  {[
                    'מנתח את הנושא ודרישות ההדרכה',
                    'בונה את מבנה הסילבוס המקצועי',
                    'מנסח שקופיות לימוד מעמיקות',
                    'מכין שאלות ומבחן הסמכה מבוסס נושא'
                  ].map((stepText, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs font-black transition-colors ${
                        generationStep > idx 
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                          : generationStep === idx 
                            ? 'bg-[#00e6ff]/20 text-[#00e6ff] border border-[#00e6ff]/30 animate-pulse' 
                            : 'bg-gray-900 text-gray-600 border border-gray-800'
                      }`}>
                        {generationStep > idx ? '✓' : idx + 1}
                      </span>
                      <span className={`text-xs font-bold transition-colors ${
                        generationStep >= idx ? 'text-gray-200' : 'text-gray-600'
                      }`}>
                        {stepText}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 3. Slide Canvas Viewer */}
          {deck && currentSlide && (
            <div className="space-y-6">
              
              {/* Toolbar & Metadata Info */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-gray-950/40 p-3 rounded-2xl border border-gray-900">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
                  <span className="rounded-full bg-cyan-500/10 px-2.5 py-1 text-cyan-400 border border-cyan-500/20">קורס AI</span>
                  <span>{deck.slides.length} שקופיות</span>
                  <span className="text-gray-600">|</span>
                  <span>ציון מעבר למבחן: {deck.passScore}%</span>
                </div>
                
                <div className="flex gap-2">
                  <button type="button" onClick={handleSaveDraft} disabled={isSavingCourse} className="flex items-center gap-1.5 rounded-xl border border-gray-800 bg-gray-900/60 px-3.5 py-2 text-xs font-bold text-gray-300 hover:bg-gray-900 transition-colors disabled:opacity-50">
                    <Save size={14} /> {isSavingCourse ? 'שומר...' : 'שמור טיוטה'}
                  </button>
                  <button type="button" onClick={handlePublish} disabled={isSavingCourse} className="flex items-center gap-1.5 rounded-xl bg-gradient-to-l from-[#00e6ff] to-[#5ce1e6] px-4 py-2 text-xs font-black text-black shadow-md hover:brightness-110 transition disabled:opacity-50">
                    <Play size={14} /> פרסם לעובדים
                  </button>
                </div>
              </div>

              {/* Main Slide Card with Editable Canvas */}
              <div className="relative aspect-[16/9] w-full overflow-hidden rounded-3xl border border-gray-800 bg-[radial-gradient(circle_at_85%_15%,rgba(0,230,255,0.06),transparent_40%),linear-gradient(145deg,#0c101b,#060810)] shadow-2xl p-8 flex flex-col justify-between">
                
                {/* Refine Spinner Overlay */}
                {isRefining && (
                  <div className="absolute inset-0 bg-black/75 z-20 grid place-items-center backdrop-blur-sm">
                    <div className="text-center">
                      <Loader2 size={36} className="animate-spin text-[#00e6ff] mx-auto mb-3" />
                      <p className="text-xs font-bold text-gray-400">משכתב שקופית באמצעות בינה מלאכותית...</p>
                    </div>
                  </div>
                )}

                {/* Top header on slide */}
                <div className="flex items-start justify-between gap-6">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-[#00e6ff]">שקף {activeSlide + 1}</span>
                      <span className="text-gray-700">|</span>
                      <Edit3 size={11} className="text-gray-600" />
                      <input 
                        value={currentSlide.title || ''} 
                        onChange={(e) => updateSlideField('title', e.target.value)} 
                        className="flex-1 bg-transparent border-none text-xl sm:text-2xl font-black text-white outline-none focus:ring-1 focus:ring-[#00e6ff]/20 rounded px-1.5"
                        placeholder="כותרת השקופית"
                      />
                    </div>
                    <textarea
                      value={currentSlide.content || ''}
                      onChange={(e) => updateSlideField('content', e.target.value)}
                      rows={2}
                      className="mt-3 w-full bg-transparent border-none text-xs leading-relaxed text-gray-400 outline-none resize-none focus:ring-1 focus:ring-[#00e6ff]/20 rounded px-1.5"
                      placeholder="הקלידו תוכן שקופית מפורט כאן..."
                    />
                  </div>
                  <div className="text-xs font-black tracking-widest text-gray-700 select-none">SHIELD<span className="text-[#00e6ff]">X</span></div>
                </div>

                {/* Bullet Points Area */}
                <div className="my-4 space-y-2 max-h-[48%] overflow-y-auto pr-2">
                  {(currentSlide.bulletPoints || []).map((bullet, index) => (
                    <div key={index} className="flex items-center gap-2 group bg-black/25 border border-white/5 px-3 py-1.5 rounded-xl">
                      <span className="h-2 w-2 rounded-full bg-[#00e6ff] shrink-0" />
                      <input
                        value={bullet || ''}
                        onChange={(e) => updateBulletPoint(index, e.target.value)}
                        className="flex-1 bg-transparent border-none text-xs text-gray-200 outline-none focus:ring-1 focus:ring-[#00e6ff]/20 rounded px-1"
                      />
                      <button 
                        type="button" 
                        onClick={() => removeBulletPoint(index)} 
                        className="text-gray-600 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                        title="מחק נקודה"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                  <button 
                    type="button" 
                    onClick={addBulletPoint} 
                    className="flex items-center gap-1 text-[10px] font-bold text-gray-500 hover:text-[#00e6ff] transition-colors py-1 px-3"
                  >
                    <Plus size={12} /> הוסף נקודה מרכזית
                  </button>
                </div>

                {/* Footer Controls & Progress Bar inside slide */}
                <div className="border-t border-gray-900 pt-3">
                  <div className="flex items-center justify-between text-[10px] text-gray-600">
                    <span>{activeSlide + 1} / {deck.slides.length}</span>
                    <span className="flex items-center gap-1"><Edit3 size={10} /> לחצו על כל טקסט בשקופית כדי לערוך אותו ישירות</span>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="mt-2 h-1 bg-gray-950 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-l from-[#00e6ff] to-[#9d4edd] transition-all duration-300"
                      style={{ width: `${((activeSlide + 1) / deck.slides.length) * 100}%` }}
                    />
                  </div>
                </div>

              </div>

              {/* Course Reorder & Modify Controls (Delete, Duplicate, Reorder, Add) */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-gray-950/20 p-3 rounded-2xl border border-gray-900">
                <div className="flex gap-2">
                  <button 
                    type="button" 
                    onClick={() => moveSlide('up')} 
                    disabled={activeSlide === 0} 
                    className="p-2 rounded-xl bg-gray-900 border border-gray-800 text-gray-400 hover:text-white disabled:opacity-30 disabled:hover:text-gray-400"
                    title="הזז שקופית קודם"
                  >
                    <ArrowRight size={14} />
                  </button>
                  <button 
                    type="button" 
                    onClick={() => moveSlide('down')} 
                    disabled={activeSlide === deck.slides.length - 1} 
                    className="p-2 rounded-xl bg-gray-900 border border-gray-800 text-gray-400 hover:text-white disabled:opacity-30 disabled:hover:text-gray-400"
                    title="הזז שקופית הבא"
                  >
                    <ArrowLeft size={14} />
                  </button>
                  <button 
                    type="button" 
                    onClick={duplicateSlide} 
                    className="flex items-center gap-1 px-3 py-2 rounded-xl bg-gray-900 border border-gray-800 text-xs font-bold text-gray-300 hover:text-white"
                  >
                    <Copy size={13} /> שכפל שקופית
                  </button>
                  <button 
                    type="button" 
                    onClick={deleteActiveSlide} 
                    className="flex items-center gap-1 px-3 py-2 rounded-xl bg-rose-950/20 border border-rose-900/30 text-xs font-bold text-rose-400 hover:bg-rose-950/40"
                  >
                    <Trash2 size={13} /> מחק שקופית
                  </button>
                </div>

                <button 
                  type="button" 
                  onClick={addNewSlide} 
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#00e6ff]/10 border border-[#00e6ff]/20 text-xs font-bold text-[#6ff4ff] hover:bg-[#00e6ff]/20"
                >
                  <Plus size={14} /> שקופית חדשה
                </button>
              </div>

              {/* AI Refinement Toolbar */}
              <div className="bg-gradient-to-l from-gray-950 to-gray-900/60 p-4 rounded-2xl border border-gray-800/80">
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2.5">עריכת שקופית באמצעות בינה מלאכותית (AI)</span>
                <div className="flex flex-wrap gap-2">
                  <button 
                    type="button" 
                    onClick={() => handleRefineSlide('regenerate')} 
                    disabled={isRefining} 
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-cyan-900/40 bg-cyan-950/10 text-xs font-bold text-cyan-300 hover:bg-cyan-950/30 disabled:opacity-40"
                  >
                    🪄 צור מחדש
                  </button>
                  <button 
                    type="button" 
                    onClick={() => handleRefineSlide('shorten')} 
                    disabled={isRefining} 
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-gray-800 bg-gray-900/80 text-xs font-bold text-gray-300 hover:bg-gray-900 disabled:opacity-40"
                  >
                    ✂️ קצר תוכן
                  </button>
                  <button 
                    type="button" 
                    onClick={() => handleRefineSlide('expand')} 
                    disabled={isRefining} 
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-gray-800 bg-gray-900/80 text-xs font-bold text-gray-300 hover:bg-gray-900 disabled:opacity-40"
                  >
                    ➕ הרחב תוכן
                  </button>
                  <button 
                    type="button" 
                    onClick={() => handleRefineSlide('simplify')} 
                    disabled={isRefining} 
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-gray-800 bg-gray-900/80 text-xs font-bold text-gray-300 hover:bg-gray-900 disabled:opacity-40"
                  >
                    💡 פשט ניסוח
                  </button>
                  <button 
                    type="button" 
                    onClick={() => handleRefineSlide('professional')} 
                    disabled={isRefining} 
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-purple-900/30 bg-purple-950/5 text-xs font-bold text-purple-300 hover:bg-purple-950/20 disabled:opacity-40"
                  >
                    👔 סגנון מקצועי
                  </button>
                </div>
              </div>

              {/* Bottom Thumbnail Strip with mock previews */}
              <div className="space-y-2">
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest block">סרגל ניווט שקופיות</span>
                <div className="flex gap-3 overflow-x-auto pb-3 scrollbar-thin" dir="rtl">
                  {deck.slides.map((slide, index) => (
                    <button 
                      key={index} 
                      type="button" 
                      onClick={() => setActiveSlide(index)} 
                      className={`min-w-40 w-40 h-24 rounded-2xl border p-2.5 text-right transition flex flex-col justify-between select-none shrink-0 overflow-hidden relative ${
                        index === activeSlide 
                          ? 'border-[#00e6ff] bg-[#00e6ff]/5 shadow-[0_0_15px_rgba(0,230,255,0.08)]' 
                          : 'border-gray-800 bg-gray-950/40 hover:border-gray-700'
                      }`}
                    >
                      <div className="absolute top-0 left-0 right-0 h-1 bg-[#00e6ff] opacity-10" />
                      <span className="text-[9px] font-black text-gray-500">שקופית {index + 1}</span>
                      <span className="mt-1 block truncate text-xs font-bold text-gray-300 leading-tight">{slide.title}</span>
                      <div className="flex items-center gap-1 text-[8px] text-gray-600 mt-2 truncate">
                        <span>{slide.bulletPoints?.length || 0} נקודות מפתח</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Speaker Notes & Visual suggestions (Collapsible tabs) */}
              <div className="rounded-3xl border border-gray-800 bg-[#0c111d]/50 p-5 backdrop-blur-sm shadow-xl">
                <div className="flex border-b border-gray-800 pb-2 mb-4">
                  <button 
                    type="button" 
                    onClick={() => setActiveTab('notes')} 
                    className={`pb-2 px-4 text-xs font-bold transition-colors border-b-2 -mb-2.5 ${
                      activeTab === 'notes' ? 'border-[#00e6ff] text-[#00e6ff]' : 'border-transparent text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    🎤 הערות מדריך (Speaker Notes)
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setActiveTab('visual')} 
                    className={`pb-2 px-4 text-xs font-bold transition-colors border-b-2 -mb-2.5 ${
                      activeTab === 'visual' ? 'border-[#00e6ff] text-[#00e6ff]' : 'border-transparent text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    🖼️ הצעה ויזואלית (Visual Suggestion)
                  </button>
                </div>

                {activeTab === 'notes' ? (
                  <textarea
                    value={currentSlide.speakerNotes || ''}
                    onChange={(e) => updateSlideField('speakerNotes', e.target.value)}
                    rows={4}
                    className="w-full rounded-2xl border border-gray-800 bg-gray-950/60 p-4 text-xs leading-relaxed text-gray-300 outline-none focus:border-[#00e6ff]/40 transition"
                    placeholder="הקלידו הערות הדרכה או הנחיות קריינות עבור השקופית הזו..."
                  />
                ) : (
                  <textarea
                    value={currentSlide.visualSuggestion || ''}
                    onChange={(e) => updateSlideField('visualSuggestion', e.target.value)}
                    rows={4}
                    className="w-full rounded-2xl border border-gray-800 bg-gray-950/60 p-4 text-xs leading-relaxed text-gray-300 outline-none focus:border-[#00e6ff]/40 transition"
                    placeholder="תארו את האיור הויזואלי המומלץ עבור השקופית הזו..."
                  />
                )}
              </div>

            </div>
          )}
        </section>

        {/* SIDEBAR FORM (RIGHT, 400px wide) */}
        <aside className="h-fit rounded-3xl border border-gray-850 bg-[#0c111d]/90 p-5 shadow-2xl space-y-5 order-1 xl:order-2">
          <div>
            <label className="mb-2 block text-xs font-bold text-gray-300">ערכת עיצוב</label>
            <select value={theme} onChange={(event) => setTheme(event.target.value)} className="w-full rounded-xl border border-gray-800 bg-[#070b14] p-2.5 text-xs text-white outline-none">
              {Object.entries(PRESENTATION_THEMES).map(([id, item]) => <option key={id} value={id}>{item.label}</option>)}
            </select>
          </div>
          
          <div>
            <label className="text-xs font-bold text-gray-300 block mb-2">מה הנושא של המצגת והקורס?</label>
            <textarea 
              value={prompt} 
              onChange={(e) => setPrompt(e.target.value)} 
              rows={3} 
              className="w-full resize-none rounded-2xl border border-gray-800 bg-[#070b14] p-3 text-xs text-white outline-none focus:border-[#00e6ff]/40 transition" 
              placeholder="לדוגמה: זיהוי פישינג והנדסה חברתית" 
            />
          </div>

          {/* Document File Upload placeholder interface */}
          <div>
            <label className="text-xs font-bold text-gray-300 block mb-2">חומר מקור להעלאה <span className="font-normal text-gray-600">(TXT)</span></label>
            <div 
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border border-dashed rounded-2xl p-4 text-center cursor-pointer transition-colors ${
                isDragOver 
                  ? 'border-[#00e6ff] bg-[#00e6ff]/5' 
                  : 'border-gray-800 bg-[#070b14] hover:border-gray-700'
              }`}
            >
              <input 
                type="file" 
                id="file-upload-input" 
                accept=".txt,text/plain"
                className="hidden" 
                onChange={handleFileChange}
              />
              <label htmlFor="file-upload-input" className="cursor-pointer">
                <Upload size={22} className="mx-auto text-gray-500 mb-2" />
                <span className="block text-[11px] font-bold text-gray-400">גררו לכאן קובץ או לחצו לבחירה</span>
                <span className="block text-[9px] text-gray-600 mt-1">קובץ TXT יחיד · עד 1MB</span>
              </label>
            </div>
            {uploadError && (
              <p className="mt-2 text-[10px] font-bold text-amber-400 bg-amber-500/5 border border-amber-500/20 p-2.5 rounded-xl leading-relaxed">
                {uploadError}
              </p>
            )}
          </div>

          <div>
            <label className="text-xs font-bold text-gray-300 block mb-2">חומר מקור מודבק <span className="font-normal text-gray-600">(טקסט חופשי)</span></label>
            <textarea 
              value={sourceText} 
              onChange={(e) => setSourceText(e.target.value)} 
              rows={4} 
              className="w-full resize-none rounded-2xl border border-gray-800 bg-[#070b14] p-3 text-xs leading-relaxed text-gray-300 outline-none focus:border-[#00e6ff]/40 transition" 
              placeholder="הדביקו כאן סיכומים, נהלים או תמלילים כדי שהשקופיות יבוססו עליהם..." 
            />
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="text-[11px] font-bold text-gray-400 block mb-1.5">קהל יעד</label>
              <select value={audience} onChange={(e) => setAudience(e.target.value)} className="w-full rounded-xl border border-gray-800 bg-[#070b14] p-2.5 text-xs text-white outline-none">
                <option>עובדי החברה</option>
                <option>מנהלים</option>
                <option>עובדים חדשים</option>
                <option>צוות טכני</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] font-bold text-gray-400 block mb-1.5">מספר שקופיות</label>
              <select value={slideCount} onChange={(e) => setSlideCount(Number(e.target.value))} className="w-full rounded-xl border border-gray-800 bg-[#070b14] p-2.5 text-xs text-white outline-none">
                {[3, 4, 5, 6, 7, 8, 9, 10, 12, 15, 20].map((count) => (
                  <option key={count} value={count}>{count}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-[10px] font-bold text-gray-500 block mb-1">רמת קושי</label>
              <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="w-full rounded-xl border border-gray-800 bg-[#070b14] p-2 text-[10px] text-white outline-none">
                <option>מתחיל</option>
                <option>בינוני</option>
                <option>מתקדם</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-500 block mb-1">אורך</label>
              <select value={duration} onChange={(e) => setDuration(Number(e.target.value))} className="w-full rounded-xl border border-gray-800 bg-[#070b14] p-2 text-[10px] text-white outline-none">
                <option value="15">15 דק׳</option>
                <option value="30">30 דק׳</option>
                <option value="45">45 דק׳</option>
                <option value="60">60 דק׳</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-500 block mb-1">שפה</label>
              <select value={language} onChange={(e) => setLanguage(e.target.value)} className="w-full rounded-xl border border-gray-800 bg-[#070b14] p-2 text-[10px] text-white outline-none">
                <option>עברית</option>
                <option>English</option>
                <option>العربية</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-300 block mb-2">ציון מעבר למבחן המסכם (%)</label>
            <input 
              type="number"
              min={50}
              max={100}
              value={passScore} 
              onChange={(e) => setPassScore(Number(e.target.value))} 
              className="w-full rounded-xl border border-gray-800 bg-[#070b14] p-2.5 text-xs text-white outline-none focus:border-[#00e6ff]/40 transition" 
            />
          </div>

          <button 
            type="button" 
            onClick={createDeck} 
            disabled={isGenerating || !prompt.trim()} 
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-l from-[#00e6ff] to-[#5ce1e6] px-4 py-3.5 text-sm font-black text-[#001018] shadow-[0_0_25px_rgba(0,230,255,.15)] transition hover:brightness-110 disabled:opacity-50"
          >
            <Sparkles size={16} className={isGenerating ? 'animate-spin' : ''} />
            {isGenerating ? 'בונה את הקורס…' : 'צור קורס חדש באמצעות AI'}
          </button>

          <div className="rounded-2xl border border-emerald-500/15 bg-emerald-500/5 p-3 text-[10px] font-semibold leading-5 text-emerald-300">
            מפתחות ה־AI נשמרים רק בשרת. הדפדפן שולח את נושא הקורס ומקבל תוכן מאומת ללא חשיפת מפתח.
          </div>
          
          <div className="border-t border-gray-850 pt-4 text-center">
            <p className="text-[10px] text-gray-600">
              מנגנון שמירה אוטומטית פעיל · חיבור AI מאובטח בלבד
            </p>
          </div>

        </aside>

      </div>
    </div>
  );
}
