let resolveReady: ((reg: ServiceWorkerRegistration) => void) | null = null;
let rejectReady: ((err: Error) => void) | null = null;

const readyPromise = new Promise<ServiceWorkerRegistration>((resolve, reject) => {
  resolveReady = resolve;
  rejectReady = reject;
});

export function markServiceWorkerReady(registration: ServiceWorkerRegistration) {
  resolveReady?.(registration);
}

export function markServiceWorkerFailed(error: Error) {
  rejectReady?.(error);
}

async function ensureServiceWorkerRegistration(): Promise<ServiceWorkerRegistration> {
  const current = await navigator.serviceWorker.getRegistration();
  if (current) return current;

  // Fallback: enregistre explicitement le SW PWA quand l'utilisateur active le push trop vite.
  const registered = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
  return registered;
}

export function waitForServiceWorkerRegistration(timeoutMs = 15_000): Promise<ServiceWorkerRegistration> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return Promise.reject(new Error("Service Worker non supporté"));
  }

  return Promise.race([
    readyPromise,
    ensureServiceWorkerRegistration().then(() => navigator.serviceWorker.ready),
    new Promise<ServiceWorkerRegistration>((_, reject) => {
      window.setTimeout(() => reject(new Error("Service Worker non prêt — rechargez la page")), timeoutMs);
    }),
  ]);
}
