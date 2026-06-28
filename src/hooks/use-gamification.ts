import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/providers/auth-provider";
import {
  fetchChallengesWithProgress,
  fetchUserBadges,
  fetchXpHistory,
  fetchActivityLogs,
  joinChallenge,
} from "@/services/gamification.service";

export function useChallenges() {
  const { profile } = useAuth();
  const userId = profile?.userId;

  return useQuery({
    queryKey: ["challenges", userId],
    queryFn: () => fetchChallengesWithProgress(userId!),
    enabled: !!userId,
    staleTime: 60_000,
  });
}

export function useUserBadges() {
  const { profile } = useAuth();
  const userId = profile?.userId;

  return useQuery({
    queryKey: ["user-badges", userId],
    queryFn: () => fetchUserBadges(userId!),
    enabled: !!userId,
    staleTime: 120_000,
  });
}

export function useXpHistory(limit = 15) {
  const { profile } = useAuth();
  const userId = profile?.userId;

  return useQuery({
    queryKey: ["xp-history", userId, limit],
    queryFn: () => fetchXpHistory(userId!, limit),
    enabled: !!userId,
    staleTime: 60_000,
  });
}

export function useActivityLogs(limit = 10) {
  const { profile } = useAuth();
  const userId = profile?.userId;

  return useQuery({
    queryKey: ["activity-logs", userId, limit],
    queryFn: () => fetchActivityLogs(userId!, limit),
    enabled: !!userId,
    staleTime: 30_000,
  });
}

export function useJoinChallenge() {
  const { profile, refreshProfile } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (challengeId: string) => joinChallenge(profile!.userId, challengeId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["challenges"] });
      void refreshProfile();
    },
  });
}
