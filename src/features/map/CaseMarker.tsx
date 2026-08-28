import { AdvancedMarker } from '@vis.gl/react-google-maps';
import { useNavigate } from 'react-router-dom';
import type { CasoAfectado } from '../../types/case';

const COLOR_BY_NIVEL: Record<string, string> = {
  alta: '#dc2626',
  media: '#d97706',
  regular: '#78716c',
};

export function CaseMarker({ caso }: { caso: CasoAfectado }) {
  const navigate = useNavigate();
  if (!caso.ubicacion) return null;
  const color = caso.prioridad ? COLOR_BY_NIVEL[caso.prioridad.nivel] : '#78716c';

  return (
    <AdvancedMarker
      position={caso.ubicacion}
      title={`${caso.nombreReportante} — ${caso.vereda}`}
      onClick={() => navigate(`/casos/${caso.id}`)}
    >
      <div
        style={{ backgroundColor: color }}
        className="h-4 w-4 rounded-full border-2 border-white shadow"
      />
    </AdvancedMarker>
  );
}
