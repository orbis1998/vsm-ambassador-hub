import { createFileRoute, Link } from "@tanstack/react-router";

import { useState } from "react";

import { Users as UsersIcon, Sparkles, Loader2 } from "lucide-react";

import { useGroups, usePosts, useSuggestedAmbassadors, type FeedTab } from "@/hooks/use-social";

import { StoryRail } from "@/components/story-rail";

import { PostCard } from "@/components/post-card";

import { PostComposer } from "@/components/post-composer";

import { profileAvatarUrl } from "@/lib/program-tier";



export const Route = createFileRoute("/_app/communaute")({

  component: CommunityPage,

});



function CommunityPage() {

  const [tab, setTab] = useState<FeedTab>("all");

  const [query, setQuery] = useState("");

  const { data: filtered = [], isLoading } = usePosts(tab, query);

  const { data: groups = [] } = useGroups();

  const { data: suggested = [] } = useSuggestedAmbassadors(6);



  return (

    <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[1fr_320px]">

      <div className="min-w-0 space-y-6">

        <header className="flex flex-wrap items-end justify-between gap-3">

          <div>

            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-vsm-red">Espace ambassadeurs</p>

            <h1 className="font-display text-3xl font-bold uppercase tracking-wide md:text-4xl">Communauté</h1>

            <p className="mt-1 text-sm text-muted-foreground">Le fil privé des ambassadeurs VSM. Partage, apprends, élève.</p>

          </div>

          <input

            value={query}

            onChange={(e) => setQuery(e.target.value)}

            placeholder="Rechercher dans le fil…"

            className="h-10 w-60 rounded-lg border border-border bg-surface px-3 text-sm outline-none focus:border-vsm-red/50"

          />

        </header>



        <StoryRail />

        <PostComposer />



        <div className="flex items-center gap-1 rounded-xl border border-border bg-surface p-1 text-sm">

          {(

            [

              { k: "all", label: "Tout" },

              { k: "following", label: "Suivis" },

              { k: "trending", label: "Tendances" },

              { k: "mine", label: "Mes posts" },

            ] as const

          ).map((t) => (

            <button

              key={t.k}

              onClick={() => setTab(t.k)}

              className={`flex-1 rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-wider transition-colors ${tab === t.k ? "bg-vsm-red text-white shadow-glow-red" : "text-muted-foreground hover:text-foreground"}`}

            >

              {t.label}

            </button>

          ))}

        </div>



        <div className="space-y-5">

          {isLoading ? (

            <div className="grid place-items-center py-16">

              <Loader2 className="h-8 w-8 animate-spin text-vsm-red" />

            </div>

          ) : filtered.length === 0 ? (

            <div className="rounded-2xl border border-dashed border-border bg-surface p-12 text-center text-sm text-muted-foreground">

              Aucune publication pour le moment. Soyez le premier à publier !

            </div>

          ) : (

            filtered.map((p) => <PostCard key={p.id} post={p} />)

          )}

        </div>

      </div>



      <aside className="hidden space-y-5 lg:block">

        <div className="rounded-2xl border border-border bg-surface p-4">

          <div className="flex items-center justify-between">

            <h3 className="font-display text-sm font-bold uppercase tracking-wider">Groupes</h3>

            <Link to="/communaute/groupes" className="text-[11px] uppercase tracking-wider text-vsm-red hover:underline">Voir tout</Link>

          </div>

          <ul className="mt-3 space-y-2">

            {groups.slice(0, 5).map((g) => (

              <li key={g.id}>

                <Link to="/communaute/groupes/$id" params={{ id: g.id }} className="flex items-center gap-3 rounded-lg p-2 hover:bg-accent">

                  <img src={g.cover} alt="" className="h-10 w-10 rounded-lg object-cover" />

                  <div className="min-w-0 flex-1">

                    <p className="truncate text-sm font-semibold">{g.name}</p>

                    <p className="text-[11px] text-muted-foreground">{g.members} membres</p>

                  </div>

                  <UsersIcon className="h-4 w-4 text-vsm-red" />

                </Link>

              </li>

            ))}

            {groups.length === 0 && (

              <li className="py-4 text-center text-xs text-muted-foreground">Aucun groupe pour le moment.</li>

            )}

          </ul>

        </div>



        <div className="rounded-2xl border border-border bg-surface p-4">

          <h3 className="flex items-center gap-2 font-display text-sm font-bold uppercase tracking-wider">

            <Sparkles className="h-4 w-4 text-vsm-red" /> Ambassadeurs à suivre

          </h3>

          <ul className="mt-3 space-y-2">

            {suggested.map((a) => (

              <li key={a.id} className="flex items-center gap-3">

                <img

                  src={a.avatar || profileAvatarUrl(null, a.name)}

                  alt=""

                  className="h-9 w-9 rounded-lg bg-background object-cover"

                />

                <div className="min-w-0 flex-1">

                  <Link to="/ambassadeur/$id" params={{ id: a.id }} className="truncate text-sm font-semibold hover:text-vsm-red">{a.name}</Link>

                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{a.level}</p>

                </div>

                <Link

                  to="/ambassadeur/$id"

                  params={{ id: a.id }}

                  className="rounded-md border border-vsm-red px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-vsm-red hover:bg-vsm-red hover:text-white"

                >

                  Voir

                </Link>

              </li>

            ))}

            {suggested.length === 0 && (

              <li className="py-4 text-center text-xs text-muted-foreground">Aucun ambassadeur suggéré.</li>

            )}

          </ul>

        </div>

      </aside>

    </div>

  );

}

