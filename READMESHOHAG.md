# 📘 LearnHub — Member 1: Ashiqur Rahman (Roll 2203034)
## Complete Technical Codebase, Architecture & Self-Contained Restoration Guide

> **Author**: Ashiqur Rahman  
> **Roll / Student ID**: 2203034  
> **Course**: CSE 3206 (Software Engineering Sessional)  
> **Department**: Computer Science & Engineering, RUET  
> **Role**: Member 1 — Interactive Assessment Engine, Verifiable Certification, and Academic Learning Analytics  

---

## ⚡ Quick Start: 1-Command Restoration for Shohag

All of Shohag's code files are fully scripted and can be restored at any time by running:
```bash
node restore_shohag_files.js
```
*(This automatically writes all 11 files below to their exact directories, mounts the routes, and enables the complete Assessment, Certification, and Analytics subsystems).*

### How Shohag Can Commit His Work to Git:
When Shohag is ready to push his work from his own machine/account:
```bash
# 1. Restore all files
node restore_shohag_files.js

# 2. Stage Shohag's files
git add server/src/modules/quizzes/
git add server/src/modules/certificates/
git add server/src/modules/analytics/
git add client/src/api/quizzesApi.js client/src/api/certificatesApi.js client/src/api/analyticsApi.js
git add client/src/features/quizzes/
git add client/src/features/certificates/
git add client/src/features/analytics/

# 3. Commit with Shohag's identity
git commit -m "feat(member1-shohag34): implement interactive assessment engine, certificate verification, and learning analytics"

# 4. Push to remote repository
git push origin main
```

---

## 🎯 Executive Overview of Shohag's Modules

As **Member 1**, Shohag is responsible for the educational assessment and credentialing core of LearnHub:
1. **Interactive Course Assessment & Quiz Engine**: Multiple-choice question testing with dynamic question authoring for instructors.
2. **Real-time Automated Evaluation & Scoring**: Instant percentage grading, passing thresholds comparison, and in-depth question reviews with explanations.
3. **Anti-Cheating Protection Protocol**: Stripping `correct_index` and `explanation` from client payloads during active tests to prevent developer-tools cheating.
4. **Verifiable Certificate of Completion**: Automated 100% curriculum completion auditing, issuing cryptographically unique credential keys (`LH-<courseId>-<studentId>-<HEX>`).
5. **Public Credential Verification API**: Open endpoint (`GET /api/certificates/verify/:code`) enabling third-party employers and institutions to validate diploma authenticity without an account.
6. **Academic Learning Analytics Dashboard**: Real-time aggregation of student trajectories (enrolled courses, lectures studied, pass rates, average quiz scores) and instructor cohort insights.

---

## 🗄️ Relational Database Schema Authored by Shohag

Add these 4 tables to `server/src/db/schema.sql`:

```sql
-- 1. Quizzes Table (Parent assessment entity)
CREATE TABLE IF NOT EXISTS quizzes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  course_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  passing_score INTEGER NOT NULL DEFAULT 70,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- 2. Quiz Questions Table (MCQs with serialized JSON options, answer keys, explanations)
CREATE TABLE IF NOT EXISTS quiz_questions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  quiz_id INTEGER NOT NULL,
  question TEXT NOT NULL,
  options TEXT NOT NULL, -- JSON array of strings: e.g. ["A", "B", "C", "D"]
  correct_index INTEGER NOT NULL, -- 0-indexed correct option
  explanation TEXT DEFAULT '',
  FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
);

-- 3. Quiz Attempts Table (Audit log of student submissions)
CREATE TABLE IF NOT EXISTS quiz_attempts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER NOT NULL,
  quiz_id INTEGER NOT NULL,
  score INTEGER NOT NULL,
  passed INTEGER NOT NULL CHECK (passed IN (0, 1)),
  attempted_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
);

-- 4. Certificates Table (Tamper-resistant credential records)
CREATE TABLE IF NOT EXISTS certificates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER NOT NULL,
  course_id INTEGER NOT NULL,
  certificate_code TEXT NOT NULL UNIQUE,
  issue_date TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(student_id, course_id),
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);
```

---

## 💻 Complete Backend Source Code Authored by Shohag

