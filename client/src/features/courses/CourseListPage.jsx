import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ErrorMessage } from '../../components/common/ErrorMessage.jsx';
import { Spinner } from '../../components/common/Spinner.jsx';
import StarRating from '../../components/common/StarRating.jsx';
import { coursesApi } from '../../api/coursesApi.js';

export const CourseListPage = () => {
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

  const getCourseTheme = (cat, title) => {
    const text = (cat + ' ' + title).toLowerCase();
    if (text.includes('javascript') || text.includes('program')) {
      return {
        gradient: 'linear-gradient(135deg, #312e81 0%, #4f46e5 100%)',
        icon: '⚡',
        level: 'Core Curriculum',
      };
    }
    if (text.includes('design') || text.includes('ui') || text.includes('web')) {
      return {
        gradient: 'linear-gradient(135deg, #075985 0%, #0284c7 100%)',
        icon: '🎨',
        level: 'Creative Lab',
      };
    }
    if (text.includes('database') || text.includes('sql') || text.includes('data')) {
      return {
        gradient: 'linear-gradient(135deg, #064e3b 0%, #059669 100%)',
        icon: '🗄️',
        level: 'Data Systems',
      };
    }
    return {
      gradient: 'linear-gradient(135deg, #581c87 0%, #7c3aed 100%)',
      icon: '🎓',
      level: 'Advanced Study',
    };
  };

  return (
    <main className="container page">
      {/* Hero Welcome Banner */}
      <div className="card catalog-hero-card" style={{ marginBottom: '1.8rem', padding: '2rem 2.2rem', position: 'relative', overflow: 'hidden', background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.08) 0%, rgba(99, 102, 241, 0.02) 100%)', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
        <div style={{ maxWidth: '680px' }}>
          <span className="badge" style={{ marginBottom: '0.6rem' }}>Academic Catalog • Semester 3-1</span>
          <h1 style={{ fontSize: '2.4rem', margin: '0.2rem 0 0.6rem', letterSpacing: '-0.03em' }}>Explore University Courses</h1>
          <p className="muted" style={{ fontSize: '1.05rem', margin: 0, lineHeight: 1.5 }}>
            Master software engineering competencies with interactive lessons, graded assessments, verified credentials, and active peer collaboration.
          </p>
        </div>
      </div>

      <section className="card filter-bar" aria-label="Course filters">
        <label className="filter-search">
          <span className="sr-only">Search courses</span>
          <input
            className="input"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="🔍 Search by course title, topic, or keyword..."
          />
        </label>
        <label>
          <span className="sr-only">Filter by category</span>
          <select className="input" value={category} onChange={(event) => setCategory(event.target.value)}>
            <option value="">All Categories ({courses.length})</option>
            {categories.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </label>
      </section>

      <ErrorMessage message={error} />

      {loading ? (
        <Spinner />
      ) : courses.length === 0 ? (
        <div className="card empty-state">
          <h2>No courses found</h2>
          <p className="muted">Try adjusting your search criteria or select another category.</p>
        </div>
      ) : (
        <section className="course-grid" aria-label="Available courses">
          {courses.map((course) => {
            const theme = getCourseTheme(course.category, course.title);
            const initials = (course.instructor_name || 'IN')
              .split(' ')
              .map((n) => n[0])
              .join('')
              .slice(0, 2);

            return (
              <article className="card course-card modern-course-card" key={course.id}>
                {/* Visual Header Banner */}
                <div
                  className="course-card-visual"
                  style={{
                    background: theme.gradient,
                    padding: '1.2rem 1.4rem',
                    borderRadius: '12px 12px 0 0',
                    margin: '-1.35rem -1.35rem 1rem -1.35rem',
                    color: '#ffffff',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    position: 'relative',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span style={{ fontSize: '1.6rem' }}>{theme.icon}</span>
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', opacity: 0.9 }}>
                      {theme.level}
                    </span>
                  </div>
                  {course.is_enrolled ? (
                    <span className="badge badge-success" style={{ background: '#10b981', color: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
                      ✓ Enrolled
                    </span>
                  ) : (
                    <span className="badge" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)' }}>
                      {course.category}
                    </span>
                  )}
                </div>

                <h2 style={{ fontSize: '1.3rem', margin: '0 0 0.5rem', lineHeight: 1.3 }}>{course.title}</h2>
                <p className="muted course-description" style={{ fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '0.8rem' }}>
                  {course.description}
                </p>

                {/* Rating Bar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.9rem', fontSize: '0.88rem' }}>
                  {course.avg_rating > 0 ? (
                    <>
                      <StarRating rating={course.avg_rating} size="1rem" />
                      <strong style={{ color: 'var(--text-main)' }}>{course.avg_rating.toFixed(1)}</strong>
                      <span className="muted">({course.review_count} {course.review_count === 1 ? 'review' : 'reviews'})</span>
                    </>
                  ) : (
                    <span className="muted" style={{ fontSize: '0.82rem' }}>★ New Academic Offering</span>
                  )}
                </div>

                {/* Instructor & Meta */}
                <div className="course-meta-row" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.7rem 0', borderTop: '1px solid var(--border-color)', width: '100%', marginBottom: '1rem', fontSize: '0.85rem' }}>
                  <div
                    style={{
                      width: '30px',
                      height: '30px',
                      borderRadius: '50%',
                      background: '#4f46e5',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      flexShrink: 0,
                    }}
                  >
                    {initials}
                  </div>
                  <div style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    <span className="muted" style={{ display: 'block', fontSize: '0.75rem' }}>Instructor</span>
                    <strong>{course.instructor_name}</strong>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <span className="muted" style={{ display: 'block', fontSize: '0.75rem' }}>Curriculum</span>
                    <span>{course.lesson_count} {course.lesson_count === 1 ? 'Lesson' : 'Lessons'}</span>
                  </div>
                </div>

                <Link
                  className={`btn ${course.is_enrolled ? 'btn-primary' : 'btn-primary'}`}
                  to={`/courses/${course.id}`}
                  style={{ width: '100%', marginTop: 'auto', fontWeight: 700 }}
                >
                  {course.is_enrolled ? 'Continue Learning →' : 'View Course Curriculum →'}
                </Link>
              </article>
            );
          })}
        </section>
      )}
    </main>
  );
};

export default CourseListPage;
