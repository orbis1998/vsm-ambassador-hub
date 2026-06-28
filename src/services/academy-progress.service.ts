import { getSupabase } from "@/lib/supabase/client";
import { awardXp, logActivity } from "@/services/gamification.service";
import type { AcademyProgressState } from "@/types/academy";
import type { Json } from "@/types/database";

const NOTES_KEY = "vsm.academy.notes";

function isMissingTable(error: { code?: string } | null): boolean {
  return error?.code === "42P01" || error?.code === "PGRST205";
}

function readLocalNotes(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(NOTES_KEY) ?? "{}") as Record<string, string>;
  } catch {
    return {};
  }
}

function writeLocalNotes(notes: Record<string, string>) {
  if (typeof window === "undefined") return;
  localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
}

export async function fetchAcademyProgress(userId: string): Promise<AcademyProgressState> {
  const empty: AcademyProgressState = {
    favorites: [],
    history: [],
    progress: {},
    notes: readLocalNotes(),
    completedLessons: {},
    quizScores: {},
  };

  const supabase = getSupabase();

  const [favRes, progRes, lessonRes, quizRes] = await Promise.all([
    supabase.from("academy_favorites").select("course_id").eq("user_id", userId),
    supabase.from("academy_course_progress").select("course_id,progress_percent,updated_at").eq("user_id", userId),
    supabase.from("academy_lesson_progress").select("lesson_id,completed").eq("user_id", userId).eq("completed", true),
    supabase.from("academy_quiz_attempts").select("quiz_id,score").eq("user_id", userId),
  ]);

  if ([favRes.error, progRes.error, lessonRes.error, quizRes.error].every((e) => isMissingTable(e))) {
    return empty;
  }

  const favorites = (favRes.data ?? []).map((r) => (r as { course_id: string }).course_id);
  const progress: Record<string, number> = {};
  const history: AcademyProgressState["history"] = [];

  for (const row of progRes.data ?? []) {
    const r = row as { course_id: string; progress_percent: number; updated_at: string };
    progress[r.course_id] = r.progress_percent;
    history.push({ courseId: r.course_id, at: new Date(r.updated_at).getTime() });
  }
  history.sort((a, b) => b.at - a.at);

  const completedLessons: Record<string, string[]> = {};
  const lessonIds = (lessonRes.data ?? []).map((r) => (r as { lesson_id: string }).lesson_id);

  if (lessonIds.length > 0) {
    const { data: lessons } = await supabase
      .from("academy_lessons")
      .select("id,course_id")
      .in("id", lessonIds);
    for (const l of lessons ?? []) {
      const row = l as { id: string; course_id: string };
      completedLessons[row.course_id] = [...(completedLessons[row.course_id] ?? []), row.id];
    }
  }

  const quizScores: Record<string, number> = {};
  for (const row of quizRes.data ?? []) {
    const r = row as { quiz_id: string; score: number };
    quizScores[r.quiz_id] = Math.max(quizScores[r.quiz_id] ?? 0, r.score);
  }

  return { favorites, history, progress, notes: readLocalNotes(), completedLessons, quizScores };
}

export async function toggleFavorite(userId: string, courseId: string, isFav: boolean): Promise<void> {
  const supabase = getSupabase();
  if (isFav) {
    const { error } = await supabase.from("academy_favorites").delete().eq("user_id", userId).eq("course_id", courseId);
    if (error && !isMissingTable(error)) throw error;
  } else {
    const { error } = await supabase.from("academy_favorites").upsert({ user_id: userId, course_id: courseId });
    if (error && !isMissingTable(error)) throw error;
  }
}

export async function upsertCourseProgress(
  userId: string,
  courseId: string,
  progressPercent: number,
  lastLessonId?: string,
): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase.from("academy_course_progress").upsert(
    {
      user_id: userId,
      course_id: courseId,
      progress_percent: Math.min(100, Math.max(0, progressPercent)),
      completed_at: progressPercent >= 100 ? new Date().toISOString() : null,
      last_lesson_id: lastLessonId ?? null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,course_id" },
  );
  if (error && !isMissingTable(error)) throw error;
}

export async function toggleLessonProgress(
  userId: string,
  lessonId: string,
  completed: boolean,
): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase.from("academy_lesson_progress").upsert(
    {
      user_id: userId,
      lesson_id: lessonId,
      completed,
      completed_at: completed ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,lesson_id" },
  );
  if (error && !isMissingTable(error)) throw error;

  if (completed) {
    await awardXp(userId, 25, "lesson_complete", lessonId).catch(() => undefined);
    await logActivity(userId, "lesson_complete", { lesson_id: lessonId }).catch(() => undefined);
  }
}

export async function saveQuizAttempt(
  userId: string,
  quizId: string,
  score: number,
  passed: boolean,
  answers: Record<string, unknown> = {},
): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase.from("academy_quiz_attempts").insert({
    user_id: userId,
    quiz_id: quizId,
    score,
    passed,
    answers: answers as Json,  });
  if (error && !isMissingTable(error)) throw error;

  if (passed) {
    await awardXp(userId, 100, "quiz_passed", quizId).catch(() => undefined);
    await logActivity(userId, "quiz_passed", { quiz_id: quizId, score }).catch(() => undefined);
  }
}

export function saveNote(courseId: string, note: string): void {
  const notes = readLocalNotes();
  notes[courseId] = note;
  writeLocalNotes(notes);
}

export function logHistoryLocal(courseId: string): void {
  const key = "vsm.academy.history";
  if (typeof window === "undefined") return;
  try {
    const raw = JSON.parse(localStorage.getItem(key) ?? "[]") as { courseId: string; at: number }[];
    const next = [{ courseId, at: Date.now() }, ...raw.filter((h) => h.courseId !== courseId)].slice(0, 30);
    localStorage.setItem(key, JSON.stringify(next));
  } catch {
    /* ignore */
  }
}
