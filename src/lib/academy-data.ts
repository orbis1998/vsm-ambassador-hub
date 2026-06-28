/**
 * @deprecated Types déplacés vers @/types/academy — données mock supprimées.
 * Utiliser @/services/academy.service et @/hooks/use-academy.
 */
export type {
  Difficulty,
  LevelTier,
  Lesson,
  QuizQuestion,
  Quiz,
  Mission,
  Resource,
  ResourceCategory,
  Course,
  CourseSummary,
  Parcours,
  BadgeDef,
  CertificateRecord,
} from "@/types/academy";

export { academyService, fetchCourseById, findCourseWithParcours } from "@/services/academy.service";

/** @deprecated Utiliser findCourseWithParcours */
export async function findCourse(id: string) {
  const { findCourseWithParcours } = await import("@/services/academy.service");
  return findCourseWithParcours(id);
}

/** @deprecated Utiliser academyService */
export const academyApi = {
  getParcours: async () => {
    const { fetchParcoursList } = await import("@/services/academy.service");
    return fetchParcoursList();
  },
  getParcoursById: async (id: string) => {
    const { fetchParcoursById } = await import("@/services/academy.service");
    return fetchParcoursById(id);
  },
  getCourseById: async (id: string) => {
    const { fetchCourseById } = await import("@/services/academy.service");
    return fetchCourseById(id);
  },
  getResources: async () => {
    const { fetchResources } = await import("@/services/academy.service");
    return fetchResources();
  },
  getBadges: async () => [] as import("@/types/academy").BadgeDef[],
  getCertificates: async () => [] as import("@/types/academy").CertificateRecord[],
};
