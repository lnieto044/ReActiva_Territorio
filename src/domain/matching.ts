import type { CasoAfectado } from '../types/case';
import type { OfertaRecurso } from '../types/offer';

export interface MatchCandidate {
  offer: OfertaRecurso;
  score: number;
  motivos: string[];
}

/**
 * Rule-based matching: hard filters (category, coverage, availability) decide
 * whether an offer is even a candidate; soft points only rank the candidates
 * that already passed. No AI/ML involved by design (see propuesta, Paso 9).
 */
export function encontrarCoincidencias(
  caso: CasoAfectado,
  ofertas: OfertaRecurso[],
): MatchCandidate[] {
  const candidatos: MatchCandidate[] = [];

  for (const oferta of ofertas) {
    if (oferta.estado === 'agotada' || oferta.estado === 'cerrada') continue;

    const categoriaMatch =
      caso.ayudaNecesitada.includes(oferta.tipoRecurso) || caso.categoria === oferta.tipoRecurso;
    if (!categoriaMatch) continue;

    const disponible = oferta.cantidad - oferta.cantidadAsignada;
    if (disponible <= 0) continue;

    const municipioMatch = oferta.municipioCobertura.includes(caso.municipio);
    if (!municipioMatch) continue;

    let puntos = 0;
    const motivos: string[] = [];

    puntos += 40;
    motivos.push('Categoría de ayuda coincide');

    puntos += 30;
    motivos.push(`Cobertura en ${caso.municipio}`);

    if (oferta.veredaCobertura?.includes(caso.vereda)) {
      puntos += 10;
      motivos.push(`Cobertura específica en ${caso.vereda}`);
    }

    puntos += 20;
    motivos.push(`Cantidad disponible (${disponible} ${oferta.unidadMedida})`);

    if (!oferta.requisitos) {
      puntos += 10;
      motivos.push('Sin requisitos adicionales');
    }

    candidatos.push({
      offer: oferta,
      score: Math.min(100, Math.round((puntos / 110) * 100)),
      motivos,
    });
  }

  return candidatos.sort((a, b) => b.score - a.score);
}
