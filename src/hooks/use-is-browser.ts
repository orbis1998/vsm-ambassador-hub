import { useEffect, useState } from "react";

/** true uniquement après hydratation — évite les appels Supabase en SSR. */
export function useIsBrowser(): boolean {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  return ready;
}
