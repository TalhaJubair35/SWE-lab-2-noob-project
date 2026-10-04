import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { learningApi } from '../../api/learningApi.js';
import { ErrorMessage } from '../../components/common/ErrorMessage.jsx';
import { Spinner } from '../../components/common/Spinner.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

const LessonPage = () => {
  const { courseId, lessonId } = useParams();
  const { user } = useAuth();
  const [lesson, setLesson] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [markingComplete, setMarkingComplete] = useState(false);
  const [error, setError] = useState('');

  const loadLesson = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [current, courseLessons] = await Promise.all([
        learningApi.lesson(lessonId),
        learningApi.lessons(courseId),
      ]);
      setLesson(current);
      setLessons(courseLessons);
    } catch (err) {
      setError(err.message || 'Could not load lesson');
    } finally {
      setLoading(false);
    }
  }, [courseId, lessonId]);

  useEffect(() => { loadLesson(); }, [loadLesson]);

  const completeLesson = async () => {
    setMarkingComplete(true);
    setError('');
    try {
      await learningApi.complete(lessonId);
      await loadLesson();
    } catch (err) {
      setError(err.message || 'Could not update lesson progress');
    } finally {
      setMarkingComplete(false);
    }
  };

  if (loading) return <Spinner />;
  if (!lesson) return <main className="container page"><ErrorMessage message={error} /><Link className="text-link" to={`/courses/${courseId}`}>Back to course</Link></main>;
  const currentIndex = lessons.findIndex((item) => String(item.id) === String(lessonId));
  const nextLesson = lessons[currentIndex + 1];
  const isStudent = user.role === 'student';

  return (
    <main className="container page">
      <Link className="text-link back-link" to={`/courses/${courseId}`}>← {lesson.course_title}</Link>
      <ErrorMessage message={error} />
      <div className="lesson-layout">
        <article className="card lesson-content">
          <p className="eyebrow">Lesson {currentIndex + 1} of {lessons.length}</p>
          <h1>{lesson.title}</h1>
          <div className="lesson-body">{lesson.content}</div>
          {isStudent && (
            <div className="lesson-footer">
              {lesson.completed ? <span className="badge badge-success">Lesson completed</span> : (
                <button className="btn" type="button" onClick={completeLesson} disabled={markingComplete}>
                  {markingComplete ? 'Saving progress...' : 'Mark as complete'}
                </button>
              )}
              {lesson.completed && nextLesson && <Link className="btn" to={`/courses/${courseId}/lessons/${nextLesson.id}`}>Next lesson</Link>}
              {lesson.completed && !nextLesson && <strong className="completion-message">Course complete. Great work!</strong>}
            </div>
          )}
        </article>
        <aside className="card lesson-sidebar">
          <h2>Course contents</h2>
          <ol className="lesson-list">
            {lessons.map((item, index) => (
              <li className={String(item.id) === String(lessonId) ? 'lesson-current' : ''} key={item.id}>
                {item.completed ? <span className="completion-mark">✓</span> : <span className="lesson-number">{index + 1}</span>}
                <Link to={`/courses/${courseId}/lessons/${item.id}`}>{item.title}</Link>
              </li>
            ))}
          </ol>
        </aside>
      </div>
    </main>
  );
};

export default LessonPage;
