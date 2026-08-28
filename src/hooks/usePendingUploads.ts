import { useEffect, useState } from 'react';
import { getPendingCount, subscribePendingUploads } from '../lib/offlineQueue';

export function usePendingUploads(): number {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const refresh = () => {
      void getPendingCount().then((value) => {
        if (!cancelled) setCount(value);
      });
    };
    refresh();
    return subscribePendingUploads(refresh);
  }, []);

  return count;
}
