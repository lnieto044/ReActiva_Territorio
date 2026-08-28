import { initializeApp } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { calcularPrioridad } from '../src/domain/priority';
import type { NivelAfectacionInmueble } from '../src/types/case';

process.env.FIRESTORE_EMULATOR_HOST ??= '127.0.0.1:8080';
process.env.FIREBASE_AUTH_EMULATOR_HOST ??= '127.0.0.1:9099';
initializeApp({ projectId: 'demo-reactiva-territorio' });
const db = getFirestore();
const auth = getAuth();

const NOW = new Date();
function hace(dias: number) {
  const d = new Date(NOW);
  d.setDate(d.getDate() - dias);
  return Timestamp.fromDate(d);
}

// Demo accounts you can actually log in with (email/contraseña shown in the
// console output below). Fixed UIDs keep them aligned with the seeded
// Firestore docs and with registradoPor on the seeded cases/offers.
const DEMO_ACCOUNTS = [
  { uid: 'demo-lider', email: 'lider@demo.reactiva', password: 'demo1234', displayName: 'Carlos (líder comunitario)' },
  { uid: 'demo-org', email: 'org@demo.reactiva', password: 'demo1234', displayName: 'Fundación Reconstruir' },
  { uid: 'demo-admin', email: 'admin@demo.reactiva', password: 'demo1234', displayName: 'Equipo ReActiva' },
];

async function ensureAuthUser(account: (typeof DEMO_ACCOUNTS)[number]) {
  try {
    await auth.getUser(account.uid);
  } catch {
    await auth.createUser({
      uid: account.uid,
      email: account.email,
      password: account.password,
      displayName: account.displayName,
    });
  }
}

interface CaseSpec {
  id: string;
  nombreReportante: string;
  telefono: string;
  municipio: string;
  vereda: string;
  ubicacion: { lat: number; lng: number };
  tipoAfectacion: 'vivienda' | 'negocio' | 'infraestructura_comunitaria' | 'otro';
  categoria: string;
  descripcion: string;
  personasAfectadas: number;
  actividadEconomica?: string;
  ingresosAprox?: number;
  perdidaTotalIngresos: boolean;
  interrupcionServicioEsencial: boolean;
  personasVulnerablesACargo: number;
  nivelAfectacionInmueble: NivelAfectacionInmueble;
  aislamientoGeografico: boolean;
  ayudaNecesitada: string[];
  estado: 'pendiente' | 'en_verificacion' | 'verificado' | 'atendido';
  diasAtras: number;
}

