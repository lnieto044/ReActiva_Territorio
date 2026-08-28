import { ESTADO_MATCH_LABELS, ESTADO_MATCH_PIPELINE, type EstadoMatch } from '../../types/match';

export function PipelineStepper({ estado }: { estado: EstadoMatch }) {
  const currentIndex = ESTADO_MATCH_PIPELINE.indexOf(estado);

  if (estado === 'rechazada') {
    return <p className="text-sm font-medium text-red-600">Coincidencia rechazada</p>;
  }

  return (
    <ol className="flex flex-wrap items-center gap-2">
      {ESTADO_MATCH_PIPELINE.map((step, index) => (
        <li key={step} className="flex items-center gap-2">
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              index < currentIndex
                ? 'bg-emerald-100 text-emerald-700'
                : index === currentIndex
                  ? 'bg-emerald-700 text-white'
                  : 'bg-stone-100 text-stone-400'
            }`}
          >
            {ESTADO_MATCH_LABELS[step]}
          </span>
          {index < ESTADO_MATCH_PIPELINE.length - 1 && <span className="text-stone-300">→</span>}
        </li>
      ))}
    </ol>
  );
}
