import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Crown, Trophy, Loader2 } from "lucide-react";
import { useLeaderboard } from "@/hooks/use-ambassadors";

export const Route = createFileRoute("/_app/classement")({
  component: LeaderboardPage,
});

type Scope = "national" | "city" | "promotion" | "week" | "month" | "xp" | "points" | "certifs";

function LeaderboardPage() {
  const [scope, setScope] = useState<Scope>("xp");
  const [city, setCity] = useState<string>("Toutes");
  const { data: ambassadors = [], isLoading } = useLeaderboard(100);

  const cities = useMemo(
    () => ["Toutes", ...Array.from(new Set(ambassadors.map((a) => a.country)))],
    [ambassadors],
  );

  const ranked = useMemo(() => {
    let list = [...ambassadors];
    if (scope === "city" && city !== "Toutes") list = list.filter((a) => a.country === city);
    if (scope === "points") list.sort((a, b) => b.points - a.points);
    else if (scope === "certifs") list.sort((a, b) => (b.id.length - a.id.length));
    else list.sort((a, b) => b.xp - a.xp);
    return list.slice(0, 100).map((a, i) => ({ ...a, rank: i + 1 }));
  }, [scope, city, ambassadors]);

  if (isLoading) {
    return (
      <div className="grid min-h-[40vh] place-items-center">
        <Loader2 className="h-8 w-8 animate-spin text-vsm-red" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-lg bg-vsm-red/15 text-vsm-red">
          <Crown className="h-5 w-5" />
        </span>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-vsm-red">Hall of fame</p>
          <h1 className="font-display text-3xl font-bold uppercase tracking-wide md:text-4xl">Classements VSM</h1>
          <p className="mt-1 text-sm text-muted-foreground">Top 100 ambassadeurs — performances, XP, certifications.</p>
        </div>
      </header>

      <div className="flex flex-wrap items-center gap-2">
        {([
          ["xp","Par XP"],["points","Par points"],["certifs","Certifications"],
          ["national","National"],["city","Par ville"],["promotion","Par promotion"],
          ["week","Semaine"],["month","Mois"],
        ] as const).map(([k, label]) => (
          <button
            key={k}
            onClick={() => setScope(k)}
            className={`rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors ${scope === k ? "border-vsm-red bg-vsm-red text-white shadow-glow-red" : "border-border text-muted-foreground hover:text-foreground"}`}
          >
            {label}
          </button>
        ))}
        {scope === "city" && (
          <select value={city} onChange={(e) => setCity(e.target.value)} className="ml-auto h-9 rounded-lg border border-border bg-surface px-3 text-xs">
            {cities.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        )}
      </div>

      {/* Podium */}
      <div className="grid gap-3 sm:grid-cols-3">
        {ranked.slice(0, 3).map((a, i) => (
          <div key={a.id} className={`relative overflow-hidden rounded-2xl border border-border bg-surface p-5 text-center ${i === 0 ? "sm:order-2 sm:-mt-2 sm:border-vsm-red shadow-glow-red" : i === 1 ? "sm:order-1" : "sm:order-3"}`}>
            <span className={`grid h-12 w-12 mx-auto place-items-center rounded-full ${i === 0 ? "bg-vsm-red text-white" : "bg-surface-elevated text-vsm-red"}`}>
              <Trophy className="h-6 w-6" />
            </span>
            <img src={a.avatar} alt="" className="mx-auto mt-3 h-16 w-16 rounded-2xl bg-background" />
            <p className="mt-2 font-display text-base font-bold uppercase">{a.name}</p>
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{a.badge}</p>
            <p className="mt-2 font-display text-2xl font-bold text-vsm-red">{a.xp.toLocaleString()} XP</p>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-surface">
        <ol className="divide-y divide-border">
          {ranked.slice(3).map((a) => (
            <li key={a.id} className="flex items-center gap-4 p-3 transition-colors hover:bg-accent/40">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-background font-mono text-sm font-bold text-muted-foreground">{a.rank}</span>
              <img src={a.avatar} alt="" className="h-10 w-10 rounded-lg bg-background" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{a.name}</p>
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{a.badge} · {a.country}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{scope === "points" ? "Points" : "XP"}</p>
                <p className="font-display text-base font-bold text-vsm-red">{(scope === "points" ? a.points : a.xp).toLocaleString()}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
