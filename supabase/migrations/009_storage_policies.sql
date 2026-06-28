-- =============================================================================
-- Migration 009 — Storage buckets Academy (complète bucket `images` existant)
-- =============================================================================
-- POURQUOI : Un seul bucket public `images` existe. Sous-dossiers recommandés.
--            Buckets dédiés pour isolation si souhaité.
-- =============================================================================

INSERT INTO storage.buckets (id, name, public)
VALUES
  ('academy-avatars', 'academy-avatars', true),
  ('academy-social', 'academy-social', false),
  ('academy-certificates', 'academy-certificates', false),
  ('academy-resources', 'academy-resources', true)
ON CONFLICT (id) DO NOTHING;

-- Avatars : lecture publique, écriture propre dossier
DROP POLICY IF EXISTS academy_avatars_read ON storage.objects;
CREATE POLICY academy_avatars_read ON storage.objects FOR SELECT TO public
  USING (bucket_id = 'academy-avatars');

DROP POLICY IF EXISTS academy_avatars_upload ON storage.objects;
CREATE POLICY academy_avatars_upload ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'academy-avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS academy_social_read ON storage.objects;
CREATE POLICY academy_social_read ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'academy-social');

DROP POLICY IF EXISTS academy_social_upload ON storage.objects;
CREATE POLICY academy_social_upload ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'academy-social' AND auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS academy_certs_read ON storage.objects;
CREATE POLICY academy_certs_read ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'academy-certificates' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS academy_resources_read ON storage.objects;
CREATE POLICY academy_resources_read ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'academy-resources');
