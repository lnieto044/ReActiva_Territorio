import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Badge, Button, Card } from '../components/ui';
import { useCase, iniciarVerificacion, verificarCaso } from '../features/cases/api';
import { PriorityBadge } from '../features/cases/PriorityBadge';
import { CATEGORIA_LABELS, ESTADO_CASO_LABELS } from '../types/case';
import { useOffers } from '../features/offers/api';
import { encontrarCoincidencias } from '../domain/matching';
import { createMatch } from '../features/matches/api';
import { useAuth } from '../context/AuthContext';
import { puedeCrearCoincidencia, puedeVerificarCaso } from '../domain/permissions';

const DESGLOSE_LABELS: Record<string, string> = {
  perdidaTotalIngresos: 'Pérdida total de ingresos',
  interrupcionServicioEsencial: 'Interrupción de servicio esencial',
  personasVulnerablesACargo: 'Personas vulnerables a cargo',
  nivelAfectacionInmueble: 'Nivel de afectación del inmueble',
  tiempoSinAtencion: 'Tiempo sin atención',
  aislamientoGeografico: 'Aislamiento geográfico',
};

export function CasoDetallePage() {
  const { id } = useParams<{ id: string }>();
  const { caso, hasPendingWrites, loading } = useCase(id);
  const { offers } = useOffers();
  const { uid, displayName, role } = useAuth();
  const navigate = useNavigate();
  const [working, setWorking] = useState(false);

  const candidatos = useMemo(() => {
    if (!caso || caso.estado === 'pendiente' || caso.estado === 'en_verificacion') return [];
    return encontrarCoincidencias(caso, offers);
  }, [caso, offers]);

  if (loading) return <p className="text-stone-400">Cargando…</p>;
  if (!caso) return <p className="text-stone-500">Este caso no existe.</p>;

  async function handleIniciarVerificacion() {
    setWorking(true);
    try {
      await iniciarVerificacion(caso!.id);
    } finally {
      setWorking(false);
    }
  }

  async function handleVerificar() {
    if (!uid) return;
    setWorking(true);
    try {
      await verificarCaso(caso!.id, uid, caso!);
    } finally {
      setWorking(false);
    }
  }

  async function handleCrearCoincidencia(offerId: string, score: number, cantidad: number) {
    setWorking(true);
    try {
      const matchId = await createMatch(caso!.id, offerId, score, cantidad);
      navigate(`/seguimiento/${matchId}`);
    } finally {
      setWorking(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      {hasPendingWrites && (
        <div className="rounded-lg bg-stone-800 px-4 py-2 text-sm text-white">
          Guardado localmente — se sincronizará automáticamente cuando haya conexión.
        </div>
      )}

      <Card className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h1 className="text-xl font-bold text-stone-900">{caso.nombreReportante}</h1>
            <p className="text-sm text-stone-500">
              {caso.vereda}, {caso.municipio} · {caso.telefono}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <Badge tone={caso.estado === 'verificado' || caso.estado === 'atendido' ? 'success' : 'neutral'}>
              {ESTADO_CASO_LABELS[caso.estado]}
            </Badge>
            <PriorityBadge prioridad={caso.prioridad} />
          </div>
        </div>
        <p className="text-stone-700">{caso.descripcion}</p>
        <div className="flex flex-wrap gap-2 text-xs text-stone-500">
          <Badge tone="neutral">{CATEGORIA_LABELS[caso.categoria]}</Badge>
          <Badge tone="neutral">{caso.personasAfectadas} personas afectadas</Badge>
          {caso.aislamientoGeografico && <Badge tone="neutral">Aislamiento geográfico</Badge>}
        </div>
        {caso.fotos.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {caso.fotos.map((url) => (
              <img key={url} src={url} className="h-24 w-24 rounded-lg object-cover" alt="Evidencia del caso" />
            ))}
          </div>
        )}
        {caso.prioridad && (
          <div className="rounded-lg bg-stone-50 p-3 text-xs text-stone-600">
            <p className="mb-1 font-semibold">Desglose de prioridad</p>
            <ul className="space-y-0.5">
              {Object.entries(caso.prioridad.desglose).map(([k, v]) => (
                <li key={k} className="flex justify-between">
                  <span>{DESGLOSE_LABELS[k] ?? k}</span>
                  <span>{v} pts</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {puedeVerificarCaso(role) ? (
          <div className="flex gap-2">
            {caso.estado === 'pendiente' && (
              <Button onClick={handleIniciarVerificacion} disabled={working}>
                Iniciar verificación
              </Button>
            )}
            {caso.estado === 'en_verificacion' && (
              <Button onClick={handleVerificar} disabled={working}>
                Confirmar verificación
              </Button>
            )}
          </div>
        ) : (
          (caso.estado === 'pendiente' || caso.estado === 'en_verificacion') && (
            <p className="text-xs text-stone-400">
              La verificación la realiza un líder comunitario o coordinación.
            </p>
          )
        )}
      </Card>

      {caso.estado !== 'pendiente' && caso.estado !== 'en_verificacion' && (
        <Card>
          <h2 className="mb-3 font-semibold text-stone-900">Coincidencias sugeridas</h2>
          {candidatos.length === 0 && <p className="text-sm text-stone-400">No hay ofertas compatibles todavía.</p>}
          <div className="space-y-3">
            {candidatos.map(({ offer, score, motivos }) => (
              <div key={offer.id} className="rounded-lg border border-stone-200 p-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-stone-800">{offer.descripcion}</p>
                    <p className="text-xs text-stone-500">{offer.entidadResponsable}</p>
                  </div>
                  <Badge tone="success">{score}% compatible</Badge>
                </div>
                <ul className="mt-1 list-inside list-disc text-xs text-stone-500">
                  {motivos.map((m) => (
                    <li key={m}>{m}</li>
                  ))}
                </ul>
                {puedeCrearCoincidencia(role) && (
                  <Button
                    className="mt-2"
                    variant="secondary"
                    disabled={working}
                    onClick={() => handleCrearCoincidencia(offer.id, score, 1)}
                  >
                    Crear coincidencia
                  </Button>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {!displayName && <p className="text-xs text-stone-400">Inicia sesión desde "Inicio" para poder verificar casos.</p>}
    </div>
  );
}
