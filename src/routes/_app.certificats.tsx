import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Award, Download, Share2, ShieldCheck, X, Loader2, ExternalLink } from "lucide-react";
import type { BadgeDef, CertificateRecord } from "@/types/academy";
import { useUserBadges } from "@/hooks/use-gamification";
import { useCertificates } from "@/hooks/use-certificates";
import { certificateQrImageUrl, certificateVerifyUrl } from "@/services/certificates.service";

export const Route = createFileRoute("/_app/certificats")({
  component: CertificatesPage,
});

function CertificatesPage() {
  const [open, setOpen] = useState<CertificateRecord | null>(null);
  const { data: earnedBadges = [], isLoading: loadingBadges } = useUserBadges();
  const { data: certificateRecords = [], isLoading: loadingCerts } = useCertificates();

  const badges: BadgeDef[] = earnedBadges.map((b) => ({
    id: b.id,
    name: b.title,
    description: b.description ?? "",
    icon: b.icon_url ?? "award",
    tier: "Bronze",
    unlocked: true,
  }));

  return (
    <div className="space-y-8">
      <header>
        <p className="mb-1 inline-flex items-center gap-2 rounded-full border border-vsm-red/30 bg-vsm-red/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-vsm-red">
          <ShieldCheck className="h-3 w-3" /> Certifications officielles
        </p>
        <h1 className="font-display text-3xl font-bold uppercase tracking-wide md:text-4xl">Certificats</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {certificateRecords.length} certification{certificateRecords.length !== 1 ? "s" : ""} obtenue{certificateRecords.length !== 1 ? "s" : ""} · Vérifiables par QR
        </p>
      </header>

      <section>
        <h2 className="mb-4 font-display text-lg font-bold uppercase tracking-wide">Badges débloqués</h2>
        {loadingBadges ? (
          <div className="grid place-items-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-vsm-red" />
          </div>
        ) : badges.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border bg-surface p-8 text-center text-sm text-muted-foreground">
            Aucun badge pour le moment. Complète des cours et défis pour en gagner !
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {badges.map((b) => (
              <div key={b.id} className="relative overflow-hidden rounded-xl border border-vsm-red/40 bg-surface p-4 text-center">
                <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-vsm-red to-vsm-red-glow shadow-glow-red">
                  <Award className="h-5 w-5 text-white" />
                </div>
                <p className="mt-2 text-sm font-semibold">{b.name}</p>
                <p className="text-[11px] text-muted-foreground">{b.description}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-4 font-display text-lg font-bold uppercase tracking-wide">Mes certificats</h2>
        {loadingCerts ? (
          <div className="grid place-items-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-vsm-red" />
          </div>
        ) : certificateRecords.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border bg-surface p-8 text-center text-sm text-muted-foreground">
            Aucun certificat pour le moment. Termine un parcours Académie pour en obtenir un.
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {certificateRecords.map((c) => (
              <button
                key={c.id}
                onClick={() => setOpen(c)}
                className="group relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-surface to-surface-elevated p-5 text-left transition hover:-translate-y-0.5 hover:border-vsm-red/50 hover:shadow-glow-red"
              >
                <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-vsm-red/10 blur-3xl" />
                <div className="relative flex gap-4">
                  {c.qrPayload && (
                    <img
                      src={certificateQrImageUrl(c.qrPayload, 64)}
                      alt="QR vérification"
                      className="h-16 w-16 shrink-0 rounded-lg border border-border bg-white p-1"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <span className="font-display text-xs font-bold uppercase tracking-[0.2em] text-vsm-red">VSM Academy</span>
                    <h3 className="mt-1 font-display text-lg font-bold uppercase leading-tight tracking-wide">{c.parcoursTitle}</h3>
                    <p className="mt-1 text-xs text-muted-foreground">{c.date}</p>
                    <p className="mt-2 font-mono text-[10px] text-muted-foreground">{c.serial}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      {open && <CertificateModal cert={open} onClose={() => setOpen(null)} />}
    </div>
  );
}

function CertificateModal({ cert, onClose }: { cert: CertificateRecord; onClose: () => void }) {
  const printRef = useRef<HTMLDivElement>(null);

  const handleDownload = () => {
    if (cert.pdfUrl) {
      window.open(cert.pdfUrl, "_blank", "noopener,noreferrer");
      return;
    }
    window.print();
  };

  const handleShare = async () => {
    const url = cert.qrPayload ? certificateVerifyUrl(cert.qrPayload) : window.location.href;
    if (navigator.share) {
      await navigator.share({
        title: `Certificat VSM — ${cert.parcoursTitle}`,
        text: `Certificat ${cert.serial} délivré à ${cert.ambassadorName}`,
        url,
      });
    } else {
      await navigator.clipboard.writeText(url);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-background/80 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-3xl overflow-hidden rounded-2xl border border-border bg-surface shadow-elegant">
        <button onClick={onClose} className="absolute right-3 top-3 z-10 grid h-8 w-8 place-items-center rounded-md border border-border bg-background text-muted-foreground hover:text-foreground">
          <X className="h-4 w-4" />
        </button>

        <div ref={printRef} className="relative aspect-[1.5/1] bg-gradient-to-br from-background via-surface to-background p-8 md:p-12">
          <div className="absolute -left-20 -top-20 h-60 w-60 rounded-full bg-vsm-red/15 blur-3xl" />
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
            </div>

            <footer className="flex items-end justify-between text-[10px] uppercase tracking-wider text-muted-foreground">
              <div>
                <p>Date</p>
                <p className="text-sm text-foreground">{cert.date}</p>
              </div>
              <div className="text-center">
                {cert.qrPayload ? (
                  <a href={certificateVerifyUrl(cert.qrPayload)} target="_blank" rel="noopener noreferrer">
                    <img
                      src={certificateQrImageUrl(cert.qrPayload, 80)}
                      alt="QR code vérification"
                      className="mx-auto rounded bg-white p-1"
                    />
                  </a>
                ) : null}
                <p className="mt-1 font-mono">{cert.serial}</p>
              </div>
              <div className="text-right">
                <p className="font-display text-sm italic text-foreground">{cert.signature.split("·")[0]?.trim()}</p>
              </div>
            </footer>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2 border-t border-border bg-surface-elevated p-4">
          {cert.qrPayload && (
            <a
              href={certificateVerifyUrl(cert.qrPayload)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-semibold hover:bg-surface"
            >
              <ExternalLink className="h-4 w-4" /> Vérifier
            </a>
          )}
          <button
            type="button"
            onClick={() => void handleShare()}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-semibold hover:bg-surface"
          >
            <Share2 className="h-4 w-4" /> Partager
          </button>
          <button
            type="button"
            onClick={handleDownload}
            className="inline-flex items-center gap-2 rounded-lg bg-vsm-red px-4 py-2 text-sm font-semibold uppercase tracking-wider text-white shadow-glow-red hover:brightness-110"
          >
            <Download className="h-4 w-4" /> {cert.pdfUrl ? "Télécharger PDF" : "Imprimer"}
          </button>
        </div>
      </div>
    </div>
  );
}
