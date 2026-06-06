import { roleLabels } from "../data/mockData.js";
import { RoleBadge, StatCard } from "./ui.jsx";

export function AppHeader({ user, stats, onLogout }) {
  const isBanco = user.role === "banco";

  return (
    <header className="app-header">
      <div className="header-copy">
        <span className="eyebrow">Prueba de concepto</span>
        <h1>Banco de Alimentos</h1>
        <p>
          Gestión sencilla de donaciones, inventario, solicitudes y entregas
          para validar el flujo principal con usuarios de prueba.
        </p>
      </div>

      <aside className="session-panel" aria-label="Sesión actual">
        <div>
          <span className="session-label">Sesión activa</span>
          <strong>{user.name}</strong>
          <RoleBadge role={user.role} label={roleLabels[user.role]} />
        </div>
        <button className="button button-ghost" type="button" onClick={onLogout}>
          Cerrar sesión
        </button>
      </aside>

      {isBanco && (
        <section className="header-stats" aria-label="Resumen del banco">
          <StatCard
            label="Donaciones pendientes"
            value={stats.donacionesPendientes}
            hint="por revisar"
          />
          <StatCard
            label="Solicitudes pendientes"
            value={stats.solicitudesPendientes}
            hint="por asignar"
          />
          <StatCard
            label="Entregas coordinadas"
            value={stats.entregasCoordinadas}
            hint="por confirmar"
          />
        </section>
      )}
    </header>
  );
}
