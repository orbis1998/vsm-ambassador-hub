import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Image, Video, FileText, Smile, Hash, Users as UsersIcon, Sparkles } from "lucide-react";
import { posts, groups } from "@/lib/social-data";
import { currentUser, ambassadors } from "@/lib/mock-data";
import { StoryRail } from "@/components/story-rail";
import { PostCard } from "@/components/post-card";

export const Route = createFileRoute("/_app/communaute")({
  component: CommunityPage,
});

type Tab = "all" | "following" | "mine" | "trending";

function CommunityPage() {
  const [tab, setTab] = useState<Tab>("all");
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState("");

  const filtered = useMemo(() => {
    let list = posts;
    if (tab === "mine") list = list.filter((p) => p.author_id === currentUser.id);
    if (tab === "trending") list = [...list].sort((a, b) =>
      Object.values(b.reactions).reduce((x, y) => x + y, 0) -
      Object.values(a.reactions).reduce((x, y) => x + y, 0),
    );
    if (query) list = list.filter((p) => p.text.toLowerCase().includes(query.toLowerCase()));
    return list.slice(0, 40);
  }, [tab, query]);

  const suggested = ambassadors.slice(10, 16);

  return (
    <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[1fr_320px]">
      <div className="min-w-0 space-y-6">
        {/* Header */}
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-vsm-red">Espace ambassadeurs</p>
            <h1 className="font-display text-3xl font-bold uppercase tracking-wide md:text-4xl">Communauté</h1>
            <p className="mt-1 text-sm text-muted-foreground">Le fil privé des ambassadeurs VSM. Partage, apprends, élève.</p>
          </div>
          <div className="flex items-center gap-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher dans le fil…"
              className="h-10 w-60 rounded-lg border border-border bg-surface px-3 text-sm outline-none focus:border-vsm-red/50"
            />
          </div>
        </header>

        {/* Stories */}
        <StoryRail />

        {/* Composer */}
        <div className="rounded-2xl border border-border bg-surface p-4">
          <div className="flex items-start gap-3">
            <img src={currentUser.avatar} alt="" className="h-10 w-10 rounded-xl border border-border bg-background" />
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={`Quoi de neuf, ${currentUser.name.split(" ")[0]} ?`}
              className="min-h-[60px] flex-1 resize-none rounded-xl border border-border bg-background p-3 text-sm outline-none focus:border-vsm-red/50"
            />
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
            <div className="flex items-center gap-1 text-muted-foreground">
              {[
                { icon: Image, label: "Photo" },
                { icon: Video, label: "Vidéo" },
                { icon: FileText, label: "Document" },
                { icon: Smile, label: "Emoji" },
                { icon: Hash, label: "Tag" },
              ].map((b) => (
                <button key={b.label} className="inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs hover:bg-accent hover:text-foreground">
                  <b.icon className="h-4 w-4" /> <span className="hidden sm:inline">{b.label}</span>
                </button>
              ))}
            </div>
            <button
              disabled={!draft.trim()}
              onClick={() => setDraft("")}
              className="rounded-lg bg-vsm-red px-4 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-glow-red disabled:opacity-40"
            >
              Publier
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 rounded-xl border border-border bg-surface p-1 text-sm">
          {[
            { k: "all", label: "Tout" },
            { k: "following", label: "Suivis" },
            { k: "trending", label: "Tendances" },
            { k: "mine", label: "Mes posts" },
          ].map((t) => (
            <button
              key={t.k}
              onClick={() => setTab(t.k as Tab)}
              className={`flex-1 rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-wider transition-colors ${tab === t.k ? "bg-vsm-red text-white shadow-glow-red" : "text-muted-foreground hover:text-foreground"}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Feed */}
        <div className="space-y-5">
          {filtered.map((p) => (
            <PostCard key={p.id} post={p} />
          ))}
        </div>
      </div>

      {/* Sidebar right */}
      <aside className="hidden space-y-5 lg:block">
        <div className="rounded-2xl border border-border bg-surface p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-sm font-bold uppercase tracking-wider">Groupes</h3>
            <Link to="/communaute/groupes" className="text-[11px] uppercase tracking-wider text-vsm-red hover:underline">Voir tout</Link>
          </div>
          <ul className="mt-3 space-y-2">
            {groups.slice(0, 5).map((g) => (
              <li key={g.id}>
                <Link to="/communaute/groupes/$id" params={{ id: g.id }} className="flex items-center gap-3 rounded-lg p-2 hover:bg-accent">
                  <img src={g.cover} alt="" className="h-10 w-10 rounded-lg object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{g.name}</p>
                    <p className="text-[11px] text-muted-foreground">{g.members} membres</p>
                  </div>
                  <UsersIcon className="h-4 w-4 text-vsm-red" />
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-4">
          <h3 className="flex items-center gap-2 font-display text-sm font-bold uppercase tracking-wider">
            <Sparkles className="h-4 w-4 text-vsm-red" /> Ambassadeurs à suivre
          </h3>
          <ul className="mt-3 space-y-2">
            {suggested.map((a) => (
              <li key={a.id} className="flex items-center gap-3">
                <img src={a.avatar} alt="" className="h-9 w-9 rounded-lg bg-background" />
                <div className="min-w-0 flex-1">
                  <Link to="/ambassadeur/$id" params={{ id: a.id }} className="truncate text-sm font-semibold hover:text-vsm-red">{a.name}</Link>
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{a.level}</p>
                </div>
                <button className="rounded-md border border-vsm-red px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-vsm-red hover:bg-vsm-red hover:text-white">Suivre</button>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  );
}
