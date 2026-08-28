import { useMemo, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCases } from '../features/cases/api';
import { useOffers } from '../features/offers/api';
import { useMatches } from '../features/matches/api';
import { DocPlusIcon, MapPinIcon, LinkMatchIcon, TruckIcon, PackageIcon, BarChartIcon, UsersIcon } from '../components/icons';
import { CountUp } from '../components/CountUp';
import { BarRow, type BarDatum } from '../components/charts/BarRow';
import { DonutChart, type DonutDatum } from '../components/charts/DonutChart';
import { RadialProgress } from '../components/charts/RadialProgress';
import { Funnel, type FunnelStage } from '../components/charts/Funnel';
import { ComparisonStat } from '../components/charts/ComparisonStat';
import { TrendLine, type TrendPoint } from '../components/charts/TrendLine';
import { ScatterChart, type ScatterPoint } from '../components/charts/ScatterChart';
import { CATEGORIA_LABELS, ESTADO_CASO_LABELS, type EstadoCaso } from '../types/case';
import { ESTADO_MATCH_LABELS, type Coincidencia, type EstadoMatch } from '../types/match';
import type { CasoAfectado } from '../types/case';
import type { OfertaRecurso } from '../types/offer';

const PRIORIDAD_COLOR = { alta: '#DC2626', media: '#D97706', regular: '#78716C' } as const;
const PRIORIDAD_LABEL = { alta: 'Alta', media: 'Media', regular: 'Regular' } as const;
const ESTADO_CASO_COLOR: Record<EstadoCaso, string> = { pendiente: '#97A3AA', en_verificacion: '#F5A623', verificado: '#0E9488', atendido: '#1B3556' };
const ESTADO_OFERTA_COLOR: Record<string, string> = { disponible: '#0E9488', parcialmente_asignada: '#F5A623', agotada: '#97A3AA', cerrada: '#1B3556' };
const ESTADO_OFERTA_LABEL: Record<string, string> = { disponible: 'Disponible', parcialmente_asignada: 'Parcial', agotada: 'Agotada', cerrada: 'Cerrada' };
const FUNNEL_STAGES: EstadoMatch[] = ['sugerida', 'aceptada', 'entregada', 'verificada', 'cerrada'];
const DIAS_TENDENCIA = 14;

function tallyToBars<K extends string>(counts: Record<string, number>, labels: Record<K, string>): BarDatum[] {
  return (Object.keys(labels) as K[])
    .map((key) => ({ label: labels[key], value: counts[key] ?? 0 }))
    .filter((d) => d.value > 0);
}

function trendFromDates(items: { createdAt?: { toDate?: () => Date } }[]): TrendPoint[] {
  const now = new Date();
  const days: TrendPoint[] = [];
  for (let i = DIAS_TENDENCIA - 1; i >= 0; i--) {
    const day = new Date(now);
    day.setDate(now.getDate() - i);
    const dayKey = day.toDateString();
    const count = items.filter((it) => it.createdAt?.toDate?.().toDateString() === dayKey).length;
    days.push({ label: day.toLocaleDateString('es-CO', { day: '2-digit', month: 'short' }), value: count });
  }
  return days;
}

// Cumulative funnel: a match "reaches" a stage once it has advanced at least
// that far in the pipeline. Rejected matches are excluded — this shows the
// successful delivery flow, not a full audit trail.
function pipelineFunnel(matchList: Coincidencia[]): FunnelStage[] {
  return FUNNEL_STAGES.map((stage, idx) => ({
    label: ESTADO_MATCH_LABELS[stage],
    value: matchList.filter((m) => FUNNEL_STAGES.indexOf(m.estado) >= idx).length,
  }));
}

function ChartCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="transition-all hover:shadow-md" style={{ background: '#FFFFFF', border: '1px solid #E2E5E4', borderRadius: 14, padding: 22 }}>
      <p style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 700, fontSize: 14, color: '#16202B', marginBottom: 16 }}>{title}</p>
      {children}
    </div>
  );
}