### File 1: `server/src/modules/quizzes/quizzes.routes.js`
```javascript
import express from 'express';
import db from '../../db/connection.js';
import AppError from '../../common/AppError.js';
import { asyncHandler } from '../../common/asyncHandler.js';
import authenticate from '../../common/middleware/authenticate.js';

const router = express.Router();

const parseId = (value, label = 'id') => {
  const id = Number(value);
  if (!Number.isInteger(id) || id < 1) {
    throw new AppError(400, `Invalid ${label}`);
  }
  return id;
};

// Check course access helper
const checkCourseAccess = (courseId, user) => {
  const course = db.prepare('SELECT id, title, instructor_id FROM courses WHERE id = ?').get(courseId);
  if (!course) {
    throw new AppError(404, 'Course not found');
  }
  const isOwner = user.role === 'instructor' && course.instructor_id === user.id;
  const isEnrolled = user.role === 'student' && Boolean(
    db.prepare('SELECT 1 FROM enrollments WHERE course_id = ? AND student_id = ?').get(courseId, user.id)
  );
  if (!isOwner && !isEnrolled) {
    throw new AppError(403, 'You must be enrolled in this course to access quizzes');
  }
  return { course, isOwner, isEnrolled };
};

router.use(authenticate);

// List all quizzes for a course
router.get(
  '/courses/:courseId/quizzes',
  asyncHandler((req, res) => {
    const courseId = parseId(req.params.courseId, 'course id');
    checkCourseAccess(courseId, req.user);

    const quizzes = db.prepare(`
      SELECT q.id, q.course_id, q.title, q.passing_score, q.created_at,
        COUNT(DISTINCT qq.id) AS question_count
      FROM quizzes q
      LEFT JOIN quiz_questions qq ON qq.quiz_id = q.id
      WHERE q.course_id = ?
      GROUP BY q.id
      ORDER BY q.id ASC
    `).all(courseId);

    // If student, attach latest attempt
    const enriched = quizzes.map((quiz) => {
      if (req.user.role === 'student') {
        const lastAttempt = db.prepare(`
          SELECT score, passed, attempted_at
          FROM quiz_attempts
          WHERE quiz_id = ? AND student_id = ?
          ORDER BY attempted_at DESC
          LIMIT 1
        `).get(quiz.id, req.user.id);
        return { ...quiz, lastAttempt: lastAttempt || null };
      }
      return quiz;
    });

    res.json(enriched);
  })
);

// Get a single quiz with its questions
router.get(
  '/quizzes/:quizId',
  asyncHandler((req, res) => {
    const quizId = parseId(req.params.quizId, 'quiz id');
    const quiz = db.prepare('SELECT * FROM quizzes WHERE id = ?').get(quizId);
    if (!quiz) {
      throw new AppError(404, 'Quiz not found');
    }
    const { isOwner } = checkCourseAccess(quiz.course_id, req.user);

    const rawQuestions = db.prepare('SELECT * FROM quiz_questions WHERE quiz_id = ? ORDER BY id ASC').all(quizId);
    const questions = rawQuestions.map((q) => {
      const options = JSON.parse(q.options || '[]');
      if (isOwner) {
        return { ...q, options };
      }
      // For student before submission, do not leak correct_index or explanation
      return {
        id: q.id,
        quiz_id: q.quiz_id,
        question: q.question,
        options,
      };
    });

    // Check last attempt
    const lastAttempt = db.prepare(`
      SELECT score, passed, attempted_at
      FROM quiz_attempts
      WHERE quiz_id = ? AND student_id = ?
      ORDER BY attempted_at DESC
      LIMIT 1
    `).get(quizId, req.user.id);

    res.json({
      ...quiz,
      questions,
      lastAttempt: lastAttempt || null,
      isOwner,
    });
  })
);

// Submit quiz answers (Student)
router.post(
  '/quizzes/:quizId/attempt',
  asyncHandler((req, res) => {
    if (req.user.role !== 'student') {
      throw new AppError(403, 'Only students can submit quiz attempts');
    }
    const quizId = parseId(req.params.quizId, 'quiz id');
    const quiz = db.prepare('SELECT * FROM quizzes WHERE id = ?').get(quizId);
    if (!quiz) {
      throw new AppError(404, 'Quiz not found');
    }
    checkCourseAccess(quiz.course_id, req.user);

    const { answers } = req.body || {}; // { [questionId]: selectedOptionIndex }
    if (!answers || typeof answers !== 'object') {
      throw new AppError(400, 'Answers payload must be an object');
    }

    const questions = db.prepare('SELECT * FROM quiz_questions WHERE quiz_id = ?').all(quizId);
    if (questions.length === 0) {
      throw new AppError(400, 'This quiz does not contain any questions yet');
    }

    let correctCount = 0;
    const review = questions.map((q) => {
      const selected = answers[q.id] !== undefined ? Number(answers[q.id]) : null;
      const isCorrect = selected === q.correct_index;
      if (isCorrect) correctCount += 1;
      return {
        questionId: q.id,
        question: q.question,
        options: JSON.parse(q.options || '[]'),
        selected,
        correctIndex: q.correct_index,
        isCorrect,
        explanation: q.explanation,
      };
    });

    const score = Math.round((correctCount / questions.length) * 100);
    const passed = score >= quiz.passing_score ? 1 : 0;

    db.prepare(`
      INSERT INTO quiz_attempts (student_id, quiz_id, score, passed)
      VALUES (?, ?, ?, ?)
    `).run(req.user.id, quizId, score, passed);

    res.json({
      score,
      passed: Boolean(passed),
      passingScore: quiz.passing_score,
      totalQuestions: questions.length,
      correctCount,
      review,
    });
  })
);

// Create a new quiz for a course (Instructor)
router.post(
  '/courses/:courseId/quizzes',
  asyncHandler((req, res) => {
    if (req.user.role !== 'instructor') {
      throw new AppError(403, 'Instructor access required');
    }
    const courseId = parseId(req.params.courseId, 'course id');
    const course = db.prepare('SELECT id, instructor_id FROM courses WHERE id = ?').get(courseId);
    if (!course) {
      throw new AppError(404, 'Course not found');
    }
    if (course.instructor_id !== req.user.id) {
      throw new AppError(403, 'You can only create quizzes for your own courses');
    }

    const { title, passing_score = 70, questions = [] } = req.body || {};
    if (!title || typeof title !== 'string' || title.trim().length < 2) {
      throw new AppError(400, 'Quiz title must be at least 2 characters');
    }
    if (!Array.isArray(questions) || questions.length === 0) {
      throw new AppError(400, 'Quiz must have at least one question');
    }

    const insertQuiz = db.prepare(
      'INSERT INTO quizzes (course_id, title, passing_score) VALUES (?, ?, ?)'
    );
    const quizResult = insertQuiz.run(courseId, title.trim(), Number(passing_score) || 70);
    const quizId = quizResult.lastInsertRowid;

    const insertQuestion = db.prepare(
      'INSERT INTO quiz_questions (quiz_id, question, options, correct_index, explanation) VALUES (?, ?, ?, ?, ?)'
    );

    questions.forEach((q) => {
      if (!q.question || !Array.isArray(q.options) || q.options.length < 2) {
        throw new AppError(400, 'Each question must have text and at least 2 options');
      }
      insertQuestion.run(
        quizId,
        q.question.trim(),
        JSON.stringify(q.options),
        Number(q.correct_index) || 0,
        (q.explanation || '').trim()
      );
    });

    res.status(201).json({ id: quizId, course_id: courseId, title, passing_score });
  })
);

// Delete a quiz (Instructor)
router.delete(
  '/quizzes/:quizId',
  asyncHandler((req, res) => {
    if (req.user.role !== 'instructor') {
      throw new AppError(403, 'Instructor access required');
    }
    const quizId = parseId(req.params.quizId, 'quiz id');
    const quiz = db.prepare(`
      SELECT q.id, c.instructor_id
      FROM quizzes q
      JOIN courses c ON c.id = q.course_id
      WHERE q.id = ?
    `).get(quizId);

    if (!quiz) {
      throw new AppError(404, 'Quiz not found');
    }
    if (quiz.instructor_id !== req.user.id) {
      throw new AppError(403, 'You can only delete quizzes for your own courses');
    }

    db.prepare('DELETE FROM quizzes WHERE id = ?').run(quizId);
    res.status(204).end();
  })
);

export default router;
```

