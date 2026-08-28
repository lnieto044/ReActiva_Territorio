import { APIProvider, Map } from '@vis.gl/react-google-maps';
import { MapPlaceholder } from './MapPlaceholder';
import { CaseMarker } from './CaseMarker';
import type { CasoAfectado } from '../../types/case';

const DEFAULT_CENTER = { lat: 4.97, lng: -76.26 }; // San José del Palmar, Chocó

export function MapView({ cases }: { cases: CasoAfectado[] }) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return <MapPlaceholder cases={cases} />;
  }

  return (
    <div className="h-[70vh] overflow-hidden rounded-xl border border-stone-200">
      <APIProvider apiKey={apiKey}>
        <Map
          mapId="DEMO_MAP_ID"
          defaultCenter={DEFAULT_CENTER}
          defaultZoom={11}
          gestureHandling="greedy"
          disableDefaultUI={false}
        >
          {cases.map((caso) => (
            <CaseMarker key={caso.id} caso={caso} />
          ))}
        </Map>
      </APIProvider>
    </div>
  );
}
