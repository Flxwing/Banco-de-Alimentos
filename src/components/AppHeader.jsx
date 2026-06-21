import { roleLabels } from "../data/mockData.js";
import { RoleBadge } from "./ui.jsx";

export function AppHeader({ user, onLogout }) {
  return (
    <header className="app-header">
      <div className="header-copy">
        <span className="eyebrow">Gestión de distribución alimentaria</span>
        <h1>Banco de Alimentos</h1>
        <p>Donaciones, inventario y entregas en un mismo lugar.</p>
      </div>

      <aside className="session-panel" aria-label="Sesión actual">
        <div className="session-identity">
          <span className="session-label">Sesión activa</span>
          <strong>{user.name}</strong>
          <small>{user.location}</small>
          <RoleBadge role={user.role} label={roleLabels[user.role]} />
        </div>
        <button className="button button-ghost" type="button" onClick={onLogout}>
          Cerrar sesión
        </button>
      </aside>
    </header>
  );
}
