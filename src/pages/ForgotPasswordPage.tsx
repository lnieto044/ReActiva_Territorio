import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AuthInput } from '../components/AuthField';
import { MailIcon } from '../components/icons';
import { validacionEsProps } from '../lib/validationEs';

export function ForgotPasswordPage() {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await forgotPassword(email);
      setSent(true);
    } catch {
      setError('No pudimos enviar el correo. Verifica que la dirección sea correcta.');
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
          <h1 className="text-xl lg:text-3xl" style={{ fontWeight: 800, color: '#FFFFFF', lineHeight: 1.25 }}>¿Olvidaste tu contraseña?</h1>
          <p className="mt-3 text-sm" style={{ lineHeight: 1.6, color: 'rgba(255,255,255,0.75)' }}>
            Tranquilo, te enviamos un enlace para que puedas volver a entrar en un par de minutos.
          </p>
        </div>

        <div className="relative hidden text-xs lg:block" style={{ color: 'rgba(255,255,255,0.55)' }}>© ReActiva Territorio — Plataforma de recuperación territorial</div>
      </div>

      <div className="flex w-full items-center justify-center p-8 lg:w-[62%] lg:p-14">
        <div className="w-full max-w-[380px]">
          {sent ? (
            <>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full" style={{ background: '#0E9488' }}>
                <MailIcon width={22} height={22} stroke="#FFFFFF" />
              </div>
              <h2 style={{ fontSize: 26, fontWeight: 800 }}>Revisa tu correo</h2>
              <p style={{ marginTop: 8, marginBottom: 8, fontSize: 14, color: '#647079' }}>
                Si existe una cuenta con <strong>{email}</strong>, te enviamos un enlace para elegir una
                nueva contraseña.
              </p>
              <p style={{ marginBottom: 24, fontSize: 13, color: '#97A3AA' }}>
                ¿No llegó? Revisa spam, o inténtalo de nuevo en unos minutos.
              </p>
              <Link
                to="/login"
                className="inline-block rounded-lg px-5 py-3 text-sm font-bold text-white transition-transform hover:-translate-y-0.5"
                style={{ background: '#0E9488' }}
              >
                Volver a iniciar sesión
              </Link>
            </>
          ) : (
            <form onSubmit={handleSubmit} {...validacionEsProps}>
              <h2 style={{ fontSize: 26, fontWeight: 800 }}>¿Olvidaste tu contraseña?</h2>
              <p style={{ marginTop: 8, marginBottom: 24, fontSize: 14, color: '#647079' }}>
                Escribe tu correo y te enviamos un enlace para recuperar el acceso.
              </p>

              {error && <p style={{ marginBottom: 16, fontSize: 13, color: '#B3261E', fontWeight: 600 }}>{error}</p>}

              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Correo electrónico</label>
                <AuthInput
                  icon={MailIcon}
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nombre@organizacion.org"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full transition-transform duration-150 hover:-translate-y-0.5 disabled:opacity-60"
                style={{ padding: 13, border: 'none', borderRadius: 10, background: '#0E9488', color: '#FFFFFF', fontFamily: 'Manrope, sans-serif', fontWeight: 700, fontSize: 15, cursor: 'pointer', boxShadow: '0 10px 20px rgba(14,148,136,0.28)' }}
              >
                {submitting ? 'Enviando…' : 'Enviar enlace de recuperación'}
              </button>

              <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: '#647079' }}>
                <Link to="/login" style={{ fontWeight: 700, color: '#0B7C72' }}>← Volver a iniciar sesión</Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
