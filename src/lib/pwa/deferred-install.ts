/** Capture globale beforeinstallprompt + détection navigateur pour l'installation PWA. */

export type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export type InstallBrowser = "chrome" | "firefox" | "samsung" | "edge" | "ios" | "other";

type Listener = (prompt: InstallPromptEvent | null) => void;

let deferred: InstallPromptEvent | null = null;
const listeners = new Set<Listener>();

function notify() {
  for (const fn of listeners) fn(deferred);
}

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferred = e as InstallPromptEvent;
    notify();
  });

  window.addEventListener("appinstalled", () => {
    deferred = null;
    notify();
  });
}

export function getDeferredInstallPrompt(): InstallPromptEvent | null {
  return deferred;
}

export function subscribeInstallPrompt(listener: Listener): () => void {
  listener(deferred);
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export async function runInstallPrompt(): Promise<"accepted" | "dismissed" | "unavailable"> {
  if (!deferred) return "unavailable";
  const event = deferred;
  try {
    await event.prompt();
    const { outcome } = await event.userChoice;
    if (outcome === "accepted") {
      deferred = null;
      notify();
    }
    return outcome;
  } catch {
    return "unavailable";
  }
}

export function isStandalonePwa(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

export function detectInstallBrowser(): InstallBrowser {
  const ua = navigator.userAgent.toLowerCase();
  if (/iphone|ipad|ipod/.test(ua)) return "ios";
  if (/firefox|fxios/.test(ua)) return "firefox";
  if (/samsungbrowser/.test(ua)) return "samsung";
  if (/edg\//.test(ua)) return "edge";
  if (/crios|chrome/.test(ua)) return "chrome";
  return "other";
}

export function getManualInstallHint(browser: InstallBrowser): string {
  switch (browser) {
    case "ios":
      return "Safari → Partager → « Sur l'écran d'accueil »";
    case "firefox":
      return "Menu ⋮ → Installer (ou « Ajouter à l'écran d'accueil »)";
    case "samsung":
      return "Menu ≡ → Ajouter la page à → Écran d'accueil";
    case "edge":
      return "Menu ⋯ → Applications → Installer ce site";
    case "chrome":
      return "Menu ⋮ → Installer l'application (ou Ajouter à l'écran d'accueil)";
    default:
      return "Menu du navigateur → Installer / Ajouter à l'écran d'accueil";
  }
}

export function supportsNativeInstallPrompt(): boolean {
  return deferred !== null;
}
