// ============================================================
//  DATOS DEL PLAN - Las 7 tareas diarias y manuales
// ============================================================

const TASKS = [
  {
    id: 1,
    hora: '09:00',
    horaNum: 9,
    emoji: '📋',
    titulo: 'Revisar tareas y speech',
    descripcion: 'Revisá el calendario de citas, respondé mensajes pendientes, preparate el speech para llamadas y organizá materiales del día.',
    manual: null,
    color: '#4e9af1',
    duracion: '1 hora',
  },
  {
    id: 2,
    hora: '10:00',
    horaNum: 10,
    emoji: '🔍',
    titulo: 'Buscar dueños en Facebook',
    descripcion: 'Buscá en Facebook Marketplace propiedades "vende dueño". Contactá a los dueños con tu propuesta de servicio. Meta: 10 contactos nuevos.',
    manual: 'meta',
    color: '#4e9af1',
    duracion: '1 hora',
  },
  {
    id: 3,
    hora: '11:00',
    horaNum: 11,
    emoji: '✏️',
    titulo: 'Editar contenido',
    descripcion: 'Editá videos en CapCut, creá reels para Instagram, preparate TikToks y subí a redes. Meta: al menos 1-2 videos editados.',
    manual: 'capcut',
    color: '#4e9af1',
    duracion: '1 hora',
  },
  {
    id: 4,
    hora: '12:00',
    horaNum: 12,
    emoji: '📅',
    titulo: 'Gestionar visitas',
    descripcion: 'Confirmá las citas de hoy, preparate folletos y material de ventas, enviá recordatorios a clientes, planificá la ruta.',
    manual: 'app',
    color: '#4e9af1',
    duracion: '1 hora',
  },
  {
    id: 5,
    hora: '13:00',
    horaNum: 13,
    emoji: '🏆',
    titulo: 'BLOQUE DE ORO — Visitas con clientes',
    descripcion: 'BLOQUE SAGRADO hasta las 17:00. No interrumpas por nada. Visitas con clientes, medí el interés, tomá notas, cerrá el próximo paso. Acá se cierran ventas.',
    manual: 'agente',
    color: '#f7b731',
    duracion: '4 horas',
    esOroBrillo: true,
  },
  {
    id: 6,
    hora: '17:00',
    horaNum: 17,
    emoji: '🎬',
    titulo: 'Editar Turno 2',
    descripcion: 'Filmá videos en la calle o en propiedades, editá en CapCut, creá 5 TikToks, publicá en todas las redes.',
    manual: 'capcut',
    color: '#4e9af1',
    duracion: '2 horas',
  },
  {
    id: 7,
    hora: '19:00',
    horaNum: 19,
    emoji: '💬',
    titulo: 'Gestionar Turno 2',
    descripcion: 'Respondé WhatsApp pendientes, confirmá visitas de mañana, enviá recordatorios, preparate documentos para el día siguiente.',
    manual: 'agente',
    color: '#4e9af1',
    duracion: '2 horas',
  },
];

