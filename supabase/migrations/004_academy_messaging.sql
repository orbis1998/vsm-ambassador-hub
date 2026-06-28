-- =============================================================================
-- Migration 004 — Messagerie Academy (Realtime)
-- =============================================================================
-- POURQUOI : `conversations`/`messages` existants = bot WhatsApp (phone, role IA).
--            Impossible de réutiliser sans casser le Programme.
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.academy_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_ids UUID[] NOT NULL,
  is_group BOOLEAN NOT NULL DEFAULT false,
  title TEXT,
  last_message TEXT,
  last_message_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.academy_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.academy_conversations(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'text' CHECK (type IN ('text','image','video','doc','voice','emoji')),
  body TEXT NOT NULL DEFAULT '',
  metadata JSONB NOT NULL DEFAULT '{}',
  read_by UUID[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.academy_typing (
  conversation_id UUID NOT NULL REFERENCES public.academy_conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (conversation_id, user_id)
);

CREATE INDEX IF NOT EXISTS academy_messages_conv_idx ON public.academy_messages (conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS academy_conversations_participants_idx ON public.academy_conversations USING GIN (participant_ids);

ALTER TABLE public.academy_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academy_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academy_typing ENABLE ROW LEVEL SECURITY;

CREATE POLICY academy_conv_participant ON public.academy_conversations FOR ALL TO authenticated
  USING (auth.uid() = ANY(participant_ids))
  WITH CHECK (auth.uid() = ANY(participant_ids));

CREATE POLICY academy_msg_participant ON public.academy_messages FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.academy_conversations c
      WHERE c.id = conversation_id AND auth.uid() = ANY(c.participant_ids)
    )
  )
  WITH CHECK (author_id = auth.uid());

CREATE POLICY academy_typing_participant ON public.academy_typing FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.academy_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.academy_typing;
