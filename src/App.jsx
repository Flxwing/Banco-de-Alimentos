import React, { useMemo, useState } from "react";

export default function App() {
  const [vista, setVista] = useState("banco");

  const [donaciones, setDonaciones] = useState([
    {
      id: 1,
      donante: "Supermercado La Colonia",
      producto: "Arroz",
      cantidad: 20,
      vencimiento: "2026-06-25",
      estado: "pendiente",
    },
    {
      id: 2,
      donante: "Panadería Central",
      producto: "Pan empacado",
      cantidad: 15,
      vencimiento: "2026-06-20",
      estado: "pendiente",
    },
  ]);

  const [solicitudes, setSolicitudes] = useState([
    {
      id: 1,
      organizacion: "Hogar Esperanza",
      producto: "Arroz",
      cantidad: 10,
      estado: "pendiente",
    },
    {
      id: 2,
      organizacion: "Comedor Solidario SC",
      producto: "Frijoles",
      cantidad: 8,
      estado: "pendiente",
    },
  ]);

  const [inventario, setInventario] = useState([
    {
      id: 1,
      producto: "Frijoles",
      cantidad: 12,
      vencimiento: "2026-07-01",
    },
  ]);

  const [mensaje, setMensaje] = useState("");

  const mostrarMensaje = (texto) => {
    setMensaje(texto);
    setTimeout(() => setMensaje(""), 2500);
  };

  const aceptarDonacion = (id) => {
    const donacion = donaciones.find((d) => d.id === id);
    if (!donacion) return;

    setDonaciones((prev) =>
      prev.map((d) => (d.id === id ? { ...d, estado: "aceptada" } : d)),
    );

    setInventario((prev) => {
      const existente = prev.find((i) => i.producto === donacion.producto);

      if (existente) {
        return prev.map((i) =>
          i.producto === donacion.producto
            ? { ...i, cantidad: i.cantidad + donacion.cantidad }
            : i,
        );
      }

      return [
        ...prev,
        {
          id: Date.now(),
          producto: donacion.producto,
          cantidad: donacion.cantidad,
          vencimiento: donacion.vencimiento,
        },
      ];
    });

    mostrarMensaje("Donación aceptada y agregada al inventario.");
  };

  const rechazarDonacion = (id) => {
    setDonaciones((prev) =>
      prev.map((d) => (d.id === id ? { ...d, estado: "rechazada" } : d)),
    );
    mostrarMensaje("Donación rechazada.");
  };

  const asignarSolicitud = (id) => {
    const solicitud = solicitudes.find((s) => s.id === id);
    if (!solicitud) return;

    const itemInventario = inventario.find(
      (i) =>
        i.producto.toLowerCase() === solicitud.producto.toLowerCase() &&
        i.cantidad >= solicitud.cantidad,
    );

    if (!itemInventario) {
      mostrarMensaje("No hay inventario suficiente para esa solicitud.");
      return;
    }

    setInventario((prev) =>
      prev.map((i) =>
        i.id === itemInventario.id
          ? { ...i, cantidad: i.cantidad - solicitud.cantidad }
          : i,
      ),
    );

    setSolicitudes((prev) =>
      prev.map((s) => (s.id === id ? { ...s, estado: "asignada" } : s)),
    );

    mostrarMensaje("Solicitud asignada correctamente.");
  };

  return (
    <div style={styles.page}>
      <style>{globalStyles}</style>

      <div style={styles.container}>
        <header style={styles.header}>
          <div>
            <h1 style={styles.title}>Banco de Alimentos</h1>
            <p style={styles.subtitle}>
              Prototipo inicial con tres perfiles principales
            </p>
          </div>

          <nav style={styles.tabs}>
            <TabButton
              activo={vista === "banco"}
              onClick={() => setVista("banco")}
              label="Banco"
            />
            <TabButton
              activo={vista === "donante"}
              onClick={() => setVista("donante")}
              label="Donante"
            />
            <TabButton
              activo={vista === "receptora"}
              onClick={() => setVista("receptora")}
              label="Organización receptora"
            />
          </nav>
        </header>

        {mensaje && <div style={styles.toast}>{mensaje}</div>}

        {vista === "banco" && (
          <VistaBanco
            donaciones={donaciones}
            solicitudes={solicitudes}
            inventario={inventario}
            aceptarDonacion={aceptarDonacion}
            rechazarDonacion={rechazarDonacion}
            asignarSolicitud={asignarSolicitud}
          />
        )}

        {vista === "donante" && (
          <VistaDonante
            setDonaciones={setDonaciones}
            mostrarMensaje={mostrarMensaje}
          />
        )}

        {vista === "receptora" && (
          <VistaReceptora
            setSolicitudes={setSolicitudes}
            mostrarMensaje={mostrarMensaje}
          />
        )}
      </div>
    </div>
  );
}

