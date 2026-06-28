import { useRef, useState } from "react";
import { Image, Video, FileText, Smile, Hash, Loader2, X } from "lucide-react";
import { useCurrentAmbassadorPublic } from "@/hooks/use-current-ambassador";
import { useSocialMutations, type CreatePostInput } from "@/hooks/use-social";
import { uploadSocialFile } from "@/services/storage.service";
import { profileAvatarUrl } from "@/lib/program-tier";
import { useAuth } from "@/providers/auth-provider";
import type { PostMedia } from "@/types/social";

const QUICK_EMOJIS = ["🔥", "💎", "🚀", "👏", "❤️", "✨", "🎯", "💪"];

export function PostComposer() {
  const me = useCurrentAmbassadorPublic();
  const { profile } = useAuth();
  const { createPost } = useSocialMutations();
  const [draft, setDraft] = useState("");
  const [media, setMedia] = useState<PostMedia[]>([]);
  const [uploading, setUploading] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [tagMode, setTagMode] = useState(false);
  const imageRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);
  const docRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length || !profile?.userId) return;
    setUploading(true);
    try {
      const uploaded: PostMedia[] = [];
      for (const file of Array.from(files).slice(0, 4 - media.length)) {
        uploaded.push(await uploadSocialFile(profile.userId, file));
      }
      setMedia((prev) => [...prev, ...uploaded].slice(0, 4));
    } finally {
      setUploading(false);
    }
  };

  const extractTags = (text: string): string[] => {
    const matches = text.match(/#[\w\u00C0-\u024F]+/g);
    return matches ? [...new Set(matches)] : [];
  };

  const handlePublish = async () => {
    const text = draft.trim();
    if (!text && media.length === 0) return;
    const input: CreatePostInput = {
      text: text || " ",
      media,
      tags: extractTags(text),
    };
    await createPost.mutateAsync(input);
    setDraft("");
    setMedia([]);
    setTagMode(false);
  };

  const appendEmoji = (emoji: string) => {
    setDraft((d) => d + emoji);
    setShowEmoji(false);
  };

  return (
    <div className="rounded-2xl border border-border bg-surface p-4">
      <div className="flex items-start gap-3">
        <img
          src={me?.avatar ?? profileAvatarUrl(null, "vsm")}
          alt=""
          className="h-10 w-10 rounded-xl border border-border bg-background object-cover"
        />
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={`Quoi de neuf, ${me?.name.split(" ")[0] ?? "Ambassadeur"} ?`}
          className="min-h-[60px] flex-1 resize-none rounded-xl border border-border bg-background p-3 text-sm outline-none focus:border-vsm-red/50"
        />
      </div>

      {media.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2 pl-[52px]">
          {media.map((m, i) => (
            <div key={i} className="relative h-20 w-20 overflow-hidden rounded-lg border border-border">
              {m.type === "video" ? (
                <video src={m.url} className="h-full w-full object-cover" />
              ) : m.type === "doc" ? (
                <div className="grid h-full w-full place-items-center bg-background text-[10px] text-muted-foreground">{m.title ?? "Doc"}</div>
              ) : (
                <img src={m.url} alt="" className="h-full w-full object-cover" />
              )}
              <button
                type="button"
                onClick={() => setMedia((prev) => prev.filter((_, j) => j !== i))}
                className="absolute right-0.5 top-0.5 grid h-5 w-5 place-items-center rounded-full bg-black/70 text-white"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      <input ref={imageRef} type="file" accept="image/*" className="hidden" onChange={(e) => void handleFiles(e.target.files)} />
      <input ref={videoRef} type="file" accept="video/*" className="hidden" onChange={(e) => void handleFiles(e.target.files)} />
      <input ref={docRef} type="file" accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx" className="hidden" onChange={(e) => void handleFiles(e.target.files)} />

      <div className="relative mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
        <div className="flex items-center gap-1 text-muted-foreground">
          <button
            type="button"
            disabled={uploading || media.length >= 4}
            onClick={() => imageRef.current?.click()}
            className="inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs hover:bg-accent hover:text-foreground disabled:opacity-40"
          >
            <Image className="h-4 w-4" /> <span className="hidden sm:inline">Photo</span>
          </button>
          <button
            type="button"
            disabled={uploading || media.length >= 4}
            onClick={() => videoRef.current?.click()}
            className="inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs hover:bg-accent hover:text-foreground disabled:opacity-40"
          >
            <Video className="h-4 w-4" /> <span className="hidden sm:inline">Vidéo</span>
          </button>
          <button
            type="button"
            disabled={uploading || media.length >= 4}
            onClick={() => docRef.current?.click()}
            className="inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs hover:bg-accent hover:text-foreground disabled:opacity-40"
          >
            <FileText className="h-4 w-4" /> <span className="hidden sm:inline">Fichier</span>
          </button>
          <button
            type="button"
            onClick={() => setShowEmoji((v) => !v)}
            className="inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs hover:bg-accent hover:text-foreground"
          >
            <Smile className="h-4 w-4" /> <span className="hidden sm:inline">Emoji</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setTagMode(true);
              setDraft((d) => (d.endsWith(" ") || !d ? `${d}#` : `${d} #`));
            }}
            className="inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs hover:bg-accent hover:text-foreground"
          >
            <Hash className="h-4 w-4" /> <span className="hidden sm:inline">Tag</span>
          </button>
        </div>
        {showEmoji && (
          <div className="absolute bottom-full left-12 mb-1 flex gap-1 rounded-lg border border-border bg-popover p-2 shadow-elegant">
            {QUICK_EMOJIS.map((e) => (
              <button key={e} type="button" onClick={() => appendEmoji(e)} className="text-lg hover:scale-125">
                {e}
              </button>
            ))}
          </div>
        )}
        <button
          disabled={(!draft.trim() && media.length === 0) || createPost.isPending || uploading}
          onClick={() => void handlePublish()}
          className="inline-flex items-center gap-2 rounded-lg bg-vsm-red px-4 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-glow-red disabled:opacity-40"
        >
          {(createPost.isPending || uploading) && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          {uploading ? "Upload…" : createPost.isPending ? "Publication…" : "Publier"}
        </button>
      </div>
      {tagMode && (
        <p className="mt-2 pl-[52px] text-[11px] text-muted-foreground">Astuce : utilisez #hashtag pour catégoriser votre publication.</p>
      )}
    </div>
  );
}
