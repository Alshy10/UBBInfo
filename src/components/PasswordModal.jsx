import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../contexts/AuthContext';

export default function PasswordModal({ open, onClose, onSuccess }) {
  const { user, profile } = useAuth();
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  const reset = () => {
    setNewPw('');
    setConfirmPw('');
    setError('');
    setSubmitting(false);
  };

  const close = () => {
    reset();
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (newPw.length < 6) {
      setError('Parola trebuie să aibă cel puțin 6 caractere.');
      return;
    }
    if (newPw !== confirmPw) {
      setError('Parolele nu coincid.');
      return;
    }

    setSubmitting(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPw,
      });
      if (updateError) throw updateError;

      // Offer the browser's password manager a save prompt
      if (window.PasswordCredential) {
        try {
          const cred = new window.PasswordCredential({
            id: user.email,
            password: newPw,
            name: profile?.full_name || user.email,
          });
          await navigator.credentials.store(cred);
        } catch (credErr) {
          console.warn('PasswordCredential store failed:', credErr);
        }
      }

      reset();
      onClose();
      onSuccess?.();
    } catch (err) {
      console.error('Password change failed:', err);
      setError('Nu am putut schimba parola. Încearcă din nou.');
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={close}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Schimbă parola</h3>
          <button type="button" className="modal-close" onClick={close} aria-label="Închide">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          {/* Hidden username for password managers */}
          <input
            type="text"
            autoComplete="username"
            value={user?.email || ''}
            readOnly
            hidden
          />

          <label className="field">
            <span className="field-label">Parolă nouă</span>
            <div className="input-wrap">
              <span className="material-symbols-outlined input-icon">lock</span>
              <input
                type="password"
                autoComplete="new-password"
                minLength={6}
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
                placeholder="Minim 6 caractere"
                required
              />
            </div>
          </label>

          <label className="field">
            <span className="field-label">Confirmă parola</span>
            <div className="input-wrap">
              <span className="material-symbols-outlined input-icon">lock</span>
              <input
                type="password"
                autoComplete="new-password"
                minLength={6}
                value={confirmPw}
                onChange={(e) => setConfirmPw(e.target.value)}
                placeholder="Repetă parola"
                required
              />
            </div>
          </label>

          {error && <p className="modal-error">{error}</p>}

          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={close}>
              Anulează
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? <span className="spinner" /> : 'Salvează'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
