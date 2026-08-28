import { useState } from 'react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Timestamp } from 'firebase/firestore';
import { storage } from '../../lib/firebase';
import { Button, Field, Input, TextArea } from '../../components/ui';
import type { Evidencia } from '../../types/match';
import { validacionEsProps } from '../../lib/validationEs';

export function EvidenceForm({
  matchId,
  responsableDefault,
  onSubmit,
}: {
  matchId: string;
  responsableDefault: string;
  onSubmit: (evidencia: Evidencia) => Promise<void>;
}) {
  const [responsable, setResponsable] = useState(responsableDefault);
  const [comentario, setComentario] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const fotos: string[] = [];
      if (file) {
        const storageRef = ref(storage, `matches/${matchId}/${crypto.randomUUID()}-${file.name}`);
        await uploadBytes(storageRef, file, { contentType: file.type });
        fotos.push(await getDownloadURL(storageRef));
      }
      let ubicacion: Evidencia['ubicacion'] = null;
      if (navigator.geolocation) {
        ubicacion = await new Promise((resolve) => {
          navigator.geolocation.getCurrentPosition(
            (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
            () => resolve(null),
            { timeout: 8000 },
          );
        });
      }
      await onSubmit({
        fotos,
        ubicacion,
        responsable,
        comentario,
        fecha: Timestamp.now(),
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-lg border border-stone-200 p-4" {...validacionEsProps}>
      <p className="text-sm font-semibold text-stone-800">Registrar evidencia de entrega</p>
      <Field label="Responsable de la entrega">
        <Input required value={responsable} onChange={(e) => setResponsable(e.target.value)} />
      </Field>
      <Field label="Comentario / satisfacción del beneficiario">
        <TextArea rows={2} value={comentario} onChange={(e) => setComentario(e.target.value)} />
      </Field>
      <Field label="Foto de la entrega (opcional)">
        <input type="file" accept="image/*" capture="environment" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
      </Field>
      <Button type="submit" disabled={submitting}>
        {submitting ? 'Guardando…' : 'Confirmar entrega'}
      </Button>
    </form>
  );
}
