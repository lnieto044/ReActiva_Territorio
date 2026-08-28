import type { Timestamp } from 'firebase/firestore';

export type UserRole = 'lider_comunitario' | 'organizacion' | 'admin';

export interface AppUser {
  uid: string;
  displayName: string;
  role: UserRole;
  organizacionNombre?: string;
  municipio?: string;
  createdAt: Timestamp;
}

export const ROLE_LABELS: Record<UserRole, string> = {
  lider_comunitario: 'Líder comunitario / persona afectada',
  organizacion: 'Empresa, entidad u organización',
  admin: 'Coordinación (admin)',
};

// 'admin' is intentionally excluded — it is not something a user should be
// able to grant themselves at signup. See permissions.ts / InicioPage.
export const SELECTABLE_ROLES: UserRole[] = ['lider_comunitario', 'organizacion'];
