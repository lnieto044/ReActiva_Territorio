import { Badge, Card } from '../../components/ui';
import { CATEGORIA_LABELS } from '../../types/case';
import { MEDIO_ENTREGA_LABELS, type OfertaRecurso } from '../../types/offer';

const ESTADO_TONE: Record<OfertaRecurso['estado'], 'success' | 'media' | 'neutral'> = {
  disponible: 'success',
  parcialmente_asignada: 'media',
  agotada: 'neutral',
  cerrada: 'neutral',
};

export function OfferList({ offers }: { offers: OfertaRecurso[] }) {
  if (offers.length === 0) {
    return <p className="text-sm text-stone-400">Aún no hay ofertas publicadas.</p>;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {offers.map((offer) => (
        <Card key={offer.id}>
          <div className="flex items-start justify-between gap-2">
            <p className="font-semibold text-stone-900">{CATEGORIA_LABELS[offer.tipoRecurso]}</p>
            <Badge tone={ESTADO_TONE[offer.estado]}>{offer.estado.replace('_', ' ')}</Badge>
          </div>
          <p className="mt-1 text-sm text-stone-600">{offer.descripcion}</p>
          <p className="mt-2 text-xs text-stone-500">
            {offer.cantidad - offer.cantidadAsignada} / {offer.cantidad} {offer.unidadMedida} disponibles
          </p>
          <p className="text-xs text-stone-500">Cobertura: {offer.municipioCobertura.join(', ')}</p>
          <p className="text-xs text-stone-500">Entrega: {MEDIO_ENTREGA_LABELS[offer.medioEntrega]}</p>
          <p className="mt-1 text-xs font-medium text-stone-600">{offer.entidadResponsable}</p>
        </Card>
      ))}
    </div>
  );
}
