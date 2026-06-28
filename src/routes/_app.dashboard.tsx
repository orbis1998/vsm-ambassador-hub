import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Flame, Trophy, Award, Sparkles, BookOpen, Target, TrendingUp,
  Crown, ChevronRight, Bell,
} from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import { useLeaderboard } from "@/hooks/use-ambassadors";
import { useNotifications } from "@/hooks/use-notifications";
import { useChallenges, useActivityLogs } from "@/hooks/use-gamification";
import { formatRelativeTime } from "@/services/ambassador.service";
import { profileAvatarUrl } from "@/lib/program-tier";

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — VSM Ambassador Academy" },
      { name: "description", content: "Votre tableau de bord ambassadeur : progression, défis, classement et opportunités." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { profile } = useAuth();
  const { data: leaderboard = [] } = useLeaderboard(10);
  const { data: notifications = [] } = useNotifications(4);
  const { data: challenges = [] } = useChallenges();
  const { data: activityLogs = [] } = useActivityLogs(5);
  const activeChallenges = challenges.filter((c) => c.joined || c.type === "weekly").slice(0, 3);

  const userXp = profile?.xp ?? 0;
  const userPoints = profile?.points ?? 0;
  const academyProgress = profile?.academyProgress ?? 0;
  const xpNextLevel = Math.max(userXp + 500, 500);
  const xpPct = Math.min(100, Math.round((userXp / xpNextLevel) * 100));
  const firstName = profile?.name?.split(" ")[0] ?? "Ambassadeur";
  const avatar = profile
    ? profile.avatar || profileAvatarUrl(null, profile.email ?? profile.name)
    : profileAvatarUrl(null, "vsm");

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Hero / Welcome */}
      <section className="animate-fade-up relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-surface to-background p-6 md:p-8">
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-vsm-red/20 blur-3xl" />
        <div className="absolute inset-x-0 top-0 mx-auto h-px w-2/3 bg-gradient-to-r from-transparent via-vsm-red/50 to-transparent" />

        <div className="relative grid grid-cols-[minmax(0,1fr)_auto] items-start gap-6 md:flex md:items-center md:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <div className="relative shrink-0">
              <img
                src={avatar}
                alt=""
                className="h-16 w-16 rounded-2xl border border-border bg-surface object-cover md:h-20 md:w-20"
              />
              <span className="absolute -bottom-1 -right-1 grid h-7 w-7 place-items-center rounded-full border-2 border-background bg-vsm-red text-[10px] font-bold text-white shadow-glow-red">
                <Crown className="h-3.5 w-3.5" />
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-vsm-red">
                {profile?.badge ?? "—"} · {profile?.level ?? "—"}
              </p>
              <h1 className="mt-1 truncate font-display text-2xl font-bold uppercase tracking-wide md:text-4xl">
                Bienvenue, {firstName}.
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {profile?.country ?? "VSM Collection"}
              </p>
            </div>
          </div>

          <div className="hidden shrink-0 text-right md:block">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Progression globale
            </p>
            <p className="font-display text-5xl font-bold text-gradient-red">{academyProgress}%</p>
          </div>
        </div>

        {/* XP bar */}
        <div className="relative mt-6">
          <div className="mb-2 flex items-center justify-between text-xs">
            <span className="font-semibold uppercase tracking-wider text-muted-foreground">
              {userXp.toLocaleString()} XP
            </span>
            <span className="text-muted-foreground">
              Prochain palier Academy : {xpNextLevel.toLocaleString()} XP
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-surface">
            <div
              className="h-full rounded-full bg-gradient-to-r from-vsm-red to-vsm-red-glow shadow-glow-red transition-all"
              style={{ width: `${xpPct}%` }}
            />
          </div>
        </div>
      </section>

      {/* Stat cards */}
      <section className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        {[
          { icon: Flame, label: "XP Academy", value: userXp.toLocaleString(), accent: true },
          { icon: TrendingUp, label: "Points", value: userPoints.toLocaleString() },
          { icon: BookOpen, label: "Formation", value: `${academyProgress}%` },
          { icon: Award, label: "Niveau", value: profile?.level ?? "—" },
          { icon: Sparkles, label: "Badge", value: profile?.badge ?? "—" },
          { icon: Crown, label: "Rôle", value: profile?.role === "ambassador" ? "Ambassadeur" : "—" },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className="group relative overflow-hidden rounded-xl border border-border bg-surface p-4 transition-all hover:border-vsm-red/40 hover:bg-surface-elevated"
              style={{ animation: `vsm-fade-up 0.6s ${i * 60}ms both` }}
            >
              <div className={`mb-3 grid h-9 w-9 place-items-center rounded-lg ${s.accent ? "bg-vsm-red/15 text-vsm-red" : "bg-accent text-muted-foreground"}`}>
                <Icon className="h-4 w-4" />
              </div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                {s.label}
              </p>
              <p className="mt-1 font-display text-2xl font-bold">{s.value}</p>
            </div>
          );
        })}
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left column — courses & activity */}
        <div className="space-y-6 lg:col-span-2">
          {/* Continue learning */}
          <Card
            title="Continuer la formation"
            action={<Link to="/academie" className="text-xs font-semibold uppercase tracking-wider text-vsm-red hover:underline">Voir tout</Link>}
          >
            <div className="rounded-xl border border-dashed border-border bg-background p-8 text-center text-sm text-muted-foreground">
              Aucun cours en cours. Explore l&apos;Académie pour commencer ta formation.
            </div>
          </Card>

          <Card title="Activité récente">
            {activityLogs.length === 0 ? (
              <p className="text-sm text-muted-foreground">Ton activité Academy apparaîtra ici.</p>
            ) : (
              <ul className="space-y-2">
                {activityLogs.map((log) => (
                  <li key={log.id} className="rounded-lg border border-border bg-background px-3 py-2 text-sm">
                    <span className="font-medium capitalize">{log.event_type.replace(/_/g, " ")}</span>
                    <span className="ml-2 text-xs text-muted-foreground">{formatRelativeTime(log.created_at)}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card
            title="Opportunités VSM"
            action={<Link to="/opportunites" className="text-xs font-semibold uppercase tracking-wider text-vsm-red hover:underline">Toutes</Link>}
          >
            <p className="text-sm text-muted-foreground">Les opportunités seront listées depuis la base Programme.</p>
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          <Card title="Objectifs de la semaine" icon={Target} action={<Link to="/defis" className="text-xs font-semibold uppercase tracking-wider text-vsm-red hover:underline">Voir tout</Link>}>
            {challenges.filter((c) => c.type === "weekly").length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucun défi hebdomadaire actif.</p>
            ) : (
              <ul className="space-y-2">
                {challenges.filter((c) => c.type === "weekly").slice(0, 2).map((c) => (
                  <li key={c.id} className="rounded-lg bg-background p-3">
                    <p className="text-sm font-semibold">{c.title}</p>
                    <div className="mt-2 h-1 overflow-hidden rounded-full bg-surface">
                      <div className="h-full bg-vsm-red" style={{ width: `${c.progress}%` }} />
                    </div>
                    <p className="mt-1 text-[10px] text-muted-foreground">+{c.reward_xp} XP · {c.deadline}</p>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card title="Défis actifs" icon={Trophy} action={<Link to="/defis" className="text-xs font-semibold uppercase tracking-wider text-vsm-red hover:underline">Tous</Link>}>
            {activeChallenges.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucun défi actif. Rejoins-en un sur la page Défis.</p>
            ) : (
              <ul className="space-y-2">
                {activeChallenges.map((c) => (
                  <li key={c.id} className="flex items-center justify-between rounded-lg bg-background p-3">
                    <div>
                      <p className="text-sm font-semibold">{c.title}</p>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{c.type}</p>
                    </div>
                    <span className="font-display text-sm font-bold text-vsm-red">{c.progress}%</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          {/* Leaderboard */}
          <Card title="Classement Top 10" icon={Crown} action={<Link to="/classement" className="text-xs font-semibold uppercase tracking-wider text-vsm-red hover:underline">Plein</Link>}>
            <ol className="space-y-2">
              {leaderboard.length === 0 ? (
                <li className="py-4 text-center text-xs text-muted-foreground">Chargement du classement…</li>
              ) : (
                leaderboard.map((a, i) => {
                  const rank = i + 1;
                  const top3 = rank <= 3;
                  return (
                    <li key={a.id} className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-accent/50">
                      <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-md text-xs font-bold ${
                        top3 ? "bg-vsm-red text-white" : "bg-surface text-muted-foreground"
                      }`}>
                        {rank}
                      </span>
                      <img src={a.avatar || profileAvatarUrl(null, a.name)} alt="" className="h-8 w-8 rounded-md bg-surface object-cover" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">{a.name}</p>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{a.level}</p>
                      </div>
                      <span className="shrink-0 text-xs font-bold text-vsm-red">{a.xp.toLocaleString()} XP</span>
                    </li>
                  );
                })
              )}
            </ol>
          </Card>

          {/* Notifications */}
          <Card title="Notifications" icon={Bell}>
            <ul className="space-y-2">
              {notifications.length === 0 ? (
                <li className="py-4 text-center text-xs text-muted-foreground">Aucune notification récente.</li>
              ) : (
                notifications.map((n) => (
                  <li key={n.id} className="flex gap-3 rounded-lg border border-border bg-background p-3">
                    {!n.read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-vsm-red" />}
                    <div className="min-w-0">
                      <p className="text-sm font-semibold">{n.title}</p>
                      <p className="line-clamp-1 text-xs text-muted-foreground">{n.body}</p>
                      <p className="mt-0.5 text-[10px] text-muted-foreground">{formatRelativeTime(n.created_at)}</p>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}

interface CardProps {
  title: string;
  icon?: React.ComponentType<{ className?: string }>;
  action?: React.ReactNode;
  children: React.ReactNode;
}

function Card({ title, icon: Icon, action, children }: CardProps) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 font-display text-base font-bold uppercase tracking-wider">
          {Icon && <Icon className="h-4 w-4 text-vsm-red" />}
          {title}
        </h2>
        {action}
      </div>
      {children}
    </div>
  );
}
