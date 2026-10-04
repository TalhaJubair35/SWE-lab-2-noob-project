import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { ErrorMessage } from '../../components/common/ErrorMessage.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

const LoginPage = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, login } = useAuth();
  const navigate = useNavigate();

  if (user) {
    return <Navigate to={user.role === 'instructor' ? '/instructor' : '/courses'} replace />;
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const loggedInUser = await login(form.email, form.password);
      navigate(loggedInUser.role === 'instructor' ? '/instructor' : '/courses');
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container page">
      <div className="card" style={{ maxWidth: '480px', margin: '0 auto' }}>
        <h2>Login</h2>
        <form onSubmit={handleSubmit} className="form-row">
          <div>
            <label htmlFor="email">Email</label>
            <input className="input" id="email" name="email" type="email" value={form.email} onChange={handleChange} />
          </div>

          <div>
            <label htmlFor="password">Password</label>
            <input className="input" id="password" name="password" type="password" value={form.password} onChange={handleChange} />
          </div>

          <div className="form-actions">
            <button className="btn" type="submit" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
            <Link className="link" to="/register">Create account</Link>
          </div>
        </form>

        <ErrorMessage message={error} />
      </div>
    </div>
  );
};

export default LoginPage;
