import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Lock, Globe2, Users } from "lucide-react";
import { groups, posts } from "@/lib/social-data";
import { PostCard } from "@/components/post-card";

export const Route = createFileRoute("/_app/communaute/groupes/$id")({
  loader: ({ params }) => {
    const g = groups.find((x) => x.id === params.id);
    if (!g) throw notFound();
    return { group: g };
  },
  notFoundComponent: () => <p className="p-8 text-center text-muted-foreground">Groupe introuvable.</p>,
  errorComponent: () => <p className="p-8 text-center text-muted-foreground">Erreur de chargement.</p>,
  component: GroupPage,
});

function GroupPage() {
  const { group } = Route.useLoaderData();
  const groupPosts = posts.filter((p) => p.group_id === group.id).slice(0, 10);
  const fallback = groupPosts.length > 0 ? groupPosts : posts.slice(0, 6);
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
            <button className="rounded-lg bg-vsm-red px-4 py-2 text-xs font-bold uppercase tracking-wider shadow-glow-red">{group.joined ? "Membre" : "Rejoindre"}</button>
          </div>
        </div>
        <div className="flex items-center gap-4 border-t border-border px-5 py-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">{group.privacy === "private" ? <Lock className="h-3.5 w-3.5" /> : <Globe2 className="h-3.5 w-3.5" />} {group.privacy}</span>
          <span className="inline-flex items-center gap-1.5"><Users className="h-3.5 w-3.5" /> {group.members} membres</span>
          <span>{group.posts} publications</span>
        </div>
      </div>

      <div className="space-y-5">
        {fallback.map((p) => <PostCard key={p.id} post={p} />)}
      </div>
    </div>
  );
}
