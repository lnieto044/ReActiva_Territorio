import { useMemo, useState } from 'react';
import { useCases } from '../features/cases/api';
import { MapView } from '../features/map/MapView';
import { Select } from '../components/ui';
import { CATEGORIA_LABELS, ESTADO_CASO_LABELS, type CategoriaAyuda, type EstadoCaso } from '../types/case';

export function MapaPage() {
  const { cases, loading } = useCases();
  const [estadoFiltro, setEstadoFiltro] = useState<EstadoCaso | 'todos'>('todos');
  const [categoriaFiltro, setCategoriaFiltro] = useState<CategoriaAyuda | 'todas'>('todas');

  const filtered = useMemo(
    () =>
      cases.filter(
        (c) =>
          (estadoFiltro === 'todos' || c.estado === estadoFiltro) &&
          (categoriaFiltro === 'todas' || c.categoria === categoriaFiltro),
      ),
    [cases, estadoFiltro, categoriaFiltro],
  );

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-xl font-bold text-stone-900">Mapa de afectaciones</h1>
        <div className="flex gap-3">
          <Select value={estadoFiltro} onChange={(e) => setEstadoFiltro(e.target.value as EstadoCaso | 'todos')}>
            <option value="todos">Todos los estados</option>
            {(Object.keys(ESTADO_CASO_LABELS) as EstadoCaso[]).map((e) => (
              <option key={e} value={e}>
                {ESTADO_CASO_LABELS[e]}
              </option>
            ))}
          </Select>
          <Select
            value={categoriaFiltro}
            onChange={(e) => setCategoriaFiltro(e.target.value as CategoriaAyuda | 'todas')}
          >
            <option value="todas">Todas las categorías</option>
            {(Object.keys(CATEGORIA_LABELS) as CategoriaAyuda[]).map((c) => (
              <option key={c} value={c}>
                {CATEGORIA_LABELS[c]}
              </option>
            ))}
          </Select>
        </div>
      </div>
      {loading ? <p className="text-stone-400">Cargando casos…</p> : <MapView cases={filtered} />}
    </div>
  );
}
