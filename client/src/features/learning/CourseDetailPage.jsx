import React, { useEffect, useState, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import { coursesApi } from '../../api/coursesApi.js';
import { learningApi } from '../../api/learningApi.js';
import { ErrorMessage } from '../../components/common/ErrorMessage.jsx';
import { Spinner } from '../../components/common/Spinner.jsx';
import StarRating from '../../components/common/StarRating.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import CourseReviewsTab from '../reviews/CourseReviewsTab.jsx';
import CourseDiscussionTab from '../discussions/CourseDiscussionTab.jsx';

const CourseDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const toast = useToast();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('lessons'); // 'lessons' | 'discussion' | 'reviews'

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const details = await coursesApi.getCourse(id);
      setCourse(details);
      const isOwner = user.role === 'instructor' && details.instructor_id === user.id;
      if (details.is_enrolled || isOwner) {
        const items = await learningApi.lessons(id);
        setLessons(items);
      }
    } catch (err) {
      setError(err.message || 'Could not load this course');
    } finally {
      setLoading(false);
    }
  }, [id, user.id, user.role]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const enroll = async () => {
    setError('');
    setEnrolling(true);
    try {
      await learningApi.enroll(id);
      toast.success('Successfully enrolled! Welcome to the course.');
      await loadData();
    } catch (err) {
      toast.error(err.message || 'Could not enroll in this course');
      setError(err.message || 'Could not enroll in this course');
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) return <Spinner />;
  if (!course && error) {
    return (
      <main className="container page">
        <ErrorMessage message={error} />
        <Link className="text-link" to="/courses">Back to courses</Link>
      </main>
    );
  }
  if (!course) return null;

  const isOwner = user.role === 'instructor' && course.instructor_id === user.id;
  const enrolled = Boolean(course.is_enrolled) || isOwner;
  const isStudent = user.role === 'student';

  const completedCount = lessons.filter((l) => l.completed).length;

  return (
    <main className="container page">
      <ErrorMessage message={error} />
      <Link className="text-link back-link" to="/courses">← All courses</Link>

      {/* Course Hero Card */}
      <article className="card course-detail" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.8rem' }}>
          <span className="badge">{course.category}</span>
          {course.avg_rating > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.92rem' }}>
              <StarRating rating={course.avg_rating} size="1rem" />
              <strong>{course.avg_rating.toFixed(1)}</strong>
              <span className="muted">({course.review_count} {course.review_count === 1 ? 'review' : 'reviews'})</span>
            </div>
          )}
        </div>

        <h1>{course.title}</h1>
        <p className="muted" style={{ marginBottom: '0.8rem' }}>
          Taught by <strong>{course.instructor_name}</strong>
        </p>
        <p className="detail-description">{course.description}</p>

        <div className="course-meta" style={{ marginBottom: '1.2rem' }}>
          <span>📚 {course.lesson_count} {course.lesson_count === 1 ? 'lesson' : 'lessons'}</span>
          <span>👥 {course.enrollment_count} learners enrolled</span>
          {enrolled && isStudent && (
            <span>✓ Progress: {completedCount} / {lessons.length} complete</span>
          )}
        </div>

        {/* Action Row */}
        <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {!enrolled && isStudent && (
            <button className="btn" type="button" disabled={enrolling} onClick={enroll}>
              {enrolling ? 'Enrolling...' : 'Enroll for free'}
            </button>
          )}
          {isOwner && (
            <Link className="btn" to={`/instructor/courses/${course.id}/edit`}>Manage course</Link>
          )}
        </div>
      </article>

      {/* Tabs Navigation */}
      {enrolled && (
        <div className="course-tabs-nav" style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.2rem', borderBottom: '2px solid var(--border-color, #e4e9f2)', paddingBottom: '0.5rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'lessons' ? 'tab-btn-active' : ''}`}
            onClick={() => setActiveTab('lessons')}
          >
            📖 Lessons ({lessons.length})
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'discussion' ? 'tab-btn-active' : ''}`}
            onClick={() => setActiveTab('discussion')}
          >
            💬 Discussion Forum (Q&A)
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'reviews' ? 'tab-btn-active' : ''}`}
            onClick={() => setActiveTab('reviews')}
          >
            ⭐ Reviews & Feedback ({course.review_count || 0})
          </button>
        </div>
      )}

      {/* Tab Panels */}
      {enrolled && (
        <div>
          {activeTab === 'lessons' && (
            <section className="card lesson-outline">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
                <h2 style={{ margin: 0 }}>Course Lessons</h2>
                <span className="muted" style={{ fontSize: '0.88rem' }}>
                  {completedCount} of {lessons.length} complete
                </span>
              </div>
              {lessons.length === 0 ? (
                <p className="muted">The instructor has not added lessons yet.</p>
              ) : (
                <ol className="lesson-list">
                  {lessons.map((lesson) => (
                    <li key={lesson.id}>
                      {lesson.completed ? (
                        <span className="completion-mark" aria-label="Completed">✓</span>
                      ) : (
                        <span className="lesson-number">{lesson.position}</span>
                      )}
                      <Link to={`/courses/${course.id}/lessons/${lesson.id}`}>{lesson.title}</Link>
                      {lesson.completed && <span className="muted" style={{ fontSize: '0.82rem' }}>Completed</span>}
                    </li>
                  ))}
                </ol>
              )}
            </section>
          )}

          {activeTab === 'discussion' && (
            <CourseDiscussionTab
              courseId={course.id}
              user={user}
            />
          )}

          {activeTab === 'reviews' && (
            <CourseReviewsTab
              courseId={course.id}
              isEnrolled={enrolled}
              isStudent={isStudent}
            />
          )}
        </div>
      )}

      {/* Public reviews section if not enrolled */}
      {!enrolled && (
        <div style={{ marginTop: '1.5rem' }}>
          <CourseReviewsTab
            courseId={course.id}
            isEnrolled={false}
            isStudent={isStudent}
          />
        </div>
      )}
    </main>
  );
};

export default CourseDetailPage;
