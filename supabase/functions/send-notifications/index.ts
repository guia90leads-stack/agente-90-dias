// ============================================================
//  SUPABASE EDGE FUNCTION — Envio de notificaciones push
//  Se dispara cada minuto via pg_cron
//  Archivo: supabase/functions/send-notifications/index.ts
// ============================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Tareas con su hora en Argentina (UTC-3)
const TASKS = [
  { id: 1, horaUTC: 12, minUTC: 0, titulo: "📋 9:00 — Revisar tareas y speech", cuerpo: "Revisá el calendario de citas, respondé mensajes y preparate el speech para llamadas." },
  { id: 2, horaUTC: 13, minUTC: 0, titulo: "🔍 10:00 — Buscar dueños en Facebook", cuerpo: "Buscá propiedades 'vende dueño' en Marketplace. Meta: 10 contactos nuevos hoy." },
  { id: 3, horaUTC: 14, minUTC: 0, titulo: "✏️ 11:00 — Editar contenido", cuerpo: "Editá videos en CapCut, creá reels y TikToks. Meta: 1-2 videos listos." },
  { id: 4, horaUTC: 15, minUTC: 0, titulo: "📅 12:00 — Gestionar visitas", cuerpo: "Confirmá citas de hoy, preparate material y enviá recordatorios." },
  { id: 5, horaUTC: 16, minUTC: 0, titulo: "🏆 13:00 — ¡BLOQUE DE ORO!", cuerpo: "4 horas SAGRADAS de visitas con clientes. Apagá las redes. Acá se cierran ventas.", esOro: true },
  { id: 6, horaUTC: 20, minUTC: 0, titulo: "🎬 17:00 — Editar Turno 2", cuerpo: "Filmá y editá. Meta: 5 TikToks publicados hoy." },
  { id: 7, horaUTC: 22, minUTC: 0, titulo: "💬 19:00 — Gestionar Turno 2", cuerpo: "Respondé WhatsApp, confirmá visitas de mañana y preparate documentos." },
];

// ---- Helpers VAPID ----

function base64urlToUint8Array(base64url: string): Uint8Array {
  const base64 = base64url.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, "=");
  const binary = atob(padded);
  return Uint8Array.from(binary, (c) => c.charCodeAt(0));
}

function uint8ArrayToBase64url(arr: Uint8Array): string {
  return btoa(String.fromCharCode(...arr))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

async function createVapidJwt(
  vapidPrivateKeyB64: string,
  audience: string,
  subject: string
): Promise<string> {
  const privateKeyBytes = base64urlToUint8Array(vapidPrivateKeyB64);
  const privateKey = await crypto.subtle.importKey(
    "pkcs8",
    privateKeyBytes,
    { name: "ECDSA", namedCurve: "P-256" },
    false,
    ["sign"]
  );

  const now = Math.floor(Date.now() / 1000);
  const header = { typ: "JWT", alg: "ES256" };
  const payload = { aud: audience, exp: now + 12 * 3600, sub: subject };

  const headerB64 = uint8ArrayToBase64url(
    new TextEncoder().encode(JSON.stringify(header))
  );
  const payloadB64 = uint8ArrayToBase64url(
    new TextEncoder().encode(JSON.stringify(payload))
  );
  const signingInput = `${headerB64}.${payloadB64}`;

  const signature = await crypto.subtle.sign(
    { name: "ECDSA", hash: "SHA-256" },
    privateKey,
    new TextEncoder().encode(signingInput)
  );

  const sigB64 = uint8ArrayToBase64url(new Uint8Array(signature));
  return `${signingInput}.${sigB64}`;
}

async function sendWebPush(
  subscription: { endpoint: string; keys: { p256dh: string; auth: string } },
  payload: string,
  vapidPublicKey: string,
  vapidPrivateKey: string,
  vapidSubject: string
): Promise<{ ok: boolean; status?: number; error?: string }> {
  const url = new URL(subscription.endpoint);
  const audience = `${url.protocol}//${url.host}`;

  const jwt = await createVapidJwt(vapidPrivateKey, audience, vapidSubject);

  const authHeader = `vapid t=${jwt},k=${vapidPublicKey}`;

  // Encrypt payload using Web Push encryption (simplified - send as raw for testing)
  // For production use the full RFC 8291 encryption
  const encoder = new TextEncoder();
  const payloadBytes = encoder.encode(payload);

  // Import receiver public key
  const receiverPublicKey = await crypto.subtle.importKey(
    "raw",
    base64urlToUint8Array(subscription.keys.p256dh),
    { name: "ECDH", namedCurve: "P-256" },
    false,
    []
  );

  // Generate sender key pair
  const senderKeyPair = await crypto.subtle.generateKey(
    { name: "ECDH", namedCurve: "P-256" },
    true,
    ["deriveKey", "deriveBits"]
  );

  const senderPublicKeyRaw = new Uint8Array(
    await crypto.subtle.exportKey("raw", senderKeyPair.publicKey)
  );

  // Derive shared secret
  const sharedSecret = new Uint8Array(
    await crypto.subtle.deriveBits(
      { name: "ECDH", public: receiverPublicKey },
      senderKeyPair.privateKey,
      256
    )
  );

  // Auth secret
  const authSecret = base64urlToUint8Array(subscription.keys.auth);

  // HKDF to derive content encryption key and nonce (RFC 8291)
  const ikm = await crypto.subtle.importKey("raw", sharedSecret, "HKDF", false, ["deriveKey", "deriveBits"]);

  // PRK_combine
  const salt = crypto.getRandomValues(new Uint8Array(16));

  const prk = await crypto.subtle.importKey(
    "raw",
    await crypto.subtle.deriveBits(
      { name: "HKDF", hash: "SHA-256", salt: authSecret, info: new TextEncoder().encode("Content-Encoding: auth\0") },
      ikm,
      256
    ),
    "HKDF",
    false,
    ["deriveBits"]
  );

  const keyInfo = new Uint8Array([
    ...new TextEncoder().encode("Content-Encoding: aes128gcm\0"),
    0x01,
  ]);
  const nonceInfo = new Uint8Array([
    ...new TextEncoder().encode("Content-Encoding: nonce\0"),
    0x01,
  ]);

  // context = receiverKey + senderKey lengths and bytes
  const context = new Uint8Array([
    ...new TextEncoder().encode("P-256\0"),
    0x00, 0x41,
    ...base64urlToUint8Array(subscription.keys.p256dh),
    0x00, 0x41,
    ...senderPublicKeyRaw,
  ]);

  const cekBytes = await crypto.subtle.deriveBits(
    { name: "HKDF", hash: "SHA-256", salt, info: new Uint8Array([...keyInfo, ...context]) },
    prk,
    128
  );

  const nonceBytes = await crypto.subtle.deriveBits(
    { name: "HKDF", hash: "SHA-256", salt, info: new Uint8Array([...nonceInfo, ...context]) },
    prk,
    96
  );

  const cek = await crypto.subtle.importKey("raw", cekBytes, "AES-GCM", false, ["encrypt"]);

  // Pad payload to 4KB
  const paddingLen = Math.max(0, 3993 - payloadBytes.length);
  const padded = new Uint8Array(payloadBytes.length + paddingLen + 1);
  padded.set([0x02]); // delimiter
  padded.set(payloadBytes, 1);

  const encrypted = new Uint8Array(await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: new Uint8Array(nonceBytes) },
    cek,
    padded
  ));

  // RFC 8188 header: salt(16) + rs(4) + keyid_len(1) + keyid(65)
  const rs = 4096;
  const header = new Uint8Array(16 + 4 + 1 + 65);
  header.set(salt, 0);
  const rsView = new DataView(header.buffer, 16, 4);
  rsView.setUint32(0, rs, false);
  header[20] = 65;
  header.set(senderPublicKeyRaw, 21);

  const body = new Uint8Array(header.length + encrypted.length);
  body.set(header, 0);
  body.set(encrypted, header.length);

  const response = await fetch(subscription.endpoint, {
    method: "POST",
    headers: {
      "Authorization": authHeader,
      "Content-Type": "application/octet-stream",
      "Content-Encoding": "aes128gcm",
      "TTL": "86400",
    },
    body,
  });

  if (!response.ok) {
    const text = await response.text();
    return { ok: false, status: response.status, error: text };
  }
  return { ok: true, status: response.status };
}

