import { useEffect, useRef, useState } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  Subtitles,
  Gauge,
  SkipForward,
  ListVideo,
} from "lucide-react";

interface Chapter {
  title: string;
  start: number; // seconds
}

interface Props {
  poster: string;
  durationSec?: number;
  chapters?: Chapter[];
  onComplete?: () => void;
  nextLabel?: string;
  onNext?: () => void;
}

export function VideoPlayer({ poster, durationSec = 360, chapters, onComplete, nextLabel, onNext }: Props) {
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [muted, setMuted] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [subtitles, setSubtitles] = useState(true);
  const [showChapters, setShowChapters] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const fallbackChapters: Chapter[] = chapters ?? [
    { title: "Introduction", start: 0 },
    { title: "Méthode VSM", start: Math.round(durationSec * 0.25) },
    { title: "Étude de cas", start: Math.round(durationSec * 0.5) },
    { title: "Mise en pratique", start: Math.round(durationSec * 0.75) },
  ];

  useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(() => {
      setTime((t) => {
        const next = t + speed;
        if (next >= durationSec) {
          window.clearInterval(id);
          setPlaying(false);
          onComplete?.();
          return durationSec;
        }
        return next;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [playing, speed, durationSec, onComplete]);

  const fmt = (s: number) => {
    const m = Math.floor(s / 60);
    const r = Math.floor(s % 60);
    return `${m}:${r.toString().padStart(2, "0")}`;
  };
  const pct = (time / durationSec) * 100;

  return (
    <div ref={containerRef} className="relative overflow-hidden rounded-2xl border border-border bg-black">
      <div className="relative aspect-video">
        <img src={poster} alt="" className="h-full w-full object-cover opacity-80" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

        {/* Center play */}
        {!playing && (
          <button
            onClick={() => setPlaying(true)}
            className="absolute inset-0 grid place-items-center"
            aria-label="Lire la vidéo"
          >
            <span className="grid h-20 w-20 place-items-center rounded-full bg-vsm-red/90 text-white shadow-glow-red transition group-hover:scale-105">
              <Play className="ml-1 h-8 w-8 fill-white" />
            </span>
          </button>
        )}

        {subtitles && playing && (
          <div className="absolute bottom-20 left-1/2 max-w-md -translate-x-1/2 rounded-md bg-black/70 px-3 py-1.5 text-center text-sm text-white">
            « Comprends d'abord ton audience, ensuite seulement ta caméra. » — VSM Academy
          </div>
        )}

        {/* Bottom bar */}
        <div className="absolute inset-x-0 bottom-0 space-y-2 bg-gradient-to-t from-black/95 to-transparent p-4">
          <input
            type="range"
            min={0}
            max={durationSec}
            value={time}
            onChange={(e) => setTime(Number(e.target.value))}
            className="h-1 w-full cursor-pointer appearance-none rounded-full bg-white/20 accent-vsm-red"
            style={{ background: `linear-gradient(to right, var(--vsm-red) ${pct}%, rgba(255,255,255,0.2) ${pct}%)` }}
          />
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-3">
              <button onClick={() => setPlaying((p) => !p)} className="rounded-md p-1.5 hover:bg-white/10">
                {playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              </button>
              <button onClick={() => setMuted((m) => !m)} className="rounded-md p-1.5 hover:bg-white/10">
                {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
              </button>
              <span className="font-mono text-xs">{fmt(time)} / {fmt(durationSec)}</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowChapters((s) => !s)}
                className="rounded-md p-1.5 hover:bg-white/10"
                aria-label="Chapitres"
              >
                <ListVideo className="h-5 w-5" />
              </button>
              <button
                onClick={() => setSubtitles((s) => !s)}
                className={`rounded-md p-1.5 hover:bg-white/10 ${subtitles ? "text-vsm-red" : ""}`}
              >
                <Subtitles className="h-5 w-5" />
              </button>
              <button
                onClick={() => setSpeed((s) => (s >= 2 ? 0.5 : s + 0.25))}
                className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs hover:bg-white/10"
              >
                <Gauge className="h-4 w-4" /> {speed}x
              </button>
              {onNext && (
                <button onClick={onNext} className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs hover:bg-white/10">
                  <SkipForward className="h-4 w-4" /> Suivant
                </button>
              )}
              <button
                onClick={() => containerRef.current?.requestFullscreen?.()}
                className="rounded-md p-1.5 hover:bg-white/10"
              >
                <Maximize2 className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {showChapters && (
          <div className="absolute right-4 top-4 w-64 rounded-xl border border-white/10 bg-black/85 p-3 text-white backdrop-blur">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/60">Chapitres</p>
            <ul className="space-y-1">
              {fallbackChapters.map((c) => (
                <li key={c.title}>
                  <button
                    onClick={() => { setTime(c.start); setShowChapters(false); }}
                    className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-xs hover:bg-white/10"
                  >
                    <span>{c.title}</span>
                    <span className="font-mono text-white/60">{fmt(c.start)}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      {nextLabel && onNext && (
        <button
          onClick={onNext}
          className="flex w-full items-center justify-between border-t border-border bg-surface px-4 py-3 text-left text-sm hover:bg-surface-elevated"
        >
          <span className="text-muted-foreground">Cours suivant automatique</span>
          <span className="inline-flex items-center gap-2 font-semibold">{nextLabel} <SkipForward className="h-4 w-4 text-vsm-red" /></span>
        </button>
      )}
    </div>
  );
}
