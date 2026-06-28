import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Phone, Search, Loader2, MessageSquare, CheckCheck } from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import { useAmbassador } from "@/hooks/use-social";
import {
  useConversations,
  useMessages,
  useMessagingMutations,
  usePeerLastSeen,
} from "@/hooks/use-messaging";
import { useAudioCall } from "@/hooks/use-audio-call";
import { MessageComposer } from "@/components/message-composer";
import { formatRelativeTime } from "@/services/ambassador.service";
import { profileAvatarUrl } from "@/lib/program-tier";
import type { Conversation, Message } from "@/types/messaging";

type MessagesSearch = { with?: string; conv?: string; story?: string };

export const Route = createFileRoute("/_app/messages")({
  validateSearch: (search: Record<string, unknown>): MessagesSearch => ({
    with: typeof search.with === "string" ? search.with : undefined,
    conv: typeof search.conv === "string" ? search.conv : undefined,
    story: typeof search.story === "string" ? search.story : undefined,
  }),
  component: MessagesPage,
});

function MessagesPage() {
  const { profile } = useAuth();
  const navigate = useNavigate({ from: Route.fullPath });
  const { with: withUserId, conv: convParam, story: storyParam } = Route.useSearch();
  const [activeId, setActiveId] = useState<string | null>(convParam ?? null);
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState("");
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [msgSearch, setMsgSearch] = useState("");
  const openedRef = useRef(false);

  const { data: conversations = [], isLoading: loadingConversations } = useConversations();
  const { send, sendMedia, sendVoice, react, openDirect, notifyTyping } = useMessagingMutations();
  const { messages, isLoading: loadingMessages, reactions, typingUser } = useMessages(activeId ?? undefined);

  const active = conversations.find((c) => c.id === activeId);
  const otherId = active?.participant_ids.find((id) => id !== profile?.userId) ?? withUserId;
  const { data: otherUser } = useAmbassador(otherId);
  const { data: lastSeen } = usePeerLastSeen(otherId);
  const call = useAudioCall(activeId ?? undefined, profile?.userId, otherId);

  useEffect(() => {
    if (convParam) setActiveId(convParam);
  }, [convParam]);

  useEffect(() => {
    if (!withUserId || !profile?.userId || withUserId === profile.userId || openedRef.current) return;
    const existing = conversations.find(
      (c) => !c.is_group && c.participant_ids.length === 2 && c.participant_ids.includes(withUserId),
    );
    if (existing) {
      setActiveId(existing.id);
      navigate({ search: { conv: existing.id, story: storyParam }, replace: true });
      return;
    }
    openedRef.current = true;
    void openDirect.mutateAsync(withUserId).then((convId) => {
      setActiveId(convId);
      navigate({ search: { conv: convId, story: storyParam }, replace: true });
    });
  }, [withUserId, profile?.userId, conversations, storyParam]);

  useEffect(() => {
    if (storyParam && activeId && draft === "" && !replyTo) {
      setDraft("Réponse à votre story : ");
    }
  }, [storyParam, activeId]);

  const filtered = useMemo(() => {
    if (!query.trim()) return conversations;
    const q = query.toLowerCase();
    return conversations.filter(
      (c) => (c.title ?? "").toLowerCase().includes(q) || c.last_message.toLowerCase().includes(q),
    );
  }, [conversations, query]);

  const visibleMessages = useMemo(() => {
    if (!msgSearch.trim()) return messages;
    const q = msgSearch.toLowerCase();
    return messages.filter((m) => m.body.toLowerCase().includes(q));
  }, [messages, msgSearch]);

  const displayTitle = active?.title ?? otherUser?.name ?? "Conversation";

  const handleSend = async () => {
    const text = draft.trim();
    if (!text || !activeId) return;
    await send.mutateAsync({
      conversationId: activeId,
      body: text,
      storyId: storyParam,
      replyToId: replyTo?.id,
    });
    setDraft("");
    setReplyTo(null);
    navigate({ search: { conv: activeId }, replace: true });
  };

  if (loadingConversations && !conversations.length) {
    return (
      <div className="grid min-h-[40vh] place-items-center">
        <Loader2 className="h-8 w-8 animate-spin text-vsm-red" />
      </div>
    );
  }

  return (
    <div className="mx-auto h-[calc(100dvh-7rem)] max-w-6xl overflow-hidden rounded-2xl border border-border bg-surface md:h-[calc(100vh-9rem)]">
      <audio ref={call.remoteAudioRef} autoPlay playsInline className="hidden" />
      {call.state !== "idle" && (
        <CallBanner state={call.state} onAccept={() => void call.acceptCall()} onHangUp={() => void call.hangUp()} />
      )}
      <div className="grid h-full grid-cols-1 md:grid-cols-[320px_1fr]">
        <aside className={`flex flex-col border-r border-border ${activeId ? "hidden md:flex" : "flex"}`}>
          <div className="border-b border-border p-4">
            <h2 className="font-display text-lg font-bold uppercase tracking-wide">Messages</h2>
            <div className="relative mt-3">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher…"
                className="h-10 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm outline-none focus:border-vsm-red/50"
              />
            </div>
          </div>
          <ul className="flex-1 overflow-y-auto">
            {filtered.length === 0 ? (
              <li className="p-6 text-center text-xs text-muted-foreground">Aucune conversation.</li>
            ) : (
              filtered.map((c) => (
                <ConversationListItem
                  key={c.id}
                  conversation={c}
                  userId={profile?.userId}
                  isActive={c.id === activeId}
                  onSelect={() => {
                    openedRef.current = false;
                    setActiveId(c.id);
                    navigate({ search: { conv: c.id } });
                  }}
                />
              ))
            )}
          </ul>
        </aside>

        <section className={`flex min-h-0 flex-col ${!activeId ? "hidden md:flex" : "flex"}`}>
          {!activeId ? (
            <div className="grid flex-1 place-items-center p-8 text-center text-sm text-muted-foreground">
              <MessageSquare className="mx-auto mb-3 h-10 w-10 text-vsm-red/50" />
              Sélectionnez une conversation
            </div>
          ) : (
            <>
              <header className="flex items-center gap-2 border-b border-border px-3 py-2.5 md:px-4 md:py-3">
                <button type="button" className="text-xs uppercase text-vsm-red md:hidden" onClick={() => { setActiveId(null); navigate({ search: {} }); }}>
                  ←
                </button>
                <img src={otherUser?.avatar ?? profileAvatarUrl(null, displayTitle)} alt="" className="h-9 w-9 rounded-lg object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{displayTitle}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {typingUser ? "écrit…" : lastSeen ? `vu ${formatRelativeTime(lastSeen)}` : otherUser?.level ?? ""}
                  </p>
                </div>
                {otherId && !active?.is_group && (
                  <button type="button" onClick={() => void call.startCall()} className="grid h-9 w-9 place-items-center rounded-lg border border-border text-vsm-red hover:bg-accent" aria-label="Appel audio">
                    <Phone className="h-4 w-4" />
                  </button>
                )}
              </header>

              <div className="border-b border-border px-3 py-2">
                <input
                  value={msgSearch}
                  onChange={(e) => setMsgSearch(e.target.value)}
                  placeholder="Rechercher dans la conversation…"
                  className="h-8 w-full rounded-lg border border-border bg-background px-3 text-xs outline-none"
                />
              </div>

              <div className="flex-1 space-y-2 overflow-y-auto p-3 md:p-4">
                {loadingMessages ? (
                  <div className="grid place-items-center py-12"><Loader2 className="h-6 w-6 animate-spin text-vsm-red" /></div>
                ) : (
                  visibleMessages.map((m) => (
                    <MessageBubble
                      key={m.id}
                      message={m}
                      isMine={m.author_id === profile?.userId}
                      reactions={reactions.get(m.id) ?? []}
                      onReply={() => setReplyTo(m)}
                      onReact={(emoji, has) => react.mutate({ messageId: m.id, emoji, has })}
                    />
                  ))
                )}
              </div>

              <MessageComposer
                draft={draft}
                onDraftChange={setDraft}
                replyTo={replyTo}
                onClearReply={() => setReplyTo(null)}
                onSendText={() => void handleSend()}
                onSendMedia={(f) => activeId && void sendMedia.mutateAsync({ conversationId: activeId, file: f })}
                onSendVoice={(b) => activeId && void sendVoice.mutateAsync({ conversationId: activeId, blob: b })}
                sending={send.isPending}
                onTyping={() => activeId && notifyTyping(activeId)}
              />
            </>
          )}
        </section>
      </div>
    </div>
  );
}