// ---- Handler principal ----

serve(async (_req) => {
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const vapidPublicKey = Deno.env.get("VAPID_PUBLIC_KEY") ?? "";
    const vapidPrivateKey = Deno.env.get("VAPID_PRIVATE_KEY") ?? "";
    const vapidSubject = Deno.env.get("VAPID_SUBJECT") ?? "mailto:tu@email.com";
    const appUrl = Deno.env.get("APP_URL") ?? supabaseUrl;

    if (!vapidPublicKey || !vapidPrivateKey) {
      return new Response(JSON.stringify({ error: "Faltan claves VAPID" }), { status: 500 });
    }

    const db = createClient(supabaseUrl, serviceRoleKey);

    // Hora actual en Argentina (UTC-3)
    const nowUtc = new Date();
    const nowArg = new Date(nowUtc.getTime() - 3 * 60 * 60 * 1000);
    const currentHourUtc = nowUtc.getUTCHours();
    const currentMinUtc = nowUtc.getUTCMinutes();
    const currentDow = nowArg.getDay() === 0 ? 7 : nowArg.getDay(); // 1=lun...7=dom

    // Buscar tareas que deben notificarse ahora (ventana de 1 minuto)
    const tasksToSend = TASKS.filter(
      (t) => t.horaUTC === currentHourUtc && t.minUTC === currentMinUtc
    );

    if (tasksToSend.length === 0) {
      return new Response(JSON.stringify({ message: "No hay tareas para este minuto", hour: currentHourUtc, min: currentMinUtc }), { status: 200 });
    }

    // Obtener todas las suscripciones activas
    const { data: subs, error: subsError } = await db
      .from("push_subscriptions")
      .select("*");

    if (subsError || !subs?.length) {
      return new Response(JSON.stringify({ message: "Sin suscriptores", error: subsError }), { status: 200 });
    }

    const results = [];

    for (const sub of subs) {
      // Verificar si hoy es dia activo para este usuario
      const activeDays = sub.active_days || [1, 2, 3, 4, 5];
      if (!activeDays.includes(currentDow)) continue;

      for (const task of tasksToSend) {
        const payload = JSON.stringify({
          titulo: task.titulo,
          cuerpo: task.cuerpo,
          taskId: task.id,
          esOro: task.esOro || false,
          url: `${appUrl}/#hoy`,
        });

        try {
          const result = await sendWebPush(
            sub.subscription,
            payload,
            vapidPublicKey,
            vapidPrivateKey,
            vapidSubject
          );
          results.push({ userId: sub.user_id, taskId: task.id, ...result });
        } catch (e) {
          results.push({ userId: sub.user_id, taskId: task.id, ok: false, error: String(e) });
        }
      }
    }

    return new Response(JSON.stringify({ sent: results.length, results }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
});
