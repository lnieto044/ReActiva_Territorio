import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { verifyResetCode, confirmNewPassword } from '../lib/firebase';
import { AuthInput } from '../components/AuthField';
import { LockIcon } from '../components/icons';
import { validacionEsProps } from '../lib/validationEs';

type Status = 'checking' | 'valid' | 'invalid' | 'done';

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const oobCode = searchParams.get('oobCode') ?? '';

  const [status, setStatus] = useState<Status>('checking');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!oobCode) {
      setStatus('invalid');
      return;
    }
    verifyResetCode(oobCode)
      .then((mail) => {
        setEmail(mail);
        setStatus('valid');
      })
      .catch(() => setStatus('invalid'));
  }, [oobCode]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    setSubmitting(true);
    try {
      await confirmNewPassword(oobCode, password);
      setStatus('done');
    } catch {
      setError('No pudimos cambiar tu contraseña. El enlace pudo haber expirado — solicita uno nuevo.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen w-full flex-col lg:flex-row" style={{ background: '#FFFFFF' }}>
      <div
        className="w-full p-5 lg:w-[38%] lg:p-14"
        style={{
          position: 'relative',
          background: 'linear-gradient(155deg, #1B3556 0%, #10233D 100%)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: 24,
          overflow: 'hidden',
        }}
      >
        <div className="hidden lg:block" style={{ position: 'absolute', width: 380, height: 380, borderRadius: '50%', background: 'radial-gradient(circle, rgba(245,166,35,0.35) 0%, rgba(245,166,35,0) 70%)', filter: 'blur(10px)', top: -120, right: -100 }} />
        <div className="hidden lg:block" style={{ position: 'absolute', width: 360, height: 360, borderRadius: '50%', background: 'radial-gradient(circle, rgba(14,148,136,0.5) 0%, rgba(14,148,136,0) 70%)', filter: 'blur(10px)', bottom: -140, left: -100 }} />

        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 20px rgba(0,0,0,0.25)', flexShrink: 0 }} className="lg:h-14 lg:w-14 lg:rounded-2xl">
            <img src="/logo-icon.png" alt="" style={{ width: 26, height: 26, objectFit: 'contain' }} className="lg:h-[38px] lg:w-[38px]" />
          </div>
          <span style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 800, fontSize: 18, color: '#FFFFFF' }} className="lg:text-[22px]">ReActiva Territorio</span>
        </div>

        <div className="relative hidden max-w-[340px] lg:block">
          <h1 className="text-xl lg:text-3xl" style={{ fontWeight: 800, color: '#FFFFFF', lineHeight: 1.25 }}>Recupera tu acceso.</h1>
          <p className="mt-3 text-sm" style={{ lineHeight: 1.6, color: 'rgba(255,255,255,0.75)' }}>
            Define una nueva contraseña para volver a coordinar la recuperación de tu territorio.
          </p>
        </div>

        <div className="relative hidden text-xs lg:block" style={{ color: 'rgba(255,255,255,0.55)' }}>© ReActiva Territorio — Plataforma de recuperación territorial</div>
      </div>

      <div className="flex w-full items-center justify-center p-8 lg:w-[62%] lg:p-14">
        <div className="w-full max-w-[380px]">
          {status === 'checking' && <p style={{ fontSize: 14, color: '#647079' }}>Verificando enlace…</p>}

          {status === 'invalid' && (
            <>
              <h2 style={{ fontSize: 26, fontWeight: 800 }}>Enlace no válido</h2>
              <p style={{ marginTop: 8, marginBottom: 24, fontSize: 14, color: '#647079' }}>
                Este enlace ya expiró o ya fue usado. Solicita uno nuevo desde la pantalla de inicio de sesión.
              </p>
              <Link
                to="/login"
                className="inline-block rounded-lg px-5 py-3 text-sm font-bold text-white transition-transform hover:-translate-y-0.5"
                style={{ background: '#0E9488' }}
              >
                Volver a iniciar sesión
              </Link>
            </>
          )}

          {status === 'done' && (
            <>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full" style={{ background: '#0E9488' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
              </div>
              <h2 style={{ fontSize: 26, fontWeight: 800 }}>Contraseña actualizada</h2>
              <p style={{ marginTop: 8, marginBottom: 24, fontSize: 14, color: '#647079' }}>
                Ya puedes iniciar sesión con tu nueva contraseña.
              </p>
              <Link
                to="/login"
                className="inline-block rounded-lg px-5 py-3 text-sm font-bold text-white transition-transform hover:-translate-y-0.5"
                style={{ background: '#0E9488' }}
              >
                Iniciar sesión
              </Link>
            </>
          )}

          {status === 'valid' && (
            <form onSubmit={handleSubmit} {...validacionEsProps}>
              <h2 style={{ fontSize: 26, fontWeight: 800 }}>Elige una nueva contraseña</h2>
              <p style={{ marginTop: 8, marginBottom: 24, fontSize: 14, color: '#647079' }}>
                Para la cuenta <strong>{email}</strong>.
              </p>

              {error && <p style={{ marginBottom: 16, fontSize: 13, color: '#B3261E', fontWeight: 600 }}>{error}</p>}

              <div style={{ marginBottom: 18 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Nueva contraseña</label>
                <AuthInput icon={LockIcon} type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
              </div>

              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Confirmar contraseña</label>
                <AuthInput icon={LockIcon} type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full transition-transform duration-150 hover:-translate-y-0.5 disabled:opacity-60"
                style={{ padding: 13, border: 'none', borderRadius: 10, background: '#0E9488', color: '#FFFFFF', fontFamily: 'Manrope, sans-serif', fontWeight: 700, fontSize: 15, cursor: 'pointer', boxShadow: '0 10px 20px rgba(14,148,136,0.28)' }}
              >
                {submitting ? 'Guardando…' : 'Cambiar contraseña'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
