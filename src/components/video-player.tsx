import { useEffect, useRef, useState } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  SkipForward,
} from "lucide-react";

interface Props {
  src?: string | null;
  poster: string;
  title?: string;
  durationSec?: number;
  onComplete?: () => void;
  nextLabel?: string;
  onNext?: () => void;
  className?: string;
}

export function VideoPlayer({
  src,
  poster,
  title,
  durationSec = 360,
  onComplete,
  nextLabel,
  onNext,
  className = "",
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(durationSec);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    setPlaying(false);
    setTime(0);
    setDuration(durationSec);
  }, [src, durationSec]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v || !src) return;
    const onTime = () => setTime(v.currentTime);
    const onMeta = () => setDuration(v.duration || durationSec);
    const onEnded = () => {
      setPlaying(false);
      onComplete?.();
    };
    v.addEventListener("timeupdate", onTime);
    v.addEventListener("loadedmetadata", onMeta);
    v.addEventListener("ended", onEnded);
    return () => {
      v.removeEventListener("timeupdate", onTime);
      v.removeEventListener("loadedmetadata", onMeta);
      v.removeEventListener("ended", onEnded);
    };
  }, [src, durationSec, onComplete]);

  const togglePlay = async () => {
    const v = videoRef.current;
    if (!v || !src) return;
    if (v.paused) {
      await v.play();
      setPlaying(true);
    } else {
      v.pause();
      setPlaying(false);
    }
  };

  const fmt = (s: number) => {
    const m = Math.floor(s / 60);
    const r = Math.floor(s % 60);
    return `${m}:${r.toString().padStart(2, "0")}`;
  };

  const pct = duration > 0 ? (time / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      className={`w-full min-w-0 max-w-full overflow-hidden rounded-2xl border border-border bg-black ${className}`}
    >
      {title && src && (
        <div className="border-b border-border bg-surface px-3 py-2 sm:px-4">
          <p className="truncate text-xs font-semibold uppercase tracking-wider text-muted-foreground">Formation en cours</p>
          <p className="truncate text-sm font-semibold">{title}</p>
        </div>
      )}

      <div className="relative aspect-video w-full max-w-full overflow-hidden bg-black">
        {src ? (
          <video
            ref={videoRef}
            src={src}
            poster={poster}
            playsInline
            preload="metadata"
            className="absolute inset-0 h-full w-full object-contain"
            muted={muted}
          />
        ) : (
          <div className="absolute inset-0">
            <img src={poster} alt="" className="h-full w-full object-cover opacity-70" />
            <div className="absolute inset-0 grid place-items-center bg-black/50 p-4 text-center text-sm text-white">
              Vidéo non disponible. Ouvrez l&apos;onglet Leçons pour le contenu du module.
            </div>
          </div>
        )}

        {src && !playing && (
          <button
            type="button"
            onClick={() => void togglePlay()}
            className="absolute inset-0 z-10 grid place-items-center touch-manipulation"
            aria-label="Lire la vidéo"
          >
            <span className="grid h-14 w-14 place-items-center rounded-full bg-vsm-red/90 text-white shadow-glow-red sm:h-16 sm:w-16">
              <Play className="ml-0.5 h-6 w-6 fill-white sm:h-7 sm:w-7" />
            </span>
          </button>
        )}

        {src && (
          <div className="absolute inset-x-0 bottom-0 z-20 space-y-1.5 bg-gradient-to-t from-black/95 via-black/70 to-transparent p-2 sm:space-y-2 sm:p-3">
            <input
              type="range"
              min={0}
              max={duration || 1}
              step={0.1}
              value={time}
              onChange={(e) => {
                const v = videoRef.current;
                if (!v) return;
                v.currentTime = Number(e.target.value);
                setTime(v.currentTime);
              }}
              className="h-1.5 w-full min-w-0 max-w-full cursor-pointer appearance-none rounded-full bg-white/20 accent-vsm-red touch-manipulation"
              style={{ background: `linear-gradient(to right, var(--vsm-red) ${pct}%, rgba(255,255,255,0.2) ${pct}%)` }}
            />
            <div className="flex items-center justify-between gap-1 text-white">
              <div className="flex min-w-0 shrink items-center gap-1 sm:gap-2">
                <button type="button" onClick={() => void togglePlay()} className="shrink-0 rounded-md p-1.5 hover:bg-white/10 touch-manipulation">
                  {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </button>
                <button type="button" onClick={() => setMuted((m) => !m)} className="shrink-0 rounded-md p-1.5 hover:bg-white/10 touch-manipulation">
                  {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </button>
                <span className="truncate font-mono text-[10px] sm:text-xs">{fmt(time)} / {fmt(duration)}</span>
              </div>
              <div className="flex shrink-0 items-center gap-0.5">
                {onNext && (
                  <button type="button" onClick={onNext} className="rounded-md p-1.5 hover:bg-white/10 touch-manipulation" aria-label="Cours suivant">
                    <SkipForward className="h-4 w-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    const el = containerRef.current;
                    void el?.requestFullscreen?.();
                  }}
                  className="rounded-md p-1.5 hover:bg-white/10 touch-manipulation"
                  aria-label="Plein écran"
                >
                  <Maximize2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {nextLabel && onNext && (
        <button
          type="button"
          onClick={onNext}
          className="flex w-full min-w-0 items-center justify-between gap-2 border-t border-border bg-surface px-3 py-2.5 text-left text-sm hover:bg-surface-elevated sm:px-4 sm:py-3"
        >
          <span className="shrink-0 text-muted-foreground">Cours suivant</span>
          <span className="inline-flex min-w-0 items-center gap-2 font-semibold">
            <span className="truncate">{nextLabel}</span>
            <SkipForward className="h-4 w-4 shrink-0 text-vsm-red" />
          </span>
        </button>
      )}
    </div>
  );
}
