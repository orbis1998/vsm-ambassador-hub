/**
 * Gestionnaire de notifications push — architecture prête pour activation.
 *
 * Flux prévu :
 * 1. Demande permission navigateur (Notification API)
 * 2. Enregistrement subscription Web Push (VAPID) ou FCM token
 * 3. Persistance dans `push_subscriptions` (Supabase)
 * 4. Envoi serveur via Edge Function / FCM
 *
 * Types de notifications supportés :
 * course | quiz | campaign | opportunity | message | comment | badge | certificate | mission
 */

import { getSupabase } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export type NotificationChannel =
  | "course"
  | "quiz"
  | "campaign"
  | "opportunity"
  | "message"
  | "comment"
  | "badge"
  | "certificate"
  | "mission"
  | "challenge"
  | "post"
  | "follow";

export interface PushSubscriptionRecord {
  user_id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  fcm_token?: string;
  channels: NotificationChannel[];
  created_at: string;
}

export interface NotificationPreferences {
  enabled: boolean;
  channels: Partial<Record<NotificationChannel, boolean>>;
}

const DEFAULT_PREFS: NotificationPreferences = {
  enabled: false,
  channels: {
    course: true,
    quiz: true,
    campaign: true,
    opportunity: true,
    message: true,
    comment: true,
    badge: true,
    certificate: true,
    mission: true,
    challenge: true,
    post: false,
    follow: false,
  },
};

const PREFS_KEY = "vsm.push.prefs";

export function getNotificationPreferences(): NotificationPreferences {
  if (typeof window === "undefined") return DEFAULT_PREFS;
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    return raw ? { ...DEFAULT_PREFS, ...JSON.parse(raw) } : DEFAULT_PREFS;
  } catch {
    return DEFAULT_PREFS;
  }
}

export function saveNotificationPreferences(prefs: NotificationPreferences): void {
  localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
}

export function isPushSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

export async function requestPushPermission(): Promise<NotificationPermission> {
  if (!isPushSupported()) return "denied";
  return Notification.requestPermission();
}

/**
 * Enregistre la subscription Web Push côté Supabase.
 * Nécessite VITE_VAPID_PUBLIC_KEY et table `push_subscriptions`.
 */
export async function registerPushSubscription(userId: string): Promise<boolean> {
  if (!isSupabaseConfigured() || !isPushSupported()) return false;

  const permission = await requestPushPermission();
  if (permission !== "granted") return false;

  const vapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY as string | undefined;
  if (!vapidKey) {
    console.warn("[Push] VITE_VAPID_PUBLIC_KEY non configurée — enregistrement différé.");
    return false;
  }

  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(vapidKey),
  });

  const json = subscription.toJSON();
  if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) return false;

  const supabase = getSupabase();
  const prefs = getNotificationPreferences();
  const enabledChannels = Object.entries(prefs.channels)
    .filter(([, v]) => v)
    .map(([k]) => k as NotificationChannel);

  const { error } = await supabase.from("academy_push_subscriptions").upsert(
    {
      user_id: userId,
      endpoint: json.endpoint,
      p256dh: json.keys.p256dh,
      auth: json.keys.auth,
      channels: enabledChannels,
    },
    { onConflict: "user_id,endpoint" },
  );

  if (error) {
    console.error("[Push] Erreur enregistrement:", error.message);
    return false;
  }

  return true;
}

export async function unregisterPushSubscription(userId: string): Promise<void> {
  if (!isPushSupported()) return;
  const registration = await navigator.serviceWorker.ready;
  const sub = await registration.pushManager.getSubscription();
  if (sub) {
    await sub.unsubscribe();
    if (isSupabaseConfigured()) {
      const supabase = getSupabase();
      await supabase
        .from("academy_push_subscriptions")
        .delete()
        .eq("user_id", userId)
        .eq("endpoint", sub.endpoint);
    }
  }
}

function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const buffer = new ArrayBuffer(raw.length);
  const output = new Uint8Array(buffer);
  for (let i = 0; i < raw.length; i++) output[i] = raw.charCodeAt(i);
  return output;
}
