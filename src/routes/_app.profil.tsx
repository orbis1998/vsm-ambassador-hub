import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { MapPin, Calendar, Award, Star, Users as UsersIcon, Activity } from "lucide-react";
import { currentUser, stats, certificates, activity, ambassadors } from "@/lib/mock-data";
import { posts } from "@/lib/social-data";

export const Route = createFileRoute("/_app/profil")({
  component: ProfilePage,
});

type Tab = "posts" | "certificats" | "badges" | "objectifs" | "activite";

function ProfilePage() {
  const [tab, setTab] = useState<Tab>("posts");
  const mine = posts.filter((p) => p.author_id === currentUser.id).slice(0, 9);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="overflow-hidden rounded-2xl border border-border bg-surface">
        <div className="relative h-44 md:h-56">
          <img src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600&q=70" alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        </div>
        <div className="relative px-6 pb-6">
          <img src={currentUser.avatar} alt="" className="-mt-12 h-24 w-24 rounded-2xl border-4 border-surface bg-background" />
          <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-vsm-red">{currentUser.badge}</p>
              <h1 className="font-display text-3xl font-bold uppercase tracking-wide">{currentUser.name}</h1>
              <p className="text-sm text-muted-foreground">@{currentUser.handle}</p>
              <p className="mt-2 max-w-xl text-sm">Ambassadeur VSM · Storytelling cinématique · Streetwear premium. Bâtir la nouvelle vague de créateurs francophones.</p>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {currentUser.country}</span>
                <span className="inline-flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> Promo 2024</span>
                <span className="inline-flex items-center gap-1"><UsersIcon className="h-3.5 w-3.5" /> 1 248 followers</span>
                <span>· 312 abonnements</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Link to="/parametres" className="rounded-lg border border-border px-3 py-2 text-xs font-bold uppercase tracking-wider hover:border-vsm-red hover:text-vsm-red">Modifier le profil</Link>
              <button className="rounded-lg bg-vsm-red px-4 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-glow-red">Partager</button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {[
          { label: "Niveau", value: currentUser.level },
          { label: "XP", value: stats.xp.toLocaleString() },
          { label: "Points", value: stats.points.toLocaleString() },
          { label: "Cours", value: stats.completedCourses },
          { label: "Certificats", value: stats.certificates },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-surface p-3 text-center">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">{s.label}</p>
            <p className="mt-1 font-display text-xl font-bold">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-1 rounded-xl border border-border bg-surface p-1 text-xs">
        {(["posts","certificats","badges","objectifs","activite"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 rounded-lg px-3 py-2 font-semibold uppercase tracking-wider ${tab === t ? "bg-vsm-red text-white shadow-glow-red" : "text-muted-foreground hover:text-foreground"}`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "posts" && (
        <div className="grid gap-2 sm:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="relative aspect-square overflow-hidden rounded-xl border border-border bg-surface">
              <img src={mine[i % mine.length]?.media[0]?.url ?? `https://images.unsplash.com/photo-1521577352947-9bb58764b69a?w=600`} alt="" className="h-full w-full object-cover transition-transform hover:scale-105" />
            </div>
          ))}
        </div>
      )}

      {tab === "certificats" && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {certificates.slice(0, 9).map((c) => (
            <div key={c.id} className="rounded-xl border border-border bg-surface p-4">
              <Award className="h-6 w-6 text-vsm-red" />
              <p className="mt-2 font-display text-sm font-bold uppercase">{c.title}</p>
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{c.serial} · {c.issuedAt}</p>
            </div>
          ))}
        </div>
      )}

      {tab === "badges" && (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
          {["Pionnier","Créateur","Storyteller","Top 10","Mentor","Closer","Visionnaire","100 jours","Inspirateur","Influenceur","Premium","Loyal"].map((b, i) => (
            <div key={b} className="rounded-xl border border-border bg-surface p-3 text-center">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-vsm-red to-vsm-red-glow text-white">
                <Star className="h-6 w-6" />
              </div>
              <p className="mt-2 text-[11px] font-semibold uppercase tracking-wider">{b}</p>
            </div>
          ))}
        </div>
      )}

      {tab === "objectifs" && (
        <ul className="space-y-3">
          {[
            ["Atteindre le rang Platinum", 68],
            ["Terminer 3 parcours ce trimestre", 45],
            ["Publier 12 reels VSM", 75],
            ["Inviter 5 nouveaux ambassadeurs", 40],
          ].map(([t, p]) => (
            <li key={String(t)} className="rounded-xl border border-border bg-surface p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">{t}</p>
                <span className="font-display text-base font-bold text-vsm-red">{p}%</span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-background">
                <div className="h-full rounded-full bg-vsm-red" style={{ width: `${p}%` }} />
              </div>
            </li>
          ))}
        </ul>
      )}

      {tab === "activite" && (
        <ul className="space-y-2">
          {activity.map((a) => (
            <li key={a.id} className="flex items-center gap-3 rounded-xl border border-border bg-surface p-3">
              <span className="text-xl">{a.emoji}</span>
              <p className="flex-1 text-sm">{a.text}</p>
              <span className="text-[11px] uppercase tracking-wider text-muted-foreground">{a.time}</span>
            </li>
          ))}
        </ul>
      )}

      <p className="text-center text-[11px] text-muted-foreground inline-flex items-center gap-1 justify-center w-full"><Activity className="h-3 w-3" /> Données synchronisées en local — prêtes pour Supabase.</p>
      {/* keep ambassadors import used */}
      <span className="hidden">{ambassadors.length}</span>
    </div>
  );
}
