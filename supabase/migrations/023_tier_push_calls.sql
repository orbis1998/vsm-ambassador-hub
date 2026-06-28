-- =============================================================================
-- Migration 023 — Niveau Programme (ventes), push Academy, sync tier profils
-- =============================================================================

-- Recalcul du palier depuis les ventes confirmées (jamais profiles.level en lecture)
CREATE OR REPLACE FUNCTION public.sync_profile_program_tier(p_user_id UUID)
RETURNS TEXT LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_tier TEXT;
BEGIN
  v_tier := public.get_ambassador_program_tier(p_user_id);
  UPDATE public.profiles
  SET level = v_tier, updated_at = now()
  WHERE id = p_user_id AND (level IS DISTINCT FROM v_tier);
  RETURN v_tier;
END;
$$;

-- Backfill : aligner profiles.level sur les ventes réelles
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN
    SELECT p.id FROM public.profiles p
    WHERE public.is_ambassador(p.id) OR p.role = 'ambassador'
  LOOP
    PERFORM public.sync_profile_program_tier(r.id);
  END LOOP;
END $$;

-- Vue leaderboard : niveau toujours depuis ventes (pas profiles.level)
CREATE OR REPLACE VIEW public.academy_leaderboard AS
SELECT
  p.id,
  COALESCE(
    NULLIF(trim(p.full_name), ''),
    NULLIF(trim(p.name), ''),
    NULLIF(split_part(p.email, '@', 1), ''),
    'Ambassadeur'
  ) AS name,
  COALESCE(p.handle, '') AS handle,
  COALESCE(
    (
      SELECT al.slug
      FROM public.ambassador_links al
      WHERE al.ambassador_id = p.id
      ORDER BY al.active DESC NULLS LAST, al.created_at DESC
      LIMIT 1
    ),
    ''
  ) AS badge,
  COALESCE(p.avatar_url, '') AS avatar_url,
  public.get_ambassador_program_tier(p.id) AS level,
  COALESCE(p.xp, 0) AS xp,
  COALESCE(p.points, 0) AS points,
  COALESCE(p.country, '') AS country,
  ROW_NUMBER() OVER (ORDER BY COALESCE(p.xp, 0) DESC) AS rank
FROM public.profiles p
WHERE public.is_ambassador(p.id) OR p.role = 'ambassador'
ORDER BY xp DESC;

COMMENT ON COLUMN public.profiles.level IS
  'Miroir cache du palier Programme — source de vérité : get_ambassador_program_tier(ventes).';

-- Profil RPC : niveau recalculé à chaque appel
CREATE OR REPLACE FUNCTION public.get_ambassador_program_profile(p_user_id UUID DEFAULT auth.uid())
RETURNS JSON LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_profile public.profiles%ROWTYPE;
  v_badge TEXT;
  v_tier TEXT;
  v_is_ambassador BOOLEAN;
  v_app_full_name TEXT;
  v_app_username TEXT;
  v_app_phone TEXT;
BEGIN
  SELECT * INTO v_profile FROM public.profiles WHERE id = p_user_id;
  IF NOT FOUND THEN RETURN NULL; END IF;

  SELECT al.slug INTO v_badge
  FROM public.ambassador_links al
  WHERE al.ambassador_id = p_user_id
  ORDER BY al.active DESC NULLS LAST, al.created_at DESC
  LIMIT 1;

  v_tier := public.get_ambassador_program_tier(p_user_id);
  v_is_ambassador := public.is_ambassador(p_user_id);

  SELECT a.full_name, a.username, a.phone
  INTO v_app_full_name, v_app_username, v_app_phone
  FROM public.ambassador_applications a
  WHERE a.user_id = p_user_id
  ORDER BY a.created_at DESC
  LIMIT 1;

  RETURN json_build_object(
    'id', v_profile.id,
    'role', CASE WHEN v_is_ambassador THEN 'ambassador' ELSE v_profile.role END,
    'name', COALESCE(
      NULLIF(trim(v_profile.full_name), ''),
      NULLIF(trim(v_profile.name), ''),
      NULLIF(trim(v_app_full_name), ''),
      NULLIF(split_part(v_profile.email, '@', 1), ''),
      'Ambassadeur'
    ),
    'email', v_profile.email,
    'phone', COALESCE(NULLIF(trim(v_profile.phone), ''), NULLIF(trim(v_app_phone), '')),
    'badge', COALESCE(v_badge, ''),
    'handle', COALESCE(NULLIF(trim(v_profile.handle), ''), NULLIF(trim(v_app_username), ''), ''),
    'avatar_url', COALESCE(v_profile.avatar_url, ''),
    'bio', v_profile.bio,
    'country', COALESCE(v_profile.country, ''),
    'level', v_tier,
    'xp', COALESCE(v_profile.xp, 0),
    'points', COALESCE(v_profile.points, 0),
    'academy_progress', COALESCE(v_profile.academy_progress, 0),
    'is_ambassador', v_is_ambassador
  );
END;
$$;

-- Notifications : in-app + file push Programme (push_outbox)
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

  BEGIN
    PERFORM public._enqueue_push(
      p_user_id,
      p_title,
      p_body,
      COALESCE(NULLIF(p_link, ''), '/notifications'),
      p_type,
      jsonb_build_object('source', 'academy', 'type', p_type)
    );
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;
END;
$$;
