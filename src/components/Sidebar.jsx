import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { navItemsForRole } from '../nav';
import RoleSwitcher from './RoleSwitcher';

export default function Sidebar({ open, onClose }) {
  const { profile, currentRole, logout } = useAuth();
  const navigate = useNavigate();
  const items = navItemsForRole(currentRole);

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <>
      <div
        className={`sidebar-overlay ${open ? 'visible' : ''}`}
        onClick={onClose}
      />
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <span className="material-symbols-outlined sidebar-brand-icon">school</span>
          <div>
            <div className="sidebar-brand-title">UBB Info</div>
            <div className="sidebar-brand-subtitle">Portal Academic</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {items.map((item) => (
            <NavLink
              key={item.key}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'active' : ''}`
              }
              onClick={onClose}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-user">
          <div className="sidebar-user-row">
            <div className="avatar">{profile?.initials || '—'}</div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{profile?.short_name || profile?.full_name}</div>
              <div className="sidebar-user-id">
                {profile?.student_id || profile?.email}
              </div>
            </div>
          </div>

          <RoleSwitcher />

          <button type="button" className="sidebar-action">
            <span className="material-symbols-outlined">settings</span>
            <span>Setări Cont</span>
          </button>

          <button
            type="button"
            className="sidebar-action sidebar-action-danger"
            onClick={handleLogout}
          >
            <span className="material-symbols-outlined">logout</span>
            <span>Deconectare</span>
          </button>
        </div>
      </aside>
    </>
  );
}
