// Reusable "page under construction" mockup.
// features: [{ icon, label }]
export default function MockupPage({ icon, title, description, features = [] }) {
  return (
    <div className="mockup-page">
      <div className="mockup-card">
        <div className="mockup-icon-circle">
          <span className="material-symbols-outlined">{icon}</span>
        </div>
        <h2 className="mockup-title">{title}</h2>
        <p className="mockup-description">{description}</p>

        <div className="mockup-features">
          {features.map((f) => (
            <div className="mockup-feature" key={f.label}>
              <span className="material-symbols-outlined">{f.icon}</span>
              <span>{f.label}</span>
            </div>
          ))}
        </div>

        <div className="mockup-badge">
          <span className="material-symbols-outlined">construction</span>
          Pagină în construcție — disponibilă în curând
        </div>
      </div>
    </div>
  );
}
