-- Permettre aux utilisateurs authentifiés de déclencher des notifications in-app (messages, commentaires…)
GRANT EXECUTE ON FUNCTION public.academy_notify_user(UUID, TEXT, TEXT, TEXT, TEXT, UUID) TO authenticated;
