-- =============================================================================
-- Migration 008 — RPC Auth SSO + vues utilitaires
-- =============================================================================

-- Vérifie si l'utilisateur est ambassadeur (réutilise user_roles + profiles.role)
CREATE OR REPLACE FUNCTION public.is_ambassador(p_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = p_user_id AND role = 'ambassador'
  )
  OR EXISTS (
    SELECT 1 FROM public.profiles WHERE id = p_user_id AND role = 'ambassador'
  );
$$;

-- Résout badge / téléphone / email → email auth pour signInWithPassword
CREATE OR REPLACE FUNCTION public.resolve_ambassador_login(identifier TEXT)
RETURNS TABLE(email TEXT, user_id UUID) LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_id TEXT := trim(identifier);
  v_badge TEXT;
  v_phone TEXT;
BEGIN
  -- Email direct
  IF v_id ~* '^[^@]+@[^@]+\.[^@]+$' THEN
    RETURN QUERY
    SELECT lower(p.email), p.id FROM public.profiles p
    WHERE lower(p.email) = lower(v_id) LIMIT 1;
    IF FOUND THEN RETURN; END IF;
    RETURN QUERY SELECT lower(u.email::text), u.id FROM auth.users u
    WHERE lower(u.email) = lower(v_id) LIMIT 1;
    RETURN;
  END IF;

  -- Badge VSM-XXXX (slug ambassador_links — Programme Ambassadeur)
  IF upper(v_id) ~ '^VSM[- ]?[A-Z0-9]+$' THEN
    v_badge := upper(regexp_replace(trim(v_id), '\s', '', 'g'));
    IF v_badge NOT LIKE 'VSM-%' THEN
      v_badge := regexp_replace(v_badge, '^VSM', 'VSM-');
    END IF;
    RETURN QUERY
    SELECT lower(COALESCE(p.email, u.email::text)), al.ambassador_id
    FROM public.ambassador_links al
    JOIN public.profiles p ON p.id = al.ambassador_id
    LEFT JOIN auth.users u ON u.id = p.id
    WHERE upper(al.slug) = v_badge
    ORDER BY al.active DESC, al.created_at DESC
    LIMIT 1;
    RETURN;
  END IF;

  -- Téléphone
  v_phone := regexp_replace(v_id, '[^0-9+]', '', 'g');
  RETURN QUERY
  SELECT lower(COALESCE(p.email, u.email::text)), p.id
  FROM public.profiles p
  LEFT JOIN auth.users u ON u.id = p.id
  WHERE regexp_replace(COALESCE(p.phone, ''), '[^0-9+]', '', 'g') = v_phone
     OR p.phone = v_id
  LIMIT 1;
END;
$$;

-- Vue leaderboard (évite table leaderboards dédiée)
CREATE OR REPLACE VIEW public.academy_leaderboard AS
SELECT
  p.id,
  COALESCE(p.full_name, p.name, 'Ambassadeur') AS name,
  COALESCE(p.handle, '') AS handle,
  COALESCE(
    (
      SELECT al.slug
      FROM public.ambassador_links al
      WHERE al.ambassador_id = p.id
      ORDER BY al.active DESC, al.created_at DESC
      LIMIT 1
    ),
    ''
  ) AS badge,
  COALESCE(p.avatar_url, '') AS avatar_url,
  COALESCE(p.level, 'Rookie') AS level,
  COALESCE(p.xp, 0) AS xp,
  COALESCE(p.points, 0) AS points,
  COALESCE(p.country, '') AS country,
  ROW_NUMBER() OVER (ORDER BY COALESCE(p.xp, 0) DESC) AS rank
FROM public.profiles p
WHERE public.is_ambassador(p.id) OR p.role = 'ambassador'
ORDER BY xp DESC;

GRANT SELECT ON public.academy_leaderboard TO authenticated;
