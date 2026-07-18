import test from 'node:test';
import assert from 'node:assert/strict';
import { validateCoursePayload, validateSlidePayload } from '../server/aiValidation.js';

test('validates and sanitizes AI course output before it reaches the client', () => {
  const payload = validateCoursePayload({
    title: 'Secure course',
    slides: [1, 2, 3].map((id) => ({
      id,
      title: `Slide ${id}<script>alert(1)</script>`,
      content: 'Safe content',
      bulletPoints: ['One', 'Two']
    })),
    finalExam: [1, 2, 3].map((id) => ({
      question: `Question ${id}`,
      answers: ['Correct', 'Wrong'],
      correctAnswerIndex: 0
    }))
  }, { expectedSlides: 3 });

  assert.equal(payload.slides.length, 3);
  assert.doesNotMatch(payload.slides[0].title, /script/i);
  assert.equal(payload.finalExam.length, 3);
});

test('rejects empty or structurally invalid AI output', () => {
  assert.throws(() => validateCoursePayload({ title: 'No slides' }), /INVALID_COURSE/);
  assert.throws(() => validateSlidePayload({ content: 'No title' }), /INVALID_SLIDE/);
});
