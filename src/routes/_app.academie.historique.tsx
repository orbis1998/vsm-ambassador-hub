import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, History, Loader2 } from "lucide-react";
import { useAcademyStore } from "@/lib/academy-store";
import { useCourseSummaries } from "@/hooks/use-academy";

export const Route = createFileRoute("/_app/academie/historique")({
  component: HistoriquePage,
});

function HistoriquePage() {
  const { state } = useAcademyStore();
  const { data: allCourses = [], isLoading } = useCourseSummaries();

  const items = state.history
    .map((h) => {
      const course = allCourses.find((c) => c.id === h.courseId);
      return course ? { course, at: h.at } : null;
    })
    .filter((x): x is NonNullable<typeof x> => Boolean(x));

  if (isLoading) {
    return (
      <div className="grid min-h-[40vh] place-items-center">
        <Loader2 className="h-8 w-8 animate-spin text-vsm-red" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link to="/academie" className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3.5 w-3.5" /> Académie
      </Link>
      <header>
        <h1 className="font-display text-3xl font-bold uppercase tracking-wide">Historique</h1>
        <p className="mt-1 text-sm text-muted-foreground">{items.length} cours consultés récemment</p>
      </header>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-surface p-10 text-center">
          <History className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">Aucun historique pour le moment.</p>
        </div>
      ) : (
        <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface">
          {items.map(({ course, at }) => (
            <li key={`${course.id}-${at}`}>
              <Link
                to="/academie/cours/$id"
                params={{ id: course.id }}
                className="flex items-center gap-4 px-4 py-3 transition hover:bg-surface-elevated"
              >
                <img src={course.cover} alt="" className="h-12 w-20 rounded-md object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{course.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(at).toLocaleDateString("fr-FR")} · {course.duration}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
