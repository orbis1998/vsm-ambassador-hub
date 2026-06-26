import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { BookOpen, Download, FileText, Search, Star } from "lucide-react";
import { resources, type ResourceCategory } from "@/lib/academy-data";

export const Route = createFileRoute("/_app/ressources")({
  component: ResourcesPage,
});

const ALL = "Tous" as const;

function ResourcesPage() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<typeof ALL | ResourceCategory>(ALL);

  const cats = useMemo(() => {
    const set = new Set<ResourceCategory>();
    resources.forEach((r) => set.add(r.category));
    return [ALL, ...Array.from(set)] as const;
  }, []);

  const filtered = useMemo(() => {
    const ql = q.trim().toLowerCase();
    return resources.filter((r) => {
      if (cat !== ALL && r.category !== cat) return false;
      if (!ql) return true;
      return r.title.toLowerCase().includes(ql) || r.category.toLowerCase().includes(ql);
    });
  }, [q, cat]);

  return (
    <div className="space-y-8">
      <header>
        <p className="mb-1 inline-flex items-center gap-2 rounded-full border border-vsm-red/30 bg-vsm-red/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-vsm-red">
          <BookOpen className="h-3 w-3" /> Bibliothèque VSM
        </p>
        <h1 className="font-display text-3xl font-bold uppercase tracking-wide md:text-4xl">Ressources</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {resources.length} ressources officielles · scripts, templates, guides, brand kit
        </p>
      </header>

      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Chercher une ressource…"
            className="w-full rounded-xl border border-border bg-surface py-2.5 pl-9 pr-3 text-sm focus:border-vsm-red focus:outline-none focus:ring-1 focus:ring-vsm-red"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {cats.map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
              cat === c
                ? "border-vsm-red bg-vsm-red/15 text-vsm-red"
                : "border-border bg-surface text-muted-foreground hover:text-foreground"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((r) => (
          <div key={r.id} className="group flex flex-col overflow-hidden rounded-xl border border-border bg-surface transition hover:border-vsm-red/50">
            <div className="relative aspect-[4/3] overflow-hidden">
              <img src={r.cover} alt="" className="h-full w-full object-cover transition-transform group-hover:scale-105" />
              <span className="absolute right-2 top-2 rounded-md bg-background/85 px-2 py-1 text-[10px] font-bold backdrop-blur">
                {r.format}
              </span>
              <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-md bg-vsm-red/85 px-2 py-1 text-[10px] font-semibold text-white">
                <FileText className="h-3 w-3" /> {r.category}
              </span>
            </div>
            <div className="flex flex-1 flex-col gap-2 p-4">
              <p className="line-clamp-2 text-sm font-semibold leading-snug">{r.title}</p>
              <div className="mt-auto flex items-center justify-between text-[11px] text-muted-foreground">
                <span>{r.size}</span>
                <span className="inline-flex items-center gap-1">
                  <Download className="h-3 w-3" />{r.downloads}
                </span>
                <span className="inline-flex items-center gap-0.5">
                  <Star className="h-3 w-3 fill-vsm-red text-vsm-red" />4.{(r.id.length % 9) + 1}
                </span>
              </div>
              <button className="mt-2 inline-flex items-center justify-center gap-1.5 rounded-lg bg-vsm-red px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-white shadow-glow-red transition hover:brightness-110">
                <Download className="h-3 w-3" /> Télécharger
              </button>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border bg-surface p-10 text-center text-sm text-muted-foreground">
          Aucune ressource ne correspond à ta recherche.
        </div>
      )}
    </div>
  );
}
