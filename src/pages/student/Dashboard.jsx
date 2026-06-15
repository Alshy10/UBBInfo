import { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import { formatRomanianDate, firstNameOf } from '../../utils/format';
import PasswordModal from '../../components/PasswordModal';
import Toast from '../../components/Toast';

const ACADEMIC_YEAR = '2025-2026';
const CURRENT_SEMESTER = 2;

export default function StudentDashboard() {
  const { user, profile } = useAuth();
  const [links, setLinks] = useState([]);
  const [currentCourses, setCurrentCourses] = useState([]);
  const [restante, setRestante] = useState([]);
  const [copied, setCopied] = useState(false);
  const [pwModalOpen, setPwModalOpen] = useState(false);
  const [pwToast, setPwToast] = useState(false);

  useEffect(() => {
    if (!user) return;
    let active = true;

    (async () => {
      const [linksRes, currentRes, restanteRes] = await Promise.all([
        supabase
          .from('useful_links')
          .select('*')
          .eq('is_active', true)
          .order('sort_order'),
        supabase
          .from('enrollments')
          .select('*, courses(*)')
          .eq('student_id', user.id)
          .eq('academic_year', ACADEMIC_YEAR)
          .eq('semester', CURRENT_SEMESTER),
        supabase
          .from('enrollments')
          .select('*, courses(*)')
          .eq('student_id', user.id)
          .eq('is_restanta', true),
      ]);

      if (!active) return;

      setLinks(linksRes.data || []);
      setCurrentCourses(currentRes.data || []);

      // Past restanțe: exclude current semester, only grade < 5 OR null
      const past = (restanteRes.data || []).filter((e) => {
        const isCurrent =
          e.academic_year === ACADEMIC_YEAR && e.semester === CURRENT_SEMESTER;
        const failingOrUngraded = e.grade === null || e.grade < 5;
        return !isCurrent && failingOrUngraded;
      });
      setRestante(past);
    })();

    return () => {
      active = false;
    };
  }, [user]);

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(profile?.email || '');
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  const totalCredits =
    currentCourses.reduce((acc, e) => acc + (e.courses?.credits ?? 0), 0) +
    restante.reduce((acc, e) => acc + (e.courses?.credits ?? 0), 0);

  return (
    <div className="page">
      {/* A. Welcome card */}
      <section className="welcome-card">
        <span className="material-symbols-outlined welcome-bg-icon">school</span>
        <h1 className="welcome-title">
          Bine ai venit, {firstNameOf(profile?.full_name)}!
        </h1>
        <p className="welcome-subtitle">
          Anul universitar 2025-2026, Semestrul 2 · {formatRomanianDate()}
        </p>
      </section>

      {/* B. Two-column grid 7:5 */}
      <div className="grid-7-5">
        {/* Account info */}
        <section className="card">
          <div className="card-header">
            <h2 className="card-title">
              <span className="material-symbols-outlined">account_circle</span>
              Cont Instituțional
            </h2>
            <span className="badge badge-student">Student</span>
          </div>
          <div className="card-body">
            <div className="info-field">
              <span className="info-label">Email instituțional</span>
              <div className="copy-row">
                <span className="info-value mono">{profile?.email}</span>
                <button
                  type="button"
                  className="copy-btn"
                  onClick={handleCopyEmail}
                  aria-label="Copiază email"
                >
                  <span className="material-symbols-outlined">
                    {copied ? 'check' : 'content_copy'}
                  </span>
                </button>
              </div>
            </div>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setPwModalOpen(true)}
            >
              <span className="material-symbols-outlined">key</span>
              Schimbă parola
            </button>
          </div>
        </section>

        {/* Useful links */}
        <section className="card">
          <div className="card-header">
            <h2 className="card-title">
              <span className="material-symbols-outlined">link</span>
              Linkuri Utile
            </h2>
          </div>
          <div className="card-body">
            <ul className="links-list">
              {links.map((l) => (
                <li key={l.id}>
                  <a
                    href={l.url || '#'}
                    className="link-item"
                    target={l.url && l.url !== '#' ? '_blank' : undefined}
                    rel="noreferrer"
                  >
                    <span className="material-symbols-outlined link-icon">{l.icon}</span>
                    <span className="link-title">{l.title}</span>
                    <span className="material-symbols-outlined link-arrow">
                      arrow_forward
                    </span>
                  </a>
                </li>
              ))}
              {links.length === 0 && <li className="muted">Niciun link disponibil.</li>}
            </ul>
          </div>
        </section>
      </div>

      {/* C. Student ID card */}
      <section className="id-card">
        <div className="id-card-left">
          <h3 className="id-card-title">Legitimație Student</h3>
          <div className="id-gold-line" />
          <div className="id-code-label">COD IDENTIFICARE</div>
          <div className="id-code-value mono">{profile?.student_id || '—'}</div>
        </div>
        <div className="id-card-right">
          <div className="id-grid">
            <div className="id-detail">
              <div className="id-detail-label">Facultatea</div>
              <div className="id-detail-value">{profile?.faculty || '—'}</div>
            </div>
            <div className="id-detail">
              <div className="id-detail-label">An Studiu</div>
              <div className="id-detail-value">{profile?.study_year || '—'}</div>
            </div>
            <div className="id-detail">
              <div className="id-detail-label">Specializarea</div>
              <div className="id-detail-value">{profile?.specialization || '—'}</div>
            </div>
            <div className="id-detail">
              <div className="id-detail-label">Nr. Legitimație Transport</div>
              <div className="id-detail-value">{profile?.transport_id || '—'}</div>
            </div>
          </div>
          <div className="id-qr">
            <span className="material-symbols-outlined">qr_code_2</span>
            <span className="id-qr-note">Legitimație validă pentru anul universitar curent</span>
          </div>
        </div>
      </section>

      {/* D. Academic table */}
      <section className="card">
        <div className="card-header">
          <h2 className="card-title">
            <span className="material-symbols-outlined">table_chart</span>
            Situație Academică — Semestrul Curent
          </h2>
          <button type="button" className="btn btn-outline btn-sm">
            <span className="material-symbols-outlined">download</span>
            Descarcă Adeverință
          </button>
        </div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Disciplina</th>
                <th>Credite</th>
                <th>Nota</th>
                <th>Status</th>
                <th>Profil</th>
                <th>Grupa</th>
              </tr>
            </thead>
            <tbody>
              {currentCourses.map((e) => (
                <tr key={e.id}>
                  <td>{e.courses?.name}</td>
                  <td>{e.courses?.credits}</td>
                  <td className="muted">—</td>
                  <td>
                    <span className="status-inprogress">ÎN CURS</span>
                  </td>
                  <td>{e.courses?.profile || '—'}</td>
                  <td>{e.group_name || '—'}</td>
                </tr>
              ))}

              {restante.map((e) => (
                <tr key={e.id}>
                  <td className="text-danger">
                    {e.courses?.name} <span className="restanta-tag">(restanță)</span>
                  </td>
                  <td>{e.courses?.credits}</td>
                  <td className="muted">—</td>
                  <td>
                    <span className="status-inprogress">ÎN CURS</span>
                  </td>
                  <td>{e.courses?.profile || '—'}</td>
                  <td>{e.group_name || '—'}</td>
                </tr>
              ))}

              {currentCourses.length === 0 && restante.length === 0 && (
                <tr>
                  <td colSpan={6} className="muted center">
                    Nicio disciplină înscrisă.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="table-footer">
          Total Credite Înscrise: <strong>{totalCredits}</strong>
        </div>
      </section>

      <PasswordModal
        open={pwModalOpen}
        onClose={() => setPwModalOpen(false)}
        onSuccess={() => {
          setPwToast(true);
          setTimeout(() => setPwToast(false), 3000);
        }}
      />
      <Toast
        visible={pwToast}
        variant="success"
        message="Parola a fost schimbată cu succes!"
      />
    </div>
  );
}
