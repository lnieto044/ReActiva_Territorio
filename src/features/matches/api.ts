import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  writeBatch,
  arrayUnion,
  increment,
  Timestamp,
  type FirestoreError,
} from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { db } from '../../lib/firebase';
import { ESTADO_MATCH_PIPELINE, type Coincidencia, type EstadoMatch, type Evidencia } from '../../types/match';

export function useMatches() {
  const [matches, setMatches] = useState<Coincidencia[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<FirestoreError | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'matches'), orderBy('createdAt', 'desc'));
    return onSnapshot(
      q,
      (snapshot) => {
        setMatches(snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Coincidencia));
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      },
    );
  }, []);

  return { matches, loading, error };
}

export function useMatch(matchId: string | undefined) {
  const [match, setMatch] = useState<Coincidencia | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!matchId) {
      setMatch(null);
      setLoading(false);
      return;
    }
    return onSnapshot(doc(db, 'matches', matchId), (snapshot) => {
      setMatch(snapshot.exists() ? ({ id: snapshot.id, ...snapshot.data() } as Coincidencia) : null);
      setLoading(false);
    });
  }, [matchId]);

  return { match, loading };
}

export async function createMatch(caseId: string, offerId: string, scoreCompatibilidad: number, cantidadAsignada: number) {
  const id = crypto.randomUUID();
  await setDoc(doc(db, 'matches', id), {
    id,
    caseId,
    offerId,
    scoreCompatibilidad,
    cantidadAsignada,
    estado: 'sugerida' as EstadoMatch,
    historialEstados: [{ estado: 'sugerida', fecha: Timestamp.now() }],
    evidenciaEntrega: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return id;
}

export function siguienteEstado(actual: EstadoMatch): EstadoMatch | null {
  const index = ESTADO_MATCH_PIPELINE.indexOf(actual);
  if (index === -1 || index === ESTADO_MATCH_PIPELINE.length - 1) return null;
  return ESTADO_MATCH_PIPELINE[index + 1];
}

/**
 * Advances the delivery pipeline. Reaching 'entregada' also flips the case to
 * 'atendido' and bumps the offer's cantidadAsignada, in one batched write so
 * the three documents never drift out of sync with each other.
 */
export async function advanceMatchEstado(
  match: Coincidencia,
  next: EstadoMatch,
  actorUid: string,
  evidencia?: Evidencia,
) {
  const batch = writeBatch(db);

  batch.update(doc(db, 'matches', match.id), {
    estado: next,
    historialEstados: arrayUnion({ estado: next, fecha: Timestamp.now(), por: actorUid }),
    updatedAt: serverTimestamp(),
    ...(evidencia ? { evidenciaEntrega: evidencia } : {}),
  });

  if (next === 'entregada') {
    batch.update(doc(db, 'cases', match.caseId), {
      estado: 'atendido',
      updatedAt: serverTimestamp(),
    });
    batch.update(doc(db, 'offers', match.offerId), {
      cantidadAsignada: increment(match.cantidadAsignada),
      updatedAt: serverTimestamp(),
    });
  }

  await batch.commit();
}

export async function rechazarMatch(matchId: string, actorUid: string) {
  await updateDoc(doc(db, 'matches', matchId), {
    estado: 'rechazada' as EstadoMatch,
    historialEstados: arrayUnion({ estado: 'rechazada', fecha: Timestamp.now(), por: actorUid }),
    updatedAt: serverTimestamp(),
  });
}
