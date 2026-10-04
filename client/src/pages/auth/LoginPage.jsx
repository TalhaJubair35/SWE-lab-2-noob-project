import React, { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { ErrorMessage } from '../../components/common/ErrorMessage.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';

export const LoginPage = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { user, login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  if (user) {
    return <Navigate to={user.role === 'instructor' ? '/instructor' : '/courses'} replace />;
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const fillDemo = (role) => {
    if (role === 'student') {
      setForm({ email: 'student@demo.com', password: 'Demo@123' });
    } else {
      setForm({ email: 'instructor@demo.com', password: 'Demo@123' });
    }
    setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const loggedInUser = await login(form.email, form.password);
      navigate(loggedInUser.role === 'instructor' ? '/instructor' : '/courses');
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-entrance-wrapper">
      {/* Top Navbar Bar with theme toggle */}
      <div className="auth-top-bar">
        <Link className="brand" to="/login" style={{ fontSize: '1.3rem' }}>
          Learn<span>Hub</span>
        </Link>
        <button
          className="theme-toggle-btn"
          type="button"
          onClick={toggleTheme}
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
        >
          {theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode'}
        </button>
      </div>

      <div className="auth-split-container">
        {/* Left: Inspiring Hero Showcase */}
        <div className="auth-hero-panel">
          <div className="auth-hero-glow" />
          <div className="auth-hero-content">
            <span className="auth-hero-badge">🎓 Next-Gen University Learning</span>
            <h1 className="auth-hero-title">
              Empower Your Mind.<br />
              <span className="gradient-text">Master New Skills.</span>
            </h1>
            <p className="auth-hero-desc">
              Access university-grade curricula, interactive quizzes with instant grading,
              official verifiable certificates, and active discussion forums.
            </p>

            <div className="auth-feature-list">
              <div className="auth-feature-item">
                <div className="auth-feature-icon">📚</div>
                <div>
                  <strong>Structured Curricula</strong>
                  <p>Step-by-step ordered lessons with seamless progress tracking.</p>
                </div>
              </div>
              <div className="auth-feature-item">
                <div className="auth-feature-icon">📝</div>
                <div>
                  <strong>Interactive Assessments</strong>
                  <p>Instant scoring, pass/fail evaluation, and in-depth question review.</p>
                </div>
              </div>
              <div className="auth-feature-item">
                <div className="auth-feature-icon">🏆</div>
                <div>
                  <strong>Verified Certificates</strong>
                  <p>Earn verifiable digital credentials with unique tamper-proof IDs.</p>
                </div>
              </div>
            </div>

            <div className="auth-hero-footer">
              <div className="avatar-pile">
                <span className="mini-avatar" style={{ background: '#3b82f6' }}>JS</span>
                <span className="mini-avatar" style={{ background: '#10b981' }}>UI</span>
                <span className="mini-avatar" style={{ background: '#f59e0b' }}>DB</span>
              </div>
              <span>Trusted by students & professors across disciplines</span>
            </div>
          </div>
        </div>

        {/* Right: Modern Entrance Form */}
        <div className="auth-form-panel">
          <div className="card auth-form-card">
            <div className="auth-form-header">
              <h2>Welcome back!</h2>
              <p className="muted">Sign in to your LearnHub academic account</p>
            </div>

            {/* Quick 1-Click Demo Logins */}
            <div className="demo-credentials-box">
              <span className="demo-box-label">⚡ 1-Click Demo Accounts for Testing:</span>
              <div className="demo-btn-group">
                <button
                  type="button"
                  className={`demo-pill ${form.email === 'student@demo.com' ? 'demo-pill-active' : ''}`}
                  onClick={() => fillDemo('student')}
                >
                  🎓 Student Demo
                </button>
                <button
                  type="button"
                  className={`demo-pill ${form.email === 'instructor@demo.com' ? 'demo-pill-active' : ''}`}
                  onClick={() => fillDemo('instructor')}
                >
                  👨‍🏫 Instructor Demo
                </button>
              </div>
            </div>

            <ErrorMessage message={error} />

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <div className="input-with-icon">
                  <span className="field-icon">✉</span>
                  <input
                    className="input"
                    id="email"
                    name="email"
                    type="email"
                    placeholder="e.g. student@demo.com"
                    value={form.email}
                    onChange={handleChange}
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <div className="input-with-icon">
                  <span className="field-icon">🔒</span>
                  <input
                    className="input"
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={form.password}
                    onChange={handleChange}
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? '👁' : '👁‍🗨'}
                  </button>
                </div>
              </div>

              <button className="btn btn-primary auth-submit-btn" type="submit" disabled={loading}>
                {loading ? 'Authenticating...' : 'Sign in to LearnHub →'}
              </button>
            </form>

            <div className="auth-form-footer">
              <p className="muted">
                New to the platform?{' '}
                <Link className="text-link" to="/register" style={{ fontWeight: 700 }}>
                  Create an account
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
