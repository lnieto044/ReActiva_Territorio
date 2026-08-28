import { Timestamp } from 'firebase/firestore';
import { describe, expect, it } from 'vitest';
import { generarAlertas } from './alerts';
import type { CasoAfectado } from '../types/case';
import type { OfertaRecurso } from '../types/offer';
import type { Coincidencia } from '../types/match';

const NOW = new Date('2026-08-27T12:00:00Z');
const hace = (dias: number) => Timestamp.fromDate(new Date(NOW.getTime() - dias * 86_400_000));

function makeCaso(overrides: Partial<CasoAfectado> = {}): CasoAfectado {
  return {
    id: 'c1', clientId: 'c1', nombreReportante: 'María', telefono: '300', municipio: 'San José del Palmar',
    vereda: 'El Cedro', ubicacion: null, tipoAfectacion: 'negocio', categoria: 'materiales_construccion',
    descripcion: '', fotos: [], personasAfectadas: 1, perdidaTotalIngresos: true, interrupcionServicioEsencial: false,
    personasVulnerablesACargo: 0, nivelAfectacionInmueble: 'parcial', aislamientoGeografico: false,
    ayudaNecesitada: [], ayudasRecibidas: [], estado: 'pendiente', prioridad: null, registradoPor: 'u1',
    createdAt: hace(0), updatedAt: hace(0),
    ...overrides,
  };
}

function makeOferta(overrides: Partial<OfertaRecurso> = {}): OfertaRecurso {
  return {
    id: 'o1', tipoRecurso: 'materiales_construccion', descripcion: 'Láminas', cantidad: 100, unidadMedida: 'láminas',
    cantidadAsignada: 0, municipioCobertura: [], fechaDisponibilidad: hace(0), entidadResponsable: 'Org',
    medioEntrega: 'entrega_a_domicilio', estado: 'disponible', registradoPor: 'u2', createdAt: hace(0), updatedAt: hace(0),
    ...overrides,
  };
}

function makeMatch(overrides: Partial<Coincidencia> = {}): Coincidencia {
  return {
    id: 'm1', caseId: 'c1', offerId: 'o1', scoreCompatibilidad: 90, estado: 'sugerida', cantidadAsignada: 1,
    historialEstados: [{ estado: 'sugerida', fecha: hace(0) }], evidenciaEntrega: null, createdAt: hace(0), updatedAt: hace(0),
    ...overrides,
  };
}

describe('generarAlertas', () => {
  it('marca como crítico un caso de prioridad alta no atendido', () => {
    const caso = makeCaso({ estado: 'verificado', prioridad: { score: 90, nivel: 'alta', desglose: {} } });
    const alertas = generarAlertas([caso], [], [], NOW);
    expect(alertas.some((a) => a.id === `alta-${caso.id}` && a.severidad === 'critica')).toBe(true);
  });

  it('no alerta un caso de prioridad alta que ya fue atendido', () => {
    const caso = makeCaso({ estado: 'atendido', prioridad: { score: 90, nivel: 'alta', desglose: {} } });
    const alertas = generarAlertas([caso], [], [], NOW);
    expect(alertas.some((a) => a.id === `alta-${caso.id}`)).toBe(false);
  });

  it('alerta casos pendientes con 3+ días sin iniciar verificación', () => {
    const caso = makeCaso({ estado: 'pendiente', createdAt: hace(4) });
    const alertas = generarAlertas([caso], [], [], NOW);
    expect(alertas.some((a) => a.id === `pendiente-${caso.id}`)).toBe(true);
  });

  it('no alerta casos pendientes recientes', () => {
    const caso = makeCaso({ estado: 'pendiente', createdAt: hace(1) });
    const alertas = generarAlertas([caso], [], [], NOW);
    expect(alertas.some((a) => a.id === `pendiente-${caso.id}`)).toBe(false);
  });

  it('alerta ofertas por agotarse (80%+ asignada)', () => {
    const oferta = makeOferta({ cantidad: 10, cantidadAsignada: 9, estado: 'parcialmente_asignada' });
    const alertas = generarAlertas([], [oferta], [], NOW);
    expect(alertas.some((a) => a.id === `oferta-${oferta.id}`)).toBe(true);
  });

  it('no alerta ofertas ya agotadas o cerradas (ya no aplica)', () => {
    const oferta = makeOferta({ cantidad: 10, cantidadAsignada: 10, estado: 'agotada' });
    const alertas = generarAlertas([], [oferta], [], NOW);
    expect(alertas.some((a) => a.id === `oferta-${oferta.id}`)).toBe(false);
  });

  it('alerta coincidencias estancadas 4+ días en un estado "en vuelo"', () => {
    const match = makeMatch({ estado: 'en_camino', historialEstados: [{ estado: 'en_camino', fecha: hace(5) }] });
    const alertas = generarAlertas([], [], [match], NOW);
    expect(alertas.some((a) => a.id === `estancada-${match.id}`)).toBe(true);
  });

  it('no alerta coincidencias ya entregadas', () => {
    const match = makeMatch({ estado: 'entregada', historialEstados: [{ estado: 'entregada', fecha: hace(10) }] });
    const alertas = generarAlertas([], [], [match], NOW);
    expect(alertas.some((a) => a.id === `estancada-${match.id}`)).toBe(false);
  });

  it('ordena las alertas críticas antes que las de atención', () => {
    const casoAlta = makeCaso({ id: 'c-alta', estado: 'verificado', prioridad: { score: 90, nivel: 'alta', desglose: {} } });
    const casoPendiente = makeCaso({ id: 'c-pend', estado: 'pendiente', createdAt: hace(5) });
    const alertas = generarAlertas([casoAlta, casoPendiente], [], [], NOW);
    expect(alertas[0].severidad).toBe('critica');
  });
});
