import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ErrorMessage } from '../../components/common/ErrorMessage.jsx';
import { Spinner } from '../../components/common/Spinner.jsx';
import { coursesApi } from '../../api/coursesApi.js';

const CourseListPage = () => {
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    coursesApi.list({ search, category })
      .then((items) => {
        if (active) setCourses(items);
      })
      .catch((err) => {
        if (active) setError(err.message || 'Could not load courses');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [search, category]);

  const categories = useMemo(
    () => [...new Set(courses.map((course) => course.category))].sort(),
    [courses]
  );

  return (
    <main className="container page">
      <header className="page-heading">
        <div>
          <p className="eyebrow">Learn something new</p>
          <h1>Explore courses</h1>
          <p className="muted">Find a course and learn at your own pace.</p>
        </div>
      </header>

      <section className="card filter-bar" aria-label="Course filters">
        <label className="filter-search">
          <span className="sr-only">Search courses</span>
          <input
            className="input"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by title, topic, or description"
          />
        </label>
        <label>
          <span className="sr-only">Filter by category</span>
          <select className="input" value={category} onChange={(event) => setCategory(event.target.value)}>
            <option value="">All categories</option>
            {categories.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </label>
      </section>

      <ErrorMessage message={error} />
      {loading ? <Spinner /> : courses.length === 0 ? (
        <div className="card empty-state">
          <h2>No courses found</h2>
          <p className="muted">Try a different search or check back later.</p>
        </div>
      ) : (
        <section className="course-grid" aria-label="Available courses">
          {courses.map((course) => (
            <article className="card course-card" key={course.id}>
              <div className="course-card-top">
                <span className="badge">{course.category}</span>
                {course.is_enrolled ? <span className="badge badge-success">Enrolled</span> : null}
              </div>
              <h2>{course.title}</h2>
              <p className="muted course-description">{course.description}</p>
              <div className="course-meta">
                <span>By {course.instructor_name}</span>
                <span>{course.lesson_count} {course.lesson_count === 1 ? 'lesson' : 'lessons'}</span>
                <span>{course.enrollment_count} {course.enrollment_count === 1 ? 'learner' : 'learners'}</span>
              </div>
              <Link className="btn" to={`/courses/${course.id}`}>
                {course.is_enrolled ? 'Continue learning' : 'View course'}
              </Link>
            </article>
          ))}
        </section>
      )}
    </main>
  );
};

export default CourseListPage;
