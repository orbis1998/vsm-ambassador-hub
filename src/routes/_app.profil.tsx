import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { MapPin, Award, Loader2, Mail, Phone, Camera, Pencil, Users, Bookmark, BookOpen } from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import { profileAvatarUrl } from "@/lib/program-tier";
import { useAuthorPosts, useFollowStats, useSavedPosts } from "@/hooks/use-social";
import { useCertificates } from "@/hooks/use-certificates";
import { useUserBadges } from "@/hooks/use-gamification";
import { PostCard } from "@/components/post-card";
import { useProfileEdit } from "@/hooks/use-profile-edit";
import { ImageCropDialog } from "@/components/image-crop-dialog";
import { useAcademyProgress, useCourseSummaries } from "@/hooks/use-academy";

export const Route = createFileRoute("/_app/profil")({
  component: ProfilePage,
});

type Tab = "posts" | "favoris" | "certificats" | "badges" | "activite";

const DEFAULT_COVER = null;

function ProfilePage() {
  const { profile, loading } = useAuth();
  const [tab, setTab] = useState<Tab>("posts");
  const [editing, setEditing] = useState(false);
  const [bio, setBio] = useState("");
  const [country, setCountry] = useState("");
  const { data: posts = [] } = useAuthorPosts(profile?.userId);
  const { data: savedPosts = [] } = useSavedPosts(profile?.userId);
  const { data: academyProgress } = useAcademyProgress();
  const { data: allCourses = [] } = useCourseSummaries();
  const favCourses = (academyProgress?.favorites ?? [])
    .map((id) => allCourses.find((c) => c.id === id))
    .filter((c): c is NonNullable<typeof c> => Boolean(c));
  const { data: certs = [] } = useCertificates();
  const { data: badges = [] } = useUserBadges();
  const { update, uploadAvatar, uploadCover } = useProfileEdit();
  const { data: followStats } = useFollowStats(profile?.userId);
  const avatarRef = useRef<HTMLInputElement>(null);
  const coverRef = useRef<HTMLInputElement>(null);
  const [cropFile, setCropFile] = useState<File | null>(null);
  const [cropKind, setCropKind] = useState<"avatar" | "cover" | null>(null);

  if (loading) {
    return (
      <div className="grid min-h-[40vh] place-items-center">
        <Loader2 className="h-8 w-8 animate-spin text-vsm-red" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-surface p-10 text-center text-sm text-muted-foreground">
        Profil Programme introuvable.
      </div>
    );
  }

  const avatar = profile.avatar || profileAvatarUrl(null, profile.email ?? profile.name);
  const cover = profile.cover || DEFAULT_COVER;

  const startEdit = () => {
    setBio(profile.bio ?? "");
    setCountry(profile.country ?? "");
    setEditing(true);
  };

  const saveEdit = async () => {
    await update.mutateAsync({ bio, country });
    setEditing(false);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="overflow-hidden rounded-2xl border border-border bg-surface">
        <div className="group relative h-32 md:h-44">
          {cover ? (
            <img src={cover} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-muted/80 to-muted/40">
              <Camera className="h-8 w-8 text-muted-foreground/60" />
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Ajouter une couverture</p>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
          <button
            type="button"
            onClick={() => coverRef.current?.click()}
            className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-lg bg-black/50 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white opacity-100 md:opacity-0 md:transition-opacity md:group-hover:opacity-100"
          >
            <Camera className="h-3 w-3" /> Appuyer pour changer
          </button>
          <input ref={coverRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) { setCropFile(f); setCropKind("cover"); } e.target.value = ""; }} />
        </div>
        <div className="relative px-6 pb-6">
          <div className="group relative z-10 -mt-12 inline-block">
            <img src={avatar} alt="" className="relative z-10 h-24 w-24 rounded-2xl border-4 border-surface bg-background object-cover shadow-md" />
            <button
              type="button"
              onClick={() => avatarRef.current?.click()}
              className="absolute inset-0 grid place-items-center rounded-2xl bg-black/40 opacity-100 md:opacity-0 md:transition-opacity md:group-hover:opacity-100"
            >
              <span className="flex flex-col items-center gap-1 text-white">
                <Camera className="h-6 w-6" />
                <span className="text-[9px] font-bold uppercase tracking-wider md:hidden">Changer</span>
              </span>
            </button>
            <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) { setCropFile(f); setCropKind("avatar"); } e.target.value = ""; }} />
          </div>
          <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-vsm-red">{profile.badge || "—"}</p>
              <h1 className="font-display text-3xl font-bold uppercase tracking-wide">{profile.name}</h1>
              <p className="text-sm text-muted-foreground">@{profile.handle}</p>
              <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {followStats?.followers ?? 0} abonnés</span>
                <span className="inline-flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {followStats?.following ?? 0} abonnements</span>
                <span className="rounded-full bg-vsm-red/15 px-2 py-0.5 text-[10px] font-bold uppercase text-vsm-red">{profile.level}</span>
              </div>
              {editing ? (
                <div className="mt-3 space-y-2 max-w-xl">
                  <textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Votre bio…" className="min-h-[80px] w-full rounded-lg border border-border bg-background p-3 text-sm outline-none focus:border-vsm-red/50" />
                  <input value={country} onChange={(e) => setCountry(e.target.value)} placeholder="Pays" className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-vsm-red/50" />
                  <div className="flex gap-2">
                    <button onClick={() => void saveEdit()} disabled={update.isPending} className="rounded-lg bg-vsm-red px-3 py-2 text-xs font-bold uppercase text-white">Enregistrer</button>
                    <button onClick={() => setEditing(false)} className="rounded-lg border border-border px-3 py-2 text-xs font-bold uppercase">Annuler</button>
                  </div>
                </div>
              ) : (
                <>
                  {profile.bio ? <p className="mt-2 max-w-xl text-sm text-muted-foreground">{profile.bio}</p> : null}
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    {profile.country && (
                      <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {profile.country}</span>
                    )}
                    {profile.email && <span className="inline-flex items-center gap-1"><Mail className="h-3.5 w-3.5" /> {profile.email}</span>}
                    {profile.phone && <span className="inline-flex items-center gap-1"><Phone className="h-3.5 w-3.5" /> {profile.phone}</span>}
                  </div>
                </>
              )}
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={startEdit} className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-xs font-bold uppercase tracking-wider hover:border-vsm-red hover:text-vsm-red">
                <Pencil className="h-3.5 w-3.5" /> Éditer
              </button>
              <Link to="/parametres" className="rounded-lg border border-border px-3 py-2 text-xs font-bold uppercase tracking-wider hover:border-vsm-red hover:text-vsm-red">
                Paramètres
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Niveau Programme", value: profile.level },
          { label: "XP Academy", value: profile.xp.toLocaleString() },
          { label: "Points", value: profile.points.toLocaleString() },
          { label: "Formation", value: `${profile.academyProgress}%` },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-surface p-3 text-center">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">{s.label}</p>
            <p className="mt-1 font-display text-xl font-bold">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-1 rounded-xl border border-border bg-surface p-1 text-xs">
        {(["posts", "favoris", "certificats", "badges", "activite"] as Tab[]).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`flex-1 rounded-lg px-2 py-2 text-[10px] font-semibold uppercase tracking-wider sm:px-3 sm:text-xs ${tab === t ? "bg-vsm-red text-white shadow-glow-red" : "text-muted-foreground hover:text-foreground"}`}>
            {t === "favoris" ? "Favoris" : t}
          </button>
        ))}
      </div>

      {tab === "posts" && (
        posts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-surface p-10 text-center text-sm text-muted-foreground">
            Aucun post pour le moment. <Link to="/communaute" className="text-vsm-red hover:underline">Publier dans la communauté</Link>
          </div>
        ) : (
          <div className="space-y-4">{posts.map((p) => <PostCard key={p.id} post={p} />)}</div>
        )
      )}

      {tab === "favoris" && (
        <div className="space-y-6">
          <section>
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider">
              <Bookmark className="h-4 w-4 text-vsm-red" /> Publications ({savedPosts.length})
            </h2>
            {savedPosts.length === 0 ? (
              <p className="rounded-xl border border-dashed border-border bg-surface p-6 text-center text-sm text-muted-foreground">
                Aucune publication sauvegardée. <Link to="/communaute" className="text-vsm-red hover:underline">Explorer la communauté</Link>
              </p>
            ) : (
              <div className="space-y-4">{savedPosts.map((p) => <PostCard key={p.id} post={p} />)}</div>
            )}
          </section>
          <section>
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider">
              <BookOpen className="h-4 w-4 text-vsm-red" /> Cours ({favCourses.length})
            </h2>
            {favCourses.length === 0 ? (
              <p className="rounded-xl border border-dashed border-border bg-surface p-6 text-center text-sm text-muted-foreground">
                Aucun cours favori. <Link to="/academie" className="text-vsm-red hover:underline">Explorer l&apos;Académie</Link>
              </p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {favCourses.map((c) => (
                  <Link key={c.id} to="/academie/cours/$id" params={{ id: c.id }} className="flex gap-3 rounded-xl border border-border bg-surface p-3 transition hover:border-vsm-red/50">
                    <img src={c.cover} alt="" className="h-16 w-24 rounded-lg object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{c.title}</p>
                      <p className="text-xs text-muted-foreground">{c.duration} · {c.difficulty}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      {tab === "certificats" && (
        certs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-surface p-10 text-center">
            <Award className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-3 text-sm text-muted-foreground">Aucun certificat Academy pour le moment.</p>
            <Link to="/academie" className="mt-2 inline-block text-xs font-semibold text-vsm-red hover:underline">Explorer l&apos;Académie</Link>
          </div>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {certs.map((c) => (
              <li key={c.id} className="rounded-xl border border-border bg-surface p-4">
                <p className="font-display text-sm font-bold uppercase">{c.parcoursTitle}</p>
                <p className="text-xs text-muted-foreground">{c.date} · {c.serial}</p>
              </li>
            ))}
          </ul>
        )
      )}

      {tab === "badges" && (
        badges.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-surface p-10 text-center text-sm text-muted-foreground">
            Complète des défis et cours pour débloquer des badges Academy.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {badges.map((b) => (
              <div key={b.id} className="rounded-xl border border-border bg-surface p-4 text-center">
                <p className="text-2xl">{b.icon_url ? "🏅" : "⭐"}</p>
                <p className="mt-2 text-xs font-bold uppercase">{b.title}</p>
              </div>
            ))}
          </div>
        )
      )}

      {tab === "activite" && (
        <div className="rounded-2xl border border-dashed border-border bg-surface p-10 text-center text-sm text-muted-foreground">
          {posts.length} publication{posts.length !== 1 ? "s" : ""} · {profile.xp} XP · {profile.academyProgress}% formation
        </div>
      )}

      <ImageCropDialog
        file={cropFile}
        aspect={cropKind === "cover" ? 3 : 1}
        title={cropKind === "cover" ? "Rogner la couverture" : "Rogner l'avatar"}
        onClose={() => { setCropFile(null); setCropKind(null); }}
        onConfirm={(file) => {
          if (cropKind === "avatar") void uploadAvatar.mutateAsync(file);
          if (cropKind === "cover") void uploadCover.mutateAsync(file);
          setCropFile(null);
          setCropKind(null);
        }}
      />
    </div>
  );
}