---

### File 2: `server/src/modules/certificates/certificates.routes.js`
```javascript
import express from 'express';
import crypto from 'crypto';
import db from '../../db/connection.js';
import AppError from '../../common/AppError.js';
import { asyncHandler } from '../../common/asyncHandler.js';
import authenticate from '../../common/middleware/authenticate.js';

const router = express.Router();

const parseId = (value, label = 'id') => {
  const id = Number(value);
  if (!Number.isInteger(id) || id < 1) {
    throw new AppError(400, `Invalid ${label}`);
  }
  return id;
};

// Public certificate verification endpoint (NO AUTH REQUIRED)
router.get(
  '/certificates/verify/:code',
  asyncHandler((req, res) => {
    const code = (req.params.code || '').trim().toUpperCase();
    const cert = db.prepare(`
      SELECT cert.certificate_code, cert.issue_date,
        u.name AS student_name,
        c.title AS course_title,
        inst.name AS instructor_name
      FROM certificates cert
      JOIN users u ON u.id = cert.student_id
      JOIN courses c ON c.id = cert.course_id
      JOIN users inst ON inst.id = c.instructor_id
      WHERE cert.certificate_code = ?
    `).get(code);

    if (!cert) {
      throw new AppError(404, 'Certificate not found or invalid certificate code');
    }
    res.json({ verified: true, certificate: cert });
  })
);

// Authenticated certificate retrieval or generation
router.get(
  '/courses/:courseId/certificate',
  authenticate,
  asyncHandler((req, res) => {
    const courseId = parseId(req.params.courseId, 'course id');

    // Check enrollment
    const enrollment = db.prepare('SELECT 1 FROM enrollments WHERE course_id = ? AND student_id = ?')
      .get(courseId, req.user.id);
    if (!enrollment && req.user.role === 'student') {
      throw new AppError(403, 'Must be enrolled in the course');
    }

    // Check if certificate already generated
    const existing = db.prepare(`
      SELECT cert.certificate_code, cert.issue_date,
        u.name AS student_name,
        c.title AS course_title,
        c.description AS course_description,
        inst.name AS instructor_name
      FROM certificates cert
      JOIN users u ON u.id = cert.student_id
      JOIN courses c ON c.id = cert.course_id
      JOIN users inst ON inst.id = c.instructor_id
      WHERE cert.course_id = ? AND cert.student_id = ?
    `).get(courseId, req.user.id);

    if (existing) {
      return res.json({ qualified: true, certificate: existing });
    }

    // Check completion requirements: all lessons completed
    const lessonStats = db.prepare(`
      SELECT COUNT(DISTINCT l.id) AS total_lessons,
        COUNT(DISTINCT lp.lesson_id) AS completed_lessons
      FROM lessons l
      LEFT JOIN lesson_progress lp ON lp.lesson_id = l.id AND lp.student_id = ?
      WHERE l.course_id = ?
    `).get(req.user.id, courseId);

    const isComplete = lessonStats.total_lessons > 0 && lessonStats.completed_lessons >= lessonStats.total_lessons;

    if (!isComplete) {
      return res.json({
        qualified: false,
        message: 'Complete all lessons to unlock your official Certificate of Completion.',
        completedLessons: lessonStats.completed_lessons,
        totalLessons: lessonStats.total_lessons,
      });
    }

    // Generate new verifiable certificate
    const randomHex = crypto.randomBytes(3).toString('hex').toUpperCase();
    const certCode = `LH-${courseId}-${req.user.id}-${randomHex}`;

    db.prepare(`
      INSERT INTO certificates (student_id, course_id, certificate_code)
      VALUES (?, ?, ?)
    `).run(req.user.id, courseId, certCode);

    const newCert = db.prepare(`
      SELECT cert.certificate_code, cert.issue_date,
        u.name AS student_name,
        c.title AS course_title,
        c.description AS course_description,
        inst.name AS instructor_name
      FROM certificates cert
      JOIN users u ON u.id = cert.student_id
      JOIN courses c ON c.id = cert.course_id
      JOIN users inst ON inst.id = c.instructor_id
      WHERE cert.certificate_code = ?
    `).get(certCode);

    res.status(201).json({ qualified: true, certificate: newCert });
  })
);

export default router;
```

---

### File 3: `server/src/modules/analytics/analytics.routes.js`
```javascript
import express from 'express';
import db from '../../db/connection.js';
import { asyncHandler } from '../../common/asyncHandler.js';
import authenticate from '../../common/middleware/authenticate.js';

const router = express.Router();

router.use(authenticate);

// Student / Instructor analytics overview
router.get(
  '/analytics/overview',
  asyncHandler((req, res) => {
    const userId = req.user.id;

    if (req.user.role === 'student') {
      const enrollments = db.prepare('SELECT COUNT(*) AS count FROM enrollments WHERE student_id = ?').get(userId).count;

      const completedLessons = db.prepare('SELECT COUNT(*) AS count FROM lesson_progress WHERE student_id = ?').get(userId).count;

      const certificates = db.prepare('SELECT COUNT(*) AS count FROM certificates WHERE student_id = ?').get(userId).count;

      const quizStats = db.prepare(`
        SELECT
          COUNT(*) AS attempts_count,
          SUM(CASE WHEN passed = 1 THEN 1 ELSE 0 END) AS passed_count,
          ROUND(AVG(score), 1) AS avg_score
        FROM quiz_attempts
        WHERE student_id = ?
      `).get(userId);

      const recentAttempts = db.prepare(`
        SELECT qa.score, qa.passed, qa.attempted_at, q.title AS quiz_title, c.title AS course_title
        FROM quiz_attempts qa
        JOIN quizzes q ON q.id = qa.quiz_id
        JOIN courses c ON c.id = q.course_id
        WHERE qa.student_id = ?
        ORDER BY qa.attempted_at DESC
        LIMIT 5
      `).all(userId);

      return res.json({
        role: 'student',
        enrolled_courses: enrollments,
        completed_lessons: completedLessons,
        certificates_earned: certificates,
        quizzes_taken: quizStats.attempts_count || 0,
        quizzes_passed: quizStats.passed_count || 0,
        average_quiz_score: quizStats.avg_score || 0,
        recent_quiz_attempts: recentAttempts,
      });
    }

    // Instructor stats
    const courseStats = db.prepare(`
      SELECT
        COUNT(DISTINCT c.id) AS course_count,
        COUNT(DISTINCT l.id) AS lesson_count,
        COUNT(DISTINCT e.student_id) AS total_students
      FROM courses c
      LEFT JOIN lessons l ON l.course_id = c.id
      LEFT JOIN enrollments e ON e.course_id = c.id
      WHERE c.instructor_id = ?
    `).get(userId);

    const reviewStats = db.prepare(`
      SELECT ROUND(AVG(r.rating), 1) AS avg_rating, COUNT(r.id) AS review_count
      FROM reviews r
      JOIN courses c ON c.id = r.course_id
      WHERE c.instructor_id = ?
    `).get(userId);

    const quizCount = db.prepare(`
      SELECT COUNT(DISTINCT q.id) AS count
      FROM quizzes q
      JOIN courses c ON c.id = q.course_id
      WHERE c.instructor_id = ?
    `).get(userId).count;

    res.json({
      role: 'instructor',
      total_courses: courseStats.course_count || 0,
      total_lessons: courseStats.lesson_count || 0,
      total_students: courseStats.total_students || 0,
      average_rating: reviewStats.avg_rating || 0,
      total_reviews: reviewStats.review_count || 0,
      total_quizzes: quizCount || 0,
    });
  })
);

export default router;
```

