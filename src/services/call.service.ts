import { getSupabase } from "@/lib/supabase/client";

export type CallSignal =
  | { type: "ring"; from: string; to: string }
  | { type: "offer"; from: string; sdp: RTCSessionDescriptionInit }
  | { type: "answer"; from: string; sdp: RTCSessionDescriptionInit }
  | { type: "ice"; from: string; candidate: RTCIceCandidateInit }
  | { type: "hangup"; from: string };

function buildIceServers(): RTCIceServer[] {
  const servers: RTCIceServer[] = [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ];

  const turnUrl = import.meta.env.VITE_TURN_URL as string | undefined;
  const turnUser = import.meta.env.VITE_TURN_USERNAME as string | undefined;
  const turnCred = import.meta.env.VITE_TURN_CREDENTIAL as string | undefined;

  if (turnUrl?.trim() && turnUser?.trim() && turnCred?.trim()) {
    servers.push({ urls: turnUrl, username: turnUser, credential: turnCred });
  } else {
    servers.push({
      urls: [
        "turn:openrelay.metered.ca:80",
        "turn:openrelay.metered.ca:443",
        "turn:openrelay.metered.ca:443?transport=tcp",
      ],
      username: "openrelayproject",
      credential: "openrelayproject",
    });
  }

  return servers;
}

export function createPeerConnection(): RTCPeerConnection {
  return new RTCPeerConnection({ iceServers: buildIceServers() });
}

export async function getLocalAudioStream(): Promise<MediaStream> {
  return navigator.mediaDevices.getUserMedia({ audio: true, video: false });
}

type CallChannelEntry = {
  channel: ReturnType<ReturnType<typeof getSupabase>["channel"]>;
  ready: Promise<void>;
};

const callChannels = new Map<string, CallChannelEntry>();

function getCallChannel(conversationId: string): CallChannelEntry {
  let entry = callChannels.get(conversationId);
  if (entry) return entry;

  const supabase = getSupabase();
  let resolveReady!: () => void;
  const ready = new Promise<void>((res) => {
    resolveReady = res;
  });

  const channel = supabase.channel(`call:${conversationId}`, {
    config: { broadcast: { self: false } },
  });

  channel.subscribe((status) => {
    if (status === "SUBSCRIBED") resolveReady();
  });

  entry = { channel, ready };
  callChannels.set(conversationId, entry);
  return entry;
}

export function subscribeCallSignals(
  conversationId: string,
  userId: string,
  onSignal: (signal: CallSignal) => void,
): () => void {
  const { channel } = getCallChannel(conversationId);

  channel.on("broadcast", { event: "signal" }, (payload) => {
    const signal = payload.payload as CallSignal;
    if (signal.from === userId) return;
    onSignal(signal);
  });

  return () => {
    /* canal partagé — nettoyage global à la fin d'appel */
  };
}

export async function sendCallSignal(conversationId: string, signal: CallSignal): Promise<void> {
  const { channel, ready } = getCallChannel(conversationId);
  await ready;
  await channel.send({ type: "broadcast", event: "signal", payload: signal });
}

export function closeCallChannel(conversationId: string): void {
  const entry = callChannels.get(conversationId);
  if (!entry) return;
  void getSupabase().removeChannel(entry.channel);
  callChannels.delete(conversationId);
}
