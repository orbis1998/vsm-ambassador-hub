-- =============================================================================
-- Migration 001 — Enrichissement profiles pour VSM Ambassador Academy
-- =============================================================================
-- POURQUOI : L'audit confirme qu'il n'existe PAS de table `ambassadors`.
--            Toutes les FK (orders, promo_codes, ambassador_links) pointent vers
--            profiles.id (= auth.users.id). Un seul compte par ambassadeur.
-- IMPACT : Ajoute uniquement des colonnes NULLables avec défauts — aucune
--          donnée existante n'est modifiée ni supprimée.
-- =============================================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS badge TEXT,
  ADD COLUMN IF NOT EXISTS handle TEXT,
  ADD COLUMN IF NOT EXISTS avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS bio TEXT,
  ADD COLUMN IF NOT EXISTS country TEXT,
  ADD COLUMN IF NOT EXISTS xp INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS points INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS level TEXT NOT NULL DEFAULT 'Rookie',
  ADD COLUMN IF NOT EXISTS academy_progress INTEGER NOT NULL DEFAULT 0;

CREATE UNIQUE INDEX IF NOT EXISTS profiles_badge_unique
  ON public.profiles (badge) WHERE badge IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS profiles_handle_unique
  ON public.profiles (handle) WHERE handle IS NOT NULL;

CREATE INDEX IF NOT EXISTS profiles_xp_desc_idx ON public.profiles (xp DESC);
CREATE INDEX IF NOT EXISTS profiles_level_idx ON public.profiles (level);

COMMENT ON COLUMN public.profiles.badge IS 'DEPRECATED — Badge officiel = ambassador_links.slug (Programme Ambassadeur). Ne pas écrire ni lire.';
COMMENT ON COLUMN public.profiles.level IS 'Rookie|Bronze|Silver|Gold Ambassador|Platinum|Diamond';

-- Politique : les ambassadeurs authentifiés peuvent voir les profils publics (classement, communauté)
DROP POLICY IF EXISTS profiles_select_ambassadors_public ON public.profiles;
CREATE POLICY profiles_select_ambassadors_public ON public.profiles
  FOR SELECT TO authenticated
  USING (
    id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = profiles.id AND ur.role IN ('ambassador', 'admin')
    )
    OR has_role(auth.uid(), 'ambassador')
    OR has_role(auth.uid(), 'admin')
  );
