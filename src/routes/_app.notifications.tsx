import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Bell, Check, Trophy, Sparkles, MessageCircle, MessageSquare, Award, Star, Megaphone, GraduationCap, UserPlus, FileText, Loader2 } from "lucide-react";
import type { NotificationFull } from "@/types/social";
import { useNotifications } from "@/hooks/use-notifications";
import { useAmbassador } from "@/hooks/use-social";
import { markAllNotificationsRead, markNotificationRead } from "@/services/notifications.service";
import { useAuth } from "@/providers/auth-provider";
import { useQueryClient } from "@tanstack/react-query";

export const Route = createFileRoute("/_app/notifications")({
  component: NotificationsPage,
});

const ICONS: Record<NotificationFull["type"], typeof Bell> = {
  challenge: Trophy,
  opportunity: Sparkles,
  message: MessageSquare,
  comment: MessageCircle,
  certificate: Award,
  badge: Star,
  campaign: Megaphone,
  post: FileText,
  course: GraduationCap,
  follow: UserPlus,
};

function NotificationsPage() {
  const { profile } = useAuth();
  const qc = useQueryClient();
  const [filter, setFilter] = useState<"all" | "unread" | NotificationFull["type"]>("all");
  const { data: notifications = [], isLoading } = useNotifications(80);

  const items = useMemo(() => {
    if (filter === "all") return notifications;
    if (filter === "unread") return notifications.filter((n) => !n.read);
    return notifications.filter((n) => n.type === filter);
  }, [filter, notifications]);

  const handleMarkAll = async () => {
    if (!profile?.userId) return;
    await markAllNotificationsRead(profile.userId);
    qc.invalidateQueries({ queryKey: ["notifications"] });
    qc.invalidateQueries({ queryKey: ["notifications-unread-count"] });
  };

  const handleMarkRead = async (id: string) => {
    await markNotificationRead(id);
    qc.invalidateQueries({ queryKey: ["notifications"] });
    qc.invalidateQueries({ queryKey: ["notifications-unread-count"] });
  };

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-vsm-red/15 text-vsm-red">
            <Bell className="h-5 w-5" />
          </span>
          <div>
            <h1 className="font-display text-3xl font-bold uppercase tracking-wide">Notifications</h1>
            <p className="text-sm text-muted-foreground">Centre complet d&apos;activité.</p>
          </div>
        </div>
        <button
          onClick={() => void handleMarkAll()}
          className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-semibold uppercase tracking-wider hover:border-vsm-red hover:text-vsm-red"
        >
          <Check className="h-3.5 w-3.5" /> Tout marquer comme lu
        </button>
      </header>

      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 text-xs">
        {(
          [
            ["all", "Tout"],
            ["unread", "Non lues"],
            ["challenge", "Défis"],
            ["opportunity", "Opportunités"],
            ["message", "Messages"],
            ["comment", "Commentaires"],
            ["certificate", "Certificats"],
            ["badge", "Badges"],
            ["campaign", "Campagnes"],
            ["post", "Publications"],
            ["course", "Cours"],
            ["follow", "Followers"],
          ] as const
        ).map(([k, label]) => (
          <button
            key={k}
            onClick={() => setFilter(k as typeof filter)}
            className={`whitespace-nowrap rounded-full border px-3 py-1.5 font-semibold uppercase tracking-wider transition-colors ${filter === k ? "border-vsm-red bg-vsm-red text-white" : "border-border text-muted-foreground hover:text-foreground"}`}
          >
            {label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid place-items-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-vsm-red" />
        </div>
      ) : items.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border bg-surface p-12 text-center text-sm text-muted-foreground">
          Aucune notification pour le moment.
        </p>
      ) : (
        <ul className="overflow-hidden rounded-2xl border border-border bg-surface">
          {items.map((n) => (
            <NotificationRow key={n.id} notification={n} onMarkRead={() => void handleMarkRead(n.id)} />
          ))}
        </ul>
      )}
    </div>
  );
}

function NotificationRow({ notification: n, onMarkRead }: { notification: NotificationFull; onMarkRead: () => void }) {
  const Icon = ICONS[n.type];
  const { data: actor } = useAmbassador(n.actor_id);

  return (
    <li className={`flex items-start gap-3 border-b border-border/60 p-4 last:border-0 ${!n.read ? "bg-vsm-red/5" : ""}`}>
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-vsm-red/15 text-vsm-red">
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">{n.title}</p>
        <p className="mt-0.5 text-sm text-muted-foreground">
          {n.body}
          {actor ? ` · ${actor.name}` : ""}
        </p>
        <p className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">
          {new Date(n.created_at).toLocaleString("fr-FR")}
        </p>
      </div>
      {!n.read && (
        <button onClick={onMarkRead} className="shrink-0 rounded-md border border-border px-2 py-1 text-[10px] font-bold uppercase tracking-wider hover:border-vsm-red hover:text-vsm-red">
          Lu
        </button>
      )}
    </li>
  );
}
