import type { Timestamp } from 'firebase/firestore';
import type { CategoriaAyuda } from './case';

export type EstadoOferta = 'disponible' | 'parcialmente_asignada' | 'agotada' | 'cerrada';
export type MedioEntrega = 'recogida_en_punto' | 'entrega_a_domicilio' | 'transporte_comunitario';

export const MEDIO_ENTREGA_LABELS: Record<MedioEntrega, string> = {
  recogida_en_punto: 'Recogida en punto de entrega',
  entrega_a_domicilio: 'Entrega a domicilio',
  transporte_comunitario: 'Transporte comunitario',
};

export interface OfertaRecurso {
  id: string;
  tipoRecurso: CategoriaAyuda;
  descripcion: string;
  cantidad: number;
  unidadMedida: string;
  cantidadAsignada: number;
  municipioCobertura: string[];
  veredaCobertura?: string[];
  requisitos?: string;
  fechaDisponibilidad: Timestamp;
  entidadResponsable: string;
  contacto?: string;
  medioEntrega: MedioEntrega;
  estado: EstadoOferta;
  registradoPor: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
