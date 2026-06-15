import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import { formatRomanianDate } from '../../utils/format';

// Only links that actually go somewhere are listed.
const QUICK_ACTIONS = [
  { icon: 'edit_note', label: 'Introducere note', to: '/catalog' },
  { icon: 'event', label: 'Programare examene', to: '/examene' },
];

function typeBadgeClass(type) {
  if (type === 'CURS + LAB') return 'badge-courselab';
  if (type === 'SEMINAR') return 'badge-seminar';
  return 'badge-course';
}

export default function ProfessorDashboard() {
  const { user, profile } = useAuth();
  const [courses, setCourses] = useState([]);
  const [exams, setExams] = useState([]);

  useEffect(() => {
    if (!user) return;
    let active = true;
    (async () => {
      const [coursesRes, examsRes] = await Promise.all([
        supabase
          .from('professor_courses')
          .select('*, courses(*)')
          .eq('professor_id', user.id),
        supabase
          .from('exams')
          .select('*, courses(*)')
          .eq('professor_id', user.id)
          .order('exam_date'),
      ]);
      if (!active) return;
      setCourses(coursesRes.data || []);
      setExams(examsRes.data || []);
    })();
    return () => {
      active = false;
    };
  }, [user]);

  return (
    <div className="page">
      <section className="welcome-card">
        <span className="material-symbols-outlined welcome-bg-icon">person</span>
        <h1 className="welcome-title">Bine ai venit, {profile?.full_name}!</h1>
        <p className="welcome-subtitle">
          Anul universitar 2025-2026 · {formatRomanianDate()}
        </p>
      </section>

      <div className="grid-7-5">
        {/* My courses */}
        <section className="card">
          <div className="card-header">
            <h2 className="card-title">
              <span className="material-symbols-outlined">school</span>
              Cursurile Mele
            </h2>
          </div>
          <div className="card-body">
            <ul className="course-list">
              {courses.map((c) => (
                <li key={c.id} className="course-item">
                  <div className="course-item-main">
                    <span className="course-item-name">{c.courses?.name}</span>
                    <span className="course-item-meta">
                      {c.study_year_label} · {c.student_count} studenți
                    </span>
                  </div>
                  <span className={`badge ${typeBadgeClass(c.type)}`}>{c.type}</span>
                </li>
              ))}
              {courses.length === 0 && <li className="muted">Niciun curs alocat.</li>}
            </ul>
          </div>
        </section>

        {/* Quick actions */}
        <section className="card">
          <div className="card-header">
            <h2 className="card-title">
              <span className="material-symbols-outlined">bolt</span>
              Acțiuni Rapide
            </h2>
          </div>
          <div className="card-body">
            <ul className="links-list">
              {QUICK_ACTIONS.map((a) => (
                <li key={a.label}>
                  <Link to={a.to} className="link-item">
                    <span className="material-symbols-outlined link-icon">{a.icon}</span>
                    <span className="link-title">{a.label}</span>
                    <span className="material-symbols-outlined link-arrow">
                      arrow_forward
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>

      {/* Scheduled exams */}
      <section className="card">
        <div className="card-header">
          <h2 className="card-title">
            <span className="material-symbols-outlined">event_available</span>
            Examene Programate — Sesiune Vară
          </h2>
        </div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Disciplina</th>
                <th>Data</th>
                <th>Ora</th>
                <th>Sala</th>
                <th>Studenți înscriși</th>
              </tr>
            </thead>
            <tbody>
              {exams.map((e) => (
                <tr key={e.id}>
                  <td>{e.courses?.name}</td>
                  <td>{e.exam_date}</td>
                  <td>{e.exam_time ? e.exam_time.slice(0, 5) : '—'}</td>
                  <td>{e.room}</td>
                  <td>{e.enrolled_count}</td>
                </tr>
              ))}
              {exams.length === 0 && (
                <tr>
                  <td colSpan={5} className="muted center">
                    Niciun examen programat.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
