import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { GraduationCap, LayoutDashboard, LogOut, FileText, Users, FolderOpen } from "lucide-react";
import { Link, useRouterState } from "@tanstack/react-router";
import { useAuth } from "@/providers/auth-provider";
import { checkIsAdmin } from "@/services/staff-auth.service";
import { VsmLogo } from "@/components/vsm-logo";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const Route = createFileRoute("/_staff")({
  ssr: false,
  component: StaffLayout,
});

const nav = [
  { to: "/staff", label: "Tableau de bord", icon: LayoutDashboard, end: true },
  { to: "/staff/academy", label: "Académie", icon: GraduationCap },
  { to: "/staff/applications", label: "Candidatures", icon: FileText },
  { to: "/staff/moderation", label: "Modération", icon: Users },
  { to: "/staff/resources", label: "Ressources", icon: FolderOpen },
] as const;

function StaffLayout() {
  const navigate = useNavigate();
  const { session, loading, signOut } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const configured = isSupabaseConfigured();

  const { data: isAdmin, isLoading: checkingAdmin } = useQuery({
    queryKey: ["staff-admin", session?.user.id],
    queryFn: () => checkIsAdmin(session!.user.id),
    enabled: typeof window !== "undefined" && !!session?.user.id,
  });

  useEffect(() => {
    if (!configured) {
      navigate({ to: "/login" });
      return;
    }
    if (!loading && !session) {
      navigate({ to: "/login" });
    }
  }, [configured, loading, session, navigate]);

  useEffect(() => {
    if (!loading && session && !checkingAdmin && isAdmin === false) {
      navigate({ to: "/login" });
    }
  }, [loading, session, checkingAdmin, isAdmin, navigate]);

  if (!configured || loading || !session || checkingAdmin || !isAdmin) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-vsm-red" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="flex w-64 shrink-0 flex-col border-r border-border bg-sidebar">
        <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-5">
          <VsmLogo />
          <span className="rounded bg-vsm-red/15 px-1.5 py-0.5 text-[9px] font-bold uppercase text-vsm-red">Staff</span>
        </div>
        <nav className="flex-1 space-y-0.5 p-3">
          {nav.map((item) => {
            const Icon = item.icon;
            const active = item.end ? pathname === item.to : pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm ${active ? "bg-sidebar-accent font-semibold" : "text-muted-foreground hover:bg-sidebar-accent/60"}`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-sidebar-border p-3">
          <button
            type="button"
            onClick={() => void signOut().then(() => navigate({ to: "/login" }))}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:bg-sidebar-accent/60"
          >
            <LogOut className="h-4 w-4" />
            Déconnexion
          </button>
        </div>
      </aside>
      <main className="min-w-0 flex-1 overflow-y-auto p-6 md:p-8">
        <Outlet />
      </main>
    </div>
  );
}
