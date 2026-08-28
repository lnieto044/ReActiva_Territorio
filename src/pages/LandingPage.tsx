import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { sendContactMessage } from '../features/contact/api';
import { HeroCarousel } from '../components/HeroCarousel';
import { Reveal } from '../components/Reveal';
import { AuthInput, AuthTextArea } from '../components/AuthField';
import { validacionEsProps } from '../lib/validationEs';
import {
  DocPlusIcon,
  ShieldCheckIcon,
  LinkMatchIcon,
  TruckIcon,
  MapPinIcon,
  PackageIcon,
  BarChartIcon,
  UsersIcon,
  BuildingIcon,
  UserIcon,
  MailIcon,
  MessageIcon,
  PhoneIcon,
  InstagramIcon,
  FacebookIcon,
  WhatsAppIcon,
  LinkedInIcon,
  ChevronRightIcon,
} from '../components/icons';

const SOCIALES = [
  { icon: InstagramIcon, label: 'Instagram', href: '#' },
  { icon: FacebookIcon, label: 'Facebook', href: '#' },
  { icon: WhatsAppIcon, label: 'WhatsApp', href: '#' },
  { icon: LinkedInIcon, label: 'LinkedIn', href: '#' },
];

const PASOS = [
  { icon: DocPlusIcon, title: 'Reporta', text: 'Un líder comunitario registra la necesidad, incluso sin conexión.' },
  { icon: ShieldCheckIcon, title: 'Verifica', text: 'Se confirma el caso y se prioriza con criterios transparentes.' },
  { icon: LinkMatchIcon, title: 'Conecta', text: 'El caso se relaciona con una oferta compatible de ayuda.' },
  { icon: TruckIcon, title: 'Recupera', text: 'Se entrega con evidencia y se hace seguimiento al resultado.' },
];

const METAS = [
  { value: '500', label: 'Unidades productivas registradas' },
  { value: '80%', label: 'De los casos verificados' },
  { value: '100', label: 'Negocios reactivados' },
  { value: '150', label: 'Oportunidades laborales generadas' },
];

const SERVICIOS = [
  { icon: DocPlusIcon, title: 'Reporte con modo offline', text: 'Formulario de afectación que guarda localmente y sincroniza al recuperar conexión.' },
  { icon: MapPinIcon, title: 'Mapa territorial', text: 'Visualiza casos, prioridad y cobertura por municipio y vereda.' },
  { icon: ShieldCheckIcon, title: 'Verificación y priorización', text: 'Criterios explicables (pérdida de ingresos, vulnerabilidad, aislamiento) para ordenar la atención.' },
  { icon: PackageIcon, title: 'Ofertas y recursos', text: 'Empresas y entidades publican materiales, empleos o servicios disponibles.' },
  { icon: LinkMatchIcon, title: 'Motor de coincidencias', text: 'Relaciona necesidades verificadas con ofertas compatibles, con reglas transparentes.' },
  { icon: TruckIcon, title: 'Seguimiento con evidencia', text: 'Pipeline de entrega con fotos, responsable y confirmación de la comunidad.' },
  { icon: BarChartIcon, title: 'Tablero de resultados', text: 'Indicadores en tiempo real: casos, negocios reactivados, recursos movilizados.' },
  { icon: UsersIcon, title: 'Roles y permisos', text: 'Líder comunitario, organización y coordinación, cada uno con su propio panel.' },
];

const ROADMAP = [
  'Compra Local — conectar negocios reactivados con compradores',
  'Empleo para la reconstrucción',
  'Clasificación asistida con Gemini, siempre con aprobación humana',
  'Analítica avanzada con BigQuery y Looker',
];

const AUDIENCIAS = [
  {
    icon: ShieldCheckIcon,
    title: 'Líder comunitario',
    text: 'Reporta lo que ve en su comunidad, incluso sin señal, y confirma que las necesidades son reales.',
    cta: 'Empezar a reportar',
  },
  {
    icon: BuildingIcon,
    title: 'Organización o empresa',
    text: 'Publica los recursos, materiales o empleos que tiene disponibles y ejecuta entregas con evidencia.',
    cta: 'Publicar una oferta',
  },
  {
    icon: BarChartIcon,
    title: 'Equipo de coordinación',
    text: 'Visibilidad completa: casos, ofertas, coincidencias y resultados de todo el territorio en un solo panel.',
    cta: 'Ver el panel',
  },
];

