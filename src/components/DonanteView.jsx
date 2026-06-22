import { useMemo, useState } from "react";
import {
  CategoryBadge,
  EmptyState,
  ExpiryBadge,
  Field,
  StatusBadge,
} from "./ui.jsx";
import { formatDate, getTodayInputValue } from "../utils/dateUtils.js";
import { productCategories } from "../data/mockData.js";

const initialForm = {
  producto: "",
  tipo: "otro",
  cantidad: "",
  vencimiento: "",
};

const suggestedProducts = [
  "Arroz",
  "Frijoles",
  "Leche UHT",
  "Pan empacado",
  "Pasta",
  "Plátano",
  "Vegetales",
];

export function DonanteView({ user, donaciones, onSubmit, showToast }) {
  const [form, setForm] = useState(initialForm);
  const today = getTodayInputValue();

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
      <section className="section-card form-section">
        <div className="section-heading">
          <span className="eyebrow">Nueva disponibilidad</span>
          <h2>Registrar donación</h2>
        </div>

        <form className="form" onSubmit={handleSubmit}>
          <Field label="Producto">
            <input
              value={form.producto}
              onChange={(event) =>
                setForm({ ...form, producto: event.target.value })
              }
              list="productos-donacion"
              placeholder="Selecciona o escribe un producto"
            />
          </Field>
          <datalist id="productos-donacion">
            {suggestedProducts.map((product) => (
              <option value={product} key={product} />
            ))}
          </datalist>
          <Field label="Tipo de producto">
            <select
              value={form.tipo}
              onChange={(event) => setForm({ ...form, tipo: event.target.value })}
            >
              {productCategories.map((category) => (
                <option value={category} key={category}>
                  {category}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Cantidad disponible">
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
          <Field label="Fecha de vencimiento">
            <input
              value={form.vencimiento}
              onChange={(event) =>
                setForm({ ...form, vencimiento: event.target.value })
              }
              type="date"
              min={today}
            />
          </Field>
          <button className="button button-primary" type="submit">
            Registrar donación
          </button>
        </form>
      </section>

      <section className="section-card history-section">
        <div className="section-heading">
          <span className="eyebrow">Seguimiento</span>
          <h2>Mis donaciones</h2>
        </div>
        <div className="item-list">
          {misDonaciones.length === 0 ? (
            <EmptyState
              title="No hay donaciones registradas"
              text="Tu primera donación aparecerá aquí después de enviarla."
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
                <div className="item-footer">
                  <CategoryBadge tipo={donacion.tipo} />
                  <span>Vence {formatDate(donacion.vencimiento)}</span>
                  <ExpiryBadge date={donacion.vencimiento} />
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
