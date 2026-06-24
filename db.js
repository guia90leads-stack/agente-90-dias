// ============================================================
//  BASE DE DATOS — Funciones para Supabase
// ============================================================

let supabaseClient = null;

function initSupabase() {
  if (supabaseClient) return supabaseClient;
  supabaseClient = window.supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
  return supabaseClient;
}

function getDB() {
  return initSupabase();
}

// ---- AUTH ----

async function signInWithEmail(email) {
  const db = getDB();
  const { error } = await db.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: 'https://agente-90-dias.vercel.app' },
  });
  return { error };
}

async function signInWithPassword(email, password) {
  const db = getDB();
  const { data, error } = await db.auth.signInWithPassword({ email, password });
  return { data, error };
}

async function signUpWithPassword(email, password) {
  const db = getDB();
  const { data, error } = await db.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: 'https://agente-90-dias.vercel.app' },
  });
  return { data, error };
}

async function getUser() {
  const db = getDB();
  const { data: { user } } = await db.auth.getUser();
  return user;
}

async function signOut() {
  const db = getDB();
  await db.auth.signOut();
}

function onAuthChange(callback) {
  const db = getDB();
  return db.auth.onAuthStateChange(callback);
}

// ---- USER SETTINGS ----

async function getUserSettings(userId) {
  const db = getDB();
  const { data, error } = await db
    .from('user_settings')
    .select('*')
    .eq('user_id', userId)
    .single();
  return { data, error };
}

async function saveUserSettings(userId, settings) {
  const db = getDB();
  const { data, error } = await db
    .from('user_settings')
    .upsert({ user_id: userId, ...settings, updated_at: new Date().toISOString() }, { onConflict: 'user_id' })
    .select()
    .single();
  return { data, error };
}

// ---- TASK COMPLETIONS ----

async function getCompletionsForDate(userId, dateStr) {
  const db = getDB();
  const { data, error } = await db
    .from('task_completions')
    .select('task_id')
    .eq('user_id', userId)
    .eq('completed_date', dateStr);
  return { data: data || [], error };
}

async function getCompletionsForMonth(userId, year, month) {
  const db = getDB();
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const endDate = new Date(year, month, 0).toISOString().split('T')[0];
  const { data, error } = await db
    .from('task_completions')
    .select('task_id, completed_date')
    .eq('user_id', userId)
    .gte('completed_date', startDate)
    .lte('completed_date', endDate);
  return { data: data || [], error };
}

async function toggleTaskCompletion(userId, taskId, dateStr, isCompleted) {
  const db = getDB();
  if (isCompleted) {
    const { error } = await db
      .from('task_completions')
      .insert({ user_id: userId, task_id: taskId, completed_date: dateStr });
    return { error };
  } else {
    const { error } = await db
      .from('task_completions')
      .delete()
      .eq('user_id', userId)
      .eq('task_id', taskId)
      .eq('completed_date', dateStr);
    return { error };
  }
}

// ---- GOAL ENTRIES ----

async function getGoalForMonth(userId, year, month) {
  const db = getDB();
  const monthStr = `${year}-${String(month).padStart(2, '0')}-01`;
  const { data, error } = await db
    .from('goal_entries')
    .select('*')
    .eq('user_id', userId)
    .eq('month', monthStr)
    .single();
  return { data, error };
}

async function saveGoalEntry(userId, year, month, goals) {
  const db = getDB();
  const monthStr = `${year}-${String(month).padStart(2, '0')}-01`;
  const { data, error } = await db
    .from('goal_entries')
    .upsert({
      user_id: userId,
      month: monthStr,
      ...goals,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id,month' })
    .select()
    .single();
  return { data, error };
}

// ---- PUSH SUBSCRIPTIONS ----

async function savePushSubscription(userId, subscription, activeDays) {
  const db = getDB();
  const { data, error } = await db
    .from('push_subscriptions')
    .upsert({
      user_id: userId,
      subscription: subscription,
      active_days: activeDays,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id' })
    .select()
    .single();
  return { data, error };
}

async function deletePushSubscription(userId) {
  const db = getDB();
  const { error } = await db
    .from('push_subscriptions')
    .delete()
    .eq('user_id', userId);
  return { error };
}
