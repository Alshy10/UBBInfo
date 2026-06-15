import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function RoleSwitcher() {
  const { roles, currentRole, activeRole, switchRole } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function onClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  // Only render when the user has more than one role
  if (roles.length <= 1) return null;

  const handleSelect = (roleName) => {
    setOpen(false);
    if (roleName !== currentRole) {
      switchRole(roleName);
      navigate('/'); // reset navigation to Acasă on role switch
    }
  };

  return (
    <div className="role-switcher" ref={ref}>
      <button
        type="button"
        className="role-switcher-btn"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <span className="material-symbols-outlined">{activeRole?.icon}</span>
        <span className="role-switcher-label">{activeRole?.label}</span>
        <span className="material-symbols-outlined role-switcher-chevron">
          {open ? 'expand_more' : 'expand_less'}
        </span>
      </button>

      {open && (
        <ul className="role-switcher-menu">
          {roles.map((r) => (
            <li key={r.name}>
              <button
                type="button"
                className={`role-switcher-option ${
                  r.name === currentRole ? 'active' : ''
                }`}
                onClick={() => handleSelect(r.name)}
              >
                <span className="material-symbols-outlined">{r.icon}</span>
                <span>{r.label}</span>
                {r.name === currentRole && (
                  <span className="material-symbols-outlined check">check</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
