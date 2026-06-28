import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import { useIsBrowser } from "@/hooks/use-is-browser";
import { useSocialMutations } from "@/hooks/use-social";
import { fetchPosts } from "@/services/social.service";
import { PostCard } from "@/components/post-card";

export const Route = createFileRoute("/_staff/staff/moderation")({
  ssr: false,
  component: StaffModerationPage,
});

function StaffModerationPage() {
  const { session } = useAuth();
  const browser = useIsBrowser();
  const userId = session?.user?.id;
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["staff-moderation-posts", userId],
    queryFn: () => fetchPosts(userId, 60),
    enabled: browser && !!userId,
  });
  const { deletePost } = useSocialMutations();

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header>
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-vsm-red">Modération</p>
        <h1 className="font-display text-3xl font-bold uppercase tracking-wide">Publications</h1>
        <p className="mt-1 text-sm text-muted-foreground">{posts.length} publications récentes</p>
      </header>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Chargement…</p>
      ) : (
        <div className="space-y-4">
          {posts.slice(0, 20).map((p) => (
            <div key={p.id} className="relative">
              <PostCard post={p} />
              <button
                type="button"
                onClick={() => void deletePost.mutateAsync(p.id)}
                className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-md bg-destructive/90 px-2 py-1 text-[10px] font-bold uppercase text-white"
              >
                <Trash2 className="h-3 w-3" /> Supprimer
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
