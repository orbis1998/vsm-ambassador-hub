-- Migration 019 — Messagerie avancée, présence, réactions messages, réponses commentaires

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMPTZ;

ALTER TABLE public.academy_messages
  ADD COLUMN IF NOT EXISTS reply_to_id UUID REFERENCES public.academy_messages(id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS public.academy_message_reactions (
  message_id UUID NOT NULL REFERENCES public.academy_messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  emoji TEXT NOT NULL DEFAULT '👍',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (message_id, user_id)
);

ALTER TABLE public.academy_message_reactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY academy_msg_reactions_read ON public.academy_message_reactions FOR SELECT TO authenticated USING (true);
CREATE POLICY academy_msg_reactions_write ON public.academy_message_reactions FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Typing : lecture pour participants
DROP POLICY IF EXISTS academy_typing_read ON public.academy_typing;
CREATE POLICY academy_typing_read ON public.academy_typing FOR SELECT TO authenticated USING (true);

-- Incrément comments_count à l'insert
CREATE OR REPLACE FUNCTION public.social_comments_count_inc()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  UPDATE public.social_posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS social_comments_count_inc_tr ON public.social_comments;
CREATE TRIGGER social_comments_count_inc_tr
  AFTER INSERT ON public.social_comments FOR EACH ROW EXECUTE FUNCTION public.social_comments_count_inc();
