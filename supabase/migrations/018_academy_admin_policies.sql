-- Admin write policies for Academy content management
CREATE POLICY academy_courses_admin ON public.academy_courses FOR ALL TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY academy_lessons_admin ON public.academy_lessons FOR ALL TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY academy_quizzes_admin ON public.academy_quizzes FOR ALL TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY academy_resources_admin ON public.academy_resources FOR ALL TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY academy_challenges_admin ON public.academy_challenges FOR ALL TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY academy_badges_admin ON public.academy_badges FOR ALL TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY academy_opp_admin ON public.academy_opportunities FOR ALL TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());
