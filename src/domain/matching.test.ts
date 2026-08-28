import { Timestamp } from 'firebase/firestore';
import { describe, expect, it } from 'vitest';
import { encontrarCoincidencias } from './matching';
import type { CasoAfectado } from '../types/case';
import type { OfertaRecurso } from '../types/offer';

const now = Timestamp.now();

function makeCaso(overrides: Partial<CasoAfectado> = {}): CasoAfectado {
  return {
    id: 'caso-1',
    clientId: 'caso-1',
    nombreReportante: 'María',
    telefono: '3000000000',
    municipio: 'San José del Palmar',
    vereda: 'Vereda El Cedro',
    ubicacion: { lat: 4.97, lng: -76.25 },
    tipoAfectacion: 'negocio',
    categoria: 'materiales_construccion',
    descripcion: 'Techo dañado',
    fotos: [],
    personasAfectadas: 3,
    perdidaTotalIngresos: true,
    interrupcionServicioEsencial: false,
    personasVulnerablesACargo: 1,
    nivelAfectacionInmueble: 'parcial',
    aislamientoGeografico: true,
    ayudaNecesitada: ['materiales_construccion'],
    ayudasRecibidas: [],
    estado: 'verificado',
    prioridad: null,
    registradoPor: 'demo-lider',
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

function makeOferta(overrides: Partial<OfertaRecurso> = {}): OfertaRecurso {
  return {
    id: 'oferta-1',
    tipoRecurso: 'materiales_construccion',
    descripcion: 'Láminas para techo',
    cantidad: 100,
    unidadMedida: 'láminas',
    cantidadAsignada: 0,
    municipioCobertura: ['San José del Palmar'],
    veredaCobertura: ['Vereda El Cedro'],
    fechaDisponibilidad: now,
    entidadResponsable: 'Fundación Reconstruir',
    medioEntrega: 'transporte_comunitario',
    estado: 'disponible',
    registradoPor: 'demo-org',
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

describe('encontrarCoincidencias', () => {
  it('encuentra una oferta compatible y explica los motivos', () => {
    const resultado = encontrarCoincidencias(makeCaso(), [makeOferta()]);
    expect(resultado).toHaveLength(1);
    expect(resultado[0].offer.id).toBe('oferta-1');
    expect(resultado[0].motivos.length).toBeGreaterThan(0);
  });

  it('descarta ofertas de otra categoría', () => {
    const resultado = encontrarCoincidencias(makeCaso(), [makeOferta({ tipoRecurso: 'salud' })]);
    expect(resultado).toHaveLength(0);
  });

  it('descarta ofertas sin cobertura en el municipio del caso', () => {
    const resultado = encontrarCoincidencias(
      makeCaso(),
      [makeOferta({ municipioCobertura: ['Otro Municipio'] })],
    );
    expect(resultado).toHaveLength(0);
  });

  it('descarta ofertas agotadas o cerradas', () => {
    const resultado = encontrarCoincidencias(makeCaso(), [
      makeOferta({ estado: 'agotada' }),
      makeOferta({ id: 'oferta-2', estado: 'cerrada' }),
    ]);
    expect(resultado).toHaveLength(0);
  });

  it('descarta ofertas sin cantidad disponible', () => {
    const resultado = encontrarCoincidencias(
      makeCaso(),
      [makeOferta({ cantidad: 10, cantidadAsignada: 10 })],
    );
    expect(resultado).toHaveLength(0);
  });

  it('ordena por score descendente y premia cobertura de vereda y ausencia de requisitos', () => {
    const ofertaGenerica = makeOferta({
      id: 'oferta-generica',
      veredaCobertura: undefined,
      requisitos: 'Presentar cédula',
    });
    const ofertaEspecifica = makeOferta({ id: 'oferta-especifica' });
    const resultado = encontrarCoincidencias(makeCaso(), [ofertaGenerica, ofertaEspecifica]);
    expect(resultado[0].offer.id).toBe('oferta-especifica');
    expect(resultado[0].score).toBeGreaterThan(resultado[1].score);
  });
});
