import { useMemo, useState } from "react";
import {
  CategoryBadge,
  EmptyState,
  Field,
  PriorityBadge,
  StatusBadge,
} from "./ui.jsx";
import { formatDate, getExpiryInfo } from "../utils/dateUtils.js";

const initialForm = {
  producto: "",
  cantidad: "",
  prioridad: "media",
};

const createInitialFrequentForm = () => ({
  productos: [{ nombre: "", cantidad: "" }],
  frecuencia: "quincenal",
});

function getFrequentProducts(request) {
  if (Array.isArray(request.productos) && request.productos.length > 0) {
    return request.productos;
  }
  if (request.productosFrecuentes) {
    return [
      {
        nombre: request.productosFrecuentes,
        cantidad: request.cantidadHabitual,
      },
    ];
  }
  return [];
}

export function ReceptoraView({
  user,
  solicitudes,
  inventario,
  onSubmit,
  onConfirmarRecepcion,
  frequentRequests,
  onRequestFrequent,
  showToast,
}) {
  const [form, setForm] = useState(initialForm);
  const [frequentForm, setFrequentForm] = useState(createInitialFrequentForm);

  const misSolicitudes = useMemo(
    () => solicitudes.filter((solicitud) => solicitud.organizacion === user.name),
    [solicitudes, user.name],
  );
  const misSolicitudesFrecuente = useMemo(
    () =>
      frequentRequests.filter(
        (request) => request.organizacion === user.name,
      ),
    [frequentRequests, user.name],
  );
  const currentFrequentRequest = misSolicitudesFrecuente[0];
  const canRequestFrequent =
    !currentFrequentRequest || currentFrequentRequest.estado === "rechazada";
  const productosDisponibles = inventario.filter(
    (item) =>
      item.cantidad > 0 && getExpiryInfo(item.vencimiento).level !== "expired",
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

  const handleFrequentRequest = (event) => {
    event.preventDefault();
    const invalidProduct = frequentForm.productos.some(
      (product) =>
        !product.nombre.trim() ||
        !Number.isInteger(Number(product.cantidad)) ||
        Number(product.cantidad) <= 0,
    );
    if (invalidProduct || !frequentForm.frecuencia) {
      showToast("Completa todos los datos para solicitar frecuencia.", "error");
      return;
    }

    onRequestFrequent(frequentForm);
    setFrequentForm(createInitialFrequentForm());
  };

  const updateFrequentProduct = (index, field, value) => {
    setFrequentForm((current) => ({
      ...current,
      productos: current.productos.map((product, productIndex) =>
        productIndex === index ? { ...product, [field]: value } : product,
      ),
    }));
  };

  const addFrequentProduct = () => {
    setFrequentForm((current) => ({
      ...current,
      productos: [...current.productos, { nombre: "", cantidad: "" }],
    }));
  };

  const removeFrequentProduct = (index) => {
    setFrequentForm((current) => ({
      ...current,
      productos: current.productos.filter(
        (_, productIndex) => productIndex !== index,
      ),
    }));
  };

  return (
    <div className="dashboard two-column">
      <section className="section-card form-section">
        <div className="section-heading">
          <span className="eyebrow">Nueva necesidad</span>
          <h2>Solicitar alimentos</h2>
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
                  <CategoryBadge tipo={solicitud.tipo} />
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

      <section className="section-card frequent-request-section">
        <div className="section-heading">
          <span className="eyebrow">Programa de frecuentes</span>
          <h2>Ser receptora frecuente</h2>
        </div>
        <p className="section-description">
          Envía una solicitud al Banco de alimentos. Tu organización aparecerá
          como frecuente únicamente después de ser aprobada.
        </p>

        {canRequestFrequent ? (
          <form className="frequent-application-form" onSubmit={handleFrequentRequest}>
            <fieldset className="frequent-products-fieldset">
              <legend>Productos y cantidades habituales</legend>
              <div className="frequent-product-rows">
                {frequentForm.productos.map((product, index) => (
                  <div className="frequent-product-row" key={index}>
                    <label>
                      <span>Producto {index + 1}</span>
                      <input
                        value={product.nombre}
                        onChange={(event) =>
                          updateFrequentProduct(index, "nombre", event.target.value)
                        }
                        placeholder="Ej. Arroz"
                        required
                      />
                    </label>
                    <label>
                      <span>Cantidad habitual</span>
                      <input
                        value={product.cantidad}
                        onChange={(event) =>
                          updateFrequentProduct(index, "cantidad", event.target.value)
                        }
                        type="number"
                        min="1"
                        step="1"
                        placeholder="Unidades"
                        required
                      />
                    </label>
                    {frequentForm.productos.length > 1 && (
                      <button
                        className="remove-product-button"
                        type="button"
                        aria-label={`Eliminar producto ${index + 1}`}
                        onClick={() => removeFrequentProduct(index)}
                      >
                        Eliminar
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                className="button button-muted add-product-button"
                type="button"
                onClick={addFrequentProduct}
              >
                + Agregar producto
              </button>
            </fieldset>
            <Field label="Cada cuánto los requiere">
              <select
                value={frequentForm.frecuencia}
                onChange={(event) =>
                  setFrequentForm({
                    ...frequentForm,
                    frecuencia: event.target.value,
                  })
                }
              >
                <option value="semanal">Semanal</option>
                <option value="quincenal">Quincenal</option>
                <option value="mensual">Mensual</option>
                <option value="bimestral">Bimestral</option>
              </select>
            </Field>
            <button className="button button-primary" type="submit">
              {currentFrequentRequest
                ? "Solicitar nuevamente"
                : "Enviar solicitud de frecuente"}
            </button>
          </form>
        ) : (
          <div className="frequent-current-status">
            <span>Estado actual</span>
            <StatusBadge estado={currentFrequentRequest.estado} />
          </div>
        )}

        {misSolicitudesFrecuente.length > 0 && (
          <div className="frequent-request-history">
            <strong>Historial de solicitudes</strong>
            {misSolicitudesFrecuente.map((request) => (
              <article key={request.id}>
                <div>
                  <span>Solicitud del {formatDate(request.fechaSolicitud)}</span>
                  <ul className="request-products-list">
                    {getFrequentProducts(request).map((product, index) => (
                      <li key={`${product.nombre}-${index}`}>
                        {product.nombre} — {product.cantidad || "Sin cantidad"}
                        {product.cantidad ? " unidades" : ""}
                      </li>
                    ))}
                  </ul>
                  <small>Frecuencia: {request.frecuencia || "No indicada"}</small>
                  {request.fechaDecision && (
                    <small>
                      Resuelta el {formatDate(request.fechaDecision)}
                    </small>
                  )}
                  {request.motivoRechazo && (
                    <small className="request-rejection-copy">
                      Motivo: {request.motivoRechazo}
                    </small>
                  )}
                </div>
                <StatusBadge estado={request.estado} />
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
