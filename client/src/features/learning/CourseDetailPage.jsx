import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { coursesApi } from '../../api/coursesApi.js';
import { learningApi } from '../../api/learningApi.js';
import { ErrorMessage } from '../../components/common/ErrorMessage.jsx';
import { Spinner } from '../../components/common/Spinner.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

const CourseDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    Promise.all([coursesApi.getCourse(id)])
      .then(async ([details]) => {
        if (!active) return;
        setCourse(details);
        const isOwner = user.role === 'instructor' && details.instructor_id === user.id;
        if (details.is_enrolled || isOwner) {
          const items = await learningApi.lessons(id);
          if (active) setLessons(items);
        }
      })
      .catch((err) => {
        if (active) setError(err.message || 'Could not load this course');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [id, user.id, user.role]);

  const enroll = async () => {
    setError('');
    setEnrolling(true);
    try {
      await learningApi.enroll(id);
      setCourse((current) => ({ ...current, is_enrolled: 1, enrollment_count: current.enrollment_count + 1 }));
      setLessons(await learningApi.lessons(id));
    } catch (err) {
      setError(err.message || 'Could not enroll in this course');
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) return <Spinner />;
  if (!course && error) return <main className="container page"><ErrorMessage message={error} /><Link className="text-link" to="/courses">Back to courses</Link></main>;
  if (!course) return null;

  const isOwner = user.role === 'instructor' && course.instructor_id === user.id;
  const enrolled = Boolean(course.is_enrolled) || isOwner;

  return (
    <main className="container page">
      <ErrorMessage message={error} />
      <Link className="text-link back-link" to="/courses">← All courses</Link>
      <article className="card course-detail">
        <span className="badge">{course.category}</span>
        <h1>{course.title}</h1>
        <p className="muted">Taught by {course.instructor_name}</p>
        <p className="detail-description">{course.description}</p>
        <div className="course-meta">
          <span>{course.lesson_count} {course.lesson_count === 1 ? 'lesson' : 'lessons'}</span>
          <span>{course.enrollment_count} learners enrolled</span>
        </div>
        {!enrolled && user.role === 'student' && (
          <button className="btn" type="button" disabled={enrolling} onClick={enroll}>
            {enrolling ? 'Enrolling...' : 'Enroll for free'}
          </button>
        )}
        {isOwner && <Link className="btn" to={`/instructor/courses/${course.id}/edit`}>Manage course</Link>}
      </article>

      {enrolled && (
        <section className="card lesson-outline">
          <h2>Course lessons</h2>
          {lessons.length === 0 ? <p className="muted">The instructor has not added lessons yet.</p> : (
            <ol className="lesson-list">
              {lessons.map((lesson) => (
                <li key={lesson.id}>
                  {lesson.completed ? <span className="completion-mark" aria-label="Completed">✓</span> : <span className="lesson-number">{lesson.position}</span>}
                  <Link to={`/courses/${course.id}/lessons/${lesson.id}`}>{lesson.title}</Link>
                  {lesson.completed && <span className="muted">Completed</span>}
                </li>
              ))}
            </ol>
          )}
        </section>
      )}
    </main>
  );
};

export default CourseDetailPage;
