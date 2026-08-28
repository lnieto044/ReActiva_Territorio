// Verificación en dos pasos (2FA) con TOTP — compatible con Google
// Authenticator, Authy, etc. Requiere que el proyecto Firebase esté
// actualizado a Identity Platform (gratis, es solo una activación) y que el
// correo del usuario esté verificado — Firebase lo exige para poder
// inscribir un segundo factor. No funciona contra el emulador local: la
// generación de secretos TOTP no está implementada ahí (limitación conocida
// de Firebase), así que este flujo solo se puede probar contra el proyecto
// real.
import {
  multiFactor,
  TotpMultiFactorGenerator,
  getMultiFactorResolver,
  sendEmailVerification,
  reauthenticateWithCredential,
  EmailAuthProvider,
  type TotpSecret,
  type MultiFactorResolver,
  type MultiFactorInfo,
  type MultiFactorError,
  type User,
} from 'firebase/auth';
import { auth } from './firebase';

export type { TotpSecret, MultiFactorResolver, MultiFactorInfo };

export function factoresInscritos(user: User): MultiFactorInfo[] {
  return multiFactor(user).enrolledFactors;
}

export async function iniciarInscripcionTotp(user: User): Promise<TotpSecret> {
  const session = await multiFactor(user).getSession();
  return TotpMultiFactorGenerator.generateSecret(session);
}

export function urlCodigoQr(secret: TotpSecret, correo: string): string {
  return secret.generateQrCodeUrl(correo, 'ReActiva Territorio');
}

export async function confirmarInscripcionTotp(user: User, secret: TotpSecret, codigo: string, nombreDispositivo: string): Promise<void> {
  const assertion = TotpMultiFactorGenerator.assertionForEnrollment(secret, codigo);
  await multiFactor(user).enroll(assertion, nombreDispositivo);
}

export async function eliminarFactor(user: User, factor: MultiFactorInfo): Promise<void> {
  await multiFactor(user).unenroll(factor);
}

export async function reautenticar(user: User, password: string): Promise<void> {
  if (!user.email) throw new Error('La cuenta no tiene correo asociado.');
  const credential = EmailAuthProvider.credential(user.email, password);
  await reauthenticateWithCredential(user, credential);
}

export function enviarVerificacionCorreo(user: User): Promise<void> {
  return sendEmailVerification(user);
}

/** true si el error viene del paso "se requiere segundo factor" al iniciar sesión. */
export function esErrorRequiereSegundoFactor(error: unknown): error is MultiFactorError {
  return typeof error === 'object' && error !== null && 'code' in error && (error as { code?: unknown }).code === 'auth/multi-factor-auth-required';
}

export function resolverDesdeError(error: MultiFactorError): MultiFactorResolver {
  return getMultiFactorResolver(auth, error);
}

export async function completarInicioSesionTotp(resolver: MultiFactorResolver, codigo: string) {
  const hint = resolver.hints.find((h) => h.factorId === TotpMultiFactorGenerator.FACTOR_ID);
  if (!hint) throw new Error('Esta cuenta no tiene un segundo factor TOTP inscrito.');
  const assertion = TotpMultiFactorGenerator.assertionForSignIn(hint.uid, codigo);
  return resolver.resolveSignIn(assertion);
}

/** true si el error indica que se necesita reautenticar antes de inscribir/quitar un factor. */
export function requiereReautenticacion(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'code' in error && (error as { code?: unknown }).code === 'auth/requires-recent-login';
}
