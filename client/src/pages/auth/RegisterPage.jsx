import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { ErrorMessage } from '../../components/common/ErrorMessage.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

const RegisterPage = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, register } = useAuth();
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
      const registeredUser = await register(form);
      navigate(registeredUser.role === 'instructor' ? '/instructor' : '/courses');
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container page">
      <div className="card" style={{ maxWidth: '520px', margin: '0 auto' }}>
        <h2>Register</h2>
        <form onSubmit={handleSubmit} className="form-row">
          <div>
            <label htmlFor="name">Name</label>
            <input className="input" id="name" name="name" value={form.name} onChange={handleChange} />
          </div>

          <div>
            <label htmlFor="email">Email</label>
            <input className="input" id="email" name="email" type="email" value={form.email} onChange={handleChange} />
          </div>

          <div>
            <label htmlFor="password">Password</label>
            <input className="input" id="password" name="password" type="password" value={form.password} onChange={handleChange} />
          </div>

          <div>
            <label htmlFor="role">Role</label>
            <select className="input" id="role" name="role" value={form.role} onChange={handleChange}>
              <option value="student">Student</option>
              <option value="instructor">Instructor</option>
            </select>
          </div>

          <div className="form-actions">
            <button className="btn" type="submit" disabled={loading}>
              {loading ? 'Creating account...' : 'Create account'}
            </button>
            <Link className="link" to="/login">Already have an account?</Link>
          </div>
        </form>

        <ErrorMessage message={error} />
      </div>
    </div>
  );
};

export default RegisterPage;