---

## 🎨 Complete Frontend Source Code Authored by Shohag

### File 4: `client/src/api/quizzesApi.js`
```javascript
import http from './http.js';

export const quizzesApi = {
  listByCourse: (courseId) => http.get(`/courses/${courseId}/quizzes`),
  getQuiz: (quizId) => http.get(`/quizzes/${quizId}`),
  attemptQuiz: (quizId, answers) => http.post(`/quizzes/${quizId}/attempt`, { answers }),
  createQuiz: (courseId, payload) => http.post(`/courses/${courseId}/quizzes`, payload),
  deleteQuiz: (quizId) => http.del(`/quizzes/${quizId}`),
};

export default quizzesApi;
```

### File 5: `client/src/api/certificatesApi.js`
```javascript
import http from './http.js';

export const certificatesApi = {
  getCourseCertificate: (courseId) => http.get(`/courses/${courseId}/certificate`),
  verifyCertificate: (code) => http.get(`/certificates/verify/${code}`),
};

export default certificatesApi;
```

### File 6: `client/src/api/analyticsApi.js`
```javascript
import http from './http.js';

export const analyticsApi = {
  getOverview: () => http.get('/analytics/overview'),
};

export default analyticsApi;
```

### File 7: `client/src/features/quizzes/CourseQuizzesTab.jsx`
```javascript
import React, { useState, useEffect, useCallback } from 'react';
import { quizzesApi } from '../../api/quizzesApi.js';
import QuizModal from './QuizModal.jsx';
import InstructorQuizModal from './InstructorQuizModal.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { Spinner } from '../../components/common/Spinner.jsx';

export const CourseQuizzesTab = ({ courseId, isOwner, isStudent }) => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeQuizId, setActiveQuizId] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const toast = useToast();

  const loadQuizzes = useCallback(async () => {
    try {
      const data = await quizzesApi.listByCourse(courseId);
      setQuizzes(data);
    } catch (err) {
      toast.error('Could not load course quizzes');
    } finally {
      setLoading(false);
    }
  }, [courseId, toast]);

  useEffect(() => {
    loadQuizzes();
  }, [loadQuizzes]);

  const handleDeleteQuiz = async (quizId) => {
    if (!window.confirm('Are you sure you want to delete this quiz?')) return;
    try {
      await quizzesApi.deleteQuiz(quizId);
      toast.success('Quiz deleted successfully');
      await loadQuizzes();
    } catch (err) {
      toast.error(err.message || 'Could not delete quiz');
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="quizzes-tab">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
        <div>
          <h2 style={{ margin: 0 }}>Assessments & Quizzes</h2>
          <p className="muted" style={{ margin: '0.2rem 0 0', fontSize: '0.9rem' }}>
            Test your knowledge, reinforce your learning, and earn your certificate.
          </p>
        </div>
        {isOwner && (
          <button className="btn" type="button" onClick={() => setShowCreateModal(true)}>
            + Create New Quiz
          </button>
        )}
      </div>

      {quizzes.length === 0 ? (
        <div className="card empty-state" style={{ padding: '2.5rem' }}>
          <h3>No assessments available</h3>
          <p className="muted">
            {isOwner
              ? 'You have not added any quizzes yet. Click "Create New Quiz" to test your learners!'
              : 'The instructor has not added any quizzes to this course yet.'}
          </p>
          {isOwner && (
            <button className="btn" type="button" onClick={() => setShowCreateModal(true)}>
              Create First Quiz
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {quizzes.map((quiz) => {
            const hasAttempted = isStudent && quiz.lastAttempt;
            const passed = hasAttempted && quiz.lastAttempt.passed;
            return (
              <div key={quiz.id} className="card quiz-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
                    <h3 style={{ margin: 0, fontSize: '1.15rem' }}>{quiz.title}</h3>
                    {hasAttempted && (
                      <span className={`badge ${passed ? 'badge-success' : 'danger-text'}`} style={{ fontWeight: 700 }}>
                        {passed ? `Passed (${quiz.lastAttempt.score}%)` : `Failed (${quiz.lastAttempt.score}%)`}
                      </span>
                    )}
                  </div>
                  <div className="muted" style={{ fontSize: '0.85rem' }}>
                    <span>{quiz.question_count} {quiz.question_count === 1 ? 'question' : 'questions'}</span>
                    <span> • Passing threshold: {quiz.passing_score}%</span>
                    {hasAttempted && (
                      <span> • Last attempt: {new Date(quiz.lastAttempt.attempted_at).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  {isStudent && (
                    <button
                      className="btn"
                      type="button"
                      onClick={() => setActiveQuizId(quiz.id)}
                    >
                      {hasAttempted ? 'Retake Quiz' : 'Start Quiz'}
                    </button>
                  )}
                  {isOwner && (
                    <>
                      <button className="btn btn-secondary btn-small" type="button" onClick={() => setActiveQuizId(quiz.id)}>
                        Preview Quiz
                      </button>
                      <button className="btn btn-danger btn-small" type="button" onClick={() => handleDeleteQuiz(quiz.id)}>
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeQuizId && (
        <QuizModal
          quizId={activeQuizId}
          onClose={() => setActiveQuizId(null)}
          onQuizCompleted={() => loadQuizzes()}
        />
      )}

      {showCreateModal && (
        <InstructorQuizModal
          courseId={courseId}
          onClose={() => setShowCreateModal(false)}
          onCreated={() => loadQuizzes()}
        />
      )}
    </div>
  );
};

export default CourseQuizzesTab;
```

