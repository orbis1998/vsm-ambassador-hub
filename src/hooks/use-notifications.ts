import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/providers/auth-provider";
import {
  countUnreadMessages,
  countUnreadNotifications,
  fetchNotifications,
} from "@/services/notifications.service";

export function useNotifications(limit = 6) {
  const { profile } = useAuth();
  const userId = profile?.userId;

  return useQuery({
    queryKey: ["notifications", userId, limit],
    queryFn: () => fetchNotifications(userId!, limit),
    enabled: !!userId,
    staleTime: 30_000,
  });
}

export function useUnreadNotificationCount() {
  const { profile } = useAuth();
  const userId = profile?.userId;

  return useQuery({
    queryKey: ["notifications-unread-count", userId],
    queryFn: () => countUnreadNotifications(userId!),
    enabled: !!userId,
    staleTime: 15_000,
    refetchInterval: 60_000,
  });
}

export function useUnreadMessageCount() {
  const { profile } = useAuth();
  const userId = profile?.userId;

  return useQuery({
    queryKey: ["messages-unread-count", userId],
    queryFn: () => countUnreadMessages(userId!),
    enabled: !!userId,
    staleTime: 15_000,
    refetchInterval: 30_000,
  });
}
