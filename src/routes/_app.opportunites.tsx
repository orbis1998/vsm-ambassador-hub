import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Sparkles, MapPin, Users, Calendar, CheckCircle2, Loader2 } from "lucide-react";
import type { VsmOpportunity } from "@/types/opportunities";
import { useOpportunities } from "@/hooks/use-social";
import { useOpportunityMutations } from "@/hooks/use-opportunities";
import { APPLICATION_STATUS_LABELS } from "@/services/opportunities.service";

export const Route = createFileRoute("/_app/opportunites")({
  component: OpportunitiesPage,
});

function OpportunitiesPage() {
  const [cat, setCat] = useState<string | "all">("all");
  const [active, setActive] = useState<string | null>(null);
  const [applicationMessage, setApplicationMessage] = useState("");
  const { data: opportunities = [], isLoading } = useOpportunities();
  const { apply, withdraw } = useOpportunityMutations();

  const categories = useMemo(
    () => ["all", ...Array.from(new Set(opportunities.map((o) => o.category)))],
    [opportunities],
  );

  const list = useMemo(
    () => (cat === "all" ? opportunities : opportunities.filter((o) => o.category === cat)),
    [cat, opportunities],
  );
  const current = active ? opportunities.find((o) => o.id === active) : null;

  const hasApplied = Boolean(current?.my_application && current.my_application !== "withdrawn");

  const handleApply = async () => {
    if (!current) return;
    await apply.mutateAsync({ opportunityId: current.id, message: applicationMessage });
    setApplicationMessage("");
  };

  if (isLoading) {
    return (
      <div className="grid min-h-[40vh] place-items-center">
        <Loader2 className="h-8 w-8 animate-spin text-vsm-red" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-lg bg-vsm-red/15 text-vsm-red">
          <Sparkles className="h-5 w-5" />
        </span>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-vsm-red">100% V S M Collection</p>
          <h1 className="font-display text-3xl font-bold uppercase tracking-wide md:text-4xl">Opportunités officielles</h1>
          <p className="mt-1 text-sm text-muted-foreground">Toutes les opportunités sont exclusives à V S M Collection.</p>
        </div>
      </header>

      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 text-xs">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={`whitespace-nowrap rounded-full border px-3 py-1.5 font-semibold uppercase tracking-wider transition-colors ${cat === c ? "border-vsm-red bg-vsm-red text-white shadow-glow-red" : "border-border text-muted-foreground hover:border-vsm-red/40 hover:text-foreground"}`}
          >
            {c === "all" ? "Toutes" : c}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-surface p-12 text-center text-sm text-muted-foreground">
          Aucune opportunité publiée pour le moment.
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {list.map((o) => (
            <OpportunityCard key={o.id} opportunity={o} onOpen={() => setActive(o.id)} />
          ))}
        </div>
      )}

      {current && (
        <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/85 p-4 backdrop-blur" onClick={() => setActive(null)}>
          <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-border bg-surface" onClick={(e) => e.stopPropagation()}>
            <div className="relative aspect-[16/9] overflow-hidden">
              <img src={current.image} alt="" className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent" />
              <div className="absolute inset-x-5 bottom-4 text-white">
                <p className="text-[11px] uppercase tracking-[0.2em] text-vsm-red">V S M Collection · {current.category}</p>
                <h2 className="mt-1 font-display text-2xl font-bold uppercase tracking-wide">{current.title}</h2>
              </div>
            </div>
            <div className="space-y-4 p-6">
              <p className="text-sm text-muted-foreground">{current.description}</p>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <Stat label="Lieu" value={current.location} />
                <Stat label="Récompense" value={current.reward} accent />
                <Stat label="Places" value={String(current.slots)} />
                <Stat label="Candidats" value={String(current.applicants)} />
              </div>
              {current.conditions.length > 0 && (
                <div>
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Conditions</p>
                  <ul className="space-y-1.5 text-sm">
                    {current.conditions.map((c) => (
                      <li key={c} className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-vsm-red" /> {c}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {current.starts_at && current.ends_at && (
                <div className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  {new Date(current.starts_at).toLocaleDateString("fr-FR")} → {new Date(current.ends_at).toLocaleDateString("fr-FR")}
                </div>
              )}

              {hasApplied ? (
                <div className="space-y-3 rounded-xl border border-vsm-red/30 bg-vsm-red/5 p-4">
                  <p className="text-sm font-semibold">
                    Candidature : {APPLICATION_STATUS_LABELS[current.my_application!]}
                  </p>
                  {current.my_application_message && (
                    <p className="text-xs text-muted-foreground">&laquo; {current.my_application_message} &raquo;</p>
                  )}
                  {current.my_application === "pending" && (
                    <button
                      disabled={withdraw.isPending}
                      onClick={() => void withdraw.mutateAsync(current.id)}
                      className="text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-vsm-red"
                    >
                      Retirer ma candidature
                    </button>
                  )}
                </div>
              ) : current.status === "open" ? (
                <div className="space-y-3">
                  <textarea
                    value={applicationMessage}
                    onChange={(e) => setApplicationMessage(e.target.value)}
                    placeholder="Message de motivation (optionnel)…"
                    className="min-h-[80px] w-full rounded-lg border border-border bg-background p-3 text-sm outline-none focus:border-vsm-red/50"
                  />
                  <button
                    disabled={apply.isPending}
                    onClick={() => void handleApply()}
                    className="w-full rounded-lg bg-vsm-red py-3 text-sm font-bold uppercase tracking-wider text-white shadow-glow-red disabled:opacity-50"
                  >
                    {apply.isPending ? "Envoi…" : "Postuler maintenant"}
                  </button>
                </div>
              ) : (
                <p className="text-center text-sm text-muted-foreground">Cette opportunité n&apos;accepte plus de candidatures.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function OpportunityCard({ opportunity: o, onOpen }: { opportunity: VsmOpportunity; onOpen: () => void }) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-border bg-surface transition-all hover:border-vsm-red/40 hover:shadow-glow-red">
      <div className="relative aspect-[16/10] overflow-hidden">
        <img src={o.image} alt="" className="h-full w-full object-cover transition-transform group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
        <span className="absolute left-3 top-3 rounded-full bg-vsm-red px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">{o.category}</span>
        {o.my_application && o.my_application !== "withdrawn" && (
          <span className="absolute right-3 top-3 rounded-full bg-emerald-500/90 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
            {APPLICATION_STATUS_LABELS[o.my_application]}
          </span>
        )}
        <div className="absolute inset-x-3 bottom-3 text-white">
          <h3 className="font-display text-lg font-bold uppercase tracking-wide drop-shadow">{o.title}</h3>
        </div>
      </div>
      <div className="space-y-3 p-4">
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {o.location || "—"}</span>
          <span className="inline-flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {o.slots} places · {o.applicants} candidats</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-display text-base font-bold text-vsm-red">{o.reward || "—"}</span>
          <button
            onClick={onOpen}
            className="rounded-lg border border-vsm-red px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-vsm-red hover:bg-vsm-red hover:text-white"
          >
            Détails
          </button>
        </div>
      </div>
    </article>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-lg bg-background p-3">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={`mt-0.5 font-semibold ${accent ? "text-vsm-red" : ""}`}>{value}</p>
    </div>
  );
}
