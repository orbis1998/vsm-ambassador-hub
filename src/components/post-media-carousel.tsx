import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { PostMedia } from "@/types/social";

type Props = {
  media: PostMedia[];
  onView?: () => void;
};

export function PostMediaCarousel({ media, onView }: Props) {
  const [idx, setIdx] = useState(0);
  const touchStart = useRef<number | null>(null);
  const images = media.filter((m) => m.type === "image" || m.type === "gif");
  const videos = media.filter((m) => m.type === "video");
  const docs = media.filter((m) => m.type === "doc" || m.type === "link");
  const slides = [...images, ...videos, ...docs];

  if (slides.length === 0) return null;

  const current = slides[idx] ?? slides[0];
  const hasMany = slides.length > 1;

  const go = (next: number) => {
    setIdx((i) => {
      const n = i + next;
      if (n < 0) return slides.length - 1;
      if (n >= slides.length) return 0;
      return n;
    });
  };

  return (
    <div
      className="relative overflow-hidden bg-black"
      onTouchStart={(e) => { touchStart.current = e.touches[0]?.clientX ?? null; }}
      onTouchEnd={(e) => {
        if (touchStart.current == null || !hasMany) return;
        const dx = (e.changedTouches[0]?.clientX ?? 0) - touchStart.current;
        if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
        touchStart.current = null;
      }}
    >
      <div className="relative aspect-square w-full sm:aspect-[4/5]">
        {current.type === "video" ? (
          <video src={current.url} controls className="h-full w-full object-contain" onPlay={onView} />
        ) : current.type === "doc" || current.type === "link" ? (
          <a
            href={current.url}
            target="_blank"
            rel="noreferrer"
            className="flex h-full flex-col items-center justify-center gap-2 p-6 text-center text-sm text-white/80 hover:text-vsm-red"
          >
            <span className="text-3xl">📄</span>
            {current.title ?? "Document"}
          </a>
        ) : (
          <img src={current.url} alt="" className="h-full w-full object-contain" />
        )}
      </div>

      {hasMany && (
        <>
          <button
            type="button"
            onClick={() => go(-1)}
            className="absolute left-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full bg-black/50 text-white backdrop-blur"
            aria-label="Précédent"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full bg-black/50 text-white backdrop-blur"
            aria-label="Suivant"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <div className="absolute inset-x-0 bottom-3 flex justify-center gap-1.5">
            {slides.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all ${i === idx ? "w-4 bg-white" : "w-1.5 bg-white/50"}`}
              />
            ))}
          </div>
          <span className="absolute right-3 top-3 rounded-full bg-black/60 px-2 py-0.5 text-[11px] font-semibold text-white">
            {idx + 1}/{slides.length}
          </span>
        </>
      )}
    </div>
  );
}
