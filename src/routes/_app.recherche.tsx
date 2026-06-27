import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, GraduationCap, Users, Trophy, Sparkles, FileText, MessageSquare, BookOpen } from "lucide-react";
import { ambassadors } from "@/lib/mock-data";
import { posts, vsmChallenges, vsmOpportunities, conversations } from "@/lib/social-data";

export const Route = createFileRoute("/_app/recherche")({
  component: GlobalSearch,
});

type T = "all" | "people" | "courses" | "challenges" | "opportunities" | "posts" | "resources" | "messages";

function GlobalSearch() {
  const [q, setQ] = useState("");
  const [tab, setTab] = useState<T>("all");

  const ql = q.toLowerCase();
  const results = useMemo(() => ({
    people: ambassadors.filter((a) => a.name.toLowerCase().includes(ql) || a.handle.includes(ql)).slice(0, 8),
    challenges: vsmChallenges.filter((c) => c.title.toLowerCase().includes(ql)).slice(0, 6),
    opportunities: vsmOpportunities.filter((o) => o.title.toLowerCase().includes(ql)).slice(0, 6),
    posts: posts.filter((p) => p.text.toLowerCase().includes(ql)).slice(0, 6),
    messages: conversations.filter((c) => (c.title ?? "").toLowerCase().includes(ql) || c.last_message.toLowerCase().includes(ql)).slice(0, 4),
  }), [ql]);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header className="text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-vsm-red">Recherche globale</p>
        <h1 className="font-display text-3xl font-bold uppercase tracking-wide md:text-4xl">Tout VSM en un seul endroit</h1>
      </header>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Rechercher des personnes, cours, défis, opportunités…"
          className="h-14 w-full rounded-2xl border border-border bg-surface pl-12 pr-4 text-base outline-none focus:border-vsm-red/60"
        />
      </div>

      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 text-xs">
        {([
          ["all","Tout"],["people","Personnes"],["courses","Cours"],["challenges","Défis"],
          ["opportunities","Opportunités"],["posts","Publications"],["resources","Ressources"],["messages","Messages"],
        ] as const).map(([k,l]) => (
          <button key={k} onClick={() => setTab(k as T)} className={`whitespace-nowrap rounded-full border px-3 py-1.5 font-semibold uppercase tracking-wider ${tab === k ? "border-vsm-red bg-vsm-red text-white" : "border-border text-muted-foreground hover:text-foreground"}`}>{l}</button>
        ))}
      </div>

      {(tab === "all" || tab === "people") && results.people.length > 0 && (
        <Section title="Personnes" icon={Users}>
          {results.people.map((a) => (
            <Link key={a.id} to="/ambassadeur/$id" params={{ id: a.id }} className="flex items-center gap-3 rounded-xl border border-border bg-surface p-3 hover:border-vsm-red/40">
              <img src={a.avatar} alt="" className="h-10 w-10 rounded-lg bg-background" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{a.name}</p>
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{a.badge} · {a.level}</p>
              </div>
            </Link>
          ))}
        </Section>
      )}

      {(tab === "all" || tab === "challenges") && results.challenges.length > 0 && (
        <Section title="Défis" icon={Trophy}>
          {results.challenges.map((c) => (
            <Link key={c.id} to="/defis" className="rounded-xl border border-border bg-surface p-3 hover:border-vsm-red/40">
              <p className="text-sm font-semibold">{c.title}</p>
              <p className="mt-0.5 text-[11px] uppercase tracking-wider text-muted-foreground">{c.type} · +{c.reward_xp} XP</p>
            </Link>
          ))}
        </Section>
      )}

      {(tab === "all" || tab === "opportunities") && results.opportunities.length > 0 && (
        <Section title="Opportunités" icon={Sparkles}>
          {results.opportunities.map((o) => (
            <Link key={o.id} to="/opportunites" className="rounded-xl border border-border bg-surface p-3 hover:border-vsm-red/40">
              <p className="text-sm font-semibold">{o.title}</p>
              <p className="mt-0.5 text-[11px] uppercase tracking-wider text-muted-foreground">{o.category} · {o.location}</p>
            </Link>
          ))}
        </Section>
      )}

      {(tab === "all" || tab === "posts") && results.posts.length > 0 && (
        <Section title="Publications" icon={FileText}>
          {results.posts.map((p) => (
            <Link key={p.id} to="/communaute" className="rounded-xl border border-border bg-surface p-3 hover:border-vsm-red/40">
              <p className="line-clamp-2 text-sm">{p.text}</p>
            </Link>
          ))}
        </Section>
      )}

      {(tab === "all" || tab === "messages") && results.messages.length > 0 && (
        <Section title="Messages" icon={MessageSquare}>
          {results.messages.map((c) => (
            <Link key={c.id} to="/messages" className="rounded-xl border border-border bg-surface p-3 hover:border-vsm-red/40">
              <p className="text-sm font-semibold">{c.title ?? "Conversation"}</p>
              <p className="text-xs text-muted-foreground">{c.last_message}</p>
            </Link>
          ))}
        </Section>
      )}

      {(tab === "all" || tab === "courses") && (
        <Section title="Cours" icon={GraduationCap}>
          <Link to="/academie" className="rounded-xl border border-border bg-surface p-3 hover:border-vsm-red/40">
            <p className="text-sm font-semibold">Explorer l'Académie</p>
            <p className="text-xs text-muted-foreground">10 parcours · 300 leçons</p>
          </Link>
        </Section>
      )}

      {(tab === "all" || tab === "resources") && (
        <Section title="Ressources" icon={BookOpen}>
          <Link to="/ressources" className="rounded-xl border border-border bg-surface p-3 hover:border-vsm-red/40">
            <p className="text-sm font-semibold">Bibliothèque de ressources</p>
            <p className="text-xs text-muted-foreground">Templates Canva, scripts, brand kit…</p>
          </Link>
        </Section>
      )}

      {q && Object.values(results).every((r) => r.length === 0) && (
        <p className="rounded-xl border border-border bg-surface p-8 text-center text-sm text-muted-foreground">
          Aucun résultat pour « {q} ».
        </p>
      )}
    </div>
  );
}

function Section({ title, icon: Icon, children }: { title: string; icon: typeof Users; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-2 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        <Icon className="h-3.5 w-3.5 text-vsm-red" /> {title}
      </h2>
      <div className="grid gap-2 sm:grid-cols-2">{children}</div>
    </section>
  );
}
