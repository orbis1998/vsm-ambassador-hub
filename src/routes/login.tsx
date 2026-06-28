import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Eye, EyeOff, ArrowRight, ShieldCheck, Sparkles, Crown, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { VsmLogo } from "@/components/vsm-logo";
import { useAuth } from "@/providers/auth-provider";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { detectIdentifierType } from "@/services/auth.service";
import { checkIsAdmin } from "@/services/staff-auth.service";
import { useIsBrowser } from "@/hooks/use-is-browser";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Connexion — VSM Ambassador Academy" },
      { name: "description", content: "Connectez-vous à votre espace VSM Collection — ambassadeurs et administration." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetMode, setResetMode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const browser = useIsBrowser();
  const { signIn, requestPasswordReset, session, loading: authLoading } = useAuth();
  const supabaseReady = isSupabaseConfigured();

  const { data: isAdmin, isLoading: checkingAdmin } = useQuery({
    queryKey: ["login-is-admin", session?.user.id],
    queryFn: () => checkIsAdmin(session!.user.id),
    enabled: browser && !!session?.user.id,
  });

  useEffect(() => {
    if (authLoading || !session || checkingAdmin) return;
    navigate({ to: isAdmin ? "/staff" : "/dashboard", replace: true });
  }, [authLoading, session, checkingAdmin, isAdmin, navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!supabaseReady) {
        setError("Supabase non configuré. Ajoutez vos clés dans le fichier .env.");
        return;
      }

      if (resetMode) {
        const email =
          detectIdentifierType(identifier) === "email"
            ? identifier.trim()
            : window.prompt("Entrez votre adresse e-mail pour réinitialiser le mot de passe :");
        if (!email) return;
        await requestPasswordReset(email);
        toast.success("E-mail de réinitialisation envoyé. Vérifiez votre boîte mail.");
        setResetMode(false);
        return;
      }

      const adminAccount = await signIn(identifier, password);
      toast.success(adminAccount ? "Bienvenue dans l'espace administration" : "Connexion réussie");
      navigate({ to: adminAccount ? "/staff" : "/dashboard" });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur de connexion.";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  if (authLoading || (session && checkingAdmin)) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-vsm-red" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 top-1/4 h-96 w-96 rounded-full bg-vsm-red/20 blur-[120px]" />
        <div className="absolute -right-32 bottom-0 h-[28rem] w-[28rem] rounded-full bg-vsm-red/15 blur-[140px]" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>\")",
          }}
        />
      </div>

      <div className="relative mx-auto grid min-h-screen max-w-7xl grid-cols-1 lg:grid-cols-2">
        <div className="hidden flex-col justify-between p-12 lg:flex">
          <VsmLogo />

          <div className="animate-fade-up space-y-8">
            <div>
              <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-vsm-red/30 bg-vsm-red/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-vsm-red">
                <span className="h-1.5 w-1.5 rounded-full bg-vsm-red animate-pulse-red" />
                Espace officiel VSM
              </p>
              <h1 className="font-display text-6xl font-bold uppercase leading-[0.95] tracking-tight">
                Bienvenue<br />
                <span className="text-gradient-red">Ambassadeur.</span>
              </h1>
              <p className="mt-6 max-w-md text-base leading-relaxed text-muted-foreground">
                L&apos;académie officielle de VSM Collection. Une seule connexion pour les ambassadeurs et l&apos;équipe VSM.
              </p>
            </div>

            <ul className="space-y-3 text-sm">
              {[
                { icon: ShieldCheck, label: "Compte ambassadeur ou administrateur" },
                { icon: Sparkles, label: "Formations, défis & certifications" },
                { icon: Crown, label: "Opportunités exclusives & classement" },
              ].map(({ icon: I, label }) => (
                <li key={label} className="flex items-center gap-3 text-muted-foreground">
                  <span className="grid h-8 w-8 place-items-center rounded-lg border border-border bg-surface">
                    <I className="h-4 w-4 text-vsm-red" />
                  </span>
                  {label}
                </li>
              ))}
            </ul>
          </div>

          <p className="text-xs text-muted-foreground">© VSM Collection — Vivre avec style.</p>
        </div>

        <div className="flex flex-col items-center justify-center p-6 sm:p-10">
          <div className="mb-8 lg:hidden">
            <VsmLogo />
          </div>

          <div className="animate-fade-up glass-strong noise noise-overlay relative w-full max-w-md rounded-2xl p-7 shadow-elegant sm:p-9">
            <div className="absolute inset-x-0 top-0 mx-auto h-px w-2/3 bg-gradient-to-r from-transparent via-vsm-red/60 to-transparent" />

            <div className="mb-7">
              <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-vsm-red">Connexion VSM</p>
              <h2 className="mt-2 font-display text-3xl font-bold uppercase tracking-wide">Accédez à votre espace</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Badge, téléphone ou e-mail — ambassadeurs et administrateurs.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {!supabaseReady && (
                <div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-200">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <p>
                    Configuration Supabase requise. Copiez <code className="font-mono">.env.example</code> vers{" "}
                    <code className="font-mono">.env</code> et renseignez vos clés.
                  </p>
                </div>
              )}

              {error && (
                <div className="flex items-start gap-2 rounded-lg border border-vsm-red/30 bg-vsm-red/10 p-3 text-xs text-red-200">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              <div>
                <label className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Badge, téléphone ou e-mail
                </label>
                <input
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="VSM-0427 / +243… / vous@email.com"
                  className="h-12 w-full rounded-lg border border-border bg-background/60 px-4 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-all focus:border-vsm-red/60 focus:ring-2 focus:ring-vsm-red/25"
                />
              </div>

              {!resetMode && (
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Mot de passe
                    </label>
                    <button
                      type="button"
                      onClick={() => setResetMode(true)}
                      className="text-[11px] font-semibold uppercase tracking-wider text-vsm-red hover:underline"
                    >
                      Mot de passe oublié
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      required
                      type={show ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="h-12 w-full rounded-lg border border-border bg-background/60 px-4 pr-12 text-sm outline-none transition-all focus:border-vsm-red/60 focus:ring-2 focus:ring-vsm-red/25"
                    />
                    <button
                      type="button"
                      onClick={() => setShow(!show)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      aria-label={show ? "Masquer" : "Afficher"}
                    >
                      {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="group relative flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-lg bg-vsm-red font-display text-sm font-bold uppercase tracking-[0.18em] text-white shadow-glow-red transition-all hover:brightness-110 active:scale-[0.99] disabled:opacity-70"
              >
                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                {loading ? (resetMode ? "Envoi…" : "Connexion…") : resetMode ? "Réinitialiser" : "Se connecter"}
                {!loading && <ArrowRight className="h-4 w-4" />}
              </button>
            </form>

            <div className="mt-7 rounded-lg border border-border bg-background/40 p-3 text-center text-xs text-muted-foreground">
              Pas encore ambassadeur ?{" "}
              <a
                href="https://ambassadeur.vsmcollection.com"
                target="_blank"
                rel="noreferrer"
                className="font-semibold text-vsm-red hover:underline"
              >
                Postulez sur le Programme Ambassadeur
              </a>
            </div>
          </div>

          <p className="mt-6 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            VSM Collection · Vivre avec style
          </p>
        </div>
      </div>
    </div>
  );
}
