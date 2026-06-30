import { Star } from "lucide-react";

type Props = {
  avgRating: number;
  reviewCount: number;
  myRating: number | null;
  disabled?: boolean;
  onRate: (stars: number) => void;
};

export function CourseRating({ avgRating, reviewCount, myRating, disabled, onRate }: Props) {
  const safeAvg = Number.isFinite(avgRating) ? avgRating : 0;
  const display = reviewCount > 0 ? safeAvg.toFixed(1) : "—";

  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Note de ce cours</p>
          <p className="mt-1 font-display text-2xl font-bold">
            ★ {display}
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              ({reviewCount} avis{reviewCount !== 1 ? "" : ""})
            </span>
          </p>
        </div>
        <div className="text-right">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Noter le cours</p>
          <div className="mt-1 flex gap-0.5">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                disabled={disabled}
                onClick={() => onRate(n)}
                className="rounded p-0.5 transition hover:scale-110 disabled:opacity-40"
                aria-label={`Noter ${n} étoile${n > 1 ? "s" : ""}`}
              >
                <Star
                  className={`h-6 w-6 ${(myRating ?? 0) >= n ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40"}`}
                />
              </button>
            ))}
          </div>
          {myRating ? (
            <p className="mt-1 text-[10px] text-muted-foreground">Toucher pour modifier votre note</p>
          ) : (
            <p className="mt-1 text-[10px] text-muted-foreground">Choisissez une note de 1 à 5</p>
          )}
        </div>
      </div>
    </div>
  );
}
