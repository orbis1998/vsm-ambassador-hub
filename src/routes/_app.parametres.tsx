import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Settings, Shield, Bell, Globe, Lock, Smartphone, LogOut, ChevronRight, Loader2, Camera } from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import { useSocialStore } from "@/lib/social-store";
import { profileAvatarUrl } from "@/lib/program-tier";
import { useProfileEdit } from "@/hooks/use-profile-edit";
import {
  getNotificationPreferences,
  isPushSupported,
  registerPushSubscription,
  saveNotificationPreferences,
  unregisterPushSubscription,
} from "@/lib/notifications/push-manager";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/parametres")({
  component: SettingsPage,
});

const SECTIONS = [
  { k: "profile", label: "Profil", icon: Settings },
  { k: "security", label: "Sécurité", icon: Shield },
  { k: "notifications", label: "Notifications", icon: Bell },
  { k: "privacy", label: "Confidentialité", icon: Lock },
  { k: "language", label: "Langue & Thème", icon: Globe },
  { k: "sessions", label: "Sessions", icon: Smartphone },
] as const;

function SettingsPage() {
  const [sec, setSec] = useState<(typeof SECTIONS)[number]["k"]>("profile");
  const { profile, loading, signOut } = useAuth();
  const { state, updateSettings } = useSocialStore();
  const s = state.settings;
  const { update, uploadAvatar } = useProfileEdit();
  const avatarRef = useRef<HTMLInputElement>(null);
  const [bio, setBio] = useState("");
  const [handle, setHandle] = useState("");
  const [country, setCountry] = useState("");
  const [pushEnabled, setPushEnabled] = useState(false);
  const [pushPrefs, setPushPrefs] = useState(getNotificationPreferences());

  useEffect(() => {
    if (profile) {
      setBio(profile.bio ?? "");
      setHandle(profile.handle ?? "");
      setCountry(profile.country ?? "");
    }
  }, [profile]);

  useEffect(() => {
    setPushEnabled(pushPrefs.enabled);
  }, [pushPrefs.enabled]);

  if (loading) {
    return (
      <div className="grid min-h-[40vh] place-items-center">
        <Loader2 className="h-8 w-8 animate-spin text-vsm-red" />
      </div>
    );
  }

  const avatar = profile
    ? profile.avatar || profileAvatarUrl(null, profile.email ?? profile.name)
    : profileAvatarUrl(null, "vsm");

  const saveProfile = async () => {
    await update.mutateAsync({ bio, handle, country });
    toast.success("Profil mis à jour");
  };

  const togglePush = async (enabled: boolean) => {
    if (!profile?.userId) return;
    if (enabled) {
      const ok = await registerPushSubscription(profile.userId);
      if (ok) {
        saveNotificationPreferences({ ...pushPrefs, enabled: true });
        setPushPrefs(getNotificationPreferences());
        toast.success("Notifications push activées");
      } else {
        toast.error("Impossible d'activer les push (permission ou VAPID manquant)");
      }
    } else {
      await unregisterPushSubscription(profile.userId);
      saveNotificationPreferences({ ...pushPrefs, enabled: false });
      setPushPrefs(getNotificationPreferences());
      toast.success("Notifications push désactivées");
    }
    setPushEnabled(enabled);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header>
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-vsm-red">Préférences</p>
        <h1 className="font-display text-3xl font-bold uppercase tracking-wide md:text-4xl">Paramètres</h1>
        <p className="mt-1 text-sm text-muted-foreground">Personnalisez votre profil Academy et vos notifications.</p>
      </header>

      <div className="grid gap-5 md:grid-cols-[240px_1fr]">
        <aside className="rounded-2xl border border-border bg-surface p-2">
          <ul className="space-y-0.5">
            {SECTIONS.map((sct) => {
              const Icon = sct.icon;
              const active = sec === sct.k;
              return (
                <li key={sct.k}>
                  <button
                    onClick={() => setSec(sct.k)}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm transition-colors ${active ? "bg-vsm-red/15 text-vsm-red" : "text-muted-foreground hover:bg-accent hover:text-foreground"}`}
                  >
                    <span className="inline-flex items-center gap-2">
                      <Icon className="h-4 w-4" /> {sct.label}
                    </span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </li>
              );
            })}
          </ul>
          <button
            type="button"
            onClick={() => void signOut()}
            className="mt-2 flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:bg-accent hover:text-vsm-red"
          >
            <LogOut className="h-4 w-4" /> Se déconnecter
          </button>
        </aside>

        <section className="rounded-2xl border border-border bg-surface p-6">
          {sec === "profile" && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <button type="button" onClick={() => avatarRef.current?.click()} className="group relative">
                  <img src={avatar} alt="" className="h-16 w-16 rounded-2xl border border-border bg-background object-cover" />
                  <span className="absolute inset-0 grid place-items-center rounded-2xl bg-black/40 opacity-0 group-hover:opacity-100">
                    <Camera className="h-5 w-5 text-white" />
                  </span>
                </button>
                <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && void uploadAvatar.mutateAsync(e.target.files[0])} />
                <p className="text-xs text-muted-foreground">Cliquez sur la photo pour la changer. Badge et niveau Programme restent synchronisés.</p>
              </div>
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Nom (Programme)</label>
                <input readOnly value={profile?.name ?? "—"} className="mt-1 h-10 w-full cursor-default rounded-lg border border-border bg-background/50 px-3 text-sm text-muted-foreground outline-none" />
              </div>
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Badge Programme</label>
                <input readOnly value={profile?.badge ?? "—"} className="mt-1 h-10 w-full cursor-default rounded-lg border border-border bg-background/50 px-3 text-sm text-muted-foreground outline-none" />
              </div>
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Bio</label>
                <textarea value={bio} onChange={(e) => setBio(e.target.value)} className="mt-1 min-h-[80px] w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-vsm-red/50" />
              </div>
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Pseudo</label>
                <input value={handle} onChange={(e) => setHandle(e.target.value)} className="mt-1 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-vsm-red/50" />
              </div>
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Pays</label>
                <input value={country} onChange={(e) => setCountry(e.target.value)} className="mt-1 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-vsm-red/50" />
              </div>
              <button onClick={() => void saveProfile()} disabled={update.isPending} className="rounded-lg bg-vsm-red px-4 py-2 text-xs font-bold uppercase tracking-wider text-white disabled:opacity-50">
                {update.isPending ? "Enregistrement…" : "Enregistrer le profil"}
              </button>
            </div>
          )}

          {sec === "security" && (
            <p className="text-sm text-muted-foreground">
              Mot de passe et sécurité du compte : modifiables sur ambassadeur.vsmcollection.com (même compte Supabase).
            </p>
          )}

          {sec === "notifications" && (
            <div className="space-y-4">
              {[
                ["E-mail (préférences locales)", "emailNotifs"],
                ["Résumé hebdo", "weeklyDigest"],
              ].map(([label, key]) => (
                <label key={key} className="flex items-center justify-between gap-4 text-sm">
                  <span>{label}</span>
                  <input
                    type="checkbox"
                    checked={Boolean(s[key as keyof typeof s])}
                    onChange={(e) => updateSettings({ [key]: e.target.checked })}
                    className="h-4 w-4 accent-vsm-red"
                  />
                </label>
              ))}
              <label className="flex items-center justify-between gap-4 text-sm">
                <span>
                  Push navigateur
                  {!isPushSupported() && <span className="ml-1 text-xs text-muted-foreground">(non supporté)</span>}
                </span>
                <input
                  type="checkbox"
                  disabled={!isPushSupported()}
                  checked={pushEnabled}
                  onChange={(e) => void togglePush(e.target.checked)}
                  className="h-4 w-4 accent-vsm-red"
                />
              </label>
            </div>
          )}

          {(sec === "privacy" || sec === "language" || sec === "sessions") && (
            <p className="text-sm text-muted-foreground">Section en cours de connexion à votre compte Programme.</p>
          )}
        </section>
      </div>
    </div>
  );
}
