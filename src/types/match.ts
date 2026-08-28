import type { Timestamp } from 'firebase/firestore';
import type { GeoPoint } from './case';

export type EstadoMatch =
  | 'sugerida'
  | 'aceptada'
  | 'en_preparacion'
  | 'en_camino'
  | 'entregada'
  | 'verificada'
  | 'cerrada'
  | 'rechazada';

export const ESTADO_MATCH_LABELS: Record<EstadoMatch, string> = {
  sugerida: 'Oferta sugerida',
  aceptada: 'Oferta aceptada',
  en_preparacion: 'En preparación',
  en_camino: 'En camino',
  entregada: 'Entregada',
  verificada: 'Verificada',
  cerrada: 'Caso cerrado',
  rechazada: 'Rechazada',
};

// Order in which a match normally advances through the delivery pipeline.
export const ESTADO_MATCH_PIPELINE: EstadoMatch[] = [
  'sugerida',
  'aceptada',
  'en_preparacion',
  'en_camino',
  'entregada',
  'verificada',
  'cerrada',
];

export interface Evidencia {
  fotos: string[];
  ubicacion: GeoPoint | null;
  responsable: string;
  fecha: Timestamp;
  comentario?: string;
}

export interface HistorialEntry {
  estado: EstadoMatch;
  fecha: Timestamp;
  por?: string;
}

export interface Coincidencia {
  id: string;
  caseId: string;
  offerId: string;
  scoreCompatibilidad: number;
  estado: EstadoMatch;
  cantidadAsignada: number;
  historialEstados: HistorialEntry[];
  evidenciaEntrega: Evidencia | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
