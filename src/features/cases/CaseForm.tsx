import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Field, IconField, Input, Select, TextArea } from '../../components/ui';
import { CATEGORIA_LABELS, type CategoriaAyuda } from '../../types/case';
import { useAuth } from '../../context/AuthContext';
import { createCase, type CaseFormValues } from './api';
import { PhotoUploader } from './PhotoUploader';
import { validacionEsProps } from '../../lib/validationEs';
import {
  UserIcon,
  PhoneIcon,
  MapPinIcon,
  LayersIcon,
  ShieldCheckIcon,
  BoxIcon,
  MessageIcon,
  UsersIcon,
  BuildingIcon,
  DollarIcon,
} from '../../components/icons';

const CATEGORIAS = Object.keys(CATEGORIA_LABELS) as CategoriaAyuda[];

const initialValues: CaseFormValues = {
  nombreReportante: '',
  telefono: '',
  municipio: '',
  vereda: '',
  ubicacion: null,
  tipoAfectacion: 'negocio',
  categoria: 'materiales_construccion',
  descripcion: '',
  personasAfectadas: 1,
  actividadEconomica: '',
  ingresosAprox: undefined,
  perdidaTotalIngresos: false,
  interrupcionServicioEsencial: false,
  personasVulnerablesACargo: 0,
  nivelAfectacionInmueble: 'parcial',
  aislamientoGeografico: false,
  ayudaNecesitada: [],
  ayudasRecibidas: [],
};

