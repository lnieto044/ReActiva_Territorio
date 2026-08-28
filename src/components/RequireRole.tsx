import type { ReactNode } from 'react';
import { useAuth } from '../context/AuthContext';
import { Card } from './ui';

export function RequireRole({
  allow,
  children,
  mensaje,
}: {
  allow: (role: ReturnType<typeof useAuth>['role']) => boolean;
  children: ReactNode;
  mensaje: string;
}) {
  const { role } = useAuth();
  if (allow(role)) return <>{children}</>;

  return (
    <Card className="mx-auto max-w-md text-center">
      <p className="text-stone-600">{mensaje}</p>
    </Card>
  );
}
