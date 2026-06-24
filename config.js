// ============================================================
//  CONFIGURACION - SOLO EDITA ESTE ARCHIVO
//  Pega tus credenciales aqui. No toques nada mas.
// ============================================================

const CONFIG = {
  // 1. De tu proyecto en supabase.com -> Settings -> API
  SUPABASE_URL: 'PEGAR_URL_DE_SUPABASE_AQUI',
  SUPABASE_ANON_KEY: 'PEGAR_ANON_KEY_AQUI',

  // 2. Claves VAPID ya generadas — NO las cambies
  VAPID_PUBLIC_KEY: 'BBzWIMYGnXlhAX0PSiCqaBVuDL1d56N9Vz5sRlGhjXdKBNhnfDG252R4q6hoqRn0yohitksnu8qW_A2t9IrZDes',

  // 3. Tu zona horaria (no cambies si sos de Argentina)
  TIMEZONE: 'America/Argentina/Buenos_Aires',
  UTC_OFFSET: -3, // UTC-3

  // 4. Configuracion del plan (podes cambiar despues desde la app)
  DEFAULT_START_DATE: '', // Se configura dentro de la app
  DEFAULT_ACTIVE_DAYS: [1, 2, 3, 4, 5], // 1=Lunes ... 7=Domingo
};
