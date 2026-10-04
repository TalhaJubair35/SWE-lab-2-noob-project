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

const requireStudent = (req, res, next) => {
  if (req.user.role !== 'student') {
    return next(new AppError(403, 'Student access required'));
  }
  return next();
};

const getCourseAccess = (courseId, user) => {
  const course = db.prepare('SELECT id, title, instructor_id FROM courses WHERE id = ?').get(courseId);
  if (!course) {
    throw new AppError(404, 'Course not found');
  }
  const isOwner = user.role === 'instructor' && course.instructor_id === user.id;
  const enrollment = user.role === 'student'
    ? db.prepare('SELECT 1 FROM enrollments WHERE course_id = ? AND student_id = ?').get(courseId, user.id)
    : null;
  if (!isOwner && !enrollment) {
    throw new AppError(403, 'Enroll in this course to access its lessons');
  }
  return course;
};

router.use(authenticate);

router.post(
  '/courses/:courseId/enroll',
  requireStudent,
  asyncHandler((req, res) => {
    const courseId = parseId(req.params.courseId, 'course id');
    if (!db.prepare('SELECT id FROM courses WHERE id = ?').get(courseId)) {
      throw new AppError(404, 'Course not found');
    }
    db.prepare('INSERT OR IGNORE INTO enrollments (student_id, course_id) VALUES (?, ?)')
      .run(req.user.id, courseId);
    res.status(201).json({ enrolled: true });
  })
);

router.get(
  '/courses/:courseId/enrollment',
  asyncHandler((req, res) => {
    const courseId = parseId(req.params.courseId, 'course id');
    if (!db.prepare('SELECT id FROM courses WHERE id = ?').get(courseId)) {
      throw new AppError(404, 'Course not found');
    }
    const enrolled = req.user.role === 'student'
      && Boolean(db.prepare('SELECT 1 FROM enrollments WHERE student_id = ? AND course_id = ?')
        .get(req.user.id, courseId));
    res.json({ enrolled });
  })
);

router.get(
  '/my-courses',
  requireStudent,
  asyncHandler((req, res) => {
    const courses = db.prepare(`
      SELECT c.id, c.title, c.description, c.category, c.instructor_id,
        u.name AS instructor_name,
        COUNT(DISTINCT l.id) AS lesson_count,
        COUNT(DISTINCT lp.lesson_id) AS completed_lessons,
        CASE
          WHEN COUNT(DISTINCT l.id) = 0 THEN 0
          ELSE CAST(COUNT(DISTINCT lp.lesson_id) * 100.0 / COUNT(DISTINCT l.id) AS INTEGER)
        END AS progress_percent
      FROM enrollments e
      JOIN courses c ON c.id = e.course_id
      JOIN users u ON u.id = c.instructor_id
      LEFT JOIN lessons l ON l.course_id = c.id
      LEFT JOIN lesson_progress lp ON lp.lesson_id = l.id AND lp.student_id = e.student_id
      WHERE e.student_id = ?
      GROUP BY c.id
      ORDER BY e.enrolled_at DESC
    `).all(req.user.id);
    res.json(courses);
  })
);

router.get(
  '/courses/:courseId/lessons',
  asyncHandler((req, res) => {
    const courseId = parseId(req.params.courseId, 'course id');
    getCourseAccess(courseId, req.user);
    const lessons = db.prepare(`
      SELECT l.id, l.course_id, l.title, l.position,
        EXISTS (
          SELECT 1 FROM lesson_progress lp
          WHERE lp.lesson_id = l.id AND lp.student_id = ?
        ) AS completed
      FROM lessons l
      WHERE l.course_id = ?
      ORDER BY l.position, l.id
    `).all(req.user.id, courseId);
    res.json(lessons);
  })
);

const loadLesson = (lessonId, user) => {
  const lesson = db.prepare(`
    SELECT l.id, l.course_id, l.title, l.content, l.position, c.title AS course_title
    FROM lessons l
    JOIN courses c ON c.id = l.course_id
    WHERE l.id = ?
  `).get(lessonId);
  if (!lesson) {
    throw new AppError(404, 'Lesson not found');
  }
  getCourseAccess(lesson.course_id, user);
  const completed = user.role === 'student'
    && Boolean(db.prepare('SELECT 1 FROM lesson_progress WHERE student_id = ? AND lesson_id = ?')
      .get(user.id, lessonId));
  const adjacent = db.prepare(`
    SELECT id FROM lessons
    WHERE course_id = ? AND position ${lesson.position > 1 ? '<' : '>'} ?
    ORDER BY position ${lesson.position > 1 ? 'DESC' : 'ASC'}, id ${lesson.position > 1 ? 'DESC' : 'ASC'}
    LIMIT 1
  `).get(lesson.course_id, lesson.position);
  return {
    ...lesson,
    completed,
    adjacentLessonId: adjacent?.id ?? null,
  };
};

router.get(
  '/lessons/:lessonId',
  asyncHandler((req, res) => {
    const lessonId = parseId(req.params.lessonId, 'lesson id');
    const lesson = loadLesson(lessonId, req.user);
    const previous = db.prepare(`
      SELECT id FROM lessons WHERE course_id = ? AND position < ?
      ORDER BY position DESC, id DESC LIMIT 1
    `).get(lesson.course_id, lesson.position);
    const next = db.prepare(`
      SELECT id FROM lessons WHERE course_id = ? AND position > ?
      ORDER BY position, id LIMIT 1
    `).get(lesson.course_id, lesson.position);
    res.json({ ...lesson, previousLessonId: previous?.id ?? null, nextLessonId: next?.id ?? null });
  })
);

router.post(
  '/lessons/:lessonId/complete',
  requireStudent,
  asyncHandler((req, res) => {
    const lessonId = parseId(req.params.lessonId, 'lesson id');
    const lesson = db.prepare('SELECT id, course_id FROM lessons WHERE id = ?').get(lessonId);
    if (!lesson) {
      throw new AppError(404, 'Lesson not found');
    }
    getCourseAccess(lesson.course_id, req.user);
    db.prepare('INSERT OR IGNORE INTO lesson_progress (student_id, lesson_id) VALUES (?, ?)')
      .run(req.user.id, lessonId);
    const progress = db.prepare(`
      SELECT COUNT(DISTINCT l.id) AS lesson_count,
        COUNT(DISTINCT lp.lesson_id) AS completed_lessons,
        CASE WHEN COUNT(DISTINCT l.id) = 0 THEN 0
          ELSE CAST(COUNT(DISTINCT lp.lesson_id) * 100.0 / COUNT(DISTINCT l.id) AS INTEGER)
        END AS progress_percent
      FROM lessons l
      LEFT JOIN lesson_progress lp ON lp.lesson_id = l.id AND lp.student_id = ?
      WHERE l.course_id = ?
    `).get(req.user.id, lesson.course_id);
    res.json({ completed: true, ...progress });
  })
);

export default router;
