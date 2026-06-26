import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Award, Download, Share2, ShieldCheck, X } from "lucide-react";
import { certificateRecords, badges, type CertificateRecord } from "@/lib/academy-data";

export const Route = createFileRoute("/_app/certificats")({
  component: CertificatesPage,
});

function CertificatesPage() {
  const [open, setOpen] = useState<CertificateRecord | null>(null);

  return (
    <div className="space-y-8">
      <header>
        <p className="mb-1 inline-flex items-center gap-2 rounded-full border border-vsm-red/30 bg-vsm-red/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-vsm-red">
          <ShieldCheck className="h-3 w-3" /> Certifications officielles
        </p>
        <h1 className="font-display text-3xl font-bold uppercase tracking-wide md:text-4xl">Certificats</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {certificateRecords.length} certifications obtenues · Téléchargeables et partageables
        </p>
      </header>

      {/* Badges */}
      <section>
        <h2 className="mb-4 font-display text-lg font-bold uppercase tracking-wide">Badges débloqués</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {badges.map((b) => (
            <div
              key={b.id}
              className={`relative overflow-hidden rounded-xl border p-4 text-center transition ${
                b.unlocked ? "border-vsm-red/40 bg-surface" : "border-border bg-surface opacity-60"
              }`}
            >
              <div className={`mx-auto grid h-12 w-12 place-items-center rounded-xl ${b.unlocked ? "bg-gradient-to-br from-vsm-red to-vsm-red-glow shadow-glow-red" : "bg-background"}`}>
                <Award className={`h-5 w-5 ${b.unlocked ? "text-white" : "text-muted-foreground"}`} />
              </div>
              <p className="mt-2 text-sm font-semibold">{b.name}</p>
              <p className="text-[11px] text-muted-foreground">{b.description}</p>
              <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-vsm-red">{b.tier}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Certificates */}
      <section>
        <h2 className="mb-4 font-display text-lg font-bold uppercase tracking-wide">Mes certificats</h2>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {certificateRecords.map((c) => (
            <button
              key={c.id}
              onClick={() => setOpen(c)}
              className="group relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-surface to-surface-elevated p-5 text-left transition hover:-translate-y-0.5 hover:border-vsm-red/50 hover:shadow-glow-red"
            >
              <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-vsm-red/10 blur-3xl" />
              <div className="relative">
                <div className="flex items-center justify-between">
                  <span className="font-display text-xs font-bold uppercase tracking-[0.2em] text-vsm-red">VSM Academy</span>
                  <Award className="h-5 w-5 text-vsm-red" />
                </div>
                <h3 className="mt-3 font-display text-lg font-bold uppercase leading-tight tracking-wide">{c.parcoursTitle}</h3>
                <p className="mt-1 text-xs text-muted-foreground">Délivré à</p>
                <p className="text-sm font-semibold">{c.ambassadorName}</p>
                <div className="mt-4 flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>{c.date}</span>
                  <span className="font-mono">{c.serial}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      {open && <CertificateModal cert={open} onClose={() => setOpen(null)} />}
    </div>
  );
}

function CertificateModal({ cert, onClose }: { cert: CertificateRecord; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-background/80 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-3xl overflow-hidden rounded-2xl border border-border bg-surface shadow-elegant">
        <button onClick={onClose} className="absolute right-3 top-3 z-10 grid h-8 w-8 place-items-center rounded-md border border-border bg-background text-muted-foreground hover:text-foreground">
          <X className="h-4 w-4" />
        </button>

        {/* Printable area */}
        <div className="relative aspect-[1.5/1] bg-gradient-to-br from-background via-surface to-background p-8 md:p-12">
          <div className="absolute -left-20 -top-20 h-60 w-60 rounded-full bg-vsm-red/15 blur-3xl" />
          <div className="absolute -bottom-20 -right-20 h-60 w-60 rounded-full bg-vsm-red/10 blur-3xl" />
          <div className="relative grid h-full grid-rows-[auto_1fr_auto] border-2 border-vsm-red/40 p-6 md:p-10">
            <header className="flex items-center justify-between">
              <div>
                <p className="font-display text-xs font-bold uppercase tracking-[0.3em] text-vsm-red">VSM Collection</p>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Ambassador Academy</p>
              </div>
              <Award className="h-8 w-8 text-vsm-red" />
            </header>

            <div className="flex flex-col items-center justify-center text-center">
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Certificat de réussite</p>
              <h2 className="mt-3 font-display text-2xl font-bold uppercase tracking-wide md:text-4xl">{cert.parcoursTitle}</h2>
              <p className="mt-4 text-sm text-muted-foreground">Est officiellement décerné à</p>
              <p className="font-display text-2xl font-bold text-vsm-red md:text-3xl">{cert.ambassadorName}</p>
              <p className="mt-4 max-w-md text-xs text-muted-foreground">
                pour avoir complété avec excellence l'ensemble des modules, quiz et missions du parcours.
              </p>
            </div>

            <footer className="flex items-end justify-between text-[10px] uppercase tracking-wider text-muted-foreground">
              <div>
                <p>Date</p>
                <p className="text-sm text-foreground">{cert.date}</p>
              </div>
              <div className="text-center">
                {/* fake QR code */}
                <div className="mx-auto grid h-14 w-14 grid-cols-5 grid-rows-5 gap-px bg-foreground p-1">
                  {Array.from({ length: 25 }).map((_, i) => (
                    <span key={i} className={`${[0,2,3,5,7,8,11,13,16,17,19,22,24].includes(i) ? "bg-background" : "bg-foreground"}`} />
                  ))}
                </div>
                <p className="mt-1 font-mono">{cert.serial}</p>
              </div>
              <div className="text-right">
                <p className="font-display text-sm italic text-foreground">~ {cert.signature.split("·")[0].trim()}</p>
                <p>{cert.signature.split("·")[1]?.trim()}</p>
              </div>
            </footer>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2 border-t border-border bg-surface-elevated p-4">
          <button className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-semibold hover:bg-surface">
            <Share2 className="h-4 w-4" /> Partager
          </button>
          <button className="inline-flex items-center gap-2 rounded-lg bg-vsm-red px-4 py-2 text-sm font-semibold uppercase tracking-wider text-white shadow-glow-red hover:brightness-110">
            <Download className="h-4 w-4" /> Télécharger PDF
          </button>
        </div>
      </div>
    </div>
  );
}
