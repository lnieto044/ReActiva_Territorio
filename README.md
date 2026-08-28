# ReActiva Territorio — MVP

Prototipo del hackathon: convierte los reportes de necesidades tras el sismo en
acciones verificables de recuperación. Cubre las 5 funciones mínimas descritas
en la propuesta:

1. Registrar un negocio/persona afectada.
2. Guardar el reporte localmente sin conexión y sincronizarlo automáticamente.
3. Mostrar el caso en un mapa.
4. Relacionar la necesidad con una oferta compatible (reglas simples, sin IA).
5. Actualizar el caso como atendido y ver el resultado en un tablero.

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

## Pruebas unitarias

La priorización (`src/domain/priority.ts`) y el motor de coincidencias
(`src/domain/matching.ts`) son funciones puras, testeadas con Vitest:

```bash
npm test
```

## Conectar credenciales reales más adelante

1. Crea un proyecto en https://console.firebase.google.com y una app web.
2. Reemplaza los valores `VITE_FIREBASE_*` en `.env.local` con los de tu
   proyecto y pon `VITE_USE_FIREBASE_EMULATORS=false`.
3. Despliega las reglas: `npx firebase deploy --only firestore:rules,storage`.
4. Consigue una clave de Google Maps Platform y ponla en
   `VITE_GOOGLE_MAPS_API_KEY` (ver guía paso a paso abajo).

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
   `http://localhost:5173/*` mientras pruebas localmente, y el dominio real
   donde despliegues la app más adelante. En **Restricciones de API**,
   limita la clave a "Maps JavaScript API".
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

## Fuera de alcance en este MVP

Compra Local, empleo para la reconstrucción, analítica con BigQuery/Looker,
clasificación con Gemini/Vertex AI y notificaciones push quedan planteados
como evolución del producto, no incluidos en este prototipo.
