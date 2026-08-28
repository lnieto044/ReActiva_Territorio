import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheckIcon, BuildingIcon, UserIcon, MapPinIcon, MailIcon, LockIcon } from '../components/icons';
import { AuthInput } from '../components/AuthField';
import type { UserRole } from '../types/user';
import { validacionEsProps } from '../lib/validationEs';

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [nombre, setNombre] = useState('');
  const [municipio, setMunicipio] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rol, setRol] = useState<Extract<UserRole, 'lider_comunitario' | 'organizacion'>>('lider_comunitario');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

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
      await register({ displayName: nombre, email, password, municipio, role: rol });
      navigate('/panel', { replace: true });
    } catch (err) {
      const code = (err as { code?: string })?.code;
      setError(code === 'auth/email-already-in-use' ? 'Ese correo ya tiene una cuenta.' : 'No pudimos crear tu cuenta. Intenta de nuevo.');
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
          <h1 className="text-xl lg:text-3xl" style={{ fontWeight: 800, color: '#FFFFFF', lineHeight: 1.25 }}>Únete a la red de recuperación.</h1>
          <p className="mt-3 text-sm" style={{ lineHeight: 1.6, color: 'rgba(255,255,255,0.75)' }}>
            Reporta necesidades desde tu comunidad o publica los recursos que tu organización puede ofrecer.
          </p>
        </div>

        <div className="relative hidden text-xs lg:block" style={{ color: 'rgba(255,255,255,0.55)' }}>© ReActiva Territorio — Plataforma de recuperación territorial</div>
      </div>

      <div className="flex w-full items-center justify-center p-8 lg:w-[62%] lg:p-14">
        <form onSubmit={handleSubmit} className="w-full max-w-[520px]" {...validacionEsProps}>
          <h2 style={{ fontSize: 26, fontWeight: 800 }}>Crea tu cuenta</h2>
          <p style={{ marginTop: 8, marginBottom: 22, fontSize: 14, color: '#647079' }}>Regístrate para reportar afectaciones o publicar ayudas disponibles.</p>

          {error && <p style={{ marginBottom: 16, fontSize: 13, color: '#B3261E', fontWeight: 600 }}>{error}</p>}

          <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: 16, marginBottom: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Nombre completo</label>
              <AuthInput icon={UserIcon} required value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Carlos Ramírez" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Municipio</label>
              <AuthInput icon={MapPinIcon} required value={municipio} onChange={(e) => setMunicipio(e.target.value)} placeholder="San José del Palmar" />
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Correo electrónico</label>
            <AuthInput icon={MailIcon} type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nombre@organizacion.org" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: 16, marginBottom: 22 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Contraseña</label>
              <AuthInput icon={LockIcon} type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Confirmar contraseña</label>
              <AuthInput icon={LockIcon} type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" />
            </div>
          </div>

          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 10 }}>¿Cuál es tu rol?</label>
          <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: 14, marginBottom: 20 }}>
            <button
              type="button"
              onClick={() => setRol('lider_comunitario')}
              className="transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md"
              style={{
                position: 'relative', textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit',
                border: `2px solid ${rol === 'lider_comunitario' ? '#0E9488' : '#E2E5E4'}`,
                borderRadius: 14, padding: 18, background: rol === 'lider_comunitario' ? '#F2FBFA' : '#FFFFFF',
              }}
            >
              {rol === 'lider_comunitario' && (
                <div style={{ position: 'absolute', top: 14, right: 14, width: 20, height: 20, borderRadius: '50%', background: '#0E9488', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                </div>
              )}
              <div style={{ width: 38, height: 38, borderRadius: 10, background: rol === 'lider_comunitario' ? '#0E9488' : '#F0F2F2', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                <ShieldCheckIcon width={20} height={20} stroke={rol === 'lider_comunitario' ? '#FFFFFF' : '#1B3556'} />
              </div>
              <p style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 700, fontSize: 14, marginBottom: 4 }}>Líder comunitario</p>
              <p style={{ fontSize: 12.5, color: '#647079', lineHeight: 1.5 }}>Reporta afectaciones y verifica casos en tu comunidad.</p>
            </button>

            <button
              type="button"
              onClick={() => setRol('organizacion')}
              className="transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md"
              style={{
                position: 'relative', textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit',
                border: `2px solid ${rol === 'organizacion' ? '#0E9488' : '#E2E5E4'}`,
                borderRadius: 14, padding: 18, background: rol === 'organizacion' ? '#F2FBFA' : '#FFFFFF',
              }}
            >
              {rol === 'organizacion' && (
                <div style={{ position: 'absolute', top: 14, right: 14, width: 20, height: 20, borderRadius: '50%', background: '#0E9488', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                </div>
              )}
              <div style={{ width: 38, height: 38, borderRadius: 10, background: rol === 'organizacion' ? '#0E9488' : '#F0F2F2', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                <BuildingIcon width={20} height={20} stroke={rol === 'organizacion' ? '#FFFFFF' : '#1B3556'} />
              </div>
              <p style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 700, fontSize: 14, marginBottom: 4 }}>Organización</p>
              <p style={{ fontSize: 12.5, color: '#647079', lineHeight: 1.5 }}>Publica ofertas de ayuda y coordina entregas.</p>
            </button>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="transition-transform duration-150 hover:-translate-y-0.5 disabled:opacity-60"
            style={{ width: '100%', padding: 13, border: 'none', borderRadius: 10, background: '#0E9488', color: '#FFFFFF', fontFamily: 'Manrope, sans-serif', fontWeight: 700, fontSize: 15, cursor: 'pointer', boxShadow: '0 10px 20px rgba(14,148,136,0.28)' }}
          >
            {submitting ? 'Creando cuenta…' : 'Crear cuenta'}
          </button>

          <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: '#647079' }}>
            ¿Ya tienes cuenta? <Link to="/login" style={{ fontWeight: 700, color: '#0B7C72' }}>Inicia sesión</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
