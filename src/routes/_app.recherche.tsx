import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, GraduationCap, Users, Trophy, Sparkles, FileText, Loader2 } from "lucide-react";
import { useAmbassadors } from "@/hooks/use-ambassadors";
import { useChallenges } from "@/hooks/use-gamification";
import { useSearchPosts } from "@/hooks/use-social";

export const Route = createFileRoute("/_app/recherche")({
  component: GlobalSearch,
});

type T = "all" | "people" | "courses" | "challenges" | "opportunities" | "posts" | "resources" | "messages";

function GlobalSearch() {
  const [q, setQ] = useState("");
  const [tab, setTab] = useState<T>("all");
  const ql = q.trim().toLowerCase();

  const { data: ambassadors = [] } = useAmbassadors(50);
  const { data: challenges = [] } = useChallenges();
  const { data: posts = [], isLoading } = useSearchPosts(q);

  const results = useMemo(
    () => ({
      people: ambassadors
        .filter((a) => a.name.toLowerCase().includes(ql) || a.handle.includes(ql) || a.badge.toLowerCase().includes(ql))
        .slice(0, 8),
      challenges: challenges.filter((c) => c.title.toLowerCase().includes(ql)).slice(0, 6),
      posts: posts.slice(0, 6),
    }),
    [ambassadors, challenges, posts, ql],
  );

  const hasResults = results.people.length + results.challenges.length + results.posts.length > 0;

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
          placeholder="Rechercher des personnes, cours, défis, publications…"
          className="h-14 w-full rounded-2xl border border-border bg-surface pl-12 pr-4 text-base outline-none focus:border-vsm-red/60"
        />
      </div>

      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 text-xs">
        {(
          [
            ["all", "Tout"],
            ["people", "Personnes"],
            ["challenges", "Défis"],
            ["posts", "Publications"],
          ] as const
        ).map(([k, l]) => (
          <button
            key={k}
            onClick={() => setTab(k as T)}
            className={`whitespace-nowrap rounded-full border px-3 py-1.5 font-semibold uppercase tracking-wider ${tab === k ? "border-vsm-red bg-vsm-red text-white" : "border-border text-muted-foreground hover:text-foreground"}`}
          >
            {l}
          </button>
        ))}
      </div>

      {isLoading && q.length >= 2 && (
        <div className="grid place-items-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-vsm-red" />
        </div>
      )}

      {!isLoading && q.length >= 2 && !hasResults && (
        <p className="rounded-xl border border-dashed border-border bg-surface p-8 text-center text-sm text-muted-foreground">
          Aucun résultat pour « {q} ».
        </p>
      )}

      {(tab === "all" || tab === "people") && results.people.length > 0 && (
        <Section title="Personnes" icon={Users}>
          {results.people.map((a) => (
            <Link key={a.id} to="/ambassadeur/$id" params={{ id: a.id }} className="flex items-center gap-3 rounded-xl border border-border bg-surface p-3 hover:border-vsm-red/40">
              <img src={a.avatar} alt="" className="h-10 w-10 rounded-lg bg-background object-cover" />
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

      {(tab === "all" || tab === "posts") && results.posts.length > 0 && (
        <Section title="Publications" icon={FileText}>
          {results.posts.map((p) => (
            <Link key={p.id} to="/communaute" className="block rounded-xl border border-border bg-surface p-3 hover:border-vsm-red/40">
              <p className="line-clamp-2 text-sm">{p.text}</p>
            </Link>
          ))}
        </Section>
      )}

      {q.length < 2 && (
        <p className="text-center text-sm text-muted-foreground">Tapez au moins 2 caractères pour rechercher.</p>
      )}
    </div>
  );
}

function Section({ title, icon: Icon, children }: { title: string; icon: React.ComponentType<{ className?: string }>; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <h2 className="flex items-center gap-2 font-display text-sm font-bold uppercase tracking-wider">
        <Icon className="h-4 w-4 text-vsm-red" /> {title}
      </h2>
      <div className="grid gap-2">{children}</div>
    </section>
  );
}
