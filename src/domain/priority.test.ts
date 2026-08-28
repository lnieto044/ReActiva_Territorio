import { describe, expect, it } from 'vitest';
import { calcularPrioridad } from './priority';

const baseInput = {
  perdidaTotalIngresos: false,
  interrupcionServicioEsencial: false,
  personasVulnerablesACargo: 0,
  nivelAfectacionInmueble: 'leve' as const,
  aislamientoGeografico: false,
  createdAt: new Date('2026-08-20T00:00:00Z'),
  now: new Date('2026-08-20T00:00:00Z'),
};

describe('calcularPrioridad', () => {
  it('clasifica como alta cuando el puntaje es 75 o más', () => {
    const resultado = calcularPrioridad({
      ...baseInput,
      perdidaTotalIngresos: true,
      interrupcionServicioEsencial: true,
      personasVulnerablesACargo: 2,
      nivelAfectacionInmueble: 'total',
    });
    expect(resultado.score).toBeGreaterThanOrEqual(75);
    expect(resultado.nivel).toBe('alta');
  });

  it('clasifica como media entre 50 y 74', () => {
    const resultado = calcularPrioridad({
      ...baseInput,
      perdidaTotalIngresos: true,
      interrupcionServicioEsencial: true,
      nivelAfectacionInmueble: 'leve',
    });
    expect(resultado.score).toBeGreaterThanOrEqual(50);
    expect(resultado.score).toBeLessThan(75);
    expect(resultado.nivel).toBe('media');
  });

  it('clasifica como regular por debajo de 50', () => {
    const resultado = calcularPrioridad(baseInput);
    expect(resultado.score).toBeLessThan(50);
    expect(resultado.nivel).toBe('regular');
  });

  it('otorga 0 puntos de tiempo sin atención el mismo día', () => {
    const resultado = calcularPrioridad(baseInput);
    expect(resultado.desglose.tiempoSinAtencion).toBe(0);
  });

  it('otorga 3 puntos a partir de 1 día sin atención', () => {
    const resultado = calcularPrioridad({
      ...baseInput,
      now: new Date('2026-08-21T01:00:00Z'),
    });
    expect(resultado.desglose.tiempoSinAtencion).toBe(3);
  });

  it('otorga 6 puntos a partir de 3 días sin atención', () => {
    const resultado = calcularPrioridad({
      ...baseInput,
      now: new Date('2026-08-23T00:00:00Z'),
    });
    expect(resultado.desglose.tiempoSinAtencion).toBe(6);
  });

  it('otorga 10 puntos a partir de 7 días sin atención', () => {
    const resultado = calcularPrioridad({
      ...baseInput,
      now: new Date('2026-08-27T00:00:00Z'),
    });
    expect(resultado.desglose.tiempoSinAtencion).toBe(10);
  });
});
