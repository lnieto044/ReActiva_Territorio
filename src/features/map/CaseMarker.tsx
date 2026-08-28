import { AdvancedMarker } from '@vis.gl/react-google-maps';
import type { CasoAfectado } from '../../types/case';

export const COLOR_BY_NIVEL: Record<string, string> = {
  alta: '#dc2626',
  media: '#d97706',
  regular: '#78716c',
};

export function CaseMarker({ caso, onSelect }: { caso: CasoAfectado; onSelect: (caso: CasoAfectado) => void }) {
  if (!caso.ubicacion) return null;
  const color = caso.prioridad ? COLOR_BY_NIVEL[caso.prioridad.nivel] : '#78716c';

  return (
    <AdvancedMarker
      position={caso.ubicacion}
      title={`${caso.nombreReportante} — ${caso.vereda}`}
      onClick={() => onSelect(caso)}
    >
      <div
        style={{ backgroundColor: color }}
        className="h-4 w-4 cursor-pointer rounded-full border-2 border-white shadow"
      />
    </AdvancedMarker>
  );
}
