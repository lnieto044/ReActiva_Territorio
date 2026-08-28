import { useMemo } from 'react';
import { StatCard } from '../components/StatCard';
import { Card } from '../components/ui';
import { BarRow, type BarDatum } from '../components/charts/BarRow';
import { TrendLine, type TrendPoint } from '../components/charts/TrendLine';
import { useCases } from '../features/cases/api';
import { useOffers } from '../features/offers/api';
import { useMatches } from '../features/matches/api';
import { CATEGORIA_LABELS, ESTADO_CASO_LABELS, type CategoriaAyuda, type EstadoCaso } from '../types/case';
import { ESTADO_MATCH_LABELS, type EstadoMatch } from '../types/match';

const PRIORIDAD_COLOR = { alta: '#DC2626', media: '#D97706', regular: '#78716C' } as const;
const PRIORIDAD_LABEL = { alta: 'Alta', media: 'Media', regular: 'Regular' } as const;

const DIAS_TENDENCIA = 14;

export function TableroPage() {
  const { cases } = useCases();
  const { offers } = useOffers();
  const { matches } = useMatches();

  const stats = useMemo(() => {
    const porEstadoCaso = cases.reduce(
      (acc, c) => ({ ...acc, [c.estado]: (acc[c.estado] ?? 0) + 1 }),
      {} as Record<EstadoCaso, number>,
    );
    const porEstadoMatch = matches.reduce(
      (acc, m) => ({ ...acc, [m.estado]: (acc[m.estado] ?? 0) + 1 }),
      {} as Record<EstadoMatch, number>,
    );
    const porCategoria = cases.reduce(
      (acc, c) => ({ ...acc, [c.categoria]: (acc[c.categoria] ?? 0) + 1 }),
      {} as Record<CategoriaAyuda, number>,
    );
    const porPrioridad = cases.reduce(
      (acc, c) => {
        if (c.prioridad) acc[c.prioridad.nivel] += 1;
        return acc;
      },
      { alta: 0, media: 0, regular: 0 },
    );
    const negociosReactivados = cases.filter((c) => c.tipoAfectacion === 'negocio' && c.estado === 'atendido');
    const recursosMovilizados = offers.reduce((total, o) => total + o.cantidadAsignada, 0);

    return {
      totalCasos: cases.length,
      casosVerificados: (porEstadoCaso.verificado ?? 0) + (porEstadoCaso.atendido ?? 0),
      casosPendientes: (porEstadoCaso.pendiente ?? 0) + (porEstadoCaso.en_verificacion ?? 0),
      negociosReactivados,
      ofertasActivas: offers.filter((o) => o.estado === 'disponible' || o.estado === 'parcialmente_asignada').length,
      recursosMovilizados,
      porEstadoCaso,
      porEstadoMatch,
      porCategoria,
      porPrioridad,
    };
  }, [cases, offers, matches]);

  const casosPorCategoriaData: BarDatum[] = useMemo(
    () =>
      (Object.keys(CATEGORIA_LABELS) as CategoriaAyuda[])
        .map((cat) => ({ label: CATEGORIA_LABELS[cat], value: stats.porCategoria[cat] ?? 0 }))
        .filter((d) => d.value > 0)
        .sort((a, b) => b.value - a.value),
    [stats.porCategoria],
  );

  const casosPorPrioridadData: BarDatum[] = useMemo(
    () =>
      (['alta', 'media', 'regular'] as const).map((nivel) => ({
        label: PRIORIDAD_LABEL[nivel],
        value: stats.porPrioridad[nivel],
        color: PRIORIDAD_COLOR[nivel],
      })),
    [stats.porPrioridad],
  );

  const tendenciaData: TrendPoint[] = useMemo(() => {
    const days: TrendPoint[] = [];
    const now = new Date();
    for (let i = DIAS_TENDENCIA - 1; i >= 0; i--) {
      const day = new Date(now);
      day.setDate(now.getDate() - i);
      const dayKey = day.toDateString();
      const count = cases.filter((c) => c.createdAt?.toDate?.().toDateString() === dayKey).length;
      days.push({ label: day.toLocaleDateString('es-CO', { day: '2-digit', month: 'short' }), value: count });
    }
    return days;
  }, [cases]);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-stone-900">Tablero de resultados</h1>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Casos registrados" value={stats.totalCasos} />
        <StatCard label="Casos verificados" value={stats.casosVerificados} />
        <StatCard label="Casos pendientes" value={stats.casosPendientes} />
        <StatCard label="Negocios reactivados" value={stats.negociosReactivados.length} />
        <StatCard label="Ofertas activas" value={stats.ofertasActivas} />
        <StatCard label="Coincidencias en curso" value={matches.length} />
        <StatCard label="Recursos movilizados" value={stats.recursosMovilizados} hint="unidades asignadas" />
      </div>

      <Card className="transition-all hover:shadow-md">
        <p className="mb-4 font-semibold text-stone-900">Casos reportados — últimos {DIAS_TENDENCIA} días</p>
        <TrendLine data={tendenciaData} />
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="transition-all hover:shadow-md">
          <p className="mb-4 font-semibold text-stone-900">Casos por categoría</p>
          {casosPorCategoriaData.length > 0 ? (
            <BarRow data={casosPorCategoriaData} />
          ) : (
            <p className="text-sm text-stone-400">Aún no hay casos registrados.</p>
          )}
        </Card>
        <Card className="transition-all hover:shadow-md">
          <p className="mb-4 font-semibold text-stone-900">Casos verificados por prioridad</p>
          <BarRow data={casosPorPrioridadData} />
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="transition-all hover:shadow-md">
          <p className="mb-2 font-semibold text-stone-900">Casos por estado</p>
          <ul className="space-y-1 text-sm text-stone-600">
            {(Object.keys(ESTADO_CASO_LABELS) as EstadoCaso[]).map((estado) => (
              <li key={estado} className="flex justify-between">
                <span>{ESTADO_CASO_LABELS[estado]}</span>
                <span>{stats.porEstadoCaso[estado] ?? 0}</span>
              </li>
            ))}
          </ul>
        </Card>
        <Card className="transition-all hover:shadow-md">
          <p className="mb-2 font-semibold text-stone-900">Coincidencias por estado</p>
          <ul className="space-y-1 text-sm text-stone-600">
            {(Object.keys(ESTADO_MATCH_LABELS) as EstadoMatch[]).map((estado) => (
              <li key={estado} className="flex justify-between">
                <span>{ESTADO_MATCH_LABELS[estado]}</span>
                <span>{stats.porEstadoMatch[estado] ?? 0}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {stats.negociosReactivados.length > 0 && (
        <Card className="transition-all hover:shadow-md">
          <p className="mb-2 font-semibold text-stone-900">Negocios reactivados</p>
          <ul className="space-y-1 text-sm text-stone-600">
            {stats.negociosReactivados.map((c) => (
              <li key={c.id}>
                {c.nombreReportante} — {c.vereda}, {c.municipio}
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
