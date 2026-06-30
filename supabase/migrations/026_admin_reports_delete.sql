-- Admin peut supprimer les signalements traités
DROP POLICY IF EXISTS social_reports_admin_delete ON public.social_reports;
CREATE POLICY social_reports_admin_delete ON public.social_reports
  FOR DELETE TO authenticated USING (public.is_admin());
