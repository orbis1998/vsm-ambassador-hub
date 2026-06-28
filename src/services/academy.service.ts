import { getSupabase } from "@/lib/supabase/client";
import {
  buildFullCourse,
  mapCourseSummary,
  mapLesson,
  mapParcours,
  mapQuiz,
  mapResource,
  type DbCourse,
  type DbLesson,
  type DbQuiz,
  type DbResource,
} from "@/lib/academy-mappers";
import type { Course, CourseSummary, Parcours, Resource } from "@/types/academy";

function isMissingTable(error: { code?: string } | null): boolean {
  return error?.code === "42P01" || error?.code === "PGRST205";
}

async function fetchPublishedCourses(): Promise<DbCourse[]> {
  const { data, error } = await getSupabase()
    .from("academy_courses")
    .select("*")
    .eq("is_published", true)
    .order("sort_order");
  if (error) {
    if (isMissingTable(error)) return [];
    throw error;
  }
  return (data ?? []) as DbCourse[];
}

async function fetchModulesForParcours(parcoursId: string): Promise<DbCourse[]> {
  const { data, error } = await getSupabase()
    .from("academy_courses")
    .select("*")
    .eq("parent_parcours_id", parcoursId)
    .eq("is_published", true)
    .order("sort_order");
  if (error) {
    if (isMissingTable(error)) return [];
    throw error;
  }
  return (data ?? []) as DbCourse[];
}

export async function fetchParcoursList(): Promise<Parcours[]> {
  const all = await fetchPublishedCourses();
  const parcoursRows = all.filter((c) => c.is_parcours);
  const result: Parcours[] = [];
  for (const row of parcoursRows) {
    const modules = await fetchModulesForParcours(row.id);
    result.push(mapParcours(row, modules));
  }
  return result;
}

export async function fetchParcoursById(id: string): Promise<Parcours | null> {
  const { data, error } = await getSupabase()
    .from("academy_courses")
    .select("*")
    .eq("id", id)
    .eq("is_parcours", true)
    .maybeSingle();
  if (error) {
    if (isMissingTable(error)) return null;
    throw error;
  }
  if (!data) return null;
  const modules = await fetchModulesForParcours(id);
  return mapParcours(data as DbCourse, modules);
}

export async function fetchAllCourseSummaries(): Promise<CourseSummary[]> {
  const all = await fetchPublishedCourses();
  return all
    .filter((c) => !c.is_parcours)
    .map((c) => mapCourseSummary(c, c.parent_parcours_id ?? ""));
}

async function fetchLessonsForCourse(courseId: string, completedIds: Set<string>): Promise<ReturnType<typeof mapLesson>[]> {
  const { data, error } = await getSupabase()
    .from("academy_lessons")
    .select("*")
    .eq("course_id", courseId)
    .order("position");
  if (error) {
    if (isMissingTable(error)) return [];
    throw error;
  }
  return ((data ?? []) as DbLesson[]).map((l) => mapLesson(l, completedIds.has(l.id)));
}

async function fetchQuizForCourse(courseId: string) {
  const { data, error } = await getSupabase()
    .from("academy_quizzes")
    .select("*")
    .eq("course_id", courseId)
    .limit(1)
    .maybeSingle();
  if (error) {
    if (isMissingTable(error)) return mapQuiz(null);
    throw error;
  }
  return mapQuiz((data as DbQuiz) ?? null);
}

export async function fetchCourseById(
  id: string,
  completedLessonIds: string[] = [],
): Promise<Course | null> {
  const { data, error } = await getSupabase()
    .from("academy_courses")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) {
    if (isMissingTable(error)) return null;
    throw error;
  }
  if (!data || (data as DbCourse).is_parcours) return null;

  const row = data as DbCourse;
  const completed = new Set(completedLessonIds);
  const lessons = await fetchLessonsForCourse(id, completed);
  const quiz = await fetchQuizForCourse(id);
  return buildFullCourse(row, row.parent_parcours_id ?? "", lessons, quiz);
}

export async function findCourseWithParcours(
  courseId: string,
  completedLessonIds: string[] = [],
): Promise<{ course: Course; parcours: Parcours } | null> {
  const course = await fetchCourseById(courseId, completedLessonIds);
  if (!course) return null;
  const parcours = course.parcoursId ? await fetchParcoursById(course.parcoursId) : null;
  if (!parcours) return { course, parcours: fallbackParcours(course) };
  return { course, parcours };
}

function fallbackParcours(course: Course): Parcours {
  return {
    id: course.parcoursId || course.id,
    slug: course.id,
    number: 1,
    title: "Parcours VSM",
    tagline: course.title,
    description: course.description,
    cover: course.cover,
    hours: 1,
    difficulty: course.difficulty,
    certificateTitle: `Certificat — ${course.title}`,
    badge: "VSM",
    courses: [course],
  };
}

export async function fetchResources(): Promise<Resource[]> {
  const { data, error } = await getSupabase()
    .from("academy_resources")
    .select("*")
    .eq("is_published", true)
    .order("title");
  if (error) {
    if (isMissingTable(error)) return [];
    throw error;
  }
  return ((data ?? []) as DbResource[]).map(mapResource);
}

/** @deprecated Utiliser les fonctions nommées — compatibilité routes */
export const academyService = {
  getParcours: fetchParcoursList,
  getParcoursById: fetchParcoursById,
  getCourseById: fetchCourseById,
  getCourses: fetchAllCourseSummaries,
  getResources: fetchResources,
  findCourseWithParcours,
};
