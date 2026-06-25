interface Props {
  className?: string;
  showText?: boolean;
}

export function VsmLogo({ className = "", showText = true }: Props) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div className="relative grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-vsm-red to-vsm-red-glow shadow-[0_0_24px_-4px_var(--vsm-red)]">
        <svg viewBox="0 0 24 24" className="h-5 w-5 text-white" fill="currentColor" aria-hidden>
          <path d="M12 2 L3 7 L12 22 L21 7 Z M12 6.2 L17.4 8.6 L12 17.6 L6.6 8.6 Z" />
        </svg>
      </div>
      {showText && (
        <div className="flex flex-col leading-none">
          <span className="font-display text-base font-bold uppercase tracking-wider">
            VSM <span className="text-vsm-red">Academy</span>
          </span>
          <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Ambassador</span>
        </div>
      )}
    </div>
  );
}
