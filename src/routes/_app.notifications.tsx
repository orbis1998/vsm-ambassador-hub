import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Bell, Check, Trophy, Sparkles, MessageCircle, MessageSquare, Award, Star, Megaphone, GraduationCap, UserPlus, FileText } from "lucide-react";
import { notificationsFull, type NotificationFull } from "@/lib/social-data";
import { useSocialStore } from "@/lib/social-store";
import { ambassadors } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/notifications")({
  component: NotificationsPage,
});

const ICONS: Record<NotificationFull["type"], typeof Bell> = {
  challenge: Trophy, opportunity: Sparkles, message: MessageSquare, comment: MessageCircle,
  certificate: Award, badge: Star, campaign: Megaphone, post: FileText, course: GraduationCap, follow: UserPlus,
};

function NotificationsPage() {
  const { state, markNotifRead, markAllNotifRead } = useSocialStore();
  const [filter, setFilter] = useState<"all" | "unread" | NotificationFull["type"]>("all");

  const items = useMemo(() => {
    const list = notificationsFull.map((n) => ({ ...n, read: n.read || state.readNotifIds.includes(n.id) }));
    if (filter === "all") return list;
    if (filter === "unread") return list.filter((n) => !n.read);
    return list.filter((n) => n.type === filter);
  }, [filter, state.readNotifIds]);

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-vsm-red/15 text-vsm-red">
            <Bell className="h-5 w-5" />
          </span>
          <div>
            <h1 className="font-display text-3xl font-bold uppercase tracking-wide">Notifications</h1>
            <p className="text-sm text-muted-foreground">Centre complet d'activité.</p>
          </div>
        </div>
        <button
          onClick={() => markAllNotifRead(notificationsFull.map((n) => n.id))}
          className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-semibold uppercase tracking-wider hover:border-vsm-red hover:text-vsm-red"
        >
          <Check className="h-3.5 w-3.5" /> Tout marquer comme lu
        </button>
      </header>

      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 text-xs">
        {([
          ["all", "Tout"], ["unread", "Non lues"],
          ["challenge", "Défis"], ["opportunity", "Opportunités"], ["message", "Messages"],
          ["comment", "Commentaires"], ["certificate", "Certificats"], ["badge", "Badges"],
          ["campaign", "Campagnes"], ["post", "Publications"], ["course", "Cours"], ["follow", "Followers"],
        ] as const).map(([k, label]) => (
          <button
            key={k}
            onClick={() => setFilter(k as typeof filter)}
            className={`whitespace-nowrap rounded-full border px-3 py-1.5 font-semibold uppercase tracking-wider transition-colors ${filter === k ? "border-vsm-red bg-vsm-red text-white" : "border-border text-muted-foreground hover:text-foreground"}`}
          >
            {label}
          </button>
        ))}
      </div>

      <ul className="overflow-hidden rounded-2xl border border-border bg-surface">
        {items.slice(0, 80).map((n) => {
          const Icon = ICONS[n.type];
          const actor = ambassadors.find((a) => a.id === n.actor_id);
          return (
            <li key={n.id} className={`flex items-start gap-3 border-b border-border/60 p-4 last:border-0 ${!n.read ? "bg-vsm-red/5" : ""}`}>
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-vsm-red/15 text-vsm-red">
                <Icon className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">{n.title}</p>
                <p className="mt-0.5 text-sm text-muted-foreground">{n.body}{actor ? ` · ${actor.name}` : ""}</p>
                <p className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                  {new Date(n.created_at).toLocaleString("fr-FR")}
                </p>
              </div>
              {!n.read && (
                <button onClick={() => markNotifRead(n.id)} className="text-[11px] uppercase tracking-wider text-vsm-red hover:underline">Marquer lu</button>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
