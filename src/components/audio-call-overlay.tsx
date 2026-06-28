import { Mic, MicOff, PhoneOff, Volume2, VolumeX, Minimize2 } from "lucide-react";
import { profileAvatarUrl } from "@/lib/program-tier";
import type { CallState } from "@/hooks/use-audio-call";

type Props = {
  state: CallState;
  peerName: string;
  peerAvatar?: string;
  minimized: boolean;
  speakerOn: boolean;
  muted: boolean;
  onAccept: () => void;
  onHangUp: () => void;
  onToggleSpeaker: () => void;
  onToggleMute: () => void;
  onMinimize: () => void;
};

export function AudioCallOverlay({
  state,
  peerName,
  peerAvatar,
  minimized,
  speakerOn,
  muted,
  onAccept,
  onHangUp,
  onToggleSpeaker,
  onToggleMute,
  onMinimize,
}: Props) {
  if (state === "idle" || state === "ended") return null;

  const avatar = peerAvatar ?? profileAvatarUrl(null, peerName);
  const status =
    state === "ringing" ? "Appel entrant…" : state === "connecting" ? "Connexion…" : "En appel";

  if (minimized) {
    return (
      <div className="flex items-center justify-between border-b border-vsm-red/30 bg-vsm-red/10 px-3 py-2 text-sm md:px-4">
        <div className="flex min-w-0 items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-vsm-red opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-vsm-red" />
          </span>
          <span className="truncate font-medium">{peerName}</span>
          <span className="text-xs text-muted-foreground">{status}</span>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button type="button" onClick={onToggleSpeaker} className="grid h-8 w-8 place-items-center rounded-lg hover:bg-accent" aria-label="Haut-parleur">
            {speakerOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </button>
          <button type="button" onClick={onHangUp} className="rounded-lg bg-destructive px-3 py-1 text-xs font-bold text-white">Raccrocher</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-gradient-to-b from-zinc-900 via-zinc-950 to-black p-4 md:absolute md:inset-0">
      <button
        type="button"
        onClick={onMinimize}
        className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white md:right-6 md:top-6"
        aria-label="Réduire et rester dans la conversation"
      >
        <Minimize2 className="h-5 w-5" />
      </button>

      <div className="flex w-full max-w-sm flex-col items-center text-center text-white">
        <img src={avatar} alt="" className="h-28 w-28 rounded-2xl object-cover shadow-2xl ring-2 ring-white/20" />
        <p className="mt-6 font-display text-2xl font-bold uppercase tracking-wide">{peerName}</p>
        <p className="mt-2 text-sm text-white/70">{status}</p>

        <div className="mt-12 flex items-center justify-center gap-4">
          {state === "active" && (
            <>
              <button
                type="button"
                onClick={onToggleMute}
                className={`grid h-14 w-14 place-items-center rounded-full ${muted ? "bg-white text-zinc-900" : "bg-white/15 text-white"}`}
                aria-label="Micro"
              >
                {muted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
              </button>
              <button
                type="button"
                onClick={onToggleSpeaker}
                className={`grid h-14 w-14 place-items-center rounded-full ${speakerOn ? "bg-white text-zinc-900" : "bg-white/15 text-white"}`}
                aria-label="Haut-parleur"
              >
                {speakerOn ? <Volume2 className="h-6 w-6" /> : <VolumeX className="h-6 w-6" />}
              </button>
            </>
          )}
          {state === "ringing" && (
            <button
              type="button"
              onClick={onAccept}
              className="grid h-16 w-16 place-items-center rounded-full bg-emerald-500 text-white shadow-lg"
              aria-label="Répondre"
            >
              <PhoneOff className="h-7 w-7 rotate-[135deg]" />
            </button>
          )}
          <button
            type="button"
            onClick={onHangUp}
            className="grid h-16 w-16 place-items-center rounded-full bg-red-500 text-white shadow-lg"
            aria-label="Raccrocher"
          >
            <PhoneOff className="h-7 w-7" />
          </button>
        </div>
        <p className="mt-8 text-xs text-white/50">Réduire pour continuer la conversation pendant l&apos;appel</p>
      </div>
    </div>
  );
}
