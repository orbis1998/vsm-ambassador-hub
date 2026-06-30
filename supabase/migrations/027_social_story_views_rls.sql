-- =============================================================================
-- Migration 027 — RLS manquantes sur social_story_views (vues stories)
-- =============================================================================

CREATE POLICY social_story_views_read ON public.social_story_views
  FOR SELECT TO authenticated USING (true);

CREATE POLICY social_story_views_insert ON public.social_story_views
  FOR INSERT TO authenticated WITH CHECK (viewer_id = auth.uid());

CREATE POLICY social_story_views_update ON public.social_story_views
  FOR UPDATE TO authenticated
  USING (viewer_id = auth.uid()) WITH CHECK (viewer_id = auth.uid());
