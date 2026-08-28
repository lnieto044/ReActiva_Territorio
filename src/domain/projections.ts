import type { CasoAfectado } from '../types/case';

export interface Proyeccion {
  tasaDiaria: number;
  casosPendientes: number;
  diasEstimados: number | null;
}

/**
 * A trend extrapolation of the RECOVERY-COORDINATION rate this platform
 * actually measures (how fast cases get verified) — not an earthquake
 * forecast. Simple linear projection: verifications/day over the trailing
 * window, applied to the current backlog.
 */
export function proyectarVerificacion(cases: CasoAfectado[], diasVentana = 14, now: Date = new Date()): Proyeccion {
  const desde = new Date(now);
  desde.setDate(desde.getDate() - diasVentana);

  const verificadosEnVentana = cases.filter((c) => {
    if (!c.verificadoAt) return false;
    const fecha = c.verificadoAt.toDate();
    return fecha >= desde && fecha <= now;
  }).length;

  const tasaDiaria = verificadosEnVentana / diasVentana;
  const casosPendientes = cases.filter((c) => c.estado === 'pendiente' || c.estado === 'en_verificacion').length;
  const diasEstimados = tasaDiaria > 0 ? Math.ceil(casosPendientes / tasaDiaria) : null;

  return { tasaDiaria, casosPendientes, diasEstimados };
}