// Estado (composition) and % verificado (single KPI) are related enough to
// share one card, side by side, instead of two separate ring cards.
function EstadoConVerificacion({ donutData, pct, pctLabel }: { donutData: DonutDatum[]; pct: number; pctLabel: string }) {
  if (donutData.length === 0) return <Empty />;
  return (
    <div className="flex flex-wrap items-center justify-between gap-6">
      <DonutChart data={donutData} size={110} strokeWidth={16} />
      <div style={{ borderLeft: '1px solid #EEF0F0', paddingLeft: 24 }}>
        <RadialProgress value={pct} label={pctLabel} size={100} strokeWidth={10} />
      </div>
    </div>
  );
}

function Empty() {
  return <p style={{ fontSize: 13, color: '#97A3AA' }}>Aún no hay datos suficientes.</p>;
}

interface ModuleDef {
  to: string;
  title: string;
  description: string;
  icon: ReactNode;
  accent?: 'orange';
}

function StatTile({ label, value }: { label: string; value: number | string }) {
  return (
    <div
      className="transition-all hover:-translate-y-0.5 hover:shadow-md"
      style={{ background: '#FFFFFF', border: '1px solid #E2E5E4', borderRadius: 14, padding: 22 }}
    >
      <p style={{ fontSize: 13, color: '#647079', marginBottom: 8 }}>{label}</p>
      <p style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 800, fontSize: 30, color: '#1B3556' }}>
        <CountUp value={value} />
      </p>
    </div>
  );
}

function ModuleCard({ mod }: { mod: ModuleDef }) {
  const tint = mod.accent === 'orange' ? '#FDF1DE' : '#EAF6F4';
  const iconColor = mod.accent === 'orange' ? '#9A5B0E' : '#0B7C72';
  return (
    <Link
      to={mod.to}
      className="group transition-all hover:-translate-y-1 hover:shadow-lg"
      style={{ background: '#FFFFFF', border: '1px solid #E2E5E4', borderRadius: 16, padding: 24, boxShadow: '0 1px 2px rgba(16,24,32,0.04)', textDecoration: 'none', color: 'inherit', display: 'block' }}
    >
      <div
        className="transition-transform group-hover:scale-110"
        style={{ width: 44, height: 44, borderRadius: 12, background: tint, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, color: iconColor }}
      >
        {mod.icon}
      </div>
      <p style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 700, fontSize: 15, marginBottom: 6, color: '#16202B' }}>{mod.title}</p>
      <p style={{ fontSize: 12.5, color: '#647079', lineHeight: 1.5 }}>{mod.description}</p>
    </Link>
  );
}

