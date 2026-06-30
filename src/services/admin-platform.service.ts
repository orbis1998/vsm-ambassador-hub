import { getSupabase } from "@/lib/supabase/client";

export type DailyCount = { date: string; count: number };

export type PlatformStats = {
  users: number;
  ambassadors: number;
  posts: number;
  reports: number;
  storiesActive: number;
  coursesStarted: number;
  coursesCompleted: number;
  newUsers7d: number;
  newUsers30d: number;
  postsByDay: DailyCount[];
  signupsByDay: DailyCount[];
  courseProgress: { started: number; completed: number; inProgress: number };
};

function db() {
  return getSupabase();
}

function bucketByDay(rows: { created_at: string }[], days = 7): DailyCount[] {
  const map = new Map<string, number>();
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    map.set(d.toISOString().slice(0, 10), 0);
  }
  for (const row of rows) {
    const key = row.created_at.slice(0, 10);
    if (map.has(key)) map.set(key, (map.get(key) ?? 0) + 1);
  }
  return [...map.entries()].map(([date, count]) => ({ date, count }));
}

export async function fetchPlatformStats(): Promise<PlatformStats> {
  const supabase = db();
  const since30 = new Date(Date.now() - 30 * 86400000).toISOString();
  const since7 = new Date(Date.now() - 7 * 86400000).toISOString();

  const [
    usersRes,
    ambassadorsRes,
    postsRes,
    reportsRes,
    storiesRes,
    progressRes,
    profiles30Res,
    posts7Res,
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("user_roles").select("*", { count: "exact", head: true }).eq("role", "ambassador"),
    supabase.from("social_posts").select("*", { count: "exact", head: true }),
    supabase.from("social_reports").select("*", { count: "exact", head: true }),
    supabase.from("social_stories").select("*", { count: "exact", head: true }).gt("expires_at", new Date().toISOString()),
    supabase.from("academy_course_progress").select("progress_percent, created_at, updated_at"),
    supabase.from("profiles").select("created_at").gte("created_at", since30),
    supabase.from("social_posts").select("created_at").gte("created_at", since7),
  ]);

  const progress = (progressRes.data ?? []) as { progress_percent: number }[];
  const started = progress.length;
  const completed = progress.filter((p) => p.progress_percent >= 100).length;
  const inProgress = progress.filter((p) => p.progress_percent > 0 && p.progress_percent < 100).length;

  const profiles30 = (profiles30Res.data ?? []) as { created_at: string }[];
  const newUsers7d = profiles30.filter((p) => p.created_at >= since7).length;

  return {
    users: usersRes.count ?? 0,
    ambassadors: ambassadorsRes.count ?? 0,
    posts: postsRes.count ?? 0,
    reports: reportsRes.count ?? 0,
    storiesActive: storiesRes.count ?? 0,
    coursesStarted: started,
    coursesCompleted: completed,
    newUsers7d,
    newUsers30d: profiles30.length,
    postsByDay: bucketByDay((posts7Res.data ?? []) as { created_at: string }[]),
    signupsByDay: bucketByDay(profiles30.filter((p) => p.created_at >= since7)),
    courseProgress: { started, completed, inProgress },
  };
}

export type ReportRow = {
  id: string;
  reason: string | null;
  created_at: string;
  reporter_id: string;
  post_id: string;
  post_text?: string;
  post_author_id?: string;
  reporter_name?: string;
};

export async function adminFetchReports(): Promise<ReportRow[]> {
  const { data, error } = await db()
    .from("social_reports")
    .select("id, reason, created_at, reporter_id, post_id")
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) throw error;

  const rows = (data ?? []) as ReportRow[];
  if (!rows.length) return [];

  const postIds = [...new Set(rows.map((r) => r.post_id))];
  const reporterIds = [...new Set(rows.map((r) => r.reporter_id))];

  const [{ data: posts }, { data: profiles }] = await Promise.all([
    db().from("social_posts").select("id, text, author_id").in("id", postIds),
    db().from("profiles").select("id, full_name, name").in("id", reporterIds),
  ]);

  const postMap = new Map((posts ?? []).map((p) => [(p as { id: string }).id, p as { text: string; author_id: string }]));
  const profileMap = new Map(
    (profiles ?? []).map((p) => {
      const row = p as { id: string; full_name?: string; name?: string };
      return [row.id, row.full_name?.trim() || row.name?.trim() || "Ambassadeur"];
    }),
  );

  return rows.map((r) => {
    const post = postMap.get(r.post_id);
    return {
      ...r,
      post_text: post?.text,
      post_author_id: post?.author_id,
      reporter_name: profileMap.get(r.reporter_id),
    };
  });
}

export async function adminDismissReport(reportId: string): Promise<void> {
  const { error } = await db().from("social_reports").delete().eq("id", reportId);
  if (error) throw error;
}

export async function adminHideReportedPost(reportId: string, postId: string): Promise<void> {
  const { error: postErr } = await db().from("social_posts").delete().eq("id", postId);
  if (postErr) throw postErr;
  await adminDismissReport(reportId);
}

export function exportStatsCsv(stats: PlatformStats): string {
  const lines = [
    "Métrique,Valeur",
    `Utilisateurs,${stats.users}`,
    `Ambassadeurs,${stats.ambassadors}`,
    `Publications,${stats.posts}`,
    `Signalements,${stats.reports}`,
    `Stories actives,${stats.storiesActive}`,
    `Cours commencés,${stats.coursesStarted}`,
    `Cours terminés,${stats.coursesCompleted}`,
    `Nouveaux (7j),${stats.newUsers7d}`,
    `Nouveaux (30j),${stats.newUsers30d}`,
    "",
    "Date,Publications",
    ...stats.postsByDay.map((d) => `${d.date},${d.count}`),
  ];
  return lines.join("\n");
}
