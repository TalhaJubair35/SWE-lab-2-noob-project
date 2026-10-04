import { Navigate, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from './components/common/ProtectedRoute.jsx';
import { Navbar } from './components/common/Navbar.jsx';
import { Spinner } from './components/common/Spinner.jsx';
import { useAuth } from './context/AuthContext.jsx';
import LoginPage from './pages/auth/LoginPage.jsx';
import RegisterPage from './pages/auth/RegisterPage.jsx';
import CourseListPage from './features/courses/CourseListPage.jsx';
import InstructorDashboard from './features/courses/InstructorDashboard.jsx';
import CourseFormPage from './features/courses/CourseFormPage.jsx';
import CourseDetailPage from './features/learning/CourseDetailPage.jsx';
import MyCoursesPage from './features/learning/MyCoursesPage.jsx';
import LessonPage from './features/learning/LessonPage.jsx';

const HomeRedirect = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <Spinner />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={user.role === 'instructor' ? '/instructor' : '/courses'} replace />;
};

export default function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <Spinner />;
  }

  return (
    <>
      {user && <Navbar />}
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/" element={<HomeRedirect />} />

        <Route path="/courses" element={<ProtectedRoute><CourseListPage /></ProtectedRoute>} />
        <Route path="/instructor" element={<ProtectedRoute role="instructor"><InstructorDashboard /></ProtectedRoute>} />
        <Route path="/instructor/courses/new" element={<ProtectedRoute role="instructor"><CourseFormPage /></ProtectedRoute>} />
        <Route path="/instructor/courses/:id/edit" element={<ProtectedRoute role="instructor"><CourseFormPage /></ProtectedRoute>} />
        <Route path="/courses/:id" element={<ProtectedRoute><CourseDetailPage /></ProtectedRoute>} />
        <Route path="/my-courses" element={<ProtectedRoute><MyCoursesPage /></ProtectedRoute>} />
        <Route path="/courses/:courseId/lessons/:lessonId" element={<ProtectedRoute><LessonPage /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to={user ? (user.role === 'instructor' ? '/instructor' : '/courses') : '/login'} replace />} />
      </Routes>
    </>
  );
}
