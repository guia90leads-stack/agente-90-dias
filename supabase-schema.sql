-- ============================================================
--  SCHEMA DE SUPABASE — Copiar y pegar en el SQL Editor
--  de tu proyecto en supabase.com
-- ============================================================

-- Habilitar la extension para UUIDs (ya viene activa en Supabase)
create extension if not exists "uuid-ossp";

-- ============================================================
--  TABLA: user_settings
--  Configuracion personal de cada agente
-- ============================================================
create table if not exists public.user_settings (
  id          uuid default gen_random_uuid() primary key,
  user_id     uuid references auth.users(id) on delete cascade not null unique,
  start_date  date,
  active_days integer[] default array[1,2,3,4,5],
  timezone    text default 'America/Argentina/Buenos_Aires',
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- Seguridad: cada usuario solo ve sus propios datos
alter table public.user_settings enable row level security;
create policy "user_settings: usuario ve solo los suyos"
  on public.user_settings for all
  using (auth.uid() = user_id);

-- ============================================================
--  TABLA: task_completions
--  Registro de cada tarea completada por dia
-- ============================================================
create table if not exists public.task_completions (
  id             uuid default gen_random_uuid() primary key,
  user_id        uuid references auth.users(id) on delete cascade not null,
  task_id        integer not null check (task_id between 1 and 7),
  completed_date date not null,
  completed_at   timestamptz default now(),
  unique(user_id, task_id, completed_date)
);

alter table public.task_completions enable row level security;
create policy "task_completions: usuario ve solo los suyos"
  on public.task_completions for all
  using (auth.uid() = user_id);

-- Indice para consultas por fecha
create index if not exists idx_task_completions_user_date
  on public.task_completions(user_id, completed_date);

-- ============================================================
--  TABLA: goal_entries
--  Progreso mensual de las 4 metas principales
-- ============================================================
create table if not exists public.goal_entries (
  id           uuid default gen_random_uuid() primary key,
  user_id      uuid references auth.users(id) on delete cascade not null,
  month        date not null,  -- primer dia del mes (ej: 2024-06-01)
  captaciones  integer default 0 check (captaciones >= 0),
  visitas      integer default 0 check (visitas >= 0),
  videos       integer default 0 check (videos >= 0),
  cierres      integer default 0 check (cierres >= 0),
  updated_at   timestamptz default now(),
  unique(user_id, month)
);

alter table public.goal_entries enable row level security;
create policy "goal_entries: usuario ve solo los suyos"
  on public.goal_entries for all
  using (auth.uid() = user_id);

-- ============================================================
--  TABLA: push_subscriptions
--  Suscripciones de notificaciones push por usuario
-- ============================================================
create table if not exists public.push_subscriptions (
  id           uuid default gen_random_uuid() primary key,
  user_id      uuid references auth.users(id) on delete cascade not null unique,
  subscription jsonb not null,
  active_days  integer[] default array[1,2,3,4,5],
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

-- IMPORTANTE: La Edge Function necesita leer todas las suscripciones
-- por eso esta tabla usa service_role (no RLS para la funcion)
alter table public.push_subscriptions enable row level security;
create policy "push_subscriptions: usuario ve solo los suyos"
  on public.push_subscriptions for all
  using (auth.uid() = user_id);

-- Politica especial para que la Edge Function (service role) pueda leer todo
create policy "push_subscriptions: service role lee todo"
  on public.push_subscriptions for select
  using (true);

-- ============================================================
--  CRON JOB — Dispara la Edge Function cada minuto
--  Ejecutar DESPUES de crear la Edge Function
-- ============================================================

-- Primero habilitar pg_cron en Extensions de Supabase
-- Luego ejecutar esto:

/*
select cron.schedule(
  'send-push-notifications',
  '* * * * *',
  $$
    select net.http_post(
      url := 'https://vrfgddijjzlvymuvdjzw.supabase.co/functions/v1/send-notifications',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer TU_SERVICE_ROLE_KEY"}'::jsonb,
      body := '{}'::jsonb
    );
  $$
);
-- Reemplaza TU_PROJECT_ID con el Reference ID de tu proyecto (Settings > General)
-- Reemplaza TU_SERVICE_ROLE_KEY con tu service_role key (Settings > API)
*/

-- NOTA: Reemplaza TU_PROJECT_ID y TU_SERVICE_ROLE_KEY antes de ejecutar el cron.
-- El Project ID lo encontras en Settings > General de tu proyecto Supabase.
-- La Service Role Key la encontras en Settings > API.
