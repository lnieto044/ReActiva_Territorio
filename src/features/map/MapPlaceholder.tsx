import { Card } from '../../components/ui';
import { PriorityBadge } from '../cases/PriorityBadge';
import type { CasoAfectado } from '../../types/case';

export function MapPlaceholder({ cases }: { cases: CasoAfectado[] }) {
  return (
    <Card>
      <p className="mb-3 text-sm text-stone-600">
        No hay una clave de Google Maps configurada (<code>VITE_GOOGLE_MAPS_API_KEY</code>), así que se
        muestra un listado en lugar del mapa interactivo. La aplicación funciona igual — agrega la
        clave en <code>.env.local</code> para ver el mapa real.
      </p>
      <ul className="divide-y divide-stone-100">
        {cases.map((caso) => (
          <li key={caso.id} className="flex items-center justify-between py-2 text-sm">
            <div>
              <p className="font-medium text-stone-800">
                {caso.nombreReportante} — {caso.vereda}, {caso.municipio}
              </p>
              <p className="text-xs text-stone-400">
                {caso.ubicacion ? `${caso.ubicacion.lat.toFixed(4)}, ${caso.ubicacion.lng.toFixed(4)}` : 'Sin ubicación'}
              </p>
            </div>
            <PriorityBadge prioridad={caso.prioridad} />
          </li>
        ))}
        {cases.length === 0 && <li className="py-4 text-center text-stone-400">Aún no hay casos registrados.</li>}
      </ul>
    </Card>
  );
}
