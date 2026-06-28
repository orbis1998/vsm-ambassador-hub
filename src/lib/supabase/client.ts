import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseEnv } from "./env";
import type { Database } from "@/types/database";

let browserClient: SupabaseClient<Database> | null = null;

/**
 * Client Supabase singleton (navigateur).
 * Partagé avec VSM Ambassador Program — même projet, même auth.
 */
export function getSupabase(): SupabaseClient<Database> {
  if (typeof window === "undefined") {
    throw new Error("getSupabase() ne doit être appelé que côté client.");
  }

  if (!browserClient) {
    const { url, anonKey } = getSupabaseEnv();
    if (!url || !anonKey) {
      throw new Error(
        "Supabase non configuré. Copiez .env.example vers .env et renseignez VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY.",
      );
    }
    browserClient = createClient<Database>(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: "vsm.ecosystem.auth",
      },
      realtime: {
        params: { eventsPerSecond: 10 },
      },
    });
  }

  return browserClient;
}

/** Réinitialise le client (tests / changement d'env). */
export function resetSupabaseClient(): void {
  browserClient = null;
}
