import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, History } from "lucide-react";
import { allCourses } from "@/lib/academy-data";
import { useAcademyStore } from "@/lib/academy-store";

export const Route = createFileRoute("/_app/academie/historique")({
  component: HistoriquePage,
});

function HistoriquePage() {
  const { state } = useAcademyStore();
  const items = state.history
    .map((h) => ({ ...h, course: allCourses.find((c) => c.id === h.courseId) }))
    .filter((x): x is { courseId: string; at: number; course: NonNullable<typeof x.course> } => Boolean(x.course));

  return (
    <div className="space-y-6">
      <Link to="/academie" className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3.5 w-3.5" /> Académie
      </Link>
      <header>
        <h1 className="font-display text-3xl font-bold uppercase tracking-wide">Historique</h1>
        <p className="mt-1 text-sm text-muted-foreground">{items.length} cours récemment consultés</p>
      </header>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-surface p-10 text-center">
          <History className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">Aucune activité récente.</p>
        </div>
      ) : (
        <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface">
          {items.map((i) => (
            <li key={i.courseId}>
              <Link to="/academie/cours/$id" params={{ id: i.courseId }} className="flex items-center gap-4 px-4 py-3 hover:bg-surface-elevated">
                <img src={i.course.cover} alt="" className="h-12 w-20 rounded-md object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{i.course.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(i.at).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" })}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground">{state.progress[i.courseId] ?? 0}%</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
