/**
 * Types profil — source Programme Ambassadeur (profiles + ambassador_links + user_roles).
 * Badge officiel : ambassador_links.slug · Niveau : get_ambassador_program_tier (ventes).
 */
import type { AmbassadorProgramTier } from "@/lib/program-tier";
import { profileAvatarUrl } from "@/lib/program-tier";

export type { AmbassadorProgramTier };

/** @deprecated Utiliser AmbassadorProgramTier — paliers Academy gamification séparés */
export type AmbassadorLevel = AmbassadorProgramTier;

export interface ProfileRow {
  id: string;
  role: string;
  name: string | null;
  full_name: string | null;
  phone: string | null;
  email: string | null;
  email_verified: boolean | null;
  phone_verified: boolean | null;
  created_at: string | null;
  updated_at: string | null;
  badge?: string | null;
  ambassadorBadge?: string;
  handle?: string | null;
  avatar_url?: string | null;
  cover_url?: string | null;
  bio?: string | null;
  country?: string | null;
  xp?: number | null;
  points?: number | null;
  level?: string | null;
  academy_progress?: number | null;
}

export interface AmbassadorProfile {
  id: string;
  userId: string;
  name: string;
  handle: string;
  /** Numéro officiel Programme (VSM-XXXX) */
  badge: string;
  avatar: string;
  cover?: string;
  /** Palier Programme : Starter | Bronze | Silver | Elite */
  level: AmbassadorProgramTier;
  /** XP Academy (gamification formation) */
  xp: number;
  points: number;
  country: string;
  bio?: string;
  email?: string;
  phone?: string;
  role: string;
  academyProgress: number;
}

export function mapProfileToAmbassador(
  row: ProfileRow,
  opts?: {
    ambassadorBadge?: string;
    programTier?: AmbassadorProgramTier;
    role?: string;
    displayName?: string;
    handle?: string;
    avatar?: string;
  },
): AmbassadorProfile {
  const displayName = opts?.displayName ?? row.full_name ?? row.name ?? "Ambassadeur";
  return {
    id: row.id,
    userId: row.id,
    name: displayName,
    handle: opts?.handle ?? row.handle ?? displayName.toLowerCase().replace(/\s+/g, "."),
    badge: opts?.ambassadorBadge ?? row.ambassadorBadge ?? "",
    avatar: profileAvatarUrl(opts?.avatar ?? row.avatar_url, displayName),
    cover: row.cover_url ?? undefined,
    level: opts?.programTier ?? "Starter",
    xp: row.xp ?? 0,
    points: row.points ?? 0,
    country: row.country ?? "",
    bio: row.bio ?? undefined,
    email: row.email ?? undefined,
    phone: row.phone ?? undefined,
    role: opts?.role ?? row.role,
    academyProgress: row.academy_progress ?? 0,
  };
}

export interface AmbassadorPublic {
  id: string;
  name: string;
  handle: string;
  badge: string;
  avatar: string;
  cover?: string;
  level: AmbassadorProgramTier | string;
  xp: number;
  points: number;
  country: string;
  bio?: string;
}

export function mapProfileToPublic(
  row: ProfileRow,
  opts?: { programTier?: AmbassadorProgramTier | string; avatar?: string },
): AmbassadorPublic {
  const p = mapProfileToAmbassador(row, {
    programTier: opts?.programTier as AmbassadorProgramTier | undefined,
    avatar: opts?.avatar,
  });
  return {
    id: p.id,
    name: p.name,
    handle: p.handle,
    badge: p.badge,
    avatar: p.avatar,
    cover: p.cover,
    level: p.level,
    xp: p.xp,
    points: p.points,
    country: p.country,
    bio: p.bio,
  };
}
