import { Badge } from '../../components/ui';
import type { Prioridad } from '../../types/case';

export function PriorityBadge({ prioridad }: { prioridad: Prioridad | null }) {
  if (!prioridad) return <Badge tone="neutral">Sin priorizar</Badge>;
  const label = { alta: 'Prioridad alta', media: 'Prioridad media', regular: 'Prioridad regular' }[prioridad.nivel];
  return (
    <Badge tone={prioridad.nivel}>
      {label} ({prioridad.score})
    </Badge>
  );
}
