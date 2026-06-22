export function getExpiryInfo(dateString) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiryDate = new Date(`${dateString}T00:00:00`);
  const days = Math.ceil((expiryDate - today) / 86400000);

  if (days < 0) return { level: "expired", label: "Vencido", days };
  if (days === 0) return { level: "urgent", label: "Urgente · vence hoy", days };
  if (days <= 15) {
    return { level: "urgent", label: `Urgente · ${days} días`, days };
  }
  if (days <= 30) {
    return { level: "soon", label: `Próximo a vencer · ${days} días`, days };
  }
  return { level: "normal", label: "Normal", days };
}

export function formatDate(dateString) {
  return new Intl.DateTimeFormat("es-CR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(`${dateString}T00:00:00`));
}

export function getTodayInputValue() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
