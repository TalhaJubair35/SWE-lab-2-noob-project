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

router.use(authenticate);

// Get discussions for a course
router.get(
  '/courses/:courseId/discussions',
  asyncHandler((req, res) => {
    const courseId = parseId(req.params.courseId, 'course id');

    const threads = db.prepare(`
      SELECT d.id, d.course_id, d.title, d.content, d.created_at,
        u.name AS author_name, u.role AS author_role,
        COUNT(dr.id) AS reply_count
      FROM discussions d
      JOIN users u ON u.id = d.user_id
      LEFT JOIN discussion_replies dr ON dr.discussion_id = d.id
      WHERE d.course_id = ?
      GROUP BY d.id
      ORDER BY d.created_at DESC
    `).all(courseId);

    res.json(threads);
  })
);

// Create a new discussion question/topic
router.post(
  '/courses/:courseId/discussions',
  asyncHandler((req, res) => {
    const courseId = parseId(req.params.courseId, 'course id');
    const { title, content } = req.body || {};

    if (typeof title !== 'string' || title.trim().length < 3) {
      throw new AppError(400, 'Topic title must be at least 3 characters');
    }
    if (typeof content !== 'string' || content.trim().length < 5) {
      throw new AppError(400, 'Question content must be at least 5 characters');
    }

    const result = db.prepare(`
      INSERT INTO discussions (course_id, user_id, title, content)
      VALUES (?, ?, ?, ?)
    `).run(courseId, req.user.id, title.trim(), content.trim());

    const created = db.prepare(`
      SELECT d.id, d.course_id, d.title, d.content, d.created_at,
        u.name AS author_name, u.role AS author_role, 0 AS reply_count
      FROM discussions d
      JOIN users u ON u.id = d.user_id
      WHERE d.id = ?
    `).get(result.lastInsertRowid);

    res.status(201).json(created);
  })
);

// Get a single discussion with all replies
router.get(
  '/discussions/:discussionId',
  asyncHandler((req, res) => {
    const discussionId = parseId(req.params.discussionId, 'discussion id');

    const thread = db.prepare(`
      SELECT d.id, d.course_id, d.title, d.content, d.created_at,
        u.name AS author_name, u.role AS author_role,
        c.instructor_id
      FROM discussions d
      JOIN users u ON u.id = d.user_id
      JOIN courses c ON c.id = d.course_id
      WHERE d.id = ?
    `).get(discussionId);

    if (!thread) {
      throw new AppError(404, 'Discussion topic not found');
    }

    const replies = db.prepare(`
      SELECT dr.id, dr.discussion_id, dr.content, dr.created_at,
        u.name AS author_name, u.role AS author_role,
        CASE WHEN u.id = ? THEN 1 ELSE 0 END AS is_course_instructor
      FROM discussion_replies dr
      JOIN users u ON u.id = dr.user_id
      WHERE dr.discussion_id = ?
      ORDER BY dr.created_at ASC
    `).all(thread.instructor_id, discussionId);

    res.json({ ...thread, replies });
  })
);

// Post a reply
router.post(
  '/discussions/:discussionId/replies',
  asyncHandler((req, res) => {
    const discussionId = parseId(req.params.discussionId, 'discussion id');
    const { content } = req.body || {};

    if (typeof content !== 'string' || content.trim().length < 2) {
      throw new AppError(400, 'Reply content must be at least 2 characters');
    }

    const thread = db.prepare('SELECT id, course_id FROM discussions WHERE id = ?').get(discussionId);
    if (!thread) {
      throw new AppError(404, 'Discussion topic not found');
    }

    const result = db.prepare(`
      INSERT INTO discussion_replies (discussion_id, user_id, content)
      VALUES (?, ?, ?)
    `).run(discussionId, req.user.id, content.trim());

    const course = db.prepare('SELECT instructor_id FROM courses WHERE id = ?').get(thread.course_id);

    const reply = db.prepare(`
      SELECT dr.id, dr.discussion_id, dr.content, dr.created_at,
        u.name AS author_name, u.role AS author_role,
        CASE WHEN u.id = ? THEN 1 ELSE 0 END AS is_course_instructor
      FROM discussion_replies dr
      JOIN users u ON u.id = dr.user_id
      WHERE dr.id = ?
    `).get(course.instructor_id, result.lastInsertRowid);

    res.status(201).json(reply);
  })
);

export default router;
