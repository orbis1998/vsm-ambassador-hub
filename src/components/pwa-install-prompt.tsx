import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Download, Bell, X } from "lucide-react";
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
  detectInstallBrowser,
  getManualInstallHint,
  isStandalonePwa,
  runInstallPrompt,
  subscribeInstallPrompt,
  supportsNativeInstallPrompt,
} from "@/lib/pwa/deferred-install";
import { toast } from "sonner";

const INSTALL_DISMISSED_KEY = "vsm.academy.pwa.install.dismissed";
const PUSH_PROMPT_DONE_KEY = "vsm.academy.pwa.push.prompted";

function ModalShell({
  title,
  subtitle,
  icon,
  children,
  onClose,
}: {
  title: string;
  subtitle: string;
  icon: ReactNode;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[9999] flex items-end justify-center bg-black/70 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pwa-modal-title"
    >
      <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-vsm-red/15 text-vsm-red">
              {icon}
            </span>
            <div className="min-w-0">
              <p id="pwa-modal-title" className="font-display text-lg font-bold uppercase tracking-wide">
                {title}
              </p>
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Fermer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function PwaInstallPrompt() {
  const { profile, session } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [canNativeInstall, setCanNativeInstall] = useState(false);
  const [showInstall, setShowInstall] = useState(false);
  const [showPush, setShowPush] = useState(false);
  const [busy, setBusy] = useState(false);
  const browser = detectInstallBrowser();
  const manualHint = getManualInstallHint(browser);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    return subscribeInstallPrompt((prompt) => {
      setCanNativeInstall(prompt !== null);
    });
  }, []);

  useEffect(() => {
    if (!session) return;

    if (
      isStandalonePwa() &&
      isPushSupported() &&
      Notification.permission === "default" &&
      localStorage.getItem(PUSH_PROMPT_DONE_KEY) !== "1"
    ) {
      const t = window.setTimeout(() => setShowPush(true), 1200);
      return () => window.clearTimeout(t);
    }
  }, [session]);

  useEffect(() => {
    if (!session || isStandalonePwa()) return;
    if (localStorage.getItem(INSTALL_DISMISSED_KEY) === "1") return;

    const t = window.setTimeout(() => setShowInstall(true), 2000);
    return () => window.clearTimeout(t);
  }, [session]);

  useEffect(() => {
    const onInstalled = () => {
      setShowInstall(false);
      localStorage.setItem(INSTALL_DISMISSED_KEY, "1");
      if (isPushSupported() && localStorage.getItem(PUSH_PROMPT_DONE_KEY) !== "1") {
        window.setTimeout(() => setShowPush(true), 600);
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
    if (supportsNativeInstallPrompt()) {
      setBusy(true);
      try {
        const outcome = await runInstallPrompt();
        if (outcome === "accepted") {
          toast.success("Application installée");
          dismissInstall();
        }
      } finally {
        setBusy(false);
      }
      return;
    }
    dismissInstall();
  };

  const handleEnablePush = async () => {
    if (!profile?.userId) return;
    setBusy(true);
    try {
      const preIssue = await diagnosePushSetup();
      const ok = await registerPushSubscription(profile.userId);
      if (ok) {
        saveNotificationPreferences({ ...getNotificationPreferences(), enabled: true });
        toast.success("Notifications push activées");
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

  if (!mounted || !session) return null;

  const installLabel = supportsNativeInstallPrompt() || canNativeInstall
    ? "Installer"
    : browser === "ios"
      ? "Compris"
      : "Compris";

  let modal: ReactNode = null;

  if (showPush) {
    modal = (
      <ModalShell title="Notifications" subtitle="VSM Academy" icon={<Bell className="h-5 w-5" />} onClose={dismissPush}>
        <p className="mt-4 text-sm text-muted-foreground">
          Recevez les alertes messages, cours et communauté — même app fermée.
        </p>
        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={dismissPush}
            className="flex-1 rounded-lg border border-border py-3 text-xs font-semibold uppercase"
          >
            Plus tard
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => void handleEnablePush()}
            className="flex-1 rounded-lg bg-vsm-red py-3 text-xs font-semibold uppercase text-white disabled:opacity-50"
          >
            Activer
          </button>
        </div>
      </ModalShell>
    );
  } else if (showInstall && !isStandalonePwa()) {
    modal = (
      <ModalShell
        title="Installer l'app"
        subtitle="VSM Ambassador Academy"
        icon={<Download className="h-5 w-5" />}
        onClose={dismissInstall}
      >
        <p className="mt-4 text-sm text-muted-foreground">
          {supportsNativeInstallPrompt() || canNativeInstall
            ? "Installez VSM Academy en un clic pour une expérience plein écran."
            : "Ajoutez VSM Academy à votre écran d'accueil pour l'utiliser comme une application."}
        </p>
        {!(supportsNativeInstallPrompt() || canNativeInstall) && (
          <p className="mt-3 rounded-lg border border-border bg-muted/40 p-3 text-xs leading-relaxed text-muted-foreground">
            {manualHint}
          </p>
        )}
        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={dismissInstall}
            className="flex-1 rounded-lg border border-border py-3 text-xs font-semibold uppercase"
          >
            Plus tard
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => void handleInstall()}
            className="flex-1 rounded-lg bg-vsm-red py-3 text-xs font-semibold uppercase text-white disabled:opacity-50"
          >
            {busy ? "…" : installLabel}
          </button>
        </div>
      </ModalShell>
    );
  }

  if (!modal) return null;
  return createPortal(modal, document.body);
}
