/**
 * Paliers Programme Ambassadeur — alignés sur get_ambassador_program_tier (migration 011).
 * Starter 0–10 · Bronze 11–15 · Silver 16–35 · Elite 36+
 */
export type AmbassadorProgramTier = "Starter" | "Bronze" | "Silver" | "Elite";

const TIER_THRESHOLDS: { minSales: number; tier: AmbassadorProgramTier }[] = [
  { minSales: 36, tier: "Elite" },
  { minSales: 16, tier: "Silver" },
  { minSales: 11, tier: "Bronze" },
  { minSales: 0, tier: "Starter" },
];

export function tierFromConfirmedSales(sales: number): AmbassadorProgramTier {
  for (const { minSales, tier } of TIER_THRESHOLDS) {
    if (sales >= minSales) return tier;
  }
  return "Starter";
}

export function profileAvatarUrl(
  avatar: string | null | undefined,
  seed: string,
): string {
  if (avatar?.trim()) return avatar;
  return `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(seed)}&backgroundColor=0a0a0a`;
}
