const DEFAULT_ACADEMY_URL = "https://academy.vsmcollection.com";

/** Origine publique Academy (Vercel / PWA). */
export function getAcademyOrigin(): string {
  const fromEnv = import.meta.env.VITE_ACADEMY_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  if (typeof window !== "undefined") return window.location.origin;
  return DEFAULT_ACADEMY_URL;
}

/** Chemin relatif → URL absolue Academy (notifications push, SSO, liens externes). */
export function toAcademyUrl(path = "/dashboard"): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${getAcademyOrigin()}${normalized}`;
}
