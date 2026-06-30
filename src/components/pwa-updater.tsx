import { useRegisterSW } from "virtual:pwa-register/react";
import { useEffect } from "react";
import { markServiceWorkerFailed, markServiceWorkerReady } from "@/lib/pwa/sw-ready";

/**
 * Enregistre le Service Worker et gère les mises à jour automatiques PWA.
 */
export function PwaUpdater() {
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    immediate: true,
    onRegistered(registration) {
      if (registration) {
        markServiceWorkerReady(registration);
        console.info("[PWA] Service Worker enregistré");
      }
    },
    onRegisterError(error) {
      markServiceWorkerFailed(error instanceof Error ? error : new Error(String(error)));
      console.error("[PWA] Erreur enregistrement SW:", error);
    },
  });

  useEffect(() => {
    if (needRefresh) {
      const accepted = window.confirm(
        "Une nouvelle version de VSM Academy est disponible. Mettre à jour maintenant ?",
      );
      if (accepted) updateServiceWorker(true);
    }
  }, [needRefresh, updateServiceWorker]);

  return null;
}
