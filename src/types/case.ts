import type { Timestamp } from 'firebase/firestore';

export type EstadoCaso = 'pendiente' | 'en_verificacion' | 'verificado' | 'atendido';
export type NivelPrioridad = 'alta' | 'media' | 'regular';
export type TipoAfectacion = 'vivienda' | 'negocio' | 'infraestructura_comunitaria' | 'otro';
export type NivelAfectacionInmueble = 'total' | 'parcial' | 'leve';

export type CategoriaAyuda =
  | 'alimentos'
  | 'materiales_construccion'
  | 'inventario_comercial'
  | 'salud'
  | 'agua'
  | 'transporte'
  | 'otro';

export const CATEGORIA_LABELS: Record<CategoriaAyuda, string> = {
  alimentos: 'Alimentación',
  materiales_construccion: 'Materiales de construcción',
  inventario_comercial: 'Inventario / herramientas de trabajo',
  salud: 'Salud',
  agua: 'Agua',
  transporte: 'Transporte',
  otro: 'Otro',
};

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface Prioridad {
  score: number;
  nivel: NivelPrioridad;
  desglose: Record<string, number>;
}

export interface CasoAfectado {
  id: string;
  clientId: string;
  nombreReportante: string;
  telefono: string;
  municipio: string;
  vereda: string;
  ubicacion: GeoPoint | null;
  tipoAfectacion: TipoAfectacion;
  categoria: CategoriaAyuda;
  descripcion: string;
  fotos: string[];
  personasAfectadas: number;
  actividadEconomica?: string;
  ingresosAprox?: number;
  perdidaTotalIngresos: boolean;
  interrupcionServicioEsencial: boolean;
  personasVulnerablesACargo: number;
  nivelAfectacionInmueble: NivelAfectacionInmueble;
  aislamientoGeografico: boolean;
  ayudaNecesitada: CategoriaAyuda[];
  ayudasRecibidas: string[];
  estado: EstadoCaso;
  prioridad: Prioridad | null;
  registradoPor: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  verificadoAt?: Timestamp | null;
  verificadoPor?: string | null;
}

export const ESTADO_CASO_LABELS: Record<EstadoCaso, string> = {
  pendiente: 'Pendiente',
  en_verificacion: 'En verificación',
  verificado: 'Verificado',
  atendido: 'Atendido',
};
