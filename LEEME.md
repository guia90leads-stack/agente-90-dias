# 🏠 Agente 90 Días — Guía de Instalación Completa
## Para personas sin conocimientos de programación

---

## ¿Qué vas a tener al final?
Una app instalada en tu iPhone que:
- Te manda notificaciones a las 9, 10, 11, 12, 13, 17 y 19hs con cada tarea
- Tiene tus 7 tareas diarias con checkboxes
- Muestra tu progreso en los 90 días y tus 4 metas
- Tiene los 4 manuales integrados con botón "Ver guía"
- Funciona sin internet una vez instalada

**Tiempo estimado: 45-60 minutos siguiendo estos pasos.**

---

## PASO 0 — Cuentas que necesitás crear (GRATIS)

Antes de empezar, creá estas 3 cuentas:

| Cuenta | Para qué | Link |
|--------|----------|------|
| **Supabase** | Guardar tus datos en la nube | https://supabase.com |
| **GitHub** | Guardar tu código | https://github.com |
| **Vercel** | Publicar la app gratis | https://vercel.com |

En cada una: usá tu email, creá contraseña, confirmá el email.

---

## PASO 1 — Crear el proyecto en Supabase

1. Entrá a **https://supabase.com** e iniciá sesión
2. Hacé click en **"New Project"**
3. Completá:
   - **Organization:** tu nombre o "Agente Inmobiliario"
   - **Name:** `agente-90-dias`
   - **Database Password:** elegí una contraseña segura (guardala)
   - **Region:** `South America (São Paulo)` (más cercano)
4. Click **"Create new project"** — tardará 1-2 minutos
5. Cuando esté listo, vas a ver el dashboard de tu proyecto

### 1.1 — Guardar tus claves de Supabase

En tu proyecto de Supabase, buscá estas claves:
1. Click en **"Settings"** (engranaje en el menú izquierdo)
2. Click en **"API"**
3. Vas a ver:
   - **Project URL** → la que empieza con `https://...supabase.co`
   - **anon public** key → una clave larga
   - **service_role secret** key → OTRA clave larga (esta es privada, no compartir)
4. **Copiá y guardá** los 3 valores en un bloc de notas por ahora

---

## PASO 2 — Crear las tablas en Supabase

1. En Supabase, click en **"SQL Editor"** (menú izquierdo, ícono de base de datos)
2. Click en **"New query"**
3. Abrí el archivo `supabase-schema.sql` de tu carpeta `agente-pwa`
4. Copiá TODO el contenido y pegalo en el SQL Editor
5. Click en **"Run"** (botón verde)
6. Vas a ver `Success. No rows returned` — eso está perfecto

---

## PASO 3 — Generar las claves VAPID (para notificaciones)

Las claves VAPID son las que permiten enviar notificaciones push.

### Opción A — Usando una web online (más fácil)
1. Entrá a **https://web-push-codelab.glitch.me/**
2. Hacé click en **"Generate VAPID Keys"**
3. Vas a ver dos claves:
   - **Public Key** (para pegar en `config.js`)
   - **Private Key** (para pegar en los Secrets de Supabase)
4. Guardalas en tu bloc de notas

### Opción B — Usando Node.js (si lo tenés instalado)
```
npm install -g web-push
web-push generate-vapid-keys
```

---

## PASO 4 — Configurar tus credenciales en la app

1. Abrí el archivo **`config.js`** con el Bloc de Notas o cualquier editor de texto
2. Reemplazá cada valor entre comillas:

```javascript
const CONFIG = {
  SUPABASE_URL: 'https://TU-PROYECTO.supabase.co',  // <-- pegá tu Project URL
  SUPABASE_ANON_KEY: 'eyJhbGci...',                  // <-- pegá tu anon public key
  VAPID_PUBLIC_KEY: 'BIK...',                        // <-- pegá tu VAPID Public Key
  TIMEZONE: 'America/Argentina/Buenos_Aires',
  UTC_OFFSET: -3,
  DEFAULT_START_DATE: '',
  DEFAULT_ACTIVE_DAYS: [1, 2, 3, 4, 5],
};
```