const MANUALES = {
  app: {
    nombre: 'Manual App Lead\'s',
    emoji: '📱',
    contenido: `# MANUAL DE LA APP Lead's Inmobiliaria
## Cómo Usar la Plataforma Paso a Paso

### ¿Qué podés hacer en la app?
- Cargar y gestionar propiedades
- Cargar y seguir clientes
- Agendar llamadas y visitas
- Registrar informes de visitas
- Calcular valuaciones de propiedades
- Generar folletos en PDF
- Ver propiedades en mapa

---
### Paso 1: Cómo Ingresar
Ve a https://leads-app-wheat.vercel.app → LOGIN → Email + Contraseña → Ingresar.

---
### Paso 2: Menú Principal

| Opción | Para qué sirve |
|--------|----------------|
| 🏠 Propiedades | Ver, crear y editar propiedades |
| 👥 Clientes | Ver, crear y editar clientes |
| 📋 Visitas | Registrar informes de visitas |
| 💰 Tasación | Calcular valor estimado |
| 🗺️ Mapa | Ver propiedades en mapa |

---
### Paso 3: Cargar Nueva Propiedad
1. Clickeá "Propiedades" → botón "+"
2. Completá datos básicos: Título, Tipo, Dirección, Zona, Ciudad
3. Características: Dormitorios, Baños, Superficie, Cochera, Estado
4. Precio: número sin puntos (ej: 150000), Moneda (USD o ARS)
5. Presioná "Guardar"
6. Para fotos: entrá a la propiedad → "Editar ficha" → "+" en fotos → máximo 10 fotos

---
### Paso 4: Cargar Nuevo Cliente
1. Clickeá "Clientes" → "+"
2. Tipo: COMPRADOR (quiere comprar) o CAPTACIÓN (tiene propiedad para vender)
3. Completá: Nombre, Apellido, Teléfono (obligatorios)
4. Etapa: Nuevo lead → Primer contacto → Llamada agendada → Visita coordinada → Oferta presentada
5. Para agendar: si la etapa es "Llamada agendada" o "Visita coordinada", seleccioná fecha y hora
6. Recibirás recordatorios 24hs y 1 hora antes

---
### Paso 5: Registrar Visita
1. Clickeá "Visitas" → "+"
2. Completá: Nombre cliente, Teléfono, Asesor
3. Interés: Muy interesado / Interesado / No interesado
4. ¿Hizo oferta? Sí/No + monto si aplica
5. Próximo paso: Segunda visita / Enviar docs / Negociar / Descartado

---
### ✅ Tips Clave
- **Actualizá clientes diariamente** — cambiá su etapa después de cada contacto
- **Agendá SIEMPRE** — nunca dejes una cita sin agendar en la app
- **Generá PDFs** de propiedades para usar en visitas y WhatsApp
- **Registrá todas las visitas** — así ves si el cliente avanza o se estanca
- **Fotos de calidad** — una propiedad sin fotos no se vende`,
  },

  capcut: {
    nombre: 'Manual CapCut',
    emoji: '🎬',
    contenido: `# MANUAL CAPCUT
## Edición de Video Profesional para Redes Sociales

### ¿Por qué CapCut?
- 100% GRATIS
- Subtítulos automáticos
- Música libre de copyright incluida
- Los mejores creadores del mundo lo usan

---
### Paso 1: Empezar un Proyecto
1. Ve a capcut.com o descargá la app
2. Presioná "Nuevo Proyecto"
3. Importá tu video (botón "+" o "Import")
4. Arrastrá el video al timeline (barra de abajo)

---
### Paso 2: Las 3 Zonas
- **ARRIBA:** Vista previa (ves tu video mientras editás)
- **CENTRO:** Botones de edición (dividir, música, efectos, texto)
- **ABAJO:** Timeline (la línea de tiempo con tus clips)

---
### Paso 3: Dividir Clips (Lo más importante)
Videos buenos = clips de máximo 3 segundos.
1. Ponete en el lugar donde querés cortar
2. Presioná "SPLIT" (la tijera)
3. Repetí hasta tener múltiples clips
> **Meta:** Video 30 seg = 10 clips de 3 seg cada uno

---
### Paso 4: Transiciones
1. En el timeline, clickeá donde se juntan 2 clips
2. Presioná "Transiciones"
3. Elegí: **FADE** (más profesional), **SLIDE** o **ZOOM** (ideal para propiedades)
4. Duración: 0.3-0.5 segundos

---
### Paso 5: Música
**Opción 1 (recomendada):** Audio → Music → elegí género (Corporate, Trending, Chill)
**Opción 2 (voz en off):** Audio → Voiceover → grabá tu voz

**Mix ideal:**
- Música de fondo: 30-40% volumen
- Voz en off: 30% volumen
- Audio original del video: 20-30% volumen

---
### Paso 6: Textos y Subtítulos
**Subtítulos automáticos (lo mejor):**
1. En el timeline → "Auto Caption"
2. Seleccioná idioma (Español)
3. CapCut transcribe tu audio automáticamente
4. Revisá y corregí errores

---
### Paso 7: Mejorar Imagen
Si el video se ve oscuro: Seleccioná clip → "Adjust"
- Brightness (brillo): +20-30
- Saturation (colores): +15-20
- Contrast: +10

---
### Paso 8: Exportar
1. Presioná "Export" (arriba a la derecha)
2. Calidad: **1080p** (mejor para redes)
3. Esperá 1-5 minutos
4. ¡Listo para subir!

---
### ✅ Reglas de Oro
- Siempre revisá el video COMPLETO antes de exportar
- Usá subtítulos SIEMPRE (muchos ven sin sonido)
- No abuses de efectos — cada uno debe tener propósito
- Para propiedades: el zoom es tu mejor amigo
- **10 videos practicados = nivel profesional**`,
  },

  meta: {
    nombre: 'Manual Meta Ads',
    emoji: '📣',
    contenido: `# MANUAL META ADS
## Publicidad en Facebook e Instagram para Agentes Inmobiliarios

### El Sistema en 3 Partes
**CAMPAÑA** → **CONJUNTO DE ANUNCIOS** → **ANUNCIO**
- Campaña: El objetivo (ej: conseguir clientes)
- Conjunto: El presupuesto y duración
- Anuncio: La imagen/video + texto

---
### Paso 1: Acceder al Administrador
1. Ve a ads.facebook.com
2. Iniciá sesión con tu Facebook
3. Presioná "+ Crear"

---
### Paso 2: Crear Campaña
1. Presioná "+ Crear Campaña"
2. Objetivo: **"Mensajes"** (para que los clientes escriban directamente)
3. Nombre: "Venta [Dirección]" (ej: Venta Depto Centro)

---
### Paso 3: Presupuesto y Audiencia
**Presupuesto:**
- Presupuesto diario: $5-10 USD
- Duración: 30 días
- Total aproximado: $150-300 USD

**Audiencia (lo más importante):**
- Edad: 25-65 años
- Ubicación: Tu ciudad o zona específica
- Intereses: "Bienes raíces", "Inversión inmobiliaria", "Comprar casa"

> Cuanto más ESPECÍFICA la audiencia, mejor ROI. No gastes en gente que no va a comprar.

---
### Paso 4: El Anuncio
**Formato:** Foto profesional (1200x628px) o video corto 15-30 segundos (mejor rendimiento)

**Texto que funciona:**
> "Encontré la casa de tus sueños en [ZONA]. 3 ambientes, 120m², vista al parque. ¿Te interesa verla? Tocá aquí y te mando toda la info. 🏡"

**Reglas del texto:**
- Máximo 125 caracteres (breve y directo)
- Incluí un beneficio claro (m², precio, ubicación)
- Siempre un CTA: "Tocá aquí", "Enviame mensaje", "Más info"
- Usá emojis 🏡 💰 ✅

---
### Paso 5: Métricas Clave

| Métrica | Qué significa | Bueno es... |
|---------|---------------|-------------|
| Alcance | Cuántas personas vieron | Más = mejor |
| CTR (%) | % que clickearon | Mayor a 2% |
| Costo por clic | Cuánto pagaste por clic | Menos de $0.50 USD |

---
### Errores Comunes
❌ Audiencia muy amplia → gastás en quien no compra
❌ Texto muy largo → nadie lo lee
❌ Imagen de mala calidad → pierdes credibilidad
❌ No revisar métricas → anuncios malos siguen gastando

---
### ✅ Rutina Diaria Meta Ads
Crea anuncio → Esperá 24hs → Revisá métricas → Si CTR < 1% pausalo → Optimizá → Repetí`,
  },

  agente: {
    nombre: 'Manual del Agente',
    emoji: '🏆',
    contenido: `# MANUAL DEL AGENTE INMOBILIARIO
## Lead's Inmobiliaria — WhatsApp, Redes y Estrategia

---
### 1. Sistema de Etiquetas en WhatsApp

| Etiqueta | Significado |
|----------|-------------|
| 🔴 IMPORTANTE | Propiedades mayores a $100.000 USD |
| 🔵 CAPTACIÓN | Cliente con propiedad para vender |
| ✅ CAPTADO | Exclusividad FIRMADA |
| 💛 COMPRADOR | Cliente con dinero para comprar |
| 🟢 CIERRE | Propiedad reservada |

---
### 2. Mensaje de Bienvenida (Copiar y pegar)
> "¡Hola! 👋 Soy [Tu nombre], agente inmobiliario en Lead's. Para ayudarte lo mejor necesitamos agendarnos. ¿Qué día te viene bien?"

---
### 3. Respuesta Rápida para Filtrar Clientes
> "¡Buenas! ¿Me confirmás qué buscás, en qué zona, y cuál es tu presupuesto? Así filtro lo mejor para vos."

---
### 4. Cómo Agendar Correctamente
1. Ofrecé 3 horarios para elegir
2. Confirmá 24 horas antes
3. Recordatorio 1 hora antes
4. Registrá en la app Lead's

> "¡Hola! Para enviarte toda la información necesito que nos agendemos. ¿Qué día y hora te viene bien?"

**Dato clave:** Agentes agendados cierran 3x más ventas.

---
### 5. Fan Page de Facebook — Configuración
1. Facebook → menú "Páginas" → "Crear página nueva"
2. Completá información REAL de tu negocio
3. Logo como foto de perfil
4. Foto de portada atractiva
5. Vinculá Instagram y WhatsApp: Configuración → Cuentas vinculadas

---
### 6. Estrategia de Contenido Semanal
- **Lunes:** Video de propiedad disponible
- **Martes:** Tip de inversión inmobiliaria
- **Miércoles:** Video de propiedad disponible
- **Jueves:** Testimonio de cliente (con permiso)
- **Viernes:** Video de propiedad + dato del mercado
- **Sábado:** Detrás de escena / tu día como agente

---
### 7. Catálogo de WhatsApp Business
1. WhatsApp Business → "Catálogo"
2. "+ Agregar producto"
3. Completá: Nombre, precio, fotos, metros, zona, ambientes
> Incluí SIEMPRE el precio. El cliente se auto-selecciona.

---
### 8. Clave del Éxito en 90 Días
- Semana 1-2: Configurá todos los perfiles y la app
- Semana 3-4: Primer video con CapCut, 1 por día
- Mes 2: 2 videos diarios, primeras captaciones
- Mes 3: 5 videos diarios + Meta Ads = EXPLOSIÓN de mensajes

> Los primeros 30 días NO traen ventas. Estás construyendo autoridad. La consistencia es todo.

---
### 9. Bloque de Oro 13-17hs — Reglas
- APAGÁ notificaciones de redes sociales
- NO respondas WhatsApp durante el bloque
- Llevá folletos impresos y digitales
- Tomá notas en la app después de cada visita
- Siempre terminá con un "próximo paso" concreto`,
  },
};

const METAS = {
  captaciones: { label: 'Captaciones', emoji: '🏠', target: 10, unit: '/mes', min: 5 },
  visitas: { label: 'Visitas', emoji: '👣', target: 5, unit: '/día', min: 3 },
  videos: { label: 'Videos', emoji: '🎬', target: 50, unit: '/mes', min: 50 },
  cierres: { label: 'Cierres', emoji: '✅', target: 3, unit: '/mes', min: 2 },
};