const VIDEO_DESTACADO = {
  id: 'd0xhfNoOi-A',
  title: 'Terremoto en Colombia: Chocó evalúa miles de viviendas afectadas tras el sismo de magnitud 7,4',
};

const VIDEOS_NOTICIAS = [
  { id: '1RdyiKeVLjM', title: 'Juanchaco busca reactivar el turismo tras afectaciones por sismo del 10 de agosto' },
  { id: 'cO4JZ8Wcbdc', title: 'Las fases para reconstruir las zonas afectadas por el terremoto: ¿cuánto dinero implicarían?' },
  { id: 'Uwyj6L_a6J4', title: 'Comerciantes de Cali buscan salir adelante tras perder sus negocios por el terremoto' },
];

const NAV_ITEMS = [
  { href: '#contexto', label: 'Contexto' },
  { href: '#como-funciona', label: 'Cómo funciona' },
  { href: '#servicios', label: 'Servicios' },
  { href: '#impacto', label: 'Impacto' },
  { href: '#proyecto', label: 'Proyecto' },
  { href: '#faq', label: 'FAQ' },
  { href: '#contacto', label: 'Contacto' },
];

const FAQ_ITEMS = [
  {
    q: '¿ReActiva Territorio predice sismos o genera alertas tempranas?',
    a: 'No. Es una plataforma de coordinación y seguimiento de la recuperación después de una emergencia ya ocurrida — no un sistema de monitoreo o predicción sísmica. Las alertas dentro de la plataforma son operativas (casos urgentes sin atender, ofertas por agotarse) y proyecciones basadas en el ritmo real de verificación, nunca pronósticos de sismos.',
  },
  {
    q: '¿Necesito conexión a internet para reportar un caso?',
    a: 'No. El formulario de reporte guarda la información en tu dispositivo si no hay señal y la sincroniza automáticamente en cuanto vuelves a tener conexión — pensado para zonas rurales con conectividad limitada.',
  },
  {
    q: '¿Cómo se decide qué caso se atiende primero?',
    a: 'Cada caso verificado recibe un puntaje de prioridad calculado con criterios explícitos: pérdida total de ingresos, personas vulnerables a cargo, nivel de afectación de la vivienda o negocio, y aislamiento geográfico. No es una decisión manual ni arbitraria.',
  },
  {
    q: '¿Quién puede publicar ofertas de ayuda?',
    a: 'Cualquier organización, empresa o entidad registrada como "Organización" en la plataforma puede publicar materiales, empleos o servicios disponibles, y coordinar la entrega con seguimiento y evidencia.',
  },
  {
    q: '¿Es gratis usar la plataforma?',
    a: 'Sí. Esta es una versión piloto: reportar casos, publicar ofertas y hacer seguimiento no tiene costo para líderes comunitarios ni organizaciones.',
  },
  {
    q: '¿Quién puede ver los datos que reporto?',
    a: 'Solo personas con una cuenta registrada en la plataforma (líderes comunitarios, organizaciones y el equipo de coordinación) — nunca es información pública. Se usa exclusivamente para coordinar la respuesta.',
  },
  {
    q: '¿Cómo obtengo acceso como equipo de coordinación?',
    a: 'El acceso de coordinación se otorga manualmente por el equipo del proyecto, para mantener control sobre quién ve la información de todo el territorio. Escríbenos desde la sección de contacto si tu organización lo necesita.',
  },
];

function NavLinks({ dark = false }: { dark?: boolean }) {
  return (
    <>
      {NAV_ITEMS.map((item) => (
        <a
          key={item.href}
          href={item.href}
          className="text-sm font-semibold transition-colors"
          style={{ color: dark ? 'rgba(255,255,255,0.85)' : '#4B565D' }}
        >
          {item.label}
        </a>
      ))}
    </>
  );
}

function SectionKicker({ children }: { children: React.ReactNode }) {
  return <p className="text-center text-xs font-bold tracking-wide" style={{ color: '#9A5B0E' }}>{children}</p>;
}

