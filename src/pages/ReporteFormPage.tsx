import { CaseForm } from '../features/cases/CaseForm';
import { RequireRole } from '../components/RequireRole';
import { puedeReportarCaso } from '../domain/permissions';

export function ReporteFormPage() {
  return (
    <div>
      <h1 className="mb-4 text-xl font-bold text-stone-900">Reportar una afectación</h1>
      <RequireRole
        allow={puedeReportarCaso}
        mensaje="Este formulario es para líderes comunitarios o personas afectadas. Si representas una organización, ve a 'Ofertas' para publicar los recursos que tienes disponibles."
      >
        <CaseForm />
      </RequireRole>
    </div>
  );
}
