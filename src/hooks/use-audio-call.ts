import { useCallback, useEffect, useRef, useState } from "react";
import {
  createPeerConnection,
  getLocalAudioStream,
  sendCallSignal,
  subscribeCallSignals,
  type CallSignal,
} from "@/services/call.service";

export type CallState = "idle" | "ringing" | "connecting" | "active" | "ended";

export function useAudioCall(conversationId: string | undefined, userId: string | undefined, otherUserId: string | undefined) {
  const [state, setState] = useState<CallState>("idle");
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);

  const cleanup = useCallback(() => {
    pcRef.current?.close();
    pcRef.current = null;
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    localStreamRef.current = null;
    if (remoteAudioRef.current) remoteAudioRef.current.srcObject = null;
    setState("idle");
  }, []);

  const handleSignal = useCallback(
    async (signal: CallSignal) => {
      if (!conversationId || !userId || !otherUserId) return;

      if (signal.type === "ring" && signal.to === userId) {
        setState("ringing");
        return;
      }

      if (signal.type === "offer" && signal.from === otherUserId) {
        setState("connecting");
        const stream = await getLocalAudioStream();
        localStreamRef.current = stream;
        const pc = createPeerConnection();
        pcRef.current = pc;
        stream.getTracks().forEach((t) => pc.addTrack(t, stream));
        pc.ontrack = (e) => {
          if (remoteAudioRef.current) remoteAudioRef.current.srcObject = e.streams[0];
        };
        pc.onicecandidate = (e) => {
          if (e.candidate) void sendCallSignal(conversationId, { type: "ice", from: userId, candidate: e.candidate.toJSON() });
        };
        await pc.setRemoteDescription(signal.sdp);
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        await sendCallSignal(conversationId, { type: "answer", from: userId, sdp: answer });
        setState("active");
        return;
      }

      if (signal.type === "answer" && signal.from === otherUserId && pcRef.current) {
        await pcRef.current.setRemoteDescription(signal.sdp);
        setState("active");
        return;
      }

      if (signal.type === "ice" && signal.from === otherUserId && pcRef.current && signal.candidate) {
        try {
          await pcRef.current.addIceCandidate(signal.candidate);
        } catch {
          /* ignore stale ice */
        }
        return;
      }

      if (signal.type === "hangup") {
        cleanup();
        setState("ended");
        setTimeout(() => setState("idle"), 1500);
      }
    },
    [conversationId, userId, otherUserId, cleanup],
  );

  useEffect(() => {
    if (!conversationId || !userId) return;
    return subscribeCallSignals(conversationId, userId, (s) => void handleSignal(s));
  }, [conversationId, userId, handleSignal]);

  const startCall = useCallback(async () => {
    if (!conversationId || !userId || !otherUserId) return;
    setState("connecting");
    await sendCallSignal(conversationId, { type: "ring", from: userId, to: otherUserId });
    const stream = await getLocalAudioStream();
    localStreamRef.current = stream;
    const pc = createPeerConnection();
    pcRef.current = pc;
    stream.getTracks().forEach((t) => pc.addTrack(t, stream));
    pc.ontrack = (e) => {
      if (remoteAudioRef.current) remoteAudioRef.current.srcObject = e.streams[0];
    };
    pc.onicecandidate = (e) => {
      if (e.candidate) void sendCallSignal(conversationId, { type: "ice", from: userId, candidate: e.candidate.toJSON() });
    };
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    await sendCallSignal(conversationId, { type: "offer", from: userId, sdp: offer });
  }, [conversationId, userId, otherUserId]);

  const acceptCall = useCallback(async () => {
    /* offer handler already sets up when answer sent */
    if (state === "ringing") setState("connecting");
  }, [state]);

  const hangUp = useCallback(async () => {
    if (conversationId && userId) {
      await sendCallSignal(conversationId, { type: "hangup", from: userId });
    }
    cleanup();
  }, [conversationId, userId, cleanup]);

  return { state, startCall, acceptCall, hangUp, remoteAudioRef, cleanup };
}
