// Mock auth — replace with Supabase later.
// Stores a flag in localStorage so refresh keeps the session.
const KEY = "vsm.session";

export function signIn(identifier: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify({ identifier, at: Date.now() }));
}

export function signOut(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEY);
}

export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem(KEY);
}
