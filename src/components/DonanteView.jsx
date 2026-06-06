import { useMemo, useState } from "react";
import { EmptyState, Field, StatusBadge } from "./ui.jsx";

const initialForm = {
  producto: "",
  cantidad: "",
  vencimiento: "",
};

export function DonanteView({ user, donaciones, onSubmit, showToast }) {
  const [form, setForm] = useState(initialForm);

  const misDonaciones = useMemo(
    () => donaciones.filter((donacion) => donacion.donante === user.name),
    [donaciones, user.name],
  );

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!form.producto || !form.cantidad || !form.vencimiento) {
      showToast("Completa todos los campos de la donación.", "error");
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
          <span className="eyebrow">Donante</span>
          <h2>Reportar donación</h2>
          <p>
            Registra alimentos disponibles para que el banco los revise y los
            agregue al inventario si cumplen las condiciones.
          </p>
        </div>

        <form className="form" onSubmit={handleSubmit}>
          <Field label="Producto">
            <input
              value={form.producto}
              onChange={(event) =>
                setForm({ ...form, producto: event.target.value })
              }
              placeholder="Ej. arroz, frijoles, pan"
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
              placeholder="Unidades disponibles"
            />
          </Field>
          <Field label="Fecha de vencimiento">
            <input
              value={form.vencimiento}
              onChange={(event) =>
                setForm({ ...form, vencimiento: event.target.value })
              }
              type="date"
            />
          </Field>
          <button className="button button-primary" type="submit">
            Reportar donación
          </button>
        </form>
      </section>

      <section className="section-card">
        <div className="section-heading">
          <span className="eyebrow">Historial</span>
          <h2>Mis donaciones</h2>
          <p>Revisa si el banco dejó tu donación pendiente, aceptada o rechazada.</p>
        </div>
        <div className="item-list">
          {misDonaciones.length === 0 ? (
            <EmptyState
              title="Aún no hay donaciones"
              text="Cuando registres una donación podrás revisar su estado aquí."
            />
          ) : (
            misDonaciones.map((donacion) => (
              <article className="list-item" key={donacion.id}>
                <div className="item-top">
                  <div>
                    <strong>{donacion.producto}</strong>
                    <p>{donacion.cantidad} unidades</p>
                  </div>
                  <StatusBadge estado={donacion.estado} />
                </div>
                <p className="muted-text">Vencimiento: {donacion.vencimiento}</p>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
