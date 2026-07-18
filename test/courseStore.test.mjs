import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { createCourseStore } from '../server/courseStore.js';

test('course drafts and publishing enforce ownership and persist safely', () => {
  const directory = mkdtempSync(join(tmpdir(), 'shieldx-courses-'));
  const databasePath = join(directory, 'auth.db');
  const db = new DatabaseSync(databasePath);
  db.exec(`
    CREATE TABLE users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      email TEXT NOT NULL
    );
    INSERT INTO users (username, password, email) VALUES ('owner', 'hash', 'owner@example.com');
    INSERT INTO users (username, password, email) VALUES ('other', 'hash', 'other@example.com');
  `);
  db.close();

  const store = createCourseStore(databasePath);
  const course = {
    id: 'course-1',
    title: 'Security awareness',
    slides: [{ title: 'Introduction' }],
    finalExam: [{ question: 'Question', answers: ['A', 'B'], correctAnswerIndex: 0 }]
  };
  assert.equal(store.save({ id: 1, role: 'manager' }, course, 'draft').course.status, 'draft');
  assert.equal(store.save({ id: 2, role: 'manager' }, course, 'published').forbidden, true);
  assert.equal(store.save({ id: 1, role: 'manager' }, course, 'published').course.status, 'published');
  assert.equal(store.listPublished().length, 1);
  assert.equal(store.listPublished()[0].finalExam[0].correctAnswerIndex, undefined);
  assert.deepEqual(
    store.gradePublishedQuiz(course.id, [{ questionIndex: 0, answer: 0 }]),
    { score: 100, correctCount: 1, total: 1, passed: true }
  );
  assert.equal(store.remove({ id: 2, role: 'manager' }, course.id).forbidden, true);
  assert.equal(store.remove({ id: 99, role: 'admin' }, course.id).success, true);
  assert.equal(store.listPublished().length, 0);

  store.close();
  rmSync(directory, { recursive: true, force: true });
});
