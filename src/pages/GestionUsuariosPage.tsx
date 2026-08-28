import { useUsers } from '../features/users/api';
import { Badge, Card } from '../components/ui';
import { ROLE_LABELS } from '../types/user';

export function GestionUsuariosPage() {
  const { users, loading } = useUsers();

  return (
    <div>
      <h1 className="mb-1 text-xl font-bold text-stone-900">Gestión de usuarios</h1>
      <p className="mb-4 text-sm text-stone-500">Cuentas registradas en la plataforma y su rol.</p>

      {loading ? (
        <p className="text-stone-400">Cargando…</p>
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead>
              <tr className="border-b border-stone-200 text-xs uppercase tracking-wide text-stone-400">
                <th className="py-2 pr-4 font-medium">Nombre</th>
                <th className="py-2 pr-4 font-medium">Municipio</th>
                <th className="py-2 pr-4 font-medium">Rol</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.uid} className="border-b border-stone-100 last:border-0">
                  <td className="py-3 pr-4 font-medium text-stone-800">{u.displayName || '—'}</td>
                  <td className="py-3 pr-4 text-stone-600">{u.municipio || '—'}</td>
                  <td className="py-3 pr-4">
                    <Badge tone={u.role === 'admin' ? 'media' : 'success'}>{ROLE_LABELS[u.role]}</Badge>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={3} className="py-6 text-center text-stone-400">
                    Aún no hay usuarios registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
