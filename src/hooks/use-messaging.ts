import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/providers/auth-provider";
import {
  fetchConversations,
  fetchLastSeen,
  fetchMessageReactions,
  editMessage,
  deleteMessageForAll,
  deleteMessageForMe,
  fetchMessages,
  getOrCreateDirectConversation,
  markConversationRead,
  sendMessage,
  setTyping,
  subscribeToConversationMessages,
  subscribeToConversationsList,
  subscribeToTyping,
  toggleMessageReaction,
  updateLastSeen,
  uploadMessageMedia,
} from "@/services/messaging.service";
import type { Conversation, Message } from "@/types/messaging";

function clearConversationUnread(qc: ReturnType<typeof useQueryClient>, userId: string, conversationId: string) {
  qc.setQueryData<Conversation[]>(["conversations", userId], (old) =>
    old?.map((c) => (c.id === conversationId ? { ...c, unread: 0 } : c)),
  );
}

export function useConversations() {
  const { profile } = useAuth();
  const userId = profile?.userId;
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["conversations", userId],
    queryFn: () => fetchConversations(userId!),
    enabled: !!userId,
    staleTime: 15_000,
  });

  useEffect(() => {
    if (!userId) return;
    void updateLastSeen(userId);
    const interval = setInterval(() => void updateLastSeen(userId), 60_000);
    return () => clearInterval(interval);
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    return subscribeToConversationsList(userId, () => {
      qc.invalidateQueries({ queryKey: ["conversations", userId] });
      qc.invalidateQueries({ queryKey: ["messages-unread-count"] });
    });
  }, [userId, qc]);

  return query;
}

export function useMessages(conversationId: string | undefined) {
  const { profile } = useAuth();
  const userId = profile?.userId;
  const qc = useQueryClient();
  const [liveMessages, setLiveMessages] = useState<Message[]>([]);
  const [typingUser, setTypingUser] = useState<string | null>(null);

  const query = useQuery({
    queryKey: ["messages", conversationId],
    queryFn: () => fetchMessages(conversationId!, userId),
    enabled: !!conversationId,
    staleTime: 5_000,
  });

  const messageIds = [...(query.data ?? []), ...liveMessages].map((m) => m.id);
  const { data: reactions = new Map<string, string[]>() } = useQuery({
    queryKey: ["message-reactions", conversationId, messageIds.join(",")],
    queryFn: () => fetchMessageReactions(messageIds),
    enabled: messageIds.length > 0,
  });

  useEffect(() => {
    setLiveMessages([]);
  }, [conversationId]);

  useEffect(() => {
    if (!conversationId || !userId) return;

    clearConversationUnread(qc, userId, conversationId);

    void markConversationRead(userId, conversationId).then(() => {
      clearConversationUnread(qc, userId, conversationId);
      qc.invalidateQueries({ queryKey: ["conversations", userId] });
      qc.invalidateQueries({ queryKey: ["messages-unread-count"] });
    });

    const unsubMsg = subscribeToConversationMessages(conversationId, (msg) => {
      setLiveMessages((prev) => {
        const existingIdx = prev.findIndex((m) => m.id === msg.id);
        const inQuery = query.data?.findIndex((m) => m.id === msg.id) ?? -1;
        if (existingIdx >= 0) {
          const next = [...prev];
          next[existingIdx] = msg;
          return next;
        }
        if (inQuery >= 0) return prev;
        return [...prev, msg];
      });
      if (msg.author_id !== userId) {
        void markConversationRead(userId, conversationId).then(() => {
          clearConversationUnread(qc, userId, conversationId);
          qc.invalidateQueries({ queryKey: ["conversations", userId] });
          qc.invalidateQueries({ queryKey: ["messages-unread-count"] });
        });
      }
      qc.invalidateQueries({ queryKey: ["message-reactions", conversationId] });
    });

    const unsubTyping = subscribeToTyping(conversationId, userId, () => setTypingUser("typing"));
    const typingClear = setInterval(() => setTypingUser(null), 4000);

    return () => {
      unsubMsg();
      unsubTyping();
      clearInterval(typingClear);
    };
  }, [conversationId, userId, qc]);

  const merged = [...(query.data ?? []), ...liveMessages].filter(
    (m, i, arr) => arr.findIndex((x) => x.id === m.id) === i,
  );

  return { ...query, messages: merged, reactions, typingUser };
}

