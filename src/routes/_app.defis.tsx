import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Trophy, Clock, Users, Flame, Calendar, Star, Loader2 } from "lucide-react";
import { useChallenges, useJoinChallenge } from "@/hooks/use-gamification";

export const Route = createFileRoute("/_app/defis")({
  component: ChallengesPage,
});

type T = "all" | "weekly" | "monthly" | "special";

function ChallengesPage() {
  const [tab, setTab] = useState<T>("all");
  const [active, setActive] = useState<string | null>(null);
  const { data: challenges = [], isLoading } = useChallenges();
  const joinChallenge = useJoinChallenge();

  const list = tab === "all" ? challenges : challenges.filter((c) => c.type === tab);
  const current = active ? challenges.find((c) => c.id === active) : null;

  useEffect(() => {
    if (!active) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [active]);

  if (isLoading) {
    return (
      <div className="grid min-h-[40vh] place-items-center">
        <Loader2 className="h-8 w-8 animate-spin text-vsm-red" />
      </div>
    );
  }

  return (
    <div className="mx-auto min-w-0 max-w-6xl space-y-6 overflow-x-hidden">
      <header className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-lg bg-vsm-red/15 text-vsm-red">
          <Trophy className="h-5 w-5" />
        </span>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-vsm-red">Programme Ambassadeurs</p>
          <h1 className="font-display text-3xl font-bold uppercase tracking-wide md:text-4xl">Défis</h1>
          <p className="mt-1 text-sm text-muted-foreground">Relève les défis officiels, gagne XP, points et opportunités.</p>
        </div>
      </header>

      <div className="-mx-1 flex items-center gap-1 overflow-x-auto rounded-xl border border-border bg-surface p-1 text-sm [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {[
          { k: "all", label: "Tous", short: "Tous", icon: Star },
          { k: "weekly", label: "Hebdomadaires", short: "Sem.", icon: Calendar },
          { k: "monthly", label: "Mensuels", short: "Mois", icon: Flame },
          { k: "special", label: "Spéciaux", short: "Spéc.", icon: Trophy },
        ].map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.k}
              onClick={() => setTab(t.k as T)}
              className={`inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-wider transition-colors sm:gap-2 sm:px-4 ${tab === t.k ? "bg-vsm-red text-white shadow-glow-red" : "text-muted-foreground hover:text-foreground"}`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span className="sm:hidden">{t.short}</span>
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          );
        })}
      </div>

      {list.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-surface p-12 text-center text-sm text-muted-foreground">
          Aucun défi actif pour le moment. Revenez bientôt !
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {list.map((c) => (
            <button
              key={c.id}
              onClick={() => setActive(c.id)}
              className="group text-left rounded-2xl border border-border bg-surface p-5 transition-all hover:border-vsm-red/40 hover:shadow-glow-red"
            >
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-vsm-red/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-vsm-red">{c.type}</span>
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><Clock className="h-3 w-3" /> {c.deadline}</span>
              </div>
              <h3 className="mt-3 font-display text-lg font-bold uppercase tracking-wide">{c.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{c.goal}</p>
              <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-background">
                <div className="h-full rounded-full bg-vsm-red" style={{ width: `${c.progress}%` }} />
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {c.participants}</span>
                <span className="font-display font-bold text-vsm-red">+{c.reward_xp} XP</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {current && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 p-0 backdrop-blur sm:items-center sm:p-4"
          onClick={() => setActive(null)}
        >
          <div
            className="max-h-[92dvh] w-full max-w-2xl overflow-y-auto overscroll-contain rounded-t-2xl border border-border bg-surface sm:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-br from-vsm-red to-vsm-red-glow p-6 text-white">
              <p className="text-[11px] uppercase tracking-[0.2em] opacity-90">Défi {current.type}</p>
              <h2 className="mt-1 font-display text-2xl font-bold uppercase tracking-wide">{current.title}</h2>
              <p className="mt-2 text-sm opacity-90">{current.description}</p>
              <div className="mt-4 flex items-center gap-4 text-xs uppercase tracking-wider">
                <span>+{current.reward_xp} XP</span>
                <span>+{current.reward_points} pts</span>
                <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {current.deadline}</span>
              </div>
            </div>
            <div className="p-6">
              <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Top participants</h3>
              {current.ranking.length === 0 ? (
                <p className="text-sm text-muted-foreground">Soyez le premier à participer !</p>
              ) : (
                <ol className="space-y-2">
                  {current.ranking.slice(0, 5).map((r) => (
                    <li key={r.rank} className="flex items-center gap-3 rounded-lg bg-background p-2.5">
                      <span className="grid h-7 w-7 place-items-center rounded-md bg-vsm-red/15 text-xs font-bold text-vsm-red">{r.rank}</span>
                      <img src={r.avatar} alt="" className="h-8 w-8 rounded-lg object-cover" />
                      <p className="flex-1 text-sm font-semibold">{r.name}</p>
                      <span className="font-display font-bold text-vsm-red">{r.score}</span>
                    </li>
                  ))}
                </ol>
              )}
              <button
                disabled={current.joined || joinChallenge.isPending}
                onClick={() => joinChallenge.mutate(current.id)}
                className="mt-5 w-full rounded-lg bg-vsm-red py-3 text-sm font-bold uppercase tracking-wider text-white shadow-glow-red disabled:opacity-50"
              >
                {current.joined ? "Déjà inscrit" : joinChallenge.isPending ? "Inscription…" : "Participer au défi"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
