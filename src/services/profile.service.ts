/**
 * Profil Programme — 1 RPC prioritaire + cache mémoire (perf connexion).
 */
import type { User } from "@supabase/supabase-js";
import { getSupabase } from "@/lib/supabase/client";
import { profileAvatarUrl, tierFromConfirmedSales, type AmbassadorProgramTier } from "@/lib/program-tier";
import {
  mapProfileToAmbassador,
  type AmbassadorProfile,
  type ProfileRow,
} from "@/types/profile";

const PROFILE_SELECT =
  "id,role,name,full_name,phone,email,email_verified,phone_verified,created_at,updated_at,avatar_url,cover_url,bio,country,handle,xp,points,academy_progress";

const CACHE_TTL_MS = 45_000;
let profileCache: { userId: string; profile: AmbassadorProfile; expires: number } | null = null;

type LinkRow = { slug: string; active: boolean | null; created_at: string | null };

type ApplicationRow = {
  full_name: string | null;
  username: string | null;
  phone: string | null;
};

type RpcProgramProfile = {
  id: string;
  role: string;
  name: string;
  email: string | null;
  phone: string | null;
  badge: string;
  handle: string;
  avatar_url: string;
  bio: string | null;
  country: string;
  level: AmbassadorProgramTier;
  xp: number;
  points: number;
  academy_progress: number;
  is_ambassador: boolean;
  cover_url?: string | null;
};

export function invalidateProfileCache() {
  profileCache = null;
}

function readProfileCache(userId: string): AmbassadorProfile | null {
  if (!profileCache || profileCache.userId !== userId) return null;
  if (Date.now() > profileCache.expires) {
    profileCache = null;
    return null;
  }
  return profileCache.profile;
}

function writeProfileCache(userId: string, profile: AmbassadorProfile) {
  profileCache = { userId, profile, expires: Date.now() + CACHE_TTL_MS };
}

export function pickAmbassadorBadge(links: LinkRow[]): string {
  if (!links.length) return "";
  const sorted = [...links].sort((a, b) => {
    const activeDiff = Number(Boolean(b.active)) - Number(Boolean(a.active));
    if (activeDiff !== 0) return activeDiff;
    return (b.created_at ?? "").localeCompare(a.created_at ?? "");
  });
  return sorted[0]?.slug ?? "";
}

export function normalizeAmbassadorBadge(input: string): string {
  const cleaned = input.trim().toUpperCase().replace(/\s/g, "");
  if (cleaned.startsWith("VSM-")) return cleaned;
  if (cleaned.startsWith("VSM")) return `VSM-${cleaned.slice(3)}`;
  return cleaned;
}

function resolveDisplayName(
  row: ProfileRow,
  metaName?: string,
  application?: ApplicationRow | null,
): string {
  return (
    row.full_name?.trim() ||
    row.name?.trim() ||
    metaName?.trim() ||
    application?.full_name?.trim() ||
    row.email?.split("@")[0] ||
    "Ambassadeur"
  );
}

function resolveHandle(
  row: ProfileRow,
  displayName: string,
  application?: ApplicationRow | null,
): string {
  if (row.handle?.trim()) return row.handle.trim();
  if (application?.username?.trim()) return application.username.trim();
  return displayName.toLowerCase().replace(/\s+/g, ".").replace(/[^a-z0-9._-]/g, "");
}

function mapRpcProfile(row: RpcProgramProfile, metaName?: string): AmbassadorProfile {
  const displayName =
    metaName?.trim() && row.name === "Ambassadeur" ? metaName.trim() : row.name;
  const handle =
    row.handle?.trim() ||
    displayName.toLowerCase().replace(/\s+/g, ".").replace(/[^a-z0-9._-]/g, "");

  return {
    id: row.id,
    userId: row.id,
    name: displayName,
    handle,
    badge: row.badge,
    avatar: profileAvatarUrl(row.avatar_url, row.email ?? displayName),
    level: row.level,
    xp: row.xp,
    points: row.points,
    country: row.country ?? "",
    bio: row.bio ?? undefined,
    email: row.email ?? undefined,
    phone: row.phone ?? undefined,
    role: resolveAppRole(row.role, row.role === "admin", row.is_ambassador),
    academyProgress: row.academy_progress,
    cover: row.cover_url ?? undefined,
  };
}

