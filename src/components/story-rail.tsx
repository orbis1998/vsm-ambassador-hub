import { useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Plus, X, ChevronLeft, ChevronRight, Loader2, Heart, Send } from "lucide-react";
import { useStories, useSocialMutations, useAmbassador } from "@/hooks/use-social";
import { useCurrentAmbassadorPublic } from "@/hooks/use-current-ambassador";
import { profileAvatarUrl } from "@/lib/program-tier";
import type { Story } from "@/types/social";
import { toast } from "sonner";

export function StoryRail() {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const me = useCurrentAmbassadorPublic();
  const { data: stories = [] } = useStories();
  const { viewStory, createStory } = useSocialMutations();
  const active = activeIdx !== null ? stories[activeIdx] : null;

  const handleStoryFile = async (file?: File) => {
    if (!file) return;
    await createStory.mutateAsync({ file });
  };

  const openStory = (idx: number) => {
    setActiveIdx(idx);
    const story = stories[idx];
    if (story && !story.viewed) viewStory.mutate(story.id);
  };

  return (
    <>
      <div className="-mx-2 flex gap-3 overflow-x-auto px-2 pb-2">
        <button type="button" className="group flex w-20 shrink-0 flex-col items-center gap-2 sm:w-24" onClick={() => fileRef.current?.click()}>
          <input ref={fileRef} type="file" accept="image/*,video/*" className="hidden" onChange={(e) => void handleStoryFile(e.target.files?.[0])} />
          <div className="relative h-20 w-20 overflow-hidden rounded-2xl border border-dashed border-border bg-surface sm:h-24 sm:w-24">
            <img src={me?.avatar ?? profileAvatarUrl(null, "vsm")} alt="" className="h-full w-full object-cover opacity-40" />
            <span className="absolute inset-0 grid place-items-center">
              {createStory.isPending ? <Loader2 className="h-6 w-6 animate-spin text-vsm-red" /> : (
                <span className="grid h-8 w-8 place-items-center rounded-full bg-vsm-red text-white shadow-glow-red"><Plus className="h-4 w-4" /></span>
              )}
            </span>
          </div>
          <span className="truncate text-[11px] text-muted-foreground">Votre story</span>
        </button>

        {stories.map((s, i) => (
          <StoryThumb key={s.id} story={s} meId={me?.id} onOpen={() => openStory(i)} />
        ))}
      </div>

      {active && (
        <StoryViewer
          story={active}
          meId={me?.id}
          onClose={() => setActiveIdx(null)}
          onPrev={() => setActiveIdx((i) => (i !== null && i > 0 ? i - 1 : i))}
          onNext={() => setActiveIdx((i) => (i !== null && i < stories.length - 1 ? i + 1 : i))}
          hasPrev={activeIdx !== null && activeIdx > 0}
          hasNext={activeIdx !== null && activeIdx < stories.length - 1}
        />
      )}
    </>
  );
}

function StoryThumb({ story, meId, onOpen }: { story: Story; meId?: string; onOpen: () => void }) {
  const { data: author } = useAmbassador(story.author_id);
  const isMe = meId === story.author_id;
  const me = useCurrentAmbassadorPublic();
  const display = isMe && me ? me : author;
  const avatar = display?.avatar ?? profileAvatarUrl(null, display?.name ?? "Ambassadeur");
  const firstName = (display?.name ?? "Ambassadeur").split(" ")[0];

  return (
    <button onClick={onOpen} className="group flex w-20 shrink-0 flex-col items-center gap-2 sm:w-24">
      <div className={`relative h-20 w-20 overflow-hidden rounded-2xl p-[2px] sm:h-24 sm:w-24 ${story.viewed ? "bg-border" : "bg-gradient-to-br from-vsm-red via-vsm-red-glow to-vsm-red"}`}>
        <div className="h-full w-full overflow-hidden rounded-2xl bg-background">
          {story.media_url.match(/\.(mp4|webm|mov)/i) ? (
            <video src={story.media_url} className="h-full w-full object-cover" muted />
          ) : (
            <img src={story.media_url} alt="" className="h-full w-full object-cover transition-transform group-hover:scale-105" />
          )}
        </div>
        <img src={avatar} alt="" className="absolute bottom-1 right-1 h-6 w-6 rounded-lg border border-background bg-background object-cover" />
      </div>
      <span className="w-full truncate text-center text-[11px] text-muted-foreground">{firstName}</span>
    </button>
  );
}