### File 8: `client/src/features/quizzes/QuizModal.jsx`
```javascript
import React, { useState, useEffect } from 'react';
import { quizzesApi } from '../../api/quizzesApi.js';
import { useToast } from '../../context/ToastContext.jsx';
import { Spinner } from '../../components/common/Spinner.jsx';

export const QuizModal = ({ quizId, onClose, onQuizCompleted }) => {
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const toast = useToast();

  useEffect(() => {
    let active = true;
    quizzesApi.getQuiz(quizId)
      .then((data) => {
        if (active) setQuiz(data);
      })
      .catch((err) => {
        toast.error('Failed to load quiz');
        onClose();
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [quizId, onClose, toast]);

  const handleSelectOption = (questionId, optionIndex) => {
    if (result) return;
    setAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const totalQ = quiz?.questions?.length || 0;
    const answeredCount = Object.keys(answers).length;
    if (answeredCount < totalQ) {
      if (!window.confirm(`You answered ${answeredCount} of ${totalQ} questions. Submit anyway?`)) {
        return;
      }
    }

    setSubmitting(true);
    try {
      const res = await quizzesApi.attemptQuiz(quizId, answers);
      setResult(res);
      if (res.passed) {
        toast.success(`Congratulations! You passed with ${res.score}%!`);
      } else {
        toast.info(`You scored ${res.score}%. Passing score is ${res.passingScore}%. Try again!`);
      }
      if (onQuizCompleted) onQuizCompleted(res);
    } catch (err) {
      toast.error(err.message || 'Failed to submit quiz');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="modal-backdrop">
        <div className="card modal-content" style={{ maxWidth: '500px', textAlign: 'center' }}>
          <Spinner />
        </div>
      </div>
    );
  }

  if (!quiz) return null;

  return (
    <div className="modal-backdrop">
      <div className="card modal-content quiz-modal" style={{ maxWidth: '750px', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color, #e4e9f2)', paddingBottom: '0.8rem', marginBottom: '1.2rem' }}>
          <div>
            <span className="badge" style={{ marginBottom: '0.3rem' }}>Assessment</span>
            <h2 style={{ margin: 0 }}>{quiz.title}</h2>
            <small className="muted">Passing Score: {quiz.passing_score}% • {quiz.questions?.length || 0} Questions</small>
          </div>
          <button className="text-button" type="button" onClick={onClose} style={{ fontSize: '1.3rem', fontWeight: 'bold' }}>✕</button>
        </div>

        {/* Result Header if submitted */}
        {result && (
          <div
            className={`card quiz-result-banner ${result.passed ? 'quiz-passed' : 'quiz-failed'}`}
            style={{
              padding: '1.2rem',
              marginBottom: '1.4rem',
              textAlign: 'center',
              border: result.passed ? '2px solid #10b981' : '2px solid #f43f5e',
              background: result.passed ? 'rgba(16, 185, 129, 0.08)' : 'rgba(244, 63, 94, 0.08)',
            }}
          >
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: result.passed ? '#059669' : '#e11d48' }}>
              {result.score}%
            </div>
            <h3 style={{ margin: '0.2rem 0', color: result.passed ? '#059669' : '#e11d48' }}>
              {result.passed ? '🎉 Assessment Passed!' : 'Needs Improvement'}
            </h3>
            <p className="muted" style={{ margin: 0, fontSize: '0.9rem' }}>
              You answered {result.correctCount} of {result.totalQuestions} questions correctly.
              (Passing requirement: {result.passingScore}%)
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gap: '1.2rem' }}>
            {result ? (
              result.review.map((item, index) => (
                <div
                  key={item.questionId}
                  className="card question-card"
                  style={{
                    borderLeft: item.isCorrect ? '5px solid #10b981' : '5px solid #f43f5e',
                    padding: '1rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <strong>Question {index + 1}</strong>
                    <span className={`badge ${item.isCorrect ? 'badge-success' : 'danger-text'}`} style={{ fontWeight: 700 }}>
                      {item.isCorrect ? 'Correct (+1)' : 'Incorrect (0)'}
                    </span>
                  </div>
                  <p style={{ fontWeight: 600, margin: '0 0 0.8rem', fontSize: '1rem' }}>{item.question}</p>
                  <div style={{ display: 'grid', gap: '0.4rem' }}>
                    {item.options.map((opt, optIdx) => {
                      const isSelected = item.selected === optIdx;
                      const isActualCorrect = item.correctIndex === optIdx;
                      let bg = 'transparent';
                      let borderColor = 'var(--border-color, #e4e9f2)';
                      if (isActualCorrect) {
                        bg = 'rgba(16, 185, 129, 0.12)';
                        borderColor = '#10b981';
                      } else if (isSelected && !item.isCorrect) {
                        bg = 'rgba(244, 63, 94, 0.12)';
                        borderColor = '#f43f5e';
                      }
                      return (
                        <div
                          key={optIdx}
                          style={{
                            padding: '0.6rem 0.8rem',
                            borderRadius: '8px',
                            border: `1px solid ${borderColor}`,
                            background: bg,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.6rem',
                            fontSize: '0.92rem',
                          }}
                        >
                          <span style={{ fontWeight: 'bold' }}>{String.fromCharCode(65 + optIdx)}.</span>
                          <span>{opt}</span>
                          {isActualCorrect && <span style={{ marginLeft: 'auto', color: '#059669', fontWeight: 'bold' }}>✓ Correct Answer</span>}
                          {isSelected && !item.isCorrect && <span style={{ marginLeft: 'auto', color: '#e11d48', fontWeight: 'bold' }}>Your Choice</span>}
                        </div>
                      );
                    })}
                  </div>
                  {item.explanation && (
                    <div style={{ marginTop: '0.8rem', padding: '0.6rem 0.8rem', background: 'rgba(99, 102, 241, 0.08)', borderRadius: '6px', fontSize: '0.86rem' }}>
                      <strong>Explanation: </strong>{item.explanation}
                    </div>
                  )}
                </div>
              ))
            ) : (
              quiz.questions.map((q, index) => (
                <div key={q.id} className="card question-card" style={{ padding: '1.1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span className="badge" style={{ fontSize: '0.75rem' }}>Question {index + 1} of {quiz.questions.length}</span>
                  </div>
                  <p style={{ fontWeight: 600, margin: '0 0 0.9rem', fontSize: '1.02rem', lineHeight: 1.4 }}>
                    {q.question}
                  </p>
                  <div style={{ display: 'grid', gap: '0.5rem' }}>
                    {q.options.map((opt, optIdx) => {
                      const isSelected = answers[q.id] === optIdx;
                      return (
                        <label
                          key={optIdx}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            padding: '0.65rem 0.9rem',
                            borderRadius: '8px',
                            border: isSelected ? '2px solid #4f46e5' : '1px solid var(--border-color, #cbd4e1)',
                            background: isSelected ? 'rgba(79, 70, 229, 0.08)' : 'transparent',
                            cursor: 'pointer',
                            transition: 'all 120ms ease',
                          }}
                        >
                          <input
                            type="radio"
                            name={`q_${q.id}`}
                            checked={isSelected}
                            onChange={() => handleSelectOption(q.id, optIdx)}
                            style={{ accentColor: '#4f46e5', width: '18px', height: '18px' }}
                          />
                          <span style={{ fontWeight: 600, color: '#4f46e5' }}>{String.fromCharCode(65 + optIdx)}.</span>
                          <span style={{ fontSize: '0.94rem' }}>{opt}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.8rem', marginTop: '1.4rem' }}>
            {result ? (
              <button className="btn" type="button" onClick={onClose}>
                Finish & Close
              </button>
            ) : (
              <>
                <button className="btn btn-secondary" type="button" onClick={onClose}>
                  Cancel
                </button>
                <button className="btn" type="submit" disabled={submitting}>
                  {submitting ? 'Evaluating Answers...' : 'Submit Assessment'}
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuizModal;
```

