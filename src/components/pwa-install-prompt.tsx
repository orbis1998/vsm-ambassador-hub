import { useEffect, useState } from "react";
import { Download, Bell, X, Smartphone } from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import {
  isPushSupported,
  registerPushSubscription,
  saveNotificationPreferences,
  getNotificationPreferences,
  diagnosePushSetup,
  pushSetupErrorMessage,
} from "@/lib/notifications/push-manager";
import {
  getDeferredInstallPrompt,
  isAndroid,
  isIosDevice,
  runInstallPrompt,
  subscribeInstallPrompt,
  supportsNativeInstallPrompt,
} from "@/lib/pwa/deferred-install";
import { toast } from "sonner";

const INSTALL_DISMISSED_KEY = "vsm.academy.pwa.install.dismissed";
const PUSH_PROMPT_DONE_KEY = "vsm.academy.pwa.push.prompted";

function isStandalonePwa() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

export function PwaInstallPrompt() {
  const { profile, session } = useAuth();
  const [nativeInstallReady, setNativeInstallReady] = useState(() => supportsNativeInstallPrompt());
  const [showInstall, setShowInstall] = useState(false);
  const [showPush, setShowPush] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!session) return;

    if (
      isStandalonePwa() &&
      isPushSupported() &&
      Notification.permission === "default" &&
      localStorage.getItem(PUSH_PROMPT_DONE_KEY) !== "1"
    ) {
      const pushTimer = window.setTimeout(() => setShowPush(true), 1500);
      return () => window.clearTimeout(pushTimer);
    }
  }, [session]);

  useEffect(() => {
    return subscribeInstallPrompt((prompt) => {
      const ready = prompt !== null;
      setNativeInstallReady(ready);
      if (
        ready &&
        session &&
        !isStandalonePwa() &&
        localStorage.getItem(INSTALL_DISMISSED_KEY) !== "1"
      ) {
        window.setTimeout(() => setShowInstall(true), 800);
      }
    });
  }, [session]);

  useEffect(() => {
    if (!session) return;
    if (isStandalonePwa()) return;
    if (localStorage.getItem(INSTALL_DISMISSED_KEY) === "1") return;

    // iOS : pas de prompt natif — instructions manuelles uniquement
    if (isIosDevice()) {
      const timer = window.setTimeout(() => setShowInstall(true), 2500);
      return () => window.clearTimeout(timer);
    }

    // Android / Chrome : popup uniquement quand beforeinstallprompt est capturé
    if (getDeferredInstallPrompt()) {
      const timer = window.setTimeout(() => setShowInstall(true), 800);
      return () => window.clearTimeout(timer);
    }
  }, [session, nativeInstallReady]);

  useEffect(() => {
    const onInstalled = () => {
      setShowInstall(false);
      localStorage.setItem(INSTALL_DISMISSED_KEY, "1");
      if (isPushSupported() && localStorage.getItem(PUSH_PROMPT_DONE_KEY) !== "1") {
        window.setTimeout(() => setShowPush(true), 800);
      }
    };
    window.addEventListener("appinstalled", onInstalled);
    return () => window.removeEventListener("appinstalled", onInstalled);
  }, []);

  const dismissInstall = () => {
    localStorage.setItem(INSTALL_DISMISSED_KEY, "1");
    setShowInstall(false);
  };

  const handleInstall = async () => {
    if (isIosDevice() && !nativeInstallReady) {
      dismissInstall();
      return;
    }

    if (!nativeInstallReady) {
      toast.error("Installation en cours de préparation. Rechargez la page dans Chrome.");
      return;
    }

    setBusy(true);
    try {
      const outcome = await runInstallPrompt();
      if (outcome === "accepted") {
        toast.success("Application installée");
        dismissInstall();
      } else if (outcome === "dismissed") {
        /* l'utilisateur a annulé le dialogue système */
      } else {
        toast.error("Installation indisponible. Utilisez Chrome sur academy.vsmcollection.com.");
      }
    } finally {
      setBusy(false);
    }
  };

  const handleEnablePush = async () => {
    if (!profile?.userId) return;
    setBusy(true);
    try {
      const preIssue = await diagnosePushSetup();
      const ok = await registerPushSubscription(profile.userId);
      if (ok) {
        saveNotificationPreferences({ ...getNotificationPreferences(), enabled: true });
        toast.success("Notifications push activées pour VSM Academy");
        setShowPush(false);
        localStorage.setItem(PUSH_PROMPT_DONE_KEY, "1");
      } else {
        const issue = preIssue ?? (await diagnosePushSetup()) ?? "subscription_failed";
        toast.error(pushSetupErrorMessage(issue));
      }
    } finally {
      setBusy(false);
    }
  };

  const dismissPush = () => {
    localStorage.setItem(PUSH_PROMPT_DONE_KEY, "1");
    setShowPush(false);
  };

  if (!session) return null;

  if (showPush) {
    return (
      <div className="fixed inset-0 z-[70] grid place-items-center bg-black/60 p-4 backdrop-blur-sm">
        <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-5 shadow-xl">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-vsm-red/15 text-vsm-red">
                <Bell className="h-5 w-5" />
              </span>
              <div>
                <p className="font-display text-lg font-bold uppercase tracking-wide">Notifications</p>
                <p className="text-xs text-muted-foreground">VSM Academy</p>
              </div>
            </div>
            <button type="button" onClick={dismissPush} className="text-muted-foreground hover:text-foreground" aria-label="Fermer">
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Activez les alertes pour les messages, cours et activités de la communauté — même quand l&apos;app est fermée.
          </p>
          <div className="mt-5 flex gap-2">
            <button type="button" onClick={dismissPush} className="flex-1 rounded-lg border border-border py-2.5 text-xs font-semibold uppercase">
              Plus tard
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => void handleEnablePush()}
              className="flex-1 rounded-lg bg-vsm-red py-2.5 text-xs font-semibold uppercase text-white disabled:opacity-50"
            >
              Activer
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!showInstall || isStandalonePwa()) return null;

  const iosManual = isIosDevice() && !nativeInstallReady;
  const androidWaiting = isAndroid() && !nativeInstallReady;

  // Android : n'afficher que lorsque le prompt natif Chrome est prêt
  if (androidWaiting) return null;

  return (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-5 shadow-xl">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-vsm-red/15 text-vsm-red">
              <Download className="h-5 w-5" />
            </span>
            <div>
              <p className="font-display text-lg font-bold uppercase tracking-wide">Installer l&apos;app</p>
              <p className="text-xs text-muted-foreground">VSM Ambassador Academy</p>
            </div>
          </div>
          <button type="button" onClick={dismissInstall} className="text-muted-foreground hover:text-foreground" aria-label="Fermer">
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          {iosManual
            ? "Ajoutez VSM Academy sur votre écran d'accueil pour une expérience plein écran et des notifications fiables."
            : "Installez VSM Academy sur votre téléphone en un clic — comme une application native, sans passer par le Play Store."}
        </p>
        {iosManual && (
          <p className="mt-3 flex items-start gap-2 rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
            <Smartphone className="mt-0.5 h-4 w-4 shrink-0" />
            Safari → Partager → « Sur l&apos;écran d&apos;accueil »
          </p>
        )}
        <div className="mt-5 flex gap-2">
          <button type="button" onClick={dismissInstall} className="flex-1 rounded-lg border border-border py-2.5 text-xs font-semibold uppercase">
            Plus tard
          </button>
          <button
            type="button"
            disabled={busy || (!iosManual && !nativeInstallReady)}
            onClick={() => void handleInstall()}
            className="flex-1 rounded-lg bg-vsm-red py-2.5 text-xs font-semibold uppercase text-white disabled:opacity-50"
          >
            {iosManual ? "Compris" : busy ? "Installation…" : "Installer"}
          </button>
        </div>
      </div>
    </div>
  );
}
