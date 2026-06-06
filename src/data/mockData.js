export const roleLabels = {
  banco: "Banco de alimentos",
  donante: "Donante",
  receptora: "Organización receptora",
};

export const roleDescriptions = {
  banco: "Revisa donaciones, administra inventario, asigna solicitudes y coordina entregas.",
  donante: "Reporta alimentos disponibles para que el banco los revise.",
  receptora: "Solicita alimentos y confirma cuando recibe una entrega.",
};

export const demoSequence = [
  "Entra como donante y reporta una donación.",
  "Entra como banco, acepta la donación y revisa el inventario.",
  "Entra como receptora y registra una solicitud.",
  "Vuelve al banco, asigna la solicitud y coordina la entrega.",
  "Regresa como receptora y confirma la recepción.",
];

export const mockUsers = [
  {
    id: "banco1",
    username: "banco1",
    password: "1234",
    name: "Banco Central de Alimentos",
    role: "banco",
    location: "San Carlos",
  },
  {
    id: "banco2",
    username: "banco2",
    password: "1234",
    name: "Banco Comunitario Norte",
    role: "banco",
    location: "Ciudad Quesada",
  },
  {
    id: "donante1",
    username: "donante1",
    password: "1234",
    name: "Supermercado San Carlos",
    role: "donante",
    location: "Florencia",
  },
  {
    id: "donante2",
    username: "donante2",
    password: "1234",
    name: "Panadería La Espiga",
    role: "donante",
    location: "Aguas Zarcas",
  },
  {
    id: "donante3",
    username: "donante3",
    password: "1234",
    name: "Finca El Porvenir",
    role: "donante",
    location: "Pital",
  },
  {
    id: "receptora1",
    username: "receptora1",
    password: "1234",
    name: "Hogar Esperanza",
    role: "receptora",
    location: "La Fortuna",
  },
  {
    id: "receptora2",
    username: "receptora2",
    password: "1234",
    name: "Comedor Solidario",
    role: "receptora",
    location: "Ciudad Quesada",
  },
  {
    id: "receptora3",
    username: "receptora3",
    password: "1234",
    name: "Fundación Manos Unidas",
    role: "receptora",
    location: "Venecia",
  },
];

export const initialDonaciones = [
  {
    id: 1,
    donante: "Supermercado San Carlos",
    producto: "Arroz",
    cantidad: 20,
    vencimiento: "2026-06-25",
    estado: "pendiente",
  },
  {
    id: 2,
    donante: "Panadería La Espiga",
    producto: "Pan empacado",
    cantidad: 15,
    vencimiento: "2026-06-20",
    estado: "pendiente",
  },
  {
    id: 3,
    donante: "Finca El Porvenir",
    producto: "Plátano",
    cantidad: 30,
    vencimiento: "2026-06-18",
    estado: "aceptada",
  },
];

export const initialSolicitudes = [
  {
    id: 1,
    organizacion: "Hogar Esperanza",
    producto: "Arroz",
    cantidad: 10,
    prioridad: "alta",
    estado: "pendiente",
  },
  {
    id: 2,
    organizacion: "Comedor Solidario",
    producto: "Frijoles",
    cantidad: 8,
    prioridad: "media",
    estado: "pendiente",
  },
  {
    id: 3,
    organizacion: "Fundación Manos Unidas",
    producto: "Plátano",
    cantidad: 12,
    prioridad: "media",
    estado: "asignada",
  },
  {
    id: 4,
    organizacion: "Comedor Solidario",
    producto: "Plátano",
    cantidad: 6,
    prioridad: "baja",
    estado: "entrega coordinada",
  },
];

export const initialInventario = [
  {
    id: 1,
    producto: "Frijoles",
    cantidad: 12,
    vencimiento: "2026-07-01",
  },
  {
    id: 2,
    producto: "Plátano",
    cantidad: 18,
    vencimiento: "2026-06-18",
  },
];
