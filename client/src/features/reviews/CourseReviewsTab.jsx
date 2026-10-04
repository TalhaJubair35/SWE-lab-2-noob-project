import React, { useState, useEffect, useCallback } from 'react';
import { reviewsApi } from '../../api/reviewsApi.js';
import StarRating from '../../components/common/StarRating.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { Spinner } from '../../components/common/Spinner.jsx';

export const CourseReviewsTab = ({ courseId, isEnrolled, isStudent }) => {
  const [data, setData] = useState({ reviews: [], summary: { totalReviews: 0, avgRating: 0, distribution: {} }, userReview: null });
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const toast = useToast();

  const loadReviews = useCallback(async () => {
    try {
      const res = await reviewsApi.getCourseReviews(courseId);
      setData(res);
      if (res.userReview) {
        setRating(res.userReview.rating);
        setComment(res.userReview.comment);
      }
    } catch (err) {
      toast.error('Failed to load course reviews');
    } finally {
      setLoading(false);
    }
  }, [courseId, toast]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      toast.error('Please write a comment for your review.');
      return;
    }
    setSubmitting(true);
    try {
      await reviewsApi.submitReview(courseId, { rating, comment: comment.trim() });
      toast.success(data.userReview ? 'Review updated successfully!' : 'Thank you for your review!');
      setShowForm(false);
      await loadReviews();
    } catch (err) {
      toast.error(err.message || 'Could not submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete your review?')) return;
    try {
      await reviewsApi.deleteReview(courseId);
      toast.success('Your review was removed.');
      setComment('');
      setRating(5);
      await loadReviews();
    } catch (err) {
      toast.error(err.message || 'Could not delete review');
    }
  };

  if (loading) return <Spinner />;

  const { reviews, summary, userReview } = data;
  const dist = summary.distribution || {};
  const total = summary.totalReviews || 0;

  return (
    <div className="reviews-tab">
      <div className="card reviews-summary-card">
        <div className="summary-left">
          <div className="big-rating-number">{summary.avgRating > 0 ? summary.avgRating.toFixed(1) : '0.0'}</div>
          <StarRating rating={summary.avgRating} size="1.4rem" />
          <p className="muted" style={{ margin: '0.4rem 0 0' }}>
            Based on {total} {total === 1 ? 'review' : 'reviews'}
          </p>
        </div>

        <div className="summary-bars">
          {[5, 4, 3, 2, 1].map((stars) => {
            const count = dist[stars] || 0;
            const pct = total > 0 ? Math.round((count / total) * 100) : 0;
            return (
              <div key={stars} className="dist-row">
                <span className="dist-label">{stars} ★</span>
                <div className="dist-bar">
                  <div className="dist-fill" style={{ width: `${pct}%` }} />
                </div>
                <span className="dist-count">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Review CTA / User Review Card */}
      {isStudent && isEnrolled && (
        <div className="card review-action-card" style={{ marginTop: '1rem' }}>
          {userReview && !showForm ? (
            <div className="user-existing-review">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span className="badge badge-success">Your Review</span>
                  <div style={{ margin: '0.4rem 0' }}>
                    <StarRating rating={userReview.rating} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="btn btn-secondary btn-small" onClick={() => setShowForm(true)}>Edit</button>
                  <button className="btn btn-danger btn-small" onClick={handleDelete}>Delete</button>
                </div>
              </div>
              <p style={{ margin: '0.5rem 0 0', color: 'var(--text-color, #333)' }}>{userReview.comment}</p>
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
                <h3 style={{ margin: 0 }}>{userReview ? 'Edit Your Review' : 'Rate & Review This Course'}</h3>
                {userReview && showForm && (
                  <button className="text-button" onClick={() => setShowForm(false)}>Cancel</button>
                )}
              </div>
              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '0.8rem' }}>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.3rem' }}>
                    Your Rating:
                  </label>
                  <StarRating rating={rating} onRate={(r) => setRating(r)} interactive size="1.6rem" />
                </div>
                <div style={{ marginBottom: '0.8rem' }}>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.3rem' }}>
                    Your Experience:
                  </label>
                  <textarea
                    className="input textarea"
                    placeholder="Share what you learned, what you liked, and tips for future students..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={3}
                    required
                  />
                </div>
                <button className="btn" type="submit" disabled={submitting}>
                  {submitting ? 'Submitting...' : (userReview ? 'Update Review' : 'Submit Review')}
                </button>
              </form>
            </div>
          )}
        </div>
      )}

      {/* Review List */}
      <div className="reviews-list-container" style={{ marginTop: '1.5rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>Student Feedback ({reviews.length})</h3>
        {reviews.length === 0 ? (
          <div className="card empty-state" style={{ padding: '2rem' }}>
            <p className="muted" style={{ margin: 0 }}>No reviews yet. Be the first student to review this course!</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '0.85rem' }}>
            {reviews.map((rev) => (
              <div key={rev.id} className="card review-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <strong style={{ fontSize: '0.98rem' }}>{rev.student_name}</strong>
                    <div style={{ margin: '0.2rem 0' }}>
                      <StarRating rating={rev.rating} size="0.95rem" />
                    </div>
                  </div>
                  <span className="muted" style={{ fontSize: '0.8rem' }}>
                    {new Date(rev.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                  </span>
                </div>
                <p style={{ margin: '0.6rem 0 0', color: 'var(--text-color, #374151)', lineHeight: 1.5 }}>
                  {rev.comment}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseReviewsTab;
