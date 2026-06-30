import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/providers/auth-provider";
import {
  fetchAllCourseSummaries,
  fetchCourseById,
  fetchParcoursById,
  fetchParcoursList,
  fetchResources,
  findCourseWithParcours,
} from "@/services/academy.service";
import { upsertCourseRating } from "@/services/academy-ratings.service";
import {
  fetchAcademyProgress,
  saveNote,
  saveQuizAttempt,
  toggleFavorite,
  toggleLessonProgress,
  upsertCourseProgress,
  logHistoryLocal,
} from "@/services/academy-progress.service";

export function useParcoursList() {
  return useQuery({
    queryKey: ["academy-parcours"],
    queryFn: fetchParcoursList,
    staleTime: 60_000,
  });
}

export function useParcours(id: string) {
  const { profile } = useAuth();
  return useQuery({
    queryKey: ["academy-parcours", id],
    queryFn: () => fetchParcoursById(id),
    enabled: !!id,
    staleTime: 60_000,
  });
}

export function useCourseSummaries() {
  return useQuery({
    queryKey: ["academy-courses"],
    queryFn: fetchAllCourseSummaries,
    staleTime: 60_000,
  });
}

export function useCourse(id: string) {
  const { data: progress } = useAcademyProgress();
  const completed = Object.values(progress?.completedLessons ?? {}).flat();
  return useQuery({
    queryKey: ["academy-course", id, completed.length],
    queryFn: () => fetchCourseById(id, completed),
    enabled: !!id,
  });
}

export function useCourseWithParcours(id: string) {
  const { profile } = useAuth();
  const { data: progress } = useAcademyProgress();
  const completed = Object.values(progress?.completedLessons ?? {}).flat();
  return useQuery({
    queryKey: ["academy-course-context", id, completed.length, profile?.userId],
    queryFn: () => findCourseWithParcours(id, completed, profile?.userId),
    enabled: !!id,
  });
}

export function useAcademyResources() {
  return useQuery({
    queryKey: ["academy-resources"],
    queryFn: fetchResources,
    staleTime: 120_000,
  });
}

export function useAcademyProgress() {
  const { profile } = useAuth();
  const userId = profile?.userId;
  return useQuery({
    queryKey: ["academy-progress", userId],
    queryFn: () => fetchAcademyProgress(userId!),
    enabled: !!userId,
    staleTime: 10_000,
  });
}

export function useAcademyMutations() {
  const { profile, refreshProfile } = useAuth();
  const userId = profile?.userId ?? "";
  const qc = useQueryClient();

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["academy-progress", userId] });
    void refreshProfile();
  };

  const favorite = useMutation({
    mutationFn: ({ courseId, isFav }: { courseId: string; isFav: boolean }) =>
      toggleFavorite(userId, courseId, isFav),
    onSuccess: invalidate,
  });

  const courseProgress = useMutation({
    mutationFn: ({ courseId, percent }: { courseId: string; percent: number }) =>
      upsertCourseProgress(userId, courseId, percent),
    onSuccess: invalidate,
  });

  const lessonToggle = useMutation({
    mutationFn: ({ lessonId, completed }: { lessonId: string; completed: boolean }) =>
      toggleLessonProgress(userId, lessonId, completed),
    onSuccess: () => {
      invalidate();
      qc.invalidateQueries({ queryKey: ["academy-course"] });
    },
  });

  const quizAttempt = useMutation({
    mutationFn: ({ quizId, score, passed }: { quizId: string; score: number; passed: boolean }) =>
      saveQuizAttempt(userId, quizId, score, passed),
    onSuccess: invalidate,
  });

  const rateCourse = useMutation({
    mutationFn: ({ courseId, stars }: { courseId: string; stars: number }) =>
      upsertCourseRating(userId, courseId, stars),
    onSuccess: (_, { courseId }) => {
      qc.invalidateQueries({ queryKey: ["academy-course-context", courseId] });
    },
  });

  return {
    toggleFavorite: favorite.mutateAsync,
    rateCourse: rateCourse.mutateAsync,
    setProgress: (courseId: string, percent: number) => courseProgress.mutateAsync({ courseId, percent }),
    toggleLesson: (lessonId: string, completed: boolean) => lessonToggle.mutateAsync({ lessonId, completed }),
    saveQuizScore: (quizId: string, score: number, passed: boolean) =>
      quizAttempt.mutateAsync({ quizId, score, passed }),
    setNote: saveNote,
    logHistory: (courseId: string) => {
      logHistoryLocal(courseId);
      invalidate();
    },
  };
}
