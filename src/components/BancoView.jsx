import { useMemo, useState } from "react";
import {
  EmptyState,
  ExpiryBadge,
  PriorityBadge,
  StatCard,
  StatusBadge,
} from "./ui.jsx";
import { formatDate, getExpiryInfo } from "../utils/dateUtils.js";

const tabs = [
  { id: "donaciones", label: "Donaciones" },
  { id: "inventario", label: "Inventario" },
  { id: "solicitudes", label: "Solicitudes" },
  { id: "entregas", label: "Entregas" },
];

const finalDeliveryStates = new Set(["recibida", "completada", "cerrada"]);

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
  const [activeTab, setActiveTab] = useState("donaciones");

  const solicitudesPendientes = solicitudes.filter(
    (solicitud) => solicitud.estado === "pendiente",
  );
  const donacionesPendientes = donaciones.filter(
    (donacion) => donacion.estado === "pendiente",
  );
  const donacionesProcesadas = donaciones.filter(
    (donacion) => donacion.estado !== "pendiente",
  );
  const entregasActivas = solicitudes.filter(
    (solicitud) =>
      solicitud.estado !== "pendiente" &&
      !finalDeliveryStates.has(solicitud.estado),
  );
  const entregasFinalizadas = solicitudes.filter((solicitud) =>
    finalDeliveryStates.has(solicitud.estado),
  );
  const inventarioOrdenado = useMemo(
    () =>
      [...inventario].sort(
        (a, b) => new Date(a.vencimiento) - new Date(b.vencimiento),
      ),
    [inventario],
  );
  const productosUrgentes = inventario.filter((item) => {
    const level = getExpiryInfo(item.vencimiento).level;
    return level === "critical" || level === "warning" || level === "expired";
  }).length;

  const tabCounts = {
    donaciones: stats.donacionesPendientes,
    inventario: inventario.length,
    solicitudes: solicitudesPendientes.length,
    entregas: entregasActivas.length,
  };

  return (
    <div className="banco-dashboard">
      <section className="bank-overview" aria-labelledby="bank-overview-title">
        <div className="section-heading">
          <span className="eyebrow">Resumen operativo</span>
          <h2 id="bank-overview-title">Estado de la operación</h2>
          <p>Prioriza pendientes, existencias y entregas desde este panel.</p>
        </div>
        <div className="stats-row bank-stats">
          <StatCard
            label="Unidades disponibles"
            value={stats.inventarioDisponible}
            hint={`${stats.productosInventario} productos`}
          />
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
            label="Vencimiento próximo"
            value={productosUrgentes}
            hint="requieren atención"
          />
        </div>
      </section>

      <nav className="bank-tabs" aria-label="Áreas de gestión" role="tablist">
        {tabs.map((tab) => (
          <button
            className={`bank-tab ${activeTab === tab.id ? "is-active" : ""}`}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
          >
            <span>{tab.label}</span>
            <small>{tabCounts[tab.id]}</small>
          </button>
        ))}
      </nav>

      <section className="bank-panel" role="tabpanel">
        {activeTab === "donaciones" && (
          <DonationPanel
            pendientes={donacionesPendientes}
            procesadas={donacionesProcesadas}
            onAceptar={onAceptarDonacion}
            onRechazar={onRechazarDonacion}
          />
        )}

        {activeTab === "inventario" && (
          <InventoryPanel inventario={inventarioOrdenado} />
        )}

        {activeTab === "solicitudes" && (
          <RequestsPanel
            solicitudes={solicitudesPendientes}
            onAsignar={onAsignarSolicitud}
          />
        )}

        {activeTab === "entregas" && (
          <DeliveriesPanel
            activas={entregasActivas}
            finalizadas={entregasFinalizadas}
            onCoordinar={onCoordinarEntrega}
          />
        )}
      </section>
    </div>
  );
}

function PanelHeading({ eyebrow, title, text }) {
  return (
    <div className="panel-heading">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h2>{title}</h2>
      </div>
      <p>{text}</p>
    </div>
  );
}

function DonationPanel({ pendientes, procesadas, onAceptar, onRechazar }) {
  return (
    <>
      <PanelHeading
        eyebrow="Recepción"
        title="Donaciones pendientes"
        text="Revisa disponibilidad y vencimiento antes de incorporar alimentos al inventario."
      />
      <div className="management-list">
        {pendientes.length === 0 ? (
          <EmptyState
            title="No hay donaciones pendientes"
            text="Todas las donaciones registradas ya fueron procesadas."
          />
        ) : (
          pendientes.map((donacion) => (
            <DonationItem
              donacion={donacion}
              onAceptar={onAceptar}
              onRechazar={onRechazar}
              key={donacion.id}
            />
          ))
        )}
      </div>
      <HistorySection
        title="Historial de donaciones"
        count={procesadas.length}
        emptyText="Aún no hay donaciones procesadas."
      >
        {procesadas.map((donacion) => (
          <DonationItem donacion={donacion} key={donacion.id} />
        ))}
      </HistorySection>
    </>
  );
}

