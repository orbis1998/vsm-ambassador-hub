import { createFileRoute, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppSidebar } from "@/components/app-sidebar";
import { MobileNav } from "@/components/mobile-nav";
import { Topbar } from "@/components/topbar";
import { useAuth } from "@/providers/auth-provider";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { checkIsAdmin } from "@/services/staff-auth.service";
import { useIsBrowser } from "@/hooks/use-is-browser";
import { X } from "lucide-react";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

function AppLayout() {
  const navigate = useNavigate();
  const browser = useIsBrowser();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isMessagesRoute = pathname.startsWith("/messages");
  const { session, loading, refreshProfile } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const configured = isSupabaseConfigured();

  const { data: isAdmin, isLoading: checkingAdmin } = useQuery({
    queryKey: ["app-is-admin", session?.user.id],
    queryFn: () => checkIsAdmin(session!.user.id),
    enabled: browser && !!session?.user.id,
  });

  useEffect(() => {
    if (!configured) {
      navigate({ to: "/login" });
      return;
    }
    if (!loading && !session) {
      navigate({ to: "/login" });
      return;
    }
    if (!loading && session && !checkingAdmin && isAdmin) {
      navigate({ to: "/staff" });
    }
  }, [configured, loading, session, checkingAdmin, isAdmin, navigate]);

  useEffect(() => {
    if (session?.user && !isAdmin) void refreshProfile();
  }, [session?.user?.id, isAdmin, refreshProfile]);

  if (!configured || loading || !session || checkingAdmin || isAdmin) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-vsm-red" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <AppSidebar />
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="animate-fade-up absolute inset-y-0 left-0 w-64">
            <AppSidebar onNavigate={() => setMobileOpen(false)} />
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-md border border-border bg-background text-muted-foreground"
              aria-label="Fermer le menu"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <Topbar onMenuClick={() => setMobileOpen(true)} />
        <main
          className={
            isMessagesRoute
              ? "flex min-h-0 flex-1 flex-col overflow-hidden p-0 md:px-6 md:py-8 md:pb-8"
              : "flex-1 px-4 py-6 pb-24 md:px-6 md:py-8 md:pb-8"
          }
        >
          <Outlet />
        </main>
        {!isMessagesRoute && <MobileNav />}
      </div>
    </div>
  );
}