// 14 cases spread across 5 real Chocó municipalities and every case status,
// so every panel/chart has enough real variety to be worth showing —
// not just María and Pedro at "pendiente".
const CASES: CaseSpec[] = [
  {
    id: 'maria-tienda-demo', nombreReportante: 'María', telefono: '3001234567', municipio: 'San José del Palmar', vereda: 'Vereda El Cedro',
    ubicacion: { lat: 4.9736, lng: -76.2589 }, tipoAfectacion: 'negocio', categoria: 'materiales_construccion',
    descripcion: 'Tienda de barrio con techo dañado e inventario perdido tras el sismo.', personasAfectadas: 3, actividadEconomica: 'Tienda de barrio', ingresosAprox: 400000,
    perdidaTotalIngresos: true, interrupcionServicioEsencial: false, personasVulnerablesACargo: 1, nivelAfectacionInmueble: 'parcial', aislamientoGeografico: true,
    ayudaNecesitada: ['materiales_construccion', 'inventario_comercial'], estado: 'pendiente', diasAtras: 0,
  },
  {
    id: 'pedro-vivienda-demo', nombreReportante: 'Pedro', telefono: '3007654321', municipio: 'Nóvita', vereda: 'Vereda La Playa',
    ubicacion: { lat: 4.9622, lng: -76.6236 }, tipoAfectacion: 'vivienda', categoria: 'alimentos',
    descripcion: 'Vivienda con daño leve, familia sin acceso a alimentos por vías bloqueadas.', personasAfectadas: 5,
    perdidaTotalIngresos: false, interrupcionServicioEsencial: true, personasVulnerablesACargo: 2, nivelAfectacionInmueble: 'leve', aislamientoGeografico: true,
    ayudaNecesitada: ['alimentos'], estado: 'pendiente', diasAtras: 1,
  },
  {
    id: 'case-jorge-panaderia', nombreReportante: 'Jorge', telefono: '3009876543', municipio: 'Condoto', vereda: 'Barrio Centro',
    ubicacion: { lat: 5.0975, lng: -76.6494 }, tipoAfectacion: 'negocio', categoria: 'materiales_construccion',
    descripcion: 'Panadería con pared agrietada y horno fuera de servicio.', personasAfectadas: 4, actividadEconomica: 'Panadería', ingresosAprox: 600000,
    perdidaTotalIngresos: true, interrupcionServicioEsencial: true, personasVulnerablesACargo: 1, nivelAfectacionInmueble: 'total', aislamientoGeografico: true,
    ayudaNecesitada: ['materiales_construccion'], estado: 'verificado', diasAtras: 1,
  },
  {
    id: 'case-luzmarina-agua', nombreReportante: 'Luz Marina', telefono: '3012345678', municipio: 'Istmina', vereda: 'Barrio San Antonio',
    ubicacion: { lat: 5.1583, lng: -76.6825 }, tipoAfectacion: 'vivienda', categoria: 'agua',
    descripcion: 'Tanque de agua comunitario averiado, familia sin acceso a agua potable.', personasAfectadas: 6,
    perdidaTotalIngresos: false, interrupcionServicioEsencial: true, personasVulnerablesACargo: 3, nivelAfectacionInmueble: 'leve', aislamientoGeografico: false,
    ayudaNecesitada: ['agua'], estado: 'en_verificacion', diasAtras: 2,
  },
  {
    id: 'case-andres-escuela', nombreReportante: 'Andrés', telefono: '3023456789', municipio: 'Tadó', vereda: 'Vereda Guarato',
    ubicacion: { lat: 5.2631, lng: -76.5522 }, tipoAfectacion: 'infraestructura_comunitaria', categoria: 'otro',
    descripcion: 'Escuela veredal con techo colapsado, niños sin clases.', personasAfectadas: 40,
    perdidaTotalIngresos: false, interrupcionServicioEsencial: true, personasVulnerablesACargo: 40, nivelAfectacionInmueble: 'total', aislamientoGeografico: true,
    ayudaNecesitada: ['materiales_construccion', 'otro'], estado: 'pendiente', diasAtras: 3,
  },
  {
    id: 'case-rosa-peluqueria', nombreReportante: 'Rosa', telefono: '3034567890', municipio: 'San José del Palmar', vereda: 'Casco urbano',
    ubicacion: { lat: 4.9751, lng: -76.2601 }, tipoAfectacion: 'negocio', categoria: 'inventario_comercial',
    descripcion: 'Peluquería con equipos dañados por filtración de agua.', personasAfectadas: 2, actividadEconomica: 'Peluquería', ingresosAprox: 350000,
    perdidaTotalIngresos: true, interrupcionServicioEsencial: false, personasVulnerablesACargo: 0, nivelAfectacionInmueble: 'parcial', aislamientoGeografico: false,
    ayudaNecesitada: ['inventario_comercial'], estado: 'atendido', diasAtras: 3,
  },
  {
    id: 'case-wilson-vivienda', nombreReportante: 'Wilson', telefono: '3045678901', municipio: 'Nóvita', vereda: 'Vereda El Guineal',
    ubicacion: { lat: 4.9598, lng: -76.6301 }, tipoAfectacion: 'vivienda', categoria: 'alimentos',
    descripcion: 'Familia sin acceso a alimentos, vía principal bloqueada por derrumbe.', personasAfectadas: 8,
    perdidaTotalIngresos: false, interrupcionServicioEsencial: true, personasVulnerablesACargo: 3, nivelAfectacionInmueble: 'leve', aislamientoGeografico: true,
    ayudaNecesitada: ['alimentos'], estado: 'verificado', diasAtras: 4,
  },
  {
    id: 'case-yolanda-tienda', nombreReportante: 'Yolanda', telefono: '3056789012', municipio: 'Condoto', vereda: 'Barrio La Esperanza',
    ubicacion: { lat: 5.0951, lng: -76.6512 }, tipoAfectacion: 'negocio', categoria: 'materiales_construccion',
    descripcion: 'Tienda de barrio con muro colapsado, mercancía perdida.', personasAfectadas: 5, actividadEconomica: 'Tienda de barrio', ingresosAprox: 450000,
    perdidaTotalIngresos: true, interrupcionServicioEsencial: true, personasVulnerablesACargo: 2, nivelAfectacionInmueble: 'total', aislamientoGeografico: true,
    ayudaNecesitada: ['materiales_construccion', 'inventario_comercial'], estado: 'atendido', diasAtras: 5,
  },
  {
    id: 'case-camilo-salud', nombreReportante: 'Camilo', telefono: '3067890123', municipio: 'Istmina', vereda: 'Vereda Dos Bocas',
    ubicacion: { lat: 5.1602, lng: -76.6889 }, tipoAfectacion: 'vivienda', categoria: 'salud',
    descripcion: 'Puesto de salud veredal cerrado, comunidad sin atención médica cercana.', personasAfectadas: 30,
    perdidaTotalIngresos: false, interrupcionServicioEsencial: true, personasVulnerablesACargo: 10, nivelAfectacionInmueble: 'parcial', aislamientoGeografico: true,
    ayudaNecesitada: ['salud'], estado: 'pendiente', diasAtras: 6,
  },
  {
    id: 'case-diana-restaurante', nombreReportante: 'Diana', telefono: '3078901234', municipio: 'Tadó', vereda: 'Casco urbano',
    ubicacion: { lat: 5.2644, lng: -76.5539 }, tipoAfectacion: 'negocio', categoria: 'alimentos',
    descripcion: 'Restaurante familiar sin insumos, proveedores no llegan por vía bloqueada.', personasAfectadas: 3, actividadEconomica: 'Restaurante', ingresosAprox: 700000,
    perdidaTotalIngresos: true, interrupcionServicioEsencial: false, personasVulnerablesACargo: 0, nivelAfectacionInmueble: 'parcial', aislamientoGeografico: false,
    ayudaNecesitada: ['alimentos'], estado: 'verificado', diasAtras: 7,
  },
  {
    id: 'case-fabian-puente', nombreReportante: 'Fabián', telefono: '3089012345', municipio: 'San José del Palmar', vereda: 'Vereda El Cedro',
    ubicacion: { lat: 4.9718, lng: -76.2612 }, tipoAfectacion: 'infraestructura_comunitaria', categoria: 'transporte',
    descripcion: 'Puente veredal colapsado, comunidad incomunicada.', personasAfectadas: 60,
    perdidaTotalIngresos: false, interrupcionServicioEsencial: true, personasVulnerablesACargo: 15, nivelAfectacionInmueble: 'total', aislamientoGeografico: true,
    ayudaNecesitada: ['transporte', 'otro'], estado: 'en_verificacion', diasAtras: 9,
  },
  {
    id: 'case-mariela-ferreteria', nombreReportante: 'Mariela', telefono: '3090123456', municipio: 'Nóvita', vereda: 'Casco urbano',
    ubicacion: { lat: 4.9611, lng: -76.6248 }, tipoAfectacion: 'negocio', categoria: 'materiales_construccion',
    descripcion: 'Ferretería con estantería y parte del inventario destruidos.', personasAfectadas: 4, actividadEconomica: 'Ferretería', ingresosAprox: 900000,
    perdidaTotalIngresos: true, interrupcionServicioEsencial: false, personasVulnerablesACargo: 1, nivelAfectacionInmueble: 'parcial', aislamientoGeografico: true,
    ayudaNecesitada: ['materiales_construccion'], estado: 'atendido', diasAtras: 10,
  },
  {
    id: 'case-esteban-vivienda', nombreReportante: 'Esteban', telefono: '3001112233', municipio: 'Condoto', vereda: 'Vereda Los Ángeles',
    ubicacion: { lat: 5.1002, lng: -76.6455 }, tipoAfectacion: 'vivienda', categoria: 'agua',
    descripcion: 'Familia numerosa sin acceso a agua potable tras daño en el acueducto veredal.', personasAfectadas: 7,
    perdidaTotalIngresos: false, interrupcionServicioEsencial: true, personasVulnerablesACargo: 4, nivelAfectacionInmueble: 'leve', aislamientoGeografico: true,
    ayudaNecesitada: ['agua'], estado: 'verificado', diasAtras: 12,
  },
  {
    id: 'case-patricia-sastreria', nombreReportante: 'Patricia', telefono: '3002223344', municipio: 'Istmina', vereda: 'Barrio San Antonio',
    ubicacion: { lat: 5.1571, lng: -76.6811 }, tipoAfectacion: 'negocio', categoria: 'inventario_comercial',
    descripcion: 'Taller de costura con máquinas dañadas por el sismo.', personasAfectadas: 2, actividadEconomica: 'Sastrería', ingresosAprox: 300000,
    perdidaTotalIngresos: true, interrupcionServicioEsencial: false, personasVulnerablesACargo: 0, nivelAfectacionInmueble: 'parcial', aislamientoGeografico: false,
    ayudaNecesitada: ['inventario_comercial'], estado: 'pendiente', diasAtras: 13,
  },
];

