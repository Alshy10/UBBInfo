import { useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { breadcrumbForPath } from '../nav';

export default function Topbar({ onMenuClick }) {
  const { profile, activeRole } = useAuth();
  const location = useLocation();
  const crumb = breadcrumbForPath(location.pathname);

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button
          type="button"
          className="topbar-menu-btn"
          onClick={onMenuClick}
          aria-label="Meniu"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>
        <nav className="breadcrumb">
          <span className="breadcrumb-root">UBB Info</span>
          <span className="material-symbols-outlined breadcrumb-sep">chevron_right</span>
          <span className="breadcrumb-current">{crumb}</span>
        </nav>
      </div>

      <div className="topbar-right">
        <div className="topbar-search">
          <span className="material-symbols-outlined">search</span>
          <input type="text" placeholder="Caută..." />
        </div>

        <button type="button" className="topbar-bell" aria-label="Notificări">
          <span className="material-symbols-outlined">notifications</span>
          <span className="topbar-bell-dot" />
        </button>

        <div className="topbar-divider" />

        <div className="topbar-user">
          <div className="topbar-user-text">
            <span className="topbar-user-name">{profile?.short_name || profile?.full_name}</span>
            {activeRole && (
              <span className={`badge ${activeRole.badge_class}`}>{activeRole.label}</span>
            )}
          </div>
          <div className="avatar avatar-sm">{profile?.initials || '—'}</div>
        </div>
      </div>
    </header>
  );
}