function CallBanner({ state, onAccept, onHangUp }: { state: string; onAccept: () => void; onHangUp: () => void }) {
  return (
    <div className="flex items-center justify-between border-b border-vsm-red/30 bg-vsm-red/10 px-4 py-2 text-sm">
      <span>{state === "ringing" ? "Appel entrant…" : state === "active" ? "Appel en cours" : "Connexion…"}</span>
      <div className="flex gap-2">
        {state === "ringing" && (
          <button type="button" onClick={onAccept} className="rounded-lg bg-vsm-red px-3 py-1 text-xs font-bold text-white">Répondre</button>
        )}
        <button type="button" onClick={onHangUp} className="rounded-lg border border-border px-3 py-1 text-xs font-bold">Raccrocher</button>
      </div>
    </div>
  );
}

function ConversationListItem({
  conversation: c,
  userId,
  isActive,
  onSelect,
}: {
  conversation: Conversation;
  userId?: string;
  isActive: boolean;
  onSelect: () => void;
}) {
  const otherId = c.participant_ids.find((id) => id !== userId);
  const { data: other } = useAmbassador(otherId);
  const name = c.title ?? other?.name ?? "Ambassadeur";
  const avatar = other?.avatar ?? profileAvatarUrl(null, name);
  const unread = isActive ? 0 : c.unread;

  return (
    <li>
      <button onClick={onSelect} className={`flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-accent ${isActive ? "bg-accent" : ""}`}>
        <img src={avatar} alt="" className="h-11 w-11 shrink-0 rounded-lg object-cover" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate text-sm font-semibold">{name}</p>
            <span className="shrink-0 text-[10px] text-muted-foreground">{formatRelativeTime(c.last_at)}</span>
          </div>
          <p className="truncate text-xs text-muted-foreground">{c.last_message || "—"}</p>
        </div>
        {unread > 0 && (
          <span className="grid h-5 min-w-5 shrink-0 place-items-center rounded-full bg-vsm-red px-1 text-[10px] font-bold text-white">{unread}</span>
        )}
      </button>
    </li>
  );
}

