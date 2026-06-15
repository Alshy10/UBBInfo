import { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';
import { useAuth } from '../../contexts/AuthContext';

const FIELDS = ['phone', 'personal_email', 'iban', 'cnp', 'id_series', 'address'];

const EMPTY = {
  phone: '',
  personal_email: '',
  iban: '',
  cnp: '',
  id_series: '',
  address: '',
};

export default function Identity() {
  const { user, profile, setProfile } = useAuth();
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(null); // { type: 'success'|'error', text }

  useEffect(() => {
    if (!user) return;
    let active = true;
    (async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('phone, personal_email, iban, cnp, id_series, address')
        .eq('id', user.id)
        .single();
      if (!active) return;
      if (error) {
        console.error('Load identity failed:', error);
        return;
      }
      const next = { ...EMPTY };
      for (const f of FIELDS) next[f] = data?.[f] ?? '';
      setForm(next);
    })();
    return () => {
      active = false;
    };
  }, [user]);

  const update = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatus(null);

    // Empty strings -> null
    const payload = {};
    for (const f of FIELDS) {
      const v = form[f]?.trim();
      payload[f] = v === '' ? null : v;
    }

    const { error } = await supabase
      .from('profiles')
      .update(payload)
      .eq('id', user.id);

    setSaving(false);

    if (error) {
      console.error('Save identity failed:', error);
      setStatus({ type: 'error', text: 'A apărut o eroare. Încearcă din nou.' });
      return;
    }

    // Keep global profile in sync
    setProfile((p) => (p ? { ...p, ...payload } : p));
    setStatus({ type: 'success', text: '✓ Modificările au fost salvate cu succes' });
    setTimeout(() => setStatus(null), 3000);
  };

  return (
    <div className="page">
      <section className="header-card">
        <h1 className="page-title">Identitatea Ta</h1>
        <p className="page-subtitle">
          Gestionează datele tale personale. Toate câmpurile sunt opționale.
        </p>
      </section>

      <form onSubmit={handleSubmit} className="identity-form">
        {/* 1. Contact */}
        <section className="card">
          <div className="card-header">
            <h2 className="card-title">
              <span className="material-symbols-outlined">contact_phone</span>
              Informații de Contact
            </h2>
          </div>
          <div className="card-body form-grid-2">
            <label className="field">
              <span className="field-label">Telefon</span>
              <div className="input-wrap">
                <span className="material-symbols-outlined input-icon">phone</span>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={update('phone')}
                  placeholder="07XX XXX XXX"
                />
              </div>
            </label>
            <label className="field">
              <span className="field-label">Email personal</span>
              <div className="input-wrap">
                <span className="material-symbols-outlined input-icon">mail</span>
                <input
                  type="email"
                  value={form.personal_email}
                  onChange={update('personal_email')}
                  placeholder="nume@exemplu.com"
                />
              </div>
            </label>
          </div>
        </section>

        {/* 2. Financial */}
        <section className="card">
          <div className="card-header">
            <h2 className="card-title">
              <span className="material-symbols-outlined">account_balance</span>
              Informații Financiare
            </h2>
          </div>
          <div className="card-body">
            <label className="field">
              <span className="field-label">IBAN</span>
              <div className="input-wrap">
                <span className="material-symbols-outlined input-icon">credit_card</span>
                <input
                  type="text"
                  className="mono"
                  value={form.iban}
                  onChange={update('iban')}
                  placeholder="RO00 BANK 0000 0000 0000 0000"
                />
              </div>
              <span className="field-hint">
                Contul în care vei primi eventualele burse sau restituiri.
              </span>
            </label>
          </div>
        </section>

        {/* 3. Identity documents */}
        <section className="card">
          <div className="card-header">
            <h2 className="card-title">
              <span className="material-symbols-outlined">badge</span>
              Documente de Identitate
            </h2>
          </div>
          <div className="card-body form-grid-2">
            <label className="field">
              <span className="field-label">CNP</span>
              <div className="input-wrap">
                <span className="material-symbols-outlined input-icon">fingerprint</span>
                <input
                  type="text"
                  className="mono"
                  maxLength={13}
                  value={form.cnp}
                  onChange={update('cnp')}
                  placeholder="1234567890123"
                />
              </div>
            </label>
            <label className="field">
              <span className="field-label">Serie CI</span>
              <div className="input-wrap">
                <span className="material-symbols-outlined input-icon">badge</span>
                <input
                  type="text"
                  value={form.id_series}
                  onChange={update('id_series')}
                  placeholder="CJ 123456"
                />
              </div>
            </label>
          </div>
        </section>

        {/* 4. Address */}
        <section className="card">
          <div className="card-header">
            <h2 className="card-title">
              <span className="material-symbols-outlined">home_pin</span>
              Adresă de Domiciliu
            </h2>
          </div>
          <div className="card-body">
            <label className="field">
              <span className="field-label">Adresă completă</span>
              <div className="input-wrap input-wrap-textarea">
                <span className="material-symbols-outlined input-icon">location_on</span>
                <textarea
                  rows={3}
                  value={form.address}
                  onChange={update('address')}
                  placeholder="Strada, număr, oraș, județ"
                />
              </div>
            </label>
          </div>
        </section>

        <div className="identity-footer">
          {status && (
            <span className={`status-msg status-${status.type}`}>{status.text}</span>
          )}
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? (
              <span className="spinner" />
            ) : (
              <>
                <span className="material-symbols-outlined">save</span>
                Salvează Modificările
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
