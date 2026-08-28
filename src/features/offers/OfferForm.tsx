import { useState } from 'react';
import { Button, Card, Field, IconField, Input, Select, TextArea } from '../../components/ui';
import { CATEGORIA_LABELS, type CategoriaAyuda } from '../../types/case';
import { MEDIO_ENTREGA_LABELS, type MedioEntrega } from '../../types/offer';
import { useAuth } from '../../context/AuthContext';
import { createOffer, type OfferFormValues } from './api';
import { BoxIcon, MessageIcon, HashIcon, ClipboardIcon, MapPinIcon, BuildingIcon, TruckIcon, ClockIcon } from '../../components/icons';
import { validacionEsProps } from '../../lib/validationEs';

const CATEGORIAS = Object.keys(CATEGORIA_LABELS) as CategoriaAyuda[];
const MEDIOS = Object.keys(MEDIO_ENTREGA_LABELS) as MedioEntrega[];

export function OfferForm({ onCreated }: { onCreated?: () => void }) {
  const { uid, displayName } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [values, setValues] = useState<OfferFormValues>({
    tipoRecurso: 'materiales_construccion',
    descripcion: '',
    cantidad: 1,
    unidadMedida: 'unidades',
    municipioCobertura: [],
    fechaDisponibilidad: new Date(),
    entidadResponsable: displayName,
    medioEntrega: 'recogida_en_punto',
  });
  const [municipioInput, setMunicipioInput] = useState('');

  function update<K extends keyof OfferFormValues>(key: K, value: OfferFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!uid) return;
    setSubmitting(true);
    try {
      await createOffer(uid, {
        ...values,
        municipioCobertura: municipioInput
          .split(',')
          .map((m) => m.trim())
          .filter(Boolean),
      });
      setValues((prev) => ({ ...prev, descripcion: '', cantidad: 1 }));
      setMunicipioInput('');
      onCreated?.();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} {...validacionEsProps}>
      <Card className="space-y-4 transition-shadow hover:shadow-md">
        <h2 className="text-lg font-semibold text-stone-900">Publicar una oferta</h2>
        <IconField label="Tipo de recurso" icon={BoxIcon}>
          <Select className="pl-9" value={values.tipoRecurso} onChange={(e) => update('tipoRecurso', e.target.value as CategoriaAyuda)}>
            {CATEGORIAS.map((c) => (
              <option key={c} value={c}>
                {CATEGORIA_LABELS[c]}
              </option>
            ))}
          </Select>
        </IconField>
        <IconField label="Descripción" icon={MessageIcon}>
          <TextArea
            required
            rows={2}
            className="pl-9"
            value={values.descripcion}
            onChange={(e) => update('descripcion', e.target.value)}
          />
        </IconField>
        <div className="grid grid-cols-2 gap-4">
          <IconField label="Cantidad disponible" icon={HashIcon}>
            <Input
              type="number"
              min={1}
              className="pl-9"
              value={values.cantidad}
              onChange={(e) => update('cantidad', Number(e.target.value))}
            />
          </IconField>
          <Field label="Unidad de medida">
            <Input value={values.unidadMedida} onChange={(e) => update('unidadMedida', e.target.value)} />
          </Field>
        </div>
        <IconField label="Municipios de cobertura (separados por coma)" icon={MapPinIcon}>
          <Input
            required
            className="pl-9"
            placeholder="San José del Palmar, Nóvita"
            value={municipioInput}
            onChange={(e) => setMunicipioInput(e.target.value)}
          />
        </IconField>
        <IconField label="Entidad responsable" icon={BuildingIcon}>
          <Input
            required
            className="pl-9"
            value={values.entidadResponsable}
            onChange={(e) => update('entidadResponsable', e.target.value)}
          />
        </IconField>
        <IconField label="Medio de entrega" icon={TruckIcon}>
          <Select className="pl-9" value={values.medioEntrega} onChange={(e) => update('medioEntrega', e.target.value as MedioEntrega)}>
            {MEDIOS.map((m) => (
              <option key={m} value={m}>
                {MEDIO_ENTREGA_LABELS[m]}
              </option>
            ))}
          </Select>
        </IconField>
        <IconField label="Requisitos (opcional)" icon={ClipboardIcon}>
          <Input className="pl-9" value={values.requisitos ?? ''} onChange={(e) => update('requisitos', e.target.value)} />
        </IconField>
        <p className="flex items-center gap-1.5 text-xs text-stone-400">
          <ClockIcon width={13} height={13} /> Disponible desde hoy
        </p>
        <Button type="submit" disabled={submitting} className="w-full">
          {submitting ? 'Publicando…' : 'Publicar oferta'}
        </Button>
      </Card>
    </form>
  );
}
