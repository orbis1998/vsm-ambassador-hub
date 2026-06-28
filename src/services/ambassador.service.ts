import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { getSupabase } from "@/lib/supabase/client";
import { profileAvatarUrl, tierFromConfirmedSales, type AmbassadorProgramTier } from "@/lib/program-tier";
import { enrichProfilesWithBadges, fetchProgramTier as fetchProgramTierFromProfile } from "@/services/profile.service";
import { mapProfileToPublic, type AmbassadorPublic, type ProfileRow } from "@/types/profile";

const PROFILE_COLUMNS =
  "id,role,name,full_name,phone,email,avatar_url,cover_url,handle,level,xp,points,country,bio";

async function fetchAmbassadorProfiles(limit: number): Promise<ProfileRow[]> {
  const supabase = getSupabase();

  const { data: fromView, error: viewError } = await supabase
    .from("academy_leaderboard")
    .select("*")
    .limit(limit);

  if (!viewError && fromView?.length) {
    return fromView.map((r) => ({
      id: r.id,
      role: "ambassador",
      name: r.name,
      full_name: r.name,
      phone: null,
      email: null,
      ambassadorBadge: r.badge,
      handle: r.handle,
      avatar_url: r.avatar_url,
      level: r.level,
      xp: r.xp,
      points: r.points,
      country: r.country,
    })) as ProfileRow[];
  }

  const { data: roleRows } = await supabase
    .from("user_roles")
    .select("user_id")
    .eq("role", "ambassador")
    .limit(limit);

  const ambassadorIds = (roleRows ?? []).map((r) => r.user_id);

  let query = supabase.from("profiles").select(PROFILE_COLUMNS);

  if (ambassadorIds.length > 0) {
    query = query.in("id", ambassadorIds);
  } else {
    query = query.or("role.eq.ambassador");
  }

  const { data, error } = await query.order("created_at", { ascending: false }).limit(limit);

  if (error) {
    const { data: basic } = await supabase.from("profiles").select("id,role,name,full_name,email,phone").limit(limit);
    return enrichProfilesWithBadges((basic ?? []) as ProfileRow[]);
  }

  return enrichProfilesWithBadges((data ?? []) as ProfileRow[]);
}

async function resolveProgramTier(userId: string, fallbackLevel?: string | null): Promise<AmbassadorProgramTier | string> {
  try {
    return await fetchProgramTierFromProfile(userId);
  } catch {
    return fallbackLevel ?? "Starter";
  }
}

function toPublic(row: ProfileRow, programTier?: AmbassadorProgramTier | string): AmbassadorPublic {
  const displayName = row.full_name ?? row.name ?? "Ambassadeur";
  return mapProfileToPublic(row, {
    programTier: (programTier ?? row.level ?? "Starter") as AmbassadorProgramTier,
    avatar: profileAvatarUrl(row.avatar_url, displayName),
  });
}

export async function fetchAmbassadors(limit = 50): Promise<AmbassadorPublic[]> {
  const rows = await fetchAmbassadorProfiles(limit);
  return rows.map((row) => toPublic(row, row.level)).sort((a, b) => b.xp - a.xp);
}

export async function fetchAmbassadorById(id: string): Promise<AmbassadorPublic | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase.from("profiles").select(PROFILE_COLUMNS).eq("id", id).maybeSingle();
  if (error) throw error;
  if (!data) return null;

  const [enriched] = await enrichProfilesWithBadges([data as ProfileRow]);
  const programTier = await resolveProgramTier(id, enriched.level);
  return toPublic(enriched, programTier);
}

export async function fetchLeaderboard(limit = 20): Promise<AmbassadorPublic[]> {
  return fetchAmbassadors(limit);
}

export function formatRelativeTime(isoDate: string): string {
  try {
    return formatDistanceToNow(new Date(isoDate), { addSuffix: true, locale: fr });
  } catch {
    return "";
  }
}

export { tierFromConfirmedSales };
