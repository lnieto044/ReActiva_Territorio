# ReActiva Territorio — MVP

Prototipo del hackathon: convierte los reportes de necesidades tras el sismo en
acciones verificables de recuperación. Cubre las 5 funciones mínimas descritas
en la propuesta:

1. Registrar un negocio/persona afectada.
2. Guardar el reporte localmente sin conexión y sincronizarlo automáticamente.
3. Mostrar el caso en un mapa.
4. Relacionar la necesidad con una oferta compatible (reglas simples, sin IA).
5. Actualizar el caso como atendido y ver el resultado en un tablero.

Está construido sobre un caso real: el sismo de magnitud 7.4 del 10 de agosto
de 2026 con epicentro en San José del Palmar (Chocó, Colombia), que también
dejó daños en Quibdó, Cali, Pereira, Manizales y Armenia, y se sintió en
Ecuador y Panamá.

## 🔗 Demo en vivo

**[reactivaterritorio.web.app](https://reactivaterritorio.web.app)** — proyecto
Firebase real, no una simulación local. Cuentas de prueba abajo, en
[Cuentas de prueba](#cuentas-de-prueba).

**[docs/demo.mp4](docs/demo.mp4)** — video completo narrado (~16 minutos, voz
generada con Gemini TTS en español) recorriendo la plataforma sin omitir
nada: landing pública completa, registro/login/recuperar contraseña, los 3
paneles por rol con sus gráficas reales, reportar afectación offline-first,
mapa, coincidencias, seguimiento, alertas y proyecciones, verificación en dos
pasos con Google Authenticator, tablero de resultados y gestión de usuarios —
explicando qué es cada función y por qué se construyó así.

## Stack

React + Vite + TypeScript, Tailwind CSS, Firebase (Auth, Firestore, Storage)
corriendo 100% local vía el **Firebase Local Emulator Suite** — no se necesita
ningún proyecto real de Firebase ni facturación para probar el MVP. Los mapas
usan Google Maps Platform (opcional: si no hay clave configurada, se muestra
un listado en su lugar, sin romper la app).

## Primeros pasos

```bash
npm install
cp .env.example .env.local
```

Necesitas 3 terminales:

```bash
# Terminal A — emuladores de Firebase (Auth, Firestore, Storage, UI en :4000)
npm run emulators

# Terminal B — una vez los emuladores estén arriba, carga los datos de demo
npm run seed

# Terminal C — la app
npm run dev
```

Abre `http://localhost:5173`. La consola de los emuladores está en
`http://localhost:4000`.

## Cuentas de prueba

`npm run seed` crea 3 cuentas reales (Firebase Auth, vía el emulador) con
contraseña `demo1234`:

| Correo | Rol |
|---|---|
| `lider@demo.reactiva` | Líder comunitario |
| `org@demo.reactiva` | Organización |
| `admin@demo.reactiva` | Coordinación (admin) |

El registro público (`/registro`) solo permite elegir "Líder comunitario" u
"Organización" — a propósito no hay forma de auto-asignarse "Coordinación"
desde el formulario público, igual que en un producto real no te vuelves
admin desde la pantalla de registro. Para esta demo usa la cuenta
`admin@demo.reactiva` ya creada por el seed. Para dar acceso de coordinación
a una cuenta real más adelante, cambia su campo `role` a `"admin"` en el
documento `users/{uid}` de Firestore (consola de Firebase o del emulador).

## Probar el flujo completo (guion de demo)

1. Entra a `/` (landing page) → "Comenzar ahora" o inicia sesión con
   `lider@demo.reactiva` / `demo1234`.
2. Ve a "Mapa" — sin clave de Google Maps verás un listado con los 2 casos de
   demo (María y Pedro); esto es esperado, no un error.
3. Ve a "Reportar" y crea un nuevo caso. Antes de enviarlo, abre las
   DevTools del navegador → pestaña Network → cambia el throttling a
   **"Offline"** y adjunta una foto. Al enviar, deberías navegar de inmediato
   al detalle del caso con un aviso de "guardado localmente". Vuelve a poner
   el throttling en "Sin limitación" y en unos segundos la foto se sincroniza
   (verificable en la consola de emuladores, pestaña Storage/Firestore).
4. Abre el caso de "María" (`/casos/maria-tienda-demo`), inicia y confirma su
   verificación — se calculará su prioridad automáticamente.
5. En el mismo caso verás "Coincidencias sugeridas" con las ofertas
   compatibles y el porcentaje de compatibilidad. Crea una coincidencia.
6. Cierra sesión e inicia con `org@demo.reactiva` / `demo1234`. Ve a
   "Seguimiento", abre la coincidencia y avánzala por el pipeline (aceptada →
   en preparación → en camino → entregada, adjuntando evidencia en el último
   paso) — solo la organización puede ejecutar estos pasos.
7. Vuelve a entrar como líder para confirmar "verificada"/"caso cerrado" —
   ese cierre le corresponde a la comunidad, no a la organización.
8. Inicia con `admin@demo.reactiva` / `demo1234`, ve a "Tablero" y "Usuarios"
   y confirma que los indicadores reflejan el caso atendido.

## Recuperar contraseña ("¿Olvidaste tu contraseña?")

El flujo completo está implementado: pedir el correo → recibir el enlace →
abrir una pantalla propia (`/reset-password`, con la marca de la app, no la
página genérica de Firebase) → definir una nueva contraseña → iniciar sesión
con ella. Ya se probó de punta a punta y funciona.

**Limitación real del emulador, no un bug**: el Auth Emulator de Firebase
**no envía correos reales** — nunca lo hace, para nada, con ningún proyecto.
Cuando pruebas localmente con `VITE_USE_FIREBASE_EMULATORS=true`, el enlace
de recuperación se genera pero no llega a ningún buzón; puedes verlo en la
consola de emuladores (`http://127.0.0.1:4000/auth`, pestaña del usuario) o
vía `http://127.0.0.1:9099/emulator/v1/projects/demo-reactiva-territorio/oobCodes`.

**Para que el correo llegue de verdad**, necesitas un proyecto real de
Firebase (sección siguiente) con `VITE_USE_FIREBASE_EMULATORS=false`. Con
credenciales reales, Firebase envía el correo automáticamente — no hace
falta configurar ningún servidor de correo aparte, y el código ya está listo
para eso.

## Verificación en dos pasos (2FA con Google Authenticator)

Cualquier cuenta puede activar un segundo factor TOTP desde **Seguridad de tu
cuenta** (ícono de escudo junto a "Cerrar sesión", o enlace en el pie del
panel): genera un código QR, lo escaneas con Google Authenticator (o Authy,
1Password, etc.), confirmas con el código de 6 dígitos, y desde ahí el login
pide ese código además de la contraseña.

**Esto usa la API de Multi-Factor Authentication de Firebase (`TotpMultiFactorGenerator`),
no una implementación propia.** Dos requisitos reales de Firebase, no
opcionales:

1. El proyecto debe estar en **Identity Platform** (upgrade gratis, sin
   costo salvo que superes 50,000 usuarios activos/mes). Se activa una vez
   con el Admin SDK (`projectConfigManager().updateProjectConfig(...)`) o
   desde Google Cloud Console.
2. El **correo del usuario debe estar verificado** antes de poder inscribir
   un segundo factor — si no lo está, la pantalla de Seguridad pide
   verificarlo primero. Las 3 cuentas demo ya vienen con
   `emailVerified: true` desde `seed.ts` para que la demo no tenga fricción.

**No funciona contra el emulador local** — la generación de secretos TOTP no
está implementada ahí (bug conocido de Firebase, ver
[firebase-tools#6224](https://github.com/firebase/firebase-tools/issues/6224)).
Solo se puede probar contra un proyecto real con Identity Platform activado.

## Pruebas unitarias

La priorización (`src/domain/priority.ts`) y el motor de coincidencias
(`src/domain/matching.ts`) son funciones puras, testeadas con Vitest:

```bash
npm test
```

## Configurar `VITE_GOOGLE_MAPS_API_KEY` (mapa real en vez del listado)

Sin esta clave, la pantalla "Mapa" funciona igual pero muestra un listado en
vez del mapa interactivo — no es un error, es el modo de respaldo. Para
activar el mapa real:

1. Entra a [Google Cloud Console](https://console.cloud.google.com/) e inicia
   sesión con tu cuenta de Google.
2. Crea un proyecto nuevo (o usa uno existente) desde el selector de
   proyectos arriba a la izquierda.
3. Ve a **APIs y servicios → Biblioteca** y habilita:
   - **Maps JavaScript API**
4. Ve a **APIs y servicios → Credenciales → Crear credenciales → Clave de
   API**. Se genera una clave (empieza con `AIza...`).
5. (Recomendado, no obligatorio para pruebas) Haz clic en la clave recién
   creada → **Restricciones de la aplicación** → "Sitios web" → agrega
   `http://localhost:5173/*` mientras pruebas localmente, y tu dominio real
   una vez publicado (ej. `https://reactivaterritorio.web.app/*`). En
   **Restricciones de API**, limita la clave a "Maps JavaScript API". El
   cambio puede tardar unos minutos en aplicarse.
6. Copia la clave a `.env.local`:
   ```
   VITE_GOOGLE_MAPS_API_KEY=AIzaSy...tu_clave_aqui
   ```
7. Reinicia `npm run dev` (Vite solo lee `.env.local` al arrancar). El mapa
   real debería aparecer en `/mapa` inmediatamente.

**Costos**: Google Cloud pide una cuenta de facturación activa para usar
Maps Platform, pero incluye ~$200 USD de crédito gratis mensual — más que
suficiente para un prototipo o demo de hackathon. Si no quieres asociar
facturación todavía, el modo de listado (sin clave) sigue siendo
completamente funcional para la demo.

## Desplegar en Firebase Hosting

El sitio en vivo (`https://reactivaterritorio.web.app`) corre en **Firebase
Hosting**, sobre el mismo proyecto real que Auth/Firestore/Storage — un solo
login, sin depender de un servicio externo aparte. `firebase.json` ya incluye
la sección `hosting` con la carpeta `dist` y el *rewrite* que hace que React
Router funcione en producción (sin eso, recargar `/panel` o `/alertas` daría
404).

**Requisito real de Firebase, no opcional**: Storage exige el plan **Blaze**
(pago por uso) desde 2024, incluso para uso dentro de la cuota gratuita —
Spark ya no alcanza. Blaze se mantiene en $0 mientras no superes esa cuota
(5GB de Storage, 50k MAU de Auth, etc.), pero sí requiere una tarjeta
registrada en Firebase Console.

1. **Crea el proyecto Firebase real** (una sola vez), en
   https://console.firebase.google.com → **Agregar proyecto**:
   - **Authentication → Sign-in method → habilita Correo/contraseña.**
   - **Firestore Database → Crear base de datos** (modo producción, Database
     ID `(default)`, la región que prefieras).
   - **Storage → Comenzar** (pide subir a Blaze primero si aún estás en
     Spark).
   - **Configuración del proyecto → tus apps → Web (`</>`)** → registra una
     app y copia el bloque `firebaseConfig` — son valores públicos, van
     igual en el navegador de cualquier visitante.
   - **Configuración del proyecto → Cuentas de servicio → Generar nueva
     clave privada** → descarga el `.json`. Esta clave tiene acceso total al
     proyecto — **nunca la subas a git** (el `.gitignore` ya bloquea
     `*-firebase-adminsdk-*.json` y `serviceAccountKey*.json` por si acaso).

2. **Con esa clave, todo lo demás se hace por CLI/Admin SDK — sin tocar la
   consola de Firebase de nuevo**:

   ```bash
   # Reglas de Firestore y Storage
   GOOGLE_APPLICATION_CREDENTIALS=./tu-clave.json \
     npx firebase deploy --only firestore:rules,storage --project TU_PROJECT_ID

   # Habilitar 2FA (TOTP) en el proyecto — ver sección de 2FA arriba
   # (requiere un pequeño script con projectConfigManager().updateProjectConfig(),
   # no hay botón directo en la consola para esto)

   # Sembrar las 3 cuentas demo + casos/ofertas/coincidencias reales
   GOOGLE_APPLICATION_CREDENTIALS=./tu-clave.json SEED_TARGET=prod \
     SEED_PROJECT_ID=TU_PROJECT_ID npx tsx scripts/seed.ts

   # Build apuntando a producción: crea .env.production.local con los 6
   # valores de firebaseConfig + VITE_USE_FIREBASE_EMULATORS=false
   # (Vite lo mezcla automáticamente sobre .env.local solo en `vite build`)
   npx vite build

   # Publicar
   GOOGLE_APPLICATION_CREDENTIALS=./tu-clave.json \
     npx firebase deploy --only hosting --project TU_PROJECT_ID
   ```

   La CLI de Firebase acepta la misma `GOOGLE_APPLICATION_CREDENTIALS` que el
   Admin SDK — no hace falta `firebase login` interactivo en absoluto.

3. Consigue una clave de Google Maps Platform (ver sección anterior) y
   restríngela a tu dominio real de Hosting una vez publicado.

Sin proyecto Firebase real, el sitio compila igual, pero login/registro y
todas las pantallas con datos quedan rotos para cualquiera que no sea tu
máquina de desarrollo con el emulador corriendo — por eso el paso 1 no es
opcional para un deploy público.

## Aviso de privacidad

La plataforma maneja datos reales de personas en situación de vulnerabilidad
(nombre, teléfono, ubicación, fotos de evidencia). El texto completo de qué
se guarda, para qué y cómo pedir corrección/borrado está en
[`/privacidad`](https://reactivaterritorio.web.app/privacidad) — enlazado
desde el pie de la landing y del panel autenticado.

## Fuera de alcance en este MVP

Compra Local, empleo para la reconstrucción, analítica con BigQuery/Looker,
clasificación con Gemini/Vertex AI y notificaciones push quedan planteados
como evolución del producto, no incluidos en este prototipo. Tampoco incluye
(por ahora): exportar reportes a PDF/CSV desde el Tablero, code-splitting del
bundle (Vite avisa que pesa ~1MB — funciona bien igual, es una optimización
pendiente) y una app instalable (PWA) más allá de la persistencia offline de
Firestore ya implementada.
