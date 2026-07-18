import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { createLearningStore } from '../server/learningStore.js';

test('persists progress and scores without duplicate result rows', () => {
  const directory = mkdtempSync(join(tmpdir(), 'shieldx-learning-'));
  const databasePath = join(directory, 'auth.db');
  const db = new DatabaseSync(databasePath);
  db.exec(`
    CREATE TABLE users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      email TEXT NOT NULL
    )
  `);
  const userId = Number(db.prepare(
    'INSERT INTO users (username, password, email) VALUES (?, ?, ?)'
  ).run('learner', 'hash', 'learner@example.com').lastInsertRowid);
  db.close();

  const store = createLearningStore(databasePath);
  const state = {
    progress: {
      completedSubjects: [0],
      completedLessons: [0],
      completedLabs: [0],
      scores: { 0: 92 },
      badges: ['צעד ראשון'],
      xp: 100
    },
    analytics: { videos: { 0: { completed: true } } }
  };
  store.save(userId, state);
  store.save(userId, state);
  assert.equal(store.get(userId).progress.scores[0], 92);
  store.close();

  const verify = new DatabaseSync(databasePath);
  assert.equal(verify.prepare('SELECT count(*) AS total FROM topic_progress').get().total, 1);
  assert.equal(verify.prepare('SELECT count(*) AS total FROM results').get().total, 1);
  assert.equal(verify.prepare('SELECT score FROM results').get().score, 92);
  verify.close();
  rmSync(directory, { recursive: true, force: true });
});
