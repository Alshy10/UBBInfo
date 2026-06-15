// Simple toast. variant: 'success' | 'error'
export default function Toast({ message, variant = 'success', visible }) {
  if (!visible) return null;
  const icon = variant === 'success' ? 'check_circle' : 'error';
  return (
    <div className={`toast toast-${variant}`} role="status">
      <span className="material-symbols-outlined">{icon}</span>
      <span>{message}</span>
    </div>
  );
}
