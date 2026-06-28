-- =============================================================================
-- Migration 007 — Notifications in-app + RLS push_outbox
-- =============================================================================
-- POURQUOI : push_outbox existe (Programme) mais sans politique RLS (audit §10).
--            academy_notifications pour le centre de notifications Academy.
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.academy_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL DEFAULT '',
  actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  link TEXT,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS academy_notifications_user_idx
  ON public.academy_notifications (user_id, created_at DESC);

ALTER TABLE public.academy_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY academy_notif_own ON public.academy_notifications FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Compléter push_outbox (table existante — NE PAS recréer)
DROP POLICY IF EXISTS push_outbox_select_own ON public.push_outbox;
CREATE POLICY push_outbox_select_own ON public.push_outbox FOR SELECT TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS push_outbox_insert_service ON public.push_outbox;
-- Insert réservé aux triggers SECURITY DEFINER existants (_enqueue_push)

CREATE TABLE IF NOT EXISTS public.academy_push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  channels TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, endpoint)
);

ALTER TABLE public.academy_push_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY academy_push_sub_own ON public.academy_push_subscriptions FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
