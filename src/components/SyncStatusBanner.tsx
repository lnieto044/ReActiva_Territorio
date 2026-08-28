import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { usePendingUploads } from '../hooks/usePendingUploads';

export function SyncStatusBanner() {
  const isOnline = useOnlineStatus();
  const pendingCount = usePendingUploads();

  if (isOnline && pendingCount === 0) return null;

  return (
    <div
      className={`px-4 py-2 text-center text-sm font-medium ${
        isOnline ? 'bg-amber-100 text-amber-800' : 'bg-stone-800 text-white'
      }`}
    >
      {!isOnline && 'Sin conexión — los reportes se guardan en este dispositivo y se sincronizarán automáticamente. '}
      {pendingCount > 0 && `${pendingCount} foto(s) pendientes de sincronizar.`}
    </div>
  );
}
