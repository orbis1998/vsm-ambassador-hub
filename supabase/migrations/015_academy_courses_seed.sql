-- =============================================================================
-- Migration 015 — Seed formations Academy (complète migration 002)
-- =============================================================================
-- Idempotent : n'insère que si academy_courses est vide

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.academy_courses LIMIT 1) THEN
    RAISE NOTICE 'academy_courses déjà peuplé — seed ignoré';
    RETURN;
  END IF;

  -- Parcours principal
  INSERT INTO public.academy_courses (
    id, slug, title, description, category, difficulty, cover_url,
    duration_minutes, lesson_count, is_published, is_parcours, sort_order, reward_xp
  ) VALUES (
    'b1000001-0000-4000-8000-000000000001',
    'fondamentaux-vsm',
    'Fondamentaux Ambassadeur VSM',
    'Le parcours officiel pour maîtriser la marque, la vente et la création de contenu VSM Collection.',
    'Brand',
    'beginner',
    'https://images.unsplash.com/photo-1521577352947-9bb58764b69a?w=1200&q=70&auto=format&fit=crop',
    180, 9, true, true, 1, 500
  );

  -- Cours 1 : Brand & Storytelling
  INSERT INTO public.academy_courses (
    id, slug, title, description, category, difficulty, cover_url,
    duration_minutes, lesson_count, is_published, is_parcours, parent_parcours_id, sort_order, reward_xp
  ) VALUES (
    'b1000002-0000-4000-8000-000000000002',
    'brand-storytelling',
    'Brand & Storytelling VSM',
    'Comprendre l''ADN de la marque et raconter des histoires qui convertissent.',
    'Brand',
    'beginner',
    'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&q=70&auto=format&fit=crop',
    60, 3, true, false, 'b1000001-0000-4000-8000-000000000001', 1, 150
  );

  INSERT INTO public.academy_lessons (course_id, title, description, position, video_url, video_duration_seconds, content_md, is_free_preview) VALUES
    ('b1000002-0000-4000-8000-000000000002', 'L''univers VSM Collection', 'Découvrez l''histoire, les valeurs et le positionnement premium de la marque.', 1, NULL, 480,
     '## Bienvenue chez VSM\n\nVSM Collection incarne l''élégance africaine contemporaine. En tant qu''ambassadeur, vous êtes le visage de cette marque.\n\n- **Mission** : rendre la mode premium accessible\n- **Valeurs** : excellence, authenticité, communauté\n- **Ton** : confiant, inspirant, humain', true),
    ('b1000002-0000-4000-8000-000000000002', 'Construire votre story personnelle', 'Comment relier votre parcours à la marque pour créer de la confiance.', 2, NULL, 600,
     '## Votre story\n\nLes clients achètent à une personne qu''ils admirent. Structurez votre récit en 3 actes : origine, transformation, vision.', false),
    ('b1000002-0000-4000-8000-000000000002', 'Hooks & accroches qui captivent', 'Techniques d''accroche pour vos posts, stories et lives.', 3, NULL, 540,
     '## Les 5 hooks VSM\n\n1. Question provocante\n2. Chiffre surprenant\n3. Avant / Après\n4. Témoignage client\n5. Coulisses exclusives', false);

  INSERT INTO public.academy_quizzes (course_id, title, passing_score, questions) VALUES (
    'b1000002-0000-4000-8000-000000000002',
    'Quiz — Brand & Storytelling',
    70,
    '[
      {"id":"q1","prompt":"Quelle est la mission principale de VSM Collection ?","options":["Rendre la mode premium accessible","Vendre le moins cher possible","Copier les grandes marques"],"correctIndex":0},
      {"id":"q2","prompt":"Un bon storytelling ambassadeur doit être :","options":["Authentique et personnel","100% promotionnel","Détaché de la marque"],"correctIndex":0},
      {"id":"q3","prompt":"Combien de hooks VSM sont enseignés dans ce module ?","options":["3","5","10"],"correctIndex":1}
    ]'::jsonb
  );

  -- Cours 2 : Techniques de vente
  INSERT INTO public.academy_courses (
    id, slug, title, description, category, difficulty, cover_url,
    duration_minutes, lesson_count, is_published, is_parcours, parent_parcours_id, sort_order, reward_xp
  ) VALUES (
    'b1000003-0000-4000-8000-000000000003',
    'techniques-vente',
    'Techniques de Vente Ambassadeur',
    'Convertir vos contacts en clients fidèles avec la méthode VSM.',
    'Sales',
    'intermediate',
    'https://images.unsplash.com/photo-1556745753-b290d2ac3af0?w=1200&q=70&auto=format&fit=crop',
    75, 3, true, false, 'b1000001-0000-4000-8000-000000000001', 2, 175
  );

  INSERT INTO public.academy_lessons (course_id, title, description, position, video_url, video_duration_seconds, content_md) VALUES
    ('b1000003-0000-4000-8000-000000000003', 'Le funnel ambassadeur VSM', 'Les 4 étapes : attirer, engager, proposer, conclure.', 1, NULL, 720,
     '## Funnel VSM\n\n1. **Attirer** — contenu valeur\n2. **Engager** — DM / commentaires\n3. **Proposer** — offre personnalisée\n4. **Conclure** — urgence douce + preuve sociale'),
    ('b1000003-0000-4000-8000-000000000003', 'Objections courantes', 'Répondre aux 7 objections les plus fréquentes.', 2, NULL, 660,
     '## Top objections\n\n- « C''est trop cher » → valeur + qualité\n- « Je réfléchis » → preuve sociale + garantie\n- « Je commande plus tard » → scarcity authentique'),
    ('b1000003-0000-4000-8000-000000000003', 'Suivi & fidélisation', 'Transformer un client en ambassadeur de votre réseau.', 3, NULL, 540,
     '## Après la vente\n\nMessage J+1, photo portée, demande d''avis, invitation parrainage Programme.');

  INSERT INTO public.academy_quizzes (course_id, title, passing_score, questions) VALUES (
    'b1000003-0000-4000-8000-000000000003',
    'Quiz — Techniques de Vente',
    70,
    '[
      {"id":"q1","prompt":"Combien d''étapes compte le funnel ambassadeur VSM ?","options":["2","4","6"],"correctIndex":1},
      {"id":"q2","prompt":"Face à « c''est trop cher », la meilleure approche est :","options":["Baisser le prix immédiatement","Mettre en avant la valeur et la qualité","Ignorer l''objection"],"correctIndex":1}
    ]'::jsonb
  );

  -- Cours 3 : Création de contenu
  INSERT INTO public.academy_courses (
    id, slug, title, description, category, difficulty, cover_url,
    duration_minutes, lesson_count, is_published, is_parcours, parent_parcours_id, sort_order, reward_xp
  ) VALUES (
    'b1000004-0000-4000-8000-000000000004',
    'creation-contenu',
    'Création de Contenu Premium',
    'Photos, vidéos et posts qui mettent en valeur VSM Collection.',
    'Content',
    'intermediate',
    'https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=1200&q=70&auto=format&fit=crop',
    45, 3, true, false, 'b1000001-0000-4000-8000-000000000001', 3, 175
  );

  INSERT INTO public.academy_lessons (course_id, title, description, position, video_url, video_duration_seconds, content_md) VALUES
    ('b1000004-0000-4000-8000-000000000004', 'Photo produit avec smartphone', 'Éclairage, cadrage et retouches légères.', 1, NULL, 600,
     '## Photo mobile pro\n\nLumière naturelle, fond neutre, règle des tiers, éviter le flash direct.'),
    ('b1000004-0000-4000-8000-000000000004', 'Vidéos courtes Reels & TikTok', 'Scripts, transitions et musique tendance.', 2, NULL, 720,
     '## Format 15-30s\n\nHook 3s → démonstration → CTA. Sous-titres obligatoires.'),
    ('b1000004-0000-4000-8000-000000000004', 'Calendrier éditorial ambassadeur', 'Planifier une semaine de contenu en 30 minutes.', 3, NULL, 480,
     '## Semaine type\n\nLun: inspiration · Mar: produit · Mer: coulisses · Jeu: témoignage · Ven: offre · Sam: lifestyle · Dim: repos');

  INSERT INTO public.academy_quizzes (course_id, title, passing_score, questions) VALUES (
    'b1000004-0000-4000-8000-000000000004',
    'Quiz — Création de Contenu',
    70,
    '[
      {"id":"q1","prompt":"Pour une photo produit mobile, privilégiez :","options":["Le flash direct","La lumière naturelle","Un fond chargé"],"correctIndex":1},
      {"id":"q2","prompt":"Durée idéale d''un Reel ambassadeur :","options":["15-30 secondes","5 minutes","45 minutes"],"correctIndex":0}
    ]'::jsonb
  );

  -- Ressources
  INSERT INTO public.academy_resources (title, category, file_url, thumbnail_url, is_published) VALUES
    ('Brand Kit VSM 2026', 'brand', 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=70', 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&q=70', true),
    ('Templates Stories Instagram', 'template', 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=800&q=70', NULL, true),
    ('Guide Prix & Commissions', 'guide', 'https://images.unsplash.com/photo-1554224311-beee415c201f?w=800&q=70', NULL, true);

  -- Mettre à jour lesson_count
  UPDATE public.academy_courses c SET lesson_count = (
    SELECT count(*) FROM public.academy_lessons l WHERE l.course_id = c.id
  );

  UPDATE public.academy_courses SET duration_minutes = lesson_count * 20 WHERE NOT is_parcours;

  UPDATE public.academy_courses SET duration_minutes = (
    SELECT coalesce(sum(duration_minutes), 0) FROM public.academy_courses WHERE parent_parcours_id = 'b1000001-0000-4000-8000-000000000001'
  ), lesson_count = (
    SELECT coalesce(sum(lesson_count), 0) FROM public.academy_courses WHERE parent_parcours_id = 'b1000001-0000-4000-8000-000000000001'
  ) WHERE id = 'b1000001-0000-4000-8000-000000000001';

END $$;

-- Politique lecture quiz (manquante en 002)
DROP POLICY IF EXISTS academy_quizzes_read ON public.academy_quizzes;
CREATE POLICY academy_quizzes_read ON public.academy_quizzes FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.academy_courses c
      WHERE c.id = course_id AND (c.is_published = true OR is_admin())
    )
  );
