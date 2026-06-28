import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Lock, Globe2, Users, Loader2 } from "lucide-react";
import { PostCard } from "@/components/post-card";
import { useGroup, useGroupPosts, useSocialMutations } from "@/hooks/use-social";

export const Route = createFileRoute("/_app/communaute/groupes/$id")({
  component: GroupPage,
});

function GroupPage() {
  const { id } = Route.useParams();
  const { data: group, isLoading: groupLoading } = useGroup(id);
  const { data: groupPosts = [], isLoading: postsLoading } = useGroupPosts(id);
  const { toggleGroup } = useSocialMutations();

  if (groupLoading) {
    return (
      <div className="grid min-h-[40vh] place-items-center">
        <Loader2 className="h-8 w-8 animate-spin text-vsm-red" />
      </div>
    );
  }

  if (!group) {
    return <p className="p-8 text-center text-muted-foreground">Groupe introuvable.</p>;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <Link to="/communaute/groupes" className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground hover:text-vsm-red">
        <ArrowLeft className="h-3 w-3" /> Tous les groupes
      </Link>
      <div className="overflow-hidden rounded-2xl border border-border bg-surface">
        <div className="relative aspect-[3/1] overflow-hidden">
          <img src={group.cover} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
          <div className="absolute inset-x-5 bottom-4 flex items-end justify-between text-white">
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-white/80">{group.category}</p>
              <h1 className="font-display text-3xl font-bold uppercase tracking-wide">{group.name}</h1>
              <p className="mt-1 text-xs text-white/80">{group.description}</p>
            </div>
            <button
              disabled={toggleGroup.isPending}
              onClick={() => toggleGroup.mutate({ groupId: group.id, joined: group.joined })}
              className="rounded-lg bg-vsm-red px-4 py-2 text-xs font-bold uppercase tracking-wider shadow-glow-red disabled:opacity-50"
            >
              {group.joined ? "Quitter" : "Rejoindre"}
            </button>
          </div>
        </div>
        <div className="flex items-center gap-4 border-t border-border px-5 py-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">{group.privacy === "private" ? <Lock className="h-3.5 w-3.5" /> : <Globe2 className="h-3.5 w-3.5" />} {group.privacy}</span>
          <span className="inline-flex items-center gap-1.5"><Users className="h-3.5 w-3.5" /> {group.members} membres</span>
          <span>{group.posts} publications</span>
        </div>
      </div>

      <div className="space-y-5">
        {postsLoading ? (
          <div className="grid place-items-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-vsm-red" />
          </div>
        ) : groupPosts.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border bg-surface p-8 text-center text-sm text-muted-foreground">
            Aucune publication dans ce groupe.
          </p>
        ) : (
          groupPosts.map((p) => <PostCard key={p.id} post={p} />)
        )}
      </div>
    </div>
  );
}
