import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Heart, Loader2 } from "lucide-react";
import { useAcademyStore } from "@/lib/academy-store";
import { useCourseSummaries } from "@/hooks/use-academy";

export const Route = createFileRoute("/_app/academie/favoris")({
  component: FavorisPage,
});

function FavorisPage() {
  const { state } = useAcademyStore();
  const { data: allCourses = [], isLoading } = useCourseSummaries();

  const favs = state.favorites
    .map((id) => allCourses.find((c) => c.id === id))
    .filter((c): c is NonNullable<typeof c> => Boolean(c));

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
        <h1 className="font-display text-3xl font-bold uppercase tracking-wide">Mes favoris</h1>
        <p className="mt-1 text-sm text-muted-foreground">{favs.length} cours sauvegardés</p>
      </header>

      {favs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-surface p-10 text-center">
          <Heart className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">Aucun favori pour le moment. Ajoute un cours depuis sa page.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {favs.map((c) => (
            <Link
              key={c.id}
              to="/academie/cours/$id"
              params={{ id: c.id }}
              className="group overflow-hidden rounded-xl border border-border bg-surface transition hover:border-vsm-red/50"
            >
              <div className="relative aspect-[16/9] overflow-hidden">
                <img src={c.cover} alt="" className="h-full w-full object-cover transition-transform group-hover:scale-105" />
              </div>
              <div className="p-4">
                <p className="text-sm font-semibold">{c.title}</p>
                <p className="text-xs text-muted-foreground">
                  {c.duration} · {c.difficulty}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
