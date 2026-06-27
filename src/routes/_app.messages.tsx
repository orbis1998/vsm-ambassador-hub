import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, Send, Paperclip, Image as ImageIcon, Mic, Smile, Phone, Video as VideoIcon, MoreHorizontal, Pin } from "lucide-react";
import { conversations, messages } from "@/lib/social-data";
import { ambassadors, currentUser } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/messages")({
  component: MessagesPage,
});

function MessagesPage() {
  const [activeId, setActiveId] = useState(conversations[0].id);
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState("");

  const list = useMemo(
    () => conversations.filter((c) => {
      const other = ambassadors.find((a) => a.id === c.participant_ids.find((id) => id !== currentUser.id));
      return (c.title ?? other?.name ?? "").toLowerCase().includes(query.toLowerCase());
    }),
    [query],
  );
  const active = conversations.find((c) => c.id === activeId)!;
  const other = ambassadors.find((a) => a.id === active.participant_ids.find((id) => id !== currentUser.id)) ?? ambassadors[0];
  const thread = messages.filter((m) => m.conversation_id === activeId);

  return (
    <div className="mx-auto h-[calc(100vh-8rem)] max-w-6xl overflow-hidden rounded-2xl border border-border bg-surface md:h-[calc(100vh-9rem)]">
      <div className="grid h-full grid-cols-1 md:grid-cols-[320px_1fr]">
        {/* List */}
        <aside className="hidden flex-col border-r border-border md:flex">
          <div className="border-b border-border p-4">
            <h2 className="font-display text-lg font-bold uppercase tracking-wide">Messages</h2>
            <div className="relative mt-3">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher…"
                className="h-9 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm outline-none focus:border-vsm-red/50"
              />
            </div>
          </div>
          <ul className="flex-1 overflow-y-auto">
            {list.map((c) => {
              const o = ambassadors.find((a) => a.id === c.participant_ids.find((id) => id !== currentUser.id)) ?? ambassadors[0];
              const isActive = c.id === activeId;
              return (
                <li key={c.id}>
                  <button
                    onClick={() => setActiveId(c.id)}
                    className={`flex w-full items-center gap-3 border-b border-border/60 p-3 text-left transition-colors ${isActive ? "bg-accent" : "hover:bg-accent/50"}`}
                  >
                    <img src={o.avatar} alt="" className="h-11 w-11 shrink-0 rounded-xl bg-background" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-sm font-semibold">{c.title ?? o.name}</p>
                        <span className="shrink-0 text-[10px] uppercase tracking-wider text-muted-foreground">{Math.floor((Date.now() - new Date(c.last_at).getTime()) / 3600_000)}h</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="truncate text-xs text-muted-foreground">{c.last_message}</p>
                        {c.unread > 0 && <span className="grid h-4 min-w-4 shrink-0 place-items-center rounded-full bg-vsm-red px-1 text-[10px] font-bold text-white">{c.unread}</span>}
                      </div>
                    </div>
                    {c.pinned && <Pin className="h-3 w-3 text-vsm-red" />}
                  </button>
                </li>
              );
            })}
          </ul>
        </aside>

        {/* Thread */}
        <section className="flex min-w-0 flex-col">
          <header className="flex items-center justify-between border-b border-border p-3">
            <div className="flex items-center gap-3">
              <img src={other.avatar} alt="" className="h-10 w-10 rounded-xl bg-background" />
              <div>
                <p className="text-sm font-semibold">{active.title ?? other.name}</p>
                <p className="text-[11px] uppercase tracking-wider text-vsm-red">En ligne</p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <button className="grid h-9 w-9 place-items-center rounded-md hover:bg-accent hover:text-foreground"><Phone className="h-4 w-4" /></button>
              <button className="grid h-9 w-9 place-items-center rounded-md hover:bg-accent hover:text-foreground"><VideoIcon className="h-4 w-4" /></button>
              <button className="grid h-9 w-9 place-items-center rounded-md hover:bg-accent hover:text-foreground"><MoreHorizontal className="h-4 w-4" /></button>
            </div>
          </header>

          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {thread.map((m) => {
              const mine = m.author_id === currentUser.id;
              return (
                <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-sm shadow-elegant ${mine ? "bg-vsm-red text-white" : "bg-background text-foreground"}`}>
                    {m.type === "image" && <img src={m.body} alt="" className="mb-1 max-h-60 rounded-lg" />}
                    {m.type === "voice" && (
                      <span className="inline-flex items-center gap-2">
                        <Mic className="h-4 w-4" />
                        <span className="font-mono">{m.body}</span>
                      </span>
                    )}
                    {m.type === "text" && <p>{m.body}</p>}
                    <p className={`mt-1 text-right text-[10px] ${mine ? "text-white/70" : "text-muted-foreground"}`}>
                      {new Date(m.created_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center gap-2 border-t border-border p-3">
            <button className="grid h-9 w-9 place-items-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"><Paperclip className="h-4 w-4" /></button>
            <button className="grid h-9 w-9 place-items-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"><ImageIcon className="h-4 w-4" /></button>
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Écrire un message…"
              className="h-10 flex-1 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-vsm-red/50"
            />
            <button className="grid h-9 w-9 place-items-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"><Smile className="h-4 w-4" /></button>
            <button className="grid h-9 w-9 place-items-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"><Mic className="h-4 w-4" /></button>
            <button
              disabled={!draft.trim()}
              onClick={() => setDraft("")}
              className="grid h-10 w-10 place-items-center rounded-lg bg-vsm-red text-white shadow-glow-red disabled:opacity-40"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
