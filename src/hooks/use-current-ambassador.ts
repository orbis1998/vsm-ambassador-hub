import { useAuth } from "@/providers/auth-provider";
import { profileAvatarUrl } from "@/lib/program-tier";
import type { AmbassadorPublic } from "@/types/profile";

/** Ambassadeur connecté mappé pour les composants communauté (remplace currentUser mock). */
export function useCurrentAmbassadorPublic(): AmbassadorPublic | null {
  const { profile } = useAuth();
  if (!profile) return null;
  return {
    id: profile.id,
    name: profile.name,
    handle: profile.handle,
    badge: profile.badge,
    avatar: profile.avatar || profileAvatarUrl(null, profile.email ?? profile.name),
    level: profile.level,
    xp: profile.xp,
    points: profile.points,
    country: profile.country,
  };
}