function StoryViewer({
  story,
  meId,
  onClose,
  onPrev,
  onNext,
  hasPrev,
  hasNext,
}: {
  story: Story;
  meId?: string;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  hasPrev: boolean;
  hasNext: boolean;
}) {
  const navigate = useNavigate();
  const { data: author } = useAmbassador(story.author_id);
  const me = useCurrentAmbassadorPublic();
  const { toggleStoryLike, replyToStory } = useSocialMutations();
  const [reply, setReply] = useState("");
  const display = meId === story.author_id && me ? me : author;
  const avatar = display?.avatar ?? profileAvatarUrl(null, display?.name ?? "Ambassadeur");
  const name = display?.name ?? "Ambassadeur";
  const isVideo = story.media_url.match(/\.(mp4|webm|mov)/i);

  const handleReply = async () => {
    const text = reply.trim();
    if (!text || !meId || meId === story.author_id) return;
    const convId = await replyToStory.mutateAsync({ authorId: story.author_id, storyId: story.id, text });
    toast.success("Réponse envoyée");
    onClose();
    navigate({ to: "/messages", search: { conv: convId } });
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/90 p-2 backdrop-blur-xl sm:p-4">
      <button onClick={onClose} className="absolute right-3 top-3 z-10 grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white sm:right-4 sm:top-4" aria-label="Fermer">
        <X className="h-5 w-5" />
      </button>
      {hasPrev && (
        <button onClick={onPrev} className="absolute left-2 top-1/2 z-10 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white sm:left-4 sm:h-12 sm:w-12">
          <ChevronLeft className="h-6 w-6" />
        </button>
      )}
      {hasNext && (
        <button onClick={onNext} className="absolute right-2 top-1/2 z-10 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white sm:right-4 sm:h-12 sm:w-12">
          <ChevronRight className="h-6 w-6" />
        </button>
      )}

      <div className="relative flex h-[85dvh] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-white/10 sm:aspect-[9/16] sm:h-[80vh] sm:max-h-[700px]">
        {isVideo ? (
          <video src={story.media_url} controls autoPlay className="h-full w-full object-cover" />
        ) : (
          <img src={story.media_url} alt="" className="h-full w-full object-cover" />
        )}
        <div className="absolute inset-x-3 top-3 space-y-2">
          <div className="flex items-center gap-2 text-white">
            <img src={avatar} alt="" className="h-9 w-9 rounded-lg object-cover" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{name}</p>
              <p className="text-[10px] uppercase tracking-wider opacity-80">{display?.level ?? "Ambassadeur"}</p>
            </div>
            {meId !== story.author_id && (
              <button
                type="button"
                onClick={() => toggleStoryLike.mutate({ storyId: story.id, liked: !!story.liked })}
                className={`grid h-9 w-9 place-items-center rounded-full ${story.liked ? "bg-vsm-red text-white" : "bg-white/10"}`}
              >
                <Heart className={`h-4 w-4 ${story.liked ? "fill-current" : ""}`} />
              </button>
            )}
          </div>
        </div>
        {story.caption && (
          <p className="absolute inset-x-3 bottom-20 rounded-lg bg-black/60 px-3 py-2 text-center text-sm text-white backdrop-blur sm:bottom-24">{story.caption}</p>
        )}
        {meId !== story.author_id && (
          <div className="absolute inset-x-0 bottom-0 flex items-center gap-2 border-t border-white/10 bg-black/70 p-3 backdrop-blur">
            <input
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder="Répondre à la story…"
              className="h-10 flex-1 rounded-lg border border-white/20 bg-white/10 px-3 text-sm text-white outline-none placeholder:text-white/50"
              onKeyDown={(e) => e.key === "Enter" && void handleReply()}
            />
            <button type="button" onClick={() => void handleReply()} disabled={!reply.trim()} className="grid h-10 w-10 place-items-center rounded-lg bg-vsm-red text-white disabled:opacity-40">
              <Send className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
