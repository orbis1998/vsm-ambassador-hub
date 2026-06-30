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
  durationSec?: number;
  onComplete?: () => void;
  nextLabel?: string;
  onNext?: () => void;
}

export function VideoPlayer({ src, poster, durationSec = 360, onComplete, nextLabel, onNext }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(durationSec);
  const [muted, setMuted] = useState(false);

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
    <div ref={containerRef} className="relative overflow-hidden rounded-2xl border border-border bg-black">
      <div className="relative aspect-video">
        {src ? (
          <video
            ref={videoRef}
            src={src}
            poster={poster}
            playsInline
            className="h-full w-full object-contain bg-black"
            muted={muted}
          />
        ) : (
          <div className="relative h-full w-full">
            <img src={poster} alt="" className="h-full w-full object-cover opacity-70" />
            <div className="absolute inset-0 grid place-items-center bg-black/50 p-6 text-center text-sm text-white">
              Vidéo non disponible pour ce cours. Consultez les leçons et ressources ci-dessous.
            </div>
          </div>
        )}

        {src && !playing && (
          <button onClick={() => void togglePlay()} className="absolute inset-0 grid place-items-center" aria-label="Lire la vidéo">
            <span className="grid h-20 w-20 place-items-center rounded-full bg-vsm-red/90 text-white shadow-glow-red">
              <Play className="ml-1 h-8 w-8 fill-white" />
            </span>
          </button>
        )}

        <div className="absolute inset-x-0 bottom-0 space-y-2 bg-gradient-to-t from-black/95 to-transparent p-4">
          <input
            type="range"
            min={0}
            max={duration || 1}
            value={time}
            onChange={(e) => {
              const v = videoRef.current;
              if (!v) return;
              v.currentTime = Number(e.target.value);
              setTime(v.currentTime);
            }}
            className="h-1 w-full cursor-pointer appearance-none rounded-full bg-white/20 accent-vsm-red"
            style={{ background: `linear-gradient(to right, var(--vsm-red) ${pct}%, rgba(255,255,255,0.2) ${pct}%)` }}
          />
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-3">
              <button onClick={() => void togglePlay()} className="rounded-md p-1.5 hover:bg-white/10" disabled={!src}>
                {playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              </button>
              <button onClick={() => setMuted((m) => !m)} className="rounded-md p-1.5 hover:bg-white/10" disabled={!src}>
                {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
              </button>
              <span className="font-mono text-xs">{fmt(time)} / {fmt(duration)}</span>
            </div>
            <div className="flex items-center gap-1">
              {onNext && (
                <button onClick={onNext} className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs hover:bg-white/10">
                  <SkipForward className="h-4 w-4" /> Suivant
                </button>
              )}
              <button onClick={() => containerRef.current?.requestFullscreen?.()} className="rounded-md p-1.5 hover:bg-white/10">
                <Maximize2 className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
      {nextLabel && onNext && (
        <button
          onClick={onNext}
          className="flex w-full items-center justify-between border-t border-border bg-surface px-4 py-3 text-left text-sm hover:bg-surface-elevated"
        >
          <span className="text-muted-foreground">Cours suivant</span>
          <span className="inline-flex items-center gap-2 font-semibold">{nextLabel} <SkipForward className="h-4 w-4 text-vsm-red" /></span>
        </button>
      )}
    </div>
  );
}
