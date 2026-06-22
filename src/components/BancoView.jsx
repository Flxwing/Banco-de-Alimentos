import { useMemo, useState } from "react";
import {
  CategoryBadge,
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
const expiryOrder = { urgent: 0, soon: 1, normal: 2, expired: 3 };

export function BancoView({
  donaciones,
  solicitudes,
  inventario,
  stats,
  onAceptarDonacion,
  onRechazarDonacion,
  onAsignarSolicitud,
  onCoordinarEntrega,
  pinnedDonors,
  pinnedRecipients,
  onToggleDonor,
  onToggleRecipient,
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
      [...inventario].sort((a, b) => {
        const levelDifference =
          expiryOrder[getExpiryInfo(a.vencimiento).level] -
          expiryOrder[getExpiryInfo(b.vencimiento).level];
        return levelDifference || new Date(a.vencimiento) - new Date(b.vencimiento);
      }),
    [inventario],
  );
  const productosUrgentes = inventario.filter((item) => {
    const level = getExpiryInfo(item.vencimiento).level;
    return level === "urgent" || level === "soon";
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
            label="Salida prioritaria"
            value={productosUrgentes}
            hint="vence en 30 días"
          />
        </div>
      </section>

      <FrequentActors
        donors={pinnedDonors}
        recipients={pinnedRecipients}
        onToggleDonor={onToggleDonor}
        onToggleRecipient={onToggleRecipient}
      />

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
            pinnedDonors={pinnedDonors}
            onToggleDonor={onToggleDonor}
          />
        )}

        {activeTab === "inventario" && (
          <InventoryPanel inventario={inventarioOrdenado} />
        )}

        {activeTab === "solicitudes" && (
          <RequestsPanel
            solicitudes={solicitudesPendientes}
            onAsignar={onAsignarSolicitud}
            pinnedRecipients={pinnedRecipients}
            onToggleRecipient={onToggleRecipient}
          />
        )}

        {activeTab === "entregas" && (
          <DeliveriesPanel
            activas={entregasActivas}
            finalizadas={entregasFinalizadas}
            onCoordinar={onCoordinarEntrega}
            pinnedRecipients={pinnedRecipients}
            onToggleRecipient={onToggleRecipient}
          />
        )}
      </section>
    </div>
  );
}

function FrequentActors({
  donors,
  recipients,
  onToggleDonor,
  onToggleRecipient,
}) {
  return (
    <section className="frequent-actors" aria-label="Actores frecuentes">
      <FrequentGroup
        title="Donadores frecuentes"
        actors={donors}
        onToggle={onToggleDonor}
      />
      <FrequentGroup
        title="Receptores frecuentes"
        actors={recipients}
        onToggle={onToggleRecipient}
      />
    </section>
  );
}

function FrequentGroup({ title, actors, onToggle }) {
  return (
    <div className="frequent-group">
      <strong>{title}</strong>
      <div className="frequent-list">
        {actors.length === 0 ? (
          <span className="frequent-empty">Sin favoritos</span>
        ) : (
          actors.map((actor) => (
            <button
              className="frequent-chip"
              type="button"
              title={`Quitar ${actor} de frecuentes`}
              onClick={() => onToggle(actor)}
              key={actor}
            >
              <span aria-hidden="true">★</span>
              {actor}
            </button>
          ))
        )}
      </div>
    </div>
  );
}

function PanelHeading({ eyebrow, title }) {
  return (
    <div className="panel-heading">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h2>{title}</h2>
      </div>
    </div>
  );
}

function DonationPanel({
  pendientes,
  procesadas,
  onAceptar,
  onRechazar,
  pinnedDonors,
  onToggleDonor,
}) {
  return (
    <>
      <PanelHeading
        eyebrow="Recepción"
        title="Donaciones pendientes"
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
              isPinned={pinnedDonors.includes(donacion.donante)}
              onToggleDonor={onToggleDonor}
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
          <DonationItem
            donacion={donacion}
            isPinned={pinnedDonors.includes(donacion.donante)}
            onToggleDonor={onToggleDonor}
            key={donacion.id}
          />
        ))}
      </HistorySection>
    </>
  );
}

function DonationItem({
  donacion,
  onAceptar,
  onRechazar,
  isPinned,
  onToggleDonor,
}) {
  const isPending = donacion.estado === "pendiente";

  return (
    <article className="management-item" key={donacion.id}>
      <div className="item-primary">
        <div className="item-title-line">
          <strong>{donacion.producto}</strong>
          <StatusBadge estado={donacion.estado} />
        </div>
        <ActorLine
          name={donacion.donante}
          isPinned={isPinned}
          onToggle={onToggleDonor}
          type="donador"
        />
      </div>
      <div className="item-facts">
        <CategoryBadge tipo={donacion.tipo} />
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
      />
      <div className="inventory-table" role="table" aria-label="Inventario">
        <div className="inventory-row inventory-header" role="row">
          <span>Producto</span>
          <span>Tipo</span>
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
                <CategoryBadge tipo={item.tipo} />
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

function RequestsPanel({
  solicitudes,
  onAsignar,
  pinnedRecipients,
  onToggleRecipient,
}) {
  return (
    <>
      <PanelHeading
        eyebrow="Necesidades"
        title="Solicitudes pendientes"
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
                <ActorLine
                  name={solicitud.organizacion}
                  isPinned={pinnedRecipients.includes(solicitud.organizacion)}
                  onToggle={onToggleRecipient}
                  type="receptor"
                />
              </div>
              <div className="item-facts">
                <CategoryBadge tipo={solicitud.tipo} />
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

function DeliveriesPanel({
  activas,
  finalizadas,
  onCoordinar,
  pinnedRecipients,
  onToggleRecipient,
}) {
  return (
    <>
      <PanelHeading
        eyebrow="Distribución"
        title="Entregas activas"
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
              isPinned={pinnedRecipients.includes(entrega.organizacion)}
              onToggleRecipient={onToggleRecipient}
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
          <DeliveryItem
            entrega={entrega}
            isPinned={pinnedRecipients.includes(entrega.organizacion)}
            onToggleRecipient={onToggleRecipient}
            key={entrega.id}
          />
        ))}
      </HistorySection>
    </>
  );
}

function DeliveryItem({
  entrega,
  onCoordinar,
  isPinned,
  onToggleRecipient,
}) {
  return (
    <article className="management-item">
      <div className="item-primary">
        <div className="item-title-line">
          <strong>{entrega.producto}</strong>
          <StatusBadge estado={entrega.estado} />
        </div>
        <ActorLine
          name={entrega.organizacion}
          isPinned={isPinned}
          onToggle={onToggleRecipient}
          type="receptor"
        />
      </div>
      <div className="item-facts">
        <CategoryBadge tipo={entrega.tipo} />
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

function ActorLine({ name, isPinned, onToggle, type }) {
  return (
    <div className="actor-line">
      <p>{name}</p>
      <button
        className={`pin-button ${isPinned ? "is-pinned" : ""}`}
        type="button"
        aria-label={`${isPinned ? "Quitar" : "Marcar"} ${name} como ${type} frecuente`}
        aria-pressed={isPinned}
        title={`${isPinned ? "Quitar de" : "Agregar a"} frecuentes`}
        onClick={() => onToggle(name)}
      >
        <span aria-hidden="true">{isPinned ? "★" : "☆"}</span>
      </button>
    </div>
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