function DonationItem({ donacion, onAceptar, onRechazar }) {
  const isPending = donacion.estado === "pendiente";

  return (
    <article className="management-item" key={donacion.id}>
      <div className="item-primary">
        <div className="item-title-line">
          <strong>{donacion.producto}</strong>
          <StatusBadge estado={donacion.estado} />
        </div>
        <p>{donacion.donante}</p>
      </div>
      <div className="item-facts">
        <span><small>Cantidad</small>{donacion.cantidad} unidades</span>
        <span><small>Vencimiento</small>{formatDate(donacion.vencimiento)}</span>
        <ExpiryBadge date={donacion.vencimiento} />
      </div>
      {isPending && (
        <div className="item-actions">
          <button
            className="button button-primary"
            type="button"
            onClick={() => onAceptar(donacion.id)}
          >
            Aceptar
          </button>
          <button
            className="button button-muted"
            type="button"
            onClick={() => onRechazar(donacion.id)}
          >
            Rechazar
          </button>
        </div>
      )}
    </article>
  );
}

function InventoryPanel({ inventario }) {
  return (
    <>
      <PanelHeading
        eyebrow="Bodega"
        title="Inventario disponible"
        text="Los productos se ordenan por fecha de vencimiento para facilitar su salida prioritaria."
      />
      <div className="inventory-table" role="table" aria-label="Inventario">
        <div className="inventory-row inventory-header" role="row">
          <span>Producto</span>
          <span>Existencias</span>
          <span>Vencimiento</span>
          <span>Condición</span>
        </div>
        {inventario.length === 0 ? (
          <EmptyState
            title="Inventario vacío"
            text="Las donaciones aceptadas se agregarán automáticamente."
          />
        ) : (
          inventario.map((item) => {
            const expiry = getExpiryInfo(item.vencimiento);
            return (
              <article
                className={`inventory-row inventory-${expiry.level}`}
                role="row"
                key={item.id}
              >
                <strong>{item.producto}</strong>
                <span>{item.cantidad} unidades</span>
                <span>{formatDate(item.vencimiento)}</span>
                <ExpiryBadge date={item.vencimiento} />
              </article>
            );
          })
        )}
      </div>
    </>
  );
}

function RequestsPanel({ solicitudes, onAsignar }) {
  return (
    <>
      <PanelHeading
        eyebrow="Necesidades"
        title="Solicitudes pendientes"
        text="Valida existencias y prioridad antes de reservar productos del inventario."
      />
      <div className="management-list">
        {solicitudes.length === 0 ? (
          <EmptyState
            title="No hay solicitudes pendientes"
            text="Las solicitudes nuevas aparecerán aquí para su asignación."
          />
        ) : (
          solicitudes.map((solicitud) => (
            <article className="management-item" key={solicitud.id}>
              <div className="item-primary">
                <div className="item-title-line">
                  <strong>{solicitud.producto}</strong>
                  <PriorityBadge prioridad={solicitud.prioridad} />
                </div>
                <p>{solicitud.organizacion}</p>
              </div>
              <div className="item-facts">
                <span><small>Cantidad</small>{solicitud.cantidad} unidades</span>
                <StatusBadge estado={solicitud.estado} />
              </div>
              <div className="item-actions">
                <button
                  className="button button-primary"
                  type="button"
                  onClick={() => onAsignar(solicitud.id)}
                >
                  Asignar inventario
                </button>
              </div>
            </article>
          ))
        )}
      </div>
    </>
  );
}

function DeliveriesPanel({ activas, finalizadas, onCoordinar }) {
  return (
    <>
      <PanelHeading
        eyebrow="Distribución"
        title="Entregas activas"
        text="Coordina solicitudes asignadas y da seguimiento a las entregas en proceso."
      />
      <div className="management-list">
        {activas.length === 0 ? (
          <EmptyState
            title="No hay entregas activas"
            text="Las solicitudes asignadas aparecerán aquí para su coordinación."
          />
        ) : (
          activas.map((entrega) => (
            <DeliveryItem
              entrega={entrega}
              onCoordinar={onCoordinar}
              key={entrega.id}
            />
          ))
        )}
      </div>
      <HistorySection
        title="Historial de entregas"
        count={finalizadas.length}
        emptyText="Aún no hay entregas finalizadas."
      >
        {finalizadas.map((entrega) => (
          <DeliveryItem entrega={entrega} key={entrega.id} />
        ))}
      </HistorySection>
    </>
  );
}

function DeliveryItem({ entrega, onCoordinar }) {
  return (
    <article className="management-item">
      <div className="item-primary">
        <div className="item-title-line">
          <strong>{entrega.producto}</strong>
          <StatusBadge estado={entrega.estado} />
        </div>
        <p>{entrega.organizacion}</p>
      </div>
      <div className="item-facts">
        <span><small>Cantidad</small>{entrega.cantidad} unidades</span>
        <PriorityBadge prioridad={entrega.prioridad} />
      </div>
      {entrega.estado === "asignada" && (
        <div className="item-actions">
          <button
            className="button button-primary"
            type="button"
            onClick={() => onCoordinar(entrega.id)}
          >
            Coordinar entrega
          </button>
        </div>
      )}
      {entrega.estado === "entrega coordinada" && (
        <p className="item-note">Esperando confirmación de la organización.</p>
      )}
      {finalDeliveryStates.has(entrega.estado) && (
        <p className="item-note item-note-success">Entrega finalizada.</p>
      )}
    </article>
  );
}

function HistorySection({ title, count, emptyText, children }) {
  return (
    <details className="history-section">
      <summary>
        <span>{title}</span>
        <small>{count}</small>
      </summary>
      <div className="history-content">
        {count === 0 ? (
          <p className="history-empty">{emptyText}</p>
        ) : (
          <div className="management-list history-list">{children}</div>
        )}
      </div>
    </details>
  );
}
