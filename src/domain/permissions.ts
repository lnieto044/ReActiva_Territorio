import type { UserRole } from '../types/user';
import type { EstadoMatch } from '../types/match';

/**
 * Client-side role gating only — it shapes the UI so each role sees a
 * professional, separation-of-duties experience (líderes verify, entidades
 * deliver). Firestore rules still allow any signed-in user to write; real
 * server-side enforcement per field/role is out of scope for this MVP.
 */

export function puedeReportarCaso(role: UserRole | null): boolean {
  return role === 'lider_comunitario' || role === 'admin';
}

export function puedeVerificarCaso(role: UserRole | null): boolean {
  return role === 'lider_comunitario' || role === 'admin';
}

export function puedePublicarOferta(role: UserRole | null): boolean {
  return role === 'organizacion' || role === 'admin';
}

export function puedeCrearCoincidencia(role: UserRole | null): boolean {
  return role === 'lider_comunitario' || role === 'organizacion' || role === 'admin';
}

// Executing the delivery (aceptada -> ... -> entregada) is the offering
// entity's job; confirming it actually worked (entregada -> verificada) goes
// back to the community side, mirroring the proposal's Paso 12 evidence flow.
export function puedeAvanzarEntrega(role: UserRole | null, destino: EstadoMatch): boolean {
  if (role === 'admin') return true;
  if (destino === 'verificada' || destino === 'cerrada') return role === 'lider_comunitario';
  return role === 'organizacion';
}
