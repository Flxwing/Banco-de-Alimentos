import { useMemo, useRef, useState } from "react";
import "./App.css";
import { AppHeader } from "./components/AppHeader.jsx";
import { BancoView } from "./components/BancoView.jsx";
import { DonanteView } from "./components/DonanteView.jsx";
import { LoginView } from "./components/LoginView.jsx";
import { ReceptoraView } from "./components/ReceptoraView.jsx";
import {
  initialDonaciones,
  initialInventario,
  initialSolicitudes,
  mockUsers,
} from "./data/mockData.js";

const toastDuration = 2800;

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loginError, setLoginError] = useState("");
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);
  const [donaciones, setDonaciones] = useState(initialDonaciones);
  const [solicitudes, setSolicitudes] = useState(initialSolicitudes);
  const [inventario, setInventario] = useState(initialInventario);

  const bancoStats = useMemo(() => {
    const donacionesPendientes = donaciones.filter(
      (donacion) => donacion.estado === "pendiente",
    ).length;
    const solicitudesPendientes = solicitudes.filter(
      (solicitud) => solicitud.estado === "pendiente",
    ).length;
    const entregasCoordinadas = solicitudes.filter(
      (solicitud) => solicitud.estado === "entrega coordinada",
    ).length;
    const inventarioDisponible = inventario.reduce(
      (total, item) => total + item.cantidad,
      0,
    );

    return {
      donacionesPendientes,
      solicitudesPendientes,
      entregasCoordinadas,
      inventarioDisponible,
      productosInventario: inventario.length,
    };
  }, [donaciones, solicitudes, inventario]);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), toastDuration);
  };

  const handleLogin = ({ username, password }) => {
    const user = mockUsers.find(
      (candidate) =>
        candidate.username.toLowerCase() === username.trim().toLowerCase() &&
        candidate.password === password,
    );

    if (!user) {
      setLoginError("Usuario o contraseña incorrectos. Intenta con 1234.");
      return;
    }

    setCurrentUser(user);
    setLoginError("");
    showToast(`Bienvenido, ${user.name}.`);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setLoginError("");
    showToast("Sesión cerrada. Puedes entrar con otro usuario.");
  };

  const aceptarDonacion = (id) => {
    const donacion = donaciones.find((item) => item.id === id);
    if (!donacion) return;

    setDonaciones((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, estado: "aceptada" } : item,
      ),
    );

    setInventario((prev) => {
      const existente = prev.find(
        (item) => item.producto.toLowerCase() === donacion.producto.toLowerCase(),
      );

      if (existente) {
        return prev.map((item) =>
          item.id === existente.id
            ? {
                ...item,
                cantidad: item.cantidad + donacion.cantidad,
                vencimiento:
                  donacion.vencimiento < item.vencimiento
                    ? donacion.vencimiento
                    : item.vencimiento,
              }
            : item,
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

    showToast("Donación aceptada y agregada al inventario.");
  };

  const rechazarDonacion = (id) => {
    setDonaciones((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, estado: "rechazada" } : item,
      ),
    );
    showToast("Donación rechazada.", "warning");
  };

  const asignarSolicitud = (id) => {
    const solicitud = solicitudes.find((item) => item.id === id);
    if (!solicitud) return;

    const itemInventario = inventario.find(
      (item) =>
        item.producto.toLowerCase() === solicitud.producto.toLowerCase() &&
        item.cantidad >= solicitud.cantidad,
    );

    if (!itemInventario) {
      showToast("No hay inventario suficiente para esa solicitud.", "error");
      return;
    }

    setInventario((prev) =>
      prev.map((item) =>
        item.id === itemInventario.id
          ? { ...item, cantidad: item.cantidad - solicitud.cantidad }
          : item,
      ),
    );

    setSolicitudes((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, estado: "asignada" } : item,
      ),
    );

    showToast("Solicitud asignada correctamente.");
  };

  const coordinarEntrega = (id) => {
    setSolicitudes((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, estado: "entrega coordinada" } : item,
      ),
    );

    showToast("Entrega coordinada con la organización receptora.");
  };

  const confirmarRecepcion = (id) => {
    setSolicitudes((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, estado: "recibida" } : item,
      ),
    );

    showToast("Recepción confirmada. El ciclo de distribución quedó cerrado.");
  };

  const registrarDonacion = (form) => {
    setDonaciones((prev) => [
      {
        id: Date.now(),
        donante: currentUser.name,
        producto: form.producto,
        cantidad: Number(form.cantidad),
        vencimiento: form.vencimiento,
        estado: "pendiente",
      },
      ...prev,
    ]);

    showToast("Donación reportada correctamente. El banco la revisará pronto.");
  };

  const registrarSolicitud = (form) => {
    setSolicitudes((prev) => [
      {
        id: Date.now(),
        organizacion: currentUser.name,
        producto: form.producto,
        cantidad: Number(form.cantidad),
        prioridad: form.prioridad,
        estado: "pendiente",
      },
      ...prev,
    ]);

    showToast("Solicitud registrada correctamente.");
  };

  if (!currentUser) {
    return (
      <main className="app-shell login-shell">
        {toast && <Toast toast={toast} />}
        <LoginView
          users={mockUsers}
          error={loginError}
          onLogin={handleLogin}
        />
      </main>
    );
  }

  return (
    <main className="app-shell">
      <AppHeader user={currentUser} stats={bancoStats} onLogout={handleLogout} />
      {toast && <Toast toast={toast} />}

      {currentUser.role === "banco" && (
        <BancoView
          donaciones={donaciones}
          solicitudes={solicitudes}
          inventario={inventario}
          stats={bancoStats}
          onAceptarDonacion={aceptarDonacion}
          onRechazarDonacion={rechazarDonacion}
          onAsignarSolicitud={asignarSolicitud}
          onCoordinarEntrega={coordinarEntrega}
        />
      )}

      {currentUser.role === "donante" && (
        <DonanteView
          user={currentUser}
          donaciones={donaciones}
          onSubmit={registrarDonacion}
          showToast={showToast}
        />
      )}

      {currentUser.role === "receptora" && (
        <ReceptoraView
          user={currentUser}
          solicitudes={solicitudes}
          inventario={inventario}
          onSubmit={registrarSolicitud}
          onConfirmarRecepcion={confirmarRecepcion}
          showToast={showToast}
        />
      )}
    </main>
  );
}

function Toast({ toast }) {
  return (
    <div className={`toast toast-${toast.type}`} role="status">
      <span>{toast.message}</span>
    </div>
  );
}
