import { getSupabase } from "@/lib/supabase/client";

export type CourseRatingStats = {
  avgRating: number;
  reviewCount: number;
  studentCount: number;
  myRating: number | null;
};

function isMissing(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false;
  return (
    error.code === "42P01" ||
    error.code === "PGRST205" ||
    error.code === "42501" ||
    /does not exist|permission denied/i.test(error.message ?? "")
  );
}

export async function fetchCourseRatingStats(courseId: string, userId?: string): Promise<CourseRatingStats> {
  const defaults: CourseRatingStats = {
    avgRating: 0,
    reviewCount: 0,
    studentCount: 0,
    myRating: null,
  };

  try {
    const db = getSupabase();
    const [statsRes, enrollRes, mineRes] = await Promise.all([
      db.from("academy_course_rating_stats").select("avg_rating, review_count").eq("course_id", courseId).maybeSingle(),
      db.from("academy_course_enrollment_stats").select("student_count").eq("course_id", courseId).maybeSingle(),
      userId
        ? db.from("academy_course_ratings").select("stars").eq("course_id", courseId).eq("user_id", userId).maybeSingle()
        : Promise.resolve({ data: null, error: null }),
    ]);

    if (statsRes.error && !isMissing(statsRes.error)) throw statsRes.error;
    if (enrollRes.error && !isMissing(enrollRes.error)) throw enrollRes.error;
    if (mineRes.error && !isMissing(mineRes.error)) throw mineRes.error;

    const stats = statsRes.data;
    const enroll = enrollRes.data;
    const mine = mineRes.data;

    return {
      avgRating: stats ? Number((stats as { avg_rating: number }).avg_rating) || 0 : 0,
      reviewCount: stats ? Number((stats as { review_count: number }).review_count) || 0 : 0,
      studentCount: enroll ? Number((enroll as { student_count: number }).student_count) || 0 : 0,
      myRating: mine ? Number((mine as { stars: number }).stars) : null,
    };
  } catch {
    return defaults;
  }
}

export async function upsertCourseRating(userId: string, courseId: string, stars: number): Promise<void> {
  const clamped = Math.min(5, Math.max(1, Math.round(stars)));
  const { error } = await getSupabase().from("academy_course_ratings").upsert(
    { user_id: userId, course_id: courseId, stars: clamped, updated_at: new Date().toISOString() },
    { onConflict: "user_id,course_id" },
  );
  if (error && !isMissing(error)) throw error;
}
