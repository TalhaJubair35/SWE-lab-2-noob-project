import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  if (!user) {
    return null;
  }

  const items =
    user.role === 'instructor'
      ? [
          { label: 'Catalog', to: '/courses' },
          { label: 'Instructor Hub', to: '/instructor' },
          { label: 'Analytics', to: '/analytics' },
        ]
      : [
          { label: 'Browse Courses', to: '/courses' },
          { label: 'My Enrolled Courses', to: '/my-courses' },
          { label: 'Learning Analytics', to: '/analytics' },
        ];

  return (
    <nav className="container app-nav">
      <div className="card nav-card">
        <Link className="brand" to={user.role === 'instructor' ? '/instructor' : '/courses'}>
          Learn<span>Hub</span>
        </Link>
        <div className="nav-links">
          {items.map((item) => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
              {item.label}
            </NavLink>
          ))}
        </div>
        <div className="nav-user" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <button
            className="theme-toggle-btn"
            type="button"
            onClick={toggleTheme}
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
            aria-label="Toggle Theme"
            style={{
              background: 'transparent',
              border: '1px solid var(--border-color, #cbd4e1)',
              borderRadius: '8px',
              padding: '0.4rem 0.65rem',
              cursor: 'pointer',
              fontSize: '1rem',
              lineHeight: 1,
            }}
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
          <span className="nav-user-name" title={user.name}>{user.name}</span>
          <button className="btn btn-secondary btn-small" type="button" onClick={logout}>
            Log out
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
