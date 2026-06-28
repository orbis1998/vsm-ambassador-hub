-- =============================================================================
-- Migration 022 — Notifications, blocage, signalements, messages, vues
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.academy_notification_preferences (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  channels JSONB NOT NULL DEFAULT '{
    "course": true, "quiz": true, "opportunity": true, "challenge": true,
    "message": true, "comment": true, "post": true, "follow": true,
    "campaign": true, "badge": true, "certificate": true
  }'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.academy_notification_preferences ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS academy_notif_prefs_own ON public.academy_notification_preferences;
CREATE POLICY academy_notif_prefs_own ON public.academy_notification_preferences
  FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE TABLE IF NOT EXISTS public.social_blocks (
  blocker_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  blocked_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (blocker_id, blocked_id)
);

ALTER TABLE public.social_blocks ENABLE ROW LEVEL SECURITY;
CREATE POLICY social_blocks_own ON public.social_blocks
  FOR ALL TO authenticated USING (blocker_id = auth.uid()) WITH CHECK (blocker_id = auth.uid());

CREATE TABLE IF NOT EXISTS public.social_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES public.social_posts(id) ON DELETE CASCADE,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.social_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY social_reports_insert ON public.social_reports
  FOR INSERT TO authenticated WITH CHECK (reporter_id = auth.uid());
CREATE POLICY social_reports_admin_read ON public.social_reports
  FOR SELECT TO authenticated USING (public.is_admin());

CREATE TABLE IF NOT EXISTS public.social_post_views (
  post_id UUID NOT NULL REFERENCES public.social_posts(id) ON DELETE CASCADE,
  viewer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (post_id, viewer_id)
);

ALTER TABLE public.social_post_views ENABLE ROW LEVEL SECURITY;
CREATE POLICY social_post_views_insert ON public.social_post_views
  FOR INSERT TO authenticated WITH CHECK (viewer_id = auth.uid());
CREATE POLICY social_post_views_read ON public.social_post_views
  FOR SELECT TO authenticated USING (true);

ALTER TABLE public.academy_messages
  ADD COLUMN IF NOT EXISTS edited_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_for_all BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_for UUID[] NOT NULL DEFAULT '{}';

CREATE OR REPLACE FUNCTION public.academy_notify_user(
  p_user_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_body TEXT,
  p_link TEXT DEFAULT NULL,
  p_actor_id UUID DEFAULT NULL
) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_channels JSONB;
  v_enabled BOOLEAN;
BEGIN
  SELECT channels INTO v_channels FROM academy_notification_preferences WHERE user_id = p_user_id;
  IF v_channels IS NULL THEN
    v_enabled := true;
  ELSE
    v_enabled := COALESCE((v_channels ->> p_type)::boolean, true);
  END IF;
  IF NOT v_enabled THEN RETURN; END IF;

  INSERT INTO academy_notifications (user_id, type, title, body, link, actor_id)
  VALUES (p_user_id, p_type, p_title, p_body, COALESCE(p_link, ''), p_actor_id);
END;
$$;

CREATE OR REPLACE FUNCTION public.academy_notify_ambassadors(
  p_type TEXT,
  p_title TEXT,
  p_body TEXT,
  p_link TEXT DEFAULT NULL
) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT DISTINCT p.id
    FROM profiles p
    WHERE p.role = 'ambassador'
       OR EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = p.id AND ur.role = 'ambassador')
  LOOP
    PERFORM academy_notify_user(r.id, p_type, p_title, p_body, p_link, NULL);
  END LOOP;
END;
$$;

-- Realtime notifications
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.academy_notifications;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
