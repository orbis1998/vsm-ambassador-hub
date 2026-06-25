import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Flame, Trophy, Award, Sparkles, BookOpen, Target, TrendingUp,
  Crown, ChevronRight, Play, CheckCircle2, Clock, Bell,
} from "lucide-react";
import {
  currentUser, stats, courses, activity, weeklyGoals,
  leaderboard, notifications, opportunities, challenges,
} from "@/lib/mock-data";

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
  const activeCourses = courses.filter((c) => c.status === "in-progress");
  const xpPct = Math.round((stats.xp / stats.xpNextLevel) * 100);

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
                src={currentUser.avatar}
                alt=""
                className="h-16 w-16 rounded-2xl border border-border bg-surface md:h-20 md:w-20"
              />
              <span className="absolute -bottom-1 -right-1 grid h-7 w-7 place-items-center rounded-full border-2 border-background bg-vsm-red text-[10px] font-bold text-white shadow-glow-red">
                <Crown className="h-3.5 w-3.5" />
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-vsm-red">
                {currentUser.badge} · {currentUser.level}
              </p>
              <h1 className="mt-1 truncate font-display text-2xl font-bold uppercase tracking-wide md:text-4xl">
                Bienvenue, {currentUser.name.split(" ")[0]}.
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Dernière connexion : {currentUser.lastLogin} · {currentUser.country}
              </p>
            </div>
          </div>

          <div className="hidden shrink-0 text-right md:block">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Progression globale
            </p>
            <p className="font-display text-5xl font-bold text-gradient-red">{stats.progress}%</p>
          </div>
        </div>

        {/* XP bar */}
        <div className="relative mt-6">
          <div className="mb-2 flex items-center justify-between text-xs">
            <span className="font-semibold uppercase tracking-wider text-muted-foreground">
              {stats.xp.toLocaleString()} XP
            </span>
            <span className="text-muted-foreground">
              Prochain niveau : {stats.xpNextLevel.toLocaleString()} XP
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
          { icon: Flame, label: "XP", value: stats.xp.toLocaleString(), accent: true },
          { icon: TrendingUp, label: "Points", value: stats.points.toLocaleString() },
          { icon: BookOpen, label: "Cours actifs", value: stats.activeCourses },
          { icon: CheckCircle2, label: "Terminés", value: stats.completedCourses },
          { icon: Award, label: "Certificats", value: stats.certificates },
          { icon: Sparkles, label: "Opportunités", value: stats.opportunities },
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
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {activeCourses.map((c) => (
                <div
                  key={c.id}
                  className="group relative overflow-hidden rounded-xl border border-border bg-background transition-all hover:border-vsm-red/40"
                >
                  <div className="relative aspect-video overflow-hidden">
                    <img src={c.cover} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
                    <span className="absolute left-3 top-3 rounded-full bg-background/80 px-2 py-1 text-[10px] font-bold uppercase tracking-wider backdrop-blur">
                      {c.category}
                    </span>
                    <button className="absolute bottom-3 right-3 grid h-10 w-10 place-items-center rounded-full bg-vsm-red text-white shadow-glow-red transition-transform group-hover:scale-110">
                      <Play className="h-4 w-4 translate-x-0.5 fill-current" />
                    </button>
                  </div>
                  <div className="p-4">
                    <h3 className="line-clamp-1 font-semibold">{c.title}</h3>
                    <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{c.duration}</span>
                      <span>·</span>
                      <span>{c.lessons} leçons</span>
                    </div>
                    <div className="mt-3">
                      <div className="mb-1 flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider">
                        <span className="text-muted-foreground">Progression</span>
                        <span className="text-vsm-red">{c.progress}%</span>
                      </div>
                      <div className="h-1 overflow-hidden rounded-full bg-surface">
                        <div className="h-full rounded-full bg-vsm-red" style={{ width: `${c.progress}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Activity */}
          <Card title="Activité récente">
            <ol className="relative ml-3 space-y-4 border-l border-border pl-6">
              {activity.map((a) => (
                <li key={a.id} className="relative">
                  <span className="absolute -left-[34px] grid h-7 w-7 place-items-center rounded-full border border-border bg-background text-base">
                    {a.emoji}
                  </span>
                  <p className="text-sm text-foreground">{a.text}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{a.time}</p>
                </li>
              ))}
            </ol>
          </Card>

          {/* Opportunities */}
          <Card
            title="Opportunités VSM"
            action={<Link to="/opportunites" className="text-xs font-semibold uppercase tracking-wider text-vsm-red hover:underline">Toutes</Link>}
          >
            <div className="space-y-2">
              {opportunities.slice(0, 3).map((o) => (
                <div key={o.id} className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background p-3 transition-all hover:border-vsm-red/40">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-vsm-red/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-vsm-red">{o.tag}</span>
                      <span className="text-xs text-muted-foreground">{o.location}</span>
                    </div>
                    <p className="mt-1 truncate text-sm font-semibold">{o.title}</p>
                    <p className="text-xs text-muted-foreground">Récompense : {o.reward} · Clôture dans {o.deadline}</p>
                  </div>
                  <button className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-vsm-red hover:text-white">
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Weekly goals */}
          <Card title="Objectifs de la semaine" icon={Target}>
            <ul className="space-y-3">
              {weeklyGoals.map((g) => {
                const pct = Math.round((g.done / g.total) * 100);
                const done = g.done >= g.total;
                return (
                  <li key={g.id}>
                    <div className="mb-1.5 flex items-center justify-between text-sm">
                      <span className={`flex items-center gap-2 ${done ? "text-muted-foreground line-through" : ""}`}>
                        {done ? <CheckCircle2 className="h-4 w-4 text-vsm-red" /> : <span className="h-4 w-4 rounded-full border border-border" />}
                        {g.title}
                      </span>
                      <span className="text-xs font-semibold text-muted-foreground">{g.done}/{g.total}</span>
                    </div>
                    <div className="h-1 overflow-hidden rounded-full bg-surface">
                      <div className="h-full bg-vsm-red" style={{ width: `${pct}%` }} />
                    </div>
                  </li>
                );
              })}
            </ul>
          </Card>

          {/* Active challenges */}
          <Card title="Défis actifs" icon={Trophy}>
            <div className="space-y-2">
              {challenges.filter(c => c.status === "active").slice(0, 3).map((c) => (
                <div key={c.id} className="rounded-lg border border-border bg-background p-3">
                  <p className="text-sm font-semibold">{c.title}</p>
                  <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{c.deadline}</span>
                    <span className="rounded-full bg-vsm-red/15 px-2 py-0.5 font-bold text-vsm-red">+{c.reward} XP</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Leaderboard */}
          <Card title="Classement Top 10" icon={Crown} action={<Link to="/classement" className="text-xs font-semibold uppercase tracking-wider text-vsm-red hover:underline">Plein</Link>}>
            <ol className="space-y-2">
              {leaderboard.map((a) => {
                const top3 = a.rank <= 3;
                return (
                  <li key={a.id} className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-accent/50">
                    <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-md text-xs font-bold ${
                      top3 ? "bg-vsm-red text-white" : "bg-surface text-muted-foreground"
                    }`}>
                      {a.rank}
                    </span>
                    <img src={a.avatar} alt="" className="h-8 w-8 rounded-md bg-surface" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{a.name}</p>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{a.level}</p>
                    </div>
                    <span className="shrink-0 text-xs font-bold text-vsm-red">{a.xp.toLocaleString()} XP</span>
                  </li>
                );
              })}
            </ol>
          </Card>

          {/* Notifications */}
          <Card title="Notifications" icon={Bell}>
            <ul className="space-y-2">
              {notifications.slice(0, 4).map((n) => (
                <li key={n.id} className="flex gap-3 rounded-lg border border-border bg-background p-3">
                  {n.unread && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-vsm-red" />}
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">{n.title}</p>
                    <p className="line-clamp-1 text-xs text-muted-foreground">{n.body}</p>
                  </div>
                </li>
              ))}
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
