import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/providers/auth-provider";
import {
  fetchUserCertificates,
  mapCertificateToRecord,
} from "@/services/certificates.service";
import type { CertificateRecord } from "@/types/academy";

export function useCertificates() {
  const { profile } = useAuth();
  const userId = profile?.userId;
  const ambassadorName = profile?.name ?? "Ambassadeur";

  return useQuery({
    queryKey: ["certificates", userId, ambassadorName],
    queryFn: async (): Promise<CertificateRecord[]> => {
      const rows = await fetchUserCertificates(userId!);
      return rows.map((c) => mapCertificateToRecord(c, ambassadorName));
    },
    enabled: !!userId,
    staleTime: 120_000,
  });
}
