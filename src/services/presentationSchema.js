export const PRESENTATION_THEMES = {
  dark: { label: 'Dark', canvas: 'from-[#0b1020] via-[#10172b] to-[#080a12]', accent: '#22d3ee' },
  light: { label: 'Light', canvas: 'from-slate-50 via-white to-sky-50', accent: '#2563eb' },
  cyber: { label: 'Cyber', canvas: 'from-[#07131b] via-[#0c1022] to-[#160b2c]', accent: '#00e6ff' },
  corporate: { label: 'Corporate', canvas: 'from-[#122235] via-[#1d3557] to-[#0b1320]', accent: '#60a5fa' },
  education: { label: 'Education', canvas: 'from-[#fff7ed] via-[#fefce8] to-[#eff6ff]', accent: '#ea580c' },
  modern: { label: 'Modern', canvas: 'from-[#18181b] via-[#27272a] to-[#0f172a]', accent: '#a78bfa' }
};

const layouts = ['cover', 'agenda', 'objectives', 'split', 'comparison', 'process', 'timeline', 'chart', 'summary', 'quiz', 'sources'];

export function normalizeDeck(raw = {}, fallback = {}) {
  const slides = Array.isArray(raw.slides) ? raw.slides : [];
  return {
    id: raw.id || `deck-${Date.now()}`,
    title: raw.title || fallback.prompt || 'Untitled presentation',
    subtitle: raw.subtitle || raw.description || '',
    description: raw.description || '',
    theme: raw.theme || fallback.theme || 'cyber',
    language: raw.language || fallback.language || 'עברית',
    learningObjectives: Array.isArray(raw.learningObjectives) ? raw.learningObjectives : [],
    finalExam: raw.finalExam?.questions || raw.finalExam || [],
    slides: slides.map((slide, index) => ({
      id: slide.id || crypto.randomUUID?.() || `slide-${Date.now()}-${index}`,
      type: slide.type || (index === 0 ? 'cover' : index === slides.length - 1 ? 'summary' : 'content'),
      layout: slide.layout || layouts[Math.min(index, layouts.length - 1)] || 'split',
      title: slide.title || `Slide ${index + 1}`,
      subtitle: slide.subtitle || '',
      content: slide.content || slide.paragraphs?.join('\n') || '',
      sections: Array.isArray(slide.sections) ? slide.sections : [],
      bulletPoints: Array.isArray(slide.bulletPoints) ? slide.bulletPoints : [],
      examples: Array.isArray(slide.examples) ? slide.examples : [],
      speakerNotes: slide.speakerNotes || '',
      visualSuggestion: slide.visualSuggestion || '',
      imagePrompt: slide.imagePrompt || slide.visualSuggestion || '',
      chartType: slide.chartType || 'none',
      animation: slide.animation || 'fade-up'
    }))
  };
}
