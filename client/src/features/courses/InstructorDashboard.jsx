import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { coursesApi } from '../../api/coursesApi.js';
import { ErrorMessage } from '../../components/common/ErrorMessage.jsx';
import { Spinner } from '../../components/common/Spinner.jsx';

const InstructorDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadCourses = useCallback(async () => {
    setError('');
    try {
      setCourses(await coursesApi.mine());
    } catch (err) {
      setError(err.message || 'Could not load your courses');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  const deleteCourse = async (course) => {
    if (!window.confirm(`Delete "${course.title}" and all its lessons?`)) return;
    setError('');
    try {
      await coursesApi.remove(course.id);
      setCourses((current) => current.filter((item) => item.id !== course.id));
    } catch (err) {
      setError(err.message || 'Could not delete course');
    }
  };

  const totalLearners = courses.reduce((total, course) => total + course.enrollment_count, 0);
  const totalLessons = courses.reduce((total, course) => total + course.lesson_count, 0);

  return (
    <main className="container page">
      <header className="page-heading">
        <div>
          <p className="eyebrow">Instructor workspace</p>
          <h1>Your teaching dashboard</h1>
          <p className="muted">Create courses, add lessons, and keep track of learners.</p>
        </div>
        <Link className="btn" to="/instructor/courses/new">Create course</Link>
      </header>

      <ErrorMessage message={error} />
      {loading ? <Spinner /> : (
        <>
          <section className="stats-grid" aria-label="Teaching statistics">
            <div className="card stat-card"><span className="muted">Courses</span><strong>{courses.length}</strong></div>
            <div className="card stat-card"><span className="muted">Lessons</span><strong>{totalLessons}</strong></div>
            <div className="card stat-card"><span className="muted">Learner enrollments</span><strong>{totalLearners}</strong></div>
          </section>

          {courses.length === 0 ? (
            <div className="card empty-state">
              <h2>Your first course starts here</h2>
              <p className="muted">Create a course and add lessons for students to learn.</p>
              <Link className="btn" to="/instructor/courses/new">Create your first course</Link>
            </div>
          ) : (
            <section className="card table-card">
              <h2>Your courses</h2>
              <div className="table-scroll">
                <table>
                  <thead><tr><th>Course</th><th>Lessons</th><th>Learners</th><th>Actions</th></tr></thead>
                  <tbody>
                    {courses.map((course) => (
                      <tr key={course.id}>
                        <td><strong>{course.title}</strong><span className="table-subtitle">{course.category}</span></td>
                        <td>{course.lesson_count}</td>
                        <td>{course.enrollment_count}</td>
                        <td className="table-actions">
                          <Link className="text-link" to={`/instructor/courses/${course.id}/edit`}>Manage</Link>
                          <button className="text-button danger-text" type="button" onClick={() => deleteCourse(course)}>Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </>
      )}
    </main>
  );
};

export default InstructorDashboard;
