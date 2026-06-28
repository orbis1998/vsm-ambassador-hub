-- =============================================================================
-- Migration 021 — Lecture des messages par les participants (read_by)
-- =============================================================================
-- Avant : WITH CHECK (author_id = auth.uid()) bloquait la mise à jour de read_by
-- sur les messages reçus.

DROP POLICY IF EXISTS academy_msg_participant ON public.academy_messages;

CREATE POLICY academy_msg_participant_read ON public.academy_messages
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.academy_conversations c
      WHERE c.id = conversation_id AND auth.uid() = ANY(c.participant_ids)
    )
  );

CREATE POLICY academy_msg_participant_insert ON public.academy_messages
  FOR INSERT TO authenticated
  WITH CHECK (
    author_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.academy_conversations c
      WHERE c.id = conversation_id AND auth.uid() = ANY(c.participant_ids)
    )
  );

CREATE POLICY academy_msg_participant_update ON public.academy_messages
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.academy_conversations c
      WHERE c.id = conversation_id AND auth.uid() = ANY(c.participant_ids)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.academy_conversations c
      WHERE c.id = conversation_id AND auth.uid() = ANY(c.participant_ids)
    )
  );

CREATE POLICY academy_msg_participant_delete ON public.academy_messages
  FOR DELETE TO authenticated
  USING (author_id = auth.uid());
