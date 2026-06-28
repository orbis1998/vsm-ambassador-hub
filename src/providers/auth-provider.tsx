import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Session } from "@supabase/supabase-js";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import {
  fetchAmbassadorProfile,
  getSession,
  onAuthStateChange,
  resetPassword,
  signInWithIdentifier,
  signOut as authSignOut,
} from "@/services/auth.service";
import type { AmbassadorProfile } from "@/types/profile";

interface AuthContextValue {
  session: Session | null;
  profile: AmbassadorProfile | null;
  /** Session auth résolue (ne attend pas le profil complet). */
  loading: boolean;
  profileLoading: boolean;
  configured: boolean;
  signIn: (identifier: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<AmbassadorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const configured = isSupabaseConfigured();
  const skipNextProfileFetch = useRef(false);

  useEffect(() => {
    if (!configured) {
      setLoading(false);
      return;
    }

    let mounted = true;

    void getSession()
      .then((s) => {
        if (mounted && s) setSession(s);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    const unsubscribe = onAuthStateChange((s, p, event) => {
      if (!mounted) return;

      setSession(s);
      setLoading(false);

      if (!s?.user) {
        setProfile(null);
        setProfileLoading(false);
        skipNextProfileFetch.current = false;
        return;
      }

      if (skipNextProfileFetch.current && event === "SIGNED_IN") {
        skipNextProfileFetch.current = false;
        return;
      }

      if (p) {
        setProfile(p);
        setProfileLoading(false);
        return;
      }

      setProfileLoading(true);
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [configured]);

  const signIn = useCallback(async (identifier: string, password: string) => {
    skipNextProfileFetch.current = true;
    const result = await signInWithIdentifier(identifier, password);
    setSession(result.session);
    setProfile(result.isAdmin ? null : result.profile);
    setLoading(false);
    setProfileLoading(false);
    return result.isAdmin;
  }, []);

  const signOut = useCallback(async () => {
    await authSignOut();
    setSession(null);
    setProfile(null);
    setProfileLoading(false);
  }, []);

  const requestPasswordReset = useCallback(async (email: string) => {
    await resetPassword(email);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!session?.user) return;
    setProfileLoading(true);
    try {
      setProfile(await fetchAmbassadorProfile(session.user.id, session.user));
    } finally {
      setProfileLoading(false);
    }
  }, [session?.user]);

  const value = useMemo(
    () => ({
      session,
      profile,
      loading,
      profileLoading,
      configured,
      signIn,
      signOut,
      requestPasswordReset,
      refreshProfile,
    }),
    [
      session,
      profile,
      loading,
      profileLoading,
      configured,
      signIn,
      signOut,
      requestPasswordReset,
      refreshProfile,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth doit être utilisé dans AuthProvider.");
  return ctx;
}

export function useIsAuthenticated(): boolean {
  const { session, loading, configured } = useAuth();
  if (!configured) return false;
  return !loading && !!session;
}
