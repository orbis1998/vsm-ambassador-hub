-- =============================================================================
-- Migration 028 — cover_url dans le RPC profil + UPDATE storage avatars
-- =============================================================================

-- Upsert cover/avatar nécessite UPDATE sur le bucket academy-avatars
DROP POLICY IF EXISTS academy_avatars_update ON storage.objects;
CREATE POLICY academy_avatars_update ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'academy-avatars' AND (storage.foldername(name))[1] = auth.uid()::text)
  WITH CHECK (bucket_id = 'academy-avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS academy_avatars_delete ON storage.objects;
CREATE POLICY academy_avatars_delete ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'academy-avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- RPC profil : exposer cover_url (manquant → couverture jamais affichée après refresh)
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
    'cover_url', COALESCE(v_profile.cover_url, ''),
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
