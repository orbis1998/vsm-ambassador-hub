import { Link, useRouterState } from "@tanstack/react-router";
import {
  Home,
  GraduationCap,
  Users,
  MessageSquare,
  Trophy,
  Crown,
  Sparkles,
  Award,
  BookOpen,
  Bell,
  Search,
  User,
  Settings,
  Shield,
  LogOut,
} from "lucide-react";
import { VsmLogo } from "./vsm-logo";
import { signOut } from "@/lib/auth";
import { useNavigate } from "@tanstack/react-router";

const items = [
  { to: "/dashboard", label: "Accueil", icon: Home },
  { to: "/academie", label: "Académie", icon: GraduationCap },
  { to: "/communaute", label: "Communauté", icon: Users },
  { to: "/messages", label: "Messages", icon: MessageSquare },
  { to: "/defis", label: "Défis", icon: Trophy },
  { to: "/classement", label: "Classement", icon: Crown },
  { to: "/opportunites", label: "Opportunités", icon: Sparkles },
  { to: "/certificats", label: "Certificats", icon: Award },
  { to: "/ressources", label: "Ressources", icon: BookOpen },
  { to: "/notifications", label: "Notifications", icon: Bell },
  { to: "/recherche", label: "Recherche", icon: Search },
  { to: "/profil", label: "Profil", icon: User },
  { to: "/parametres", label: "Paramètres", icon: Settings },
  { to: "/admin", label: "Admin", icon: Shield },
] as const;


interface Props {
  onNavigate?: () => void;
}

export function AppSidebar({ onNavigate }: Props) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-border bg-sidebar">
      <div className="flex h-16 items-center border-b border-sidebar-border px-5">
        <VsmLogo />
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-5">
        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Navigation
        </p>
        <ul className="space-y-0.5">
          {items.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.to;
            return (
              <li key={item.to}>
                <Link
                  to={item.to}
                  onClick={onNavigate}
                  className={`group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all ${
                    active
                      ? "bg-sidebar-accent text-foreground"
                      : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground"
                  }`}
                >
                  {active && (
                    <span className="absolute left-0 top-1/2 h-6 w-0.5 -translate-y-1/2 rounded-r-full bg-vsm-red shadow-[0_0_12px_var(--vsm-red)]" />
                  )}
                  <Icon className="h-[18px] w-[18px] shrink-0" />
                  <span className="truncate font-medium">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <button
          onClick={() => {
            signOut();
            navigate({ to: "/login" });
          }}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-vsm-red"
        >
          <LogOut className="h-[18px] w-[18px]" />
          Déconnexion
        </button>
      </div>
    </aside>
  );
}
