// @ts-nocheck
import { getSupabase } from "@/lib/supabase/client";
import type { Conversation, Message } from "@/types/messaging";

function messagingDb() {
  return getSupabase();
}

function mapConversation(
  row: Record<string, unknown>,
  unread: number,
): Conversation {
  return {
    id: String(row.id),
    participant_ids: (row.participant_ids as string[]) ?? [],
    last_message: String(row.last_message ?? ""),
    last_at: String(row.last_message_at ?? row.created_at ?? new Date().toISOString()),
    unread,
    is_group: Boolean(row.is_group),
    title: row.title ? String(row.title) : undefined,
  };
}

function mapMessage(row: Record<string, unknown>): Message {
  return {
    id: String(row.id),
    conversation_id: String(row.conversation_id),
    author_id: String(row.author_id),
    type: (row.type as Message["type"]) ?? "text",
    body: String(row.body ?? ""),
    created_at: String(row.created_at),
    read_by: (row.read_by as string[]) ?? [],
    metadata: (row.metadata as Record<string, unknown>) ?? {},
    story_id: row.story_id ? String(row.story_id) : null,
    reply_to_id: row.reply_to_id ? String(row.reply_to_id) : null,
    edited_at: row.edited_at ? String(row.edited_at) : null,
    deleted_for_all: Boolean(row.deleted_for_all),
    deleted_for: (row.deleted_for as string[]) ?? [],
  };
}

function visibleToUser(row: Record<string, unknown>, userId: string): boolean {
  if (row.deleted_for_all) return true;
  const deletedFor = (row.deleted_for as string[]) ?? [];
  return !deletedFor.includes(userId);
}

async function countUnreadForConversations(
  userId: string,
  conversationIds: string[],
): Promise<Map<string, number>> {
  const counts = new Map<string, number>();
  if (!conversationIds.length) return counts;

  const db = messagingDb();
  const { data } = await db
    .from("academy_messages")
    .select("conversation_id, author_id, read_by")
    .in("conversation_id", conversationIds);

  for (const id of conversationIds) counts.set(id, 0);
  for (const row of data ?? []) {
    const r = row as { conversation_id: string; author_id: string; read_by: string[] };
    if (r.author_id === userId) continue;
    if ((r.read_by ?? []).includes(userId)) continue;
    counts.set(r.conversation_id, (counts.get(r.conversation_id) ?? 0) + 1);
  }
  return counts;
}

function directConversationKey(ids: string[]): string {
  return [...ids].sort().join(":");
}

export async function fetchConversations(userId: string): Promise<Conversation[]> {
  const db = messagingDb();
  const { data, error } = await db
    .from("academy_conversations")
    .select("*")
    .contains("participant_ids", [userId])
    .order("last_message_at", { ascending: false });

  if (error) {
    if (error.code === "42P01" || error.code === "PGRST205") return [];
    throw error;
  }

  const rows = data ?? [];
  const ids = rows.map((r: { id: string }) => r.id);
  const unreadMap = await countUnreadForConversations(userId, ids);

  const mapped = rows.map((row: Record<string, unknown>) =>
    mapConversation(row, unreadMap.get(String(row.id)) ?? 0),
  );

  // Dédupliquer les conversations directes (garder la plus récente par paire)
  const seen = new Map<string, Conversation>();
  const result: Conversation[] = [];
  for (const conv of mapped) {
    if (conv.is_group || conv.participant_ids.length !== 2) {
      result.push(conv);
      continue;
    }
    const key = directConversationKey(conv.participant_ids);
    const existing = seen.get(key);
    if (!existing || new Date(conv.last_at) > new Date(existing.last_at)) {
      seen.set(key, conv);
    }
  }
  for (const conv of mapped) {
    if (conv.is_group || conv.participant_ids.length !== 2) continue;
    const key = directConversationKey(conv.participant_ids);
    if (seen.get(key)?.id === conv.id) result.push(conv);
  }
  return result.sort((a, b) => new Date(b.last_at).getTime() - new Date(a.last_at).getTime());
}

