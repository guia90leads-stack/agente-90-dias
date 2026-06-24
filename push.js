// ============================================================
//  NOTIFICACIONES PUSH — Web Push API + Service Worker
// ============================================================

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    return { error: 'Este navegador no soporta Service Workers' };
  }
  try {
    const reg = await navigator.serviceWorker.register('/sw.js');
    await reg.update();
    return { registration: reg, error: null };
  } catch (err) {
    return { error: err.message };
  }
}

async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    return { permission: 'denied', error: 'Este navegador no soporta notificaciones' };
  }
  const permission = await Notification.requestPermission();
  return { permission, error: permission === 'denied' ? 'Permiso denegado' : null };
}

async function subscribeToPush(registration) {
  try {
    const vapidKey = urlBase64ToUint8Array(CONFIG.VAPID_PUBLIC_KEY);
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: vapidKey,
    });
    return { subscription: subscription.toJSON(), error: null };
  } catch (err) {
    return { subscription: null, error: err.message };
  }
}

async function unsubscribeFromPush(registration) {
  try {
    const sub = await registration.pushManager.getSubscription();
    if (sub) await sub.unsubscribe();
    return { error: null };
  } catch (err) {
    return { error: err.message };
  }
}

async function setupPushNotifications(userId, activeDays) {
  const { registration, error: swError } = await registerServiceWorker();
  if (swError) return { ok: false, message: swError };

  const { permission, error: permError } = await requestNotificationPermission();
  if (permError || permission !== 'granted') {
    return { ok: false, message: 'Necesitás dar permiso de notificaciones' };
  }

  const { subscription, error: subError } = await subscribeToPush(registration);
  if (subError) return { ok: false, message: subError };

  const { error: dbError } = await savePushSubscription(userId, subscription, activeDays);
  if (dbError) return { ok: false, message: dbError.message };

  return { ok: true, message: '¡Notificaciones activadas!' };
}

async function disablePushNotifications(userId) {
  const reg = await navigator.serviceWorker.getRegistration('/sw.js');
  if (reg) await unsubscribeFromPush(reg);
  await deletePushSubscription(userId);
  return { ok: true };
}

async function isSubscribed() {
  if (!('serviceWorker' in navigator)) return false;
  const reg = await navigator.serviceWorker.getRegistration('/sw.js');
  if (!reg) return false;
  const sub = await reg.pushManager.getSubscription();
  return !!sub;
}
