import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Plus, X, ChevronLeft, ChevronRight, Loader2, Heart, Send, Eye } from "lucide-react";
import { useStoryGroups, useSocialMutations, useAmbassador } from "@/hooks/use-social";
import { useCurrentAmbassadorPublic } from "@/hooks/use-current-ambassador";
import { profileAvatarUrl } from "@/lib/program-tier";
import { fetchStoryLikers, fetchStoryViewers } from "@/services/social.service";
import type { Story, StoryGroup } from "@/types/social";
import { toast } from "sonner";

export function StoryRail() {
  const [activeGroupIdx, setActiveGroupIdx] = useState<number | null>(null);
  const [activeStoryIdx, setActiveStoryIdx] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);
  const me = useCurrentAmbassadorPublic();
  const { data: groups = [] } = useStoryGroups();
  const { viewStory, createStory } = useSocialMutations();
  const activeGroup = activeGroupIdx !== null ? groups[activeGroupIdx] : null;
  const activeStory = activeGroup?.stories[activeStoryIdx] ?? null;

  const handleStoryFile = async (file?: File) => {
    if (!file) return;
    await createStory.mutateAsync({ file });
  };

  const openGroup = (groupIdx: number) => {
    setActiveGroupIdx(groupIdx);
    setActiveStoryIdx(0);
    const story = groups[groupIdx]?.stories[0];
    if (story && !story.viewed) viewStory.mutate(story.id);
  };

  const goStory = (nextIdx: number) => {
    if (!activeGroup) return;
    const clamped = Math.max(0, Math.min(activeGroup.stories.length - 1, nextIdx));
    setActiveStoryIdx(clamped);
    const story = activeGroup.stories[clamped];
    if (story && !story.viewed) viewStory.mutate(story.id);
  };

  const goGroup = (delta: number) => {
    if (activeGroupIdx === null) return;
    const next = activeGroupIdx + delta;
    if (next < 0 || next >= groups.length) {
      setActiveGroupIdx(null);
      return;
    }
    setActiveGroupIdx(next);
    setActiveStoryIdx(0);
    const story = groups[next]?.stories[0];
    if (story && !story.viewed) viewStory.mutate(story.id);
  };

  return (
    <>
      <div className="-mx-2 flex gap-3 overflow-x-auto px-2 pb-2">
        <button type="button" className="group flex w-20 shrink-0 flex-col items-center gap-2 sm:w-24" onClick={() => fileRef.current?.click()}>
          <input ref={fileRef} type="file" accept="image/*,video/*" className="hidden" onChange={(e) => void handleStoryFile(e.target.files?.[0])} />
          <div className="relative h-20 w-20 overflow-hidden rounded-full border border-dashed border-border bg-surface p-[2px] sm:h-24 sm:w-24">
            <div className="h-full w-full overflow-hidden rounded-full bg-background">
              <img src={me?.avatar ?? profileAvatarUrl(null, "vsm")} alt="" className="h-full w-full object-cover opacity-50" />
            </div>
            <span className="absolute inset-0 grid place-items-center">
              {createStory.isPending ? <Loader2 className="h-6 w-6 animate-spin text-vsm-red" /> : (
                <span className="grid h-8 w-8 place-items-center rounded-full bg-vsm-red text-white shadow-glow-red"><Plus className="h-4 w-4" /></span>
              )}
            </span>
          </div>
          <span className="truncate text-[11px] text-muted-foreground">Votre story</span>
        </button>

        {groups.map((g, i) => (
          <StoryGroupThumb key={g.author_id} group={g} meId={me?.id} onOpen={() => openGroup(i)} />
        ))}
      </div>

      {activeGroup && activeStory && (
        <StoryViewer
          story={activeStory}
          group={activeGroup}
          storyIdx={activeStoryIdx}
          meId={me?.id}
          onClose={() => setActiveGroupIdx(null)}
          onPrevStory={() => goStory(activeStoryIdx - 1)}
          onNextStory={() => goStory(activeStoryIdx + 1)}
          onPrevGroup={() => goGroup(-1)}
          onNextGroup={() => goGroup(1)}
          hasPrevStory={activeStoryIdx > 0}
          hasNextStory={activeStoryIdx < activeGroup.stories.length - 1}
        />
      )}
    </>
  );
}

