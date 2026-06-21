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
  const entregas = solicitudes.filter(
    (solicitud) => solicitud.estado !== "pendiente",
  );
  const entregasActivas = entregas.filter(
    (solicitud) => solicitud.estado !== "recibida",
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
            donaciones={donaciones}
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
            entregas={entregas}
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

function DonationPanel({ donaciones, onAceptar, onRechazar }) {
  return (
    <>
      <PanelHeading
        eyebrow="Recepción"
        title="Donaciones registradas"
        text="Revisa disponibilidad y vencimiento antes de incorporar alimentos al inventario."
      />
      <div className="management-list">
        {donaciones.length === 0 ? (
          <EmptyState
            title="No hay donaciones registradas"
            text="Las nuevas donaciones aparecerán aquí para su revisión."
          />
        ) : (
          donaciones.map((donacion) => (
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
              {donacion.estado === "pendiente" && (
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
          ))
        )}
      </div>
    </>
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

function DeliveriesPanel({ entregas, onCoordinar }) {
  return (
    <>
      <PanelHeading
        eyebrow="Distribución"
        title="Seguimiento de entregas"
        text="Coordina solicitudes asignadas y consulta las recepciones confirmadas."
      />
      <div className="management-list">
        {entregas.length === 0 ? (
          <EmptyState
            title="No hay entregas en seguimiento"
            text="Las solicitudes asignadas pasarán a esta sección."
          />
        ) : (
          entregas.map((entrega) => (
            <article className="management-item" key={entrega.id}>
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
              {entrega.estado === "recibida" && (
                <p className="item-note item-note-success">Recepción confirmada.</p>
              )}
            </article>
          ))
        )}
      </div>
    </>
  );
}
