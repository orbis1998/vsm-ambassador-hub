/**
 * Variables d'environnement Supabase (client uniquement).
 * Préfixe VITE_ requis pour l'exposition côté navigateur.
 */
export function getSupabaseEnv() {
  const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

  return {
    url: url?.trim() ?? "",
    anonKey: anonKey?.trim() ?? "",
  };
}

export function isSupabaseConfigured(): boolean {
  const { url, anonKey } = getSupabaseEnv();
  return Boolean(url && anonKey && !url.includes("your-project"));
}