3. Guardá el archivo (Ctrl+S)

---

## PASO 5 — Subir el código a GitHub

1. Entrá a **https://github.com** e iniciá sesión
2. Click en el botón **"+"** (arriba a la derecha) → **"New repository"**
3. Completá:
   - **Repository name:** `agente-90-dias`
   - Elegí **Public** (Vercel lo necesita así)
4. Click **"Create repository"**
5. En la página que aparece, buscá la sección que dice **"…or upload an existing file"**
6. Click en **"uploading an existing file"**
7. Arrastrá todos los archivos de tu carpeta `agente-pwa` (seleccioná todos con Ctrl+A)
   - ⚠️ **Importante:** También arrastrá la carpeta `supabase` completa
8. Click en **"Commit changes"**
9. Esperá que suba (puede tardar 1-2 minutos)

---

## PASO 6 — Publicar en Vercel

1. Entrá a **https://vercel.com** e iniciá sesión (podés usar "Login with GitHub")
2. Click en **"Add New Project"**
3. Click en **"Import Git Repository"**
4. Seleccioná tu repositorio `agente-90-dias`
5. En la configuración, dejá todo como está
6. Click en **"Deploy"**
7. Esperá 1-2 minutos
8. Vercel te va a dar una URL tipo `https://agente-90-dias.vercel.app`
9. **¡Guardá esa URL!** Es tu app.

---

## PASO 7 — Crear y desplegar la Edge Function

La Edge Function es la que envía las notificaciones automáticamente cada hora.

### 7.1 — Instalar Supabase CLI (solo una vez)
1. Bajate Supabase CLI desde: https://supabase.com/docs/guides/cli/getting-started
   - En Windows: descargá el `.exe` del link de releases
   - Ponélo en una carpeta fácil de encontrar (ej: `C:\supabase\`)

### 7.2 — Configurar variables de entorno en Supabase
1. En tu proyecto de Supabase, click en **"Edge Functions"** (menú izquierdo)
2. Click en **"Manage secrets"** (o "Environment Variables")
3. Agregá estos 5 secretos uno por uno:

| Nombre | Valor |
|--------|-------|
| `SUPABASE_URL` | Tu Project URL (empieza con https://) |
| `SUPABASE_SERVICE_ROLE_KEY` | Tu service_role key (la privada) |
| `VAPID_PUBLIC_KEY` | Tu VAPID Public Key |
| `VAPID_PRIVATE_KEY` | Tu VAPID Private Key |
| `VAPID_SUBJECT` | `mailto:tu@email.com` |
| `APP_URL` | Tu URL de Vercel (ej: https://agente-90-dias.vercel.app) |

### 7.3 — Subir la Edge Function
En la terminal (cmd o PowerShell de Windows):
```
cd C:\Users\TU-USUARIO\Desktop\agente-pwa
supabase login
supabase link --project-ref TU_PROJECT_ID
supabase functions deploy send-notifications
```

> El Project ID lo encontrás en Supabase → Settings → General → "Reference ID"

### 7.4 — Activar el cron job (se dispara automáticamente cada minuto)
1. En Supabase, click en **"Database"** → **"Extensions"**
2. Buscá **"pg_cron"** y activalo (toggle ON)
3. Buscá **"pg_net"** y activalo también
4. Volvé al **SQL Editor**
5. Copiá y pegá este código (reemplazando los valores):

```sql
select cron.schedule(
  'send-push-notifications',
  '* * * * *',
  $$
    select net.http_post(
      url := 'https://TU_PROJECT_ID.supabase.co/functions/v1/send-notifications',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer TU_SERVICE_ROLE_KEY"}'::jsonb,
      body := '{}'::jsonb
    );
  $$
);
```

6. Reemplazá `TU_PROJECT_ID` y `TU_SERVICE_ROLE_KEY` con tus valores reales
7. Click **"Run"**

---

## PASO 8 — Instalar la app en iPhone

1. Abrí **Safari** en tu iPhone (tiene que ser Safari, no Chrome)
2. Entrá a tu URL de Vercel: `https://agente-90-dias.vercel.app`
3. Iniciá sesión con tu email (te llega un link mágico)
4. Para instalar: tocá el botón **Compartir** (📤 el cuadrado con la flecha)
5. Bajá y tocá **"Agregar a pantalla de inicio"**
6. Confirmá el nombre y tocá **"Agregar"**
7. **Importante:** Abrí la app DESDE el ícono de la pantalla de inicio (no desde Safari)
8. Andá a **⚙️ Config** → tocá **"Activar"** notificaciones
9. Cuando iPhone pregunte si permitís notificaciones, tocá **"Permitir"**

---

## PASO 9 — Configurar tu plan

1. En la app, andá a **⚙️ Config**
2. En **"Fecha de inicio"**, elegí la fecha en que empezás tus 90 días
3. En **"Días activos"**, elegí qué días trabajás (ej: Lunes a Viernes)
4. ¡Listo! La app calculará en qué día del plan estás

---

## ✅ CHECKLIST — ¿Todo funciona?

Verificá estas cosas una por una:

- [ ] Puedo abrir la app en el navegador y me pide email
- [ ] Recibo el email con el magic link
- [ ] Al entrar veo las 7 tareas de hoy
- [ ] Puedo marcar tareas como completadas
- [ ] El calendario muestra los días con color
- [ ] El progreso muestra mi día actual (ej: "Día 1 de 90")
- [ ] Las metas muestran 0 y puedo sumarles con "+"
- [ ] Los manuales se abren al tocar
- [ ] El botón "Ver guía" en las tareas abre el manual correcto
- [ ] Instalé la app en iPhone (aparece en pantalla de inicio)
- [ ] Las notificaciones están activadas (en Config aparece "Activadas")
- [ ] A las 9:00hs del próximo día laboral llegó la notificación de "Revisar tareas"

---

## 🆘 Solución de problemas frecuentes

**"No recibo el magic link"**
→ Revisá la carpeta de spam. Supabase lo manda desde `noreply@supabase.io`.

**"La app no se instala en iPhone"**
→ Tiene que ser Safari (no Chrome). Tocá el ícono Compartir y buscá "Agregar a pantalla de inicio".

**"No llegan las notificaciones"**
→ 1) La app tiene que estar instalada (no abierta en Safari). 2) En Config, las notificaciones deben decir "Activadas". 3) En Ajustes de iPhone → [Nombre de la app] → Notificaciones → verificá que estén activadas.

