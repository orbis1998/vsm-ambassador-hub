-- =============================================================================
-- Migration 013 — Correctifs social (RLS réactions), profil Academy, realtime
-- =============================================================================

-- Couverture profil Academy (distincte du Programme)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS cover_url TEXT;

-- RLS réactions : lecture globale pour agrégation, écriture propre ligne
DROP POLICY IF EXISTS social_reactions_all ON public.social_reactions;
CREATE POLICY social_reactions_read ON public.social_reactions
  FOR SELECT TO authenticated USING (true);
CREATE POLICY social_reactions_insert ON public.social_reactions
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY social_reactions_update ON public.social_reactions
  FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY social_reactions_delete ON public.social_reactions
  FOR DELETE TO authenticated USING (user_id = auth.uid());

-- Likes sur commentaires
CREATE TABLE IF NOT EXISTS public.social_comment_likes (
  comment_id UUID NOT NULL REFERENCES public.social_comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (comment_id, user_id)
);

ALTER TABLE public.social_comment_likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY social_comment_likes_read ON public.social_comment_likes
  FOR SELECT TO authenticated USING (true);
CREATE POLICY social_comment_likes_write ON public.social_comment_likes
  FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Trigger : incrémenter comments_count automatiquement
CREATE OR REPLACE FUNCTION public.social_comments_count_inc()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.social_posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_social_comments_count ON public.social_comments;
CREATE TRIGGER trg_social_comments_count
  AFTER INSERT ON public.social_comments
  FOR EACH ROW EXECUTE FUNCTION public.social_comments_count_inc();

-- Trigger : synchroniser likes_count commentaires
CREATE OR REPLACE FUNCTION public.social_comment_likes_count_sync()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.social_comments SET likes_count = likes_count + 1 WHERE id = NEW.comment_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.social_comments SET likes_count = GREATEST(0, likes_count - 1) WHERE id = OLD.comment_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_social_comment_likes_count ON public.social_comment_likes;
CREATE TRIGGER trg_social_comment_likes_count
  AFTER INSERT OR DELETE ON public.social_comment_likes
  FOR EACH ROW EXECUTE FUNCTION public.social_comment_likes_count_sync();

-- Mise à jour profil Academy (bio, avatar, couverture, handle)
DROP POLICY IF EXISTS profiles_update_own_academy ON public.profiles;
CREATE POLICY profiles_update_own_academy ON public.profiles
  FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Lecture publique médias sociaux (bucket privé → URLs signées côté client)
DROP POLICY IF EXISTS academy_social_public_read ON storage.objects;
CREATE POLICY academy_social_public_read ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'academy-social');

-- Realtime sur tables sociales
ALTER PUBLICATION supabase_realtime ADD TABLE public.social_posts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.social_comments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.social_reactions;
