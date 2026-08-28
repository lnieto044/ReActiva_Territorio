import { Link } from 'react-router-dom';
import { Badge, Card } from '../../components/ui';
import { PriorityBadge } from './PriorityBadge';
import { CATEGORIA_LABELS, ESTADO_CASO_LABELS, type CasoAfectado } from '../../types/case';

export function CaseCard({ caso }: { caso: CasoAfectado }) {
  return (
    <Link to={`/casos/${caso.id}`}>
      <Card className="transition hover:border-emerald-400 hover:shadow-md">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-semibold text-stone-900">{caso.nombreReportante}</p>
            <p className="text-sm text-stone-500">
              {caso.vereda}, {caso.municipio}
            </p>
          </div>
          <PriorityBadge prioridad={caso.prioridad} />
        </div>
        <p className="mt-2 line-clamp-2 text-sm text-stone-600">{caso.descripcion}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Badge tone="neutral">{CATEGORIA_LABELS[caso.categoria]}</Badge>
          <Badge tone={caso.estado === 'verificado' || caso.estado === 'atendido' ? 'success' : 'neutral'}>
            {ESTADO_CASO_LABELS[caso.estado]}
          </Badge>
        </div>
      </Card>
    </Link>
  );
}
