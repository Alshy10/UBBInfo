// Admin tab: automatic account generation for admitted candidates.
// Feature is planned — shown as "În construcție".
export default function ConturiAdmisi() {
  return (
    <section className="card">
      <div className="card-header">
        <h2 className="card-title">
          <span className="material-symbols-outlined">group_add</span>
          Generare automată conturi admiși
        </h2>
        <span className="badge badge-wip">
          <span className="material-symbols-outlined">construction</span>
          În construcție
        </span>
      </div>
      <div className="card-body">
        <p className="muted">
          Acest modul va permite generarea automată a conturilor pentru candidații
          admiși, pe baza listelor de admitere: creare cont instituțional, atribuirea
          rolului de student, completarea datelor de profil (facultate, specializare,
          grupă, finanțare) și trimiterea credențialelor inițiale.
        </p>

        <div className="mockup-features" style={{ marginTop: 8 }}>
          <div className="mockup-feature">
            <span className="material-symbols-outlined">upload_file</span>
            <span>Import listă admiși (CSV/Excel)</span>
          </div>
          <div className="mockup-feature">
            <span className="material-symbols-outlined">badge</span>
            <span>Generare email + matricol</span>
          </div>
          <div className="mockup-feature">
            <span className="material-symbols-outlined">manage_accounts</span>
            <span>Atribuire rol & specializare</span>
          </div>
          <div className="mockup-feature">
            <span className="material-symbols-outlined">forward_to_inbox</span>
            <span>Trimitere credențiale</span>
          </div>
        </div>

        <div className="mockup-badge" style={{ marginTop: 16 }}>
          <span className="material-symbols-outlined">construction</span>
          Funcționalitate în curs de dezvoltare — disponibilă în curând
        </div>
      </div>
    </section>
  );
}
