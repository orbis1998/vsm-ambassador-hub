-- =============================================================================
-- Migration 017 — Messagerie (déduplication), stories likes/réponses
-- =============================================================================

-- Index unique logique : une conversation directe par paire (via fonction)
CREATE OR REPLACE FUNCTION public.normalize_participant_pair(a UUID, b UUID)
RETURNS UUID[] LANGUAGE sql IMMUTABLE AS $$
  SELECT CASE WHEN a < b THEN ARRAY[a, b] ELSE ARRAY[b, a] END;
$$;

-- Likes sur stories
CREATE TABLE IF NOT EXISTS public.social_story_likes (
  story_id UUID NOT NULL REFERENCES public.social_stories(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (story_id, user_id)
);

ALTER TABLE public.social_story_likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY social_story_likes_read ON public.social_story_likes FOR SELECT TO authenticated USING (true);
CREATE POLICY social_story_likes_write ON public.social_story_likes FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Réponses story → référence message optionnelle
ALTER TABLE public.academy_messages
  ADD COLUMN IF NOT EXISTS story_id UUID REFERENCES public.social_stories(id) ON DELETE SET NULL;

-- Politique update posts (auteur)
DROP POLICY IF EXISTS social_posts_update_own ON public.social_posts;
CREATE POLICY social_posts_update_own ON public.social_posts FOR UPDATE TO authenticated
  USING (author_id = auth.uid()) WITH CHECK (author_id = auth.uid());

-- Bucket messagerie
DROP POLICY IF EXISTS academy_messages_media_read ON storage.objects;
CREATE POLICY academy_messages_media_read ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'academy-social');
