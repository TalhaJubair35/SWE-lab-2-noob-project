import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { learningApi } from '../../api/learningApi.js';
import { ErrorMessage } from '../../components/common/ErrorMessage.jsx';
import { Spinner } from '../../components/common/Spinner.jsx';

const MyCoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    learningApi.myCourses()
      .then((items) => { if (active) setCourses(items); })
      .catch((err) => { if (active) setError(err.message || 'Could not load your courses'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  return (
    <main className="container page">
      <header className="page-heading">
        <div>
          <p className="eyebrow">Your learning</p>
          <h1>My courses</h1>
          <p className="muted">Pick up where you left off and track your progress.</p>
        </div>
        <Link className="btn btn-secondary" to="/courses">Explore courses</Link>
      </header>
      <ErrorMessage message={error} />
      {loading ? <Spinner /> : courses.length === 0 ? (
        <div className="card empty-state">
          <h2>You haven’t enrolled in a course yet</h2>
          <p className="muted">Browse the catalog and find something you’d like to learn.</p>
          <Link className="btn" to="/courses">Explore courses</Link>
        </div>
      ) : (
        <section className="course-grid">
          {courses.map((course) => (
            <article className="card course-card" key={course.id}>
              <span className="badge">{course.category}</span>
              <h2>{course.title}</h2>
              <p className="muted course-description">{course.description}</p>
              <p className="course-byline">Instructor: {course.instructor_name}</p>
              <div className="progress-summary">
                <div className="progress-label">
                  <span>Progress</span><strong>{course.progress_percent}%</strong>
                </div>
                <div className="progress-bar" role="progressbar" aria-label={`${course.title} progress`} aria-valuenow={course.progress_percent} aria-valuemin="0" aria-valuemax="100">
                  <div className="progress-fill" style={{ width: `${course.progress_percent}%` }} />
                </div>
                <small className="muted">{course.completed_lessons} of {course.lesson_count} lessons complete</small>
              </div>
              <Link className="btn" to={`/courses/${course.id}`}>{course.progress_percent === 100 ? 'Review course' : 'Continue learning'}</Link>
            </article>
          ))}
        </section>
      )}
    </main>
  );
};

export default MyCoursesPage;
