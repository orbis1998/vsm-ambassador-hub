// Lightweight client-side store for academy state (favorites, history, progress, notes).
// Uses localStorage so progress survives reloads. Easy to swap for Supabase later.
import { useEffect, useState, useCallback } from "react";

const KEY = "vsm.academy.v1";

interface State {
  favorites: string[]; // course ids
  history: { courseId: string; at: number }[];
  progress: Record<string, number>; // courseId -> 0..100
  notes: Record<string, string>; // courseId -> note
  completedLessons: Record<string, string[]>; // courseId -> lesson ids
  quizScores: Record<string, number>; // quizId -> %
}

const empty: State = {
  favorites: [],
  history: [],
  progress: {},
  notes: {},
  completedLessons: {},
  quizScores: {},
};

function read(): State {
  if (typeof window === "undefined") return empty;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return empty;
    return { ...empty, ...(JSON.parse(raw) as State) };
  } catch {
    return empty;
  }
}

function write(s: State) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(s));
  window.dispatchEvent(new CustomEvent("vsm:academy"));
}

export function useAcademyStore() {
  const [state, setState] = useState<State>(empty);

  useEffect(() => {
    setState(read());
    const handler = () => setState(read());
    window.addEventListener("vsm:academy", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("vsm:academy", handler);
      window.removeEventListener("storage", handler);
    };
  }, []);

  const toggleFavorite = useCallback((courseId: string) => {
    const s = read();
    const fav = s.favorites.includes(courseId)
      ? s.favorites.filter((x) => x !== courseId)
      : [courseId, ...s.favorites];
    write({ ...s, favorites: fav });
  }, []);

  const logHistory = useCallback((courseId: string) => {
    const s = read();
    const history = [{ courseId, at: Date.now() }, ...s.history.filter((h) => h.courseId !== courseId)].slice(0, 30);
    write({ ...s, history });
  }, []);

  const setProgress = useCallback((courseId: string, value: number) => {
    const s = read();
    write({ ...s, progress: { ...s.progress, [courseId]: Math.max(s.progress[courseId] ?? 0, value) } });
  }, []);

  const setNote = useCallback((courseId: string, note: string) => {
    const s = read();
    write({ ...s, notes: { ...s.notes, [courseId]: note } });
  }, []);

  const toggleLesson = useCallback((courseId: string, lessonId: string) => {
    const s = read();
    const cur = s.completedLessons[courseId] ?? [];
    const next = cur.includes(lessonId) ? cur.filter((x) => x !== lessonId) : [...cur, lessonId];
    write({ ...s, completedLessons: { ...s.completedLessons, [courseId]: next } });
  }, []);

  const saveQuizScore = useCallback((quizId: string, pct: number) => {
    const s = read();
    write({ ...s, quizScores: { ...s.quizScores, [quizId]: Math.max(s.quizScores[quizId] ?? 0, pct) } });
  }, []);

  return {
    state,
    toggleFavorite,
    logHistory,
    setProgress,
    setNote,
    toggleLesson,
    saveQuizScore,
  };
}
