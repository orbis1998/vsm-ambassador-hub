/* Supabase typings incomplets pour tables gamification — requêtes validées en runtime. */
// @ts-nocheck
import { getSupabase } from "@/lib/supabase/client";
import { profileAvatarUrl } from "@/lib/program-tier";
import { invalidateProfileCache } from "@/services/profile.service";
import type { AcademyBadge, ActivityLogEntry, VsmChallenge, XpHistoryEntry } from "@/types/gamification";

/** Tables gamification absentes du typage Database généré. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function gamificationDb(): any {
  return getSupabase();
}

function isMissingTable(error: { code?: string } | null): boolean {
  return error?.code === "42P01" || error?.code === "PGRST205";
}

function formatDeadline(iso: string): string {
  try {
    const d = new Date(iso);
    const diff = d.getTime() - Date.now();
    if (diff <= 0) return "Terminé";
    const days = Math.ceil(diff / 86_400_000);
    if (days === 1) return "1 jour restant";
    if (days < 7) return `${days} jours restants`;
    return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
  } catch {
    return iso;
  }
}

async function fetchChallengeRanking(
  challengeId: string,
): Promise<VsmChallenge["ranking"]> {
  const supabase = gamificationDb();
  const { data: progressRows, error } = await supabase
    .from("academy_challenge_progress")
    .select("score, progress_percent, user_id")
    .eq("challenge_id", challengeId)
    .order("score", { ascending: false })
    .order("progress_percent", { ascending: false })
    .limit(10);

  if (error || !progressRows?.length) return [];

  const userIds = progressRows.map((r) => (r as { user_id: string }).user_id);
  const { data: profiles } = await getSupabase()
    .from("profiles")
    .select("id, full_name, name, avatar_url, email")
    .in("id", userIds);

  const profileMap = new Map(
    (profiles ?? []).map((p) => [(p as { id: string }).id, p as { full_name?: string; name?: string; avatar_url?: string; email?: string }]),
  );

  return progressRows.map((row, i) => {
    const r = row as { user_id: string; score: number; progress_percent: number };
    const p = profileMap.get(r.user_id);
    const name = p?.full_name?.trim() || p?.name?.trim() || "Ambassadeur";
    return {
      rank: i + 1,
      name,
      avatar: profileAvatarUrl(p?.avatar_url, p?.email ?? name),
      score: r.score || r.progress_percent,
    };
  });
}

export async function fetchChallengesWithProgress(userId: string): Promise<VsmChallenge[]> {
  const supabase = gamificationDb();
  const { data: challenges, error } = await supabase
    .from("academy_challenges")
    .select("*")
    .eq("is_active", true)
    .order("deadline");

  if (error) {
    if (isMissingTable(error)) return [];
    throw error;
  }
  if (!challenges?.length) return [];

  const ids = challenges.map((c) => (c as { id: string }).id);

  const [{ data: allProgress }, { data: myProgress }] = await Promise.all([
    supabase.from("academy_challenge_progress").select("challenge_id").in("challenge_id", ids),
    supabase
      .from("academy_challenge_progress")
      .select("challenge_id, progress_percent, completed_at")
      .eq("user_id", userId)
      .in("challenge_id", ids),
  ]);

  const participantCounts = new Map<string, number>();
  for (const row of allProgress ?? []) {
    const cid = (row as { challenge_id: string }).challenge_id;
    participantCounts.set(cid, (participantCounts.get(cid) ?? 0) + 1);
  }

  const myByChallenge = new Map(
    (myProgress ?? []).map((r) => [
      (r as { challenge_id: string }).challenge_id,
      r as { progress_percent: number; completed_at: string | null },
    ]),
  );

  const result: VsmChallenge[] = [];
  for (const raw of challenges) {
    const c = raw as {
      id: string;
      title: string;
      description: string;
      type: VsmChallenge["type"];
      goal: string;
      reward_xp: number;
      reward_points: number;
      deadline: string;
    };
    const mine = myByChallenge.get(c.id);
    const ranking = await fetchChallengeRanking(c.id);
    result.push({
      id: c.id,
      title: c.title,
      description: c.description,
      type: c.type,
      goal: c.goal,
      reward_xp: c.reward_xp,
      reward_points: c.reward_points,
      deadline: formatDeadline(c.deadline),
      participants: participantCounts.get(c.id) ?? 0,
      progress: mine?.progress_percent ?? 0,
      joined: Boolean(mine),
      ranking,
    });
  }
  return result;
}

export async function joinChallenge(userId: string, challengeId: string): Promise<void> {
  const supabase = gamificationDb();
  const { error } = await supabase.from("academy_challenge_progress").upsert(
    {
      user_id: userId,
      challenge_id: challengeId,
      progress_percent: 0,
      score: 0,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "challenge_id,user_id" },
  );
  if (error && !isMissingTable(error)) throw error;
}

export async function updateChallengeProgress(
  userId: string,
  challengeId: string,
  progressPercent: number,
  score?: number,
): Promise<void> {
  const supabase = gamificationDb();
  const completed = progressPercent >= 100;
  const { error } = await supabase.from("academy_challenge_progress").upsert(
    {
      user_id: userId,
      challenge_id: challengeId,
      progress_percent: Math.min(100, progressPercent),
      score: score ?? progressPercent,
      completed_at: completed ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "challenge_id,user_id" },
  );
  if (error && !isMissingTable(error)) throw error;
}

export async function fetchUserBadges(userId: string): Promise<AcademyBadge[]> {
  const supabase = gamificationDb();
  const { data, error } = await supabase
    .from("academy_user_badges")
    .select("earned_at, academy_badges(id, slug, title, description, icon_url, rarity, xp_reward)")
    .eq("user_id", userId)
    .order("earned_at", { ascending: false });

  if (error) {
    if (isMissingTable(error)) return [];
    throw error;
  }

  return (data ?? []).map((row) => {
    const b = (row as { academy_badges: AcademyBadge }).academy_badges;
    return { ...b, earned_at: (row as { earned_at: string }).earned_at };
  });
}

export async function fetchAllBadges(): Promise<AcademyBadge[]> {
  const supabase = gamificationDb();
  const { data, error } = await supabase.from("academy_badges").select("*").order("title");
  if (error) {
    if (isMissingTable(error)) return [];
    throw error;
  }
  return (data ?? []) as AcademyBadge[];
}

export async function fetchXpHistory(userId: string, limit = 20): Promise<XpHistoryEntry[]> {
  const supabase = gamificationDb();
  const { data, error } = await supabase
    .from("academy_xp_history")
    .select("id, amount, source, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    if (isMissingTable(error)) return [];
    throw error;
  }
  return (data ?? []) as XpHistoryEntry[];
}

export async function fetchActivityLogs(userId: string, limit = 15): Promise<ActivityLogEntry[]> {
  const supabase = gamificationDb();
  const { data, error } = await supabase
    .from("academy_activity_logs")
    .select("id, event_type, payload, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    if (isMissingTable(error)) return [];
    throw error;
  }
  return (data ?? []) as ActivityLogEntry[];
}

export async function awardXp(
  userId: string,
  amount: number,
  source: string,
  referenceId?: string,
): Promise<void> {
  if (amount <= 0) return;
  const supabase = gamificationDb();
  const { error } = await supabase.rpc("academy_award_xp", {
    p_user_id: userId,
    p_amount: amount,
    p_source: source,
    p_ref: referenceId ?? null,
  });
  if (error && !isMissingTable(error)) throw error;
  invalidateProfileCache();
}

export async function logActivity(
  userId: string,
  eventType: string,
  payload: Record<string, unknown> = {},
): Promise<void> {
  const supabase = gamificationDb();
  const { error } = await supabase.from("academy_activity_logs").insert({
    user_id: userId,
    event_type: eventType,
    payload,
  });
  if (error && !isMissingTable(error)) throw error;
}
