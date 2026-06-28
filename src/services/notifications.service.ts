import { getSupabase } from "@/lib/supabase/client";
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
  return (data ?? []).map(mapNotification);
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
