-- =============================================================================
-- Migration 006 — Gamification, badges, certificats, défis
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.academy_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  icon_url TEXT,
  rarity TEXT NOT NULL DEFAULT 'common',
  xp_reward INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.academy_user_badges (
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES public.academy_badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, badge_id)
);

CREATE TABLE IF NOT EXISTS public.academy_certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id UUID REFERENCES public.academy_courses(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  serial_number TEXT NOT NULL UNIQUE,
  qr_payload TEXT NOT NULL,
  pdf_url TEXT,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.academy_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  type TEXT NOT NULL DEFAULT 'weekly' CHECK (type IN ('weekly','monthly','special')),
  goal TEXT NOT NULL,
  reward_xp INTEGER NOT NULL DEFAULT 100,
  reward_points INTEGER NOT NULL DEFAULT 50,
  deadline TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.academy_challenge_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID NOT NULL REFERENCES public.academy_challenges(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  progress_percent INTEGER NOT NULL DEFAULT 0,
  completed_at TIMESTAMPTZ,
  score INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (challenge_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.academy_xp_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  source TEXT NOT NULL,
  reference_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.academy_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Trigger : attribuer XP et mettre à jour profiles
CREATE OR REPLACE FUNCTION public.academy_award_xp(p_user_id UUID, p_amount INTEGER, p_source TEXT, p_ref UUID DEFAULT NULL)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.academy_xp_history (user_id, amount, source, reference_id)
  VALUES (p_user_id, p_amount, p_source, p_ref);
  UPDATE public.profiles SET xp = xp + p_amount, updated_at = now() WHERE id = p_user_id;
END;
$$;

ALTER TABLE public.academy_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academy_user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academy_certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academy_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academy_challenge_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academy_xp_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academy_activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY academy_badges_read ON public.academy_badges FOR SELECT TO authenticated USING (true);
CREATE POLICY academy_user_badges_read ON public.academy_user_badges FOR SELECT TO authenticated USING (true);
CREATE POLICY academy_user_badges_own ON public.academy_user_badges FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY academy_certs_own ON public.academy_certificates FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR is_admin());

CREATE POLICY academy_challenges_read ON public.academy_challenges FOR SELECT TO authenticated USING (is_active = true OR is_admin());
CREATE POLICY academy_challenge_prog_own ON public.academy_challenge_progress FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY academy_xp_own ON public.academy_xp_history FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY academy_activity_own ON public.academy_activity_logs FOR SELECT TO authenticated USING (user_id = auth.uid());
