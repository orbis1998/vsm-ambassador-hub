/**
 * Réexports types communauté — les données viennent de Supabase via @/services/social.service.
 */
export type {
  ReactionKey,
  Post,
  PostMedia,
  Story,
  Comment,
  Group,
  NotificationFull,
} from "@/types/social";

export { REACTIONS, EMPTY_REACTIONS } from "@/types/social";

export type { VsmChallenge } from "@/types/gamification";
export type { VsmOpportunity, Conversation, Message } from "@/types/opportunities";

/** @deprecated Utiliser les services Supabase — conservé pour admin. */
export const SUPABASE_TABLES = [
  "profiles",
  "academy_courses",
  "academy_lessons",
  "academy_challenges",
  "academy_badges",
  "academy_certificates",
  "social_posts",
  "social_stories",
  "social_comments",
  "social_groups",
  "academy_notifications",
  "academy_opportunities",
] as const;
