/** Types domaine Académie — indépendants des mocks. */

export type Difficulty = "Débutant" | "Intermédiaire" | "Avancé" | "Expert";
export type LevelTier = "Bronze" | "Silver" | "Gold" | "Diamond" | "Elite" | "Legend";

export interface Lesson {
  id: string;
  title: string;
  duration: string;
  type: "video" | "reading" | "practice";
  completed: boolean;
  preview: string;
}

export interface QuizQuestion {
  id: string;
  prompt: string;
  kind: "single" | "multiple" | "truefalse";
  choices: string[];
  answer: number[];
  explanation: string;
}

export interface Quiz {
  id: string;
  title: string;
  minScore: number;
  questions: QuizQuestion[];
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  reward: number;
  example: string;
}

export interface Resource {
  id: string;
  title: string;
  category: ResourceCategory;
  format: "PDF" | "Canva" | "ZIP" | "MP4" | "PNG" | "DOCX";
  size: string;
  downloads: number;
  cover: string;
}

export type ResourceCategory =
  | "Scripts"
  | "Templates Canva"
  | "Calendriers éditoriaux"
  | "Guides Instagram"
  | "Guides Facebook"
  | "Guides TikTok"
  | "Brand Kit VSM"
  | "Photos"
  | "Vidéos"
  | "Icônes"
  | "Mockups";

export interface CourseSummary {
  id: string;
  parcoursId: string;
  title: string;
  description: string;
  cover: string;
  duration: string;
  difficulty: Difficulty;
  lessonCount: number;
}

export interface Course extends CourseSummary {
  objectives: string[];
  videoPoster: string;
  lessons: Lesson[];
  quiz: Quiz;
  mission: Mission;
  downloads: { id: string; label: string; format: string; size: string }[];
  rating: number;
  studentCount: number;
}

export interface Parcours {
  id: string;
  slug: string;
  number: number;
  title: string;
  tagline: string;
  description: string;
  cover: string;
  hours: number;
  difficulty: Difficulty;
  certificateTitle: string;
  badge: string;
  courses: CourseSummary[];
}

export interface BadgeDef {
  id: string;
  name: string;
  description: string;
  icon: string;
  tier: LevelTier;
  unlocked: boolean;
}

export interface CertificateRecord {
  id: string;
  parcoursTitle: string;
  ambassadorName: string;
  date: string;
  serial: string;
  signature: string;
  qrPayload?: string;
  pdfUrl?: string;
}

export interface AcademyProgressState {
  favorites: string[];
  history: { courseId: string; at: number }[];
  progress: Record<string, number>;
  notes: Record<string, string>;
  completedLessons: Record<string, string[]>;
  quizScores: Record<string, number>;
}

export const EMPTY_QUIZ: Quiz = {
  id: "empty",
  title: "Quiz",
  minScore: 70,
  questions: [],
};

export const EMPTY_MISSION: Mission = {
  id: "empty",
  title: "Mission pratique",
  description: "Applique ce que tu as appris dans ce module.",
  reward: 50,
  example: "",
};
