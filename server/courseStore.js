import { DatabaseSync } from 'node:sqlite';

const MAX_COURSE_BYTES = 500_000;

const safeCourse = (course = {}) => {
  if (!course || typeof course !== 'object' || Array.isArray(course)) throw new Error('INVALID_COURSE');
  const id = String(course.id || '').trim().slice(0, 120);
  const title = String(course.title || '').trim().slice(0, 220);
  const slides = Array.isArray(course.slides) ? course.slides.slice(0, 100) : [];
  const finalExam = Array.isArray(course.finalExam) ? course.finalExam.slice(0, 100) : [];
  if (!id || !title) throw new Error('INVALID_COURSE');
  const normalized = { ...course, id, title, slides, finalExam };
  const serialized = JSON.stringify(normalized);
  if (Buffer.byteLength(serialized, 'utf8') > MAX_COURSE_BYTES) throw new Error('COURSE_TOO_LARGE');
  return { normalized, serialized };
};

const mapRow = (row) => {
  try {
    return {
      ...JSON.parse(row.data_json),
      id: row.id,
      title: row.title,
      status: row.status,
      ownerUserId: Number(row.owner_user_id),
      createdAt: new Date(Number(row.created_at)).toISOString(),
      updatedAt: new Date(Number(row.updated_at)).toISOString()
    };
  } catch {
    return null;
  }
};

const hideAssessmentAnswers = (course) => ({
  ...course,
  finalExam: (course.finalExam || []).map((question, questionIndex) => ({
    questionIndex,
    question: question.question,
    answers: question.answers || question.options || []
  }))
});

export const createCourseStore = (databasePath) => {
  const db = new DatabaseSync(databasePath);
  db.exec('PRAGMA foreign_keys = ON');
  db.exec('PRAGMA busy_timeout = 5000');
  db.exec(`
    CREATE TABLE IF NOT EXISTS courses (
      id TEXT PRIMARY KEY,
      owner_user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('draft', 'published')),
      data_json TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      FOREIGN KEY(owner_user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_courses_status ON courses(status);
    CREATE INDEX IF NOT EXISTS idx_courses_owner ON courses(owner_user_id);
  `);

  return {
    listPublished() {
      return db.prepare("SELECT * FROM courses WHERE status = 'published' ORDER BY updated_at DESC")
        .all().map(mapRow).filter(Boolean).map(hideAssessmentAnswers);
    },

    listManaged(actor) {
      const rows = actor.role === 'admin'
        ? db.prepare('SELECT * FROM courses ORDER BY updated_at DESC').all()
        : db.prepare('SELECT * FROM courses WHERE owner_user_id = ? ORDER BY updated_at DESC').all(actor.id);
      return rows.map(mapRow).filter(Boolean);
    },

    save(actor, course, status) {
      const { normalized, serialized } = safeCourse(course);
      if (!['draft', 'published'].includes(status)) throw new Error('INVALID_STATUS');
      if (status === 'published' && (normalized.slides.length === 0 || normalized.finalExam.length === 0)) {
        throw new Error('INCOMPLETE_COURSE');
      }

      const existing = db.prepare('SELECT owner_user_id FROM courses WHERE id = ?').get(normalized.id);
      if (existing && actor.role !== 'admin' && Number(existing.owner_user_id) !== Number(actor.id)) {
        return { forbidden: true };
      }
      const now = Date.now();
      db.prepare(`
        INSERT INTO courses (id, owner_user_id, title, status, data_json, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          title = excluded.title,
          status = excluded.status,
          data_json = excluded.data_json,
          updated_at = excluded.updated_at
      `).run(normalized.id, actor.id, normalized.title, status, serialized, now, now);
      return { course: mapRow(db.prepare('SELECT * FROM courses WHERE id = ?').get(normalized.id)) };
    },

    remove(actor, id) {
      const existing = db.prepare('SELECT owner_user_id FROM courses WHERE id = ?').get(id);
      if (!existing) return { notFound: true };
      if (actor.role !== 'admin' && Number(existing.owner_user_id) !== Number(actor.id)) {
        return { forbidden: true };
      }
      db.prepare('DELETE FROM courses WHERE id = ?').run(id);
      return { success: true };
    },

    gradePublishedQuiz(courseId, submittedAnswers) {
      const course = mapRow(db.prepare(
        "SELECT * FROM courses WHERE id = ? AND status = 'published' LIMIT 1"
      ).get(courseId));
      if (!course) return { notFound: true };

      const questions = Array.isArray(course.finalExam) ? course.finalExam : [];
      if (questions.length === 0) return { invalid: true };
      const submittedByIndex = new Map(
        (Array.isArray(submittedAnswers) ? submittedAnswers : [])
          .filter((entry) => Number.isInteger(entry?.questionIndex) && Number.isInteger(entry?.answer))
          .slice(0, questions.length)
          .map((entry) => [entry.questionIndex, entry.answer])
      );
      const correctCount = questions.reduce((total, question, questionIndex) => (
        total + (submittedByIndex.get(questionIndex) === Number(question.correctAnswerIndex) ? 1 : 0)
      ), 0);
      const score = Math.round((correctCount / questions.length) * 100);
      return {
        score,
        correctCount,
        total: questions.length,
        passed: score >= 80
      };
    },

    close() {
      db.close();
    }
  };
};
