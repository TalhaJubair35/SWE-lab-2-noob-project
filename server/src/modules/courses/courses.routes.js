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

const requireInstructor = (req, res, next) => {
  if (req.user.role !== 'instructor') {
    return next(new AppError(403, 'Instructor access required'));
  }
  return next();
};

const requireCourseOwner = (req, res, next) => {
  const courseId = parseId(req.params.id, 'course id');
  const course = db.prepare('SELECT id, instructor_id FROM courses WHERE id = ?').get(courseId);
  if (!course) {
    return next(new AppError(404, 'Course not found'));
  }
  if (course.instructor_id !== req.user.id) {
    return next(new AppError(403, 'You can only manage your own courses'));
  }
  req.course = course;
  return next();
};

const validateCourse = ({ title, description, category }) => {
  if (typeof title !== 'string' || title.trim().length < 2) {
    throw new AppError(400, 'Course title must be at least 2 characters');
  }
  if (typeof description !== 'string' || !description.trim()) {
    throw new AppError(400, 'Course description is required');
  }
  if (typeof category !== 'string' || !category.trim()) {
    throw new AppError(400, 'Course category is required');
  }
};

router.use(authenticate);

router.get(
  '/',
  asyncHandler((req, res) => {
    const conditions = [];
    const params = [];
    const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
    const category = typeof req.query.category === 'string' ? req.query.category.trim() : '';

    if (search) {
      conditions.push('(c.title LIKE ? OR c.description LIKE ? OR c.category LIKE ?)');
      const term = `%${search}%`;
      params.push(term, term, term);
    }
    if (category) {
      conditions.push('c.category = ?');
      params.push(category);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const courses = db.prepare(`
      SELECT c.id, c.title, c.description, c.category, c.instructor_id, c.created_at,
        u.name AS instructor_name,
        COUNT(DISTINCT l.id) AS lesson_count,
        COUNT(DISTINCT e.student_id) AS enrollment_count,
        ROUND(COALESCE(AVG(r.rating), 0), 1) AS avg_rating,
        COUNT(DISTINCT r.id) AS review_count,
        EXISTS (
          SELECT 1 FROM enrollments mine
          WHERE mine.course_id = c.id AND mine.student_id = ?
        ) AS is_enrolled
      FROM courses c
      JOIN users u ON u.id = c.instructor_id
      LEFT JOIN lessons l ON l.course_id = c.id
      LEFT JOIN enrollments e ON e.course_id = c.id
      LEFT JOIN reviews r ON r.course_id = c.id
      ${where}
      GROUP BY c.id
      ORDER BY c.created_at DESC, c.id DESC
    `).all(req.user.id, ...params);

    res.json(courses);
  })
);

router.get(
  '/mine',
  requireInstructor,
  asyncHandler((req, res) => {
    const courses = db.prepare(`
      SELECT c.id, c.title, c.description, c.category, c.created_at,
        COUNT(DISTINCT l.id) AS lesson_count,
        COUNT(DISTINCT e.student_id) AS enrollment_count,
        ROUND(COALESCE(AVG(r.rating), 0), 1) AS avg_rating,
        COUNT(DISTINCT r.id) AS review_count
      FROM courses c
      LEFT JOIN lessons l ON l.course_id = c.id
      LEFT JOIN enrollments e ON e.course_id = c.id
      LEFT JOIN reviews r ON r.course_id = c.id
      WHERE c.instructor_id = ?
      GROUP BY c.id
      ORDER BY c.created_at DESC, c.id DESC
    `).all(req.user.id);
    res.json(courses);
  })
);

router.post(
  '/',
  requireInstructor,
  asyncHandler((req, res) => {
    const { title, description, category } = req.body || {};
    validateCourse({ title, description, category });
    const result = db.prepare(`
      INSERT INTO courses (title, description, category, instructor_id)
      VALUES (?, ?, ?, ?)
    `).run(title.trim(), description.trim(), category.trim(), req.user.id);
    const course = db.prepare('SELECT * FROM courses WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(course);
  })
);

router.get(
  '/:id',
  asyncHandler((req, res) => {
    const id = parseId(req.params.id, 'course id');
    const course = db.prepare(`
      SELECT c.id, c.title, c.description, c.category, c.instructor_id, c.created_at,
        u.name AS instructor_name,
        COUNT(DISTINCT l.id) AS lesson_count,
        COUNT(DISTINCT e.student_id) AS enrollment_count,
        ROUND(COALESCE(AVG(r.rating), 0), 1) AS avg_rating,
        COUNT(DISTINCT r.id) AS review_count,
        EXISTS (
          SELECT 1 FROM enrollments mine
          WHERE mine.course_id = c.id AND mine.student_id = ?
        ) AS is_enrolled
      FROM courses c
      JOIN users u ON u.id = c.instructor_id
      LEFT JOIN lessons l ON l.course_id = c.id
      LEFT JOIN enrollments e ON e.course_id = c.id
      LEFT JOIN reviews r ON r.course_id = c.id
      WHERE c.id = ?
      GROUP BY c.id
    `).get(req.user.id, id);
    if (!course) {
      throw new AppError(404, 'Course not found');
    }
    res.json(course);
  })
);

router.put(
  '/:id',
  requireInstructor,
  requireCourseOwner,
  asyncHandler((req, res) => {
    const { title, description, category } = req.body || {};
    validateCourse({ title, description, category });
    db.prepare(`
      UPDATE courses SET title = ?, description = ?, category = ?
      WHERE id = ? AND instructor_id = ?
    `).run(title.trim(), description.trim(), category.trim(), req.course.id, req.user.id);
    res.json(db.prepare('SELECT * FROM courses WHERE id = ?').get(req.course.id));
  })
);

router.delete(
  '/:id',
  requireInstructor,
  requireCourseOwner,
  asyncHandler((req, res) => {
    db.prepare('DELETE FROM courses WHERE id = ? AND instructor_id = ?').run(req.course.id, req.user.id);
    res.status(204).end();
  })
);

router.post(
  '/:id/lessons',
  requireInstructor,
  requireCourseOwner,
  asyncHandler((req, res) => {
    const { title, content } = req.body || {};
    if (typeof title !== 'string' || title.trim().length < 2) {
      throw new AppError(400, 'Lesson title must be at least 2 characters');
    }
    if (typeof content !== 'string' || !content.trim()) {
      throw new AppError(400, 'Lesson content is required');
    }
    const position = db.prepare('SELECT COALESCE(MAX(position), 0) + 1 AS next FROM lessons WHERE course_id = ?')
      .get(req.course.id).next;
    const result = db.prepare(`
      INSERT INTO lessons (course_id, title, content, position) VALUES (?, ?, ?, ?)
    `).run(req.course.id, title.trim(), content.trim(), position);
    res.status(201).json(db.prepare('SELECT id, course_id, title, content, position FROM lessons WHERE id = ?')
      .get(result.lastInsertRowid));
  })
);

router.put(
  '/:id/lessons/:lessonId',
  requireInstructor,
  requireCourseOwner,
  asyncHandler((req, res) => {
    const lessonId = parseId(req.params.lessonId, 'lesson id');
    const lesson = db.prepare('SELECT id FROM lessons WHERE id = ? AND course_id = ?')
      .get(lessonId, req.course.id);
    if (!lesson) {
      throw new AppError(404, 'Lesson not found');
    }
    const { title, content } = req.body || {};
    if (typeof title !== 'string' || title.trim().length < 2) {
      throw new AppError(400, 'Lesson title must be at least 2 characters');
    }
    if (typeof content !== 'string' || !content.trim()) {
      throw new AppError(400, 'Lesson content is required');
    }
    db.prepare('UPDATE lessons SET title = ?, content = ? WHERE id = ?')
      .run(title.trim(), content.trim(), lessonId);
    res.json(db.prepare('SELECT id, course_id, title, content, position FROM lessons WHERE id = ?')
      .get(lessonId));
  })
);

router.delete(
  '/:id/lessons/:lessonId',
  requireInstructor,
  requireCourseOwner,
  asyncHandler((req, res) => {
    const lessonId = parseId(req.params.lessonId, 'lesson id');
    const result = db.prepare('DELETE FROM lessons WHERE id = ? AND course_id = ?')
      .run(lessonId, req.course.id);
    if (!result.changes) {
      throw new AppError(404, 'Lesson not found');
    }
    res.status(204).end();
  })
);

export default router;