interface OfferSpec {
  id: string;
  tipoRecurso: string;
  descripcion: string;
  cantidad: number;
  unidadMedida: string;
  cantidadAsignada: number;
  municipioCobertura: string[];
  veredaCobertura?: string[];
  entidadResponsable: string;
  contacto?: string;
  medioEntrega: 'recogida_en_punto' | 'entrega_a_domicilio' | 'transporte_comunitario';
  estado: 'disponible' | 'parcialmente_asignada' | 'agotada' | 'cerrada';
}

const OFFERS: OfferSpec[] = [
  { id: 'oferta-techos-demo', tipoRecurso: 'materiales_construccion', descripcion: '100 láminas para techos', cantidad: 100, unidadMedida: 'láminas', cantidadAsignada: 30, municipioCobertura: ['San José del Palmar', 'Nóvita'], veredaCobertura: ['Vereda El Cedro'], entidadResponsable: 'Fundación Reconstruir', contacto: 'contacto@reconstruir.org', medioEntrega: 'transporte_comunitario', estado: 'parcialmente_asignada' },
  { id: 'oferta-inventario-demo', tipoRecurso: 'inventario_comercial', descripcion: 'Reposición de inventario con pago flexible para tiendas de barrio', cantidad: 20, unidadMedida: 'kits', cantidadAsignada: 1, municipioCobertura: ['San José del Palmar'], entidadResponsable: 'Proveedor Regional S.A.S.', medioEntrega: 'entrega_a_domicilio', estado: 'parcialmente_asignada' },
  { id: 'oferta-salud-otro-municipio-demo', tipoRecurso: 'salud', descripcion: 'Brigada de atención psicosocial', cantidad: 5, unidadMedida: 'jornadas', cantidadAsignada: 0, municipioCobertura: ['Condoto', 'Istmina'], entidadResponsable: 'Cruz Roja Seccional', medioEntrega: 'recogida_en_punto', estado: 'disponible' },
  { id: 'oferta-alimentos-demo', tipoRecurso: 'alimentos', descripcion: '200 mercados de emergencia', cantidad: 200, unidadMedida: 'mercados', cantidadAsignada: 0, municipioCobertura: ['Nóvita', 'Tadó'], entidadResponsable: 'Banco de Alimentos Chocó', medioEntrega: 'transporte_comunitario', estado: 'disponible' },
  { id: 'oferta-agua-demo', tipoRecurso: 'agua', descripcion: '50 filtros de agua portátiles', cantidad: 50, unidadMedida: 'filtros', cantidadAsignada: 0, municipioCobertura: ['Istmina', 'Condoto'], entidadResponsable: 'Aguas del Chocó', medioEntrega: 'recogida_en_punto', estado: 'disponible' },
  { id: 'oferta-transporte-demo', tipoRecurso: 'transporte', descripcion: 'Cupos de transporte comunitario para materiales', cantidad: 10, unidadMedida: 'viajes', cantidadAsignada: 0, municipioCobertura: ['San José del Palmar', 'Tadó'], entidadResponsable: 'Cooperativa de Transportadores', medioEntrega: 'transporte_comunitario', estado: 'cerrada' },
  { id: 'oferta-materiales2-demo', tipoRecurso: 'materiales_construccion', descripcion: 'Materiales para reparación de muros y paredes', cantidad: 80, unidadMedida: 'bultos de cemento', cantidadAsignada: 20, municipioCobertura: ['Condoto', 'Istmina', 'Tadó'], entidadResponsable: 'Constructora Solidaria', medioEntrega: 'entrega_a_domicilio', estado: 'parcialmente_asignada' },
  { id: 'oferta-inventario2-demo', tipoRecurso: 'inventario_comercial', descripcion: 'Kits de herramientas para talleres y negocios', cantidad: 15, unidadMedida: 'kits', cantidadAsignada: 15, municipioCobertura: ['Condoto', 'Nóvita'], entidadResponsable: 'Cámara de Comercio del Chocó', medioEntrega: 'recogida_en_punto', estado: 'agotada' },
];

