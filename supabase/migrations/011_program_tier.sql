-- =============================================================================
-- Migration 011 — Niveau Programme Ambassadeur (Starter → Elite)
-- =============================================================================
-- Source : ambassador_confirmed_sales_count (même logique que le Programme).
-- Paliers Programme : Starter (0–10), Bronze (11–15), Silver (16–35), Elite (36+).

CREATE OR REPLACE FUNCTION public.get_ambassador_program_tier(p_user_id UUID DEFAULT auth.uid())
RETURNS TEXT LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  sales INTEGER;
BEGIN
  sales := public.ambassador_confirmed_sales_count(p_user_id);
  IF sales >= 36 THEN RETURN 'Elite';
  ELSIF sales >= 16 THEN RETURN 'Silver';
  ELSIF sales >= 11 THEN RETURN 'Bronze';
  ELSE RETURN 'Starter';
  END IF;
END;
$$;

COMMENT ON FUNCTION public.get_ambassador_program_tier IS
  'Palier Programme : Starter (0–10), Bronze (11–15), Silver (16–35), Elite (36+) ventes confirmées.';

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
  public.get_ambassador_program_tier(p.id) AS level,
  COALESCE(p.xp, 0) AS xp,
  COALESCE(p.points, 0) AS points,
  COALESCE(p.country, '') AS country,
  ROW_NUMBER() OVER (ORDER BY COALESCE(p.xp, 0) DESC) AS rank
FROM public.profiles p
WHERE public.is_ambassador(p.id) OR p.role = 'ambassador'
ORDER BY xp DESC;

COMMENT ON COLUMN public.profiles.level IS
  'DEPRECATED — Niveau Programme via get_ambassador_program_tier(sales). Ne pas lire.';
