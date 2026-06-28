import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/providers/auth-provider";
import { fetchLeaderboard } from "@/services/ambassador.service";

export function useLeaderboard(limit = 10) {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ["leaderboard", limit],
    queryFn: () => fetchLeaderboard(limit),
    enabled: !!profile,
    staleTime: 60_000,
  });
}

export function useAmbassadors(limit = 50) {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ["ambassadors", limit],
    queryFn: () => fetchLeaderboard(limit),
    enabled: !!profile,
    staleTime: 60_000,
  });
}
