-- =============================================================================
-- Migration 005 — Opportunités VSM + candidatures
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.academy_opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  image_url TEXT,
  location TEXT,
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  slots INTEGER NOT NULL DEFAULT 1,
  reward TEXT,
  conditions TEXT[] NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','soon','closed')),
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.academy_opportunity_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id UUID NOT NULL REFERENCES public.academy_opportunities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','reviewing','accepted','rejected','withdrawn')),
  message TEXT,
  admin_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (opportunity_id, user_id)
);

ALTER TABLE public.academy_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academy_opportunity_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY academy_opp_read ON public.academy_opportunities FOR SELECT TO authenticated
  USING (is_published = true OR is_admin());

CREATE POLICY academy_opp_apps_own ON public.academy_opportunity_applications FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY academy_opp_apps_admin ON public.academy_opportunity_applications FOR ALL TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());