function StoryGroupThumb({ group, meId, onOpen }: { group: StoryGroup; meId?: string; onOpen: () => void }) {
  const { data: author } = useAmbassador(group.author_id);
  const isMe = meId === group.author_id;
  const me = useCurrentAmbassadorPublic();
  const display = isMe && me ? me : author;
  const avatar = display?.avatar ?? profileAvatarUrl(null, display?.name ?? "Ambassadeur");
  const firstName = (display?.name ?? "Ambassadeur").split(" ")[0];
  const latest = group.stories[group.stories.length - 1];
  const ringClass = group.has_unseen
    ? "bg-gradient-to-br from-vsm-red via-vsm-red-glow to-vsm-red"
    : "bg-border";

  return (
    <button onClick={onOpen} className="flex w-20 shrink-0 flex-col items-center gap-2 sm:w-24">
      <div className={`relative h-20 w-20 rounded-full p-[2.5px] sm:h-24 sm:w-24 ${ringClass}`}>
        <div className="h-full w-full overflow-hidden rounded-full border-2 border-background bg-background">
          <img src={avatar} alt="" className="h-full w-full object-cover" />
        </div>
        {latest && latest.media_url.match(/\.(mp4|webm|mov)/i) && (
          <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-vsm-red ring-2 ring-background" />
        )}
      </div>
      <span className="w-full truncate text-center text-[11px] text-muted-foreground">{isMe ? "Votre story" : firstName}</span>
    </button>
  );
}

