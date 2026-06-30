import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Search, Loader2, MessageSquare, CheckCheck, MoreVertical } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/providers/auth-provider";
import { useAmbassador } from "@/hooks/use-social";
import {
  useConversations,
  useMessages,
  useMessagingMutations,
  usePeerLastSeen,
} from "@/hooks/use-messaging";
import { MessageComposer } from "@/components/message-composer";
import { StoryViewerModal } from "@/components/story-viewer-modal";
import { formatRelativeTime } from "@/services/ambassador.service";
import { fetchStoryById } from "@/services/social.service";
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
  const [openStoryId, setOpenStoryId] = useState<string | null>(null);
  const openedRef = useRef(false);

  const { data: conversations = [], isLoading: loadingConversations } = useConversations();
  const { send, sendMedia, sendVoice, react, edit, deleteForAll, deleteForMe, openDirect, notifyTyping } = useMessagingMutations();
  const { messages, isLoading: loadingMessages, reactions, typingUser } = useMessages(activeId ?? undefined);

  const active = conversations.find((c) => c.id === activeId);
  const otherId = active?.participant_ids.find((id) => id !== profile?.userId) ?? withUserId;
  const { data: otherUser } = useAmbassador(otherId);
  const { data: lastSeen } = usePeerLastSeen(otherId);

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
  }, [withUserId, profile?.userId, conversations, storyParam, navigate, openDirect]);

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
    <div className="relative mx-auto h-[calc(100dvh-7rem)] max-w-6xl overflow-hidden rounded-2xl border border-border bg-surface md:h-[calc(100vh-9rem)]">
      {openStoryId && (
        <StoryViewerModal storyId={openStoryId} onClose={() => setOpenStoryId(null)} />
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
              <header className="flex items-center gap-2 border-b border-[#d1d7db] bg-[#f0f2f5] px-3 py-2.5 dark:border-border dark:bg-surface md:px-4 md:py-3">
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
                <div className="hidden w-40 sm:block">
                  <input
                    value={msgSearch}
                    onChange={(e) => setMsgSearch(e.target.value)}
                    placeholder="Rechercher…"
                    className="h-8 w-full rounded-lg border border-border bg-background px-2 text-xs outline-none"
                  />
                </div>
              </header>

              <div className="flex-1 space-y-1 overflow-y-auto bg-[#efeae2] p-2 dark:bg-background md:space-y-2 md:p-4" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d4cdc4' fill-opacity='0.25'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }}>
                {loadingMessages ? (
                  <div className="grid place-items-center py-12"><Loader2 className="h-6 w-6 animate-spin text-vsm-red" /></div>
                ) : (
                  visibleMessages.map((m) => (
                    <MessageBubble
                      key={m.id}
                      message={m}
                      isMine={m.author_id === profile?.userId}
                      reactions={reactions.get(m.id) ?? []}
                      conversationId={activeId!}
                      onReply={() => setReplyTo(m)}
                      onReact={(emoji, has) => react.mutate({ messageId: m.id, emoji, has })}
                      onEdit={(body) => edit.mutate({ messageId: m.id, body, conversationId: activeId! })}
                      onDeleteForAll={() => deleteForAll.mutate({ messageId: m.id, conversationId: activeId! })}
                      onDeleteForMe={() => deleteForMe.mutate({ messageId: m.id, conversationId: activeId! })}
                      onOpenStory={(id) => setOpenStoryId(id)}
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

function MessageBubble({
  message: m,
  isMine,
  reactions: rx,
  onReply,
  onReact,
  onEdit,
  onDeleteForAll,
  onDeleteForMe,
  onOpenStory,
}: {
  message: Message;
  isMine?: boolean;
  reactions: string[];
  conversationId: string;
  onReply: () => void;
  onReact: (emoji: string, has: boolean) => void;
  onEdit: (body: string) => void;
  onDeleteForAll: () => void;
  onDeleteForMe: () => void;
  onOpenStory: (storyId: string) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editBody, setEditBody] = useState(m.body);
  const longPressRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { data: story } = useQuery({
    queryKey: ["story-reply", m.story_id],
    queryFn: () => fetchStoryById(m.story_id!),
    enabled: !!m.story_id,
  });
  const url = String(m.metadata?.url ?? "");
  const read = isMine && (m.read_by?.length ?? 0) > 1;
  const deleted = m.deleted_for_all;

  const openMenu = () => setMenuOpen(true);

  return (
    <div className={`group flex ${isMine ? "justify-end" : "justify-start"}`}>
      <div
        className={`relative max-w-[88%] rounded-lg px-3 py-2 text-sm shadow-sm sm:max-w-[85%] sm:rounded-2xl ${
          isMine
            ? "rounded-br-none bg-[#d9fdd3] text-[#111b21] dark:bg-vsm-red dark:text-white"
            : "rounded-bl-none border border-[#d1d7db] bg-white text-[#111b21] dark:border-border dark:bg-background dark:text-foreground"
        }`}
        onContextMenu={(e) => { e.preventDefault(); openMenu(); }}
        onTouchStart={() => {
          longPressRef.current = setTimeout(openMenu, 500);
        }}
        onTouchEnd={() => {
          if (longPressRef.current) clearTimeout(longPressRef.current);
        }}
      >
        {m.story_id && story && (
          <button
            type="button"
            onClick={() => onOpenStory(m.story_id!)}
            className={`mb-2 block w-full overflow-hidden rounded-lg border text-left ${isMine ? "border-[#25d366]/30" : "border-border"}`}
          >
            {story.media_url.match(/\.(mp4|webm|mov)/i) ? (
              <video src={story.media_url} className="max-h-36 w-full bg-black object-contain" muted />
            ) : (
              <img src={story.media_url} alt="" className="max-h-36 w-full bg-black object-contain" />
            )}
            <p className={`px-2 py-1 text-[10px] uppercase tracking-wider ${isMine ? "text-[#667781]" : "text-muted-foreground"}`}>
              Story · toucher pour ouvrir
            </p>
          </button>
        )}
        {deleted ? (
          <p className="italic opacity-70">Ce message a été supprimé</p>
        ) : editing ? (
          <div className="space-y-2">
            <textarea value={editBody} onChange={(e) => setEditBody(e.target.value)} className="w-full rounded-lg border border-border bg-background p-2 text-sm text-foreground" rows={2} />
            <div className="flex gap-2">
              <button type="button" onClick={() => setEditing(false)} className="text-xs underline">Annuler</button>
              <button type="button" onClick={() => { onEdit(editBody); setEditing(false); }} className="text-xs font-bold underline">Enregistrer</button>
            </div>
          </div>
        ) : (
          <>
            {m.type === "image" && url && <img src={url} alt="" className="mb-1 max-h-48 rounded-lg object-cover" />}
            {m.type === "video" && url && <video src={url} controls className="mb-1 max-h-48 rounded-lg" />}
            {m.type === "voice" && url && <audio src={url} controls className="mb-1 w-full min-w-[200px]" />}
            {m.type === "doc" && url && (
              <a href={url} target="_blank" rel="noreferrer" className={`mb-1 block underline ${isMine ? "text-white/90" : "text-vsm-red"}`}>
                📎 {m.body || "Fichier"}
              </a>
            )}
            {(m.type === "text" || (m.body && !deleted)) && m.type !== "doc" && <p>{m.body}</p>}
          </>
        )}
        <div className={`mt-1 flex flex-wrap items-center gap-2 text-[10px] ${isMine ? "text-[#667781] dark:text-white/70" : "text-muted-foreground"}`}>
          <span>{formatRelativeTime(m.created_at)}{m.edited_at ? " · modifié" : ""}</span>
          {isMine && read && <CheckCheck className="h-3 w-3 text-[#53bdeb]" />}
        </div>
        {rx.length > 0 && <p className="mt-1 text-xs">{rx.join("")}</p>}
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          className={`absolute -right-1 top-1 grid h-7 w-7 place-items-center rounded-full opacity-100 md:opacity-0 md:group-hover:opacity-100 ${isMine ? "text-[#667781] dark:text-white/80" : "text-muted-foreground"}`}
          aria-label="Options"
        >
          <MoreVertical className="h-3.5 w-3.5" />
        </button>
        {menuOpen && (
          <div className={`absolute z-20 min-w-[180px] rounded-lg border py-1 text-xs shadow-lg ${isMine ? "right-0 top-7 border-border bg-white text-foreground dark:bg-popover" : "left-0 top-7 border-border bg-popover text-foreground"}`}>
            {!deleted && (
              <button type="button" className="block w-full px-3 py-2.5 text-left hover:bg-accent" onClick={() => { onReply(); setMenuOpen(false); }}>Répondre</button>
            )}
            {isMine && m.type === "text" && !deleted && (
              <button type="button" className="block w-full px-3 py-2.5 text-left hover:bg-accent" onClick={() => { setEditing(true); setMenuOpen(false); }}>Modifier</button>
            )}
            {isMine && !deleted && (
              <button type="button" className="block w-full px-3 py-2.5 text-left hover:bg-accent" onClick={() => { onDeleteForAll(); setMenuOpen(false); }}>Supprimer pour tous</button>
            )}
            <button type="button" className="block w-full px-3 py-2.5 text-left hover:bg-accent" onClick={() => { onDeleteForMe(); setMenuOpen(false); }}>Supprimer pour moi</button>
          </div>
        )}
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
