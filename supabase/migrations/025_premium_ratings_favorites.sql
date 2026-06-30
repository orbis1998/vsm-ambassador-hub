-- =============================================================================
-- Migration 025 — Notes cours réelles, stats enrollment, favoris unifiés
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.academy_course_ratings (
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.academy_courses(id) ON DELETE CASCADE,
  stars INTEGER NOT NULL CHECK (stars >= 1 AND stars <= 5),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, course_id)
);

CREATE INDEX IF NOT EXISTS idx_academy_course_ratings_course ON public.academy_course_ratings(course_id);

ALTER TABLE public.academy_course_ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY academy_course_ratings_read ON public.academy_course_ratings
  FOR SELECT TO authenticated USING (true);

CREATE POLICY academy_course_ratings_own ON public.academy_course_ratings
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE OR REPLACE VIEW public.academy_course_rating_stats AS
SELECT
  course_id,
  ROUND(AVG(stars)::numeric, 1) AS avg_rating,
  COUNT(*)::integer AS review_count
FROM public.academy_course_ratings
GROUP BY course_id;

CREATE OR REPLACE VIEW public.academy_course_enrollment_stats AS
SELECT
  course_id,
  COUNT(DISTINCT user_id)::integer AS student_count
FROM public.academy_course_progress
GROUP BY course_id;

GRANT SELECT ON public.academy_course_rating_stats TO authenticated;
GRANT SELECT ON public.academy_course_enrollment_stats TO authenticated;
