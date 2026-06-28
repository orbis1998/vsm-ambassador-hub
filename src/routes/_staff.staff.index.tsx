import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  BookOpen,
  Trophy,
  Sparkles,
  Users,
  FolderOpen,
  FileText,
  GraduationCap,
  ClipboardList,
  ArrowRight,
} from "lucide-react";
import {
  adminFetchAllCourses,
  adminFetchChallenges,
  adminFetchApplications,
  adminFetchOpportunities,
  adminFetchQuizzes,
  adminFetchResources,
} from "@/services/admin-academy.service";
import { useIsBrowser } from "@/hooks/use-is-browser";

export const Route = createFileRoute("/_staff/staff/")({
  ssr: false,
  component: StaffDashboard,
});

function StaffDashboard() {
  const browser = useIsBrowser();
  const { data: courses = [] } = useQuery({ queryKey: ["admin-courses"], queryFn: adminFetchAllCourses, enabled: browser });
  const { data: challenges = [] } = useQuery({ queryKey: ["admin-challenges"], queryFn: adminFetchChallenges, enabled: browser });
  const { data: resources = [] } = useQuery({ queryKey: ["admin-resources"], queryFn: adminFetchResources, enabled: browser });
  const { data: opportunities = [] } = useQuery({ queryKey: ["admin-opportunities"], queryFn: adminFetchOpportunities, enabled: browser });
  const { data: quizzes = [] } = useQuery({ queryKey: ["admin-quizzes"], queryFn: () => adminFetchQuizzes(), enabled: browser });
  const { data: applications = [] } = useQuery({ queryKey: ["admin-applications"], queryFn: adminFetchApplications, enabled: browser });
  const { data: stats } = useQuery({
    queryKey: ["staff-stats"],
    enabled: browser,
    queryFn: async () => {
      const { getSupabase } = await import("@/lib/supabase/client");
      const db = getSupabase();
      const [posts, users, ambassadors] = await Promise.all([
        db.from("social_posts").select("*", { count: "exact", head: true }),
        db.from("profiles").select("*", { count: "exact", head: true }),
        db.from("user_roles").select("*", { count: "exact", head: true }).eq("role", "ambassador"),
      ]);
      return {
        posts: posts.count ?? 0,
        users: users.count ?? 0,
        ambassadors: ambassadors.count ?? 0,
      };
    },
  });

  const published = courses.filter((c) => c.is_published).length;
  const parcours = courses.filter((c) => c.is_parcours).length;
  const pendingApps = applications.filter((a) => a.status === "pending" || a.status === "reviewing").length;

  const kpis = [
    { label: "Formations", value: courses.length, sub: `${published} publiées`, icon: BookOpen, to: "/staff/academy" },
    { label: "Parcours", value: parcours, sub: "modules structurés", icon: GraduationCap, to: "/staff/academy" },
    { label: "Quiz", value: quizzes.length, sub: "évaluations", icon: ClipboardList, to: "/staff/academy" },
    { label: "Défis actifs", value: challenges.filter((c) => c.is_active).length, sub: `${challenges.length} total`, icon: Trophy, to: "/staff/academy" },
    { label: "Ressources", value: resources.length, sub: "templates & fichiers", icon: FolderOpen, to: "/staff/resources" },
    { label: "Opportunités", value: opportunities.length, sub: `${opportunities.filter((o) => o.is_published).length} publiées`, icon: Sparkles, to: "/staff/academy" },
    { label: "Candidatures", value: pendingApps, sub: `${applications.length} total`, icon: FileText, to: "/staff/applications" },
    { label: "Modération", value: stats?.posts ?? "—", sub: "publications", icon: Users, to: "/staff/moderation" },
  ];

  const quickActions = [
    { label: "Nouvelle formation", to: "/staff/academy" },
    { label: "Gérer les ressources", to: "/staff/resources" },
    { label: "Voir candidatures", to: "/staff/applications" },
    { label: "Modérer la communauté", to: "/staff/moderation" },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <header>
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-vsm-red">Administration VSM</p>
        <h1 className="font-display text-3xl font-bold uppercase tracking-wide">Centre de contrôle Academy</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Gestion complète des formations, ressources, opportunités, défis et modération — connecté à la même base que l&apos;espace ambassadeur.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((s) => {
          const Icon = s.icon;
          return (
            <Link key={s.label} to={s.to} className="rounded-xl border border-border bg-surface p-5 transition-colors hover:border-vsm-red/40">
              <Icon className="h-5 w-5 text-vsm-red" />
              <p className="mt-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{s.label}</p>
              <p className="font-display text-2xl font-bold">{s.value}</p>
              <p className="text-[11px] text-muted-foreground">{s.sub}</p>
            </Link>
          );
        })}
      </div>

      {stats && (
        <div className="rounded-xl border border-border bg-surface p-5">
          <h2 className="font-display text-lg font-bold uppercase">Vue plateforme</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <Stat label="Profils inscrits" value={stats.users} />
            <Stat label="Rôles ambassadeur" value={stats.ambassadors} />
            <Stat label="Publications communauté" value={stats.posts} />
          </div>
        </div>
      )}

      <div className="rounded-xl border border-border bg-surface p-5">
        <h2 className="font-display text-lg font-bold uppercase">Actions rapides</h2>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {quickActions.map((a) => (
            <Link
              key={a.label}
              to={a.to}
              className="flex items-center justify-between rounded-lg border border-border bg-background px-4 py-3 text-sm font-medium transition-colors hover:border-vsm-red/30"
            >
              {a.label}
              <ArrowRight className="h-4 w-4 text-vsm-red" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg bg-background p-4 text-center">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-2xl font-bold">{value}</p>
    </div>
  );
}
