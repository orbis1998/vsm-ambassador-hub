import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Users, Lock, Globe2 } from "lucide-react";
import { groups } from "@/lib/social-data";

export const Route = createFileRoute("/_app/communaute/groupes")({
  component: GroupsPage,
});

function GroupsPage() {
  const [query, setQuery] = useState("");
  const list = groups.filter((g) => g.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-vsm-red">Communauté · Groupes</p>
          <h1 className="font-display text-3xl font-bold uppercase tracking-wide md:text-4xl">Groupes privés</h1>
          <p className="mt-1 text-sm text-muted-foreground">Rejoins les groupes thématiques de la famille VSM.</p>
        </div>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher un groupe…"
          className="h-10 w-64 rounded-lg border border-border bg-surface px-3 text-sm outline-none focus:border-vsm-red/50"
        />
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((g) => (
          <Link
            key={g.id}
            to="/communaute/groupes/$id"
            params={{ id: g.id }}
            className="group overflow-hidden rounded-2xl border border-border bg-surface transition-all hover:border-vsm-red/40 hover:shadow-glow-red"
          >
            <div className="relative aspect-[16/9] overflow-hidden">
              <img src={g.cover} alt="" className="h-full w-full object-cover transition-transform group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
              <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur">
                {g.privacy === "private" ? <Lock className="h-3 w-3" /> : <Globe2 className="h-3 w-3" />}
                {g.privacy}
              </span>
              <span className="absolute right-3 top-3 rounded-full bg-vsm-red px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">{g.category}</span>
            </div>
            <div className="p-4">
              <h3 className="font-display text-lg font-bold uppercase tracking-wide">{g.name}</h3>
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{g.description}</p>
              <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {g.members} membres</span>
                <span>{g.posts} publications</span>
              </div>
              <button className={`mt-3 w-full rounded-lg py-2 text-xs font-bold uppercase tracking-wider transition-colors ${g.joined ? "border border-border text-muted-foreground" : "bg-vsm-red text-white shadow-glow-red"}`}>
                {g.joined ? "Membre" : "Rejoindre"}
              </button>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
