import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { coursesApi } from '../../api/coursesApi.js';
import { learningApi } from '../../api/learningApi.js';
import { ErrorMessage } from '../../components/common/ErrorMessage.jsx';
import { Spinner } from '../../components/common/Spinner.jsx';

const blankCourse = { title: '', description: '', category: '' };
const blankLesson = { title: '', content: '' };

const CourseFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(blankCourse);
  const [lessonForm, setLessonForm] = useState(blankLesson);
  const [editingLessonId, setEditingLessonId] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(Boolean(id));
  const [saving, setSaving] = useState(false);
  const [savingLesson, setSavingLesson] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    let active = true;
    setLoading(true);
    setError('');
    Promise.all([coursesApi.getCourse(id), learningApi.lessons(id)])
      .then(([course, courseLessons]) => {
        if (!active) return;
        setForm({ title: course.title, description: course.description, category: course.category });
        setLessons(courseLessons);
      })
      .catch((err) => {
        if (active) setError(err.message || 'Could not load this course');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [id]);

  const handleCourseChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const saveCourse = async (event) => {
    event.preventDefault();
    setError('');
    setSaving(true);
    try {
      if (id) {
        await coursesApi.update(id, form);
      } else {
        const created = await coursesApi.create(form);
        navigate(`/instructor/courses/${created.id}/edit`, { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Could not save course');
    } finally {
      setSaving(false);
    }
  };

  const saveLesson = async (event) => {
    event.preventDefault();
    setError('');
    setSavingLesson(true);
    try {
      if (editingLessonId) {
        await coursesApi.updateLesson(id, editingLessonId, lessonForm);
      } else {
        await coursesApi.addLesson(id, lessonForm);
      }
      setLessons(await learningApi.lessons(id));
      setLessonForm(blankLesson);
      setEditingLessonId(null);
    } catch (err) {
      setError(err.message || 'Could not save lesson');
    } finally {
      setSavingLesson(false);
    }
  };

  const editLesson = async (lessonId) => {
    setError('');
    try {
      const lesson = await learningApi.lesson(lessonId);
      setLessonForm({ title: lesson.title, content: lesson.content });
      setEditingLessonId(lessonId);
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    } catch (err) {
      setError(err.message || 'Could not load lesson');
    }
  };

  const deleteLesson = async (lesson) => {
    if (!window.confirm(`Delete "${lesson.title}"? Its progress records will also be removed.`)) return;
    setError('');
    try {
      await coursesApi.removeLesson(id, lesson.id);
      setLessons((current) => current.filter((item) => item.id !== lesson.id));
      if (editingLessonId === lesson.id) {
        setLessonForm(blankLesson);
        setEditingLessonId(null);
      }
    } catch (err) {
      setError(err.message || 'Could not delete lesson');
    }
  };

  if (loading) return <Spinner />;

  return (
    <main className="container page">
      <header className="page-heading">
        <div>
          <p className="eyebrow">Instructor workspace</p>
          <h1>{id ? 'Manage course' : 'Create a course'}</h1>
          <p className="muted">Set the course details, then add organized lessons.</p>
        </div>
        <Link className="text-link" to="/instructor">Back to dashboard</Link>
      </header>
      <ErrorMessage message={error} />

      <section className="card form-card">
        <h2>Course details</h2>
        <form className="form-row" onSubmit={saveCourse}>
          <label>Course title
            <input className="input" name="title" value={form.title} onChange={handleCourseChange} minLength="2" required />
          </label>
          <label>Category
            <input className="input" name="category" value={form.category} onChange={handleCourseChange} required placeholder="e.g. Programming" />
          </label>
          <label>Description
            <textarea className="input textarea" name="description" value={form.description} onChange={handleCourseChange} required rows="5" />
          </label>
          <div className="form-actions">
            <button className="btn" type="submit" disabled={saving}>
              {saving ? 'Saving...' : id ? 'Save changes' : 'Create course'}
            </button>
            {id && <span className="muted">Save course details before editing lessons.</span>}
          </div>
        </form>
      </section>

      {id && (
        <section className="card form-card lesson-manager">
          <div className="section-heading">
            <div><h2>Lessons</h2><p className="muted">Lessons appear in the order they are created.</p></div>
          </div>
          {lessons.length === 0 ? <p className="muted">No lessons yet. Add the first one below.</p> : (
            <ol className="lesson-manage-list">
              {lessons.map((lesson) => (
                <li key={lesson.id}>
                  <span><strong>{lesson.position}.</strong> {lesson.title}</span>
                  <span className="table-actions">
                    <button className="text-button" type="button" onClick={() => editLesson(lesson.id)}>Edit</button>
                    <button className="text-button danger-text" type="button" onClick={() => deleteLesson(lesson)}>Delete</button>
                  </span>
                </li>
              ))}
            </ol>
          )}
          <form className="form-row lesson-form" onSubmit={saveLesson}>
            <h3>{editingLessonId ? 'Edit lesson' : 'Add a lesson'}</h3>
            <label>Lesson title
              <input className="input" value={lessonForm.title} onChange={(event) => setLessonForm((current) => ({ ...current, title: event.target.value }))} minLength="2" required />
            </label>
            <label>Lesson content
              <textarea className="input textarea" value={lessonForm.content} onChange={(event) => setLessonForm((current) => ({ ...current, content: event.target.value }))} rows="6" required />
            </label>
            <div className="form-actions">
              <button className="btn" type="submit" disabled={savingLesson}>{savingLesson ? 'Saving...' : editingLessonId ? 'Update lesson' : 'Add lesson'}</button>
              {editingLessonId && <button className="btn btn-secondary" type="button" onClick={() => { setLessonForm(blankLesson); setEditingLessonId(null); }}>Cancel edit</button>}
            </div>
          </form>
        </section>
      )}
    </main>
  );
};

export default CourseFormPage;
