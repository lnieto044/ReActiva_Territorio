import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Badge, Button, Card, Field, Select } from '../components/ui';
import { useCases } from '../features/cases/api';
import { useOffers } from '../features/offers/api';
import { encontrarCoincidencias } from '../domain/matching';
import { createMatch } from '../features/matches/api';

const CASOS_ELEGIBLES = new Set(['verificado', 'atendido']);

export function CoincidenciasPage() {
  const { cases } = useCases();
  const { offers } = useOffers();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [working, setWorking] = useState(false);

  const casosVerificados = useMemo(() => cases.filter((c) => CASOS_ELEGIBLES.has(c.estado)), [cases]);
  const caseId = searchParams.get('caseId') ?? casosVerificados[0]?.id ?? '';
  const casoSeleccionado = casosVerificados.find((c) => c.id === caseId);

  const candidatos = useMemo(
    () => (casoSeleccionado ? encontrarCoincidencias(casoSeleccionado, offers) : []),
    [casoSeleccionado, offers],
  );

  async function handleCrearCoincidencia(offerId: string, score: number) {
    if (!casoSeleccionado) return;
    setWorking(true);
    try {
      const matchId = await createMatch(casoSeleccionado.id, offerId, score, 1);
      navigate(`/seguimiento/${matchId}`);
    } finally {
      setWorking(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-xl font-bold text-stone-900">Coincidencias encontradas</h1>

      <Card>
        <Field label="Caso verificado">
          <Select value={caseId} onChange={(e) => setSearchParams({ caseId: e.target.value })}>
            {casosVerificados.length === 0 && <option value="">No hay casos verificados aún</option>}
            {casosVerificados.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombreReportante} — {c.vereda}, {c.municipio}
              </option>
            ))}
          </Select>
        </Field>
      </Card>

      {casoSeleccionado && (
        <div className="space-y-3">
          {candidatos.length === 0 && (
            <p className="text-sm text-stone-400">No hay ofertas compatibles con este caso todavía.</p>
          )}
          {candidatos.map(({ offer, score, motivos }) => (
            <Card key={offer.id}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium text-stone-800">{offer.descripcion}</p>
                  <p className="text-xs text-stone-500">{offer.entidadResponsable}</p>
                </div>
                <Badge tone="success">{score}% compatible</Badge>
              </div>
              <ul className="mt-1 list-inside list-disc text-xs text-stone-500">
                {motivos.map((m) => (
                  <li key={m}>{m}</li>
                ))}
              </ul>
              <Button className="mt-2" disabled={working} onClick={() => handleCrearCoincidencia(offer.id, score)}>
                Crear coincidencia
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
