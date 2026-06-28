import { getSupabase } from "@/lib/supabase/client";

export type CallSignal =
  | { type: "ring"; from: string; to: string }
  | { type: "offer"; from: string; sdp: RTCSessionDescriptionInit }
  | { type: "answer"; from: string; sdp: RTCSessionDescriptionInit }
  | { type: "ice"; from: string; candidate: RTCIceCandidateInit }
  | { type: "hangup"; from: string };

const ICE_SERVERS: RTCIceServer[] = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
];

export function createPeerConnection(): RTCPeerConnection {
  return new RTCPeerConnection({ iceServers: ICE_SERVERS });
}

export async function getLocalAudioStream(): Promise<MediaStream> {
  return navigator.mediaDevices.getUserMedia({ audio: true, video: false });
}

export function subscribeCallSignals(
  conversationId: string,
  userId: string,
  onSignal: (signal: CallSignal) => void,
): () => void {
  const channel = getSupabase()
    .channel(`call:${conversationId}`)
    .on("broadcast", { event: "signal" }, (payload) => {
      const signal = payload.payload as CallSignal;
      if (signal.from === userId) return;
      onSignal(signal);
    })
    .subscribe();

  return () => {
    void getSupabase().removeChannel(channel);
  };
}

export async function sendCallSignal(conversationId: string, signal: CallSignal): Promise<void> {
  const channel = getSupabase().channel(`call:${conversationId}`);
  await channel.subscribe();
  await channel.send({ type: "broadcast", event: "signal", payload: signal });
  void getSupabase().removeChannel(channel);
}
