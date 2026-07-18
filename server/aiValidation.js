const cleanText = (value, maxLength) => String(value ?? '')
  .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '')
  .replace(/<\s*\/?\s*(?:script|iframe|object|embed|link|meta)\b[^>]*>/gi, '')
  .trim()
  .slice(0, maxLength);

const cleanTextArray = (value, { maxItems, maxLength }) => (
  Array.isArray(value)
    ? value.slice(0, maxItems).map((item) => cleanText(item?.text ?? item, maxLength)).filter(Boolean)
    : []
);

const validateQuestion = (question, index) => {
  const answers = cleanTextArray(question?.answers || question?.options, { maxItems: 6, maxLength: 300 });
  const correctAnswerIndex = Number(question?.correctAnswerIndex);
  if (!cleanText(question?.question, 600) || answers.length < 2) return null;
  return {
    question: cleanText(question.question, 600),
    answers,
    correctAnswerIndex: Number.isInteger(correctAnswerIndex) && correctAnswerIndex >= 0 && correctAnswerIndex < answers.length
      ? correctAnswerIndex
      : 0,
    explanation: cleanText(question?.explanation, 1200)
  };
};

export const validateSlidePayload = (slide, index = 0) => {
  if (!slide || typeof slide !== 'object' || Array.isArray(slide)) {
    throw new Error('INVALID_SLIDE');
  }
  const title = cleanText(slide.title, 180);
  if (!title) throw new Error('INVALID_SLIDE');
  return {
    id: slide.id || index + 1,
    type: cleanText(slide.type, 40) || 'content',
    layout: cleanText(slide.layout, 40) || 'split',
    title,
    subtitle: cleanText(slide.subtitle, 280),
    content: cleanText(slide.content, 4000),
    sections: Array.isArray(slide.sections)
      ? slide.sections.slice(0, 8).map((section) => ({
        title: cleanText(section?.title, 180),
        content: cleanText(section?.content, 1200)
      })).filter((section) => section.title || section.content)
      : [],
    bulletPoints: cleanTextArray(slide.bulletPoints, { maxItems: 12, maxLength: 500 }),
    paragraphs: cleanTextArray(slide.paragraphs, { maxItems: 8, maxLength: 1600 }),
    examples: cleanTextArray(slide.examples, { maxItems: 8, maxLength: 1200 }),
    speakerNotes: cleanText(slide.speakerNotes, 4000),
    visualSuggestion: cleanText(slide.visualSuggestion, 1200),
    imagePrompt: cleanText(slide.imagePrompt, 1200),
    chartType: cleanText(slide.chartType, 40) || 'none',
    animation: cleanText(slide.animation, 40) || 'fade-up'
  };
};

export const validateCoursePayload = (payload, { expectedSlides = 7 } = {}) => {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new Error('INVALID_COURSE');
  }
  const title = cleanText(payload.title, 220);
  const rawSlides = Array.isArray(payload.slides) ? payload.slides : [];
  const slides = rawSlides.slice(0, 20).map(validateSlidePayload);
  if (!title || slides.length < Math.min(3, expectedSlides)) throw new Error('INVALID_COURSE');

  const rawQuestions = Array.isArray(payload.finalExam)
    ? payload.finalExam
    : Array.isArray(payload.finalExam?.questions)
      ? payload.finalExam.questions
      : [];
  const finalExam = rawQuestions.slice(0, 20).map(validateQuestion).filter(Boolean);
  if (finalExam.length < 3) throw new Error('INVALID_COURSE');

  return {
    title,
    subtitle: cleanText(payload.subtitle, 300),
    description: cleanText(payload.description, 1600),
    learningObjectives: cleanTextArray(payload.learningObjectives, { maxItems: 12, maxLength: 500 }),
    slides,
    finalExam
  };
};
