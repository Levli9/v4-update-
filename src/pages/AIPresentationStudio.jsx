import React, { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Clock3, Pencil, Play, Save, Sparkles, X } from 'lucide-react';
import BackButton from '../components/BackButton';
import { generatePresentation } from '../services/presentationGenerator';

const STORAGE_KEY = 'shieldx_ai_presentation_versions';

const loadVersions = () => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
};

export default function AIPresentationStudio() {
  const [prompt, setPrompt] = useState('זיהוי מתקפת פישינג והדרך הנכונה לדווח עליה');
  const [sourceText, setSourceText] = useState('');
  const [audience, setAudience] = useState('עובדי החברה');
  const [slideCount, setSlideCount] = useState(7);
  const [difficulty, setDifficulty] = useState('בינוני');
  const [duration, setDuration] = useState(30);
  const [language, setLanguage] = useState('עברית');
  const [deck, setDeck] = useState(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPresenting, setIsPresenting] = useState(false);
  const [versions, setVersions] = useState(loadVersions);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!deck) return;
    const timer = window.setTimeout(() => {
      localStorage.setItem('shieldx_ai_presentation_draft', JSON.stringify(deck));
    }, 350);
    return () => window.clearTimeout(timer);
  }, [deck]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (!isPresenting) return;
      if (event.key === 'Escape') setIsPresenting(false);
      if (event.key === 'ArrowLeft') setActiveSlide((value) => Math.min((deck?.slides.length || 1) - 1, value + 1));
      if (event.key === 'ArrowRight') setActiveSlide((value) => Math.max(0, value - 1));
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isPresenting, deck]);

  const citedSources = useMemo(() => {
    if (!deck) return [];
    const ids = new Set(deck.slides[activeSlide]?.bullets.map((item) => item.citation).filter(Boolean));
    return deck.sources.filter((source) => ids.has(source.id));
  }, [deck, activeSlide]);

  const createDeck = async () => {
    if (!prompt.trim()) return;
    setError('');
    setIsGenerating(true);
    try {
      const result = await generatePresentation({ prompt, sourceText, audience, slideCount, difficulty, duration, language });
      setDeck(result);
      setActiveSlide(0);
    } catch (generationError) {
      setError(generationError.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const saveVersion = () => {
    if (!deck) return;
    const version = { ...deck, savedAt: new Date().toISOString(), version: versions.length + 1 };
    const next = [version, ...versions].slice(0, 12);
    setVersions(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const updateSlide = (field, value) => {
    setDeck((current) => ({
      ...current,
      slides: current.slides.map((slide, index) => index === activeSlide ? { ...slide, [field]: value } : slide)
    }));
  };

  const updateBullet = (index, value) => {
    setDeck((current) => ({
      ...current,
      slides: current.slides.map((slide, slideIndex) => slideIndex === activeSlide
        ? { ...slide, bullets: slide.bullets.map((bullet, bulletIndex) => bulletIndex === index ? { ...bullet, text: value } : bullet) }
        : slide)
    }));
  };

  const currentSlide = deck?.slides[activeSlide];

  return (
    <div className="mx-auto max-w-7xl" dir="rtl">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <span className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#00e6ff]/25 bg-[#00e6ff]/8 px-3 py-1 text-xs font-bold text-[#6ff4ff]">
            <Sparkles size={14} /> ShieldX AI
          </span>
          <h1 className="text-3xl font-black text-white">AI Course Generator</h1>
          <p className="mt-2 text-sm text-gray-400">כתבו נושא וקבלו קורס מלא: תוכן, וידאו, מבחנים, מדיה ותעודה.</p>
        </div>
        <BackButton />
      </div>

      <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
        <aside className="h-fit rounded-3xl border border-gray-800 bg-[#0c111d]/90 p-5 shadow-2xl">
          <label className="text-xs font-bold text-gray-300">מה הנושא של המצגת?</label>
          <textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} rows={4} className="mt-2 w-full resize-none rounded-2xl border border-gray-700 bg-[#070b14] p-3 text-sm text-white outline-none transition focus:border-[#00e6ff]" placeholder="לדוגמה: בנה מצגת על זיהוי פישינג לעובדי כספים" />

          <label className="mt-5 block text-xs font-bold text-gray-300">חומר מקור <span className="font-normal text-gray-600">(אופציונלי)</span></label>
          <textarea value={sourceText} onChange={(event) => setSourceText(event.target.value)} rows={7} className="mt-2 w-full resize-none rounded-2xl border border-gray-700 bg-[#070b14] p-3 text-xs leading-6 text-gray-200 outline-none transition focus:border-[#00e6ff]" placeholder="הדביקו כאן מסמך, סיכום, נוהל או תמלול. המצגת תציג הפניות [1], [2] לחומר שלכם." />

          <div className="mt-4 grid grid-cols-2 gap-3">
            <label className="text-[11px] font-bold text-gray-400">קהל יעד
              <select value={audience} onChange={(event) => setAudience(event.target.value)} className="mt-1.5 w-full rounded-xl border border-gray-700 bg-[#070b14] p-2.5 text-xs text-white">
                <option>עובדי החברה</option><option>מנהלים</option><option>עובדים חדשים</option><option>צוות טכני</option>
              </select>
            </label>
            <label className="text-[11px] font-bold text-gray-400">מספר שקופיות
              <select value={slideCount} onChange={(event) => setSlideCount(Number(event.target.value))} className="mt-1.5 w-full rounded-xl border border-gray-700 bg-[#070b14] p-2.5 text-xs text-white">
                {[5, 6, 7, 8, 9, 10, 12].map((count) => <option key={count}>{count}</option>)}
              </select>
            </label>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2">
            <label className="text-[10px] font-bold text-gray-500">רמה<select value={difficulty} onChange={(event) => setDifficulty(event.target.value)} className="mt-1 w-full rounded-xl border border-gray-700 bg-[#070b14] p-2 text-[11px] text-white"><option>מתחיל</option><option>בינוני</option><option>מתקדם</option></select></label>
            <label className="text-[10px] font-bold text-gray-500">אורך<select value={duration} onChange={(event) => setDuration(Number(event.target.value))} className="mt-1 w-full rounded-xl border border-gray-700 bg-[#070b14] p-2 text-[11px] text-white"><option value="15">15 דק׳</option><option value="30">30 דק׳</option><option value="45">45 דק׳</option><option value="60">60 דק׳</option></select></label>
            <label className="text-[10px] font-bold text-gray-500">שפה<select value={language} onChange={(event) => setLanguage(event.target.value)} className="mt-1 w-full rounded-xl border border-gray-700 bg-[#070b14] p-2 text-[11px] text-white"><option>עברית</option><option>English</option><option>العربية</option></select></label>
          </div>

          <button type="button" onClick={createDeck} disabled={isGenerating || !prompt.trim()} className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-l from-[#00e6ff] to-[#5ce1e6] px-4 py-3 text-sm font-black text-[#001018] shadow-[0_0_25px_rgba(0,230,255,.18)] transition hover:brightness-110 disabled:opacity-50">
            <Sparkles size={18} className={isGenerating ? 'animate-spin' : ''} />
            {isGenerating ? 'בונה את הקורס…' : '➕ צור קורס חדש באמצעות AI'}
          </button>
          {error && <p className="mt-3 text-xs font-bold text-rose-400">{error}</p>}
          <p className="mt-3 text-center text-[10px] text-gray-600">שמירה אוטומטית פעילה · אין חשיפת מפתח API בדפדפן</p>

          {versions.length > 0 && <div className="mt-5 border-t border-gray-800 pt-4">
            <p className="mb-2 flex items-center gap-2 text-xs font-bold text-gray-400"><Clock3 size={14} /> היסטוריית גרסאות</p>
            <div className="space-y-2">
              {versions.slice(0, 3).map((version) => <button key={version.savedAt} type="button" onClick={() => { setDeck(version); setActiveSlide(0); }} className="w-full rounded-xl border border-gray-800 bg-gray-900/40 p-2 text-right text-[11px] text-gray-400 hover:border-[#00e6ff]/30">
                גרסה {version.version} · {new Date(version.savedAt).toLocaleString('he-IL')}
              </button>)}
            </div>
          </div>}
        </aside>

        <section className="min-w-0">
          {!deck && !isGenerating && <div className="grid min-h-[600px] place-items-center rounded-3xl border border-dashed border-gray-700 bg-[#0a0d17]/65 p-8 text-center">
            <div><div className="mx-auto grid h-20 w-20 place-items-center rounded-3xl border border-[#00e6ff]/20 bg-[#00e6ff]/8 text-[#00e6ff]"><Sparkles size={36} /></div><h2 className="mt-5 text-xl font-black text-white">המצגת שלך תופיע כאן</h2><p className="mt-2 max-w-md text-sm leading-7 text-gray-500">אפשר להתחיל רק מפרומפט, או להדביק חומר מקור כדי שהשקופיות יהיו מבוססות על התוכן הארגוני שלך.</p></div>
          </div>}

          {isGenerating && <div className="min-h-[600px] rounded-3xl border border-gray-800 bg-[#0a0d17]/75 p-7"><div className="h-7 w-2/5 animate-pulse rounded bg-gray-800" /><div className="mt-8 aspect-video animate-pulse rounded-3xl bg-gradient-to-br from-gray-900 to-gray-800" /><div className="mt-5 flex gap-3">{[1,2,3,4].map((item) => <div key={item} className="h-20 flex-1 animate-pulse rounded-xl bg-gray-900" />)}</div></div>}

          {deck && !isGenerating && <>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-gray-500"><span className="rounded-full border border-emerald-500/20 bg-emerald-500/8 px-2.5 py-1 font-bold text-emerald-400">{deck.mode === 'ai' ? 'AI מחובר' : 'מחולל מקומי'}</span><span>{deck.slides.length} שקופיות</span></div>
              <div className="flex gap-2">
                <button type="button" onClick={saveVersion} className="flex items-center gap-2 rounded-xl border border-gray-700 bg-gray-900 px-3 py-2 text-xs font-bold text-gray-300 hover:border-[#00e6ff]/30"><Save size={15} /> שמור גרסה</button>
                <button type="button" onClick={() => setIsPresenting(true)} className="flex items-center gap-2 rounded-xl border border-[#00e6ff]/30 bg-[#00e6ff]/10 px-3 py-2 text-xs font-bold text-[#6ff4ff]"><Play size={15} /> הצג</button>
              </div>
            </div>

            <SlideCanvas slide={currentSlide} activeSlide={activeSlide} total={deck.slides.length} onTitle={(value) => updateSlide('title', value)} onSubtitle={(value) => updateSlide('subtitle', value)} onBullet={updateBullet} />

            <div className="mt-4 flex gap-3 overflow-x-auto pb-2" dir="rtl">
              {deck.slides.map((slide, index) => <button key={`${slide.title}-${index}`} type="button" onClick={() => setActiveSlide(index)} className={`min-w-36 rounded-xl border p-3 text-right transition ${index === activeSlide ? 'border-[#00e6ff] bg-[#00e6ff]/10' : 'border-gray-800 bg-gray-900/40 hover:border-gray-700'}`}><span className="text-[9px] text-gray-600">{index + 1}</span><span className="mt-1 block truncate text-[11px] font-bold text-gray-300">{slide.title}</span></button>)}
            </div>

            {citedSources.length > 0 && <div className="mt-4 rounded-2xl border border-gray-800 bg-gray-900/35 p-4"><h3 className="text-xs font-black text-gray-300">מקורות בשקופית</h3>{citedSources.map((source) => <p key={source.id} className="mt-2 text-xs leading-6 text-gray-500"><strong className="text-[#00e6ff]">[{source.id}]</strong> {source.text}</p>)}</div>}
            {deck.coursePackage && <section className="mt-5 rounded-3xl border border-purple-500/15 bg-gray-900/45 p-5"><div className="mb-4 flex items-center justify-between"><span className="rounded-full bg-amber-500/10 px-3 py-1 text-[10px] font-black text-amber-400">טיוטה · גרסה {deck.coursePackage.metadata.version}</span><h3 className="text-sm font-black text-white">חבילת הקורס שנוצרה</h3></div><div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{[[`📚 ${deck.coursePackage.modules.length}`, 'פרקי לימוד'], [`🎥 ${deck.coursePackage.videoScript.length}`, 'סצנות וידאו'], [`📝 ${deck.coursePackage.quizzes.length}`, 'סוגי תרגול'], ['🏆 10', 'שאלות מסכמות'], [`🖼️ ${deck.coursePackage.media.imagePrompts.length}`, 'הצעות לתמונות'], ['📊 2', 'גרפים'], ['🎤 פעילה', 'קריינות וכתוביות'], ['📜 מוכנה', 'תעודת סיום']].map(([value, label]) => <div key={label} className="rounded-2xl border border-gray-800 bg-gray-950/45 p-3 text-center"><strong className="block text-sm text-white">{value}</strong><span className="mt-1 block text-[9px] font-bold text-gray-600">{label}</span></div>)}</div><div className="mt-4 flex flex-wrap gap-2">{deck.coursePackage.questionTypes.map((type) => <span key={type} className="rounded-lg border border-purple-500/15 bg-purple-500/5 px-2.5 py-1 text-[9px] font-bold text-purple-300">{type}</span>)}</div></section>}
          </>}
        </section>
      </div>

      {isPresenting && deck && <div className="fixed inset-0 z-[100] grid place-items-center bg-[#03050b] p-3 sm:p-8" dir="rtl">
        <button type="button" onClick={() => setIsPresenting(false)} className="absolute left-5 top-5 z-10 grid h-11 w-11 place-items-center rounded-xl border border-gray-700 bg-gray-900 text-gray-300"><X /></button>
        <div className="w-full max-w-6xl"><SlideCanvas slide={currentSlide} activeSlide={activeSlide} total={deck.slides.length} presenting /><div className="mt-5 flex items-center justify-center gap-4"><button type="button" onClick={() => setActiveSlide((value) => Math.max(0, value - 1))} disabled={activeSlide === 0} className="presentation-nav"><ChevronRight /></button><span className="text-sm font-bold text-gray-500">{activeSlide + 1} / {deck.slides.length}</span><button type="button" onClick={() => setActiveSlide((value) => Math.min(deck.slides.length - 1, value + 1))} disabled={activeSlide === deck.slides.length - 1} className="presentation-nav"><ChevronLeft /></button></div></div>
      </div>}
    </div>
  );
}

function SlideCanvas({ slide, activeSlide, total, onTitle, onSubtitle, onBullet, presenting = false }) {
  if (!slide) return null;
  const editable = !presenting;
  return <div className={`relative aspect-video overflow-hidden rounded-3xl border border-gray-700 bg-[radial-gradient(circle_at_85%_15%,rgba(0,230,255,.12),transparent_35%),linear-gradient(145deg,#0e1626,#070a12)] shadow-2xl ${presenting ? 'max-h-[78vh] w-full' : ''}`} style={{ borderTopColor: slide.accent }}>
    <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full blur-3xl" style={{ backgroundColor: `${slide.accent}18` }} />
    <div className="relative flex h-full flex-col p-[6%]">
      <div className="flex items-start justify-between gap-6">
        <div className="min-w-0 flex-1">
          {editable ? <input value={slide.title} onChange={(event) => onTitle(event.target.value)} className="w-full border-0 bg-transparent text-[clamp(1.15rem,3vw,2.7rem)] font-black text-white outline-none" /> : <h2 className="text-[clamp(1.4rem,4vw,3.4rem)] font-black text-white">{slide.title}</h2>}
          {editable ? <input value={slide.subtitle || ''} onChange={(event) => onSubtitle(event.target.value)} className="mt-2 w-full border-0 bg-transparent text-[clamp(.65rem,1.3vw,1rem)] font-bold outline-none" style={{ color: slide.accent }} /> : <p className="mt-2 text-[clamp(.7rem,1.6vw,1.15rem)] font-bold" style={{ color: slide.accent }}>{slide.subtitle}</p>}
        </div>
        <div className="flex items-center gap-2 text-[clamp(.55rem,1vw,.75rem)] font-black tracking-widest text-gray-600" dir="ltr">SHIELD<span style={{ color: slide.accent }}>X</span></div>
      </div>

      <div className="my-[4%] h-px w-full bg-gradient-to-l from-gray-700 to-transparent" />
      <div className="flex-1 space-y-[2.5%] overflow-hidden">
        {slide.bullets.map((bullet, index) => <div key={index} className="flex items-start gap-3 rounded-xl border border-white/5 bg-black/10 px-[2.5%] py-[1.6%]"><span className="mt-1 grid h-5 w-5 shrink-0 place-items-center rounded-full text-[10px] font-black text-[#061018]" style={{ backgroundColor: slide.accent }}>{slide.type === 'steps' ? index + 1 : '✓'}</span>{editable ? <textarea rows={1} value={bullet.text} onChange={(event) => onBullet(index, event.target.value)} className="min-h-6 w-full resize-none overflow-hidden border-0 bg-transparent text-[clamp(.65rem,1.35vw,1.12rem)] font-semibold leading-relaxed text-gray-200 outline-none" /> : <p className="text-[clamp(.72rem,1.7vw,1.3rem)] font-semibold leading-relaxed text-gray-100">{bullet.text} {bullet.citation && <sup style={{ color: slide.accent }}>[{bullet.citation}]</sup>}</p>}</div>)}
      </div>
      <div className="mt-auto flex items-center justify-between pt-4 text-[10px] text-gray-600"><span>{activeSlide + 1} / {total}</span><span className="flex items-center gap-1"><Pencil size={10} /> {presenting ? 'מצב הצגה' : 'לחצו על טקסט כדי לערוך'}</span></div>
    </div>
  </div>;
}
