import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Bell, MessageSquare, Search, Menu, ChevronDown } from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import { useNotifications, useUnreadMessageCount, useUnreadNotificationCount } from "@/hooks/use-notifications";
import { formatRelativeTime } from "@/services/ambassador.service";
import { profileAvatarUrl } from "@/lib/program-tier";

interface Props {
  onMenuClick: () => void;
}

export function Topbar({ onMenuClick }: Props) {
  const [open, setOpen] = useState<"notif" | "user" | null>(null);
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { data: notifications = [] } = useNotifications(6);
  const { data: unreadNotifs = 0 } = useUnreadNotificationCount();
  const { data: unreadMsgs = 0 } = useUnreadMessageCount();

  const displayName = profile?.name ?? "Ambassadeur";
  const displayLevel = profile?.level ?? "—";
  const displayBadge = profile?.badge ?? "";
  const displayAvatar = profile
    ? profile.avatar || profileAvatarUrl(null, profile.email ?? profile.name)
    : profileAvatarUrl(null, "vsm");

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-xl md:px-6">
      <button
        onClick={onMenuClick}
        className="grid h-10 w-10 place-items-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-accent hover:text-foreground lg:hidden"
        aria-label="Ouvrir le menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          navigate({ to: "/recherche" });
        }}
        className="relative hidden max-w-md flex-1 md:block"
      >
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          onFocus={() => navigate({ to: "/recherche" })}
          placeholder="Rechercher un cours, un ambassadeur…"
          className="h-10 w-full rounded-lg border border-border bg-surface pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-all focus:border-vsm-red/50 focus:ring-2 focus:ring-vsm-red/20"
        />
      </form>

      <div className="ml-auto flex items-center gap-1.5">
        <Link
          to="/messages"
          className="relative grid h-10 w-10 place-items-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          aria-label="Messages"
        >
          <MessageSquare className="h-[18px] w-[18px]" />
          {unreadMsgs > 0 && (
            <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-vsm-red" />
          )}
        </Link>

        <div className="relative">
          <button
            onClick={() => setOpen(open === "notif" ? null : "notif")}
            className="relative grid h-10 w-10 place-items-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            aria-label="Notifications"
          >
            <Bell className="h-[18px] w-[18px]" />
            {unreadNotifs > 0 && (
              <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-vsm-red px-1 text-[10px] font-bold text-white shadow-[0_0_12px_var(--vsm-red)]">
                {unreadNotifs}
              </span>
            )}
          </button>
          {open === "notif" && (
            <div className="animate-fade-up absolute right-0 top-12 w-80 overflow-hidden rounded-xl border border-border bg-popover shadow-elegant">
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <p className="text-sm font-semibold">Notifications</p>
                {unreadNotifs > 0 && (
                  <span className="rounded-full bg-vsm-red/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-vsm-red">
                    {unreadNotifs} nouvelles
                  </span>
                )}
              </div>
              <ul className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <li className="px-4 py-6 text-center text-xs text-muted-foreground">
                    Aucune notification pour le moment.
                  </li>
                ) : (
                  notifications.map((n) => (
                    <li
                      key={n.id}
                      className="border-b border-border/60 px-4 py-3 last:border-0 hover:bg-accent/50"
                    >
                      <div className="flex items-start gap-3">
                        {!n.read && (
                          <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-vsm-red" />
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-foreground">{n.title}</p>
                          <p className="mt-0.5 truncate text-xs text-muted-foreground">{n.body}</p>
                          <p className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                            {formatRelativeTime(n.created_at)}
                          </p>
                        </div>
                      </div>
                    </li>
                  ))
                )}
              </ul>
              <Link
                to="/notifications"
                className="block border-t border-border px-4 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wider text-vsm-red hover:bg-accent"
              >
                Voir toutes les notifications
              </Link>
            </div>
          )}
        </div>

        <div className="relative ml-2">
          <button
            onClick={() => setOpen(open === "user" ? null : "user")}
            className="flex items-center gap-2.5 rounded-lg border border-border bg-surface py-1.5 pl-1.5 pr-3 transition-colors hover:bg-accent"
          >
            <img src={displayAvatar} alt="" className="h-7 w-7 rounded-md bg-accent object-cover" />
            <div className="hidden text-left sm:block">
              <p className="text-xs font-semibold leading-tight">{displayName}</p>
              <p className="text-[10px] uppercase tracking-wider text-vsm-red">{displayLevel}</p>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
          {open === "user" && (
            <div className="animate-fade-up absolute right-0 top-12 w-56 overflow-hidden rounded-xl border border-border bg-popover shadow-elegant">
              <div className="border-b border-border px-4 py-3">
                <p className="text-sm font-semibold">{displayName}</p>
                <p className="text-xs text-muted-foreground">{displayBadge}</p>
              </div>
              <ul className="py-1 text-sm">
                <li>
                  <Link to="/profil" className="block px-4 py-2 hover:bg-accent">
                    Mon profil
                  </Link>
                </li>
                <li>
                  <Link to="/parametres" className="block px-4 py-2 hover:bg-accent">
                    Paramètres
                  </Link>
                </li>
                <li>
                  <Link to="/certificats" className="block px-4 py-2 hover:bg-accent">
                    Mes certificats
                  </Link>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
