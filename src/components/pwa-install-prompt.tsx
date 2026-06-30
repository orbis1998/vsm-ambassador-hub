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
import { toast } from "sonner";

const INSTALL_DISMISSED_KEY = "vsm.academy.pwa.install.dismissed";
const PUSH_PROMPT_DONE_KEY = "vsm.academy.pwa.push.prompted";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function isStandalonePwa() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function isIos() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

export function PwaInstallPrompt() {
  const { profile, session } = useAuth();
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstall, setShowInstall] = useState(false);
  const [showPush, setShowPush] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!session) return;

    // Déjà installé en PWA : proposer les notifications au premier lancement
    if (
      isStandalonePwa() &&
      isPushSupported() &&
      Notification.permission === "default" &&
      localStorage.getItem(PUSH_PROMPT_DONE_KEY) !== "1"
    ) {
      const timer = window.setTimeout(() => setShowPush(true), 1500);
      return () => window.clearTimeout(timer);
    }
  }, [session]);

  useEffect(() => {
    if (!session) return;
    if (isStandalonePwa()) return;
    if (localStorage.getItem(INSTALL_DISMISSED_KEY) === "1") return;

    const onBip = (e: Event) => {
      e.preventDefault();
      setInstallEvent(e as BeforeInstallPromptEvent);
      setShowInstall(true);
    };

    window.addEventListener("beforeinstallprompt", onBip);

    // Première visite : proposer l'installation (iOS ou navigateur sans événement différé)
    const timer = window.setTimeout(() => {
      if (!isStandalonePwa() && localStorage.getItem(INSTALL_DISMISSED_KEY) !== "1") {
        setShowInstall(true);
      }
    }, 2500);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBip);
      window.clearTimeout(timer);
    };
  }, [session]);

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
    if (installEvent) {
      setBusy(true);
      try {
        await installEvent.prompt();
        const { outcome } = await installEvent.userChoice;
        if (outcome === "accepted") {
          toast.success("Application installée");
          dismissInstall();
        }
      } finally {
        setBusy(false);
      }
      return;
    }
    if (isIos()) {
      toast.info("Safari → Partager → « Sur l'écran d'accueil »");
      return;
    }
    toast.info("Menu du navigateur (⋮) → Installer l'application ou Ajouter à l'écran d'accueil");
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
          Téléchargez VSM Academy sur votre écran d&apos;accueil pour une expérience plein écran, plus rapide et des notifications fiables.
        </p>
        {isIos() && !installEvent && (
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
            disabled={busy}
            onClick={() => void handleInstall()}
            className="flex-1 rounded-lg bg-vsm-red py-2.5 text-xs font-semibold uppercase text-white disabled:opacity-50"
          >
            Installer
          </button>
        </div>
      </div>
    </div>
  );
}
