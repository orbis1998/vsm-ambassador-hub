import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { getSupabase } from "@/lib/supabase/client";
import { profileAvatarUrl, type AmbassadorProgramTier } from "@/lib/program-tier";
import {
  enrichProfilesWithBadges,
  fetchProgramAmbassadorProfile,
  fetchProgramTier as fetchProgramTierFromProfile,
} from "@/services/profile.service";
import { mapProfileToPublic, type AmbassadorPublic, type ProfileRow } from "@/types/profile";

const PROFILE_COLUMNS =
  "id,role,name,full_name,phone,email,avatar_url,cover_url,handle,level,xp,points,country,bio";

type RpcProfile = {
  id: string;
  role: string;
  name: string;
  email: string | null;
  badge: string;
  handle: string;
  avatar_url: string;
  level: string;
  xp: number;
  points: number;
  country: string;
  bio: string | null;
};

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

async function resolveProgramTier(userId: string): Promise<AmbassadorProgramTier | string> {
  return fetchProgramTierFromProfile(userId);
}

async function fetchRpcProfile(userId: string): Promise<RpcProfile | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase.rpc("get_ambassador_program_profile", { p_user_id: userId });
  if (error || !data || typeof data !== "object") return null;
  return data as RpcProfile;
}

function resolveDisplayName(row: ProfileRow, rpc?: RpcProfile | null): string {
  const fromRpc = rpc?.name?.trim();
  if (fromRpc && fromRpc !== "Ambassadeur") return fromRpc;
  return (
    row.full_name?.trim() ||
    row.name?.trim() ||
    fromRpc ||
    row.email?.split("@")[0] ||
    "Ambassadeur"
  );
}

function toPublic(row: ProfileRow, programTier?: AmbassadorProgramTier | string, rpc?: RpcProfile | null): AmbassadorPublic {
  const displayName = resolveDisplayName(row, rpc);
  return mapProfileToPublic(
    { ...row, full_name: displayName, name: displayName },
    {
      programTier: (programTier ?? rpc?.level ?? "Starter") as AmbassadorProgramTier,
      avatar: profileAvatarUrl(row.avatar_url ?? rpc?.avatar_url, row.email ?? displayName),
    },
  );
}

export async function fetchAmbassadors(limit = 50): Promise<AmbassadorPublic[]> {
  const rows = await fetchAmbassadorProfiles(limit);
  const results = await Promise.all(
    rows.map(async (row) => {
      const [rpc, programTier] = await Promise.all([
        fetchRpcProfile(row.id),
        resolveProgramTier(row.id),
      ]);
      const [enriched] = await enrichProfilesWithBadges([
        {
          ...row,
          full_name: resolveDisplayName(row, rpc),
          name: resolveDisplayName(row, rpc),
          ambassadorBadge: rpc?.badge || row.ambassadorBadge,
          handle: rpc?.handle || row.handle,
        },
      ]);
      return toPublic(enriched, programTier, rpc);
    }),
  );
  return results.sort((a, b) => b.xp - a.xp);
}

export async function fetchAmbassadorById(id: string): Promise<AmbassadorPublic | null> {
  const supabase = getSupabase();
  const [rpc, programTier, profileResult] = await Promise.all([
    fetchRpcProfile(id),
    resolveProgramTier(id),
    fetchProgramAmbassadorProfile(id).catch(() => null),
  ]);

  const { data, error } = await supabase.from("profiles").select(PROFILE_COLUMNS).eq("id", id).maybeSingle();
  if (error) throw error;

  const baseRow = (data as ProfileRow | null) ?? {
    id,
    role: "ambassador",
    name: profileResult?.name ?? rpc?.name ?? null,
    full_name: profileResult?.name ?? rpc?.name ?? null,
    phone: profileResult?.phone ?? null,
    email: profileResult?.email ?? rpc?.email ?? null,
    avatar_url: null,
    cover_url: null,
    handle: profileResult?.handle ?? rpc?.handle ?? null,
    level: programTier as string,
    xp: profileResult?.xp ?? rpc?.xp ?? 0,
    points: profileResult?.points ?? rpc?.points ?? 0,
    country: profileResult?.country ?? rpc?.country ?? "",
    bio: profileResult?.bio ?? rpc?.bio ?? null,
  };

  const [enriched] = await enrichProfilesWithBadges([
    {
      ...baseRow,
      full_name: resolveDisplayName(baseRow, rpc),
      name: resolveDisplayName(baseRow, rpc),
      ambassadorBadge: profileResult?.badge || rpc?.badge,
    },
  ]);

  return toPublic(enriched, programTier, rpc);
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

export { tierFromConfirmedSales } from "@/lib/program-tier";
