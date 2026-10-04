import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

export const Navbar = () => {
  const { user, logout } = useAuth();

  if (!user) {
    return null;
  }

  const items =
    user.role === 'instructor'
      ? [
          { label: 'Courses', to: '/courses' },
          { label: 'Dashboard', to: '/instructor' },
        ]
      : [
          { label: 'Courses', to: '/courses' },
          { label: 'My Courses', to: '/my-courses' },
        ];

  return (
    <nav className="container app-nav">
      <div className="card nav-card">
        <Link className="brand" to={user.role === 'instructor' ? '/instructor' : '/courses'}>Learn<span>Hub</span></Link>
        <div className="nav-links">
          {items.map((item) => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
              {item.label}
            </NavLink>
          ))}
        </div>
        <div className="nav-user">
          <span className="nav-user-name">{user.name}</span>
          <button className="btn btn-secondary btn-small" type="button" onClick={logout}>Log out</button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
