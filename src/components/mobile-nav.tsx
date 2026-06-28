import { Home, Users, MessageSquare, GraduationCap, User } from "lucide-react";
import { Link, useRouterState } from "@tanstack/react-router";

const items = [
  { to: "/dashboard", label: "Accueil", icon: Home },
  { to: "/communaute", label: "Communauté", icon: Users },
  { to: "/messages", label: "Messages", icon: MessageSquare },
  { to: "/academie", label: "Academy", icon: GraduationCap },
  { to: "/profil", label: "Profil", icon: User },
] as const;

export function MobileNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-lg lg:hidden">
      <ul className="flex items-stretch justify-around">
        {items.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.to || pathname.startsWith(`${item.to}/`);
          return (
            <li key={item.to} className="flex-1">
              <Link
                to={item.to}
                className={`flex flex-col items-center gap-0.5 px-1 py-2.5 text-[10px] font-semibold uppercase tracking-wide ${active ? "text-vsm-red" : "text-muted-foreground"}`}
              >
                <Icon className={`h-5 w-5 ${active ? "text-vsm-red" : ""}`} />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
