import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import {
  GraduationCap,
  Trophy,
  Award,
  Users,
  Sparkles,
  Target,
  ArrowRight,
  ShieldCheck,
  Crown,
} from "lucide-react";
import { VsmLogo } from "@/components/vsm-logo";
import { useAuth } from "@/providers/auth-provider";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "VSM Ambassador Academy — Formation & Communauté" },
      {
        name: "description",
        content:
          "L'académie officielle VSM Collection : formations, certificats, défis, opportunités et communauté ambassadeurs.",
      },
    ],
  }),
  component: LandingPage,
});

const STATS = [
  { value: "50+", label: "Formations" },
  { value: "12", label: "Certificats" },
  { value: "100+", label: "Ambassadeurs actifs" },
  { value: "24/7", label: "Communauté" },
];

const FEATURES = [
  { icon: GraduationCap, title: "Formations premium", desc: "Parcours structurés, vidéos, quiz et certifications officielles." },
  { icon: Trophy, title: "Défis & XP", desc: "Gagnez des points, montez en niveau et débloquez des récompenses." },
  { icon: Sparkles, title: "Opportunités VSM", desc: "Castings, campagnes, shootings et missions exclusives." },
  { icon: Users, title: "Communauté privée", desc: "Réseau social réservé aux ambassadeurs officiels." },
  { icon: Award, title: "Certificats QR", desc: "Certifications vérifiables avec QR code et PDF." },
  { icon: Target, title: "Progression mesurée", desc: "Suivez votre avancement en temps réel." },
];

function LandingPage() {
  const navigate = useNavigate();
  const { session, loading } = useAuth();

  useEffect(() => {
    if (!loading && session) {
      navigate({ to: "/dashboard", replace: true });
    }
  }, [loading, session, navigate]);

  function handleAccess() {
    if (session) navigate({ to: "/dashboard" });
    else navigate({ to: "/login" });
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:h-16 sm:px-6">
          <VsmLogo />
          <button
            onClick={handleAccess}
            className="rounded-lg bg-vsm-red px-4 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-glow-red sm:px-5 sm:text-sm"
          >
            {session ? "Mon espace" : "Connexion"}
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden px-4 pb-16 pt-10 sm:px-6 sm:pb-24 sm:pt-16">
        <div className="pointer-events-none absolute -left-32 top-0 h-80 w-80 rounded-full bg-vsm-red/20 blur-[100px]" />
        <div className="pointer-events-none absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-vsm-red/10 blur-[120px]" />

        <div className="relative mx-auto max-w-6xl">
          <VsmLogo size="xl" showText={false} className="mb-6" />

          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-vsm-red/30 bg-vsm-red/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-vsm-red sm:text-[11px]">
            <Crown className="h-3 w-3" />
            Espace officiel ambassadeurs
          </p>

          <h1 className="font-display text-4xl font-bold uppercase leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl">
            VSM Ambassador
            <br />
            <span className="text-gradient-red">Academy</span>
          </h1>

          <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Formez-vous, progressez, certifiez-vous et accédez aux opportunités exclusives de VSM Collection.
            Réservé aux ambassadeurs officiels.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              onClick={handleAccess}
              className="group flex h-12 items-center justify-center gap-2 rounded-lg bg-vsm-red px-8 font-display text-sm font-bold uppercase tracking-[0.15em] text-white shadow-glow-red transition-all hover:brightness-110 active:scale-[0.99]"
            >
              Accéder à l&apos;Academy
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </button>
            <a
              href={import.meta.env.VITE_AMBASSADOR_PROGRAM_URL ?? "https://ambassadeur.vsmcollection.com"}
              className="flex h-12 items-center justify-center rounded-lg border border-border px-6 text-sm font-semibold text-muted-foreground transition-colors hover:border-vsm-red/40 hover:text-foreground"
            >
              Programme Ambassadeur
            </a>
          </div>

          <div className="mt-10 flex items-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-vsm-red" />
            Même compte que le Programme Ambassadeur — connexion automatique si session active
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-border bg-surface/50 px-4 py-10 sm:px-6">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 sm:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <p className="font-display text-3xl font-bold text-vsm-red sm:text-4xl">{s.value}</p>
              <p className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="font-display text-2xl font-bold uppercase tracking-wide sm:text-3xl">
            Tout pour exceller
          </h2>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">
            Une plateforme complète, pensée mobile-first pour les ambassadeurs VSM.
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="rounded-2xl border border-border bg-surface p-5 transition-all hover:border-vsm-red/30"
                >
                  <span className="grid h-10 w-10 place-items-center rounded-lg bg-vsm-red/15 text-vsm-red">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 font-display text-base font-bold uppercase tracking-wide">{f.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 pb-20 sm:px-6">
        <div className="mx-auto max-w-6xl overflow-hidden rounded-2xl border border-vsm-red/30 bg-gradient-to-br from-vsm-red/20 to-background p-8 text-center sm:p-12">
          <h2 className="font-display text-2xl font-bold uppercase tracking-wide sm:text-4xl">
            Prêt à passer au niveau supérieur ?
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
            Connectez-vous avec votre badge, téléphone ou e-mail ambassadeur.
          </p>
          <button
            onClick={handleAccess}
            className="mt-8 inline-flex h-12 items-center gap-2 rounded-lg bg-vsm-red px-8 font-display text-sm font-bold uppercase tracking-wider text-white shadow-glow-red"
          >
            Accéder à l&apos;Academy
            <ArrowRight className="h-4 w-4" />
          </button>
          <p className="mt-6 text-[11px] text-muted-foreground">
            Pas encore ambassadeur ?{" "}
            <Link
              to="/login"
              className="font-semibold text-vsm-red hover:underline"
              onClick={(e) => {
                e.preventDefault();
                window.open(
                  import.meta.env.VITE_AMBASSADOR_PROGRAM_URL ?? "https://ambassadeur.vsmcollection.com",
                  "_blank",
                );
              }}
            >
              Postuler sur le Programme
            </Link>
          </p>
        </div>
      </section>

      <footer className="border-t border-border px-4 py-8 text-center text-xs text-muted-foreground">
        © VSM Collection — Vivre avec style
      </footer>
    </div>
  );
}
