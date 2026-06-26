import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Award, BadgeCheck, CheckCircle2, Clock, GraduationCap, Lock, PlayCircle } from "lucide-react";
import { academyApi } from "@/lib/academy-data";
import { useAcademyStore } from "@/lib/academy-store";

export const Route = createFileRoute("/_app/academie/parcours/$id")({
  loader: async ({ params }) => {
    const p = await academyApi.getParcoursById(params.id);
    if (!p) throw notFound();
    return p;
  },
  component: ParcoursPage,
  notFoundComponent: () => (
    <div className="grid place-items-center p-12 text-center">
      <p className="text-muted-foreground">Parcours introuvable.</p>
      <Link to="/academie" className="mt-3 text-sm font-semibold text-vsm-red">Retour à l'Académie</Link>
    </div>
  ),
});

function ParcoursPage() {
  const p = Route.useLoaderData();
  const { state } = useAcademyStore();

  const done = p.courses.filter((c) => (state.progress[c.id] ?? 0) >= 100).length;
  const pct = Math.round((done / p.courses.length) * 100);

  return (
    <div className="space-y-8">
      <Link to="/academie" className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3.5 w-3.5" /> Académie
      </Link>

      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl border border-border">
        <div className="absolute inset-0">
          <img src={p.cover} alt="" className="h-full w-full object-cover opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/85 to-background/30" />
        </div>
        <div className="relative grid gap-6 p-6 md:grid-cols-[1.6fr_1fr] md:p-10">
          <div>
            <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-vsm-red/30 bg-vsm-red/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-vsm-red">
              Parcours {p.number.toString().padStart(2, "0")} · {p.difficulty}
            </p>
            <h1 className="font-display text-3xl font-bold uppercase tracking-wide md:text-5xl">{p.title}</h1>
            <p className="mt-2 text-base text-muted-foreground">{p.tagline}</p>
            <p className="mt-4 max-w-2xl text-sm text-muted-foreground">{p.description}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Pill icon={Clock} label={`${p.hours}h`} />
              <Pill icon={GraduationCap} label={`${p.courses.length} modules`} />
              <Pill icon={Award} label={`Badge ${p.badge}`} />
              <Pill icon={BadgeCheck} label="Certificat officiel" />
            </div>
            <Link
              to="/academie/cours/$id"
              params={{ id: p.courses[0].id }}
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-vsm-red px-5 py-2.5 text-sm font-semibold uppercase tracking-wider text-white shadow-glow-red transition hover:brightness-110"
            >
              <PlayCircle className="h-4 w-4" /> {pct > 0 ? "Continuer le parcours" : "Démarrer le parcours"}
            </Link>
          </div>

          <aside className="rounded-2xl border border-border bg-surface/80 p-5 backdrop-blur">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Progression</p>
            <p className="mt-1 font-display text-3xl font-bold">{pct}%</p>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-background">
              <div className="h-full rounded-full bg-gradient-to-r from-vsm-red to-vsm-red-glow shadow-glow-red" style={{ width: `${pct}%` }} />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">{done}/{p.courses.length} modules terminés</p>

            <div className="mt-5 rounded-xl border border-border bg-background/60 p-4">
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-vsm-red">
                <Award className="h-3.5 w-3.5" /> Récompense finale
              </p>
              <p className="mt-1 text-sm">{p.certificateTitle}</p>
              <p className="text-xs text-muted-foreground">+ Badge {p.badge} · +{p.courses.length * 150} XP</p>
            </div>
          </aside>
        </div>
      </section>

      {/* Modules */}
      <section>
        <h2 className="mb-4 font-display text-lg font-bold uppercase tracking-wide">Modules du parcours</h2>
        <ol className="space-y-3">
          {p.courses.map((c, i) => {
            const prog = state.progress[c.id] ?? 0;
            const completed = prog >= 100;
            const locked = i > 0 && (state.progress[p.courses[i - 1].id] ?? 0) < 100 && prog === 0;
            return (
              <li key={c.id}>
                <Link
                  to="/academie/cours/$id"
                  params={{ id: c.id }}
                  className={`group grid grid-cols-[auto_auto_1fr_auto] items-center gap-4 rounded-xl border border-border bg-surface p-4 transition-all hover:border-vsm-red/50 hover:bg-surface-elevated ${
                    locked ? "opacity-60" : ""
                  }`}
                >
                  <span className="grid h-10 w-10 place-items-center rounded-lg bg-background font-display text-sm font-bold text-muted-foreground">
                    {(i + 1).toString().padStart(2, "0")}
                  </span>
                  <img src={c.cover} alt="" className="hidden h-12 w-20 rounded-md object-cover sm:block" />
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{c.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {c.lessons.length} leçons · {c.duration} · Quiz · Mission
                    </p>
                    <div className="mt-2 h-1 w-full max-w-xs overflow-hidden rounded-full bg-background">
                      <div className="h-full rounded-full bg-gradient-to-r from-vsm-red to-vsm-red-glow" style={{ width: `${prog}%` }} />
                    </div>
                  </div>
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-background text-muted-foreground">
                    {completed ? (
                      <CheckCircle2 className="h-4 w-4 text-vsm-red" />
                    ) : locked ? (
                      <Lock className="h-4 w-4" />
                    ) : (
                      <PlayCircle className="h-4 w-4 text-foreground" />
                    )}
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>
      </section>
    </div>
  );
}

function Pill({ icon: Icon, label }: { icon: typeof Clock; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background/60 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
      <Icon className="h-3 w-3" /> {label}
    </span>
  );
}
