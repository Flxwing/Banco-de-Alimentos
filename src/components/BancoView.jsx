import { EmptyState, StatCard, StatusBadge } from "./ui.jsx";

export function BancoView({
  donaciones,
  solicitudes,
  inventario,
  stats,
  onAceptarDonacion,
  onRechazarDonacion,
  onAsignarSolicitud,
  onCoordinarEntrega,
}) {
  return (
    <div className="dashboard banco-dashboard">
      <section className="section-card section-wide command-card">
        <div className="section-heading">
          <span className="eyebrow">Panel principal</span>
          <h2>Operación del banco</h2>
          <p>
            Revisa donaciones, administra inventario y atiende solicitudes hasta
            dejar la entrega lista para que la organización confirme recepción.
          </p>
        </div>
        <div className="stats-row">
          <StatCard
            label="Productos distintos"
            value={stats.productosInventario}
            hint="en bodega"
          />
          <StatCard
            label="Donaciones pendientes"
            value={stats.donacionesPendientes}
            hint="por revisar"
          />
          <StatCard
            label="Entregas coordinadas"
            value={stats.entregasCoordinadas}
            hint="por confirmar"
          />
        </div>
        <ol className="flow-steps" aria-label="Flujo de distribución">
          <li>Donación reportada</li>
          <li>Revisión del banco</li>
          <li>Inventario</li>
          <li>Solicitud asignada</li>
          <li>Entrega coordinada</li>
          <li>Recepción confirmada</li>
        </ol>
      </section>

      <section className="section-card">
        <div className="section-heading">
          <span className="eyebrow">Entrada</span>
          <h2>Donaciones recibidas</h2>
          <p>Las donaciones aceptadas entran al inventario disponible.</p>
        </div>
        <div className="item-list">
          {donaciones.length === 0 ? (
            <EmptyState
              title="Sin donaciones"
              text="Cuando un donante reporte alimentos aparecerán aquí para revisión."
            />
          ) : (
            donaciones.map((donacion) => (
              <article className="list-item" key={donacion.id}>
                <div className="item-top">
                  <div>
                    <strong>{donacion.producto}</strong>
                    <p>{donacion.donante}</p>
                  </div>
                  <StatusBadge estado={donacion.estado} />
                </div>
                <dl className="meta-grid">
                  <div>
                    <dt>Cantidad</dt>
                    <dd>{donacion.cantidad} unidades</dd>
                  </div>
                  <div>
                    <dt>Vence</dt>
                    <dd>{donacion.vencimiento}</dd>
                  </div>
                </dl>
                {donacion.estado === "pendiente" && (
                  <div className="actions">
                    <button
                      className="button button-primary"
                      type="button"
                      onClick={() => onAceptarDonacion(donacion.id)}
                    >
                      Aceptar
                    </button>
                    <button
                      className="button button-muted"
                      type="button"
                      onClick={() => onRechazarDonacion(donacion.id)}
                    >
                      Rechazar
                    </button>
                  </div>
                )}
              </article>
            ))
          )}
        </div>
      </section>

      <section className="section-card">
        <div className="section-heading">
          <span className="eyebrow">Bodega</span>
          <h2>Inventario disponible</h2>
          <p>Este inventario se usa para validar si una solicitud puede asignarse.</p>
        </div>
        <div className="item-list compact-list">
          {inventario.length === 0 ? (
            <EmptyState
              title="Inventario vacío"
              text="Las donaciones aceptadas se agregarán automáticamente."
            />
          ) : (
            inventario.map((item) => (
              <article className="list-item inventory-item" key={item.id}>
                <div className="item-top">
                  <div>
                    <strong>{item.producto}</strong>
                    <p>Vence {item.vencimiento}</p>
                  </div>
                  <span className="quantity-badge">{item.cantidad}</span>
                </div>
              </article>
            ))
          )}
        </div>
      </section>

      <section className="section-card section-wide">
        <div className="section-heading">
          <span className="eyebrow">Salida</span>
          <h2>Solicitudes de organizaciones</h2>
          <p>
            Asigna desde inventario y luego coordina la entrega para que la
            organización pueda confirmar recepción.
          </p>
        </div>
        <div className="requests-grid">
          {solicitudes.length === 0 ? (
            <EmptyState
              title="Sin solicitudes"
              text="Las organizaciones receptoras aún no han registrado necesidades."
            />
          ) : (
            solicitudes.map((solicitud) => (
              <article className="list-item" key={solicitud.id}>
                <div className="item-top">
                  <div>
                    <strong>{solicitud.producto}</strong>
                    <p>{solicitud.organizacion}</p>
                  </div>
                  <StatusBadge estado={solicitud.estado} />
                </div>
                <dl className="meta-grid">
                  <div>
                    <dt>Cantidad</dt>
                    <dd>{solicitud.cantidad} unidades</dd>
                  </div>
                  <div>
                    <dt>Prioridad</dt>
                    <dd>{solicitud.prioridad || "media"}</dd>
                  </div>
                </dl>
                {solicitud.estado === "pendiente" && (
                  <div className="actions">
                    <button
                      className="button button-primary"
                      type="button"
                      onClick={() => onAsignarSolicitud(solicitud.id)}
                    >
                      Asignar desde inventario
                    </button>
                  </div>
                )}
                {solicitud.estado === "asignada" && (
                  <div className="actions">
                    <button
                      className="button button-primary"
                      type="button"
                      onClick={() => onCoordinarEntrega(solicitud.id)}
                    >
                      Coordinar entrega
                    </button>
                  </div>
                )}
                {solicitud.estado === "entrega coordinada" && (
                  <p className="status-help">
                    Lista para que la organización receptora confirme que recibió
                    los alimentos.
                  </p>
                )}
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
