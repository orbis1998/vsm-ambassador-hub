/** Types gamification — alignés sur academy_challenges, academy_badges (migration 006). */

export interface VsmChallenge {
  id: string;
  title: string;
  description: string;
  type: "weekly" | "monthly" | "special";
  reward_xp: number;
  reward_points: number;
  deadline: string;
  participants: number;
  progress: number;
  goal: string;
  joined: boolean;
  ranking: { rank: number; name: string; avatar: string; score: number }[];
}

export interface AcademyBadge {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  icon_url: string | null;
  rarity: string;
  xp_reward: number;
  earned_at?: string;
}

export interface XpHistoryEntry {
  id: string;
  amount: number;
  source: string;
  created_at: string;
}

export interface ActivityLogEntry {
  id: string;
  event_type: string;
  payload: Record<string, unknown>;
  created_at: string;
}
