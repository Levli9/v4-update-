import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeDeck } from '../src/services/presentationSchema.js';

test('normalizes an incomplete AI response into an editable deck', () => {
  const deck = normalizeDeck({ slides: [{ title: 'Hello', bulletPoints: ['One'] }] }, { prompt: 'Topic', theme: 'modern' });
  assert.equal(deck.title, 'Topic');
  assert.equal(deck.theme, 'modern');
  assert.equal(deck.slides[0].layout, 'cover');
  assert.equal(deck.slides[0].animation, 'fade-up');
  assert.deepEqual(deck.slides[0].bulletPoints, ['One']);
});