async function fetchViaRpc(
  userId: string,
  metaName?: string,
): Promise<AmbassadorProfile | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase.rpc("get_ambassador_program_profile", {
    p_user_id: userId,
  });

  if (error || !data || typeof data !== "object") return null;
  return mapRpcProfile(data as RpcProgramProfile, metaName);
}

async function fetchAmbassadorLinks(userId: string): Promise<LinkRow[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("ambassador_links")
    .select("slug, active, created_at")
    .eq("ambassador_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    if (error.code === "42P01" || error.code === "PGRST205") return [];
    throw error;
  }
  return (data ?? []) as LinkRow[];
}

async function fetchApplication(userId: string): Promise<ApplicationRow | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("ambassador_applications")
    .select("full_name, username, phone")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    if (error.code === "42P01" || error.code === "PGRST205") return null;
    throw error;
  }
  return data as ApplicationRow | null;
}

async function fetchHasAmbassadorRole(userId: string): Promise<boolean> {
  const supabase = getSupabase();
  const { data, error } = await supabase.from("user_roles").select("role").eq("user_id", userId);

  if (error) {
    if (error.code === "42P01" || error.code === "PGRST205") return false;
    throw error;
  }
  return (data ?? []).some((r) => r.role === "ambassador");
}

async function fetchHasAdminRole(userId: string): Promise<boolean> {
  const supabase = getSupabase();
  const { data, error } = await supabase.from("user_roles").select("role").eq("user_id", userId);

  if (error) {
    if (error.code === "42P01" || error.code === "PGRST205") return false;
    throw error;
  }
  return (data ?? []).some((r) => r.role === "admin");
}

function resolveAppRole(profileRole: string | undefined, isAdmin: boolean, isAmbassador: boolean): string {
  if (isAdmin || profileRole === "admin") return "admin";
  if (isAmbassador || profileRole === "ambassador") return "ambassador";
  return profileRole ?? "user";
}

export async function fetchProgramTier(userId: string): Promise<AmbassadorProgramTier> {
  const supabase = getSupabase();
  const { data, error } = await supabase.rpc("get_ambassador_program_tier", { p_user_id: userId });

  if (!error && typeof data === "string") return data as AmbassadorProgramTier;

  const { data: salesData, error: salesError } = await supabase.rpc("ambassador_confirmed_sales_count", {
    _uid: userId,
  });
  if (!salesError && typeof salesData === "number") {
    return tierFromConfirmedSales(salesData);
  }

  return "Starter";
}

async function fetchViaLegacyQueries(
  userId: string,
  authUser?: User | null,
): Promise<AmbassadorProfile | null> {
  const supabase = getSupabase();
  const { data: row, error } = await supabase
    .from("profiles")
    .select(PROFILE_SELECT)
    .eq("id", userId)
    .maybeSingle();

  if (error || !row) return null;

  const metaName =
    typeof authUser?.user_metadata?.full_name === "string"
      ? authUser.user_metadata.full_name
      : undefined;

  const [links, hasAmbassadorRole, hasAdminRole, application, programTier] = await Promise.all([
    fetchAmbassadorLinks(userId),
    fetchHasAmbassadorRole(userId),
    fetchHasAdminRole(userId),
    fetchApplication(userId),
    fetchProgramTier(userId),
  ]);

  const profileRow = row as ProfileRow;
  const ambassadorBadge = pickAmbassadorBadge(links);
  const isAmbassador = hasAmbassadorRole || profileRow.role === "ambassador";
  const displayName = resolveDisplayName(profileRow, metaName, application);
  const phone = profileRow.phone?.trim() || application?.phone?.trim() || undefined;

  return mapProfileToAmbassador(
    {
      ...profileRow,
      phone: phone ?? profileRow.phone,
      full_name: profileRow.full_name ?? displayName,
    },
    {
      ambassadorBadge,
      programTier,
      role: resolveAppRole(profileRow.role, hasAdminRole, isAmbassador),
      displayName,
      handle: resolveHandle(profileRow, displayName, application),
      avatar: profileAvatarUrl(profileRow.avatar_url, profileRow.email ?? displayName),
    },
  );
}

