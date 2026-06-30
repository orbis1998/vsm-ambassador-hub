import { useQuery } from "@tanstack/react-query";
import { X, Heart, Eye, Loader2 } from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import { useAmbassador } from "@/hooks/use-social";
import { fetchStoryById, fetchStoryLikers } from "@/services/social.service";
import { profileAvatarUrl } from "@/lib/program-tier";

type Props = {
  storyId: string;
  onClose: () => void;
};

export function StoryViewerModal({ storyId, onClose }: Props) {
  const { profile } = useAuth();
  const meId = profile?.userId;
  const { data: story, isLoading } = useQuery({
    queryKey: ["story-modal", storyId],
    queryFn: () => fetchStoryById(storyId),
  });
  const { data: author } = useAmbassador(story?.author_id);
  const { data: likers = [] } = useQuery({
    queryKey: ["story-likers", storyId],
    queryFn: () => fetchStoryLikers(storyId),
    enabled: !!story && meId === story.author_id,
  });

  if (isLoading || !story) {
    return (
      <div className="fixed inset-0 z-50 grid place-items-center bg-black/90">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    );
  }

  const isVideo = story.media_url.match(/\.(mp4|webm|mov)/i);
  const name = author?.name ?? "Ambassadeur";
  const avatar = author?.avatar ?? profileAvatarUrl(null, name);
  const isOwner = meId === story.author_id;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/90 p-2 backdrop-blur-xl sm:p-4">
      <button type="button" onClick={onClose} className="absolute right-3 top-3 z-[60] grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20" aria-label="Fermer">
        <X className="h-5 w-5" />
      </button>

      <div className="relative flex h-[85dvh] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-white/10 bg-black sm:aspect-[9/16] sm:h-[80vh] sm:max-h-[700px]">
        {isVideo ? (
          <video src={story.media_url} controls autoPlay className="h-full w-full object-contain" />
        ) : (
          <img src={story.media_url} alt="" className="h-full w-full object-contain" />
        )}

        <div className="absolute inset-x-3 top-3 flex items-center gap-2 text-white">
          <img src={avatar} alt="" className="h-9 w-9 rounded-lg object-cover" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{name}</p>
            <p className="text-[10px] uppercase tracking-wider opacity-80">{author?.level ?? "Ambassadeur"}</p>
          </div>
        </div>

        {isOwner && (
          <div className="absolute inset-x-3 bottom-3 space-y-2">
            <div className="flex justify-center gap-4 rounded-lg bg-black/50 px-3 py-2 text-xs text-white backdrop-blur">
              <span className="inline-flex items-center gap-1"><Eye className="h-3.5 w-3.5" /> {story.view_count ?? 0} vues</span>
              <span className="inline-flex items-center gap-1"><Heart className="h-3.5 w-3.5" /> {story.like_count ?? 0}</span>
            </div>
            {likers.length > 0 && (
              <div className="max-h-28 overflow-y-auto rounded-lg bg-black/60 p-2 text-xs text-white backdrop-blur">
                <p className="mb-1 font-semibold">Aimé par</p>
                <ul className="space-y-1">
                  {likers.map((u) => (
                    <li key={u.id} className="flex items-center gap-2">
                      <img src={u.avatar ?? profileAvatarUrl(null, u.name)} alt="" className="h-5 w-5 rounded-md object-cover" />
                      <span>{u.name}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {story.caption && (
          <p className="absolute inset-x-3 bottom-24 rounded-lg bg-black/60 px-3 py-2 text-center text-sm text-white backdrop-blur sm:bottom-28">{story.caption}</p>
        )}
      </div>
    </div>
  );
}
