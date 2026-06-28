import { getSupabase } from "@/lib/supabase/client";

function db() {
  return getSupabase();
}

export type AdminCourseRow = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  category: string;
  difficulty: string;
  cover_url: string | null;
  duration_minutes: number;
  lesson_count: number;
  is_published: boolean;
  is_parcours: boolean;
  parent_parcours_id: string | null;
  sort_order: number;
  reward_xp: number;
};

export type AdminLessonRow = {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  position: number;
  video_url: string | null;
  content_md: string | null;
};

export type AdminChallengeRow = {
  id: string;
  title: string;
  description: string | null;
  type: string;
  goal: number;
  reward_xp: number;
  reward_points: number;
  deadline: string | null;
  is_active: boolean;
};

export type AdminResourceRow = {
  id: string;
  title: string;
  category: string;
  file_url: string;
  thumbnail_url: string | null;
  is_published: boolean;
};

export type AdminOpportunityRow = {
  id: string;
  title: string;
  category: string;
  description: string;
  status: string;
  is_published: boolean;
  slots: number;
  reward: string | null;
};

export async function adminFetchAllCourses(): Promise<AdminCourseRow[]> {
  const { data, error } = await db().from("academy_courses").select("*").order("sort_order");
  if (error) throw error;
  return (data ?? []) as AdminCourseRow[];
}

export async function adminUpsertCourse(input: Partial<AdminCourseRow> & { title: string; slug: string }): Promise<AdminCourseRow> {
  const payload = {
    title: input.title,
    slug: input.slug,
    description: input.description ?? "",
    category: input.category ?? "Brand",
    difficulty: input.difficulty ?? "beginner",
    cover_url: input.cover_url ?? null,
    is_published: input.is_published ?? false,
    is_parcours: input.is_parcours ?? false,
    parent_parcours_id: input.parent_parcours_id ?? null,
    sort_order: input.sort_order ?? 0,
    reward_xp: input.reward_xp ?? 0,
    updated_at: new Date().toISOString(),
  };

  if (input.id) {
    const { data, error } = await db().from("academy_courses").update(payload).eq("id", input.id).select("*").single();
    if (error) throw error;
    return data as AdminCourseRow;
  }

  const { data, error } = await db().from("academy_courses").insert(payload).select("*").single();
  if (error) throw error;
  return data as AdminCourseRow;
}

export async function adminDeleteCourse(id: string): Promise<void> {
  const { error } = await db().from("academy_courses").delete().eq("id", id);
  if (error) throw error;
}

export async function adminFetchLessons(courseId: string): Promise<AdminLessonRow[]> {
  const { data, error } = await db().from("academy_lessons").select("*").eq("course_id", courseId).order("position");
  if (error) throw error;
  return (data ?? []) as AdminLessonRow[];
}

export async function adminUpsertLesson(input: Partial<AdminLessonRow> & { course_id: string; title: string; position: number }): Promise<AdminLessonRow> {
  const payload = {
    course_id: input.course_id,
    title: input.title,
    description: input.description ?? "",
    position: input.position,
    video_url: input.video_url ?? null,
    content_md: input.content_md ?? "",
    updated_at: new Date().toISOString(),
  };

  if (input.id) {
    const { data, error } = await db().from("academy_lessons").update(payload).eq("id", input.id).select("*").single();
    if (error) throw error;
    return data as AdminLessonRow;
  }

  const { data, error } = await db().from("academy_lessons").insert(payload).select("*").single();
  if (error) throw error;
  return data as AdminLessonRow;
}

export async function adminDeleteLesson(id: string): Promise<void> {
  const { error } = await db().from("academy_lessons").delete().eq("id", id);
  if (error) throw error;
}

export async function adminFetchChallenges(): Promise<AdminChallengeRow[]> {
  const { data, error } = await db().from("academy_challenges").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as AdminChallengeRow[];
}

export async function adminUpsertChallenge(input: Partial<AdminChallengeRow> & { title: string }): Promise<AdminChallengeRow> {
  const payload = {
    title: input.title,
    description: input.description ?? "",
    type: input.type ?? "posts",
    goal: input.goal ?? 1,
    reward_xp: input.reward_xp ?? 50,
    reward_points: input.reward_points ?? 10,
    deadline: input.deadline ?? null,
    is_active: input.is_active ?? true,
  };

  if (input.id) {
    const { data, error } = await db().from("academy_challenges").update(payload).eq("id", input.id).select("*").single();
    if (error) throw error;
    return data as AdminChallengeRow;
  }

  const { data, error } = await db().from("academy_challenges").insert(payload).select("*").single();
  if (error) throw error;
  return data as AdminChallengeRow;
}

