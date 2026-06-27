import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, MapPin, Users as UsersIcon } from "lucide-react";
import { ambassadors, currentUser } from "@/lib/mock-data";
import { posts } from "@/lib/social-data";
import { PostCard } from "@/components/post-card";
import { useSocialStore } from "@/lib/social-store";

export const Route = createFileRoute("/_app/ambassadeur/$id")({
  loader: ({ params }) => {
    const a = params.id === currentUser.id ? currentUser : ambassadors.find((x) => x.id === params.id);
    if (!a) throw notFound();
    return { ambassador: a };
  },
  notFoundComponent: () => <p className="p-8 text-center text-muted-foreground">Ambassadeur introuvable.</p>,
  errorComponent: () => <p className="p-8 text-center text-muted-foreground">Erreur.</p>,
  component: AmbassadorPage,
});

function AmbassadorPage() {
  const { ambassador } = Route.useLoaderData();
  const { state, toggleFollow } = useSocialStore();
  const following = state.follows.includes(ambassador.id);
  const userPosts = posts.filter((p) => p.author_id === ambassador.id).slice(0, 6);
  const fallback = userPosts.length > 0 ? userPosts : posts.slice(0, 3);

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <Link to="/communaute" className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground hover:text-vsm-red">
        <ArrowLeft className="h-3 w-3" /> Communauté
      </Link>
      <div className="overflow-hidden rounded-2xl border border-border bg-surface">
        <div className="relative h-40">
          <img src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1400&q=70" alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        </div>
        <div className="px-5 pb-5">
          <img src={ambassador.avatar} alt="" className="-mt-10 h-20 w-20 rounded-2xl border-4 border-surface bg-background" />
          <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-vsm-red">{ambassador.badge}</p>
              <h1 className="font-display text-2xl font-bold uppercase tracking-wide">{ambassador.name}</h1>
              <p className="text-sm text-muted-foreground">@{ambassador.handle}</p>
              <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {ambassador.country}</span>
                <span className="inline-flex items-center gap-1"><UsersIcon className="h-3.5 w-3.5" /> {(ambassador.xp / 4).toFixed(0)} followers</span>
                <span className="rounded-full bg-vsm-red/15 px-2 py-0.5 text-[10px] font-bold uppercase text-vsm-red">{ambassador.level}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => toggleFollow(ambassador.id)}
                className={`rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-wider ${following ? "border border-border" : "bg-vsm-red text-white shadow-glow-red"}`}
              >
                {following ? "Suivi ✓" : "Suivre"}
              </button>
              <button className="rounded-lg border border-border px-4 py-2 text-xs font-bold uppercase tracking-wider hover:border-vsm-red hover:text-vsm-red">Message</button>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3 text-center">
            <Stat label="XP" value={ambassador.xp.toLocaleString()} />
            <Stat label="Points" value={ambassador.points.toLocaleString()} />
            <Stat label="Niveau" value={ambassador.level} />
          </div>
        </div>
      </div>

      <div className="space-y-5">
        {fallback.map((p) => <PostCard key={p.id} post={p} />)}
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