function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="mx-auto max-w-3xl space-y-3">
      {FAQ_ITEMS.map((item, i) => {
        const open = openIndex === i;
        return (
          <div key={item.q} className="overflow-hidden rounded-xl bg-white transition-shadow hover:shadow-md" style={{ border: '1px solid #E2E5E4' }}>
            <button
              type="button"
              onClick={() => setOpenIndex(open ? null : i)}
              aria-expanded={open}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
            >
              <span className="text-sm font-bold" style={{ fontFamily: 'Manrope, sans-serif', color: '#16202B' }}>{item.q}</span>
              <span
                className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full transition-transform duration-200"
                style={{ background: '#EAF6F4', color: '#0B7C72', transform: open ? 'rotate(90deg)' : 'rotate(0deg)' }}
              >
                <ChevronRightIcon width={13} height={13} />
              </span>
            </button>
            <div
              className="grid transition-all duration-300 ease-out"
              style={{ gridTemplateRows: open ? '1fr' : '0fr' }}
            >
              <div className="overflow-hidden">
                <p className="px-5 pb-4 text-sm leading-relaxed" style={{ color: '#647079' }}>{item.a}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ContactForm() {
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await sendContactMessage({ nombre, correo, mensaje });
      setSent(true);
      setNombre('');
      setCorreo('');
      setMensaje('');
    } catch {
      setError('No pudimos enviar tu mensaje. Intenta de nuevo.');
    } finally {
      setSubmitting(false);
    }
  }

  if (sent) {
    return (
      <div className="flex h-full flex-col items-center justify-center rounded-2xl p-8 text-center" style={{ background: '#F2FBFA', border: '1px solid #D3EEEA' }}>
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full" style={{ background: '#0E9488' }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
        </div>
        <p className="font-bold" style={{ fontFamily: 'Manrope, sans-serif', color: '#0B7C72' }}>¡Gracias por escribirnos!</p>
        <p className="mt-2 text-sm" style={{ color: '#647079' }}>Te responderemos lo antes posible.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full" {...validacionEsProps}>
      {error && <p className="mb-4 text-sm font-semibold" style={{ color: '#B3261E' }}>{error}</p>}
      <div className="mb-4">
        <label className="mb-1.5 block text-sm font-semibold" style={{ color: '#16202B' }}>Nombre</label>
        <AuthInput icon={UserIcon} required value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Tu nombre" />
      </div>
      <div className="mb-4">
        <label className="mb-1.5 block text-sm font-semibold" style={{ color: '#16202B' }}>Correo electrónico</label>
        <AuthInput icon={MailIcon} type="email" required value={correo} onChange={(e) => setCorreo(e.target.value)} placeholder="nombre@organizacion.org" />
      </div>
      <div className="mb-6">
        <label className="mb-1.5 block text-sm font-semibold" style={{ color: '#16202B' }}>Mensaje</label>
        <AuthTextArea icon={MessageIcon} required rows={4} value={mensaje} onChange={(e) => setMensaje(e.target.value)} placeholder="Cuéntanos en qué podemos ayudarte" />
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-lg py-3 text-sm font-bold text-white transition-transform hover:-translate-y-0.5 disabled:opacity-60"
        style={{ background: '#0E9488', boxShadow: '0 10px 20px rgba(14,148,136,0.28)' }}
      >
        {submitting ? 'Enviando…' : 'Enviar mensaje'}
      </button>
    </form>
  );
}

export function LandingPage() {
  const { user } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 40);
    }
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="w-full bg-white">
      <header
        className="fixed inset-x-0 top-0 z-50 transition-all duration-300"
        style={{
          background: scrolled ? 'rgba(255,255,255,0.95)' : 'transparent',
          borderBottom: scrolled ? '1px solid #E2E5E4' : '1px solid transparent',
          backdropFilter: scrolled ? 'blur(8px)' : 'none',
        }}
      >
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: scrolled ? 'transparent' : 'rgba(255,255,255,0.95)' }}>
              <img src="/logo-icon.png" alt="" className="h-7 w-7" />
            </div>
            <span style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 800, color: scrolled ? '#1B3556' : '#FFFFFF' }} className="text-lg">
              ReActiva Territorio
            </span>
          </div>
          <nav className="hidden items-center gap-6 md:flex">
            <NavLinks dark={!scrolled} />
          </nav>
          <div className="flex items-center gap-3">
            {user ? (
              <Link to="/panel" className="rounded-lg px-4 py-2 text-sm font-bold text-white transition-transform hover:-translate-y-0.5" style={{ background: '#0E9488' }}>
                Ir a mi panel
              </Link>
            ) : (
              <>
                <Link to="/login" className="rounded-lg px-4 py-2 text-sm font-semibold" style={{ color: scrolled ? '#1B3556' : '#FFFFFF' }}>
                  Iniciar sesión
                </Link>
                <Link to="/registro" className="rounded-lg px-4 py-2 text-sm font-bold text-white transition-transform hover:-translate-y-0.5" style={{ background: '#0E9488' }}>
                  Regístrate
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <section className="relative flex min-h-[640px] items-center overflow-hidden px-6 py-32">
        <HeroCarousel />
        <div className="relative mx-auto max-w-6xl">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-extrabold leading-tight text-white sm:text-5xl" style={{ fontFamily: 'Manrope, sans-serif' }}>
              Convierte los reportes de tu comunidad en recuperación verificable.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/80">
              Después de un sismo, ReActiva Territorio registra necesidades, las verifica, las conecta con ayuda
              disponible y hace seguimiento hasta comprobar el resultado — incluso en zonas con conectividad limitada.
            </p>
            <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row">
              <Link
                to={user ? '/panel' : '/registro'}
                className="w-full rounded-lg px-6 py-3 text-center text-sm font-bold text-white transition-transform hover:-translate-y-0.5 sm:w-auto"
                style={{ background: '#0E9488', boxShadow: '0 10px 20px rgba(14,148,136,0.35)' }}
              >
                {user ? 'Ir a mi panel' : 'Comenzar ahora'}
              </Link>
              {!user && (
                <Link
                  to="/login"
                  className="w-full rounded-lg border px-6 py-3 text-center text-sm font-bold text-white transition-colors hover:bg-white/10 sm:w-auto"
                  style={{ borderColor: 'rgba(255,255,255,0.35)' }}
                >
                  Ya tengo cuenta
                </Link>
              )}
            </div>
            <p className="mt-8 text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
              Fotos: registro del sismo en Chocó y Valle del Cauca, Colombia.
            </p>
          </div>
        </div>
      </section>

      {/* Contexto: el sismo real que motiva la plataforma */}
      <section id="contexto" className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
        <Reveal className="mx-auto max-w-2xl text-center">
          <SectionKicker>EL CONTEXTO</SectionKicker>
          <h2 className="mt-2 text-2xl font-extrabold sm:text-3xl" style={{ fontFamily: 'Manrope, sans-serif', color: '#16202B' }}>
            Un sismo de magnitud 7.4 con epicentro en Chocó, Colombia
          </h2>
          <p className="mt-4 text-sm leading-relaxed sm:text-base" style={{ color: '#647079' }}>
            El 10 de agosto de 2026, un sismo de magnitud 7.4 con epicentro en San José del Palmar (Chocó) dejó
            miles de viviendas y comercios afectados —no solo en el Chocó rural, sino en capitales como Quibdó,
            Cali, Pereira, Manizales y Armenia— y se sintió incluso en Ecuador y Panamá. ReActiva Territorio
            responde a esta realidad: no es un ejercicio hipotético, sino una herramienta pensada para lo que ya
            está pasando en el territorio.
          </p>
        </Reveal>

        <Reveal delay={150} className="mx-auto mt-10 max-w-3xl overflow-hidden rounded-2xl" style={{ border: '1px solid #E2E5E4' }}>
          <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
            <iframe
              className="absolute inset-0 h-full w-full"
              src={`https://www.youtube-nocookie.com/embed/${VIDEO_DESTACADO.id}`}
              title={VIDEO_DESTACADO.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </Reveal>

        <p className="mb-4 mt-12 text-center text-sm font-bold" style={{ color: '#16202B' }}>En las noticias</p>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {VIDEOS_NOTICIAS.map((v, i) => (
            <Reveal key={v.id} delay={i * 100}>
              <a
                href={`https://www.youtube.com/watch?v=${v.id}`}
                target="_blank"
                rel="noreferrer"
                className="block overflow-hidden rounded-xl transition-shadow hover:shadow-lg"
                style={{ border: '1px solid #E2E5E4' }}
              >
                <img src={`https://img.youtube.com/vi/${v.id}/hqdefault.jpg`} alt="" className="aspect-video w-full object-cover" />
                <p className="p-3 text-xs font-semibold leading-snug" style={{ color: '#16202B' }}>{v.title}</p>
              </a>
            </Reveal>
          ))}
        </div>
      </section>

      <section id="como-funciona" className="px-6 py-16 sm:py-20" style={{ background: '#F6F7F6' }}>
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <h2 className="text-center text-2xl font-extrabold sm:text-3xl" style={{ fontFamily: 'Manrope, sans-serif', color: '#16202B' }}>
              Cómo funciona
            </h2>
          </Reveal>
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {PASOS.map((paso, i) => (
              <Reveal key={paso.title} delay={i * 100}>
                <div className="h-full rounded-2xl bg-white p-6 transition-all hover:-translate-y-1 hover:shadow-lg" style={{ border: '1px solid #E2E5E4' }}>
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl" style={{ background: '#EAF6F4', color: '#0B7C72' }}>
                    <paso.icon width={22} height={22} />
                  </div>
                  <p className="mb-1 text-xs font-bold" style={{ color: '#97A3AA' }}>PASO {i + 1}</p>
                  <p className="mb-2 text-base font-bold" style={{ fontFamily: 'Manrope, sans-serif', color: '#16202B' }}>{paso.title}</p>
                  <p className="text-sm leading-relaxed" style={{ color: '#647079' }}>{paso.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
        <Reveal>
          <SectionKicker>PARA QUIÉN ES</SectionKicker>
          <h2 className="mt-2 text-center text-2xl font-extrabold sm:text-3xl" style={{ fontFamily: 'Manrope, sans-serif', color: '#16202B' }}>
            Una plataforma, tres roles
          </h2>
        </Reveal>
        <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {AUDIENCIAS.map((a, i) => (
            <Reveal key={a.title} delay={i * 120}>
              <div className="flex h-full flex-col rounded-2xl p-7 transition-all hover:-translate-y-1 hover:shadow-lg" style={{ border: '1px solid #E2E5E4' }}>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl" style={{ background: '#EAF6F4', color: '#0B7C72' }}>
                  <a.icon width={24} height={24} />
                </div>
                <p className="mb-2 text-base font-bold" style={{ fontFamily: 'Manrope, sans-serif', color: '#16202B' }}>{a.title}</p>
                <p className="mb-5 flex-1 text-sm leading-relaxed" style={{ color: '#647079' }}>{a.text}</p>
                <Link to="/registro" className="text-sm font-bold" style={{ color: '#0B7C72' }}>
                  {a.cta} →
                </Link>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section id="servicios" className="px-6 py-16 sm:py-20" style={{ background: '#F6F7F6' }}>
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <h2 className="text-center text-2xl font-extrabold sm:text-3xl" style={{ fontFamily: 'Manrope, sans-serif', color: '#16202B' }}>
              Qué ofrece la plataforma
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-center text-sm" style={{ color: '#647079' }}>
              Todo lo que hoy está disponible en el prototipo, listo para usarse.
            </p>
          </Reveal>
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {SERVICIOS.map((s, i) => (
              <Reveal key={s.title} delay={(i % 4) * 80}>
                <div className="h-full rounded-2xl bg-white p-6 transition-all hover:-translate-y-1 hover:shadow-lg" style={{ border: '1px solid #E2E5E4' }}>
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl" style={{ background: '#EAF6F4', color: '#0B7C72' }}>
                    <s.icon width={22} height={22} />
                  </div>
                  <p className="mb-2 text-sm font-bold" style={{ fontFamily: 'Manrope, sans-serif', color: '#16202B' }}>{s.title}</p>
                  <p className="text-xs leading-relaxed" style={{ color: '#647079' }}>{s.text}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={200}>
            <div className="mx-auto mt-12 max-w-2xl rounded-2xl bg-white p-6 sm:p-8" style={{ border: '1px solid #E2E5E4' }}>
              <p className="mb-3 text-xs font-bold tracking-wide" style={{ color: '#9A5B0E' }}>EN EL ROADMAP</p>
              <ul className="space-y-2">
                {ROADMAP.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm" style={{ color: '#4B565D' }}>
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full" style={{ background: '#F5A623' }} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </section>

      <section id="impacto" className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
        <Reveal>
          <h2 className="text-center text-2xl font-extrabold sm:text-3xl" style={{ fontFamily: 'Manrope, sans-serif', color: '#16202B' }}>
            Metas de un piloto
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-sm" style={{ color: '#647079' }}>
            Lo que buscamos demostrar al llevar ReActiva Territorio a un municipio piloto.
          </p>
        </Reveal>
        <div className="mt-10 grid grid-cols-2 gap-6 lg:grid-cols-4">
          {METAS.map((m, i) => (
            <Reveal key={m.label} delay={i * 100}>
              <div className="rounded-2xl p-6 text-center transition-all hover:-translate-y-1 hover:shadow-lg" style={{ background: '#F6F7F6', border: '1px solid #E2E5E4' }}>
                <p className="text-3xl font-extrabold sm:text-4xl" style={{ fontFamily: 'Manrope, sans-serif', color: '#1B3556' }}>{m.value}</p>
                <p className="mt-2 text-sm" style={{ color: '#647079' }}>{m.label}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section id="proyecto" className="px-6 py-16 sm:py-20" style={{ background: '#F6F7F6' }}>
        <div className="mx-auto max-w-4xl">
          <Reveal>
            <SectionKicker>SOBRE EL PROYECTO</SectionKicker>
            <h2 className="mt-3 text-center text-2xl font-extrabold sm:text-3xl" style={{ fontFamily: 'Manrope, sans-serif', color: '#16202B' }}>
              Por qué existe ReActiva Territorio
            </h2>
          </Reveal>
          <Reveal delay={100}>
            <div className="mx-auto mt-8 max-w-2xl space-y-4 text-sm leading-relaxed sm:text-base" style={{ color: '#4B565D' }}>
              <p>
                Después del sismo de magnitud 7.4 que afectó a Chocó y Valle del Cauca, la respuesta se organiza
                a punta de mensajes sueltos, listas en papel y coordinación manual entre decenas de líderes
                comunitarios, organizaciones y entidades. La información se pierde, la ayuda no siempre llega a
                quien más la necesita primero, y nadie puede medir con certeza si la recuperación real está
                pasando. ReActiva Territorio existe para cerrar esa brecha de coordinación.
              </p>
              <p>
                Es importante ser claros sobre lo que es y lo que no es: esta es una herramienta de{' '}
                <strong style={{ color: '#16202B' }}>coordinación y seguimiento de la recuperación</strong>, no un
                sistema de predicción sísmica ni de alertas tempranas de terremotos. Las "alertas" que vas a ver
                dentro de la plataforma son operativas — casos urgentes sin atender, ofertas por agotarse,
                proyecciones sobre el ritmo de verificación — y nunca reemplazan a los sistemas oficiales de
                monitoreo sísmico.
              </p>
            </div>
          </Reveal>
          <Reveal delay={200}>
            <div className="mx-auto mt-10 flex max-w-md items-center gap-4 rounded-2xl bg-white p-5" style={{ border: '1px solid #E2E5E4' }}>
              <div
                className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full text-lg font-extrabold text-white"
                style={{ background: '#1B3556', fontFamily: 'Manrope, sans-serif' }}
              >
                LN
              </div>
              <div>
                <p className="text-xs font-bold tracking-wide" style={{ color: '#9A5B0E' }}>CONSTRUIDO POR</p>
                <p className="font-bold" style={{ fontFamily: 'Manrope, sans-serif', color: '#16202B' }}>Luis Nieto</p>
                <p className="text-xs" style={{ color: '#647079' }}>Creador y desarrollador de ReActiva Territorio</p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section id="faq" className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
        <Reveal>
          <h2 className="text-center text-2xl font-extrabold sm:text-3xl" style={{ fontFamily: 'Manrope, sans-serif', color: '#16202B' }}>
            Preguntas frecuentes
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-sm" style={{ color: '#647079' }}>
            Todo lo que necesitas saber antes de empezar.
          </p>
        </Reveal>
        <div className="mt-10">
          <FaqAccordion />
        </div>
      </section>

      <section className="relative overflow-hidden px-6 py-16 text-center" style={{ background: 'linear-gradient(155deg, #1B3556 0%, #10233D 100%)' }}>
        <div
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(14,148,136,0.45) 0%, rgba(14,148,136,0) 70%)', filter: 'blur(10px)' }}
        />
        <Reveal className="relative mx-auto max-w-xl">
          <h2 className="text-2xl font-extrabold text-white sm:text-3xl" style={{ fontFamily: 'Manrope, sans-serif' }}>
            ¿Listo para reactivar tu territorio?
          </h2>
          <p className="mt-4 text-sm text-white/75 sm:text-base">
            Crea tu cuenta gratis y empieza a reportar, verificar o coordinar ayuda hoy mismo.
          </p>
          <Link
            to={user ? '/panel' : '/registro'}
            className="mt-8 inline-block rounded-lg px-8 py-3 text-sm font-bold text-white transition-transform hover:-translate-y-0.5"
            style={{ background: '#0E9488', boxShadow: '0 10px 20px rgba(14,148,136,0.35)' }}
          >
            {user ? 'Ir a mi panel' : 'Comenzar ahora'}
          </Link>
        </Reveal>
      </section>

      <section id="contacto" className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
        <Reveal>
          <h2 className="text-center text-2xl font-extrabold sm:text-3xl" style={{ fontFamily: 'Manrope, sans-serif', color: '#16202B' }}>
            Contacto
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-sm" style={{ color: '#647079' }}>
            ¿Eres una entidad, empresa o líder comunitario y quieres saber más? Escríbenos.
          </p>
        </Reveal>

        <Reveal delay={150} className="mt-10 overflow-hidden rounded-3xl" style={{ boxShadow: '0 20px 50px rgba(16,24,32,0.10)' }}>
          <div className="grid grid-cols-1 lg:grid-cols-5">
            <div
              className="relative overflow-hidden p-8 sm:p-10 lg:col-span-2"
              style={{ background: 'linear-gradient(155deg, #1B3556 0%, #10233D 100%)' }}
            >
              <div
                className="pointer-events-none absolute -bottom-20 -right-20 h-64 w-64 rounded-full"
                style={{ background: 'radial-gradient(circle, rgba(14,148,136,0.4) 0%, rgba(14,148,136,0) 70%)', filter: 'blur(10px)' }}
              />
              <p className="relative text-lg font-extrabold text-white" style={{ fontFamily: 'Manrope, sans-serif' }}>
                Hablemos
              </p>
              <p className="relative mt-2 text-sm leading-relaxed text-white/70">
                Entidades, empresas y líderes comunitarios pueden escribirnos para vincularse a la plataforma.
              </p>

              <div className="relative mt-8 space-y-4">
                <a href="mailto:info@saludgo.org" className="flex items-center gap-3 text-sm text-white/85 transition-colors hover:text-white">
                  <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg" style={{ background: 'rgba(255,255,255,0.1)' }}>
                    <MailIcon width={16} height={16} />
                  </span>
                  info@saludgo.org
                </a>
                <a href="tel:+573133898638" className="flex items-center gap-3 text-sm text-white/85 transition-colors hover:text-white">
                  <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg" style={{ background: 'rgba(255,255,255,0.1)' }}>
                    <PhoneIcon width={16} height={16} />
                  </span>
                  +57 313 389 8638
                </a>
                <div className="flex items-center gap-3 text-sm text-white/85">
                  <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg" style={{ background: 'rgba(255,255,255,0.1)' }}>
                    <MapPinIcon width={16} height={16} />
                  </span>
                  Bogotá D.C., Colombia
                </div>
              </div>

              <div className="relative mt-10 flex gap-2">
                {SOCIALES.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    aria-label={s.label}
                    className="flex h-9 w-9 items-center justify-center rounded-full text-white transition-all hover:-translate-y-0.5"
                    style={{ background: 'rgba(255,255,255,0.1)' }}
                  >
                    <s.icon width={16} height={16} />
                  </a>
                ))}
              </div>
            </div>

            <div className="bg-white p-8 sm:p-10 lg:col-span-3">
              <ContactForm />
            </div>
          </div>
        </Reveal>
      </section>

      <footer className="border-t px-6 py-10" style={{ borderColor: '#E2E5E4' }}>
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-6">
          <div className="flex items-center gap-2">
            <img src="/logo-icon.png" alt="" className="h-6 w-6" />
            <span className="text-sm font-bold" style={{ fontFamily: 'Manrope, sans-serif', color: '#1B3556' }}>
              ReActiva Territorio
            </span>
          </div>
          <nav className="flex flex-wrap items-center justify-center gap-6">
            <NavLinks />
          </nav>
          <div className="flex gap-3">
            {SOCIALES.map((s) => (
              <a
                key={s.label}
                href={s.href}
                aria-label={s.label}
                className="flex h-8 w-8 items-center justify-center rounded-full transition-all hover:-translate-y-0.5"
                style={{ background: '#F6F7F6', color: '#4B565D' }}
              >
                <s.icon width={15} height={15} />
              </a>
            ))}
          </div>
          <p className="text-xs" style={{ color: '#97A3AA' }}>
            © ReActiva Territorio — Plataforma de recuperación territorial
          </p>
        </div>
      </footer>
    </div>
  );
}
