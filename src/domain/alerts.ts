import type { CasoAfectado } from '../types/case';
import type { OfertaRecurso } from '../types/offer';
import type { Coincidencia, EstadoMatch } from '../types/match';

export type SeveridadAlerta = 'critica' | 'atencion';

export interface Alerta {
  id: string;
  severidad: SeveridadAlerta;
  titulo: string;
  detalle: string;
  link: string;
}

const DIAS_LIMITE_PENDIENTE = 3;
const DIAS_LIMITE_ESTANCADO = 4;
const UMBRAL_OFERTA_AGOTANDOSE = 0.8;
const ESTADOS_EN_VUELO: EstadoMatch[] = ['sugerida', 'aceptada', 'en_preparacion', 'en_camino'];

function diasDesde(fecha: Date, now: Date): number {
  return Math.floor((now.getTime() - fecha.getTime()) / 86_400_000);
}

/**
 * Operational alerts, not disaster prediction: flags cases/offers/matches
 * that need a human to act, based on rules over data already in the app —
 * no external signal, no forecasting of the earthquake itself.
 */
export function generarAlertas(
  cases: CasoAfectado[],
  offers: OfertaRecurso[],
  matches: Coincidencia[],
  now: Date = new Date(),
): Alerta[] {
  const alertas: Alerta[] = [];

  for (const c of cases) {
    if (c.prioridad?.nivel === 'alta' && c.estado !== 'atendido') {
      alertas.push({
        id: `alta-${c.id}`,
        severidad: 'critica',
        titulo: `${c.nombreReportante}: caso de prioridad alta sin atender`,
        detalle: `${c.municipio}, ${c.vereda} — prioridad ${c.prioridad.score}/100.`,
        link: `/casos/${c.id}`,
      });
    }
    if (c.estado === 'pendiente') {
      const dias = diasDesde(c.createdAt.toDate(), now);
      if (dias >= DIAS_LIMITE_PENDIENTE) {
        alertas.push({
          id: `pendiente-${c.id}`,
          severidad: 'atencion',
          titulo: `${c.nombreReportante}: ${dias} días sin iniciar verificación`,
          detalle: `${c.municipio}, ${c.vereda}.`,
          link: `/casos/${c.id}`,
        });
      }
    }
  }

  for (const o of offers) {
    if (o.estado === 'agotada' || o.estado === 'cerrada') continue;
    const proporcion = o.cantidad > 0 ? o.cantidadAsignada / o.cantidad : 0;
    if (proporcion >= UMBRAL_OFERTA_AGOTANDOSE) {
      alertas.push({
        id: `oferta-${o.id}`,
        severidad: 'atencion',
        titulo: `${o.descripcion}: por agotarse`,
        detalle: `${o.cantidadAsignada} de ${o.cantidad} ${o.unidadMedida} ya asignadas.`,
        link: '/ofertas',
      });
    }
  }

  for (const m of matches) {
    if (!ESTADOS_EN_VUELO.includes(m.estado)) continue;
    const ultima = m.historialEstados[m.historialEstados.length - 1];
    if (!ultima) continue;
    const dias = diasDesde(ultima.fecha.toDate(), now);
    if (dias >= DIAS_LIMITE_ESTANCADO) {
      alertas.push({
        id: `estancada-${m.id}`,
        severidad: 'atencion',
        titulo: `Coincidencia estancada hace ${dias} días`,
        detalle: `En estado "${m.estado}" sin avanzar.`,
        link: `/seguimiento/${m.id}`,
      });
    }
  }

  return alertas.sort((a, b) => (a.severidad === b.severidad ? 0 : a.severidad === 'critica' ? -1 : 1));
}
