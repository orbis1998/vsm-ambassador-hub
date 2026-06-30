import { BRAND_LOGO_SRC } from "@/lib/brand";

interface Props {
  className?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
}

const SIZE_CLASS = {
  sm: "h-8 w-8",
  md: "h-9 w-9",
  lg: "h-14 w-14",
  xl: "h-24 w-24",
} as const;

export function VsmLogo({ className = "", showText = true, size = "md" }: Props) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <img
        src={BRAND_LOGO_SRC}
        alt="VSM Academy"
        className={`${SIZE_CLASS[size]} shrink-0 object-contain`}
        width={size === "xl" ? 96 : size === "lg" ? 56 : size === "sm" ? 32 : 36}
        height={size === "xl" ? 96 : size === "lg" ? 56 : size === "sm" ? 32 : 36}
      />
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
