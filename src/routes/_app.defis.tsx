import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Trophy, Clock, Users, Flame, Calendar, Star } from "lucide-react";
import { vsmChallenges } from "@/lib/social-data";

export const Route = createFileRoute("/_app/defis")({
  component: ChallengesPage,
});

type T = "all" | "weekly" | "monthly" | "special";

function ChallengesPage() {
  const [tab, setTab] = useState<T>("all");
  const [active, setActive] = useState<string | null>(null);
  const list = tab === "all" ? vsmChallenges : vsmChallenges.filter((c) => c.type === tab);
  const current = active ? vsmChallenges.find((c) => c.id === active) : null;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
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

      <div className="flex items-center gap-1 rounded-xl border border-border bg-surface p-1 text-sm">
        {[
          { k: "all", label: "Tous", icon: Star },
          { k: "weekly", label: "Hebdomadaires", icon: Calendar },
          { k: "monthly", label: "Mensuels", icon: Flame },
          { k: "special", label: "Spéciaux", icon: Trophy },
        ].map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.k}
              onClick={() => setTab(t.k as T)}
              className={`inline-flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-wider transition-colors ${tab === t.k ? "bg-vsm-red text-white shadow-glow-red" : "text-muted-foreground hover:text-foreground"}`}
            >
              <Icon className="h-3.5 w-3.5" /> {t.label}
            </button>
          );
        })}
      </div>

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

      {current && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/80 p-4 backdrop-blur" onClick={() => setActive(null)}>
          <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-border bg-surface" onClick={(e) => e.stopPropagation()}>
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
              <ol className="space-y-2">
                {current.ranking.slice(0, 5).map((r) => (
                  <li key={r.rank} className="flex items-center gap-3 rounded-lg bg-background p-2.5">
                    <span className="grid h-7 w-7 place-items-center rounded-md bg-vsm-red/15 text-xs font-bold text-vsm-red">{r.rank}</span>
                    <img src={r.avatar} alt="" className="h-8 w-8 rounded-lg" />
                    <p className="flex-1 text-sm font-semibold">{r.name}</p>
                    <span className="font-display font-bold text-vsm-red">{r.score}</span>
                  </li>
                ))}
              </ol>
              <button className="mt-5 w-full rounded-lg bg-vsm-red py-3 text-sm font-bold uppercase tracking-wider text-white shadow-glow-red">Participer au défi</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
