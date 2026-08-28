import type { NivelAfectacionInmueble, NivelPrioridad } from '../types/case';

export interface PriorityInput {
  perdidaTotalIngresos: boolean;
  interrupcionServicioEsencial: boolean;
  personasVulnerablesACargo: number;
  nivelAfectacionInmueble: NivelAfectacionInmueble;
  aislamientoGeografico: boolean;
  createdAt: Date;
  now?: Date;
}

export interface PriorityResult {
  score: number;
  nivel: NivelPrioridad;
  desglose: Record<string, number>;
}

const NIVEL_AFECTACION_PUNTOS: Record<NivelAfectacionInmueble, number> = {
  total: 15,
  parcial: 8,
  leve: 3,
};

const MS_POR_DIA = 86_400_000;

function diasSinAtencion(createdAt: Date, now: Date): number {
  return Math.floor((now.getTime() - createdAt.getTime()) / MS_POR_DIA);
}

function puntosTiempoSinAtencion(dias: number): number {
  if (dias >= 7) return 10;
  if (dias >= 3) return 6;
  if (dias >= 1) return 3;
  return 0;
}

export function calcularPrioridad(input: PriorityInput): PriorityResult {
  const now = input.now ?? new Date();
  const dias = diasSinAtencion(input.createdAt, now);

  const desglose: Record<string, number> = {
    perdidaTotalIngresos: input.perdidaTotalIngresos ? 25 : 0,
    interrupcionServicioEsencial: input.interrupcionServicioEsencial ? 25 : 0,
    personasVulnerablesACargo: input.personasVulnerablesACargo > 0 ? 20 : 0,
    nivelAfectacionInmueble: NIVEL_AFECTACION_PUNTOS[input.nivelAfectacionInmueble],
    tiempoSinAtencion: puntosTiempoSinAtencion(dias),
    aislamientoGeografico: input.aislamientoGeografico ? 5 : 0,
  };

  const score = Object.values(desglose).reduce((total, puntos) => total + puntos, 0);
  const nivel: NivelPrioridad = score >= 75 ? 'alta' : score >= 50 ? 'media' : 'regular';

  return { score, nivel, desglose };
}
