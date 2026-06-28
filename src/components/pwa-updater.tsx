import { useRegisterSW } from "virtual:pwa-register/react";
import { useEffect } from "react";

/**
 * Enregistre le Service Worker et gère les mises à jour automatiques PWA.
 */
export function PwaUpdater() {
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(registration) {
      if (registration) {
        console.info("[PWA] Service Worker enregistré");
      }
    },
    onRegisterError(error) {
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