export async function fetchMessages(conversationId: string, userId?: string): Promise<Message[]> {
  const db = messagingDb();
  const { data, error } = await db
    .from("academy_messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (error) return [];
  return (data ?? [])
    .filter((row: Record<string, unknown>) => {
      if (row.deleted_for_all) return true;
      if (!userId) return true;
      const deletedFor = (row.deleted_for as string[]) ?? [];
      return !deletedFor.includes(userId);
    })
    .map((row: Record<string, unknown>) => mapMessage(row));
}

export async function editMessage(userId: string, messageId: string, body: string): Promise<void> {
  const trimmed = body.trim();
  if (!trimmed) throw new Error("Message vide.");
  const { error } = await messagingDb()
    .from("academy_messages")
    .update({ body: trimmed, edited_at: new Date().toISOString() })
    .eq("id", messageId)
    .eq("author_id", userId);
  if (error) throw error;
}

export async function deleteMessageForAll(userId: string, messageId: string): Promise<void> {
  const { error } = await messagingDb()
    .from("academy_messages")
    .update({ deleted_for_all: true, body: "Ce message a été supprimé" })
    .eq("id", messageId)
    .eq("author_id", userId);
  if (error) throw error;
}

export async function deleteMessageForMe(userId: string, messageId: string): Promise<void> {
  const db = messagingDb();
  const { data, error: fetchError } = await db.from("academy_messages").select("deleted_for").eq("id", messageId).single();
  if (fetchError) throw fetchError;
  const deletedFor = [...((data as { deleted_for?: string[] }).deleted_for ?? [])];
  if (!deletedFor.includes(userId)) deletedFor.push(userId);
  const { error } = await db.from("academy_messages").update({ deleted_for: deletedFor }).eq("id", messageId);
  if (error) throw error;
}

export async function getOrCreateDirectConversation(
  userId: string,
  otherUserId: string,
): Promise<string> {
  if (userId === otherUserId) throw new Error("Impossible de créer une conversation avec soi-même.");

  const db = messagingDb();
  const { data: existing } = await db
    .from("academy_conversations")
    .select("id, participant_ids, is_group, last_message_at")
    .contains("participant_ids", [userId])
    .eq("is_group", false);

  const targetKey = directConversationKey([userId, otherUserId]);
  let best: { id: string; last_message_at: string } | null = null;

  for (const row of existing ?? []) {
    const c = row as { id: string; participant_ids: string[]; is_group: boolean; last_message_at: string };
    if (c.is_group || c.participant_ids.length !== 2) continue;
    if (directConversationKey(c.participant_ids) !== targetKey) continue;
    if (!best || c.last_message_at > best.last_message_at) best = c;
  }
  if (best) return best.id;

  const { data: created, error } = await db
    .from("academy_conversations")
    .insert({
      participant_ids: [userId, otherUserId],
      is_group: false,
      last_message: "",
    })
    .select("id")
    .single();

  if (error) throw error;
  return String(created.id);
}

export async function sendMessage(
  userId: string,
  conversationId: string,
  body: string,
  opts?: {
    type?: Message["type"];
    metadata?: Record<string, unknown>;
    storyId?: string;
    replyToId?: string;
  },
): Promise<Message> {
  const trimmed = body.trim();
  if (!trimmed && !opts?.metadata?.url) throw new Error("Message vide.");

  const db = messagingDb();
  const type = opts?.type ?? "text";
  const preview = type === "text" ? trimmed.slice(0, 200) : `[${type}] ${trimmed.slice(0, 80)}`;

  const { data, error } = await db
    .from("academy_messages")
    .insert({
      conversation_id: conversationId,
      author_id: userId,
      type,
      body: trimmed || preview,
      metadata: opts?.metadata ?? {},
      story_id: opts?.storyId ?? null,
      reply_to_id: opts?.replyToId ?? null,
      read_by: [userId],
    })
    .select("*")
    .single();

  if (error) throw error;

  await db
    .from("academy_conversations")
    .update({
      last_message: preview,
      last_message_at: new Date().toISOString(),
    })
    .eq("id", conversationId);

  const { data: conv } = await db
    .from("academy_conversations")
    .select("participant_ids")
    .eq("id", conversationId)
    .maybeSingle();

  const recipients = ((conv as { participant_ids?: string[] } | null)?.participant_ids ?? []).filter(
    (id) => id !== userId,
  );

  if (recipients.length) {
    const { notifyUser } = await import("@/services/notifications.service");
    await Promise.all(
      recipients.map((recipientId) =>
        notifyUser({
          userId: recipientId,
          type: "message",
          title: "Nouveau message",
          body: preview,
          link: `/messages?conv=${conversationId}`,
          actorId: userId,
        }).catch(() => undefined),
      ),
    );
  }

  return mapMessage(data as Record<string, unknown>);
}

export async function markConversationRead(userId: string, conversationId: string): Promise<void> {
  const db = messagingDb();
  const { data: messages, error } = await db
    .from("academy_messages")
    .select("id, read_by, author_id")
    .eq("conversation_id", conversationId)
    .neq("author_id", userId);

  if (error) throw error;

  const toUpdate = (messages ?? []).filter((row) => {
    const r = row as { read_by: string[] };
    return !(r.read_by ?? []).includes(userId);
  });

  if (!toUpdate.length) return;

  await Promise.all(
    toUpdate.map((row) => {
      const r = row as { id: string; read_by: string[] };
      return db
        .from("academy_messages")
        .update({ read_by: [...(r.read_by ?? []), userId] })
        .eq("id", r.id);
    }),
  );
}

export function subscribeToConversationMessages(
  conversationId: string,
  onMessage: (message: Message) => void,
): () => void {
  const db = messagingDb();
  const channel = db
    .channel(`academy-messages:${conversationId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "academy_messages",
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload) => {
        onMessage(mapMessage(payload.new as Record<string, unknown>));
      },
    )
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "academy_messages",
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload) => {
        onMessage(mapMessage(payload.new as Record<string, unknown>));
      },
    )
    .subscribe();

  return () => {
    void db.removeChannel(channel);
  };
}

export async function setTyping(userId: string, conversationId: string, typing: boolean): Promise<void> {
  const db = messagingDb();
  if (typing) {
    await db.from("academy_typing").upsert({
      conversation_id: conversationId,
      user_id: userId,
      updated_at: new Date().toISOString(),
    });
  } else {
    await db.from("academy_typing").delete().eq("conversation_id", conversationId).eq("user_id", userId);
  }
}

export function subscribeToTyping(conversationId: string, userId: string, onTyping: (otherUserId: string) => void): () => void {
  const db = messagingDb();
  const channel = db
    .channel(`typing:${conversationId}`)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "academy_typing", filter: `conversation_id=eq.${conversationId}` },
      (payload) => {
        const row = (payload.new ?? payload.old) as { user_id?: string; updated_at?: string };
        if (!row?.user_id || row.user_id === userId) return;
        if (payload.eventType === "DELETE") return;
        const age = Date.now() - new Date(row.updated_at ?? 0).getTime();
        if (age < 5000) onTyping(row.user_id);
      },
    )
    .subscribe();
  return () => void db.removeChannel(channel);
}

export async function toggleMessageReaction(userId: string, messageId: string, emoji: string, hasReaction: boolean): Promise<void> {
  const db = messagingDb();
  if (hasReaction) {
    await db.from("academy_message_reactions").delete().eq("message_id", messageId).eq("user_id", userId);
  } else {
    await db.from("academy_message_reactions").upsert({ message_id: messageId, user_id: userId, emoji });
  }
}

export async function fetchMessageReactions(messageIds: string[]): Promise<Map<string, string[]>> {
  const map = new Map<string, string[]>();
  if (!messageIds.length) return map;
  const db = messagingDb();
  const { data } = await db.from("academy_message_reactions").select("message_id, emoji").in("message_id", messageIds);
  for (const id of messageIds) map.set(id, []);
  for (const row of data ?? []) {
    const r = row as { message_id: string; emoji: string };
    map.get(r.message_id)?.push(r.emoji);
  }
  return map;
}

export async function updateLastSeen(userId: string): Promise<void> {
  await messagingDb().from("profiles").update({ last_seen_at: new Date().toISOString() }).eq("id", userId);
}

export async function fetchLastSeen(userId: string): Promise<string | null> {
  const { data } = await messagingDb().from("profiles").select("last_seen_at").eq("id", userId).maybeSingle();
  return (data as { last_seen_at?: string } | null)?.last_seen_at ?? null;
}

export async function uploadMessageMedia(userId: string, file: File): Promise<{ url: string; type: Message["type"]; name: string }> {
  const { uploadSocialFile } = await import("@/services/storage.service");
  const media = await uploadSocialFile(userId, file);
  let type: Message["type"] = "doc";
  if (file.type.startsWith("image/")) type = "image";
  else if (file.type.startsWith("video/")) type = "video";
  else if (file.type.startsWith("audio/")) type = "voice";
  return { url: media.url, type, name: file.name };
}

export function subscribeToConversationsList(userId: string, onChange: () => void): () => void {
  const db = messagingDb();
  const channel = db
    .channel(`academy-conversations:${userId}`)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "academy_conversations" },
      () => onChange(),
    )
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "academy_messages" },
      () => onChange(),
    )
    .on(
      "postgres_changes",
      { event: "UPDATE", schema: "public", table: "academy_messages" },
      () => onChange(),
    )
    .subscribe();

  return () => {
    void db.removeChannel(channel);
  };
}
