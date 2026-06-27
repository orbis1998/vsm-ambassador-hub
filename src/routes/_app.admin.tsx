import { createFileRoute } from "@tanstack/react-router";
import { Shield, Users, GraduationCap, FileQuestion, Award, Trophy, Sparkles, MessageSquare, BookOpen, BarChart3, Lock } from "lucide-react";
import { SUPABASE_TABLES } from "@/lib/social-data";

export const Route = createFileRoute("/_app/admin")({
  component: AdminShell,
});

const SECTIONS = [
  { icon: Users, title: "Ambassadeurs", desc: "Gérer les profils, badges et niveaux." },
  { icon: GraduationCap, title: "Cours", desc: "Créer, éditer et publier les parcours." },
  { icon: FileQuestion, title: "Quiz", desc: "Banque de questions et notation." },
  { icon: Award, title: "Certificats", desc: "Émission et vérification QR." },
  { icon: Trophy, title: "Défis", desc: "Programmer les défis hebdo & spéciaux." },
  { icon: Sparkles, title: "Opportunités", desc: "Castings, campagnes, événements." },
  { icon: MessageSquare, title: "Communauté", desc: "Modération posts, commentaires, stories." },
  { icon: BookOpen, title: "Ressources", desc: "Templates, brand kits, assets." },
  { icon: BarChart3, title: "Statistiques", desc: "KPIs plateforme & engagement." },
];

function AdminShell() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-lg bg-vsm-red/15 text-vsm-red">
          <Shield className="h-5 w-5" />
        </span>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-vsm-red">Administration · Structure</p>
          <h1 className="font-display text-3xl font-bold uppercase tracking-wide md:text-4xl">Espace admin VSM</h1>
          <p className="mt-1 text-sm text-muted-foreground">Architecture pré-câblée pour le futur back-office privé.</p>
        </div>
      </header>

      <div className="flex items-center gap-3 rounded-2xl border border-vsm-red/30 bg-vsm-red/10 p-4 text-sm">
        <Lock className="h-5 w-5 text-vsm-red" />
        <p>Accès réservé aux administrateurs VSM. Cette vue est uniquement la structure — les fonctionnalités seront activées via Lovable Cloud.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {SECTIONS.map((s) => (
          <div key={s.title} className="rounded-2xl border border-border bg-surface p-5 transition-all hover:border-vsm-red/40 hover:shadow-glow-red">
            <s.icon className="h-6 w-6 text-vsm-red" />
            <h3 className="mt-3 font-display text-base font-bold uppercase tracking-wide">{s.title}</h3>
            <p className="mt-1 text-xs text-muted-foreground">{s.desc}</p>
            <p className="mt-4 text-[10px] uppercase tracking-[0.2em] text-vsm-red">Bientôt disponible</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-surface p-5">
        <h3 className="font-display text-base font-bold uppercase tracking-wide">Schéma Supabase planifié</h3>
        <p className="mt-1 text-xs text-muted-foreground">{SUPABASE_TABLES.length} tables modulaires prêtes à être créées.</p>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {SUPABASE_TABLES.map((t) => (
            <span key={t} className="rounded-md border border-border bg-background px-2 py-1 font-mono text-[10px] text-muted-foreground">{t}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
