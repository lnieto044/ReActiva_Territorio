import { Timestamp } from 'firebase/firestore';
import { describe, expect, it } from 'vitest';
import { proyectarVerificacion } from './projections';
import type { CasoAfectado } from '../types/case';

const NOW = new Date('2026-08-27T12:00:00Z');
const hace = (dias: number) => Timestamp.fromDate(new Date(NOW.getTime() - dias * 86_400_000));

function makeCaso(overrides: Partial<CasoAfectado> = {}): CasoAfectado {
  return {
    id: 'c1', clientId: 'c1', nombreReportante: 'X', telefono: '300', municipio: 'M', vereda: 'V',
    ubicacion: null, tipoAfectacion: 'negocio', categoria: 'materiales_construccion', descripcion: '', fotos: [],
    personasAfectadas: 1, perdidaTotalIngresos: false, interrupcionServicioEsencial: false, personasVulnerablesACargo: 0,
    nivelAfectacionInmueble: 'leve', aislamientoGeografico: false, ayudaNecesitada: [], ayudasRecibidas: [],
    estado: 'pendiente', prioridad: null, registradoPor: 'u1', createdAt: hace(0), updatedAt: hace(0),
    ...overrides,
  };
}

describe('proyectarVerificacion', () => {
  it('calcula días estimados a partir de la tasa de verificación reciente', () => {
    const casos = [
      makeCaso({ id: 'a', estado: 'verificado', verificadoAt: hace(1) }),
      makeCaso({ id: 'b', estado: 'verificado', verificadoAt: hace(3) }),
      makeCaso({ id: 'c', estado: 'pendiente' }),
      makeCaso({ id: 'd', estado: 'pendiente' }),
    ];
    const resultado = proyectarVerificacion(casos, 14, NOW);
    expect(resultado.casosPendientes).toBe(2);
    expect(resultado.tasaDiaria).toBeCloseTo(2 / 14);
    expect(resultado.diasEstimados).toBe(Math.ceil(2 / (2 / 14)));
  });

  it('devuelve diasEstimados nulo cuando no hay verificaciones recientes', () => {
    const casos = [makeCaso({ estado: 'pendiente' })];
    const resultado = proyectarVerificacion(casos, 14, NOW);
    expect(resultado.tasaDiaria).toBe(0);
    expect(resultado.diasEstimados).toBeNull();
  });

  it('ignora verificaciones fuera de la ventana de tiempo', () => {
    const casos = [makeCaso({ estado: 'verificado', verificadoAt: hace(20) }), makeCaso({ estado: 'pendiente' })];
    const resultado = proyectarVerificacion(casos, 14, NOW);
    expect(resultado.tasaDiaria).toBe(0);
  });
});
