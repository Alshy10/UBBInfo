import { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';
import Toast from '../../components/Toast';

const BLANK = { title: '', url: '#', icon: 'link', sort_order: '', is_active: true };

export default function Links() {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(BLANK);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('useful_links')
      .select('*')
      .order('sort_order');
    if (error) console.error('Load links failed:', error);
    setLinks(data || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const flashToast = (variant, message) => {
    setToast({ variant, message });
    setTimeout(() => setToast(null), 3000);
  };

  const resetForm = () => {
    setForm(BLANK);
    setEditingId(null);
  };

  const startEdit = (l) => {
    setEditingId(l.id);
    setForm({
      title: l.title || '',
      url: l.url || '#',
      icon: l.icon || 'link',
      sort_order: l.sort_order ?? '',
      is_active: !!l.is_active,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      flashToast('error', 'Titlul este obligatoriu.');
      return;
    }
    setSaving(true);
    const payload = {
      title: form.title.trim(),
      url: form.url.trim() || '#',
      icon: form.icon.trim() || 'link',
      sort_order: form.sort_order === '' ? 0 : Number(form.sort_order),
      is_active: form.is_active,
    };

    const { error } = editingId
      ? await supabase.from('useful_links').update(payload).eq('id', editingId)
      : await supabase.from('useful_links').insert(payload);

    setSaving(false);
    if (error) {
      console.error('Save link failed:', error);
      flashToast('error', 'Eroare la salvarea linkului.');
      return;
    }
    flashToast('success', editingId ? 'Link actualizat.' : 'Link adăugat.');
    resetForm();
    load();
  };

  const toggleActive = async (l) => {
    const { error } = await supabase
      .from('useful_links')
      .update({ is_active: !l.is_active })
      .eq('id', l.id);
    if (error) {
      console.error('Toggle link failed:', error);
      flashToast('error', 'Eroare la actualizare.');
      return;
    }
    setLinks((prev) =>
      prev.map((x) => (x.id === l.id ? { ...x, is_active: !x.is_active } : x))
    );
  };

  const handleDelete = async (l) => {
    if (!window.confirm(`Ștergi linkul „${l.title}"?`)) return;
    const { error } = await supabase.from('useful_links').delete().eq('id', l.id);
    if (error) {
      console.error('Delete link failed:', error);
      flashToast('error', 'Eroare la ștergere.');
      return;
    }
    flashToast('success', 'Link șters.');
    if (editingId === l.id) resetForm();
    load();
  };

  return (
    <div className="admin-section-grid">
      {/* Form */}
      <section className="card">
        <div className="card-header">
          <h2 className="card-title">
            <span className="material-symbols-outlined">
              {editingId ? 'edit' : 'add_link'}
            </span>
            {editingId ? 'Editează linkul' : 'Adaugă link'}
          </h2>
        </div>
        <form className="card-body" onSubmit={handleSubmit}>
          <label className="field">
            <span className="field-label">Titlu</span>
            <div className="input-wrap">
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="ex. Bibliotecă online"
              />
            </div>
          </label>
          <label className="field">
            <span className="field-label">URL</span>
            <div className="input-wrap">
              <input
                type="text"
                value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
                placeholder="https://…"
              />
            </div>
          </label>
          <label className="field">
            <span className="field-label">Icon (Material Symbols)</span>
            <div className="input-wrap">
              <span className="material-symbols-outlined input-icon">{form.icon || 'link'}</span>
              <input
                type="text"
                value={form.icon}
                onChange={(e) => setForm({ ...form, icon: e.target.value })}
                placeholder="ex. school"
              />
            </div>
          </label>
          <label className="field">
            <span className="field-label">Ordine</span>
            <div className="input-wrap">
              <input
                type="number"
                value={form.sort_order}
                onChange={(e) => setForm({ ...form, sort_order: e.target.value })}
                placeholder="ex. 1"
              />
            </div>
          </label>
          <label className="checkbox-field">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
            />
            <span>Activ (vizibil pe dashboard)</span>
          </label>
          <div className="form-actions">
            {editingId && (
              <button type="button" className="btn btn-ghost" onClick={resetForm}>
                Anulează
              </button>
            )}
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? <span className="spinner" /> : editingId ? 'Salvează' : 'Adaugă'}
            </button>
          </div>
        </form>
      </section>

      {/* List */}
      <section className="card">
        <div className="card-header">
          <h2 className="card-title">
            <span className="material-symbols-outlined">link</span>
            Linkuri utile ({links.length})
          </h2>
        </div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Ordine</th>
                <th>Titlu</th>
                <th>URL</th>
                <th>Activ</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="muted center">
                    Se încarcă…
                  </td>
                </tr>
              ) : (
                links.map((l) => (
                  <tr key={l.id}>
                    <td>{l.sort_order}</td>
                    <td>
                      <span className="link-title-cell">
                        <span className="material-symbols-outlined">{l.icon}</span>
                        {l.title}
                      </span>
                    </td>
                    <td className="mono link-url-cell">{l.url}</td>
                    <td>
                      <button
                        type="button"
                        className={`toggle-pill ${l.is_active ? 'on' : 'off'}`}
                        onClick={() => toggleActive(l)}
                      >
                        {l.is_active ? 'Activ' : 'Inactiv'}
                      </button>
                    </td>
                    <td>
                      <div className="row-actions">
                        <button
                          type="button"
                          className="icon-btn"
                          onClick={() => startEdit(l)}
                          aria-label="Editează"
                        >
                          <span className="material-symbols-outlined">edit</span>
                        </button>
                        <button
                          type="button"
                          className="icon-btn icon-btn-danger"
                          onClick={() => handleDelete(l)}
                          aria-label="Șterge"
                        >
                          <span className="material-symbols-outlined">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <Toast
        visible={!!toast}
        variant={toast?.variant || 'success'}
        message={toast?.message || ''}
      />
    </div>
  );
}
