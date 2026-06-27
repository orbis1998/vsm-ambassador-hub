import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Settings, Shield, Bell, Globe, Eye, Lock, Smartphone, LogOut, ChevronRight } from "lucide-react";
import { currentUser } from "@/lib/mock-data";
import { useSocialStore } from "@/lib/social-store";

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
  const { state, updateSettings } = useSocialStore();
  const s = state.settings;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header>
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-vsm-red">Préférences</p>
        <h1 className="font-display text-3xl font-bold uppercase tracking-wide md:text-4xl">Paramètres</h1>
        <p className="mt-1 text-sm text-muted-foreground">Personnalise ton expérience VSM Academy.</p>
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
                    <span className="inline-flex items-center gap-2"><Icon className="h-4 w-4" /> {sct.label}</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </li>
              );
            })}
          </ul>
          <button className="mt-2 flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:bg-accent hover:text-vsm-red">
            <LogOut className="h-4 w-4" /> Se déconnecter
          </button>
        </aside>

        <section className="rounded-2xl border border-border bg-surface p-6">
          {sec === "profile" && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <img src={currentUser.avatar} alt="" className="h-16 w-16 rounded-2xl border border-border bg-background" />
                <button className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold uppercase tracking-wider hover:border-vsm-red hover:text-vsm-red">Changer la photo</button>
              </div>
              {[
                ["Nom", currentUser.name],
                ["Pseudo", `@${currentUser.handle}`],
                ["Badge", currentUser.badge],
                ["Pays", currentUser.country],
                ["Email", `${currentUser.handle}@vsmcollection.com`],
              ].map(([l, v]) => (
                <div key={l}>
                  <label className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">{l}</label>
                  <input defaultValue={v} className="mt-1 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-vsm-red/50" />
                </div>
              ))}
              <button className="rounded-lg bg-vsm-red px-4 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-glow-red">Enregistrer</button>
            </div>
          )}

          {sec === "security" && (
            <div className="space-y-4">
              {[
                ["Mot de passe actuel", "password"],
                ["Nouveau mot de passe", "password"],
                ["Confirmer", "password"],
              ].map(([l, t]) => (
                <div key={l}>
                  <label className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">{l}</label>
                  <input type={t} className="mt-1 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm" />
                </div>
              ))}
              <Toggle label="Authentification à deux facteurs (2FA)" checked={false} onChange={() => {}} />
              <button className="rounded-lg bg-vsm-red px-4 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-glow-red">Mettre à jour</button>
            </div>
          )}

          {sec === "notifications" && (
            <div className="space-y-2">
              <Toggle label="Notifications par e-mail" checked={s.emailNotifs} onChange={(v) => updateSettings({ emailNotifs: v })} />
              <Toggle label="Notifications push" checked={s.pushNotifs} onChange={(v) => updateSettings({ pushNotifs: v })} />
              <Toggle label="Digest hebdomadaire" checked={s.weeklyDigest} onChange={(v) => updateSettings({ weeklyDigest: v })} />
            </div>
          )}

          {sec === "privacy" && (
            <div className="space-y-2">
              <Toggle label="Profil privé" checked={s.privateProfile} onChange={(v) => updateSettings({ privateProfile: v })} />
              <Toggle label="Afficher mon XP publiquement" checked onChange={() => {}} />
              <Toggle label="Afficher mes certificats sur ma page publique" checked onChange={() => {}} />
              <p className="mt-3 inline-flex items-center gap-2 text-xs text-muted-foreground"><Eye className="h-3.5 w-3.5" /> Tes données restent confidentielles et hébergées par VSM.</p>
            </div>
          )}

          {sec === "language" && (
            <div className="space-y-4">
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Langue</label>
                <select value={s.language} onChange={(e) => updateSettings({ language: e.target.value as "fr" | "en" })} className="mt-1 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm">
                  <option value="fr">Français</option>
                  <option value="en">English</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Thème</label>
                <p className="mt-1 rounded-lg border border-border bg-background px-3 py-2.5 text-sm">Dark Premium (par défaut)</p>
              </div>
            </div>
          )}

          {sec === "sessions" && (
            <ul className="space-y-2">
              {[
                ["MacBook Pro · Kinshasa", "Actif maintenant"],
                ["iPhone 15 · Kinshasa", "il y a 3h"],
                ["Chrome · Paris", "il y a 4j"],
              ].map(([d, t]) => (
                <li key={d} className="flex items-center justify-between rounded-lg border border-border bg-background p-3">
                  <div>
                    <p className="text-sm font-semibold">{d}</p>
                    <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{t}</p>
                  </div>
                  <button className="text-xs text-vsm-red hover:underline">Déconnecter</button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center justify-between rounded-lg border border-border bg-background p-3">
      <span className="text-sm">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 rounded-full transition-colors ${checked ? "bg-vsm-red" : "bg-surface-elevated"}`}
      >
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${checked ? "translate-x-5" : "translate-x-0.5"}`} />
      </button>
    </label>
  );
}
