import { createFileRoute } from "@tanstack/react-router";
import { Crown } from "lucide-react";
import { leaderboard } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/classement")({
  component: LeaderboardPage,
});

function LeaderboardPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-lg bg-vsm-red/15 text-vsm-red">
          <Crown className="h-5 w-5" />
        </span>
        <div>
          <h1 className="font-display text-3xl font-bold uppercase tracking-wide">Classement</h1>
          <p className="text-sm text-muted-foreground">Top ambassadeurs VSM ce mois-ci.</p>
        </div>
      </header>

      <div className="rounded-2xl border border-border bg-surface p-2">
        <ol className="divide-y divide-border">
          {leaderboard.map((a) => {
            const top3 = a.rank <= 3;
            return (
              <li key={a.id} className="flex items-center gap-4 p-3 transition-colors hover:bg-accent/40">
                <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-md font-display text-sm font-bold ${top3 ? "bg-vsm-red text-white shadow-glow-red" : "bg-surface-elevated text-muted-foreground"}`}>
                  {a.rank}
                </span>
                <img src={a.avatar} alt="" className="h-11 w-11 rounded-lg bg-surface" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{a.name}</p>
                  <p className="text-xs text-muted-foreground">{a.badge} · {a.country}</p>
                </div>
                <div className="hidden text-right sm:block">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Niveau</p>
                  <p className="text-sm font-semibold">{a.level}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">XP</p>
                  <p className="font-display text-base font-bold text-vsm-red">{a.xp.toLocaleString()}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
