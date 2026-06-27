import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Bell, MessageSquare, Search, Menu, ChevronDown } from "lucide-react";
import { currentUser, notifications } from "@/lib/mock-data";


interface Props {
  onMenuClick: () => void;
}

export function Topbar({ onMenuClick }: Props) {
  const [open, setOpen] = useState<"notif" | "user" | null>(null);
  const unread = notifications.filter((n) => n.unread).length;

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-xl md:px-6">
      <button
        onClick={onMenuClick}
        className="grid h-10 w-10 place-items-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-accent hover:text-foreground lg:hidden"
        aria-label="Ouvrir le menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="relative hidden flex-1 max-w-md md:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          placeholder="Rechercher un cours, un ambassadeur…"
          className="h-10 w-full rounded-lg border border-border bg-surface pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-all focus:border-vsm-red/50 focus:ring-2 focus:ring-vsm-red/20"
        />
      </div>

      <div className="ml-auto flex items-center gap-1.5">
        <button
          className="relative grid h-10 w-10 place-items-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          aria-label="Messages"
        >
          <MessageSquare className="h-[18px] w-[18px]" />
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-vsm-red" />
        </button>

        <div className="relative">
          <button
            onClick={() => setOpen(open === "notif" ? null : "notif")}
            className="relative grid h-10 w-10 place-items-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            aria-label="Notifications"
          >
            <Bell className="h-[18px] w-[18px]" />
            {unread > 0 && (
              <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-vsm-red px-1 text-[10px] font-bold text-white shadow-[0_0_12px_var(--vsm-red)]">
                {unread}
              </span>
            )}
          </button>
          {open === "notif" && (
            <div className="animate-fade-up absolute right-0 top-12 w-80 overflow-hidden rounded-xl border border-border bg-popover shadow-elegant">
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <p className="text-sm font-semibold">Notifications</p>
                <span className="rounded-full bg-vsm-red/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-vsm-red">{unread} nouvelles</span>
              </div>
              <ul className="max-h-96 overflow-y-auto">
                {notifications.slice(0, 6).map((n) => (
                  <li key={n.id} className="border-b border-border/60 px-4 py-3 last:border-0 hover:bg-accent/50">
                    <div className="flex items-start gap-3">
                      {n.unread && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-vsm-red" />}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground">{n.title}</p>
                        <p className="mt-0.5 truncate text-xs text-muted-foreground">{n.body}</p>
                        <p className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">il y a {n.time}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="relative ml-2">
          <button
            onClick={() => setOpen(open === "user" ? null : "user")}
            className="flex items-center gap-2.5 rounded-lg border border-border bg-surface py-1.5 pl-1.5 pr-3 transition-colors hover:bg-accent"
          >
            <img src={currentUser.avatar} alt="" className="h-7 w-7 rounded-md bg-accent" />
            <div className="hidden text-left sm:block">
              <p className="text-xs font-semibold leading-tight">{currentUser.name}</p>
              <p className="text-[10px] uppercase tracking-wider text-vsm-red">{currentUser.level}</p>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
          {open === "user" && (
            <div className="animate-fade-up absolute right-0 top-12 w-56 overflow-hidden rounded-xl border border-border bg-popover shadow-elegant">
              <div className="border-b border-border px-4 py-3">
                <p className="text-sm font-semibold">{currentUser.name}</p>
                <p className="text-xs text-muted-foreground">{currentUser.badge}</p>
              </div>
              <ul className="py-1 text-sm">
                <li><a href="/profil" className="block px-4 py-2 hover:bg-accent">Mon profil</a></li>
                <li><a href="/parametres" className="block px-4 py-2 hover:bg-accent">Paramètres</a></li>
                <li><a href="/certificats" className="block px-4 py-2 hover:bg-accent">Mes certificats</a></li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
