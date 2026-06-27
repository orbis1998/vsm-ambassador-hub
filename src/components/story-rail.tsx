import { useState } from "react";
import { Plus, X, ChevronLeft, ChevronRight } from "lucide-react";
import { stories } from "@/lib/social-data";
import { ambassadors, currentUser } from "@/lib/mock-data";

export function StoryRail() {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const active = activeIdx !== null ? stories[activeIdx] : null;
  const author = active
    ? active.author_id === currentUser.id
      ? currentUser
      : ambassadors.find((a) => a.id === active.author_id) ?? ambassadors[0]
    : null;

  return (
    <>
      <div className="-mx-2 flex gap-3 overflow-x-auto px-2 pb-2">
        {/* Add story */}
        <button className="group flex w-24 shrink-0 flex-col items-center gap-2">
          <div className="relative h-24 w-24 overflow-hidden rounded-2xl border border-dashed border-border bg-surface">
            <img src={currentUser.avatar} alt="" className="h-full w-full object-cover opacity-40" />
            <span className="absolute inset-0 grid place-items-center">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-vsm-red text-white shadow-glow-red">
                <Plus className="h-4 w-4" />
              </span>
            </span>
          </div>
          <span className="truncate text-[11px] text-muted-foreground">Votre story</span>
        </button>

        {stories.map((s, i) => {
          const a = s.author_id === currentUser.id ? currentUser : ambassadors.find((x) => x.id === s.author_id) ?? ambassadors[0];
          return (
            <button
              key={s.id}
              onClick={() => setActiveIdx(i)}
              className="group flex w-24 shrink-0 flex-col items-center gap-2"
            >
              <div className={`relative h-24 w-24 overflow-hidden rounded-2xl p-[2px] ${s.viewed ? "bg-border" : "bg-gradient-to-br from-vsm-red via-vsm-red-glow to-vsm-red"}`}>
                <div className="h-full w-full overflow-hidden rounded-2xl bg-background">
                  <img src={s.media_url} alt="" className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                </div>
                <img src={a.avatar} alt="" className="absolute bottom-1 right-1 h-6 w-6 rounded-lg border border-background bg-background" />
              </div>
              <span className="w-full truncate text-center text-[11px] text-muted-foreground">{a.name.split(" ")[0]}</span>
            </button>
          );
        })}
      </div>

      {/* Story viewer */}
      {active && author && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/90 p-4 backdrop-blur-xl">
          <button
            onClick={() => setActiveIdx(null)}
            className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white"
            aria-label="Fermer"
          >
            <X className="h-5 w-5" />
          </button>
          <button
            onClick={() => setActiveIdx((i) => (i !== null && i > 0 ? i - 1 : i))}
            className="absolute left-4 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={() => setActiveIdx((i) => (i !== null && i < stories.length - 1 ? i + 1 : i))}
            className="absolute right-4 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          <div className="relative aspect-[9/16] h-[80vh] max-h-[700px] overflow-hidden rounded-2xl border border-white/10">
            <img src={active.media_url} alt="" className="h-full w-full object-cover" />
            <div className="absolute inset-x-3 top-3 space-y-2">
              <div className="h-0.5 w-full overflow-hidden rounded-full bg-white/30">
                <div className="h-full w-2/3 rounded-full bg-vsm-red animate-pulse" />
              </div>
              <div className="flex items-center gap-2 text-white">
                <img src={author.avatar} alt="" className="h-9 w-9 rounded-lg" />
                <div>
                  <p className="text-sm font-semibold">{author.name}</p>
                  <p className="text-[10px] uppercase tracking-wider opacity-80">il y a {Math.floor((Date.now() - new Date(active.created_at).getTime()) / 3600_000)}h</p>
                </div>
              </div>
            </div>
            {active.caption && (
              <p className="absolute inset-x-3 bottom-3 rounded-lg bg-black/60 px-3 py-2 text-center text-sm text-white backdrop-blur">
                {active.caption}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
