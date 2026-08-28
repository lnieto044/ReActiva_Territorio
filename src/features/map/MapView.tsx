import { useState } from 'react';
import { APIProvider, Map, InfoWindow } from '@vis.gl/react-google-maps';
import { Link } from 'react-router-dom';
import { MapPlaceholder } from './MapPlaceholder';
import { CaseMarker, COLOR_BY_NIVEL } from './CaseMarker';
import { PriorityBadge } from '../cases/PriorityBadge';
import { CATEGORIA_LABELS, ESTADO_CASO_LABELS } from '../../types/case';
import type { CasoAfectado } from '../../types/case';

const DEFAULT_CENTER = { lat: 4.97, lng: -76.26 }; // San José del Palmar, Chocó

const LEYENDA = [
  { label: 'Prioridad alta', color: COLOR_BY_NIVEL.alta },
  { label: 'Prioridad media', color: COLOR_BY_NIVEL.media },
  { label: 'Prioridad regular / sin priorizar', color: COLOR_BY_NIVEL.regular },
];

function Legend() {
  return (
    <div
      className="absolute bottom-3 left-3 z-10 rounded-lg bg-white/95 px-3 py-2.5 shadow-md backdrop-blur-sm"
      style={{ border: '1px solid #E2E5E4' }}
    >
      <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-stone-500">Prioridad del caso</p>
      <ul className="space-y-1">
        {LEYENDA.map((item) => (
          <li key={item.label} className="flex items-center gap-2 text-xs text-stone-700">
            <span className="h-2.5 w-2.5 flex-shrink-0 rounded-full border border-white shadow-sm" style={{ backgroundColor: item.color }} />
            {item.label}
          </li>
        ))}
      </ul>
    </div>
  );
}

function CasoPreview({ caso, onClose }: { caso: CasoAfectado; onClose: () => void }) {
  if (!caso.ubicacion) return null;
  return (
    <InfoWindow position={caso.ubicacion} onCloseClick={onClose} maxWidth={260}>
      <div className="min-w-[200px] py-1">
        <p className="font-semibold text-stone-900">{caso.nombreReportante}</p>
        <p className="text-xs text-stone-500">{caso.vereda}, {caso.municipio}</p>
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <PriorityBadge prioridad={caso.prioridad} />
          <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[11px] font-medium text-stone-600">
            {ESTADO_CASO_LABELS[caso.estado]}
          </span>
        </div>
        <p className="mt-1.5 text-xs text-stone-500">Necesita: {CATEGORIA_LABELS[caso.categoria]}</p>
        <Link to={`/casos/${caso.id}`} className="mt-2 inline-block text-xs font-semibold" style={{ color: '#0B7C72' }}>
          Ver detalle completo →
        </Link>
      </div>
    </InfoWindow>
  );
}

export function MapView({ cases }: { cases: CasoAfectado[] }) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const [selected, setSelected] = useState<CasoAfectado | null>(null);

  if (!apiKey) {
    return <MapPlaceholder cases={cases} />;
  }

  return (
    <div className="relative h-[70vh] overflow-hidden rounded-xl border border-stone-200">
      <APIProvider apiKey={apiKey}>
        <Map
          mapId="DEMO_MAP_ID"
          defaultCenter={DEFAULT_CENTER}
          defaultZoom={11}
          gestureHandling="greedy"
          disableDefaultUI={false}
          onClick={() => setSelected(null)}
        >
          {cases.map((caso) => (
            <CaseMarker key={caso.id} caso={caso} onSelect={setSelected} />
          ))}
          {selected && <CasoPreview caso={selected} onClose={() => setSelected(null)} />}
        </Map>
      </APIProvider>
      <Legend />
    </div>
  );
}
