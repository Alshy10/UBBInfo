import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { formatRomanianDate } from '../../utils/format';
import Overview from './Overview';
import Users from './Users';
import Courses from './Courses';
import Links from './Links';
import Calendar from './Calendar';
import OrarEditor from './OrarEditor';
import ConturiAdmisi from './ConturiAdmisi';
import Evaluari from './Evaluari';

const TABS = [
  { key: 'overview', label: 'Prezentare generală', icon: 'dashboard' },
  { key: 'users', label: 'Utilizatori', icon: 'group' },
  { key: 'courses', label: 'Discipline', icon: 'menu_book' },
  { key: 'orar', label: 'Orar', icon: 'calendar_view_week' },
  { key: 'calendar', label: 'Calendar', icon: 'calendar_month' },
  { key: 'evaluari', label: 'Evaluări', icon: 'reviews' },
  { key: 'links', label: 'Linkuri utile', icon: 'link' },
  { key: 'admisi', label: 'Conturi admiși', icon: 'group_add' },
];

export default function AdminDashboard() {
  const { profile } = useAuth();
  const [tab, setTab] = useState('overview');

  return (
    <div className="page">
      <section className="welcome-card">
        <span className="material-symbols-outlined welcome-bg-icon">admin_panel_settings</span>
        <h1 className="welcome-title">Panou Administrare</h1>
        <p className="welcome-subtitle">
          {profile?.full_name} · {formatRomanianDate()}
        </p>
      </section>

      <div className="admin-tabs">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            className={`admin-tab ${tab === t.key ? 'active' : ''}`}
            onClick={() => setTab(t.key)}
          >
            <span className="material-symbols-outlined">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'overview' && <Overview />}
      {tab === 'users' && <Users />}
      {tab === 'courses' && <Courses />}
      {tab === 'orar' && <OrarEditor />}
      {tab === 'calendar' && <Calendar />}
      {tab === 'evaluari' && <Evaluari />}
      {tab === 'links' && <Links />}
      {tab === 'admisi' && <ConturiAdmisi />}
    </div>
  );
}