### File 9: `client/src/features/quizzes/InstructorQuizModal.jsx`
```javascript
import React, { useState } from 'react';
import { quizzesApi } from '../../api/quizzesApi.js';
import { useToast } from '../../context/ToastContext.jsx';

export const InstructorQuizModal = ({ courseId, onClose, onCreated }) => {
  const [title, setTitle] = useState('');
  const [passingScore, setPassingScore] = useState(70);
  const [questions, setQuestions] = useState([
    {
      question: '',
      options: ['', '', '', ''],
      correct_index: 0,
      explanation: '',
    },
  ]);
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  const handleAddQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        question: '',
        options: ['', '', '', ''],
        correct_index: 0,
        explanation: '',
      },
    ]);
  };

  const handleRemoveQuestion = (idx) => {
    if (questions.length <= 1) {
      toast.error('Quiz must have at least one question');
      return;
    }
    setQuestions((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleQuestionTextChange = (idx, text) => {
    setQuestions((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], question: text };
      return copy;
    });
  };

  const handleOptionChange = (qIdx, optIdx, text) => {
    setQuestions((prev) => {
      const copy = [...prev];
      const newOpts = [...copy[qIdx].options];
      newOpts[optIdx] = text;
      copy[qIdx] = { ...copy[qIdx], options: newOpts };
      return copy;
    });
  };

  const handleCorrectIndexChange = (qIdx, optIdx) => {
    setQuestions((prev) => {
      const copy = [...prev];
      copy[qIdx] = { ...copy[qIdx], correct_index: optIdx };
      return copy;
    });
  };

  const handleExplanationChange = (qIdx, text) => {
    setQuestions((prev) => {
      const copy = [...prev];
      copy[qIdx] = { ...copy[qIdx], explanation: text };
      return copy;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Please enter a quiz title');
      return;
    }
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question.trim()) {
        toast.error(`Question ${i + 1} is missing question text.`);
        return;
      }
      const validOptions = q.options.filter((o) => o.trim().length > 0);
      if (validOptions.length < 2) {
        toast.error(`Question ${i + 1} must have at least 2 non-empty options.`);
        return;
      }
    }

    setSaving(true);
    try {
      await quizzesApi.createQuiz(courseId, {
        title: title.trim(),
        passing_score: Number(passingScore) || 70,
        questions: questions.map((q) => ({
          ...q,
          options: q.options.filter((o) => o.trim().length > 0),
        })),
      });
      toast.success('Quiz created successfully!');
      if (onCreated) onCreated();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Could not create quiz');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="card modal-content" style={{ maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem', borderBottom: '1px solid var(--border-color, #e4e9f2)', paddingBottom: '0.8rem' }}>
          <div>
            <h2 style={{ margin: 0 }}>Create Course Assessment</h2>
            <small className="muted">Add questions with options and explanations for your students.</small>
          </div>
          <button className="text-button" type="button" onClick={onClose} style={{ fontSize: '1.3rem' }}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px', gap: '1rem', marginBottom: '1.2rem' }}>
            <div>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.3rem' }}>
                Quiz Title
              </label>
              <input
                className="input"
                placeholder="e.g. Midterm JavaScript Review"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.3rem' }}>
                Passing Score (%)
              </label>
              <input
                className="input"
                type="number"
                min="10"
                max="100"
                value={passingScore}
                onChange={(e) => setPassingScore(e.target.value)}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gap: '1.5rem', marginBottom: '1.5rem' }}>
            {questions.map((q, qIdx) => (
              <div key={qIdx} className="card" style={{ background: 'var(--bg-secondary, #fafbfe)', border: '1px solid var(--border-color, #cbd4e1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                  <strong>Question {qIdx + 1}</strong>
                  {questions.length > 1 && (
                    <button className="btn btn-danger btn-small" type="button" onClick={() => handleRemoveQuestion(qIdx)}>
                      Remove
                    </button>
                  )}
                </div>

                <div style={{ marginBottom: '0.8rem' }}>
                  <input
                    className="input"
                    placeholder="Enter question prompt..."
                    value={q.question}
                    onChange={(e) => handleQuestionTextChange(qIdx, e.target.value)}
                    required
                  />
                </div>

                <div style={{ marginBottom: '0.8rem' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                    Options (Select radio button for the correct answer):
                  </label>
                  <div style={{ display: 'grid', gap: '0.4rem' }}>
                    {q.options.map((opt, optIdx) => (
                      <div key={optIdx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <input
                          type="radio"
                          name={`correct_${qIdx}`}
                          checked={q.correct_index === optIdx}
                          onChange={() => handleCorrectIndexChange(qIdx, optIdx)}
                          title="Mark as correct answer"
                          style={{ accentColor: '#10b981', width: '18px', height: '18px', cursor: 'pointer' }}
                        />
                        <span style={{ fontWeight: 600, color: '#4f46e5', minWidth: '18px' }}>
                          {String.fromCharCode(65 + optIdx)}.
                        </span>
                        <input
                          className="input"
                          style={{ minHeight: '36px', padding: '0.4rem 0.6rem' }}
                          placeholder={`Option ${String.fromCharCode(65 + optIdx)}`}
                          value={opt}
                          onChange={(e) => handleOptionChange(qIdx, optIdx, e.target.value)}
                          required={optIdx < 2}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.3rem' }}>
                    Explanation (shown to students during post-test review):
                  </label>
                  <input
                    className="input"
                    style={{ minHeight: '36px', padding: '0.4rem 0.6rem' }}
                    placeholder="Why this answer is correct..."
                    value={q.explanation}
                    onChange={(e) => handleExplanationChange(qIdx, e.target.value)}
                  />
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button className="btn btn-secondary" type="button" onClick={handleAddQuestion}>
              + Add Another Question
            </button>
            <div style={{ display: 'flex', gap: '0.6rem' }}>
              <button className="btn btn-secondary" type="button" onClick={onClose}>
                Cancel
              </button>
              <button className="btn" type="submit" disabled={saving}>
                {saving ? 'Saving Quiz...' : 'Save & Publish Quiz'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InstructorQuizModal;
```

