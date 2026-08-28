import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCases } from '../features/cases/api';
import { useOffers } from '../features/offers/api';
import { useMatches } from '../features/matches/api';
import { generarAlertas } from '../domain/alerts';
import { proyectarVerificacion } from '../domain/projections';
import { Card } from '../components/ui';
import { AlertTriangleIcon, AlertCircleIcon, TrendingUpIcon } from '../components/icons';

export function AlertasPage() {
  const { role, uid } = useAuth();
  const { cases } = useCases();
  const { offers } = useOffers();
  const { matches } = useMatches();

  const { alertas, proyeccion, scopeLabel } = useMemo(() => {
    if (role === 'lider_comunitario') {
      const misCasos = cases.filter((c) => c.registradoPor === uid);
      const misCasosIds = new Set(misCasos.map((c) => c.id));
      const misMatches = matches.filter((m) => misCasosIds.has(m.caseId));
      return {
        alertas: generarAlertas(misCasos, [], misMatches),
        proyeccion: proyectarVerificacion(misCasos),
        scopeLabel: 'tus casos',
      };
    }
    if (role === 'organizacion') {
      const misOfertas = offers.filter((o) => o.registradoPor === uid);
      const misOfertasIds = new Set(misOfertas.map((o) => o.id));
      const misMatches = matches.filter((m) => misOfertasIds.has(m.offerId));
      return {
        alertas: generarAlertas([], misOfertas, misMatches),
        proyeccion: null,
        scopeLabel: 'tus ofertas',
      };
    }
    return {
      alertas: generarAlertas(cases, offers, matches),
      proyeccion: proyectarVerificacion(cases),
      scopeLabel: 'todo el territorio',
    };
  }, [role, uid, cases, offers, matches]);

  return (
    <div>
      <h1 className="mb-1 text-xl font-bold text-stone-900">Alertas y proyecciones</h1>
      <p className="mb-6 text-sm text-stone-500">
        Reglas operativas sobre {scopeLabel} — no es predicción sísmica, es seguimiento de lo que ya está pasando en la coordinación.
      </p>

      {proyeccion && (
        <div className="mb-6 rounded-xl p-5" style={{ background: '#F2FBFA', border: '1px solid #D3EEEA' }}>
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg" style={{ background: '#0E9488', color: '#FFFFFF' }}>
              <TrendingUpIcon width={20} height={20} />
            </div>
            <div>
              <p className="font-semibold text-stone-900">Proyección de verificación</p>
              {proyeccion.diasEstimados !== null ? (
                <p className="mt-1 text-sm text-stone-600">
                  A un ritmo de <strong>{proyeccion.tasaDiaria.toFixed(1)} casos verificados por día</strong> (últimos 14 días),
                  los <strong>{proyeccion.casosPendientes}</strong> casos pendientes tomarían aproximadamente{' '}
                  <strong>{proyeccion.diasEstimados} día{proyeccion.diasEstimados === 1 ? '' : 's'}</strong> en quedar verificados si el ritmo se mantiene.
                </p>
              ) : (
                <p className="mt-1 text-sm text-stone-600">
                  Aún no hay suficiente historial de verificaciones en los últimos 14 días para proyectar un ritmo confiable.
                  {proyeccion.casosPendientes > 0 && ` Hay ${proyeccion.casosPendientes} casos pendientes de verificar.`}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {alertas.length === 0 ? (
        <Card>
          <p className="text-sm text-stone-500">No hay alertas activas en este momento — todo al día.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {alertas.map((a) => {
            const critica = a.severidad === 'critica';
            return (
              <Link
                key={a.id}
                to={a.link}
                className="block rounded-xl border p-4 transition-all hover:-translate-y-0.5 hover:shadow-md"
                style={{ borderColor: critica ? '#F3B4AE' : '#E2E5E4', background: critica ? '#FDF2F1' : '#FFFFFF' }}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg"
                    style={{ background: critica ? '#FCE4E1' : '#FDF1DE', color: critica ? '#B3261E' : '#9A5B0E' }}
                  >
                    {critica ? <AlertCircleIcon width={18} height={18} /> : <AlertTriangleIcon width={18} height={18} />}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-stone-900">{a.titulo}</p>
                    <p className="mt-0.5 text-xs text-stone-500">{a.detalle}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
