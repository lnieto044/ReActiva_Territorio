import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogoutIcon } from './icons';
import type { UserRole } from '../types/user';

const LINKS_BY_ROLE: Record<UserRole, { to: string; label: string }[]> = {
  lider_comunitario: [
    { to: '/panel', label: 'Panel' },
    { to: '/reportar', label: 'Reportar' },
    { to: '/mapa', label: 'Mapa' },
    { to: '/coincidencias', label: 'Coincidencias' },
    { to: '/seguimiento', label: 'Seguimiento' },
    { to: '/alertas', label: 'Alertas' },
  ],
  organizacion: [
    { to: '/panel', label: 'Panel' },
    { to: '/ofertas', label: 'Ofertas' },
    { to: '/coincidencias', label: 'Coincidencias' },
    { to: '/seguimiento', label: 'Seguimiento' },
    { to: '/alertas', label: 'Alertas' },
  ],
  admin: [
    { to: '/panel', label: 'Panel' },
    { to: '/reportar', label: 'Reportar' },
    { to: '/mapa', label: 'Mapa' },
    { to: '/ofertas', label: 'Ofertas' },
    { to: '/coincidencias', label: 'Coincidencias' },
    { to: '/seguimiento', label: 'Seguimiento' },
    { to: '/alertas', label: 'Alertas' },
    { to: '/tablero', label: 'Tablero' },
    { to: '/usuarios', label: 'Usuarios' },
  ],
};

const ROLE_BADGE: Record<UserRole, { label: string; bg: string; color: string }> = {
  lider_comunitario: { label: 'Líder comunitario', bg: '#EAF6F4', color: '#0B7C72' },
  organizacion: { label: 'Organización', bg: '#EAEEF3', color: '#1B3556' },
  admin: { label: 'Coordinación', bg: '#FDF1DE', color: '#9A5B0E' },
};

export function NavBar() {
  const { displayName, role, logout } = useAuth();
  const navigate = useNavigate();

  if (!role) return null;

  const links = LINKS_BY_ROLE[role];
  const badge = ROLE_BADGE[role];
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('') || '?';

  async function handleLogout() {
    await logout();
    navigate('/login', { replace: true });
  }

  return (
    <header style={{ background: '#FFFFFF', borderBottom: '1px solid #E2E5E4' }}>
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
        <NavLink to="/panel" className="flex items-center gap-2 font-semibold" style={{ color: '#1B3556' }}>
          <img src="/logo-icon.png" alt="" className="h-7 w-7" />
          <span style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 800 }}>ReActiva Territorio</span>
        </NavLink>

        <div className="order-last w-full sm:order-none sm:w-auto sm:flex-1">
          <nav className="flex flex-wrap gap-1">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/panel'}
                className={({ isActive }) =>
                  `rounded-md px-3 py-1.5 text-sm font-medium ${isActive ? 'text-white' : 'text-stone-600 hover:bg-stone-100'}`
                }
                style={({ isActive }) => (isActive ? { background: '#0B7C72' } : undefined)}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <span style={{ fontSize: 12.5, fontWeight: 700, color: badge.color, background: badge.bg, padding: '6px 14px', borderRadius: 999 }}>
          {badge.label}
        </span>

        <div className="flex items-center gap-2">
          <div
            style={{ width: 32, height: 32, borderRadius: '50%', background: '#1B3556', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Manrope, sans-serif', fontWeight: 700, fontSize: 12 }}
          >
            {initials}
          </div>
          <span className="hidden text-sm font-medium text-stone-700 sm:inline">{displayName}</span>
        </div>

        <button type="button" onClick={handleLogout} aria-label="Cerrar sesión" className="text-stone-400 hover:text-stone-700">
          <LogoutIcon />
        </button>
      </div>
    </header>
  );
}