function StoryViewer({
  story,
  group,
  storyIdx,
  meId,
  onClose,
  onPrevStory,
  onNextStory,
  hasPrevStory,
  hasNextStory,
}: {
  story: Story;
  group: StoryGroup;
  storyIdx: number;
  meId?: string;
  onClose: () => void;
  onPrevStory: () => void;
  onNextStory: () => void;
  onPrevGroup: () => void;
  onNextGroup: () => void;
  hasPrevStory: boolean;
  hasNextStory: boolean;
}) {
  const navigate = useNavigate();
  const { data: author } = useAmbassador(story.author_id);
  const me = useCurrentAmbassadorPublic();
  const { toggleStoryLike, replyToStory } = useSocialMutations();
  const [reply, setReply] = useState("");
  const [panel, setPanel] = useState<"viewers" | "likers" | null>(null);
  const [liked, setLiked] = useState(story.liked ?? false);
  const [likeCount, setLikeCount] = useState(story.like_count ?? 0);
  const isOwner = meId === story.author_id;

  useEffect(() => {
    setLiked(story.liked ?? false);
    setLikeCount(story.like_count ?? 0);
  }, [story.id, story.liked, story.like_count]);

  const { data: likers = [], refetch: refetchLikers } = useQuery({
    queryKey: ["story-likers", story.id],
    queryFn: () => fetchStoryLikers(story.id),
    enabled: isOwner && panel === "likers",
  });

  const { data: viewers = [], refetch: refetchViewers } = useQuery({
    queryKey: ["story-viewers", story.id],
    queryFn: () => fetchStoryViewers(story.id),
    enabled: isOwner && panel === "viewers",
  });

  const viewCount = panel === "viewers" ? Math.max(story.view_count ?? 0, viewers.length) : (story.view_count ?? 0);

  const display = isOwner && me ? me : author;
  const avatar = display?.avatar ?? profileAvatarUrl(null, display?.name ?? "Ambassadeur");
  const name = display?.name ?? "Ambassadeur";
  const isVideo = story.media_url.match(/\.(mp4|webm|mov)/i);

  const handleLike = () => {
    if (isOwner) return;
    const wasLiked = liked;
    setLiked(!wasLiked);
    setLikeCount((c) => (wasLiked ? Math.max(0, c - 1) : c + 1));
    toggleStoryLike.mutate(
      { storyId: story.id, liked: wasLiked },
      {
        onError: () => {
          setLiked(wasLiked);
          setLikeCount(story.like_count ?? 0);
          toast.error("Impossible d'aimer cette story");
        },
      },
    );
  };

  const handleReply = async () => {
    const text = reply.trim();
    if (!text || !meId || isOwner) return;
    const convId = await replyToStory.mutateAsync({ authorId: story.author_id, storyId: story.id, text });
    toast.success("Réponse envoyée");
    onClose();
    navigate({ to: "/messages", search: { conv: convId } });
  };

  const openPanel = (next: "viewers" | "likers") => {
    setPanel((current) => (current === next ? null : next));
    if (next === "viewers") void refetchViewers();
    if (next === "likers") void refetchLikers();
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/90 p-2 backdrop-blur-xl sm:p-4">
      <button
        type="button"
        onClick={onClose}
        className="absolute right-3 top-3 z-[60] grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20"
        aria-label="Fermer"
      >
        <X className="h-5 w-5" />
      </button>

      <div className="relative flex h-[85dvh] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-white/10 sm:aspect-[9/16] sm:h-[80vh] sm:max-h-[700px]">
        {hasPrevStory && (
          <button
            type="button"
            onClick={onPrevStory}
            className="absolute left-0 top-16 z-[5] h-[calc(100%-8rem)] w-1/3"
            aria-label="Story précédente"
          />
        )}
        {hasNextStory && (
          <button
            type="button"
            onClick={onNextStory}
            className="absolute right-0 top-16 z-[5] h-[calc(100%-8rem)] w-1/3"
            aria-label="Story suivante"
          />
        )}

        <div className="absolute inset-x-0 top-0 z-10 flex gap-1 p-2">
          {group.stories.map((s, i) => (
            <div key={s.id} className="h-0.5 flex-1 overflow-hidden rounded-full bg-white/30">
              <div className={`h-full bg-white transition-all ${i < storyIdx ? "w-full" : i === storyIdx ? "w-1/2 animate-pulse" : "w-0"}`} />
            </div>
          ))}
        </div>

        {isVideo ? (
          <video src={story.media_url} controls autoPlay className="h-full w-full object-contain bg-black" />
        ) : (
          <img src={story.media_url} alt="" className="h-full w-full object-contain bg-black" />
        )}

        <div className="absolute inset-x-3 top-6 z-20 flex items-center gap-2 text-white">
          <img src={avatar} alt="" className="h-9 w-9 rounded-full object-cover ring-2 ring-white/20" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{name}</p>
            <p className="text-[10px] uppercase tracking-wider opacity-80">{display?.level ?? "Ambassadeur"}</p>
          </div>
          {!isOwner && (
            <button
              type="button"
              onClick={handleLike}
              disabled={toggleStoryLike.isPending}
              className={`relative z-30 grid h-9 w-9 place-items-center rounded-full ${liked ? "bg-vsm-red text-white" : "bg-white/10"}`}
            >
              <Heart className={`h-4 w-4 ${liked ? "fill-current" : ""}`} />
            </button>
          )}
        </div>

        {isOwner && (
          <div className="absolute inset-x-3 bottom-3 z-20 space-y-2">
            <div className="flex justify-center gap-3 rounded-lg bg-black/50 px-3 py-2 text-xs text-white backdrop-blur">
              <button type="button" onClick={() => openPanel("viewers")} className="inline-flex items-center gap-1 hover:underline">
                <Eye className="h-3.5 w-3.5" /> {viewCount} vues
              </button>
              <button type="button" onClick={() => openPanel("likers")} className="inline-flex items-center gap-1 hover:underline">
                <Heart className="h-3.5 w-3.5" /> {Math.max(likeCount, likers.length)} likes
              </button>
            </div>
            {panel === "viewers" && (
              <StoryPeopleList title="Vu par" people={viewers} onClose={() => setPanel(null)} />
            )}
            {panel === "likers" && (
              <StoryPeopleList title="Aimé par" people={likers} onClose={() => setPanel(null)} />
            )}
          </div>
        )}

        {story.caption && (
          <p className="absolute inset-x-3 bottom-24 z-20 rounded-lg bg-black/60 px-3 py-2 text-center text-sm text-white backdrop-blur">{story.caption}</p>
        )}

        {!isOwner && (
          <div className="absolute inset-x-0 bottom-0 z-20 flex items-center gap-2 border-t border-white/10 bg-black/70 p-3 backdrop-blur">
            <input
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder="Répondre à la story…"
              className="h-10 flex-1 rounded-full border border-white/20 bg-white/10 px-4 text-sm text-white outline-none placeholder:text-white/50"
              onKeyDown={(e) => e.key === "Enter" && void handleReply()}
            />
            <button type="button" onClick={() => void handleReply()} disabled={!reply.trim()} className="grid h-10 w-10 place-items-center rounded-full bg-vsm-red text-white disabled:opacity-40">
              <Send className="h-4 w-4" />
            </button>
          </div>
        )}

        {hasPrevStory && (
          <button type="button" onClick={onPrevStory} className="absolute left-2 top-1/2 z-30 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white">
            <ChevronLeft className="h-6 w-6" />
          </button>
        )}
        {hasNextStory && (
          <button type="button" onClick={onNextStory} className="absolute right-2 top-1/2 z-30 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white">
            <ChevronRight className="h-6 w-6" />
          </button>
        )}
      </div>
    </div>
  );
}

function StoryPeopleList({
  title,
  people,
  onClose,
}: {
  title: string;
  people: { id: string; name: string; avatar?: string }[];
  onClose: () => void;
}) {
  return (
    <div className="max-h-40 overflow-y-auto rounded-xl bg-black/80 p-3 text-xs text-white backdrop-blur">
      <div className="mb-2 flex items-center justify-between">
        <p className="font-semibold">{title}</p>
        <button type="button" onClick={onClose} className="text-white/70 hover:text-white"><X className="h-3.5 w-3.5" /></button>
      </div>
      {people.length === 0 ? (
        <p className="text-white/60">Personne pour le moment.</p>
      ) : (
        <ul className="space-y-2">
          {people.map((u) => (
            <li key={u.id} className="flex items-center gap-2">
              <img src={u.avatar ?? profileAvatarUrl(null, u.name)} alt="" className="h-6 w-6 rounded-full object-cover" />
              <span>{u.name}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
