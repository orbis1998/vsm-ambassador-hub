import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, MapPin, Users as UsersIcon, Loader2 } from "lucide-react";
import { PostCard } from "@/components/post-card";
import { useAmbassador, useAuthorPosts, useIsFollowing, useSocialMutations, useFollowStats } from "@/hooks/use-social";
import { useAuth } from "@/providers/auth-provider";
import { profileAvatarUrl } from "@/lib/program-tier";

export const Route = createFileRoute("/_app/ambassadeur/$id")({
  component: AmbassadorPage,
});

function AmbassadorPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { data: ambassador, isLoading } = useAmbassador(id);
  const { data: userPosts = [], isLoading: postsLoading } = useAuthorPosts(id);
  const { data: following = false } = useIsFollowing(id);
  const { toggleFollow } = useSocialMutations();
  const { data: followStats } = useFollowStats(id);

  const isSelf = profile?.id === id;

  if (isLoading) {
    return (
      <div className="grid min-h-[40vh] place-items-center">
        <Loader2 className="h-8 w-8 animate-spin text-vsm-red" />
      </div>
    );
  }

  if (!ambassador) {
    return <p className="p-8 text-center text-muted-foreground">Ambassadeur introuvable.</p>;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <Link to="/communaute" className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground hover:text-vsm-red">
        <ArrowLeft className="h-3 w-3" /> Communauté
      </Link>
      <div className="overflow-hidden rounded-2xl border border-border bg-surface">
        <div className="relative h-36 sm:h-40">
          {ambassador.cover ? (
            <img src={ambassador.cover} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-muted/80 to-muted/40" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent pointer-events-none" />
        </div>
        <div className="relative px-5 pb-5">
          <img
            src={ambassador.avatar || profileAvatarUrl(null, ambassador.name)}
            alt=""
            className="relative z-10 -mt-10 h-20 w-20 rounded-2xl border-4 border-surface bg-background object-cover shadow-md"
          />
          <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-vsm-red">{ambassador.badge}</p>
              <h1 className="font-display text-2xl font-bold uppercase tracking-wide">{ambassador.name}</h1>
              <p className="text-sm text-muted-foreground">@{ambassador.handle}</p>
              <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                {ambassador.country && (
                  <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {ambassador.country}</span>
                )}
                <span className="inline-flex items-center gap-1"><UsersIcon className="h-3.5 w-3.5" /> {followStats?.followers ?? 0} abonnés</span>
                <span className="inline-flex items-center gap-1"><UsersIcon className="h-3.5 w-3.5" /> {followStats?.following ?? 0} abonnements</span>
                <span className="rounded-full bg-vsm-red/15 px-2 py-0.5 text-[10px] font-bold uppercase text-vsm-red">{ambassador.level}</span>
              </div>
            </div>
            {!isSelf && (
              <div className="flex gap-2">
                <button
                  disabled={toggleFollow.isPending}
                  onClick={() => toggleFollow.mutate({ targetId: id, isFollowing: following })}
                  className={`rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-wider disabled:opacity-50 ${following ? "border border-border" : "bg-vsm-red text-white shadow-glow-red"}`}
                >
                  {following ? "Suivi ✓" : "Suivre"}
                </button>
                <button
                  type="button"
                  onClick={() => navigate({ to: "/messages", search: { with: id } })}
                  className="rounded-lg border border-border px-4 py-2 text-xs font-bold uppercase tracking-wider hover:border-vsm-red hover:text-vsm-red"
                >
                  Message
                </button>
              </div>
            )}
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3 text-center">
            <Stat label="XP" value={ambassador.xp.toLocaleString()} />
            <Stat label="Points" value={ambassador.points.toLocaleString()} />
            <Stat label="Niveau" value={ambassador.level} />
          </div>
        </div>
      </div>

      <div className="space-y-5">
        {postsLoading ? (
          <div className="grid place-items-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-vsm-red" />
          </div>
        ) : userPosts.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border bg-surface p-8 text-center text-sm text-muted-foreground">
            Aucune publication pour le moment.
          </p>
        ) : (
          userPosts.map((p) => <PostCard key={p.id} post={p} />)
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl bg-background p-3">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-0.5 font-display text-base font-bold">{value}</p>
    </div>
  );
}
