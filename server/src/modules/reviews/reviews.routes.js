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

// Get reviews and rating summary for a course
router.get(
  '/courses/:courseId/reviews',
  asyncHandler((req, res) => {
    const courseId = parseId(req.params.courseId, 'course id');

    const reviews = db.prepare(`
      SELECT r.id, r.student_id, r.rating, r.comment, r.created_at,
        u.name AS student_name
      FROM reviews r
      JOIN users u ON u.id = r.student_id
      WHERE r.course_id = ?
      ORDER BY r.created_at DESC
    `).all(courseId);

    const summary = db.prepare(`
      SELECT
        COUNT(*) AS total_reviews,
        ROUND(AVG(rating), 1) AS avg_rating,
        SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) AS stars_5,
        SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) AS stars_4,
        SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) AS stars_3,
        SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) AS stars_2,
        SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) AS stars_1
      FROM reviews
      WHERE course_id = ?
    `).get(courseId);

    const userReview = reviews.find((r) => r.student_id === req.user.id) || null;

    res.json({
      reviews,
      summary: {
        totalReviews: summary.total_reviews || 0,
        avgRating: summary.avg_rating || 0,
        distribution: {
          5: summary.stars_5 || 0,
          4: summary.stars_4 || 0,
          3: summary.stars_3 || 0,
          2: summary.stars_2 || 0,
          1: summary.stars_1 || 0,
        },
      },
      userReview,
    });
  })
);

// Submit or update a review (Student only, must be enrolled)
router.post(
  '/courses/:courseId/reviews',
  asyncHandler((req, res) => {
    if (req.user.role !== 'student') {
      throw new AppError(403, 'Only students can submit course reviews');
    }
    const courseId = parseId(req.params.courseId, 'course id');

    // Check enrollment
    const enrolled = db.prepare('SELECT 1 FROM enrollments WHERE student_id = ? AND course_id = ?')
      .get(req.user.id, courseId);
    if (!enrolled) {
      throw new AppError(403, 'You must be enrolled in this course to leave a review');
    }

    const { rating, comment } = req.body || {};
    const numRating = Number(rating);
    if (!Number.isInteger(numRating) || numRating < 1 || numRating > 5) {
      throw new AppError(400, 'Rating must be an integer between 1 and 5');
    }
    if (typeof comment !== 'string' || comment.trim().length < 3) {
      throw new AppError(400, 'Review comment must be at least 3 characters');
    }

    db.prepare(`
      INSERT INTO reviews (student_id, course_id, rating, comment)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(student_id, course_id) DO UPDATE SET
        rating = excluded.rating,
        comment = excluded.comment,
        created_at = CURRENT_TIMESTAMP
    `).run(req.user.id, courseId, numRating, comment.trim());

    const saved = db.prepare(`
      SELECT r.id, r.student_id, r.rating, r.comment, r.created_at, u.name AS student_name
      FROM reviews r
      JOIN users u ON u.id = r.student_id
      WHERE r.course_id = ? AND r.student_id = ?
    `).get(courseId, req.user.id);

    res.status(201).json(saved);
  })
);

// Delete user's own review
router.delete(
  '/courses/:courseId/reviews',
  asyncHandler((req, res) => {
    const courseId = parseId(req.params.courseId, 'course id');
    const result = db.prepare('DELETE FROM reviews WHERE course_id = ? AND student_id = ?')
      .run(courseId, req.user.id);
    if (!result.changes) {
      throw new AppError(404, 'Review not found');
    }
    res.status(204).end();
  })
);

export default router;
