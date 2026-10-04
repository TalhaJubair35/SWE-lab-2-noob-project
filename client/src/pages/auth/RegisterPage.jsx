import React, { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { ErrorMessage } from '../../components/common/ErrorMessage.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';

export const RegisterPage = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { user, register } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  if (user) {
    return <Navigate to={user.role === 'instructor' ? '/instructor' : '/courses'} replace />;
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleRoleSelect = (role) => {
    setForm((prev) => ({ ...prev, role }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const registeredUser = await register(form);
      navigate(registeredUser.role === 'instructor' ? '/instructor' : '/courses');
    } catch (err) {
      setError(err.message || 'Registration failed. Please check your information.');
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
            <span className="auth-hero-badge">🚀 Join LearnHub Academy</span>
            <h1 className="auth-hero-title">
              Start Your Learning<br />
              <span className="gradient-text">Journey Today.</span>
            </h1>
            <p className="auth-hero-desc">
              Whether you are an ambitious student aiming to master software skills or an instructor
              sharing knowledge, LearnHub provides all the tools you need.
            </p>

            <div className="auth-feature-list">
              <div className="auth-feature-item">
                <div className="auth-feature-icon">🎯</div>
                <div>
                  <strong>Personalized Progression</strong>
                  <p>Track your course milestones and view detailed learning analytics.</p>
                </div>
              </div>
              <div className="auth-feature-item">
                <div className="auth-feature-icon">💡</div>
                <div>
                  <strong>Collaborative Learning</strong>
                  <p>Engage with fellow learners and instructors in course discussion forums.</p>
                </div>
              </div>
              <div className="auth-feature-item">
                <div className="auth-feature-icon">📜</div>
                <div>
                  <strong>Academic Credentials</strong>
                  <p>Earn verifiable certificates of completion upon finishing courses.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Modern Registration Form */}
        <div className="auth-form-panel">
          <div className="card auth-form-card">
            <div className="auth-form-header">
              <h2>Create an Account</h2>
              <p className="muted">Join thousands of learners and instructors</p>
            </div>

            <ErrorMessage message={error} />

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label>I want to join as a:</label>
                <div className="role-selector-group">
                  <button
                    type="button"
                    className={`role-btn ${form.role === 'student' ? 'role-btn-active' : ''}`}
                    onClick={() => handleRoleSelect('student')}
                  >
                    🎓 Student
                  </button>
                  <button
                    type="button"
                    className={`role-btn ${form.role === 'instructor' ? 'role-btn-active' : ''}`}
                    onClick={() => handleRoleSelect('instructor')}
                  >
                    👨‍🏫 Instructor
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <div className="input-with-icon">
                  <span className="field-icon">👤</span>
                  <input
                    className="input"
                    id="name"
                    name="name"
                    placeholder="e.g. Alex Johnson"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <div className="input-with-icon">
                  <span className="field-icon">✉</span>
                  <input
                    className="input"
                    id="email"
                    name="email"
                    type="email"
                    placeholder="e.g. alex@example.com"
                    value={form.email}
                    onChange={handleChange}
                    required
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
                    placeholder="Create a secure password"
                    value={form.password}
                    onChange={handleChange}
                    required
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
                {loading ? 'Creating Account...' : 'Complete Registration →'}
              </button>
            </form>

            <div className="auth-form-footer">
              <p className="muted">
                Already registered?{' '}
                <Link className="text-link" to="/login" style={{ fontWeight: 700 }}>
                  Sign in here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