function MessageBubble({
  message: m,
  isMine,
  reactions: rx,
  onReply,
  onReact,
}: {
  message: Message;
  isMine?: boolean;
  reactions: string[];
  onReply: () => void;
  onReact: (emoji: string, has: boolean) => void;
}) {
  const url = String(m.metadata?.url ?? "");
  const read = isMine && (m.read_by?.length ?? 0) > 1;

  return (
    <div className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${isMine ? "bg-vsm-red text-white" : "border border-border bg-background"}`}>
        {m.type === "image" && url && <img src={url} alt="" className="mb-1 max-h-48 rounded-lg object-cover" />}
        {m.type === "video" && url && <video src={url} controls className="mb-1 max-h-48 rounded-lg" />}
        {m.type === "voice" && url && <audio src={url} controls className="mb-1 w-full min-w-[200px]" />}
        {m.type === "doc" && url && (
          <a href={url} target="_blank" rel="noreferrer" className={`mb-1 block underline ${isMine ? "text-white/90" : "text-vsm-red"}`}>
            📎 {m.body || "Fichier"}
          </a>
        )}
        {m.type === "text" && <p>{m.body}</p>}
        {m.type !== "text" && m.type !== "doc" && m.body && m.type !== "image" && m.type !== "video" && m.type !== "voice" && <p className="text-xs opacity-80">{m.body}</p>}
        <div className={`mt-1 flex flex-wrap items-center gap-2 text-[10px] ${isMine ? "text-white/70" : "text-muted-foreground"}`}>
          <span>{formatRelativeTime(m.created_at)}</span>
          {isMine && read && <CheckCheck className="h-3 w-3" />}
          <button type="button" onClick={onReply} className="hover:underline">Répondre</button>
          {["👍", "❤️", "😂"].map((e) => (
            <button key={e} type="button" onClick={() => onReact(e, rx.includes(e))} className="hover:scale-110">{e}</button>
          ))}
        </div>
        {rx.length > 0 && <p className="mt-1 text-xs">{rx.join("")}</p>}
      </div>
    </div>
  );
}
