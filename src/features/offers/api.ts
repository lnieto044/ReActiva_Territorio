import { collection, doc, onSnapshot, orderBy, query, serverTimestamp, setDoc, type FirestoreError } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { db } from '../../lib/firebase';
import type { OfertaRecurso } from '../../types/offer';

export interface OfferFormValues {
  tipoRecurso: OfertaRecurso['tipoRecurso'];
  descripcion: string;
  cantidad: number;
  unidadMedida: string;
  municipioCobertura: string[];
  veredaCobertura?: string[];
  requisitos?: string;
  fechaDisponibilidad: Date;
  entidadResponsable: string;
  contacto?: string;
  medioEntrega: OfertaRecurso['medioEntrega'];
}

export function useOffers() {
  const [offers, setOffers] = useState<OfertaRecurso[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<FirestoreError | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'offers'), orderBy('createdAt', 'desc'));
    return onSnapshot(
      q,
      (snapshot) => {
        setOffers(snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as OfertaRecurso));
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      },
    );
  }, []);

  return { offers, loading, error };
}

export async function createOffer(uid: string, values: OfferFormValues) {
  const id = crypto.randomUUID();
  await setDoc(doc(db, 'offers', id), {
    ...values,
    id,
    cantidadAsignada: 0,
    estado: 'disponible',
    registradoPor: uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return id;
}
