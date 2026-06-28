import type { RealtimeChannel } from "@supabase/supabase-js";
import { getSupabase } from "@/lib/supabase/client";
import type { NotificationChannel } from "@/lib/notifications/push-manager";
import type { NotificationFull } from "@/types/social";

type NotificationRow = {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string;
  actor_id: string | null;
  link: string | null;
  read: boolean;
  created_at: string;
};

export type NotificationPreferences = Partial<Record<NotificationChannel, boolean>>;

const DEFAULT_CHANNELS: Record<NotificationChannel, boolean> = {
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
  post: true,
  follow: true,
};

function mapNotification(row: NotificationRow): NotificationFull {
  return {
    id: row.id,
    type: row.type as NotificationFull["type"],
    title: row.title,
    body: row.body,
    actor_id: row.actor_id ?? undefined,
    created_at: row.created_at,
    read: row.read,
    link: row.link ?? undefined,
  };
}

export async function fetchNotificationPreferences(userId: string): Promise<Record<NotificationChannel, boolean>> {
  const supabase = getSupabase();
  const { data } = await supabase
    .from("academy_notification_preferences")
    .select("channels")
    .eq("user_id", userId)
    .maybeSingle();

  if (!data?.channels || typeof data.channels !== "object") return { ...DEFAULT_CHANNELS };
  return { ...DEFAULT_CHANNELS, ...(data.channels as Record<NotificationChannel, boolean>) };
}

export async function saveNotificationPreferences(
  userId: string,
  channels: Record<NotificationChannel, boolean>,
): Promise<void> {
  const { error } = await getSupabase()
    .from("academy_notification_preferences")
    .upsert({ user_id: userId, channels, updated_at: new Date().toISOString() });
  if (error) throw error;
}

export async function createNotification(input: {
  userId: string;
  type: NotificationFull["type"];
  title: string;
  body: string;
  link?: string;
  actorId?: string;
}): Promise<void> {
  const prefs = await fetchNotificationPreferences(input.userId);
  if (prefs[input.type as NotificationChannel] === false) return;

  const { error } = await getSupabase().from("academy_notifications").insert({
    user_id: input.userId,
    type: input.type,
    title: input.title,
    body: input.body,
    link: input.link ?? null,
    actor_id: input.actorId ?? null,
  });
  if (error) throw error;
}

export async function notifyAllAmbassadors(input: {
  type: NotificationFull["type"];
  title: string;
  body: string;
  link?: string;
}): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase.rpc("academy_notify_ambassadors", {
    p_type: input.type,
    p_title: input.title,
    p_body: input.body,
    p_link: input.link ?? null,
  });
  if (error) {
    const { data: ambassadors } = await supabase.from("user_roles").select("user_id").eq("role", "ambassador");
    await Promise.all(
      (ambassadors ?? []).map((r) =>
        createNotification({ userId: (r as { user_id: string }).user_id, ...input }).catch(() => undefined),
      ),
    );
  }
}

export async function fetchNotifications(userId: string, limit = 50): Promise<NotificationFull[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("academy_notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    if (error.code === "42P01" || error.code === "PGRST205") return [];
    throw error;
  }
  return (data ?? []).map((row) => mapNotification(row as NotificationRow));
}

export async function countUnreadNotifications(userId: string): Promise<number> {
  const supabase = getSupabase();
  const { count, error } = await supabase
    .from("academy_notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("read", false);

  if (error) {
    if (error.code === "42P01" || error.code === "PGRST205") return 0;
    throw error;
  }
  return count ?? 0;
}

export async function markNotificationRead(id: string): Promise<void> {
  const { error } = await getSupabase()
    .from("academy_notifications")
    .update({ read: true })
    .eq("id", id);
  if (error) throw error;
}

export async function markAllNotificationsRead(userId: string): Promise<void> {
  const { error } = await getSupabase()
    .from("academy_notifications")
    .update({ read: true })
    .eq("user_id", userId)
    .eq("read", false);
  if (error) throw error;
}

export async function countUnreadMessages(userId: string): Promise<number> {
  const supabase = getSupabase();
  const { count, error } = await supabase
    .from("academy_messages")
    .select("*", { count: "exact", head: true })
    .not("read_by", "cs", `{${userId}}`)
    .neq("author_id", userId);

  if (error) {
    if (error.code === "42P01" || error.code === "PGRST205") return 0;
    return 0;
  }
  return count ?? 0;
}

const notificationChannelRegistry = new Map<
  string,
  { listeners: Set<() => void>; channel: RealtimeChannel }
>();

export function subscribeToNotifications(userId: string, onChange: () => void): () => void {
  const supabase = getSupabase();
  let sub = notificationChannelRegistry.get(userId);

  if (!sub) {
    const listeners = new Set<() => void>();
    const channel = supabase
      .channel(`academy-notifications:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "academy_notifications",
          filter: `user_id=eq.${userId}`,
        },
        () => {
          listeners.forEach((fn) => {
            try {
              fn();
            } catch {
              /* ignore listener errors */
            }
          });
        },
      )
      .subscribe();

    sub = { listeners, channel };
    notificationChannelRegistry.set(userId, sub);
  }

  sub.listeners.add(onChange);

  return () => {
    const current = notificationChannelRegistry.get(userId);
    if (!current) return;
    current.listeners.delete(onChange);
    if (current.listeners.size === 0) {
      void supabase.removeChannel(current.channel);
      notificationChannelRegistry.delete(userId);
    }
  };
}