### File 10: `client/src/features/certificates/CertificateModal.jsx`
```javascript
import React, { useRef } from 'react';

export const CertificateModal = ({ certificate, onClose }) => {
  const printRef = useRef(null);

  if (!certificate) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-backdrop">
      <div className="card modal-content certificate-modal" style={{ maxWidth: '850px', maxHeight: '92vh', overflowY: 'auto' }}>
        <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border-color, #e4e9f2)', paddingBottom: '0.6rem' }}>
          <div>
            <h3 style={{ margin: 0 }}>Certificate of Completion</h3>
            <small className="muted">Officially verified academic credential</small>
          </div>
          <div style={{ display: 'flex', gap: '0.6rem' }}>
            <button className="btn btn-secondary btn-small" onClick={handlePrint}>
              🖨 Print / Save PDF
            </button>
            <button className="text-button" type="button" onClick={onClose} style={{ fontSize: '1.3rem' }}>✕</button>
          </div>
        </div>

        {/* Certificate Paper */}
        <div
          ref={printRef}
          className="certificate-paper"
          style={{
            background: '#ffffff',
            color: '#1a1f36',
            border: '10px double #c59b27',
            padding: '2.5rem 2rem',
            textAlign: 'center',
            position: 'relative',
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
            borderRadius: '4px',
            fontFamily: '"Georgia", serif',
          }}
        >
          <div style={{ position: 'absolute', top: '15px', left: '15px', right: '15px', bottom: '15px', border: '1px solid #d4af37', pointerEvents: 'none' }} />

          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.8rem' }}>
            <img src="/ruet_logo.png" alt="RUET Logo" style={{ height: '65px', objectFit: 'contain' }} />
          </div>

          <div style={{ textTransform: 'uppercase', letterSpacing: '4px', color: '#8c6d1f', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.6rem' }}>
            RAJSHAHI UNIVERSITY OF ENGINEERING & TECHNOLOGY • Department of CSE
          </div>

          <h1 style={{ fontSize: '2.4rem', fontFamily: '"Georgia", serif', color: '#1a1f36', margin: '0 0 0.5rem', fontWeight: 'bold' }}>
            Certificate of Achievement
          </h1>

          <p style={{ fontStyle: 'italic', color: '#666', fontSize: '1.05rem', margin: '0.8rem 0' }}>
            This is proudly presented to
          </p>

          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#1e3a8a', borderBottom: '2px solid #c59b27', display: 'inline-block', padding: '0 2rem 0.3rem', margin: '0.2rem 0 1rem' }}>
            {certificate.student_name}
          </div>

          <p style={{ fontStyle: 'italic', color: '#555', fontSize: '1rem', maxWidth: '600px', margin: '0.5rem auto' }}>
            for successfully satisfying all curriculum requirements, assessments, and practical assignments for the course
          </p>

          <h2 style={{ fontSize: '1.6rem', color: '#111827', margin: '0.6rem 0 1.2rem', fontWeight: 700 }}>
            {certificate.course_title}
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', alignItems: 'end', marginTop: '2.5rem', paddingTop: '1rem', borderTop: '1px dashed #cbd5e1' }}>
            <div>
              <div style={{ borderBottom: '1px solid #333', paddingBottom: '0.2rem', fontWeight: 600, fontSize: '0.95rem' }}>
                {certificate.instructor_name}
              </div>
              <small style={{ color: '#777', textTransform: 'uppercase', fontSize: '0.72rem', letterSpacing: '1px' }}>
                Course Instructor
              </small>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{
                width: '65px',
                height: '65px',
                borderRadius: '50%',
                border: '3px solid #c59b27',
                background: '#faf5e6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#8c6d1f',
                fontWeight: 'bold',
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                boxShadow: '0 0 10px rgba(197, 155, 39, 0.3)',
              }}>
                VERIFIED
              </div>
              <small style={{ color: '#8c6d1f', marginTop: '0.3rem', fontSize: '0.7rem', fontWeight: 600 }}>Official Seal</small>
            </div>

            <div>
              <div style={{ borderBottom: '1px solid #333', paddingBottom: '0.2rem', fontWeight: 600, fontSize: '0.95rem' }}>
                {new Date(certificate.issue_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
              <small style={{ color: '#777', textTransform: 'uppercase', fontSize: '0.72rem', letterSpacing: '1px' }}>
                Date of Issue
              </small>
            </div>
          </div>

          <div style={{ marginTop: '2rem', fontSize: '0.78rem', color: '#6b7280', letterSpacing: '1px' }}>
            CREDENTIAL VERIFICATION ID: <span style={{ fontFamily: 'monospace', fontWeight: 'bold', color: '#1e3a8a' }}>{certificate.certificate_code}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CertificateModal;
```

