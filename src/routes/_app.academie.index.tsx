import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Search,
  Filter,
  Sparkles,
  PlayCircle,
  Clock,
  GraduationCap,
  Heart,
  History,
  ChevronRight,
  Flame,
  Star,
  Trophy,
  Loader2,
} from "lucide-react";
import type { Difficulty } from "@/types/academy";
import { useAcademyStore } from "@/lib/academy-store";
import { useAuth } from "@/providers/auth-provider";
import { useCourseSummaries, useParcoursList } from "@/hooks/use-academy";

export const Route = createFileRoute("/_app/academie/")({
  component: AcademieHub,
});

const DIFFS: ("Tous" | Difficulty)[] = ["Tous", "Débutant", "Intermédiaire", "Avancé", "Expert"];

function AcademieHub() {
  const { profile } = useAuth();
  const { state, loading: progressLoading } = useAcademyStore();
  const { data: parcours = [], isLoading: parcoursLoading } = useParcoursList();
  const { data: allCourses = [], isLoading: coursesLoading } = useCourseSummaries();
  const [q, setQ] = useState("");
  const [diff, setDiff] = useState<(typeof DIFFS)[number]>("Tous");

  const loading = parcoursLoading || coursesLoading || progressLoading;

  const filtered = useMemo(() => {
    const ql = q.trim().toLowerCase();
    return parcours.filter((p) => {
      if (diff !== "Tous" && p.difficulty !== diff) return false;
      if (!ql) return true;
      return (
        p.title.toLowerCase().includes(ql) ||
        p.tagline.toLowerCase().includes(ql) ||
        p.courses.some((c) => c.title.toLowerCase().includes(ql))
      );
    });
  }, [parcours, q, diff]);

  const completedCourses = Object.values(state.progress).filter((p) => p >= 100).length;
  const totalCourses = allCourses.length || 1;
  const overall = Math.round((completedCourses / totalCourses) * 100);

  const continueCourses = allCourses
    .map((c) => ({ c, p: state.progress[c.id] ?? 0 }))
    .filter((x) => x.p > 0 && x.p < 100)
    .slice(0, 3);

  const recommended = allCourses
    .filter((c) => !(state.progress[c.id] >= 100))
    .slice(0, 6);

  const recentHistory = state.history
    .slice(0, 4)
    .map((h) => allCourses.find((c) => c.id === h.courseId))
    .filter((c): c is NonNullable<typeof c> => Boolean(c));

  const favoritesCount = state.favorites.length;

  if (loading && parcours.length === 0) {
    return (
      <div className="grid min-h-[40vh] place-items-center">
        <Loader2 className="h-8 w-8 animate-spin text-vsm-red" />
      </div>
    );
  }

  return (
    <div className="mx-auto min-w-0 max-w-7xl space-y-6 overflow-x-hidden sm:space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-1 inline-flex items-center gap-2 rounded-full border border-vsm-red/30 bg-vsm-red/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-vsm-red">
            <Sparkles className="h-3 w-3" /> VSM Academy
          </p>
          <h1 className="font-display text-3xl font-bold uppercase tracking-wide md:text-4xl">Académie</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {parcours.length > 0
              ? `${parcours.length} parcours · ${allCourses.length} cours · certifications officielles.`
              : "Exécutez la migration 002 sur Supabase pour charger les formations."}
          </p>
        </div>
        <div className="flex w-full min-w-0 flex-col gap-2 sm:flex-row">
          <Link
            to="/academie/favoris"
            className="inline-flex min-w-0 flex-1 items-center justify-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium hover:bg-surface-elevated sm:flex-none"
          >
            <Heart className="h-4 w-4" /> Favoris
            <span className="rounded-md bg-vsm-red/15 px-1.5 text-xs text-vsm-red">{favoritesCount}</span>
          </Link>
          <Link
            to="/academie/historique"
            className="inline-flex min-w-0 flex-1 items-center justify-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium hover:bg-surface-elevated sm:flex-none"
          >
            <History className="h-4 w-4" /> Historique
          </Link>
        </div>
      </header>

      <section className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-surface to-surface-elevated p-4 sm:p-6">
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-vsm-red/15 blur-3xl sm:-right-20 sm:-top-20 sm:h-64 sm:w-64" />
        <div className="relative grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Progression générale</p>
            <div className="mt-2 flex items-end gap-3">
              <span className="font-display text-4xl font-bold">{overall}%</span>
              <span className="mb-1 text-xs text-muted-foreground">
                {completedCourses}/{totalCourses} cours
              </span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-background">
              <div
                className="h-full rounded-full bg-gradient-to-r from-vsm-red to-vsm-red-glow shadow-glow-red transition-all"
                style={{ width: `${overall}%` }}
              />
            </div>
          </div>
          <StatBlock icon={Trophy} label="Niveau" value={profile?.level ?? "—"} />
          <StatBlock icon={Flame} label="XP" value={`${(profile?.xp ?? 0).toLocaleString()} XP`} />
          <StatBlock icon={GraduationCap} label="Progression" value={`${profile?.academyProgress ?? 0}%`} />
        </div>
      </section>

      <section className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Chercher un parcours, un cours, un module…"
            className="w-full rounded-xl border border-border bg-surface py-2.5 pl-9 pr-3 text-base placeholder:text-muted-foreground focus:border-vsm-red focus:outline-none focus:ring-1 focus:ring-vsm-red md:text-sm"
          />
        </div>
        <div className="flex min-w-0 items-center gap-2 overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <Filter className="h-4 w-4 shrink-0 text-muted-foreground" />
          {DIFFS.map((d) => (
            <button
              key={d}
              onClick={() => setDiff(d)}
              className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                diff === d
                  ? "border-vsm-red bg-vsm-red/15 text-vsm-red"
                  : "border-border bg-surface text-muted-foreground hover:text-foreground"
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </section>

      {continueCourses.length > 0 && (
        <section>
          <SectionHeader icon={PlayCircle} title="Continuer mon apprentissage" subtitle="Reprends où tu t'es arrêté" />
          <div className="grid gap-4 md:grid-cols-3">
            {continueCourses.map(({ c, p }) => (
              <CourseCard key={c.id} id={c.id} title={c.title} cover={c.cover} duration={c.duration} progress={p} />
            ))}
          </div>
        </section>
      )}

      <section>
        <SectionHeader icon={GraduationCap} title="Parcours de formation" subtitle={`${filtered.length} parcours disponibles`} />
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
            Aucun parcours publié pour le moment.
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((p) => {
              const courseIds = p.courses.map((c) => c.id);
              const done = courseIds.filter((id) => (state.progress[id] ?? 0) >= 100).length;
              const pct = courseIds.length ? Math.round((done / courseIds.length) * 100) : 0;
              return (
                <Link
                  key={p.id}
                  to="/academie/parcours/$id"
                  params={{ id: p.id }}
                  className="group relative flex min-w-0 flex-col overflow-hidden rounded-2xl border border-border bg-surface transition-all md:hover:-translate-y-0.5 md:hover:border-vsm-red/50 md:hover:shadow-glow-red"
                >
                  <div className="relative aspect-[16/9] overflow-hidden">
                    <img
                      src={p.cover}
                      alt={p.title}
                      className="h-full w-full object-cover transition-transform duration-500 md:group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
                    <span className="absolute left-3 top-3 rounded-md bg-background/80 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider backdrop-blur">
                      Parcours {p.number.toString().padStart(2, "0")}
                    </span>
                    <span className="absolute right-3 top-3 rounded-md bg-vsm-red/90 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-white">
                      {p.difficulty}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col gap-3 p-5">
                    <div>
                      <h3 className="font-display text-xl font-bold uppercase tracking-wide">{p.title}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{p.tagline}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {p.hours}h
                      </span>
                      <span>·</span>
                      <span>{p.courses.length} modules</span>
                    </div>
                    <div className="mt-auto">
                      <div className="mb-1 flex items-center justify-between text-[10px] uppercase tracking-wider text-muted-foreground">
                        <span>Progression</span>
                        <span className="font-semibold text-foreground">{pct}%</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-background">
                        <div className="h-full rounded-full bg-gradient-to-r from-vsm-red to-vsm-red-glow" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {recommended.length > 0 && (
        <section>
          <SectionHeader icon={Sparkles} title="Recommandé pour toi" subtitle="Sélection alignée avec ton niveau" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recommended.map((c) => (
              <CourseCard
                key={c.id}
                id={c.id}
                title={c.title}
                cover={c.cover}
                duration={c.duration}
                progress={state.progress[c.id] ?? 0}
              />
            ))}
          </div>
        </section>
      )}

      {recentHistory.length > 0 && (
        <section>
          <SectionHeader icon={History} title="Derniers cours consultés" subtitle="Ta dernière activité" />
          <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface">
            {recentHistory.map((c) => (
              <li key={c.id}>
                <Link
                  to="/academie/cours/$id"
                  params={{ id: c.id }}
                  className="flex items-center gap-4 px-4 py-3 transition hover:bg-surface-elevated"
                >
                  <img src={c.cover} alt="" className="h-12 w-20 rounded-md object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{c.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {c.duration} · {c.difficulty}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function SectionHeader({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: typeof Sparkles;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="mb-4 flex items-end justify-between gap-2">
      <div className="flex items-center gap-3">
        <span className="grid h-9 w-9 place-items-center rounded-lg bg-vsm-red/15 text-vsm-red">
          <Icon className="h-4 w-4" />
        </span>
        <div>
          <h2 className="font-display text-lg font-bold uppercase tracking-wide">{title}</h2>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
      </div>
    </div>
  );
}

function StatBlock({ icon: Icon, label, value }: { icon: typeof Sparkles; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-background/40 p-4">
      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
        <Icon className="h-3.5 w-3.5 text-vsm-red" />
        {label}
      </div>
      <p className="mt-1 font-display text-xl font-bold">{value}</p>
    </div>
  );
}

function CourseCard({
  id,
  title,
  cover,
  duration,
  progress,
}: {
  id: string;
  title: string;
  cover: string;
  duration: string;
  progress: number;
}) {
  return (
    <Link
      to="/academie/cours/$id"
      params={{ id }}
      className="group flex min-w-0 flex-col overflow-hidden rounded-xl border border-border bg-surface transition-all md:hover:-translate-y-0.5 md:hover:border-vsm-red/40"
    >
      <div className="relative aspect-[16/9] overflow-hidden">
        <img src={cover} alt="" className="h-full w-full object-cover md:transition-transform md:duration-500 md:group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/20 to-transparent" />
        <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-md bg-background/80 px-2 py-1 text-[10px] font-semibold backdrop-blur">
          <Clock className="h-3 w-3" /> {duration}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug">{title}</h3>
        <div className="mt-auto">
          <div className="mb-1 flex items-center justify-between text-[10px] uppercase tracking-wider text-muted-foreground">
            <span>{progress > 0 ? "En cours" : "Nouveau"}</span>
            <span className="font-semibold text-foreground">{progress}%</span>
          </div>
          <div className="h-1 overflow-hidden rounded-full bg-background">
            <div className="h-full rounded-full bg-gradient-to-r from-vsm-red to-vsm-red-glow" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>
    </Link>
  );
}
