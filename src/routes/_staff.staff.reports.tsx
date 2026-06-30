import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Flag, Trash2, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  adminDismissReport,
  adminFetchReports,
  adminHideReportedPost,
} from "@/services/admin-platform.service";
import { useIsBrowser } from "@/hooks/use-is-browser";

export const Route = createFileRoute("/_staff/staff/reports")({
  ssr: false,
  component: StaffReportsPage,
});

function StaffReportsPage() {
  const browser = useIsBrowser();
  const qc = useQueryClient();
  const { data: reports = [], isLoading } = useQuery({
    queryKey: ["admin-reports"],
    queryFn: adminFetchReports,
    enabled: browser,
  });

  const dismiss = useMutation({
    mutationFn: adminDismissReport,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["admin-reports"] });
      void qc.invalidateQueries({ queryKey: ["staff-platform-stats"] });
      toast.success("Signalement archivé");
    },
  });

  const hidePost = useMutation({
    mutationFn: ({ reportId, postId }: { reportId: string; postId: string }) =>
      adminHideReportedPost(reportId, postId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["admin-reports"] });
      void qc.invalidateQueries({ queryKey: ["staff-moderation-posts"] });
      toast.success("Publication supprimée");
    },
  });

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header>
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-vsm-red">Modération</p>
        <h1 className="font-display text-3xl font-bold uppercase tracking-wide">Publications signalées</h1>
        <p className="mt-1 text-sm text-muted-foreground">{reports.length} signalement(s) en attente</p>
      </header>

      {isLoading ? (
        <div className="grid place-items-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-vsm-red" />
        </div>
      ) : reports.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-surface p-12 text-center">
          <Flag className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">Aucun signalement pour le moment.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {reports.map((r) => (
            <li key={r.id} className="rounded-xl border border-border bg-surface p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold uppercase tracking-wider text-vsm-red">
                    Signalé par {r.reporter_name ?? "—"}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {new Date(r.created_at).toLocaleString("fr-FR")}
                    {r.reason ? ` · Motif : ${r.reason}` : ""}
                  </p>
                  <p className="mt-3 rounded-lg bg-background p-3 text-sm">
                    {r.post_text?.trim() || "(Publication sans texte ou déjà supprimée)"}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
                  <button
                    type="button"
                    disabled={!r.post_text || hidePost.isPending}
                    onClick={() => void hidePost.mutateAsync({ reportId: r.id, postId: r.post_id })}
                    className="inline-flex items-center justify-center gap-1 rounded-lg bg-destructive px-3 py-2 text-[10px] font-bold uppercase text-white disabled:opacity-40"
                  >
                    <EyeOff className="h-3.5 w-3.5" /> Masquer
                  </button>
                  <button
                    type="button"
                    onClick={() => void dismiss.mutateAsync(r.id)}
                    className="inline-flex items-center justify-center gap-1 rounded-lg border border-border px-3 py-2 text-[10px] font-bold uppercase hover:border-vsm-red"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Ignorer
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
