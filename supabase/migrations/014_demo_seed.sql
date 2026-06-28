-- =============================================================================
-- Migration 014 — Données démo communauté (Phase 10)
-- =============================================================================
-- Idempotent : n'insère que si tables vides ou entrées absentes

INSERT INTO public.social_groups (id, name, slug, description, category, privacy)
VALUES
  ('a0000001-0000-4000-8000-000000000001', 'Elite VSM', 'elite-vsm', 'Groupe des ambassadeurs Elite', 'Elite', 'public'),
  ('a0000001-0000-4000-8000-000000000002', 'Formation & Tips', 'formation-tips', 'Astuces vente et formation', 'Formation', 'public')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.academy_opportunities (title, category, description, location, starts_at, ends_at, slots, status, reward, is_published, image_url)
SELECT 'Campagne Printemps VSM', 'Campagne', 'Shooting collection printemps — ambassadeurs Bronze+', 'Kinshasa', now() + interval '7 days', now() + interval '30 days', 5, 'open', '500 USD + produits', true,
  'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&q=70'
WHERE NOT EXISTS (SELECT 1 FROM public.academy_opportunities LIMIT 1);

INSERT INTO public.academy_challenges (title, description, type, goal, reward_xp, reward_points, deadline, is_active)
SELECT 'Première publication', 'Publiez votre premier post dans la communauté', 'special', 'Publier 1 post', 50, 25, now() + interval '30 days', true
WHERE NOT EXISTS (SELECT 1 FROM public.academy_challenges LIMIT 1);
