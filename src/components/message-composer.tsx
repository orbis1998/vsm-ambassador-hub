import { useRef, useState } from "react";
import { Image, Mic, Paperclip, Send, Square, Trash2, X } from "lucide-react";
import type { Message } from "@/types/messaging";

type Props = {
  draft: string;
  onDraftChange: (v: string) => void;
  replyTo: Message | null;
  onClearReply: () => void;
  onSendText: () => void;
  onSendMedia: (file: File) => void;
  onSendVoice: (blob: Blob) => void;
  sending?: boolean;
  onTyping?: () => void;
};

export function MessageComposer({
  draft,
  onDraftChange,
  replyTo,
  onClearReply,
  onSendText,
  onSendMedia,
  onSendVoice,
  sending,
  onTyping,
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const mediaRef = useRef<HTMLInputElement>(null);
  const [recording, setRecording] = useState(false);
  const [voicePreview, setVoicePreview] = useState<{ blob: Blob; url: string } | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const hasText = draft.trim().length > 0;

  const startVoice = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const rec = new MediaRecorder(stream);
    chunksRef.current = [];
    rec.ondataavailable = (e) => chunksRef.current.push(e.data);
    rec.onstop = () => {
      stream.getTracks().forEach((t) => t.stop());
      const blob = new Blob(chunksRef.current, { type: "audio/webm" });
      if (blob.size > 0) setVoicePreview({ blob, url: URL.createObjectURL(blob) });
    };
    recorderRef.current = rec;
    rec.start();
    setRecording(true);
  };

  const stopVoice = () => {
    recorderRef.current?.stop();
    setRecording(false);
  };

  const discardVoice = () => {
    if (voicePreview) URL.revokeObjectURL(voicePreview.url);
    setVoicePreview(null);
  };

  const sendVoicePreview = () => {
    if (!voicePreview) return;
    onSendVoice(voicePreview.blob);
    URL.revokeObjectURL(voicePreview.url);
    setVoicePreview(null);
  };

  return (
    <div className="border-t border-[#d1d7db] bg-[#f0f2f5] p-2 dark:border-border dark:bg-background">
      {replyTo && (
        <div className="mb-2 flex items-center justify-between rounded-lg border-l-4 border-[#25d366] bg-white px-3 py-2 text-xs dark:border-vsm-red dark:bg-surface">
          <span className="truncate text-muted-foreground">Réponse : {replyTo.body.slice(0, 80)}</span>
          <button type="button" onClick={onClearReply} aria-label="Annuler la réponse"><X className="h-4 w-4" /></button>
        </div>
      )}
      {voicePreview && (
        <div className="mb-2 flex items-center gap-2 rounded-lg border border-border bg-white px-3 py-2 dark:bg-surface">
          <audio src={voicePreview.url} controls className="h-8 max-w-[200px] flex-1" />
          <button type="button" onClick={sendVoicePreview} className="grid h-10 w-10 place-items-center rounded-full bg-[#25d366] text-white" aria-label="Envoyer">
            <Send className="h-4 w-4" />
          </button>
          <button type="button" onClick={discardVoice} className="grid h-10 w-10 place-items-center rounded-full border border-border text-destructive" aria-label="Supprimer">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      )}
      {recording && (
        <div className="mb-2 flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">
          <span className="h-2 w-2 animate-pulse rounded-full bg-destructive" />
          Enregistrement…
          <button type="button" onClick={stopVoice} className="ml-auto inline-flex items-center gap-1 rounded-lg bg-destructive px-2 py-1 text-white">
            <Square className="h-3 w-3" /> Arrêter
          </button>
        </div>
      )}
      <div className="flex items-end gap-2">
        <button type="button" onClick={() => mediaRef.current?.click()} className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-black/5 dark:hover:bg-accent" aria-label="Photo ou vidéo">
          <Image className="h-5 w-5" />
        </button>
        <input ref={mediaRef} type="file" accept="image/*,video/*" className="hidden" onChange={(e) => e.target.files?.[0] && onSendMedia(e.target.files[0])} />
        <button type="button" onClick={() => fileRef.current?.click()} className="hidden h-10 w-10 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-black/5 sm:grid dark:hover:bg-accent" aria-label="Fichier">
          <Paperclip className="h-5 w-5" />
        </button>
        <input ref={fileRef} type="file" className="hidden" onChange={(e) => e.target.files?.[0] && onSendMedia(e.target.files[0])} />
        <textarea
          value={draft}
          onChange={(e) => { onDraftChange(e.target.value); onTyping?.(); }}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); if (hasText) onSendText(); } }}
          placeholder="Message"
          rows={1}
          className="max-h-28 min-h-10 flex-1 resize-none rounded-3xl border border-[#d1d7db] bg-white px-4 py-2.5 text-sm outline-none focus:border-[#25d366]/50 dark:border-border dark:bg-surface dark:focus:border-vsm-red/50"
        />
        {hasText ? (
          <button
            type="button"
            disabled={sending}
            onClick={onSendText}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#25d366] text-white shadow-sm disabled:opacity-40"
            aria-label="Envoyer"
          >
            <Send className="h-5 w-5" />
          </button>
        ) : !recording && !voicePreview ? (
          <button
            type="button"
            onClick={() => void startVoice()}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-black/5 dark:hover:bg-accent"
            aria-label="Note vocale"
          >
            <Mic className="h-5 w-5" />
          </button>
        ) : null}
      </div>
    </div>
  );
}