export function CaseForm() {
  const { uid, displayName } = useAuth();
  const navigate = useNavigate();
  const [values, setValues] = useState<CaseFormValues>({
    ...initialValues,
    nombreReportante: displayName,
  });
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [locating, setLocating] = useState(false);

  function update<K extends keyof CaseFormValues>(key: K, value: CaseFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function toggleAyudaNecesitada(categoria: CategoriaAyuda) {
    setValues((prev) => ({
      ...prev,
      ayudaNecesitada: prev.ayudaNecesitada.includes(categoria)
        ? prev.ayudaNecesitada.filter((c) => c !== categoria)
        : [...prev.ayudaNecesitada, categoria],
    }));
  }

  function useMyLocation() {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        update('ubicacion', { lat: position.coords.latitude, lng: position.coords.longitude });
        setLocating(false);
      },
      () => setLocating(false),
      { timeout: 10_000 },
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!uid) return;
    setSubmitting(true);
    try {
      const { clientId, wasOffline } = await createCase(uid, values, photoFiles);
      navigate(`/casos/${clientId}`, { state: { justCreated: true, wasOffline } });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-6" {...validacionEsProps}>
      <Card className="space-y-4 transition-shadow hover:shadow-md">
        <h2 className="text-lg font-semibold text-stone-900">Datos del afectado</h2>
        <IconField label="Nombre del afectado o negocio" icon={UserIcon}>
          <Input
            required
            className="pl-9"
            value={values.nombreReportante}
            onChange={(e) => update('nombreReportante', e.target.value)}
          />
        </IconField>
        <IconField label="Número de contacto" icon={PhoneIcon}>
          <Input
            required
            className="pl-9"
            value={values.telefono}
            onChange={(e) => update('telefono', e.target.value)}
          />
        </IconField>
        <div className="grid grid-cols-2 gap-4">
          <IconField label="Municipio" icon={MapPinIcon}>
            <Input
              required
              className="pl-9"
              value={values.municipio}
              onChange={(e) => update('municipio', e.target.value)}
            />
          </IconField>
          <IconField label="Vereda / corregimiento" icon={MapPinIcon}>
            <Input required className="pl-9" value={values.vereda} onChange={(e) => update('vereda', e.target.value)} />
          </IconField>
        </div>
        <Field label="Ubicación">
          <div className="flex items-center gap-3">
            <Button type="button" variant="secondary" onClick={useMyLocation} disabled={locating}>
              {locating ? 'Obteniendo ubicación…' : 'Usar mi ubicación actual'}
            </Button>
            {values.ubicacion && (
              <span className="text-xs text-stone-500">
                {values.ubicacion.lat.toFixed(4)}, {values.ubicacion.lng.toFixed(4)}
              </span>
            )}
          </div>
        </Field>
      </Card>

      <Card className="space-y-4 transition-shadow hover:shadow-md">
        <h2 className="text-lg font-semibold text-stone-900">Afectación</h2>
        <div className="grid grid-cols-2 gap-4">
          <IconField label="Tipo de afectación" icon={LayersIcon}>
            <Select
              className="pl-9"
              value={values.tipoAfectacion}
              onChange={(e) => update('tipoAfectacion', e.target.value as CaseFormValues['tipoAfectacion'])}
            >
              <option value="vivienda">Vivienda</option>
              <option value="negocio">Negocio</option>
              <option value="infraestructura_comunitaria">Infraestructura comunitaria</option>
              <option value="otro">Otro</option>
            </Select>
          </IconField>
          <IconField label="Nivel de afectación del inmueble" icon={ShieldCheckIcon}>
            <Select
              className="pl-9"
              value={values.nivelAfectacionInmueble}
              onChange={(e) =>
                update('nivelAfectacionInmueble', e.target.value as CaseFormValues['nivelAfectacionInmueble'])
              }
            >
              <option value="total">Total</option>
              <option value="parcial">Parcial</option>
              <option value="leve">Leve</option>
            </Select>
          </IconField>
        </div>
        <IconField label="Categoría principal de la necesidad" icon={BoxIcon}>
          <Select
            className="pl-9"
            value={values.categoria}
            onChange={(e) => update('categoria', e.target.value as CategoriaAyuda)}
          >
            {CATEGORIAS.map((c) => (
              <option key={c} value={c}>
                {CATEGORIA_LABELS[c]}
              </option>
            ))}
          </Select>
        </IconField>
        <IconField label="Descripción de la necesidad" icon={MessageIcon}>
          <TextArea
            required
            rows={3}
            className="pl-9"
            value={values.descripcion}
            onChange={(e) => update('descripcion', e.target.value)}
          />
        </IconField>
        <Field label="Fotografías">
          <PhotoUploader files={photoFiles} onChange={setPhotoFiles} />
        </Field>
      </Card>

      <Card className="space-y-4 transition-shadow hover:shadow-md">
        <h2 className="text-lg font-semibold text-stone-900">Contexto socioeconómico</h2>
        <div className="grid grid-cols-2 gap-4">
          <IconField label="Personas afectadas" icon={UsersIcon}>
            <Input
              type="number"
              min={1}
              className="pl-9"
              value={values.personasAfectadas}
              onChange={(e) => update('personasAfectadas', Number(e.target.value))}
            />
          </IconField>
          <IconField label="Personas vulnerables a cargo" icon={ShieldCheckIcon}>
            <Input
              type="number"
              min={0}
              className="pl-9"
              value={values.personasVulnerablesACargo}
              onChange={(e) => update('personasVulnerablesACargo', Number(e.target.value))}
            />
          </IconField>
        </div>
        <IconField label="Actividad económica (si aplica)" icon={BuildingIcon}>
          <Input
            className="pl-9"
            value={values.actividadEconomica}
            onChange={(e) => update('actividadEconomica', e.target.value)}
          />
        </IconField>
        <IconField label="Ingresos aproximados antes del sismo (opcional)" icon={DollarIcon}>
          <Input
            type="number"
            min={0}
            className="pl-9"
            value={values.ingresosAprox ?? ''}
            onChange={(e) => update('ingresosAprox', e.target.value ? Number(e.target.value) : undefined)}
          />
        </IconField>
        <div className="space-y-2">
          <label className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-stone-700 transition-colors hover:bg-stone-50">
            <input
              type="checkbox"
              className="h-4 w-4 accent-emerald-700"
              checked={values.perdidaTotalIngresos}
              onChange={(e) => update('perdidaTotalIngresos', e.target.checked)}
            />
            Perdió totalmente su fuente de ingresos
          </label>
          <label className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-stone-700 transition-colors hover:bg-stone-50">
            <input
              type="checkbox"
              className="h-4 w-4 accent-emerald-700"
              checked={values.interrupcionServicioEsencial}
              onChange={(e) => update('interrupcionServicioEsencial', e.target.checked)}
            />
            Se interrumpió un servicio esencial (salud, agua, etc.)
          </label>
          <label className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-stone-700 transition-colors hover:bg-stone-50">
            <input
              type="checkbox"
              className="h-4 w-4 accent-emerald-700"
              checked={values.aislamientoGeografico}
              onChange={(e) => update('aislamientoGeografico', e.target.checked)}
            />
            Vereda con aislamiento geográfico / difícil acceso
          </label>
        </div>
      </Card>

      <Card className="space-y-3 transition-shadow hover:shadow-md">
        <h2 className="text-lg font-semibold text-stone-900">Ayuda que necesita</h2>
        <div className="flex flex-wrap gap-2">
          {CATEGORIAS.map((c) => (
            <label
              key={c}
              className={`cursor-pointer rounded-full border px-3 py-1 text-sm transition-all hover:-translate-y-0.5 ${
                values.ayudaNecesitada.includes(c)
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-800 shadow-sm'
                  : 'border-stone-300 text-stone-600'
              }`}
            >
              <input
                type="checkbox"
                className="hidden"
                checked={values.ayudaNecesitada.includes(c)}
                onChange={() => toggleAyudaNecesitada(c)}
              />
              {CATEGORIA_LABELS[c]}
            </label>
          ))}
        </div>
      </Card>

      <Button type="submit" disabled={submitting} className="w-full">
        {submitting ? 'Guardando…' : 'Registrar reporte'}
      </Button>
    </form>
  );
}
