import { Link } from 'react-router-dom';
import { InstagramIcon, FacebookIcon, WhatsAppIcon, LinkedInIcon, MailIcon } from './icons';

const SOCIALES = [
  { icon: InstagramIcon, label: 'Instagram', href: '#' },
  { icon: FacebookIcon, label: 'Facebook', href: '#' },
  { icon: WhatsAppIcon, label: 'WhatsApp', href: '#' },
  { icon: LinkedInIcon, label: 'LinkedIn', href: '#' },
];

// Utility links for the authenticated panel — separate from the module
// cards, so help/context/support are reachable no matter which screen
// you're on, not just from the dashboard's module grid.
export function AppFooter() {
  return (
    <footer className="mt-10 border-t px-4 py-6" style={{ borderColor: '#E2E5E4' }}>
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 sm:flex-row sm:justify-between">
        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs font-medium" style={{ color: '#647079' }}>
          <Link to="/" className="hover:text-stone-900">Sitio público</Link>
          <a href="/#faq" className="hover:text-stone-900">Preguntas frecuentes</a>
          <a href="/#proyecto" className="hover:text-stone-900">Sobre el proyecto</a>
          <a href="mailto:info@saludgo.org" className="flex items-center gap-1.5 hover:text-stone-900">
            <MailIcon width={13} height={13} />
            Soporte
          </a>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex gap-2">
            {SOCIALES.map((s) => (
              <a
                key={s.label}
                href={s.href}
                aria-label={s.label}
                className="flex h-7 w-7 items-center justify-center rounded-full transition-colors hover:bg-stone-100"
                style={{ color: '#97A3AA' }}
              >
                <s.icon width={14} height={14} />
              </a>
            ))}
          </div>
          <span className="text-xs" style={{ color: '#97A3AA' }}>© ReActiva Territorio</span>
        </div>
      </div>
    </footer>
  );
}
