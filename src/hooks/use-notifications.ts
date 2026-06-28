import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/providers/auth-provider";
import {
  countUnreadMessages,
  countUnreadNotifications,
  fetchNotifications,
  subscribeToNotifications,
} from "@/services/notifications.service";

function useAuthUserId(): string | undefined {
  const { session, profile } = useAuth();
  return profile?.userId ?? session?.user?.id;
}

export function useNotifications(limit = 6) {
  const userId = useAuthUserId();
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["notifications", userId, limit],
    queryFn: () => fetchNotifications(userId!, limit),
    enabled: !!userId,
    staleTime: 10_000,
  });

  useEffect(() => {
    if (!userId) return;
    return subscribeToNotifications(userId, () => {
      qc.invalidateQueries({ queryKey: ["notifications", userId] });
      qc.invalidateQueries({ queryKey: ["notifications-unread-count", userId] });
    });
  }, [userId, qc]);

  return query;
}

export function useUnreadNotificationCount() {
  const userId = useAuthUserId();

  return useQuery({
    queryKey: ["notifications-unread-count", userId],
    queryFn: () => countUnreadNotifications(userId!),
    enabled: !!userId,
    staleTime: 10_000,
    refetchInterval: 45_000,
  });
}

export function useUnreadMessageCount() {
  const userId = useAuthUserId();

  return useQuery({
    queryKey: ["messages-unread-count", userId],
    queryFn: () => countUnreadMessages(userId!),
    enabled: !!userId,
    staleTime: 15_000,
    refetchInterval: 30_000,
  });
}
