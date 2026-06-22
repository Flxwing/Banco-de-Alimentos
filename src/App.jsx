import { useEffect, useMemo, useRef, useState } from "react";
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
import { getExpiryInfo, getTodayInputValue } from "./utils/dateUtils.js";

const toastDuration = 2800;
const pinnedDonorsKey = "banco-alimentos-pinned-donors";
const frequentRequestsKey = "banco-alimentos-frequent-requests";

function loadPinnedActors(key) {
  try {
    const saved = JSON.parse(window.localStorage.getItem(key));
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loginError, setLoginError] = useState("");
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);
  const [donaciones, setDonaciones] = useState(initialDonaciones);
  const [solicitudes, setSolicitudes] = useState(initialSolicitudes);
  const [inventario, setInventario] = useState(initialInventario);
  const [pinnedDonors, setPinnedDonors] = useState(() =>
    loadPinnedActors(pinnedDonorsKey),
  );
  const [frequentRequests, setFrequentRequests] = useState(() =>
    loadPinnedActors(frequentRequestsKey),
  );

  useEffect(() => {
    try {
      window.localStorage.setItem(pinnedDonorsKey, JSON.stringify(pinnedDonors));
    } catch {
      // La sesión actual conserva los favoritos aunque el navegador bloquee storage.
    }
  }, [pinnedDonors]);

  useEffect(() => {
    try {
      window.localStorage.setItem(frequentRequestsKey, JSON.stringify(frequentRequests));
    } catch {
      // La sesión actual conserva las solicitudes aunque el navegador bloquee storage.
    }
  }, [frequentRequests]);

  const approvedRecipients = useMemo(
    () => [
      ...new Set(
        frequentRequests
          .filter((request) => request.estado === "aprobada")
          .map((request) => request.organizacion),
      ),
    ],
    [frequentRequests],
  );

  const bancoStats = useMemo(() => {
    const donacionesPendientes = donaciones.filter(
      (donacion) => donacion.estado === "pendiente",
    ).length;
    const solicitudesPendientes = solicitudes.filter(
      (solicitud) => solicitud.estado === "pendiente",
    ).length;
    const inventarioDistribuible = inventario.filter(
      (item) =>
        item.cantidad > 0 && getExpiryInfo(item.vencimiento).level !== "expired",
    );
    const inventarioDisponible = inventarioDistribuible.reduce(
      (total, item) => total + item.cantidad,
      0,
    );

    return {
      donacionesPendientes,
      solicitudesPendientes,
      inventarioDisponible,
      productosInventario: inventarioDistribuible.length,
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

    if (getExpiryInfo(donacion.vencimiento).level === "expired") {
      showToast("No se puede aceptar una donación vencida.", "error");
      return;
    }

    setDonaciones((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, estado: "aceptada" } : item,
      ),
    );

    setInventario((prev) => {
      const existente = prev.find(
        (item) =>
          item.producto.toLowerCase() === donacion.producto.toLowerCase() &&
          item.tipo === donacion.tipo,
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
          tipo: donacion.tipo,
          cantidad: donacion.cantidad,
          vencimiento: donacion.vencimiento,
        },
      ];
    });

    showToast("Donación aceptada y agregada al inventario.");
  };

  const rechazarDonacion = (id, motivoRechazo) => {
    const motivo = motivoRechazo.trim();
    if (!motivo) {
      showToast("Debes registrar el motivo del rechazo.", "error");
      return;
    }

    setDonaciones((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, estado: "rechazada", motivoRechazo: motivo }
          : item,
      ),
    );
    showToast("Donación rechazada con el motivo registrado.", "warning");
  };

  const asignarSolicitud = (id) => {
    const solicitud = solicitudes.find((item) => item.id === id);
    if (!solicitud) return;

    const itemInventario = inventario
      .filter(
        (item) =>
          item.producto.toLowerCase() === solicitud.producto.toLowerCase() &&
          item.cantidad >= solicitud.cantidad &&
          getExpiryInfo(item.vencimiento).level !== "expired",
      )
      .sort((a, b) => new Date(a.vencimiento) - new Date(b.vencimiento))[0];

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
        tipo: form.tipo,
        cantidad: Number(form.cantidad),
        vencimiento: form.vencimiento,
        fechaRegistro: getTodayInputValue(),
        estado: "pendiente",
      },
      ...prev,
    ]);

    showToast("Donación reportada correctamente. El banco la revisará pronto.");
  };

  const registrarSolicitud = (form) => {
    const productoInventario = inventario.find(
      (item) => item.producto.toLowerCase() === form.producto.toLowerCase(),
    );

    setSolicitudes((prev) => [
      {
        id: Date.now(),
        organizacion: currentUser.name,
        producto: form.producto,
        tipo: productoInventario?.tipo || "otro",
        cantidad: Number(form.cantidad),
        prioridad: form.prioridad,
        fechaRegistro: getTodayInputValue(),
        estado: "pendiente",
      },
      ...prev,
    ]);

    showToast("Solicitud registrada correctamente.");
  };

  const solicitarSerFrecuente = () => {
    const hasOpenRequest = frequentRequests.some(
      (request) =>
        request.organizacion === currentUser.name &&
        ["pendiente", "aprobada"].includes(request.estado),
    );

    if (hasOpenRequest) {
      showToast("Ya existe una solicitud pendiente o aprobada.", "warning");
      return;
    }

    setFrequentRequests((prev) => [
      {
        id: Date.now(),
        organizacion: currentUser.name,
        estado: "pendiente",
        fechaSolicitud: getTodayInputValue(),
      },
      ...prev,
    ]);
    showToast("Solicitud para ser frecuente enviada al Banco.");
  };

  const resolveFrequentRequest = (id, estado) => {
    setFrequentRequests((prev) =>
      prev.map((request) =>
        request.id === id && request.estado === "pendiente"
          ? { ...request, estado, fechaDecision: getTodayInputValue() }
          : request,
      ),
    );
    showToast(
      estado === "aprobada"
        ? "Organización aprobada como receptora frecuente."
        : "Solicitud de frecuente rechazada.",
      estado === "aprobada" ? "success" : "warning",
    );
  };

  const togglePinnedActor = (setter, name) => {
    setter((prev) =>
      prev.includes(name)
        ? prev.filter((actor) => actor !== name)
        : [...prev, name],
    );
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
      <AppHeader user={currentUser} onLogout={handleLogout} />
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
          pinnedDonors={pinnedDonors}
          pinnedRecipients={approvedRecipients}
          frequentRequests={frequentRequests}
          onToggleDonor={(name) => togglePinnedActor(setPinnedDonors, name)}
          onResolveFrequentRequest={resolveFrequentRequest}
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
          frequentRequests={frequentRequests}
          onRequestFrequent={solicitarSerFrecuente}
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