export function usePeerLastSeen(userId: string | undefined) {
  return useQuery({
    queryKey: ["last-seen", userId],
    queryFn: () => fetchLastSeen(userId!),
    enabled: !!userId,
    refetchInterval: 30_000,
  });
}

export function useMessagingMutations() {
  const { profile } = useAuth();
  const userId = profile?.userId;
  const qc = useQueryClient();
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const invalidate = (conversationId: string) => {
    qc.invalidateQueries({ queryKey: ["messages", conversationId] });
    qc.invalidateQueries({ queryKey: ["conversations", userId] });
  };

  const send = useMutation({
    mutationFn: ({
      conversationId,
      body,
      type,
      metadata,
      storyId,
      replyToId,
    }: {
      conversationId: string;
      body: string;
      type?: Message["type"];
      metadata?: Record<string, unknown>;
      storyId?: string;
      replyToId?: string;
    }) => sendMessage(userId!, conversationId, body, { type, metadata, storyId, replyToId }),
    onSuccess: (_, { conversationId }) => invalidate(conversationId),
  });

  const sendMedia = useMutation({
    mutationFn: async ({ conversationId, file }: { conversationId: string; file: File }) => {
      const uploaded = await uploadMessageMedia(userId!, file);
      return sendMessage(userId!, conversationId, uploaded.name, {
        type: uploaded.type,
        metadata: { url: uploaded.url, name: uploaded.name, mime: file.type },
      });
    },
    onSuccess: (_, { conversationId }) => invalidate(conversationId),
  });

  const sendVoice = useMutation({
    mutationFn: async ({ conversationId, blob }: { conversationId: string; blob: Blob }) => {
      const file = new File([blob], `voice-${Date.now()}.webm`, { type: "audio/webm" });
      const uploaded = await uploadMessageMedia(userId!, file);
      return sendMessage(userId!, conversationId, "Note vocale", {
        type: "voice",
        metadata: { url: uploaded.url, duration: 0 },
      });
    },
    onSuccess: (_, { conversationId }) => invalidate(conversationId),
  });

  const react = useMutation({
    mutationFn: ({ messageId, emoji, has }: { messageId: string; emoji: string; has: boolean }) =>
      toggleMessageReaction(userId!, messageId, emoji, has),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["message-reactions"] }),
  });

  const edit = useMutation({
    mutationFn: ({ messageId, body }: { messageId: string; body: string }) =>
      editMessage(userId!, messageId, body),
    onSuccess: (_, { conversationId: cid }) => invalidate(cid),
  });

  const deleteForAll = useMutation({
    mutationFn: ({ messageId }: { messageId: string; conversationId: string }) =>
      deleteMessageForAll(userId!, messageId),
    onSuccess: (_, { conversationId: cid }) => invalidate(cid),
  });

  const deleteForMe = useMutation({
    mutationFn: ({ messageId }: { messageId: string; conversationId: string }) =>
      deleteMessageForMe(userId!, messageId),
    onSuccess: (_, { conversationId: cid }) => invalidate(cid),
  });

  const openDirect = useMutation({
    mutationFn: (otherUserId: string) => getOrCreateDirectConversation(userId!, otherUserId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["conversations", userId] }),
  });

  const notifyTyping = useCallback(
    (conversationId: string) => {
      if (!userId) return;
      void setTyping(userId, conversationId, true);
      if (typingTimer.current) clearTimeout(typingTimer.current);
      typingTimer.current = setTimeout(() => void setTyping(userId, conversationId, false), 2000);
    },
    [userId],
  );

  return { send, sendMedia, sendVoice, react, edit, deleteForAll, deleteForMe, openDirect, notifyTyping };
}