function TabButton({ activo, onClick, label }) {
  return (
    <button
      onClick={onClick}
      style={{
        ...styles.tabButton,
        ...(activo ? styles.tabButtonActive : {}),
      }}
    >
      {label}
    </button>
  );
}

function VistaBanco({
  donaciones,
  solicitudes,
  inventario,
  aceptarDonacion,
  rechazarDonacion,
  asignarSolicitud,
}) {
  const pendientesDonacion = useMemo(
    () => donaciones.filter((d) => d.estado === "pendiente"),
    [donaciones],
  );

  const pendientesSolicitud = useMemo(
    () => solicitudes.filter((s) => s.estado === "pendiente"),
    [solicitudes],
  );

  return (
    <div style={styles.gridBanco}>
      <section style={styles.card}>
        <h2 style={styles.cardTitle}>Resumen</h2>
        <div style={styles.statsGrid}>
          <StatCard
            titulo="Donaciones pendientes"
            valor={pendientesDonacion.length}
          />
          <StatCard
            titulo="Solicitudes pendientes"
            valor={pendientesSolicitud.length}
          />
          <StatCard
            titulo="Productos en inventario"
            valor={inventario.length}
          />
        </div>
      </section>

      <section style={styles.card}>
        <h2 style={styles.cardTitle}>Donaciones recibidas</h2>
        {donaciones.length === 0 ? (
          <EmptyText texto="No hay donaciones registradas." />
        ) : (
          donaciones.map((d) => (
            <div key={d.id} style={styles.itemBox}>
              <div style={styles.itemHeader}>
                <strong>{d.producto}</strong>
                <StatusBadge estado={d.estado} />
              </div>
              <p style={styles.itemText}>Donante: {d.donante}</p>
              <p style={styles.itemText}>Cantidad: {d.cantidad}</p>
              <p style={styles.itemText}>Vencimiento: {d.vencimiento}</p>

              {d.estado === "pendiente" && (
                <div style={styles.actions}>
                  <button
                    style={styles.primaryBtn}
                    onClick={() => aceptarDonacion(d.id)}
                  >
                    Aceptar
                  </button>
                  <button
                    style={styles.secondaryBtn}
                    onClick={() => rechazarDonacion(d.id)}
                  >
                    Rechazar
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </section>

      <section style={styles.card}>
        <h2 style={styles.cardTitle}>Inventario</h2>
        {inventario.length === 0 ? (
          <EmptyText texto="No hay productos en inventario." />
        ) : (
          inventario.map((i) => (
            <div key={i.id} style={styles.itemBox}>
              <div style={styles.itemHeader}>
                <strong>{i.producto}</strong>
                <span style={styles.qtyBadge}>{i.cantidad} unidades</span>
              </div>
              <p style={styles.itemText}>Vencimiento: {i.vencimiento}</p>
            </div>
          ))
        )}
      </section>

      <section style={styles.card}>
        <h2 style={styles.cardTitle}>Solicitudes de organizaciones</h2>
        {solicitudes.length === 0 ? (
          <EmptyText texto="No hay solicitudes registradas." />
        ) : (
          solicitudes.map((s) => (
            <div key={s.id} style={styles.itemBox}>
              <div style={styles.itemHeader}>
                <strong>{s.producto}</strong>
                <StatusBadge estado={s.estado} />
              </div>
              <p style={styles.itemText}>Organización: {s.organizacion}</p>
              <p style={styles.itemText}>Cantidad: {s.cantidad}</p>

              {s.estado === "pendiente" && (
                <div style={styles.actions}>
                  <button
                    style={styles.primaryBtn}
                    onClick={() => asignarSolicitud(s.id)}
                  >
                    Asignar desde inventario
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </section>
    </div>
  );
}

function VistaDonante({ setDonaciones, mostrarMensaje }) {
  const [form, setForm] = useState({
    donante: "",
    producto: "",
    cantidad: "",
    vencimiento: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      !form.donante ||
      !form.producto ||
      !form.cantidad ||
      !form.vencimiento
    ) {
      mostrarMensaje("Completa todos los campos de la donación.");
      return;
    }

    setDonaciones((prev) => [
      ...prev,
      {
        id: Date.now(),
        donante: form.donante,
        producto: form.producto,
        cantidad: Number(form.cantidad),
        vencimiento: form.vencimiento,
        estado: "pendiente",
      },
    ]);

    setForm({
      donante: "",
      producto: "",
      cantidad: "",
      vencimiento: "",
    });

    mostrarMensaje("Donación reportada correctamente.");
  };

  return (
    <section style={styles.card}>
      <h2 style={styles.cardTitle}>Registrar donación</h2>
      <p style={styles.helpText}>
        Vista mínima para que un donante reporte alimentos disponibles.
      </p>

      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          style={styles.input}
          placeholder="Nombre del donante"
          value={form.donante}
          onChange={(e) => setForm({ ...form, donante: e.target.value })}
        />
        <input
          style={styles.input}
          placeholder="Producto"
          value={form.producto}
          onChange={(e) => setForm({ ...form, producto: e.target.value })}
        />
        <input
          style={styles.input}
          type="number"
          placeholder="Cantidad"
          value={form.cantidad}
          onChange={(e) => setForm({ ...form, cantidad: e.target.value })}
        />
        <input
          style={styles.input}
          type="date"
          value={form.vencimiento}
          onChange={(e) => setForm({ ...form, vencimiento: e.target.value })}
        />
        <button style={styles.primaryBtn} type="submit">
          Reportar donación
        </button>
      </form>
    </section>
  );
}

function VistaReceptora({ setSolicitudes, mostrarMensaje }) {
  const [form, setForm] = useState({
    organizacion: "",
    producto: "",
    cantidad: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.organizacion || !form.producto || !form.cantidad) {
      mostrarMensaje("Completa todos los campos de la solicitud.");
      return;
    }

    setSolicitudes((prev) => [
      ...prev,
      {
        id: Date.now(),
        organizacion: form.organizacion,
        producto: form.producto,
        cantidad: Number(form.cantidad),
        estado: "pendiente",
      },
    ]);

    setForm({
      organizacion: "",
      producto: "",
      cantidad: "",
    });

    mostrarMensaje("Solicitud registrada correctamente.");
  };

  return (
    <section style={styles.card}>
      <h2 style={styles.cardTitle}>Solicitar alimentos</h2>
      <p style={styles.helpText}>
        Vista mínima para que una organización receptora registre una necesidad.
      </p>

      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          style={styles.input}
          placeholder="Nombre de la organización"
          value={form.organizacion}
          onChange={(e) => setForm({ ...form, organizacion: e.target.value })}
        />
        <input
          style={styles.input}
          placeholder="Producto solicitado"
          value={form.producto}
          onChange={(e) => setForm({ ...form, producto: e.target.value })}
        />
        <input
          style={styles.input}
          type="number"
          placeholder="Cantidad"
          value={form.cantidad}
          onChange={(e) => setForm({ ...form, cantidad: e.target.value })}
        />
        <button style={styles.primaryBtn} type="submit">
          Registrar solicitud
        </button>
      </form>
    </section>
  );
}

function StatCard({ titulo, valor }) {
  return (
    <div style={styles.statCard}>
      <p style={styles.statTitle}>{titulo}</p>
      <h3 style={styles.statValue}>{valor}</h3>
    </div>
  );
}

function StatusBadge({ estado }) {
  const colores = {
    pendiente: { bg: "#fff7d6", color: "#8a6d00" },
    aceptada: { bg: "#dcfce7", color: "#166534" },
    rechazada: { bg: "#fee2e2", color: "#991b1b" },
    asignada: { bg: "#dbeafe", color: "#1d4ed8" },
  };

  const estilo = colores[estado] || { bg: "#e5e7eb", color: "#374151" };

  return (
    <span
      style={{
        background: estilo.bg,
        color: estilo.color,
        padding: "6px 10px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 700,
        textTransform: "capitalize",
      }}
    >
      {estado}
    </span>
  );
}

function EmptyText({ texto }) {
  return <p style={styles.empty}>{texto}</p>;
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f5f7fb",
    padding: 24,
    fontFamily: "Arial, sans-serif",
    color: "#1f2937",
  },
  container: {
    maxWidth: 1200,
    margin: "0 auto",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    gap: 16,
    alignItems: "flex-start",
    marginBottom: 20,
    flexWrap: "wrap",
  },
  title: {
    margin: 0,
    fontSize: 34,
  },
  subtitle: {
    margin: "8px 0 0 0",
    color: "#6b7280",
  },
  tabs: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
  },
  tabButton: {
    border: "1px solid #d1d5db",
    background: "white",
    padding: "10px 14px",
    borderRadius: 12,
    cursor: "pointer",
    fontWeight: 700,
  },
  tabButtonActive: {
    background: "#166534",
    color: "white",
    border: "1px solid #166534",
  },
  toast: {
    marginBottom: 18,
    background: "#ecfdf5",
    color: "#166534",
    border: "1px solid #a7f3d0",
    padding: 12,
    borderRadius: 12,
    fontWeight: 700,
  },
  gridBanco: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: 18,
  },
  card: {
    background: "white",
    borderRadius: 18,
    padding: 20,
    boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
  },
  cardTitle: {
    marginTop: 0,
    marginBottom: 10,
    fontSize: 22,
  },
  helpText: {
    marginTop: 0,
    color: "#6b7280",
    marginBottom: 16,
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
    gap: 12,
  },
  statCard: {
    background: "#f9fafb",
    borderRadius: 14,
    padding: 14,
    border: "1px solid #e5e7eb",
  },
  statTitle: {
    margin: 0,
    color: "#6b7280",
    fontSize: 14,
  },
  statValue: {
    margin: "8px 0 0 0",
    fontSize: 28,
  },
  itemBox: {
    border: "1px solid #e5e7eb",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    background: "#fafafa",
  },
  itemHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "center",
    flexWrap: "wrap",
    marginBottom: 8,
  },
  itemText: {
    margin: "6px 0",
  },
  qtyBadge: {
    background: "#eff6ff",
    color: "#1d4ed8",
    padding: "6px 10px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 700,
  },
  actions: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
    marginTop: 12,
  },
  primaryBtn: {
    background: "#166534",
    color: "white",
    border: "none",
    padding: "10px 14px",
    borderRadius: 12,
    cursor: "pointer",
    fontWeight: 700,
  },
  secondaryBtn: {
    background: "#e5e7eb",
    color: "#111827",
    border: "none",
    padding: "10px 14px",
    borderRadius: 12,
    cursor: "pointer",
    fontWeight: 700,
  },
  form: {
    display: "grid",
    gap: 12,
    maxWidth: 520,
  },
  input: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 12,
    border: "1px solid #d1d5db",
    fontSize: 15,
  },
  empty: {
    color: "#6b7280",
    margin: 0,
  },
};

const globalStyles = `
  * {
    box-sizing: border-box;
  }

  body {
    margin: 0;
  }

  button:hover {
    filter: brightness(0.97);
  }
`;
