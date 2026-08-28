import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { useAuth } from '../context/AuthContext';
import { Card, Button, Field, Input } from '../components/ui';
import { MailIcon, ShieldCheckIcon } from '../components/icons';
import { validacionEsProps } from '../lib/validationEs';
import {
  factoresInscritos,
  iniciarInscripcionTotp,
  urlCodigoQr,
  confirmarInscripcionTotp,
  eliminarFactor,
  reautenticar,
  enviarVerificacionCorreo,
  requiereReautenticacion,
  type MultiFactorInfo,
  type TotpSecret,
} from '../lib/mfa';

export function SeguridadPage() {
  const { user } = useAuth();
  const [factores, setFactores] = useState<MultiFactorInfo[]>([]);
  const [cargando, setCargando] = useState(true);
  const [inscribiendo, setInscribiendo] = useState(false);
  const [secret, setSecret] = useState<TotpSecret | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [codigo, setCodigo] = useState('');
  const [nombreDispositivo, setNombreDispositivo] = useState('Mi teléfono');
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [procesando, setProcesando] = useState(false);
  const [pidiendoPassword, setPidiendoPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [accionPendiente, setAccionPendiente] = useState<(() => Promise<void>) | null>(null);

  useEffect(() => {
    if (!user) return;
    setFactores(factoresInscritos(user));
    setCargando(false);
  }, [user]);

  // Si Firebase pide reautenticación reciente (enroll/unenroll lo exigen),
  // guardamos la acción que estábamos haciendo, pedimos la contraseña, y la
  // reintentamos automáticamente en cuanto se confirma.
  async function conReintentoSiHaceFalta(accion: () => Promise<void>) {
    try {
      await accion();
    } catch (err) {
      if (requiereReautenticacion(err)) {
        setAccionPendiente(() => accion);
        setPidiendoPassword(true);
        return;
      }
      throw err;
    }
  }

  async function iniciarInscripcion() {
    if (!user) return;
    setError('');
    setProcesando(true);
    try {
      await conReintentoSiHaceFalta(async () => {
        const nuevoSecret = await iniciarInscripcionTotp(user);
        const url = urlCodigoQr(nuevoSecret, user.email ?? 'usuario');
        const dataUrl = await QRCode.toDataURL(url, { width: 220, margin: 1 });
        setSecret(nuevoSecret);
        setQrDataUrl(dataUrl);
        setInscribiendo(true);
      });
    } catch {
      setError('No pudimos iniciar la inscripción. Intenta de nuevo.');
    } finally {
      setProcesando(false);
    }
  }

  async function confirmarInscripcion(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !secret) return;
    setError('');
    setProcesando(true);
    try {
      await conReintentoSiHaceFalta(() => confirmarInscripcionTotp(user, secret, codigo, nombreDispositivo.trim() || 'Mi dispositivo'));
      setFactores(factoresInscritos(user));
      cancelarInscripcion();
      setMensaje('Verificación en dos pasos activada correctamente.');
    } catch {
      setError('Código incorrecto. Revisa la hora de tu dispositivo e intenta de nuevo.');
    } finally {
      setProcesando(false);
    }
  }

  function cancelarInscripcion() {
    setInscribiendo(false);
    setSecret(null);
    setQrDataUrl('');
    setCodigo('');
  }

  async function quitarFactor(factor: MultiFactorInfo) {
    if (!user) return;
    setError('');
    setMensaje('');
    setProcesando(true);
    try {
      await conReintentoSiHaceFalta(() => eliminarFactor(user, factor));
      setFactores(factoresInscritos(user));
      setMensaje('Se quitó el segundo factor de tu cuenta.');
    } catch {
      setError('No pudimos quitar el segundo factor. Intenta de nuevo.');
    } finally {
      setProcesando(false);
    }
  }

  async function enviarVerificacion() {
    if (!user) return;
    setError('');
    setProcesando(true);
    try {
      await enviarVerificacionCorreo(user);
      setMensaje('Te enviamos un correo de verificación. Revisa tu bandeja y luego actualiza esta página.');
    } catch {
      setError('No pudimos enviar el correo. Intenta de nuevo en unos minutos.');
    } finally {
      setProcesando(false);
    }
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !accionPendiente) return;
    setError('');
    setProcesando(true);
    try {
      await reautenticar(user, password);
      setPidiendoPassword(false);
      setPassword('');
      const accion = accionPendiente;
      setAccionPendiente(null);
      await accion();
    } catch {
      setError('Contraseña incorrecta.');
    } finally {
      setProcesando(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div>
        <h1 className="text-xl font-bold text-stone-900">Seguridad de tu cuenta</h1>
        <p className="mt-1 text-sm text-stone-500">
          Verificación en dos pasos con una app de autenticación (Google Authenticator, Authy, etc.).
        </p>
      </div>

      {mensaje && (
        <div className="rounded-lg p-3 text-sm font-medium" style={{ background: '#F2FBFA', color: '#0B7C72', border: '1px solid #D3EEEA' }}>
          {mensaje}
        </div>
      )}
      {error && (
        <div className="rounded-lg p-3 text-sm font-medium" style={{ background: '#FDF2F1', color: '#B3261E', border: '1px solid #F3B4AE' }}>
          {error}
        </div>
      )}

      {cargando ? (
        <Card>
          <p className="text-sm text-stone-400">Cargando…</p>
        </Card>
      ) : !user?.emailVerified ? (
        <Card>
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg" style={{ background: '#FDF1DE', color: '#9A5B0E' }}>
              <MailIcon width={18} height={18} />
            </div>
            <div>
              <p className="font-semibold text-stone-900">Verifica tu correo primero</p>
              <p className="mt-1 text-sm text-stone-500">
                Por seguridad, Firebase requiere que tu correo esté verificado antes de activar un segundo factor.
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <Button onClick={enviarVerificacion} disabled={procesando}>
                  {procesando ? 'Enviando…' : 'Enviar correo de verificación'}
                </Button>
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="text-sm font-semibold"
                  style={{ color: '#0B7C72', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  Ya lo verifiqué, actualizar
                </button>
              </div>
            </div>
          </div>
        </Card>
      ) : inscribiendo && secret ? (
        <Card>
          <p className="mb-1 font-semibold text-stone-900">Escanea el código QR</p>
          <p className="mb-4 text-sm text-stone-500">
            Abre Google Authenticator (u otra app TOTP), agrega una cuenta nueva y escanea este código.
          </p>
          <div className="flex justify-center">
            {qrDataUrl && (
              <img
                src={qrDataUrl}
                alt="Código QR para configurar la verificación en dos pasos"
                width={220}
                height={220}
                className="rounded-lg border border-stone-200"
              />
            )}
          </div>
          <details className="mt-4">
            <summary className="cursor-pointer text-sm font-semibold" style={{ color: '#0B7C72' }}>
              ¿No puedes escanear? Ingresa la clave manualmente
            </summary>
            <p className="mt-2 break-all rounded-lg bg-stone-50 p-3 font-mono text-xs">{secret.secretKey}</p>
          </details>

          <form onSubmit={confirmarInscripcion} className="mt-6 space-y-4" {...validacionEsProps}>
            <Field label="Nombre del dispositivo (opcional)">
              <Input value={nombreDispositivo} onChange={(e) => setNombreDispositivo(e.target.value)} placeholder="Mi teléfono" />
            </Field>
            <Field label="Código de 6 dígitos">
              <Input
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                required
                value={codigo}
                onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                style={{ letterSpacing: 4, fontWeight: 700 }}
              />
            </Field>
            <div className="flex gap-2">
              <Button type="submit" disabled={procesando || codigo.length !== 6}>
                {procesando ? 'Confirmando…' : 'Confirmar y activar'}
              </Button>
              <Button type="button" variant="secondary" onClick={cancelarInscripcion}>
                Cancelar
              </Button>
            </div>
          </form>
        </Card>
      ) : factores.length > 0 ? (
        <Card>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg" style={{ background: '#EAF6F4', color: '#0B7C72' }}>
              <ShieldCheckIcon width={18} height={18} />
            </div>
            <div>
              <p className="font-semibold text-stone-900">Verificación en dos pasos activada</p>
              <p className="text-sm text-stone-500">Tu cuenta está protegida con un segundo factor.</p>
            </div>
          </div>
          <ul className="mt-5 divide-y divide-stone-100">
            {factores.map((f) => (
              <li key={f.uid} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-stone-800">{f.displayName || 'Dispositivo sin nombre'}</p>
                  <p className="text-xs text-stone-400">Agregado el {new Date(f.enrollmentTime).toLocaleDateString('es-CO')}</p>
                </div>
                <Button variant="ghost" onClick={() => quitarFactor(f)} disabled={procesando}>
                  Quitar
                </Button>
              </li>
            ))}
          </ul>
        </Card>
      ) : (
        <Card>
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg" style={{ background: '#EAF6F4', color: '#0B7C72' }}>
              <ShieldCheckIcon width={18} height={18} />
            </div>
            <div>
              <p className="font-semibold text-stone-900">Verificación en dos pasos no está activada</p>
              <p className="mt-1 text-sm text-stone-500">
                Agrega una capa extra de seguridad: además de tu contraseña, vas a necesitar un código de tu app de
                autenticación para iniciar sesión.
              </p>
              <Button className="mt-4" onClick={iniciarInscripcion} disabled={procesando}>
                {procesando ? 'Generando…' : 'Activar verificación en dos pasos'}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {pidiendoPassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(16,24,32,0.5)' }}>
          <Card className="w-full max-w-sm">
            <p className="mb-1 font-semibold text-stone-900">Confirma tu contraseña</p>
            <p className="mb-4 text-sm text-stone-500">Por seguridad, necesitamos que confirmes tu contraseña para continuar.</p>
            <form onSubmit={handlePasswordSubmit} className="space-y-4" {...validacionEsProps}>
              <Input
                type="password"
                required
                autoFocus
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Tu contraseña"
              />
              <div className="flex gap-2">
                <Button type="submit" disabled={procesando}>
                  {procesando ? 'Verificando…' : 'Confirmar'}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setPidiendoPassword(false);
                    setAccionPendiente(null);
                    setPassword('');
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
