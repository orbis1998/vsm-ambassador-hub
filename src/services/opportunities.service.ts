// @ts-nocheck
import { getSupabase } from "@/lib/supabase/client";
import type { OpportunityApplication, OpportunityApplicationStatus } from "@/types/messaging";
import type { VsmOpportunity } from "@/types/opportunities";

const DEFAULT_OPP_IMAGE =
  "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&q=70&auto=format&fit=crop";

function opportunitiesDb() {
  return getSupabase();
}

function isMissingTable(error: { code?: string } | null): boolean {
  return error?.code === "42P01" || error?.code === "PGRST205";
}

export async function fetchMyApplications(userId: string): Promise<OpportunityApplication[]> {
  const db = opportunitiesDb();
  const { data, error } = await db
    .from("academy_opportunity_applications")
    .select("id, opportunity_id, user_id, status, message, created_at")
    .eq("user_id", userId);

  if (error) {
    if (isMissingTable(error)) return [];
    throw error;
  }
  return (data ?? []) as OpportunityApplication[];
}

export async function fetchOpportunitiesWithApplications(userId: string): Promise<VsmOpportunity[]> {
  const db = opportunitiesDb();
  const [{ data: opportunities, error }, applications] = await Promise.all([
    db
      .from("academy_opportunities")
      .select("*")
      .eq("is_published", true)
      .order("starts_at", { ascending: false }),
    fetchMyApplications(userId),
  ]);

  if (error) {
    if (isMissingTable(error)) return [];
    throw error;
  }

  const rows = opportunities ?? [];
  const ids = rows.map((r: { id: string }) => r.id);
  const appByOpp = new Map(applications.map((a) => [a.opportunity_id, a]));

  let applicantCounts = new Map<string, number>();
  if (ids.length) {
    const { data: apps } = await db
      .from("academy_opportunity_applications")
      .select("opportunity_id")
      .in("opportunity_id", ids);
    for (const a of apps ?? []) {
      const oid = (a as { opportunity_id: string }).opportunity_id;
      applicantCounts.set(oid, (applicantCounts.get(oid) ?? 0) + 1);
    }
  }

  return rows.map((raw: Record<string, unknown>) => {
    const id = String(raw.id);
    const mine = appByOpp.get(id);
    return {
      id,
      title: String(raw.title ?? ""),
      category: String(raw.category ?? "Mission"),
      image: String(raw.image_url ?? DEFAULT_OPP_IMAGE),
      description: String(raw.description ?? ""),
      location: String(raw.location ?? ""),
      starts_at: String(raw.starts_at ?? ""),
      ends_at: String(raw.ends_at ?? ""),
      slots: Number(raw.slots ?? 1),
      applicants: applicantCounts.get(id) ?? 0,
      conditions: Array.isArray(raw.conditions) ? (raw.conditions as string[]) : [],
      status: (raw.status as VsmOpportunity["status"]) ?? "open",
      reward: String(raw.reward ?? ""),
      my_application: (mine?.status as OpportunityApplicationStatus) ?? null,
      my_application_message: mine?.message ?? null,
    };
  });
}

export async function applyToOpportunity(
  userId: string,
  opportunityId: string,
  message?: string,
): Promise<void> {
  const db = opportunitiesDb();
  const { error } = await db.from("academy_opportunity_applications").upsert(
    {
      user_id: userId,
      opportunity_id: opportunityId,
      message: message?.trim() || null,
      status: "pending",
      updated_at: new Date().toISOString(),
    },
    { onConflict: "opportunity_id,user_id" },
  );
  if (error && !isMissingTable(error)) throw error;
}

export async function withdrawApplication(userId: string, opportunityId: string): Promise<void> {
  const db = opportunitiesDb();
  const { error } = await db
    .from("academy_opportunity_applications")
    .update({ status: "withdrawn", updated_at: new Date().toISOString() })
    .eq("user_id", userId)
    .eq("opportunity_id", opportunityId);
  if (error && !isMissingTable(error)) throw error;
}

export const APPLICATION_STATUS_LABELS: Record<OpportunityApplicationStatus, string> = {
  pending: "En attente",
  reviewing: "En revue",
  accepted: "Acceptée",
  rejected: "Refusée",
  withdrawn: "Retirée",
};
