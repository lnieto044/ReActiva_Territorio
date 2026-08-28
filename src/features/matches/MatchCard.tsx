import { Link } from 'react-router-dom';
import { Badge, Card } from '../../components/ui';
import { ESTADO_MATCH_LABELS, type Coincidencia } from '../../types/match';
import type { CasoAfectado } from '../../types/case';
import type { OfertaRecurso } from '../../types/offer';

const TONE: Record<string, 'success' | 'media' | 'neutral' | 'alta'> = {
  sugerida: 'neutral',
  aceptada: 'media',
  en_preparacion: 'media',
  en_camino: 'media',
  entregada: 'success',
  verificada: 'success',
  cerrada: 'success',
  rechazada: 'alta',
};

export function MatchCard({ match, caso, oferta }: { match: Coincidencia; caso?: CasoAfectado; oferta?: OfertaRecurso }) {
  return (
    <Link to={`/seguimiento/${match.id}`}>
      <Card className="transition hover:border-emerald-400 hover:shadow-md">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-semibold text-stone-900">
              {caso?.nombreReportante ?? 'Caso'} ↔ {oferta?.entidadResponsable ?? 'Oferta'}
            </p>
            <p className="text-sm text-stone-500">{oferta?.descripcion}</p>
          </div>
          <Badge tone={TONE[match.estado]}>{ESTADO_MATCH_LABELS[match.estado]}</Badge>
        </div>
        <p className="mt-2 text-xs text-stone-400">Compatibilidad: {match.scoreCompatibilidad}%</p>
      </Card>
    </Link>
  );
}