export async function adminFetchResources(): Promise<AdminResourceRow[]> {
  const { data, error } = await db().from("academy_resources").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as AdminResourceRow[];
}

export async function adminUpsertResource(input: Partial<AdminResourceRow> & { title: string; file_url: string }): Promise<AdminResourceRow> {
  const payload = {
    title: input.title,
    category: input.category ?? "template",
    file_url: input.file_url,
    thumbnail_url: input.thumbnail_url ?? null,
    is_published: input.is_published ?? true,
  };

  if (input.id) {
    const { data, error } = await db().from("academy_resources").update(payload).eq("id", input.id).select("*").single();
    if (error) throw error;
    return data as AdminResourceRow;
  }

  const { data, error } = await db().from("academy_resources").insert(payload).select("*").single();
  if (error) throw error;
  return data as AdminResourceRow;
}

export async function adminFetchOpportunities(): Promise<AdminOpportunityRow[]> {
  const { data, error } = await db().from("academy_opportunities").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as AdminOpportunityRow[];
}

export async function adminUpsertOpportunity(input: Partial<AdminOpportunityRow> & { title: string; category: string }): Promise<AdminOpportunityRow> {
  const payload = {
    title: input.title,
    category: input.category,
    description: input.description ?? "",
    status: input.status ?? "open",
    is_published: input.is_published ?? true,
    slots: input.slots ?? 1,
    reward: input.reward ?? null,
    updated_at: new Date().toISOString(),
  };

  if (input.id) {
    const { data, error } = await db().from("academy_opportunities").update(payload).eq("id", input.id).select("*").single();
    if (error) throw error;
    return data as AdminOpportunityRow;
  }

  const { data, error } = await db().from("academy_opportunities").insert(payload).select("*").single();
  if (error) throw error;
  return data as AdminOpportunityRow;
}

export async function adminDeleteOpportunity(id: string): Promise<void> {
  const { error } = await db().from("academy_opportunities").delete().eq("id", id);
  if (error) throw error;
}

export type AdminQuizRow = {
  id: string;
  course_id: string | null;
  lesson_id: string | null;
  title: string;
  passing_score: number;
  questions: unknown;
};

export async function adminFetchQuizzes(courseId?: string): Promise<AdminQuizRow[]> {
  let q = db().from("academy_quizzes").select("*").order("created_at", { ascending: false });
  if (courseId) q = q.eq("course_id", courseId);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as AdminQuizRow[];
}

export async function adminUpsertQuiz(
  input: Partial<AdminQuizRow> & { title: string; course_id: string },
): Promise<AdminQuizRow> {
  const payload = {
    course_id: input.course_id,
    lesson_id: input.lesson_id ?? null,
    title: input.title,
    passing_score: input.passing_score ?? 70,
    questions: input.questions ?? [],
  };

  if (input.id) {
    const { data, error } = await db().from("academy_quizzes").update(payload).eq("id", input.id).select("*").single();
    if (error) throw error;
    return data as AdminQuizRow;
  }

  const { data, error } = await db().from("academy_quizzes").insert(payload).select("*").single();
  if (error) throw error;
  return data as AdminQuizRow;
}

export async function adminDeleteQuiz(id: string): Promise<void> {
  const { error } = await db().from("academy_quizzes").delete().eq("id", id);
  if (error) throw error;
}

export async function adminDeleteResource(id: string): Promise<void> {
  const { error } = await db().from("academy_resources").delete().eq("id", id);
  if (error) throw error;
}

export type AdminApplicationRow = {
  id: string;
  opportunity_id: string;
  user_id: string;
  status: string;
  message: string | null;
  admin_note: string | null;
  created_at: string;
  opportunity?: { title: string; category: string } | null;
  profile?: { full_name: string | null; email: string | null; name: string | null } | null;
};

export async function adminFetchApplications(): Promise<AdminApplicationRow[]> {
  const { data, error } = await db()
    .from("academy_opportunity_applications")
    .select(
      "id, opportunity_id, user_id, status, message, admin_note, created_at, opportunity:academy_opportunities(title, category), profile:profiles(full_name, email, name)",
    )
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as AdminApplicationRow[];
}

export async function adminUpdateApplication(
  id: string,
  patch: { status?: string; admin_note?: string },
): Promise<void> {
  const { error } = await db()
    .from("academy_opportunity_applications")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}
