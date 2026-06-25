// ============================================================
//  CONFIGURACION - SOLO EDITA ESTE ARCHIVO
//  Pega tus credenciales aqui. No toques nada mas.
// ============================================================

const CONFIG = {
  // 1. De tu proyecto en supabase.com -> Settings -> API
  SUPABASE_URL: 'https://vrfgddijjzlvymuvdjzw.supabase.co',
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZyZmdkZGlqanpsdnltdXZkanp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIzMDAwOTAsImV4cCI6MjA5Nzg3NjA5MH0.N9t1zAVv6S8Dl8g3kZUrhKtciveUJsaCC1kg-DhWMj8',

  // 2. Claves VAPID ya generadas — NO las cambies
  VAPID_PUBLIC_KEY: 'BBzWIMYGnXlhAX0PSiCqaBVuDL1d56N9Vz5sRlGhjXdKBNhnfDG252R4q6hoqRn0yohitksnu8qW_A2t9IrZDes',

  // 3. Tu zona horaria (no cambies si sos de Argentina)
  TIMEZONE: 'America/Argentina/Buenos_Aires',
  UTC_OFFSET: -3, // UTC-3

  // 4. Configuracion del plan (podes cambiar despues desde la app)
  APP_URL: 'https://agente-90-dias.vercel.app',
  DEFAULT_START_DATE: '', // Se configura dentro de la app
  DEFAULT_ACTIVE_DAYS: [1, 2, 3, 4, 5], // 1=Lunes ... 7=Domingo
};