**"El cron no funciona"**
→ Revisá que pg_cron esté activado en Extensions. Verificá que el Service Role Key en el cron sea correcto.

**"Error al cargar datos"**
→ Verificá que en `config.js` el SUPABASE_URL y ANON_KEY estén correctos (sin espacios extra).

---

## 📞 Estructura de archivos

```
agente-pwa/
├── index.html              ← La app completa (pantalla de login + app)
├── styles.css              ← Diseño visual
├── config.js               ← TUS CREDENCIALES (solo tocás este archivo)
├── tasks-data.js           ← Las 7 tareas y los 4 manuales
├── db.js                   ← Conexión con Supabase
├── push.js                 ← Sistema de notificaciones
├── app.js                  ← Lógica principal de la app
├── sw.js                   ← Service Worker (offline + push)
├── manifest.json           ← Configuración PWA instalable
├── icon.svg                ← Ícono de la app
├── vercel.json             ← Configuración de Vercel
├── supabase-schema.sql     ← Tablas de la base de datos
└── supabase/
    └── functions/
        └── send-notifications/
            └── index.ts    ← Función que envía las notificaciones
```

---

## 🎯 Recordatorio de horarios de notificaciones

| Hora | Tarea |
|------|-------|
| 09:00 | 📋 Revisar tareas y speech |
| 10:00 | 🔍 Buscar dueños en Facebook |
| 11:00 | ✏️ Editar contenido |
| 12:00 | 📅 Gestionar visitas |
| 13:00 | 🏆 BLOQUE DE ORO — Visitas (vibración fuerte) |
| 17:00 | 🎬 Editar Turno 2 |
| 19:00 | 💬 Gestionar Turno 2 |

---

¡Éxito en tus 90 días! 🚀
