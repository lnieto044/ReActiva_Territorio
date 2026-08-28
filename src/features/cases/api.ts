import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  type FirestoreError,
} from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { db } from '../../lib/firebase';
import { enqueuePhoto } from '../../lib/offlineQueue';
import { calcularPrioridad } from '../../domain/priority';
import type { CasoAfectado } from '../../types/case';

export interface CaseFormValues {
  nombreReportante: string;
  telefono: string;
  municipio: string;
  vereda: string;
  ubicacion: { lat: number; lng: number } | null;
  tipoAfectacion: CasoAfectado['tipoAfectacion'];
  categoria: CasoAfectado['categoria'];
  descripcion: string;
  personasAfectadas: number;
  actividadEconomica?: string;
  ingresosAprox?: number;
  perdidaTotalIngresos: boolean;
  interrupcionServicioEsencial: boolean;
  personasVulnerablesACargo: number;
  nivelAfectacionInmueble: CasoAfectado['nivelAfectacionInmueble'];
  aislamientoGeografico: boolean;
  ayudaNecesitada: CasoAfectado['categoria'][];
  ayudasRecibidas: string[];
}

export function useCases() {
  const [cases, setCases] = useState<CasoAfectado[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<FirestoreError | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'cases'), orderBy('createdAt', 'desc'));
    return onSnapshot(
      q,
      (snapshot) => {
        setCases(snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as CasoAfectado));
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      },
    );
  }, []);

  return { cases, loading, error };
}

export function useCase(caseId: string | undefined) {
  const [caso, setCaso] = useState<CasoAfectado | null>(null);
  const [hasPendingWrites, setHasPendingWrites] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!caseId) {
      setCaso(null);
      setLoading(false);
      return;
    }
    return onSnapshot(
      doc(db, 'cases', caseId),
      { includeMetadataChanges: true },
      (snapshot) => {
        setCaso(snapshot.exists() ? ({ id: snapshot.id, ...snapshot.data() } as CasoAfectado) : null);
        setHasPendingWrites(snapshot.metadata.hasPendingWrites);
        setLoading(false);
      },
    );
  }, [caseId]);

  return { caso, hasPendingWrites, loading };
}

/**
 * Uses a client-generated document ID (setDoc, not addDoc) so the UI can
 * navigate to /casos/:id immediately regardless of connectivity, and so the
 * ID doubles as a dedup key if the same offline report is ever retried.
 */
export async function createCase(uid: string, values: CaseFormValues, photoFiles: File[]) {
  const clientId = crypto.randomUUID();
  const wasOffline = typeof navigator !== 'undefined' && !navigator.onLine;

  const payload = {
    ...values,
    id: clientId,
    clientId,
    fotos: [],
    estado: 'pendiente' as const,
    prioridad: null,
    registradoPor: uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  // Fire-and-forget: while offline this Promise won't resolve until the
  // write reaches the server, so we must not await it to know "did it save."
  void setDoc(doc(db, 'cases', clientId), payload);

  for (const file of photoFiles) {
    await enqueuePhoto(clientId, file);
  }

  return { clientId, wasOffline };
}

export async function iniciarVerificacion(caseId: string) {
  await updateDoc(doc(db, 'cases', caseId), {
    estado: 'en_verificacion',
    updatedAt: serverTimestamp(),
  });
}

export async function verificarCaso(caseId: string, verificadoPor: string, caso: CasoAfectado) {
  const prioridad = calcularPrioridad({
    perdidaTotalIngresos: caso.perdidaTotalIngresos,
    interrupcionServicioEsencial: caso.interrupcionServicioEsencial,
    personasVulnerablesACargo: caso.personasVulnerablesACargo,
    nivelAfectacionInmueble: caso.nivelAfectacionInmueble,
    aislamientoGeografico: caso.aislamientoGeografico,
    createdAt: caso.createdAt.toDate(),
  });

  await updateDoc(doc(db, 'cases', caseId), {
    estado: 'verificado',
    prioridad,
    verificadoPor,
    verificadoAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return prioridad;
}
