import test from 'node:test';
import assert from 'node:assert/strict';
import { getCertificationReadiness } from '../src/data/finalExamData.js';

const subjects = [
  { id: 10, videoUrl: '/video.mp4', simulations: [{}] },
  { id: 'custom-1', videoUrl: '', simulations: [] }
];

test('final exam unlock requires every applicable learning activity', () => {
  const progress = {
    completedSubjects: [10, 'custom-1'],
    completedLessons: [10, 'custom-1'],
    completedLabs: [10],
    scores: { 10: 90, 'custom-1': 88 }
  };
  const analytics = { videos: { 10: { completed: true } } };
  assert.equal(getCertificationReadiness(progress, analytics, subjects).unlocked, true);

  assert.equal(getCertificationReadiness({
    ...progress,
    scores: { ...progress.scores, 'custom-1': 79 }
  }, analytics, subjects).unlocked, false);
  assert.equal(getCertificationReadiness(progress, { videos: {} }, subjects).unlocked, false);
});
