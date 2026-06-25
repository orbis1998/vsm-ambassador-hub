import { createFileRoute } from "@tanstack/react-router";
import { User } from "lucide-react";
import { currentUser, stats } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/profil")({
  component: ProfilePage,
});

function ProfilePage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="relative overflow-hidden rounded-2xl border border-border bg-surface p-6 md:p-8">
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-vsm-red/15 blur-3xl" />
        <div className="relative flex flex-col items-center gap-5 text-center md:flex-row md:text-left">
          <img src={currentUser.avatar} alt="" className="h-28 w-28 rounded-2xl border border-border bg-background" />
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-vsm-red">{currentUser.badge}</p>
            <h1 className="mt-1 font-display text-3xl font-bold uppercase tracking-wide md:text-4xl">{currentUser.name}</h1>
            <p className="mt-1 text-sm text-muted-foreground">@{currentUser.handle} · {currentUser.country}</p>
            <div className="mt-4 flex flex-wrap justify-center gap-2 md:justify-start">
              <span className="rounded-full bg-vsm-red/15 px-3 py-1 text-xs font-semibold text-vsm-red">{currentUser.level}</span>
              <span className="rounded-full border border-border px-3 py-1 text-xs">{stats.xp.toLocaleString()} XP</span>
              <span className="rounded-full border border-border px-3 py-1 text-xs">{stats.certificates} certificats</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Progression", value: `${stats.progress}%` },
          { label: "Points", value: stats.points.toLocaleString() },
          { label: "Cours terminés", value: stats.completedCourses },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-surface p-4 text-center">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">{s.label}</p>
            <p className="mt-1 font-display text-3xl font-bold">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-surface p-6 text-sm text-muted-foreground">
        <div className="mb-3 flex items-center gap-2 text-foreground">
          <User className="h-4 w-4 text-vsm-red" />
          <h2 className="font-display text-base font-bold uppercase tracking-wider">À propos</h2>
        </div>
        <p>
          Ambassadeur VSM depuis 2024 · Spécialisé contenu cinématique & storytelling.
          Profil détaillé, biographie, réseaux sociaux et historique des campagnes seront ajoutés
          dans la prochaine itération.
        </p>
      </div>
    </div>
  );
}
