-- =============================================================================
-- Migration 020 — Synchronise profiles.role admin ↔ user_roles
-- =============================================================================

-- Tout profil admin doit avoir une entrée user_roles
INSERT INTO public.user_roles (user_id, role)
SELECT p.id, 'admin'
FROM public.profiles p
WHERE p.role = 'admin'
  AND NOT EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = p.id AND ur.role = 'admin'
  )
ON CONFLICT DO NOTHING;

-- Toute entrée user_roles admin doit avoir profiles.role = admin
UPDATE public.profiles p
SET role = 'admin'
WHERE EXISTS (
  SELECT 1 FROM public.user_roles ur
  WHERE ur.user_id = p.id AND ur.role = 'admin'
)
AND p.role IS DISTINCT FROM 'admin';
