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
  Flag,
  Download,
  TrendingUp,
} from "lucide-react";
import {
  adminFetchAllCourses,
  adminFetchChallenges,
  adminFetchApplications,
  adminFetchOpportunities,
  adminFetchQuizzes,
  adminFetchResources,
} from "@/services/admin-academy.service";
import { exportStatsCsv, fetchPlatformStats } from "@/services/admin-platform.service";
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
  const { data: platform } = useQuery({
    queryKey: ["staff-platform-stats"],
    queryFn: fetchPlatformStats,
    enabled: browser,
    refetchInterval: 60_000,
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
    { label: "Signalements", value: platform?.reports ?? "—", sub: "à traiter", icon: Flag, to: "/staff/reports" },
  ];

  const handleExport = () => {
    if (!platform) return;
    const blob = new Blob([exportStatsCsv(platform)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `vsm-academy-stats-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-vsm-red">Administration Premium</p>
          <h1 className="font-display text-3xl font-bold uppercase tracking-wide">Centre de contrôle</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Statistiques en temps réel, modération et gestion complète de la plateforme.
          </p>
        </div>
        {platform && (
          <button
            type="button"
            onClick={handleExport}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-xs font-semibold uppercase tracking-wider hover:border-vsm-red"
          >
            <Download className="h-4 w-4" /> Exporter CSV
          </button>
        )}
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

      {platform && (
        <>
          <div className="rounded-xl border border-border bg-surface p-5">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-vsm-red" />
              <h2 className="font-display text-lg font-bold uppercase">Vue plateforme</h2>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Stat label="Profils inscrits" value={platform.users} />
              <Stat label="Ambassadeurs" value={platform.ambassadors} />
              <Stat label="Nouveaux (7 jours)" value={platform.newUsers7d} />
              <Stat label="Publications" value={platform.posts} />
              <Stat label="Stories actives" value={platform.storiesActive} />
              <Stat label="Cours commencés" value={platform.courseProgress.started} />
              <Stat label="Cours terminés" value={platform.courseProgress.completed} />
              <Stat label="En cours" value={platform.courseProgress.inProgress} />
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <BarChart title="Publications (7 jours)" data={platform.postsByDay} />
            <BarChart title="Inscriptions (7 jours)" data={platform.signupsByDay} />
          </div>
        </>
      )}

      <div className="rounded-xl border border-border bg-surface p-5">
        <h2 className="font-display text-lg font-bold uppercase">Actions rapides</h2>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {[
            { label: "Publications signalées", to: "/staff/reports" },
            { label: "Modérer la communauté", to: "/staff/moderation" },
            { label: "Gérer l'académie", to: "/staff/academy" },
            { label: "Voir candidatures", to: "/staff/applications" },
          ].map((a) => (
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
      <p className="mt-1 font-display text-2xl font-bold">{value.toLocaleString()}</p>
    </div>
  );
}

function BarChart({ title, data }: { title: string; data: { date: string; count: number }[] }) {
  const max = Math.max(1, ...data.map((d) => d.count));
  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">{title}</h3>
      <div className="mt-4 flex h-32 items-end gap-2">
        {data.map((d) => (
          <div key={d.date} className="flex flex-1 flex-col items-center gap-1">
            <div
              className="w-full rounded-t-md bg-gradient-to-t from-vsm-red to-vsm-red-glow"
              style={{ height: `${Math.max(4, (d.count / max) * 100)}%` }}
              title={`${d.count}`}
            />
            <span className="text-[9px] text-muted-foreground">{d.date.slice(5)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
