import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setError(false);
    setSubmitting(true);
    try {
      await login(email.trim(), password);
      navigate('/', { replace: true });
    } catch (err) {
      console.error('Login failed:', err);
      setError(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      {/* Left brand panel */}
      <aside className="login-brand">
        <div className="login-brand-inner">
          <span className="material-symbols-outlined login-crest">school</span>
          <h1 className="login-brand-title">Universitatea Babeș-Bolyai</h1>
          <p className="login-brand-subtitle">UBB Info — Portal Academic</p>
          <div className="login-gold-line" />
          <p className="login-tagline">Tradiție și excelență din 1581</p>
        </div>
      </aside>

      {/* Right form panel */}
      <main className="login-form-panel">
        <div className="login-card">
          <h2 className="login-card-title">Conectare</h2>
          <p className="login-card-subtitle">
            Autentifică-te în contul tău instituțional
          </p>

          <form onSubmit={handleSubmit} className="login-form">
            <label className="field">
              <span className="field-label">Email instituțional</span>
              <div className="input-wrap">
                <span className="material-symbols-outlined input-icon">mail</span>
                <input
                  type="email"
                  autoComplete="username"
                  placeholder="prenume.nume@ubbcluj.ro"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </label>

            <label className="field">
              <span className="field-label">Parolă</span>
              <div className="input-wrap">
                <span className="material-symbols-outlined input-icon">lock</span>
                <input
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </label>

            <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
              {submitting ? <span className="spinner" /> : 'Conectare'}
            </button>
          </form>
        </div>

        <div className={`login-error-toast ${error ? 'visible' : ''}`}>
          <span className="material-symbols-outlined">error</span>
          <span>Credențiale invalide. Vă rugăm încercați din nou.</span>
        </div>
      </main>
    </div>
  );
}
