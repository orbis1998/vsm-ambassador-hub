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
  const streamRef = useRef<MediaStream | null>(null);

  const startVoice = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    streamRef.current = stream;
    const rec = new MediaRecorder(stream);
    chunksRef.current = [];
    rec.ondataavailable = (e) => chunksRef.current.push(e.data);
    rec.onstop = () => {
      stream.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      const blob = new Blob(chunksRef.current, { type: "audio/webm" });
      if (blob.size > 0) {
        setVoicePreview({ blob, url: URL.createObjectURL(blob) });
      }
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
    <div className="border-t border-border bg-background p-2 md:p-3">
      {replyTo && (
        <div className="mb-2 flex items-center justify-between rounded-lg bg-accent px-3 py-2 text-xs">
          <span className="truncate text-muted-foreground">Réponse : {replyTo.body.slice(0, 80)}</span>
          <button type="button" onClick={onClearReply}><X className="h-4 w-4" /></button>
        </div>
      )}
      {voicePreview && (
        <div className="mb-2 flex items-center gap-2 rounded-lg border border-border bg-accent/50 px-3 py-2">
          <audio src={voicePreview.url} controls className="h-8 max-w-[200px] flex-1" />
          <button type="button" onClick={sendVoicePreview} className="grid h-9 w-9 place-items-center rounded-lg bg-vsm-red text-white" aria-label="Envoyer">
            <Send className="h-4 w-4" />
          </button>
          <button type="button" onClick={discardVoice} className="grid h-9 w-9 place-items-center rounded-lg border border-border text-destructive" aria-label="Supprimer">
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
      <div className="flex items-end gap-1.5">
        <button type="button" onClick={() => mediaRef.current?.click()} className="grid h-10 w-10 shrink-0 place-items-center rounded-lg text-muted-foreground hover:bg-accent" aria-label="Photo ou vidéo">
          <Image className="h-5 w-5" />
        </button>
        <input ref={mediaRef} type="file" accept="image/*,video/*" className="hidden" onChange={(e) => e.target.files?.[0] && onSendMedia(e.target.files[0])} />
        <button type="button" onClick={() => fileRef.current?.click()} className="grid h-10 w-10 shrink-0 place-items-center rounded-lg text-muted-foreground hover:bg-accent" aria-label="Fichier">
          <Paperclip className="h-5 w-5" />
        </button>
        <input ref={fileRef} type="file" className="hidden" onChange={(e) => e.target.files?.[0] && onSendMedia(e.target.files[0])} />
        {!recording && !voicePreview && (
          <button type="button" onClick={() => void startVoice()} className="grid h-10 w-10 shrink-0 place-items-center rounded-lg text-muted-foreground hover:bg-accent" aria-label="Note vocale">
            <Mic className="h-5 w-5" />
          </button>
        )}
        <textarea
          value={draft}
          onChange={(e) => { onDraftChange(e.target.value); onTyping?.(); }}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onSendText(); } }}
          placeholder="Écrire un message…"
          rows={1}
          className="max-h-24 min-h-10 flex-1 resize-none rounded-lg border border-border bg-surface px-3 py-2.5 text-sm outline-none focus:border-vsm-red/50"
        />
        <button
          type="button"
          disabled={!draft.trim() || sending}
          onClick={onSendText}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-vsm-red text-white disabled:opacity-40"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
