import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/providers/auth-provider";
import {
  applyToOpportunity,
  fetchOpportunitiesWithApplications,
  withdrawApplication,
} from "@/services/opportunities.service";

export function useOpportunitiesWithApplications() {
  const { profile } = useAuth();
  const userId = profile?.userId;

  return useQuery({
    queryKey: ["opportunities", userId],
    queryFn: () => fetchOpportunitiesWithApplications(userId!),
    enabled: !!userId,
    staleTime: 60_000,
  });
}

export function useOpportunityMutations() {
  const { profile } = useAuth();
  const userId = profile?.userId;
  const qc = useQueryClient();

  const apply = useMutation({
    mutationFn: ({ opportunityId, message }: { opportunityId: string; message?: string }) =>
      applyToOpportunity(userId!, opportunityId, message),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["opportunities"] }),
  });

  const withdraw = useMutation({
    mutationFn: (opportunityId: string) => withdrawApplication(userId!, opportunityId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["opportunities"] }),
  });

  return { apply, withdraw };
}
