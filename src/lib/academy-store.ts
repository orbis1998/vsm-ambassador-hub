/**
 * Store Académie — synchronisé avec Supabase (progression, favoris, quiz).
 * Les notes restent en localStorage (pas de colonne dédiée en base).
 */
import { useAcademyMutations, useAcademyProgress } from "@/hooks/use-academy";
import type { AcademyProgressState } from "@/types/academy";
import { useCallback } from "react";

const EMPTY: AcademyProgressState = {
  favorites: [],
  history: [],
  progress: {},
  notes: {},
  completedLessons: {},
  quizScores: {},
};

export function useAcademyStore() {
  const { data: state = EMPTY, isLoading } = useAcademyProgress();
  const mutations = useAcademyMutations();

  const toggleFavorite = useCallback(
    async (courseId: string) => {
      const isFav = state.favorites.includes(courseId);
      await mutations.toggleFavorite({ courseId, isFav });
    },
    [state.favorites, mutations],
  );

  const logHistory = useCallback(
    (courseId: string) => {
      mutations.logHistory(courseId);
    },
    [mutations],
  );

  const setProgress = useCallback(
    async (courseId: string, value: number) => {
      const next = Math.max(state.progress[courseId] ?? 0, value);
      await mutations.setProgress(courseId, next);
    },
    [state.progress, mutations],
  );

  const setNote = useCallback(
    (courseId: string, note: string) => {
      mutations.setNote(courseId, note);
    },
    [mutations],
  );

  const toggleLesson = useCallback(
    async (courseId: string, lessonId: string) => {
      const cur = state.completedLessons[courseId] ?? [];
      const completed = !cur.includes(lessonId);
      await mutations.toggleLesson(lessonId, completed);
      const lessonCount = cur.length + (completed ? 1 : -1);
      const pct = Math.round((lessonCount / Math.max(lessonCount, 1)) * 80);
      if (pct > (state.progress[courseId] ?? 0)) {
        await mutations.setProgress(courseId, pct);
      }
    },
    [state.completedLessons, state.progress, mutations],
  );

  const saveQuizScore = useCallback(
    async (quizId: string, pct: number) => {
      const passed = pct >= 70;
      await mutations.saveQuizScore(quizId, pct, passed);
    },
    [mutations],
  );

  return {
    state,
    loading: isLoading,
    toggleFavorite,
    logHistory,
    setProgress,
    setNote,
    toggleLesson,
    saveQuizScore,
  };
}
