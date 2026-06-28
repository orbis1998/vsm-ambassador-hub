import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { useIsBrowser } from "@/hooks/use-is-browser";
import {
  adminFetchApplications,
  adminUpdateApplication,
  type AdminApplicationRow,
} from "@/services/admin-academy.service";

export const Route = createFileRoute("/_staff/staff/applications")({
  ssr: false,
  component: StaffApplicationsPage,
});

const STATUS_LABELS: Record<string, string> = {
  pending: "En attente",
  reviewing: "En revue",
  accepted: "Acceptée",
  rejected: "Refusée",
  withdrawn: "Retirée",
};

function StaffApplicationsPage() {
  const browser = useIsBrowser();
  const qc = useQueryClient();
  const { data: applications = [], isLoading } = useQuery({
    queryKey: ["admin-applications"],
    queryFn: adminFetchApplications,
    enabled: browser,
  });

  const update = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => adminUpdateApplication(id, { status }),
    onSuccess: () => {
      toast.success("Candidature mise à jour");
      void qc.invalidateQueries({ queryKey: ["admin-applications"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Erreur"),
  });

  const pending = applications.filter((a) => a.status === "pending" || a.status === "reviewing");

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header>
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-vsm-red">Opportunités</p>
        <h1 className="font-display text-3xl font-bold uppercase tracking-wide">Candidatures</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {pending.length} en attente · {applications.length} au total
        </p>
      </header>

      {isLoading ? (
        <div className="grid min-h-[30vh] place-items-center">
          <Loader2 className="h-8 w-8 animate-spin text-vsm-red" />
        </div>
      ) : (
        <div className="space-y-3">
          {applications.map((app) => (
            <ApplicationCard key={app.id} app={app} onStatus={(status) => update.mutate({ id: app.id, status })} />
          ))}
          {!applications.length && (
            <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              Aucune candidature pour le moment.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function ApplicationCard({
  app,
  onStatus,
}: {
  app: AdminApplicationRow;
  onStatus: (status: string) => void;
}) {
  const name = app.profile?.full_name || app.profile?.name || app.profile?.email || "Ambassadeur";
  const oppTitle = app.opportunity?.title ?? "Opportunité";

  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-semibold">{name}</p>
          <p className="text-sm text-muted-foreground">{oppTitle}</p>
          {app.message && <p className="mt-2 text-sm">{app.message}</p>}
          <p className="mt-2 text-[10px] uppercase tracking-wider text-muted-foreground">
            {STATUS_LABELS[app.status] ?? app.status} · {new Date(app.created_at).toLocaleDateString("fr-FR")}
          </p>
        </div>
        {(app.status === "pending" || app.status === "reviewing") && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onStatus("accepted")}
              className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-[10px] font-bold uppercase text-white"
            >
              <Check className="h-3 w-3" /> Accepter
            </button>
            <button
              type="button"
              onClick={() => onStatus("rejected")}
              className="inline-flex items-center gap-1 rounded-lg border border-destructive/40 px-3 py-1.5 text-[10px] font-bold uppercase text-destructive"
            >
              <X className="h-3 w-3" /> Refuser
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
