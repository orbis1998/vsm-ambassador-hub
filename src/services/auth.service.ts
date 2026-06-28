import type { Session, User } from "@supabase/supabase-js";
import { getSupabase } from "@/lib/supabase/client";
import type { AmbassadorProfile } from "@/types/profile";
import {
  fetchProgramAmbassadorProfile,
  invalidateProfileCache,
  normalizeAmbassadorBadge,
} from "@/services/profile.service";
import { checkIsAdmin } from "@/services/staff-auth.service";

export type AuthIdentifierType = "badge" | "phone" | "email";

export interface SignInResult {
  session: Session;
  user: User;
  profile: AmbassadorProfile | null;
  isAdmin: boolean;
}

/** Accès espace ambassadeur (badge, rôle programme ou user_roles). */
export async function canAccessAmbassadorApp(
  userId: string,
  profile: AmbassadorProfile | null,
): Promise<boolean> {
  if (profile?.role === "ambassador") return true;
  if (profile?.badge?.trim()) return true;

  const supabase = getSupabase();
  const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", userId);
  if ((roles ?? []).some((r) => r.role === "ambassador")) return true;

  const { data: row } = await supabase.from("profiles").select("role").eq("id", userId).maybeSingle();
  return row?.role === "ambassador";
}

const BADGE_RE = /^VSM-?[A-Z0-9]+$/i;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+?[\d\s().-]{8,}$/;

export function detectIdentifierType(identifier: string): AuthIdentifierType {
  const trimmed = identifier.trim();
  if (BADGE_RE.test(trimmed.replace(/\s/g, ""))) return "badge";
  if (EMAIL_RE.test(trimmed)) return "email";
  if (PHONE_RE.test(trimmed.replace(/\s/g, ""))) return "phone";
  return "email";
}

function normalizePhone(phone: string): string {
  return phone.replace(/[\s().-]/g, "");
}

function mapAuthError(message: string): string {
  if (/invalid login credentials/i.test(message)) {
    return "Identifiants incorrects. Vérifiez votre badge, e-mail ou mot de passe.";
  }
  if (/email not confirmed/i.test(message)) {
    return "E-mail non confirmé. Vérifiez votre boîte mail.";
  }
  if (/network|fetch failed|timeout/i.test(message)) {
    return "Connexion instable. Réessayez dans quelques secondes.";
  }
  return message;
}

async function sleep(ms: number) {
  await new Promise((r) => setTimeout(r, ms));
}

async function withRetry<T>(fn: () => Promise<T>, attempts = 2): Promise<T> {
  let lastError: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (i < attempts - 1) await sleep(350);
    }
  }
  throw lastError;
}

/** Résout badge / téléphone / email → email auth (Programme). */
async function resolveLoginEmail(identifier: string): Promise<string> {
  const supabase = getSupabase();
  const type = detectIdentifierType(identifier);
  const trimmed = identifier.trim();

  return withRetry(async () => {
    const { data: rpcData, error: rpcError } = await supabase
      .rpc("resolve_ambassador_login", { identifier: trimmed })
      .maybeSingle();

    if (!rpcError && rpcData?.email) return rpcData.email.toLowerCase();

    if (type === "email") {
      const email = trimmed.toLowerCase();
      const { data } = await supabase.from("profiles").select("email").eq("email", email).maybeSingle();
      if (data?.email) return data.email.toLowerCase();
      return email;
    }

    if (type === "badge") {
      const badge = normalizeAmbassadorBadge(trimmed);
      const { data: link, error: linkError } = await supabase
        .from("ambassador_links")
        .select("ambassador_id")
        .eq("slug", badge)
        .maybeSingle();

      if (linkError && linkError.code !== "42P01" && linkError.code !== "PGRST205") {
        throw new Error(mapAuthError(linkError.message));
      }

      if (link?.ambassador_id) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("email")
          .eq("id", link.ambassador_id)
          .maybeSingle();
        if (profile?.email) return profile.email.toLowerCase();
      }

      throw new Error(`Aucun ambassadeur trouvé pour le badge ${badge}.`);
    }

    const phone = normalizePhone(trimmed);
    const { data, error } = await supabase
      .from("profiles")
      .select("email")
      .or(`phone.eq.${phone},phone.eq.${trimmed.replace(/,/g, "")}`)
      .maybeSingle();

    if (error) throw new Error(mapAuthError(error.message));
    if (!data?.email) throw new Error("Aucun compte ambassadeur associé à ce numéro.");
    return data.email.toLowerCase();
  });
}

export async function signInWithIdentifier(identifier: string, password: string): Promise<SignInResult> {
  const email = await resolveLoginEmail(identifier);
  const supabase = getSupabase();

  const { data, error } = await withRetry(async () => {
    const result = await supabase.auth.signInWithPassword({ email, password });
    if (result.error) throw new Error(mapAuthError(result.error.message));
    return result;
  });

  if (!data.session || !data.user) {
    throw new Error("Session invalide après connexion.");
  }

  const profile = await fetchAmbassadorProfile(data.user.id, data.user);
  const isAdmin = await checkIsAdmin(data.user.id);

  if (isAdmin) {
    return { session: data.session, user: data.user, profile, isAdmin: true };
  }

  const canAmbassador = await canAccessAmbassadorApp(data.user.id, profile);
  if (!canAmbassador) {
    invalidateProfileCache();
    await supabase.auth.signOut();
    throw new Error("Accès réservé aux ambassadeurs du Programme VSM.");
  }

  return { session: data.session, user: data.user, profile, isAdmin: false };
}

export async function signOut(): Promise<void> {
  invalidateProfileCache();
  const { error } = await getSupabase().auth.signOut();
  if (error) throw error;
}

export async function resetPassword(email: string): Promise<void> {
  const redirectTo = `${window.location.origin}/login?reset=1`;
  const { error } = await getSupabase().auth.resetPasswordForEmail(email.trim().toLowerCase(), {
    redirectTo,
  });
  if (error) throw new Error(mapAuthError(error.message));
}

export async function getSession(): Promise<Session | null> {
  const { data } = await getSupabase().auth.getSession();
  return data.session;
}

export async function fetchAmbassadorProfile(
  userId: string,
  authUser?: User | null,
): Promise<AmbassadorProfile | null> {
  return fetchProgramAmbassadorProfile(userId, authUser);
}

/** Écoute session — ne bloque pas le callback Supabase (profil chargé en différé). */
export function onAuthStateChange(
  callback: (session: Session | null, profile: AmbassadorProfile | null, event: string) => void,
) {
  const supabase = getSupabase();
  const { data } = supabase.auth.onAuthStateChange((event, session) => {
    callback(session, null, event);

    if (!session?.user) return;

    void fetchAmbassadorProfile(session.user.id, session.user)
      .then((profile) => callback(session, profile, event))
      .catch(() => callback(session, null, event));
  });

  return () => data.subscription.unsubscribe();
}

export async function setSessionFromTokens(
  accessToken: string,
  refreshToken: string,
): Promise<SignInResult> {
  const supabase = getSupabase();
  const { data, error } = await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  });
  if (error) throw new Error(mapAuthError(error.message));
  if (!data.session || !data.user) throw new Error("Impossible de restaurer la session SSO.");

  const profile = await fetchAmbassadorProfile(data.user.id, data.user);
  return { session: data.session, user: data.user, profile };
}

export { StaffLoginRequiredError } from "@/services/staff-auth.service";

export async function isAmbassadorUser(userId: string): Promise<boolean> {
  const profile = await fetchAmbassadorProfile(userId);
  return profile?.role === "ambassador";
}