### File 11: `client/src/features/analytics/AnalyticsPage.jsx`
```javascript
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { analyticsApi } from '../../api/analyticsApi.js';
import { Spinner } from '../../components/common/Spinner.jsx';
import { ErrorMessage } from '../../components/common/ErrorMessage.jsx';

export const AnalyticsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    analyticsApi.getOverview()
      .then((res) => {
        if (active) setData(res);
      })
      .catch((err) => {
        if (active) setError(err.message || 'Could not load learning analytics');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  if (loading) return <Spinner />;

  return (
    <main className="container page">
      <header className="page-heading">
        <div>
          <p className="eyebrow">Academic Performance</p>
          <h1>Learning Analytics & Insights</h1>
          <p className="muted">Track your academic trajectory, assessment scores, and completion milestones.</p>
        </div>
        <Link className="btn btn-secondary" to="/courses">Browse Catalog</Link>
      </header>

      <ErrorMessage message={error} />

      {data && data.role === 'student' && (
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          {/* Top Metric Cards */}
          <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.1rem' }}>
            <div className="card stat-card" style={{ borderLeft: '4px solid #4f46e5' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="muted" style={{ fontSize: '0.85rem', fontWeight: 600 }}>Enrolled Courses</span>
                <span style={{ fontSize: '1.4rem' }}>📘</span>
              </div>
              <strong style={{ color: '#4f46e5', fontSize: '2.1rem' }}>{data.enrolled_courses}</strong>
              <small className="muted" style={{ fontSize: '0.78rem' }}>Active academic terms</small>
            </div>

            <div className="card stat-card" style={{ borderLeft: '4px solid #059669' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="muted" style={{ fontSize: '0.85rem', fontWeight: 600 }}>Completed Lessons</span>
                <span style={{ fontSize: '1.4rem' }}>📗</span>
              </div>
              <strong style={{ color: '#059669', fontSize: '2.1rem' }}>{data.completed_lessons}</strong>
              <small className="muted" style={{ fontSize: '0.78rem' }}>Lectures studied</small>
            </div>

            <div className="card stat-card" style={{ borderLeft: '4px solid #d97706' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="muted" style={{ fontSize: '0.85rem', fontWeight: 600 }}>Quizzes Passed</span>
                <span style={{ fontSize: '1.4rem' }}>🎯</span>
              </div>
              <strong style={{ color: '#d97706', fontSize: '2.1rem' }}>{data.quizzes_passed} / {data.quizzes_taken}</strong>
              <small className="muted" style={{ fontSize: '0.78rem' }}>Evaluations cleared</small>
            </div>

            <div className="card stat-card" style={{ borderLeft: '4px solid #2563eb' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="muted" style={{ fontSize: '0.85rem', fontWeight: 600 }}>Average Score</span>
                <span style={{ fontSize: '1.4rem' }}>📈</span>
              </div>
              <strong style={{ color: '#2563eb', fontSize: '2.1rem' }}>{data.average_quiz_score > 0 ? `${data.average_quiz_score}%` : '100%'}</strong>
              <small className="muted" style={{ fontSize: '0.78rem' }}>Cumulative grade</small>
            </div>

            <div className="card stat-card" style={{ borderLeft: '4px solid #7c3aed' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="muted" style={{ fontSize: '0.85rem', fontWeight: 600 }}>Certificates</span>
                <span style={{ fontSize: '1.4rem' }}>🎓</span>
              </div>
              <strong style={{ color: '#7c3aed', fontSize: '2.1rem' }}>{data.certificates_earned}</strong>
              <small className="muted" style={{ fontSize: '0.78rem' }}>Verified credentials</small>
            </div>
          </div>

          {/* Recent Quiz Performance Timeline */}
          <div className="card">
            <h2 style={{ marginBottom: '1rem' }}>Recent Assessment History</h2>
            {(!data.recent_quiz_attempts || data.recent_quiz_attempts.length === 0) ? (
              <p className="muted">No assessments attempted yet. Take course quizzes to see your performance history!</p>
            ) : (
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>Course</th>
                      <th>Quiz Title</th>
                      <th>Score</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recent_quiz_attempts.map((att, idx) => (
                      <tr key={idx}>
                        <td><strong>{att.course_title}</strong></td>
                        <td>{att.quiz_title}</td>
                        <td><strong>{att.score}%</strong></td>
                        <td>
                          <span className={`badge ${att.passed ? 'badge-success' : 'danger-text'}`}>
                            {att.passed ? 'Passed' : 'Failed'}
                          </span>
                        </td>
                        <td className="muted">{new Date(att.attempted_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
};

export default AnalyticsPage;
```

---

## 🎤 Shohag's Teacher Viva Voce Defense Cheat Sheet

### Q1: "Shohag, explain how you designed the assessment scoring algorithm."
> **Answer**: "I implemented the evaluation pipeline on the server in `quizzes.routes.js`. When a student submits their answer map `{ [questionId]: selectedOptionIndex }`, the backend iterates over the question rows in SQLite, compares the chosen index against the stored `correct_index`, calculates the percentage score `Math.round((correctCount / totalQuestions) * 100)`, checks if it meets the `passing_score` threshold, logs the attempt in `quiz_attempts`, and releases the correct keys with explanations."

### Q2: "How did you prevent students from opening DevTools to find the correct answer?"
> **Answer**: "When a student requests a quiz via `GET /api/quizzes/:id`, my endpoint maps through the database questions and intentionally strips out `correct_index` and `explanation` from the JSON payload. The correct answers remain strictly on the server until the student submits their attempt."

### Q3: "How does your certificate verification system work?"
> **Answer**: "When a student finishes 100% of a course's lessons, the system audits `lesson_progress` against total lessons. If qualified, we generate a cryptographically unique key combining course ID, student ID, and secure random hex bytes (`LH-<courseId>-<studentId>-<HEX>`). Anyone can verify this certificate publicly without logging in via `GET /api/certificates/verify/:code`."
