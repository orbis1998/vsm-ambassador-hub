import type { LucideIcon } from "lucide-react";

interface Props {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  description: string;
}

export function ComingSoon({ icon: Icon, title, subtitle, description }: Props) {
  return (
    <div className="mx-auto max-w-3xl">
      <header className="mb-6 flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-lg bg-vsm-red/15 text-vsm-red">
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <h1 className="font-display text-3xl font-bold uppercase tracking-wide">{title}</h1>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
      </header>

      <div className="relative overflow-hidden rounded-2xl border border-border bg-surface p-10 text-center">
        <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-vsm-red/15 blur-3xl" />
        <div className="absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-vsm-red/10 blur-3xl" />
        <div className="relative">
          <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-vsm-red to-vsm-red-glow shadow-glow-red">
            <Icon className="h-7 w-7 text-white" />
          </div>
          <p className="mb-2 inline-flex items-center gap-2 rounded-full border border-vsm-red/30 bg-vsm-red/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-vsm-red">
            <span className="h-1.5 w-1.5 rounded-full bg-vsm-red animate-pulse-red" />
            Bientôt
          </p>
          <h2 className="font-display text-2xl font-bold uppercase tracking-wide">Module en préparation</h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
    </div>
  );
}
