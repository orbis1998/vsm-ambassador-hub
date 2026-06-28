import type {
  Course,
  CourseSummary,
  Difficulty,
  Lesson,
  Parcours,
  Quiz,
  QuizQuestion,
  Resource,
} from "@/types/academy";
import { EMPTY_QUIZ } from "@/types/academy";

export type DbCourse = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  category: string;
  difficulty: string;
  cover_url: string | null;
  duration_minutes: number | null;
  lesson_count: number | null;
  is_published: boolean;
  is_parcours: boolean;
  parent_parcours_id: string | null;
  sort_order: number;
  reward_xp: number;
};

export type DbLesson = {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  position: number;
  video_url: string | null;
  video_duration_seconds: number | null;
  content_md: string | null;
};

export type DbQuiz = {
  id: string;
  course_id: string | null;
  title: string;
  passing_score: number;
  questions: unknown;
};

export type DbResource = {
  id: string;
  title: string;
  category: string;
  file_url: string;
  thumbnail_url: string | null;
};

const DIFF_MAP: Record<string, Difficulty> = {
  beginner: "Débutant",
  débutant: "Débutant",
  intermediate: "Intermédiaire",
  intermédiaire: "Intermédiaire",
  advanced: "Avancé",
  avancé: "Avancé",
  expert: "Expert",
};

const FALLBACK_COVER =
  "https://images.unsplash.com/photo-1521577352947-9bb58764b69a?w=1200&q=70&auto=format&fit=crop";

export function mapDifficulty(raw: string | null | undefined): Difficulty {
  if (!raw) return "Débutant";
  return DIFF_MAP[raw.toLowerCase()] ?? (raw as Difficulty);
}

export function formatDuration(minutes: number | null | undefined): string {
  const m = minutes ?? 0;
  if (m < 60) return `${m || 15} min`;
  const h = Math.floor(m / 60);
  const rest = m % 60;
  return rest ? `${h}h ${rest}min` : `${h}h`;
}

function parseQuizQuestions(raw: unknown): QuizQuestion[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((q, i) => {
    const item = q as Record<string, unknown>;
    return {
      id: String(item.id ?? `q-${i}`),
      prompt: String(item.prompt ?? item.question ?? ""),
      kind: (item.kind as QuizQuestion["kind"]) ?? "single",
      choices: Array.isArray(item.choices) ? item.choices.map(String) : [],
      answer: Array.isArray(item.answer) ? item.answer.map(Number) : [Number(item.answer ?? 0)],
      explanation: String(item.explanation ?? ""),
    };
  });
}

export function mapCourseSummary(row: DbCourse, parcoursId: string): CourseSummary {
  return {
    id: row.id,
    parcoursId,
    title: row.title,
    description: row.description ?? "",
    cover: row.cover_url ?? FALLBACK_COVER,
    duration: formatDuration(row.duration_minutes),
    difficulty: mapDifficulty(row.difficulty),
    lessonCount: row.lesson_count ?? 0,
  };
}

export function mapParcours(row: DbCourse, modules: DbCourse[]): Parcours {
  const desc = row.description ?? "";
  const [tagline, ...rest] = desc.split("\n");
  return {
    id: row.id,
    slug: row.slug,
    number: row.sort_order || 1,
    title: row.title,
    tagline: tagline || row.title,
    description: rest.join("\n").trim() || desc,
    cover: row.cover_url ?? FALLBACK_COVER,
    hours: Math.max(1, Math.ceil((row.duration_minutes ?? 60) / 60)),
    difficulty: mapDifficulty(row.difficulty),
    certificateTitle: `Certificat — ${row.title}`,
    badge: row.category || "VSM",
    courses: modules.map((m) => mapCourseSummary(m, row.id)),
  };
}

export function mapLesson(row: DbLesson, completed: boolean): Lesson {
  const sec = row.video_duration_seconds ?? 0;
  return {
    id: row.id,
    title: row.title,
    duration: sec ? `${Math.ceil(sec / 60)} min` : "5 min",
    type: row.video_url ? "video" : "reading",
    completed,
    preview: row.description ?? row.content_md?.slice(0, 120) ?? "",
  };
}

export function mapQuiz(row: DbQuiz | null): Quiz {
  if (!row) return EMPTY_QUIZ;
  return {
    id: row.id,
    title: row.title,
    minScore: row.passing_score,
    questions: parseQuizQuestions(row.questions),
  };
}

export function buildFullCourse(
  row: DbCourse,
  parcoursId: string,
  lessons: Lesson[],
  quiz: Quiz,
): Course {
  const summary = mapCourseSummary(row, parcoursId);
  return {
    ...summary,
    objectives: row.description ? row.description.split("\n").filter(Boolean).slice(0, 5) : [],
    videoPoster: row.cover_url ?? FALLBACK_COVER,
    lessons,
    quiz,
    mission: {
      id: `mission-${row.id}`,
      title: `Mission — ${row.title}`,
      description: "Applique les concepts de ce module dans un cas réel VSM.",
      reward: row.reward_xp || 50,
      example: "",
    },
    downloads: [],
    rating: 4.8,
    studentCount: 0,
  };
}

export function mapResource(row: DbResource): Resource {
  const ext = row.file_url.split(".").pop()?.toUpperCase() ?? "PDF";
  const format = (["PDF", "ZIP", "MP4", "PNG", "DOCX"].includes(ext) ? ext : "PDF") as Resource["format"];
  return {
    id: row.id,
    title: row.title,
    category: row.category as Resource["category"],
    format: format === "PDF" && row.category.includes("Canva") ? "Canva" : format,
    size: "—",
    downloads: 0,
    cover: row.thumbnail_url ?? FALLBACK_COVER,
  };
}