export function DashboardPage() {
  const { displayName, role, uid } = useAuth();
  const { cases } = useCases();
  const { offers } = useOffers();
  const { matches } = useMatches();

  const stats = useMemo(() => {
    if (role === 'lider_comunitario') {
      const misCasos = cases.filter((c) => c.registradoPor === uid);
      const misCasosIds = new Set(misCasos.map((c) => c.id));
      return [
        { label: 'Casos reportados', value: misCasos.length },
        { label: 'Casos verificados', value: misCasos.filter((c) => c.estado === 'verificado' || c.estado === 'atendido').length },
        { label: 'Coincidencias activas', value: matches.filter((m) => misCasosIds.has(m.caseId) && m.estado !== 'rechazada' && m.estado !== 'cerrada').length },
        { label: 'Negocios reactivados', value: misCasos.filter((c) => c.estado === 'atendido' && c.tipoAfectacion === 'negocio').length },
      ];
    }
    if (role === 'organizacion') {
      const misOfertas = offers.filter((o) => o.registradoPor === uid);
      const misOfertasIds = new Set(misOfertas.map((o) => o.id));
      return [
        { label: 'Ofertas activas', value: misOfertas.filter((o) => o.estado === 'disponible' || o.estado === 'parcialmente_asignada').length },
        { label: 'Coincidencias en curso', value: matches.filter((m) => misOfertasIds.has(m.offerId) && m.estado !== 'rechazada' && m.estado !== 'cerrada').length },
        { label: 'Entregas completadas', value: matches.filter((m) => misOfertasIds.has(m.offerId) && ['entregada', 'verificada', 'cerrada'].includes(m.estado)).length },
        { label: 'Recursos movilizados', value: misOfertas.reduce((total, o) => total + o.cantidadAsignada, 0) },
      ];
    }
    // admin
    const municipios = new Set(cases.map((c) => c.municipio).filter(Boolean));
    return [
      { label: 'Casos totales', value: cases.length },
      { label: 'Casos verificados', value: cases.filter((c) => c.estado === 'verificado' || c.estado === 'atendido').length },
      { label: 'Negocios reactivados', value: cases.filter((c) => c.estado === 'atendido' && c.tipoAfectacion === 'negocio').length },
      { label: 'Ofertas activas', value: offers.filter((o) => o.estado === 'disponible' || o.estado === 'parcialmente_asignada').length },
      { label: 'Municipios activos', value: municipios.size },
    ];
  }, [role, uid, cases, offers, matches]);

  const charts: { title: string; node: ReactNode }[] = useMemo(() => {
    if (role === 'lider_comunitario') {
      const misCasos: CasoAfectado[] = cases.filter((c) => c.registradoPor === uid);
      const misCasosIds = new Set(misCasos.map((c) => c.id));
      const misMatches = matches.filter((m) => misCasosIds.has(m.caseId));

      const porCategoria = misCasos.reduce((acc, c) => ({ ...acc, [c.categoria]: (acc[c.categoria] ?? 0) + 1 }), {} as Record<string, number>);
      const barCategoria = tallyToBars(porCategoria, CATEGORIA_LABELS);

      const donutEstado: DonutDatum[] = (Object.keys(ESTADO_CASO_LABELS) as EstadoCaso[])
        .map((k) => ({ label: ESTADO_CASO_LABELS[k], value: misCasos.filter((c) => c.estado === k).length, color: ESTADO_CASO_COLOR[k] }))
        .filter((d) => d.value > 0);

      const verificados = misCasos.filter((c) => c.estado === 'verificado' || c.estado === 'atendido').length;
      const pctVerificado = misCasos.length > 0 ? (verificados / misCasos.length) * 100 : 0;

      const dispersion: ScatterPoint[] = misCasos.map((c) => ({
        x: c.personasAfectadas,
        y: c.prioridad?.score ?? 0,
        label: c.nombreReportante,
      }));

      return [
        { title: 'Tus casos reportados — últimos 14 días', node: <TrendLine data={trendFromDates(misCasos)} /> },
        { title: 'Tus casos por categoría', node: barCategoria.length ? <BarRow data={barCategoria} /> : <Empty /> },
        {
          title: 'Casos por estado y % verificado',
          node: <EstadoConVerificacion donutData={donutEstado} pct={pctVerificado} pctLabel={`${verificados} de ${misCasos.length} casos`} />,
        },
        { title: 'Tus coincidencias por etapa', node: misMatches.length ? <Funnel stages={pipelineFunnel(misMatches)} /> : <Empty /> },
        {
          title: 'Verificados vs. pendientes',
          node: (
            <ComparisonStat
              a={{ label: 'Verificados', value: verificados }}
              b={{ label: 'Pendientes', value: misCasos.length - verificados }}
              colorA="#0E9488"
              colorB="#E2E5E4"
            />
          ),
        },
        {
          title: 'Personas afectadas vs. prioridad',
          node: dispersion.length ? <ScatterChart points={dispersion} xLabel="Personas afectadas" yLabel="Prioridad" /> : <Empty />,
        },
      ];
    }

    if (role === 'organizacion') {
      const misOfertas: OfertaRecurso[] = offers.filter((o) => o.registradoPor === uid);
      const misOfertasIds = new Set(misOfertas.map((o) => o.id));
      const misMatches = matches.filter((m) => misOfertasIds.has(m.offerId));

      const porCategoria = misOfertas.reduce((acc, o) => ({ ...acc, [o.tipoRecurso]: (acc[o.tipoRecurso] ?? 0) + 1 }), {} as Record<string, number>);
      const barCategoria = tallyToBars(porCategoria, CATEGORIA_LABELS);

      const donutEstado: DonutDatum[] = Object.keys(ESTADO_OFERTA_LABEL)
        .map((k) => ({ label: ESTADO_OFERTA_LABEL[k], value: misOfertas.filter((o) => o.estado === k).length, color: ESTADO_OFERTA_COLOR[k] }))
        .filter((d) => d.value > 0);

      const totalCantidad = misOfertas.reduce((sum, o) => sum + o.cantidad, 0);
      const totalAsignada = misOfertas.reduce((sum, o) => sum + o.cantidadAsignada, 0);
      const pctAsignada = totalCantidad > 0 ? (totalAsignada / totalCantidad) * 100 : 0;

      const activas = misOfertas.filter((o) => o.estado === 'disponible' || o.estado === 'parcialmente_asignada').length;

      const dispersion: ScatterPoint[] = misOfertas.map((o) => ({
        x: o.cantidad,
        y: o.cantidadAsignada,
        label: o.descripcion,
      }));

      return [
        { title: 'Tus ofertas publicadas — últimos 14 días', node: <TrendLine data={trendFromDates(misOfertas)} /> },
        { title: 'Tus ofertas por categoría', node: barCategoria.length ? <BarRow data={barCategoria} /> : <Empty /> },
        {
          title: 'Ofertas por estado y % asignado',
          node: <EstadoConVerificacion donutData={donutEstado} pct={pctAsignada} pctLabel={`${totalAsignada} de ${totalCantidad} unidades`} />,
        },
        { title: 'Tus entregas por etapa', node: misMatches.length ? <Funnel stages={pipelineFunnel(misMatches)} /> : <Empty /> },
        {
          title: 'Activas vs. cerradas',
          node: (
            <ComparisonStat
              a={{ label: 'Activas', value: activas }}
              b={{ label: 'Cerradas / agotadas', value: misOfertas.length - activas }}
              colorA="#0E9488"
              colorB="#E2E5E4"
            />
          ),
        },
        {
          title: 'Cantidad ofrecida vs. asignada',
          node: dispersion.length ? <ScatterChart points={dispersion} xLabel="Ofrecida" yLabel="Asignada" /> : <Empty />,
        },
      ];
    }

    // admin
    const porCategoria = cases.reduce((acc, c) => ({ ...acc, [c.categoria]: (acc[c.categoria] ?? 0) + 1 }), {} as Record<string, number>);
    const barCategoria = tallyToBars(porCategoria, CATEGORIA_LABELS);

    const donutEstado: DonutDatum[] = (Object.keys(ESTADO_CASO_LABELS) as EstadoCaso[])
      .map((k) => ({ label: ESTADO_CASO_LABELS[k], value: cases.filter((c) => c.estado === k).length, color: ESTADO_CASO_COLOR[k] }))
      .filter((d) => d.value > 0);

    const verificados = cases.filter((c) => c.estado === 'verificado' || c.estado === 'atendido').length;
    const pctVerificado = cases.length > 0 ? (verificados / cases.length) * 100 : 0;

    const porPrioridad = cases.reduce(
      (acc, c) => {
        if (c.prioridad) acc[c.prioridad.nivel] += 1;
        return acc;
      },
      { alta: 0, media: 0, regular: 0 },
    );
    const barPrioridad: BarDatum[] = (['alta', 'media', 'regular'] as const).map((n) => ({ label: PRIORIDAD_LABEL[n], value: porPrioridad[n], color: PRIORIDAD_COLOR[n] }));

    const dispersion: ScatterPoint[] = cases.map((c) => ({
      x: c.personasAfectadas,
      y: c.prioridad?.score ?? 0,
      label: c.nombreReportante,
    }));

    return [
      { title: 'Casos reportados — últimos 14 días', node: <TrendLine data={trendFromDates(cases)} /> },
      { title: 'Casos por categoría', node: barCategoria.length ? <BarRow data={barCategoria} /> : <Empty /> },
      {
        title: 'Casos por estado y % verificado',
        node: <EstadoConVerificacion donutData={donutEstado} pct={pctVerificado} pctLabel={`${verificados} de ${cases.length} casos`} />,
      },
      { title: 'Coincidencias por etapa', node: matches.length ? <Funnel stages={pipelineFunnel(matches)} /> : <Empty /> },
      { title: 'Casos verificados por prioridad', node: <BarRow data={barPrioridad} /> },
      {
        title: 'Personas afectadas vs. prioridad',
        node: dispersion.length ? <ScatterChart points={dispersion} xLabel="Personas afectadas" yLabel="Prioridad" /> : <Empty />,
      },
    ];
  }, [role, uid, cases, offers, matches]);

  const modules: ModuleDef[] = useMemo(() => {
    const reportar: ModuleDef = { to: '/reportar', title: 'Reportar afectación', description: 'Registra una necesidad nueva, con o sin conexión.', icon: <DocPlusIcon width={22} height={22} /> };
    const mapa: ModuleDef = { to: '/mapa', title: 'Mapa de casos', description: 'Visualiza los casos reportados en tu territorio.', icon: <MapPinIcon width={22} height={22} /> };
    const ofertasPublicar: ModuleDef = { to: '/ofertas', title: 'Publicar oferta', description: 'Registra recursos, empleos o servicios disponibles.', icon: <PackageIcon width={22} height={22} /> };
    const ofertasActivas: ModuleDef = { to: '/ofertas', title: 'Ofertas activas', description: 'Consulta el estado de tus ofertas publicadas.', icon: <BarChartIcon width={22} height={22} /> };
    const coincidencias: ModuleDef = { to: '/coincidencias', title: 'Coincidencias', description: 'Relaciona necesidades verificadas con ofertas compatibles.', icon: <LinkMatchIcon width={22} height={22} /> };
    const seguimiento: ModuleDef = { to: '/seguimiento', title: 'Seguimiento de entregas', description: 'Da seguimiento y registra evidencia de cada entrega.', icon: <TruckIcon width={22} height={22} /> };
    const tablero: ModuleDef = { to: '/tablero', title: 'Tablero de resultados', description: 'Indicadores de recuperación en tiempo real.', icon: <BarChartIcon width={22} height={22} />, accent: 'orange' };
    const usuarios: ModuleDef = { to: '/usuarios', title: 'Gestión de usuarios', description: 'Administra las cuentas registradas y sus roles.', icon: <UsersIcon width={22} height={22} />, accent: 'orange' };

    if (role === 'lider_comunitario') return [reportar, mapa, coincidencias, seguimiento];
    if (role === 'organizacion') return [ofertasPublicar, ofertasActivas, coincidencias, seguimiento];
    return [reportar, mapa, ofertasPublicar, coincidencias, seguimiento, tablero, usuarios];
  }, [role]);

  const greeting = role === 'organizacion' ? `Hola, ${displayName}` : role === 'admin' ? 'Panel de coordinación' : `Hola, ${displayName}`;
  const subtitle =
    role === 'lider_comunitario'
      ? 'Aquí puedes reportar afectaciones y hacer seguimiento a tu comunidad.'
      : role === 'organizacion'
        ? 'Aquí puedes publicar ofertas y coordinar la entrega de ayudas.'
        : 'Visibilidad completa sobre casos, ofertas y resultados en todo el territorio.';

  return (
    <div style={{ padding: '44px 0' }}>
      <h2 style={{ fontSize: 26, fontWeight: 800 }}>{greeting}</h2>
      <p style={{ marginTop: 6, fontSize: 15, color: '#647079' }}>{subtitle}</p>

      <div className="grid grid-cols-2 lg:grid-cols-4" style={{ gap: 20, marginTop: 32, marginBottom: 12 }}>
        {stats.map((s) => (
          <StatTile key={s.label} label={s.label} value={s.value} />
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3" style={{ gap: 20, marginTop: 24 }}>
        {charts.map((chart) => (
          <ChartCard key={chart.title} title={chart.title}>
            {chart.node}
          </ChartCard>
        ))}
      </div>

      <p style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 700, fontSize: 15, marginTop: 36, marginBottom: 16 }}>
        {role === 'admin' ? 'Módulos' : 'Tus módulos'}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" style={{ gap: 20 }}>
        {modules.map((mod) => (
          <ModuleCard key={mod.title + mod.to} mod={mod} />
        ))}
      </div>
    </div>
  );
}