interface MatchSpec {
  id: string;
  caseId: string;
  offerId: string;
  estado: 'sugerida' | 'aceptada' | 'en_preparacion' | 'en_camino' | 'entregada' | 'verificada' | 'cerrada' | 'rechazada';
  cantidadAsignada: number;
  scoreCompatibilidad: number;
  conEvidencia?: boolean;
}

// One match per pipeline stage (plus one rejected) — the funnel and the
// "coincidencias por estado" views need every stage represented to be worth
// looking at, not just "sugerida".
const MATCHES: MatchSpec[] = [
  { id: 'match-diana-alimentos', caseId: 'case-diana-restaurante', offerId: 'oferta-alimentos-demo', estado: 'sugerida', cantidadAsignada: 5, scoreCompatibilidad: 90 },
  { id: 'match-diana-materiales-rechazada', caseId: 'case-diana-restaurante', offerId: 'oferta-materiales2-demo', estado: 'rechazada', cantidadAsignada: 1, scoreCompatibilidad: 40 },
  { id: 'match-wilson-alimentos', caseId: 'case-wilson-vivienda', offerId: 'oferta-alimentos-demo', estado: 'aceptada', cantidadAsignada: 8, scoreCompatibilidad: 95 },
  { id: 'match-esteban-agua', caseId: 'case-esteban-vivienda', offerId: 'oferta-agua-demo', estado: 'en_preparacion', cantidadAsignada: 1, scoreCompatibilidad: 92 },
  { id: 'match-jorge-materiales', caseId: 'case-jorge-panaderia', offerId: 'oferta-materiales2-demo', estado: 'en_camino', cantidadAsignada: 10, scoreCompatibilidad: 88 },
  { id: 'match-rosa-inventario', caseId: 'case-rosa-peluqueria', offerId: 'oferta-inventario-demo', estado: 'entregada', cantidadAsignada: 1, scoreCompatibilidad: 97, conEvidencia: true },
  { id: 'match-yolanda-materiales', caseId: 'case-yolanda-tienda', offerId: 'oferta-materiales2-demo', estado: 'verificada', cantidadAsignada: 20, scoreCompatibilidad: 91, conEvidencia: true },
  { id: 'match-mariela-techos', caseId: 'case-mariela-ferreteria', offerId: 'oferta-techos-demo', estado: 'cerrada', cantidadAsignada: 30, scoreCompatibilidad: 85, conEvidencia: true },
];

