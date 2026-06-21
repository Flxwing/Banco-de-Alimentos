import { useMemo, useState } from "react";
import {
  EmptyState,
  Field,
  PriorityBadge,
  StatusBadge,
} from "./ui.jsx";

const initialForm = {
  producto: "",
  cantidad: "",
  prioridad: "media",
};

export function ReceptoraView({
  user,
  solicitudes,
  inventario,
  onSubmit,
  onConfirmarRecepcion,
  showToast,
}) {
  const [form, setForm] = useState(initialForm);

  const misSolicitudes = useMemo(
    () => solicitudes.filter((solicitud) => solicitud.organizacion === user.name),
    [solicitudes, user.name],
  );
  const productosDisponibles = inventario.filter((item) => item.cantidad > 0);

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!form.producto || !form.cantidad || !form.prioridad) {
      showToast("Completa todos los campos de la solicitud.", "error");
      return;
    }

    if (Number(form.cantidad) <= 0) {
      showToast("La cantidad debe ser mayor a cero.", "error");
      return;
    }

    onSubmit(form);
    setForm(initialForm);
  };

  return (
    <div className="dashboard two-column">
      <section className="section-card form-section">
        <div className="section-heading">
          <span className="eyebrow">Nueva necesidad</span>
          <h2>Solicitar alimentos</h2>
          <p>Registra el producto requerido, la cantidad y su nivel de prioridad.</p>
        </div>

        <form className="form" onSubmit={handleSubmit}>
          <Field label="Producto solicitado">
            <input
              value={form.producto}
              onChange={(event) =>
                setForm({ ...form, producto: event.target.value })
              }
              list="productos-disponibles"
              placeholder="Selecciona o escribe un producto"
            />
          </Field>
          <datalist id="productos-disponibles">
            {productosDisponibles.map((item) => (
              <option value={item.producto} key={item.id} />
            ))}
          </datalist>
          <Field label="Cantidad requerida">
            <input
              value={form.cantidad}
              onChange={(event) =>
                setForm({ ...form, cantidad: event.target.value })
              }
              type="number"
              min="1"
              placeholder="Número de unidades"
            />
          </Field>
          <Field label="Prioridad">
            <select
              value={form.prioridad}
              onChange={(event) =>
                setForm({ ...form, prioridad: event.target.value })
              }
            >
              <option value="alta">Alta</option>
              <option value="media">Media</option>
              <option value="baja">Baja</option>
            </select>
          </Field>
          <button className="button button-primary" type="submit">
            Enviar solicitud
          </button>
        </form>

        <div className="availability-summary" aria-label="Disponibilidad actual">
          <strong>Disponibilidad actual</strong>
          <div className="inventory-strip">
            {productosDisponibles.length === 0 ? (
              <span>Sin existencias disponibles</span>
            ) : (
              productosDisponibles.map((item) => (
                <span key={item.id}>
                  {item.producto} <strong>{item.cantidad}</strong>
                </span>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="section-card history-section">
        <div className="section-heading">
          <span className="eyebrow">Seguimiento</span>
          <h2>Mis solicitudes</h2>
          <p>Consulta asignaciones y confirma los alimentos recibidos.</p>
        </div>
        <div className="item-list">
          {misSolicitudes.length === 0 ? (
            <EmptyState
              title="No hay solicitudes registradas"
              text="Tu primera solicitud aparecerá aquí después de enviarla."
            />
          ) : (
            misSolicitudes.map((solicitud) => (
              <article className="list-item" key={solicitud.id}>
                <div className="item-top">
                  <div>
                    <strong>{solicitud.producto}</strong>
                    <p>{solicitud.cantidad} unidades solicitadas</p>
                  </div>
                  <StatusBadge estado={solicitud.estado} />
                </div>
                <div className="item-footer">
                  <PriorityBadge prioridad={solicitud.prioridad} />
                </div>
                {solicitud.estado === "entrega coordinada" && (
                  <div className="actions">
                    <button
                      className="button button-primary"
                      type="button"
                      onClick={() => onConfirmarRecepcion(solicitud.id)}
                    >
                      Confirmar recepción
                    </button>
                  </div>
                )}
                {solicitud.estado === "recibida" && (
                  <p className="item-note item-note-success">
                    Recepción confirmada.
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
