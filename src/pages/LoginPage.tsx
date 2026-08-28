import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AuthInput } from '../components/AuthField';
import { MailIcon, LockIcon } from '../components/icons';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email, password);
      const from = (location.state as { from?: string } | null)?.from ?? '/panel';
      navigate(from, { replace: true });
    } catch {
      setError('Correo o contraseña incorrectos.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen w-full flex-col lg:flex-row" style={{ background: '#FFFFFF' }}>
      <div
        className="w-full p-5 lg:w-[44%] lg:p-14"
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
        <div className="hidden lg:block" style={{ position: 'absolute', width: 420, height: 420, borderRadius: '50%', background: 'radial-gradient(circle, rgba(14,148,136,0.55) 0%, rgba(14,148,136,0) 70%)', filter: 'blur(10px)', top: -140, left: -120 }} />
        <div className="hidden lg:block" style={{ position: 'absolute', width: 360, height: 360, borderRadius: '50%', background: 'radial-gradient(circle, rgba(245,166,35,0.35) 0%, rgba(245,166,35,0) 70%)', filter: 'blur(10px)', bottom: -120, right: -80 }} />

        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 20px rgba(0,0,0,0.25)', flexShrink: 0 }} className="lg:h-14 lg:w-14 lg:rounded-2xl">
            <img src="/logo-icon.png" alt="" style={{ width: 26, height: 26, objectFit: 'contain' }} className="lg:h-[38px] lg:w-[38px]" />
          </div>
          <span style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 800, fontSize: 18, color: '#FFFFFF' }} className="lg:text-[22px]">ReActiva Territorio</span>
        </div>

        <div className="relative hidden max-w-[420px] lg:block">
          <h1 className="text-2xl lg:text-4xl" style={{ fontWeight: 800, color: '#FFFFFF', lineHeight: 1.2 }}>Coordinar la recuperación, caso por caso.</h1>
          <p className="mt-4 text-sm lg:text-base" style={{ lineHeight: 1.6, color: 'rgba(255,255,255,0.75)' }}>
            Registra necesidades, verifícalas, conéctalas con ayuda disponible y haz seguimiento hasta que la comunidad se recupere.
          </p>
        </div>

        <div className="relative hidden text-xs lg:block" style={{ color: 'rgba(255,255,255,0.55)' }}>© ReActiva Territorio — Plataforma de recuperación territorial</div>
      </div>

      <div className="flex w-full items-center justify-center p-8 lg:w-[56%] lg:p-16">
        <form onSubmit={handleSubmit} className="w-full max-w-[380px]">
          <h2 style={{ fontSize: 26, fontWeight: 800 }}>Bienvenido de nuevo</h2>
          <p style={{ marginTop: 8, marginBottom: 24, fontSize: 14, color: '#647079' }}>Ingresa a tu cuenta para continuar coordinando la recuperación.</p>

          {error && <p style={{ marginBottom: 16, fontSize: 13, color: '#B3261E', fontWeight: 600 }}>{error}</p>}

          <div style={{ marginBottom: 18 }}>
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

          <div style={{ marginBottom: 10 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Contraseña</label>
            <AuthInput
              icon={LockIcon}
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <div style={{ textAlign: 'right', marginBottom: 24 }}>
            <Link to="/forgot-password" style={{ fontSize: 13, fontWeight: 600, color: '#0B7C72' }}>
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="transition-transform duration-150 hover:-translate-y-0.5 disabled:opacity-60"
            style={{ width: '100%', padding: 13, border: 'none', borderRadius: 10, background: '#0E9488', color: '#FFFFFF', fontFamily: 'Manrope, sans-serif', fontWeight: 700, fontSize: 15, cursor: 'pointer', boxShadow: '0 10px 20px rgba(14,148,136,0.28)' }}
          >
            {submitting ? 'Ingresando…' : 'Iniciar sesión'}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '28px 0' }}>
            <div style={{ flex: 1, height: 1, background: '#E2E5E4' }} />
            <span style={{ fontSize: 12, color: '#97A3AA' }}>o</span>
            <div style={{ flex: 1, height: 1, background: '#E2E5E4' }} />
          </div>

          <p style={{ textAlign: 'center', fontSize: 14, color: '#647079' }}>
            ¿No tienes cuenta? <Link to="/registro" style={{ fontWeight: 700, color: '#0B7C72' }}>Regístrate</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
