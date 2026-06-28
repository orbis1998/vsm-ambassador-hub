import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus, Trash2, Pencil, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useIsBrowser } from "@/hooks/use-is-browser";
import {
  adminDeleteResource,
  adminFetchResources,
  adminUpsertResource,
} from "@/services/admin-academy.service";

export const Route = createFileRoute("/_staff/staff/resources")({
  ssr: false,
  component: StaffResourcesPage,
});

function StaffResourcesPage() {
  const browser = useIsBrowser();
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Partial<Awaited<ReturnType<typeof adminFetchResources>>[0]> | null>(null);

  const { data: resources = [], isLoading } = useQuery({
    queryKey: ["admin-resources"],
    queryFn: adminFetchResources,
    enabled: browser,
  });

  const save = useMutation({
    mutationFn: () => adminUpsertResource({ ...editing!, title: editing!.title!, file_url: editing!.file_url! }),
    onSuccess: () => {
      toast.success("Ressource enregistrée");
      setEditing(null);
      void qc.invalidateQueries({ queryKey: ["admin-resources"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Erreur"),
  });

  const remove = useMutation({
    mutationFn: (id: string) => adminDeleteResource(id),
    onSuccess: () => {
      toast.success("Ressource supprimée");
      void qc.invalidateQueries({ queryKey: ["admin-resources"] });
    },
  });

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header>
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-vsm-red">Academy</p>
        <h1 className="font-display text-3xl font-bold uppercase tracking-wide">Ressources & templates</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Fichiers téléchargeables visibles dans l&apos;espace ambassadeur ({resources.length}).
        </p>
      </header>

      {isLoading ? (
        <div className="grid min-h-[30vh] place-items-center">
          <Loader2 className="h-8 w-8 animate-spin text-vsm-red" />
        </div>
      ) : (
        <div className="space-y-4">
          <button
            type="button"
            onClick={() => setEditing({ title: "", file_url: "", category: "template", is_published: true })}
            className="inline-flex items-center gap-2 rounded-lg bg-vsm-red px-4 py-2 text-xs font-bold uppercase text-white"
          >
            <Plus className="h-4 w-4" /> Nouvelle ressource
          </button>

          {editing && (
            <div className="space-y-3 rounded-xl border border-vsm-red/30 bg-surface p-4">
              <label className="block text-xs font-semibold uppercase text-muted-foreground">
                Titre
                <input
                  value={editing.title ?? ""}
                  onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                  className="mt-1 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm"
                />
              </label>
              <label className="block text-xs font-semibold uppercase text-muted-foreground">
                URL fichier
                <input
                  value={editing.file_url ?? ""}
                  onChange={(e) => setEditing({ ...editing, file_url: e.target.value })}
                  className="mt-1 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm"
                />
              </label>
              <label className="block text-xs font-semibold uppercase text-muted-foreground">
                Catégorie
                <input
                  value={editing.category ?? "template"}
                  onChange={(e) => setEditing({ ...editing, category: e.target.value })}
                  className="mt-1 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm"
                />
              </label>
              <label className="flex items-center gap-2 text-sm">
                <button
                  type="button"
                  onClick={() => setEditing({ ...editing, is_published: !editing.is_published })}
                  className={`grid h-5 w-5 place-items-center rounded border ${editing.is_published ? "border-vsm-red bg-vsm-red text-white" : "border-border"}`}
                >
                  {editing.is_published && <Check className="h-3 w-3" />}
                </button>
                Publié
              </label>
              <div className="flex gap-2">
                <button type="button" onClick={() => void save.mutate()} className="rounded-lg bg-vsm-red px-4 py-2 text-xs font-bold uppercase text-white">
                  Enregistrer
                </button>
                <button type="button" onClick={() => setEditing(null)} className="rounded-lg border border-border px-4 py-2 text-xs">
                  Annuler
                </button>
              </div>
            </div>
          )}

          {resources.map((r) => (
            <div key={r.id} className="flex items-center justify-between rounded-xl border border-border bg-surface p-4">
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{r.title}</p>
                <p className="text-xs text-muted-foreground">{r.category} · {r.is_published ? "Publié" : "Masqué"}</p>
                <a href={r.file_url} target="_blank" rel="noreferrer" className="mt-1 block truncate text-xs text-vsm-red hover:underline">
                  {r.file_url}
                </a>
              </div>
              <div className="flex shrink-0 gap-2">
                <button type="button" onClick={() => setEditing(r)} className="grid h-8 w-8 place-items-center rounded-lg border border-border">
                  <Pencil className="h-4 w-4" />
                </button>
                <button type="button" onClick={() => void remove.mutate(r.id)} className="grid h-8 w-8 place-items-center rounded-lg border border-destructive/30 text-destructive">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
