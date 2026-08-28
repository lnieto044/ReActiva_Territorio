import { Link } from 'react-router-dom';

export function PrivacidadPage() {
  return (
    <div className="min-h-screen px-6 py-16" style={{ background: '#FFFFFF' }}>
      <div className="mx-auto max-w-2xl">
        <Link to="/" className="text-sm font-semibold" style={{ color: '#0B7C72' }}>
          ← Volver al inicio
        </Link>
        <h1 className="mt-4 text-2xl font-extrabold sm:text-3xl" style={{ fontFamily: 'Manrope, sans-serif', color: '#16202B' }}>
          Aviso de privacidad
        </h1>
        <p className="mt-2 text-sm" style={{ color: '#97A3AA' }}>Última actualización: agosto de 2026</p>

        <div className="mt-8 space-y-6 text-sm leading-relaxed" style={{ color: '#4B565D' }}>
          <p>
            ReActiva Territorio es una plataforma para coordinar la recuperación de comunidades tras un sismo. Para
            cumplir ese propósito, recopilamos y almacenamos información personal — algunos de nuestros usuarios
            son personas en situación de vulnerabilidad, así que somos deliberadamente claros sobre qué guardamos
            y para qué.
          </p>

          <div>
            <h2 className="mb-2 font-bold" style={{ color: '#16202B' }}>Qué datos recopilamos</h2>
            <ul className="list-disc space-y-1.5 pl-5">
              <li><strong>Cuentas:</strong> nombre, correo electrónico y municipio, al registrarte.</li>
              <li><strong>Reportes de afectación:</strong> nombre del reportante, teléfono, ubicación aproximada, descripción de la afectación, número de personas afectadas y, si decides agregarlas, fotos como evidencia.</li>
              <li><strong>Coordinación de ayuda:</strong> registros de ofertas de recursos, coincidencias creadas y evidencia de entrega (fotos, ubicación, comentarios) para poder verificar que la ayuda sí llegó.</li>
              <li><strong>Mensajes de contacto:</strong> nombre, correo y el mensaje que envíes desde el formulario público.</li>
            </ul>
          </div>

          <div>
            <h2 className="mb-2 font-bold" style={{ color: '#16202B' }}>Para qué se usa</h2>
            <p>
              Exclusivamente para verificar necesidades reales, conectar esas necesidades con ayuda disponible, y dar
              seguimiento hasta confirmar que la ayuda llegó. No vendemos ni compartimos estos datos con terceros con
              fines comerciales o publicitarios.
            </p>
          </div>

          <div>
            <h2 className="mb-2 font-bold" style={{ color: '#16202B' }}>Quién puede ver qué</h2>
            <p>
              Los casos y ofertas son visibles para cualquier cuenta autenticada de la plataforma (líderes
              comunitarios, organizaciones y el equipo de coordinación), porque coordinar ayuda entre distintos
              actores requiere esa visibilidad compartida. Los mensajes del formulario de contacto público solo los
              puede leer el equipo de coordinación.
            </p>
          </div>

          <div>
            <h2 className="mb-2 font-bold" style={{ color: '#16202B' }}>Seguridad</h2>
            <p>
              Las contraseñas nunca se almacenan en texto plano — las gestiona Firebase Authentication. Puedes
              activar verificación en dos pasos (2FA) desde "Seguridad de tu cuenta" para una capa extra de
              protección. Las reglas de acceso a la base de datos exigen sesión iniciada para leer o escribir
              información de casos y ofertas.
            </p>
          </div>

          <div>
            <h2 className="mb-2 font-bold" style={{ color: '#16202B' }}>Tus opciones</h2>
            <p>
              Si quieres que corrijamos o eliminemos información tuya o de un caso que reportaste, escríbenos por el
              formulario de contacto o a{' '}
              <a href="mailto:info@saludgo.org" className="font-semibold" style={{ color: '#0B7C72' }}>
                info@saludgo.org
              </a>.
            </p>
          </div>

          <div className="rounded-xl p-4 text-xs" style={{ background: '#F6F7F6', color: '#647079' }}>
            Este proyecto es una demo funcional construida para un hackathon, sobre un caso real (el sismo del 10 de
            agosto de 2026 en Colombia). No es todavía un servicio operado por una entidad de respuesta a
            emergencias — este aviso describe cómo funcionaría el manejo de datos si se pusiera en producción.
          </div>
        </div>
      </div>
    </div>
  );
}
