import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { setSessionFromTokens } from "@/services/auth.service";
import { VsmLogo } from "@/components/vsm-logo";

/**
 * SSO callback — Programme Ambassadeur → Academy
 *
 * Le Programme redirige vers :
 * https://formation.vsmcollection.com/auth/callback#access_token=...&refresh_token=...
 *
 * Ou en query : ?access_token=...&refresh_token=...
 */
export const Route = createFileRoute("/auth/callback")({
  component: AuthCallbackPage,
});

function parseTokensFromUrl(): { accessToken: string; refreshToken: string } | null {
  if (typeof window === "undefined") return null;

  const hash = window.location.hash.replace(/^#/, "");
  const hashParams = new URLSearchParams(hash);
  const queryParams = new URLSearchParams(window.location.search);

  const accessToken =
    hashParams.get("access_token") ?? queryParams.get("access_token") ?? "";
  const refreshToken =
    hashParams.get("refresh_token") ?? queryParams.get("refresh_token") ?? "";

  if (accessToken && refreshToken) return { accessToken, refreshToken };
  return null;
}

function AuthCallbackPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const tokens = parseTokensFromUrl();
    if (!tokens) {
      setError("Lien SSO invalide ou expiré. Connectez-vous manuellement.");
      return;
    }

    setSessionFromTokens(tokens.accessToken, tokens.refreshToken)
      .then(() => {
        window.history.replaceState({}, "", "/auth/callback");
        navigate({ to: "/dashboard", replace: true });
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Erreur SSO");
      });
  }, [navigate]);

  return (
    <div className="grid min-h-screen place-items-center bg-background px-4">
      <div className="w-full max-w-sm text-center">
        <VsmLogo className="mx-auto mb-8 justify-center" size="lg" showText={false} />
        {error ? (
          <>
            <AlertCircle className="mx-auto h-10 w-10 text-vsm-red" />
            <p className="mt-4 text-sm text-muted-foreground">{error}</p>
            <button
              onClick={() => navigate({ to: "/login" })}
              className="mt-6 rounded-lg bg-vsm-red px-6 py-2.5 text-sm font-semibold text-white"
            >
              Aller à la connexion
            </button>
          </>
        ) : (
          <>
            <Loader2 className="mx-auto h-10 w-10 animate-spin text-vsm-red" />
            <p className="mt-4 text-sm text-muted-foreground">Connexion à l&apos;écosystème VSM…</p>
          </>
        )}
      </div>
    </div>
  );
}