async function seed() {
  for (const account of DEMO_ACCOUNTS) {
    await ensureAuthUser(account);
  }

  await db.doc('users/demo-lider').set({ uid: 'demo-lider', displayName: 'Carlos (líder comunitario)', role: 'lider_comunitario', municipio: 'San José del Palmar', createdAt: Timestamp.now() });
  await db.doc('users/demo-org').set({ uid: 'demo-org', displayName: 'Fundación Reconstruir', role: 'organizacion', createdAt: Timestamp.now() });
  await db.doc('users/demo-admin').set({ uid: 'demo-admin', displayName: 'Equipo ReActiva', role: 'admin', createdAt: Timestamp.now() });

  for (const c of CASES) {
    const createdAt = hace(c.diasAtras);
    const prioridad =
      c.estado === 'verificado' || c.estado === 'atendido'
        ? calcularPrioridad({
            perdidaTotalIngresos: c.perdidaTotalIngresos,
            interrupcionServicioEsencial: c.interrupcionServicioEsencial,
            personasVulnerablesACargo: c.personasVulnerablesACargo,
            nivelAfectacionInmueble: c.nivelAfectacionInmueble,
            aislamientoGeografico: c.aislamientoGeografico,
            createdAt: createdAt.toDate(),
            now: NOW,
          })
        : null;

    await db.doc(`cases/${c.id}`).set({
      id: c.id,
      clientId: c.id,
      nombreReportante: c.nombreReportante,
      telefono: c.telefono,
      municipio: c.municipio,
      vereda: c.vereda,
      ubicacion: c.ubicacion,
      tipoAfectacion: c.tipoAfectacion,
      categoria: c.categoria,
      descripcion: c.descripcion,
      fotos: [],
      personasAfectadas: c.personasAfectadas,
      actividadEconomica: c.actividadEconomica ?? null,
      ingresosAprox: c.ingresosAprox ?? null,
      perdidaTotalIngresos: c.perdidaTotalIngresos,
      interrupcionServicioEsencial: c.interrupcionServicioEsencial,
      personasVulnerablesACargo: c.personasVulnerablesACargo,
      nivelAfectacionInmueble: c.nivelAfectacionInmueble,
      aislamientoGeografico: c.aislamientoGeografico,
      ayudaNecesitada: c.ayudaNecesitada,
      ayudasRecibidas: [],
      estado: c.estado,
      prioridad,
      registradoPor: 'demo-lider',
      createdAt,
      updatedAt: createdAt,
      verificadoPor: c.estado === 'verificado' || c.estado === 'atendido' ? 'demo-lider' : null,
      verificadoAt: c.estado === 'verificado' || c.estado === 'atendido' ? createdAt : null,
    });
  }

  for (const o of OFFERS) {
    await db.doc(`offers/${o.id}`).set({
      id: o.id,
      tipoRecurso: o.tipoRecurso,
      descripcion: o.descripcion,
      cantidad: o.cantidad,
      unidadMedida: o.unidadMedida,
      cantidadAsignada: o.cantidadAsignada,
      municipioCobertura: o.municipioCobertura,
      veredaCobertura: o.veredaCobertura ?? [],
      fechaDisponibilidad: Timestamp.now(),
      entidadResponsable: o.entidadResponsable,
      contacto: o.contacto ?? null,
      medioEntrega: o.medioEntrega,
      estado: o.estado,
      registradoPor: 'demo-org',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
  }

  for (const m of MATCHES) {
    await db.doc(`matches/${m.id}`).set({
      id: m.id,
      caseId: m.caseId,
      offerId: m.offerId,
      scoreCompatibilidad: m.scoreCompatibilidad,
      estado: m.estado,
      cantidadAsignada: m.cantidadAsignada,
      historialEstados: [{ estado: m.estado, fecha: Timestamp.now(), por: 'demo-org' }],
      evidenciaEntrega: m.conEvidencia
        ? {
            fotos: [],
            ubicacion: null,
            responsable: 'Fundación Reconstruir',
            fecha: Timestamp.now(),
            comentario: 'Entrega confirmada con la comunidad.',
          }
        : null,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
  }

  console.log(`Datos de demostración cargados: 3 usuarios, ${CASES.length} casos, ${OFFERS.length} ofertas, ${MATCHES.length} coincidencias.`);
  console.log('Cuentas de prueba (contraseña: demo1234):');
  for (const account of DEMO_ACCOUNTS) {
    console.log(`  - ${account.email}  (${account.displayName})`);
  }
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