export async function fetchProgramAmbassadorProfile(
  userId: string,
  authUser?: User | null,
): Promise<AmbassadorProfile | null> {
  const cached = readProfileCache(userId);
  if (cached) return cached;

  const metaName =
    typeof authUser?.user_metadata?.full_name === "string"
      ? authUser.user_metadata.full_name
      : undefined;

  const fromRpc = await fetchViaRpc(userId, metaName);
  const profile = fromRpc ?? (await fetchViaLegacyQueries(userId, authUser));

  if (profile) writeProfileCache(userId, profile);
  return profile;
}

export async function enrichProfilesWithBadges(rows: ProfileRow[]): Promise<ProfileRow[]> {
  if (!rows.length) return rows;
  const supabase = getSupabase();
  const ids = rows.map((r) => r.id);
  const { data: links, error } = await supabase
    .from("ambassador_links")
    .select("ambassador_id, slug, active, created_at")
    .in("ambassador_id", ids);

  if (error) return rows;

  const byUser = new Map<string, LinkRow[]>();
  for (const link of links ?? []) {
    const uid = (link as LinkRow & { ambassador_id: string }).ambassador_id;
    const list = byUser.get(uid) ?? [];
    list.push({
      slug: (link as { slug: string }).slug,
      active: (link as { active: boolean | null }).active,
      created_at: (link as { created_at: string | null }).created_at,
    });
    byUser.set(uid, list);
  }

  return rows.map((row) => ({
    ...row,
    ambassadorBadge: pickAmbassadorBadge(byUser.get(row.id) ?? []),
  }));
}

export interface AcademyProfileUpdate {
  bio?: string;
  handle?: string;
  country?: string;
  avatar_url?: string;
  cover_url?: string;
}

export async function updateAcademyProfile(
  userId: string,
  patch: AcademyProfileUpdate,
): Promise<AmbassadorProfile | null> {
  const supabase = getSupabase();
  const payload: Record<string, string> = {};
  if (patch.bio !== undefined) payload.bio = patch.bio.trim();
  if (patch.handle !== undefined) payload.handle = patch.handle.trim().replace(/^@/, "");
  if (patch.country !== undefined) payload.country = patch.country.trim();
  if (patch.avatar_url !== undefined) payload.avatar_url = patch.avatar_url;
  if (patch.cover_url !== undefined) payload.cover_url = patch.cover_url;

  if (Object.keys(payload).length === 0) return fetchProgramAmbassadorProfile(userId);

  const { error } = await supabase.from("profiles").update(payload).eq("id", userId);
  if (error) throw error;

  invalidateProfileCache();
  const profile = await fetchProgramAmbassadorProfile(userId);
  if (!profile) return null;

  const { data: row } = await supabase
    .from("profiles")
    .select("cover_url, avatar_url, bio, handle, country")
    .eq("id", userId)
    .maybeSingle();

  if (row) {
    const r = row as { cover_url?: string | null; avatar_url?: string | null; bio?: string | null; handle?: string | null; country?: string | null };
    if (r.bio != null) profile.bio = r.bio ?? undefined;
    if (r.cover_url) profile.cover = r.cover_url;
    if (r.handle) profile.handle = r.handle;
    if (r.country) profile.country = r.country;
    profile.avatar = profileAvatarUrl(r.avatar_url, profile.email ?? profile.name);
    writeProfileCache(userId, profile);
  }

  return profile;
}
