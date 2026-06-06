import { useMemo, useState } from "react";
import { EmptyState, Field, StatusBadge } from "./ui.jsx";

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
      <section className="section-card">
        <div className="section-heading">
          <span className="eyebrow">Organización receptora</span>
          <h2>Registrar solicitud</h2>
          <p>
            Indica qué alimento necesitas. Si el banco lo asigna y coordina la
            entrega, podrás confirmar la recepción desde tu historial.
          </p>
        </div>

        <form className="form" onSubmit={handleSubmit}>
          <Field label="Producto solicitado">
            <input
              value={form.producto}
              onChange={(event) =>
                setForm({ ...form, producto: event.target.value })
              }
              placeholder="Ej. arroz, frijoles, plátano"
            />
          </Field>
          <Field label="Cantidad">
            <input
              value={form.cantidad}
              onChange={(event) =>
                setForm({ ...form, cantidad: event.target.value })
              }
              type="number"
              min="1"
              placeholder="Unidades requeridas"
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
            Registrar solicitud
          </button>
        </form>
      </section>

      <section className="section-card">
        <div className="section-heading">
          <span className="eyebrow">Seguimiento</span>
          <h2>Mis solicitudes</h2>
          <p>Confirma recepción cuando el banco haya coordinado la entrega.</p>
        </div>
        <div className="item-list">
          {misSolicitudes.length === 0 ? (
            <EmptyState
              title="Sin solicitudes registradas"
              text="Aquí aparecerán tus solicitudes y el estado de asignación."
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
                <p className="muted-text">
                  Prioridad: {solicitud.prioridad || "media"}
                </p>
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
                  <p className="status-help">
                    Recepción confirmada. Esta solicitud ya cerró el ciclo.
                  </p>
                )}
              </article>
            ))
          )}
        </div>
      </section>

      <section className="section-card section-wide">
        <div className="section-heading">
          <span className="eyebrow">Referencia</span>
          <h2>Inventario visible para la prueba</h2>
          <p>
            Esta lista ayuda a los compañeros a probar solicitudes con productos
            que el banco puede asignar.
          </p>
        </div>
        <div className="inventory-strip">
          {inventario.length === 0 ? (
            <span>No hay inventario disponible por ahora.</span>
          ) : (
            inventario.map((item) => (
              <span key={item.id}>
                {item.producto}: <strong>{item.cantidad}</strong>
              </span>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
