/** Capture globale de beforeinstallprompt — doit charger avant React (évite la course au démarrage). */

export type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

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

export function isAndroid(): boolean {
  return /android/i.test(navigator.userAgent);
}

export function isIosDevice(): boolean {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

export function supportsNativeInstallPrompt(): boolean {
  return deferred !== null;
}
