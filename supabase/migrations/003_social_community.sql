-- =============================================================================
-- Migration 003 — Communauté sociale privée ambassadeurs
-- =============================================================================
-- POURQUOI : Réseau social Academy inexistant. Tables 100 % nouvelles.
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.social_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  text TEXT NOT NULL DEFAULT '',
  media JSONB NOT NULL DEFAULT '[]',
  group_id UUID,
  tags TEXT[] NOT NULL DEFAULT '{}',
  comments_count INTEGER NOT NULL DEFAULT 0,
  shares_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.social_stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  media_url TEXT NOT NULL,
  caption TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.social_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.social_posts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES public.social_comments(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  likes_count INTEGER NOT NULL DEFAULT 0,
  pinned BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.social_reactions (
  post_id UUID NOT NULL REFERENCES public.social_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reaction TEXT NOT NULL CHECK (reaction IN ('love','fire','clap','rocket','diamond')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (post_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.social_saved_posts (
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES public.social_posts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, post_id)
);

CREATE TABLE IF NOT EXISTS public.social_followers (
  follower_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (follower_id, following_id),
  CHECK (follower_id <> following_id)
);

CREATE TABLE IF NOT EXISTS public.social_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  cover_url TEXT,
  category TEXT NOT NULL DEFAULT 'General',
  privacy TEXT NOT NULL DEFAULT 'public' CHECK (privacy IN ('public','private')),
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.social_posts
  ADD CONSTRAINT social_posts_group_fk
  FOREIGN KEY (group_id) REFERENCES public.social_groups(id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS public.social_group_members (
  group_id UUID NOT NULL REFERENCES public.social_groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member',
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (group_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.social_story_views (
  story_id UUID NOT NULL REFERENCES public.social_stories(id) ON DELETE CASCADE,
  viewer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (story_id, viewer_id)
);

-- RLS : contenu visible par ambassadeurs authentifiés
ALTER TABLE public.social_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_saved_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_followers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_story_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY social_posts_read ON public.social_posts FOR SELECT TO authenticated USING (true);
CREATE POLICY social_posts_insert ON public.social_posts FOR INSERT TO authenticated WITH CHECK (author_id = auth.uid());
CREATE POLICY social_posts_update_own ON public.social_posts FOR UPDATE TO authenticated USING (author_id = auth.uid());
CREATE POLICY social_posts_delete_own ON public.social_posts FOR DELETE TO authenticated USING (author_id = auth.uid() OR is_admin());

CREATE POLICY social_stories_read ON public.social_stories FOR SELECT TO authenticated
  USING (expires_at > now());
CREATE POLICY social_stories_insert ON public.social_stories FOR INSERT TO authenticated WITH CHECK (author_id = auth.uid());

CREATE POLICY social_comments_read ON public.social_comments FOR SELECT TO authenticated USING (true);
CREATE POLICY social_comments_insert ON public.social_comments FOR INSERT TO authenticated WITH CHECK (author_id = auth.uid());

CREATE POLICY social_reactions_all ON public.social_reactions FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY social_saved_own ON public.social_saved_posts FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY social_followers_read ON public.social_followers FOR SELECT TO authenticated USING (true);
CREATE POLICY social_followers_insert ON public.social_followers FOR INSERT TO authenticated WITH CHECK (follower_id = auth.uid());
CREATE POLICY social_followers_delete ON public.social_followers FOR DELETE TO authenticated USING (follower_id = auth.uid());

CREATE POLICY social_groups_read ON public.social_groups FOR SELECT TO authenticated USING (true);
CREATE POLICY social_group_members_read ON public.social_group_members FOR SELECT TO authenticated USING (true);
CREATE POLICY social_group_members_join ON public.social_group_members FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
