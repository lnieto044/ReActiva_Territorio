import { useParams } from 'react-router-dom';
import { Button, Card } from '../components/ui';
import { useMatches, useMatch, advanceMatchEstado, rechazarMatch, siguienteEstado } from '../features/matches/api';
import { MatchCard } from '../features/matches/MatchCard';
import { PipelineStepper } from '../features/matches/PipelineStepper';
import { EvidenceForm } from '../features/matches/EvidenceForm';
import { useCases } from '../features/cases/api';
import { useOffers } from '../features/offers/api';
import { ESTADO_MATCH_LABELS, type Evidencia } from '../types/match';
import { useAuth } from '../context/AuthContext';
import { puedeAvanzarEntrega } from '../domain/permissions';
import { useState } from 'react';

export function SeguimientoListPage() {
  const { matches, loading } = useMatches();
  const { cases } = useCases();
  const { offers } = useOffers();

  if (loading) return <p className="text-stone-400">Cargando…</p>;

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold text-stone-900">Seguimiento de la entrega</h1>
      {matches.length === 0 && <p className="text-stone-400">Aún no hay coincidencias en seguimiento.</p>}
      <div className="grid gap-4 sm:grid-cols-2">
        {matches.map((match) => (
          <MatchCard
            key={match.id}
            match={match}
            caso={cases.find((c) => c.id === match.caseId)}
            oferta={offers.find((o) => o.id === match.offerId)}
          />
        ))}
      </div>
    </div>
  );
}

export function SeguimientoDetallePage() {
  const { matchId } = useParams<{ matchId: string }>();
  const { match, loading } = useMatch(matchId);
  const { cases } = useCases();
  const { offers } = useOffers();
  const { uid, displayName, role } = useAuth();
  const [working, setWorking] = useState(false);

  if (loading) return <p className="text-stone-400">Cargando…</p>;
  if (!match) return <p className="text-stone-500">Esta coincidencia no existe.</p>;

  const caso = cases.find((c) => c.id === match.caseId);
  const oferta = offers.find((o) => o.id === match.offerId);
  const next = siguienteEstado(match.estado);
  const puedeAvanzar = next ? puedeAvanzarEntrega(role, next) : false;
  const quienAvanza = next === 'verificada' || next === 'cerrada' ? 'el líder comunitario' : 'la organización';

  async function handleAvanzar(evidencia?: Evidencia) {
    if (!uid || !next) return;
    setWorking(true);
    try {
      await advanceMatchEstado(match!, next, uid, evidencia);
    } finally {
      setWorking(false);
    }
  }

  async function handleRechazar() {
    if (!uid) return;
    setWorking(true);
    try {
      await rechazarMatch(match!.id, uid);
    } finally {
      setWorking(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-xl font-bold text-stone-900">
        {caso?.nombreReportante ?? 'Caso'} ↔ {oferta?.entidadResponsable ?? 'Oferta'}
      </h1>

      <Card className="space-y-3">
        <PipelineStepper estado={match.estado} />
        <p className="text-sm text-stone-600">{oferta?.descripcion}</p>
        <p className="text-xs text-stone-400">Compatibilidad: {match.scoreCompatibilidad}%</p>

        {next && !puedeAvanzar && match.estado !== 'sugerida' && (
          <p className="text-xs text-stone-400">
            El siguiente paso ({ESTADO_MATCH_LABELS[next]}) lo confirma {quienAvanza}.
          </p>
        )}

        {next && next !== 'entregada' && (puedeAvanzar || match.estado === 'sugerida') && (
          <div className="flex gap-2">
            {puedeAvanzar && (
              <Button disabled={working} onClick={() => handleAvanzar()}>
                Avanzar a: {ESTADO_MATCH_LABELS[next]}
              </Button>
            )}
            {match.estado === 'sugerida' && (
              <Button variant="secondary" disabled={working} onClick={handleRechazar}>
                Rechazar
              </Button>
            )}
          </div>
        )}

        {next === 'entregada' && puedeAvanzar && (
          <EvidenceForm matchId={match.id} responsableDefault={displayName} onSubmit={handleAvanzar} />
        )}

        {match.evidenciaEntrega && (
          <div className="rounded-lg bg-stone-50 p-3 text-sm text-stone-600">
            <p className="font-semibold">Evidencia de entrega</p>
            <p>Responsable: {match.evidenciaEntrega.responsable}</p>
            {match.evidenciaEntrega.comentario && <p>Comentario: {match.evidenciaEntrega.comentario}</p>}
            {match.evidenciaEntrega.fotos.length > 0 && (
              <div className="mt-2 flex gap-2">
                {match.evidenciaEntrega.fotos.map((url) => (
                  <img key={url} src={url} className="h-20 w-20 rounded-lg object-cover" alt="Evidencia de entrega" />
                ))}
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
