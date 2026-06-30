import { BRAND_LOGO_SRC } from "@/lib/brand";

export function AppSplash() {
  return (
    <div className="grid min-h-screen place-items-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <img
          src={BRAND_LOGO_SRC}
          alt="VSM Academy"
          className="h-24 w-24 animate-pulse object-contain"
          width={96}
          height={96}
        />
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-vsm-red" />
      </div>
    </div>
  );
}
