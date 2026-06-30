/* Supabase typings incomplets pour tables social_* / academy_* — requêtes validées en runtime. */
// @ts-nocheck
import { getSupabase } from "@/lib/supabase/client";
import { resolvePostMedia } from "@/services/storage.service";
import { fetchAmbassadorById } from "@/services/ambassador.service";
import type { VsmOpportunity } from "@/types/opportunities";
import {
  EMPTY_REACTIONS,
  REACTIONS,
  type Comment,
  type Group,
  type Post,
  type PostMedia,
  type ReactionKey,
  type Story,
  type StoryGroup,
  type StoryViewer,
} from "@/types/social";

const DEFAULT_GROUP_COVER =
  "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&q=70&auto=format&fit=crop";

/** Tables social_* absentes du typage Database généré. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function socialDb(): any {
  return getSupabase();
}

function isMissingTable(error: { code?: string } | null): boolean {
  return error?.code === "42P01" || error?.code === "PGRST205";
}

type PostRow = {
  id: string;
  author_id: string;
  text: string;
  media: PostMedia[] | null;
  group_id: string | null;
  tags: string[] | null;
  comments_count: number;
  shares_count: number;
  created_at: string;
};

async function aggregateReactions(postIds: string[]): Promise<Map<string, Record<ReactionKey, number>>> {
  const map = new Map<string, Record<ReactionKey, number>>();
  if (!postIds.length) return map;

  const supabase = socialDb();
  const { data, error } = await supabase
    .from("social_reactions")
    .select("post_id, reaction")
    .in("post_id", postIds);

  if (error) return map;

  for (const id of postIds) map.set(id, { ...EMPTY_REACTIONS });

  for (const row of data ?? []) {
    const r = row as { post_id: string; reaction: ReactionKey };
    const counts = map.get(r.post_id) ?? { ...EMPTY_REACTIONS };
    if (r.reaction in counts) counts[r.reaction] += 1;
    map.set(r.post_id, counts);
  }
  return map;
}

async function fetchUserReactions(userId: string, postIds: string[]): Promise<Map<string, ReactionKey>> {
  const map = new Map<string, ReactionKey>();
  if (!postIds.length) return map;

  const supabase = socialDb();
  const { data, error } = await supabase
    .from("social_reactions")
    .select("post_id, reaction")
    .eq("user_id", userId)
    .in("post_id", postIds);

  if (error) return map;
  for (const row of data ?? []) {
    const r = row as { post_id: string; reaction: ReactionKey };
    map.set(r.post_id, r.reaction);
  }
  return map;
}

async function fetchSavedPostIds(userId: string, postIds: string[]): Promise<Set<string>> {
  const set = new Set<string>();
  if (!postIds.length) return set;

  const supabase = socialDb();
  const { data, error } = await supabase
    .from("social_saved_posts")
    .select("post_id")
    .eq("user_id", userId)
    .in("post_id", postIds);

  if (error) return set;
  for (const row of data ?? []) set.add((row as { post_id: string }).post_id);
  return set;
}

async function fetchPostViewCounts(postIds: string[]): Promise<Map<string, number>> {
  const map = new Map<string, number>();
  if (!postIds.length) return map;
  const supabase = socialDb();
  const { data, error } = await supabase.from("social_post_views").select("post_id").in("post_id", postIds);
  if (error) return map;
  for (const id of postIds) map.set(id, 0);
  for (const row of data ?? []) {
    const pid = (row as { post_id: string }).post_id;
    map.set(pid, (map.get(pid) ?? 0) + 1);
  }
  return map;
}

function mapPostRow(
  row: PostRow,
  reactions: Record<ReactionKey, number>,
  saved: boolean,
  myReaction: ReactionKey | null | undefined,
  viewCount = 0,
): Post {
  return {
    id: row.id,
    author_id: row.author_id,
    created_at: row.created_at,
    text: row.text,
    media: Array.isArray(row.media) ? row.media : [],
    reactions,
    comments_count: row.comments_count,
    shares: row.shares_count,
    view_count: viewCount,
    saved,
    my_reaction: myReaction ?? null,
    group_id: row.group_id,
    tags: row.tags ?? [],
  };
}

async function enrichPosts(rows: PostRow[], userId?: string): Promise<Post[]> {
  if (!rows.length) return [];
  const ids = rows.map((r) => r.id);
  const [reactionMap, myReactions, savedSet, viewMap] = await Promise.all([
    aggregateReactions(ids),
    userId ? fetchUserReactions(userId, ids) : Promise.resolve(new Map()),
    userId ? fetchSavedPostIds(userId, ids) : Promise.resolve(new Set<string>()),
    fetchPostViewCounts(ids),
  ]);

  const posts = rows.map((row) =>
    mapPostRow(
      row,
      reactionMap.get(row.id) ?? { ...EMPTY_REACTIONS },
      savedSet.has(row.id),
      userId ? myReactions.get(row.id) : null,
      viewMap.get(row.id) ?? 0,
    ),
  );

  return Promise.all(
    posts.map(async (post) => ({
      ...post,
      media: await resolvePostMedia(post.media),
    })),
  );
}

export async function fetchPosts(userId: string | undefined, limit = 40, offset = 0): Promise<Post[]> {
  const supabase = socialDb();
  const { data, error } = await supabase
    .from("social_posts")
    .select("*")
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    if (isMissingTable(error)) return [];
    throw error;
  }
  return enrichPosts((data ?? []) as PostRow[], userId);
}

export async function fetchFollowingIds(userId: string): Promise<string[]> {
  const supabase = socialDb();
  const { data, error } = await supabase
    .from("social_followers")
    .select("following_id")
    .eq("follower_id", userId);

  if (error) return [];
  return (data ?? []).map((r) => (r as { following_id: string }).following_id);
}

export async function fetchPostsByAuthor(authorId: string, userId?: string, limit = 20): Promise<Post[]> {
  const supabase = socialDb();
  const { data, error } = await supabase
    .from("social_posts")
    .select("*")
    .eq("author_id", authorId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) return [];
  return enrichPosts((data ?? []) as PostRow[], userId);
}

export async function fetchPostsByGroup(groupId: string, userId?: string, limit = 20): Promise<Post[]> {
  const supabase = socialDb();
  const { data, error } = await supabase
    .from("social_posts")
    .select("*")
    .eq("group_id", groupId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) return [];
  return enrichPosts((data ?? []) as PostRow[], userId);
}

export async function createPost(
  userId: string,
  text: string,
  opts?: { groupId?: string; tags?: string[]; media?: PostMedia[] },
): Promise<Post | null> {
  const supabase = socialDb();
  const { data, error } = await supabase
    .from("social_posts")
    .insert({
      author_id: userId,
      text: text.trim(),
      media: opts?.media ?? [],
      group_id: opts?.groupId ?? null,
      tags: opts?.tags ?? [],
    })
    .select("*")
    .single();

  if (error) throw error;
  return mapPostRow(data as PostRow, { ...EMPTY_REACTIONS }, false, null);
}

export async function fetchStoryLikeState(userId: string, storyIds: string[]): Promise<Map<string, boolean>> {
  const map = new Map<string, boolean>();
  if (!storyIds.length) return map;
  const supabase = socialDb();
  const { data } = await supabase.from("social_story_likes").select("story_id").eq("user_id", userId).in("story_id", storyIds);
  for (const id of storyIds) map.set(id, false);
  for (const row of data ?? []) map.set((row as { story_id: string }).story_id, true);
  return map;
}

export async function fetchStories(userId?: string): Promise<Story[]> {
  const supabase = socialDb();
  const { data, error } = await supabase
    .from("social_stories")
    .select("*")
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false });

  if (error) {
    if (isMissingTable(error)) return [];
    throw error;
  }

  let viewedIds = new Set<string>();
  let likedMap = new Map<string, boolean>();
  let viewCounts = new Map<string, number>();
  let likeCounts = new Map<string, number>();
  if (userId && data?.length) {
    const storyIds = data.map((s) => (s as { id: string }).id);
    const authorByStory = new Map(
      (data as { id: string; author_id: string }[]).map((s) => [s.id, s.author_id]),
    );
    const [{ data: views }, likes, { data: allViews }, { data: allLikes }] = await Promise.all([
      supabase.from("social_story_views").select("story_id").eq("viewer_id", userId).in("story_id", storyIds),
      fetchStoryLikeState(userId, storyIds),
      supabase.from("social_story_views").select("story_id, viewer_id").in("story_id", storyIds),
      supabase.from("social_story_likes").select("story_id").in("story_id", storyIds),
    ]);
    viewedIds = new Set((views ?? []).map((v) => (v as { story_id: string }).story_id));
    likedMap = likes;
    for (const id of storyIds) {
      viewCounts.set(id, 0);
      likeCounts.set(id, 0);
    }
    for (const row of allViews ?? []) {
      const r = row as { story_id: string; viewer_id: string };
      if (r.viewer_id === authorByStory.get(r.story_id)) continue;
      viewCounts.set(r.story_id, (viewCounts.get(r.story_id) ?? 0) + 1);
    }
    for (const row of allLikes ?? []) {
      const sid = (row as { story_id: string }).story_id;
      likeCounts.set(sid, (likeCounts.get(sid) ?? 0) + 1);
    }
  }

  return (data ?? []).map((s) => {
    const row = s as { id: string; author_id: string; created_at: string; expires_at: string; media_url: string; caption?: string };
    return {
      id: row.id,
      author_id: row.author_id,
      created_at: row.created_at,
      expires_at: row.expires_at,
      media_url: row.media_url,
      caption: row.caption,
      viewed: viewedIds.has(row.id),
      liked: likedMap.get(row.id) ?? false,
      view_count: viewCounts.get(row.id) ?? 0,
      like_count: likeCounts.get(row.id) ?? 0,
    };
  });
}

export async function fetchStoryGroups(userId?: string): Promise<StoryGroup[]> {
  const stories = await fetchStories(userId);
  const byAuthor = new Map<string, Story[]>();
  for (const s of stories) {
    const list = byAuthor.get(s.author_id) ?? [];
    list.push(s);
    byAuthor.set(s.author_id, list);
  }

  const groups: StoryGroup[] = [];
  for (const [author_id, authorStories] of byAuthor) {
    authorStories.sort((a, b) => a.created_at.localeCompare(b.created_at));
    groups.push({
      author_id,
      stories: authorStories,
      has_unseen: authorStories.some((s) => !s.viewed),
    });
  }

  groups.sort((a, b) => {
    if (a.has_unseen !== b.has_unseen) return a.has_unseen ? -1 : 1;
    const aLast = a.stories[a.stories.length - 1]?.created_at ?? "";
    const bLast = b.stories[b.stories.length - 1]?.created_at ?? "";
    return bLast.localeCompare(aLast);
  });

  return groups;
}

export async function fetchSavedPosts(userId: string): Promise<Post[]> {
  const supabase = socialDb();
  const { data: saved, error } = await supabase
    .from("social_saved_posts")
    .select("post_id, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error || !saved?.length) return [];

  const postIds = (saved as { post_id: string }[]).map((r) => r.post_id);
  const { data: posts } = await supabase.from("social_posts").select("*").in("id", postIds);
  const enriched = await enrichPosts((posts ?? []) as PostRow[], userId);
  const order = new Map(postIds.map((id, i) => [id, i]));
  return enriched.sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));
}

async function fetchStoryProfiles(userIds: string[]): Promise<Map<string, StoryViewer>> {
  if (!userIds.length) return new Map();
  const supabase = socialDb();
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, name, avatar_url")
    .in("id", userIds);

  return new Map(
    (profiles ?? []).map((p) => {
      const row = p as { id: string; full_name?: string; name?: string; avatar_url?: string };
      return [
        row.id,
        {
          id: row.id,
          name: row.full_name?.trim() || row.name?.trim() || "Ambassadeur",
          avatar: row.avatar_url ?? undefined,
        },
      ] as const;
    }),
  );
}

export async function fetchStoryViewers(storyId: string): Promise<StoryViewer[]> {
  const supabase = socialDb();
  const { data: storyRow } = await supabase.from("social_stories").select("author_id").eq("id", storyId).maybeSingle();
  const authorId = (storyRow as { author_id?: string } | null)?.author_id;

  const { data, error } = await supabase
    .from("social_story_views")
    .select("viewer_id, viewed_at")
    .eq("story_id", storyId)
    .order("viewed_at", { ascending: false })
    .limit(50);
  if (error || !data?.length) return [];

  const ids = [...new Set((data as { viewer_id: string }[]).map((r) => r.viewer_id))].filter(
    (id) => id !== authorId,
  );
  const byId = await fetchStoryProfiles(ids);
  return ids.map((id) => byId.get(id) ?? { id, name: "Ambassadeur" });
}

export async function markStoryViewed(userId: string, storyId: string): Promise<void> {
  const supabase = socialDb();
  const { data: storyRow } = await supabase.from("social_stories").select("author_id").eq("id", storyId).maybeSingle();
  const authorId = (storyRow as { author_id?: string } | null)?.author_id;
  if (authorId === userId) return;

  const { error } = await supabase.from("social_story_views").upsert(
    { story_id: storyId, viewer_id: userId, viewed_at: new Date().toISOString() },
    { onConflict: "story_id,viewer_id" },
  );
  if (error && !isMissingTable(error)) throw error;
}

async function fetchGroupStats(groupIds: string[]): Promise<Map<string, { members: number; posts: number }>> {
  const map = new Map<string, { members: number; posts: number }>();
  if (!groupIds.length) return map;

  const supabase = socialDb();
  const [{ data: members }, { data: posts }] = await Promise.all([
    supabase.from("social_group_members").select("group_id").in("group_id", groupIds),
    supabase.from("social_posts").select("group_id").in("group_id", groupIds),
  ]);

  for (const id of groupIds) map.set(id, { members: 0, posts: 0 });
  for (const row of members ?? []) {
    const gid = (row as { group_id: string }).group_id;
    const s = map.get(gid)!;
    s.members += 1;
  }
  for (const row of posts ?? []) {
    const gid = (row as { group_id: string }).group_id;
    if (!gid) continue;
    const s = map.get(gid);
    if (s) s.posts += 1;
  }
  return map;
}

function mapGroupRow(
  row: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    cover_url: string | null;
    category: string;
    privacy: string;
  },
  stats: { members: number; posts: number },
  joined: boolean,
): Group {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description ?? "",
    cover: row.cover_url?.trim() || DEFAULT_GROUP_COVER,
    members: stats.members,
    posts: stats.posts,
    category: row.category,
    privacy: row.privacy === "private" ? "private" : "public",
    joined,
  };
}

export async function fetchGroups(userId?: string): Promise<Group[]> {
  const supabase = socialDb();
  const { data, error } = await supabase.from("social_groups").select("*").order("name");

  if (error) {
    if (isMissingTable(error)) return [];
    throw error;
  }
  if (!data?.length) return [];

  const ids = data.map((g) => (g as { id: string }).id);
  const [stats, joinedSet] = await Promise.all([
    fetchGroupStats(ids),
    userId ? fetchJoinedGroupIds(userId, ids) : Promise.resolve(new Set<string>()),
  ]);

  return data.map((g) => {
    const row = g as Parameters<typeof mapGroupRow>[0];
    return mapGroupRow(row, stats.get(row.id) ?? { members: 0, posts: 0 }, joinedSet.has(row.id));
  });
}

async function fetchJoinedGroupIds(userId: string, groupIds: string[]): Promise<Set<string>> {
  const supabase = socialDb();
  const { data } = await supabase
    .from("social_group_members")
    .select("group_id")
    .eq("user_id", userId)
    .in("group_id", groupIds);
  return new Set((data ?? []).map((r) => (r as { group_id: string }).group_id));
}

export async function fetchGroupById(id: string, userId?: string): Promise<Group | null> {
  const supabase = socialDb();
  const { data, error } = await supabase.from("social_groups").select("*").eq("id", id).maybeSingle();
  if (error || !data) return null;

  const row = data as Parameters<typeof mapGroupRow>[0];
  const [stats, joinedSet] = await Promise.all([
    fetchGroupStats([row.id]),
    userId ? fetchJoinedGroupIds(userId, [row.id]) : Promise.resolve(new Set<string>()),
  ]);
  return mapGroupRow(row, stats.get(row.id) ?? { members: 0, posts: 0 }, joinedSet.has(row.id));
}

export async function joinGroup(userId: string, groupId: string): Promise<void> {
  const supabase = socialDb();
  const { error } = await supabase.from("social_group_members").upsert(
    { group_id: groupId, user_id: userId, role: "member" },
    { onConflict: "group_id,user_id" },
  );
  if (error && !isMissingTable(error)) throw error;
}

export async function leaveGroup(userId: string, groupId: string): Promise<void> {
  const supabase = socialDb();
  const { error } = await supabase
    .from("social_group_members")
    .delete()
    .eq("group_id", groupId)
    .eq("user_id", userId);
  if (error && !isMissingTable(error)) throw error;
}

export async function fetchCommentsForPost(postId: string): Promise<Comment[]> {
  const supabase = socialDb();
  const { data, error } = await supabase
    .from("social_comments")
    .select("*")
    .eq("post_id", postId)
    .order("created_at", { ascending: true });

  if (error) return [];
  return (data ?? []).map((c) => {
    const row = c as {
      id: string;
      post_id: string;
      author_id: string;
      text: string;
      created_at: string;
      likes_count: number;
      pinned: boolean;
      parent_id: string | null;
    };
    return {
      id: row.id,
      post_id: row.post_id,
      author_id: row.author_id,
      text: row.text,
      created_at: row.created_at,
      likes: row.likes_count,
      pinned: row.pinned,
      parent_id: row.parent_id,
    };
  });
}

export async function addComment(
  userId: string,
  postId: string,
  text: string,
  parentId?: string,
): Promise<Comment | null> {
  const supabase = socialDb();
  const { data, error } = await supabase
    .from("social_comments")
    .insert({
      author_id: userId,
      post_id: postId,
      text: text.trim(),
      parent_id: parentId ?? null,
    })
    .select("*")
    .single();

  if (error) throw error;

  const row = data as {
    id: string;
    post_id: string;
    author_id: string;
    text: string;
    created_at: string;
    likes_count: number;
    pinned: boolean;
    parent_id: string | null;
  };

  const { data: postRow } = await supabase.from("social_posts").select("author_id").eq("id", postId).maybeSingle();
  const postAuthorId = (postRow as { author_id?: string } | null)?.author_id;
  if (postAuthorId && postAuthorId !== userId) {
    const { notifyUser } = await import("@/services/notifications.service");
    void notifyUser({
      userId: postAuthorId,
      type: "comment",
      title: "Nouveau commentaire",
      body: text.trim().slice(0, 120),
      link: "/communaute",
      actorId: userId,
    });
  }

  return {
    id: row.id,
    post_id: row.post_id,
    author_id: row.author_id,
    text: row.text,
    created_at: row.created_at,
    likes: row.likes_count,
    pinned: row.pinned,
    parent_id: row.parent_id,
  };
}

export async function setPostReaction(
  userId: string,
  postId: string,
  reaction: ReactionKey | null,
): Promise<void> {
  const supabase = socialDb();
  if (reaction === null) {
    const { error } = await supabase
      .from("social_reactions")
      .delete()
      .eq("user_id", userId)
      .eq("post_id", postId);
    if (error && !isMissingTable(error)) throw error;
    return;
  }

  const { error } = await supabase.from("social_reactions").upsert(
    { user_id: userId, post_id: postId, reaction },
    { onConflict: "post_id,user_id" },
  );
  if (error && !isMissingTable(error)) throw error;

  const { data: postRow } = await supabase.from("social_posts").select("author_id").eq("id", postId).maybeSingle();
  const postAuthorId = (postRow as { author_id?: string } | null)?.author_id;
  if (postAuthorId && postAuthorId !== userId) {
    const emoji = REACTIONS.find((r) => r.key === reaction)?.emoji ?? "❤️";
    const { notifyUser } = await import("@/services/notifications.service");
    void notifyUser({
      userId: postAuthorId,
      type: "post",
      title: "Réaction sur votre publication",
      body: `${emoji} a réagi à votre publication`,
      link: "/communaute",
      actorId: userId,
    });
  }
}

export async function sharePost(postId: string): Promise<void> {
  const supabase = socialDb();
  const { data: post } = await supabase.from("social_posts").select("shares_count").eq("id", postId).single();
  if (!post) return;
  await supabase
    .from("social_posts")
    .update({ shares_count: ((post as { shares_count: number }).shares_count ?? 0) + 1 })
    .eq("id", postId);
}

export async function toggleCommentLike(userId: string, commentId: string, liked: boolean): Promise<void> {
  const supabase = socialDb();
  if (liked) {
    const { error } = await supabase
      .from("social_comment_likes")
      .delete()
      .eq("user_id", userId)
      .eq("comment_id", commentId);
    if (error && !isMissingTable(error)) throw error;
  } else {
    const { error } = await supabase.from("social_comment_likes").upsert({ user_id: userId, comment_id: commentId });
    if (error && !isMissingTable(error)) throw error;
  }
}

export async function fetchUserCommentLikes(userId: string, commentIds: string[]): Promise<Set<string>> {
  const set = new Set<string>();
  if (!commentIds.length) return set;
  const supabase = socialDb();
  const { data, error } = await supabase
    .from("social_comment_likes")
    .select("comment_id")
    .eq("user_id", userId)
    .in("comment_id", commentIds);
  if (error) return set;
  for (const row of data ?? []) set.add((row as { comment_id: string }).comment_id);
  return set;
}

export async function deletePost(postId: string): Promise<void> {
  const supabase = socialDb();
  const { error } = await supabase.from("social_posts").delete().eq("id", postId);
  if (error && !isMissingTable(error)) throw error;
}

export async function updatePost(userId: string, postId: string, text: string): Promise<void> {
  const trimmed = text.trim();
  if (!trimmed) throw new Error("Le texte ne peut pas être vide.");
  const supabase = socialDb();
  const { error } = await supabase
    .from("social_posts")
    .update({ text: trimmed, updated_at: new Date().toISOString() })
    .eq("id", postId)
    .eq("author_id", userId);
  if (error) throw error;
}

export async function toggleStoryLike(userId: string, storyId: string, liked: boolean): Promise<void> {
  const supabase = socialDb();
  if (liked) {
    const { error } = await supabase.from("social_story_likes").delete().eq("story_id", storyId).eq("user_id", userId);
    if (error && !isMissingTable(error)) throw error;
  } else {
    const { error } = await supabase.from("social_story_likes").upsert({ story_id: storyId, user_id: userId });
    if (error && !isMissingTable(error)) throw error;

    const { data: storyRow } = await supabase.from("social_stories").select("author_id").eq("id", storyId).maybeSingle();
    const authorId = (storyRow as { author_id?: string } | null)?.author_id;
    if (authorId && authorId !== userId) {
      const { notifyUser } = await import("@/services/notifications.service");
      void notifyUser({
        userId: authorId,
        type: "post",
        title: "Story aimée",
        body: "Quelqu'un a aimé votre story",
        link: "/communaute",
        actorId: userId,
      });
    }
  }
}

export async function createStory(userId: string, file: File, caption?: string): Promise<Story | null> {
  const { uploadSocialFile } = await import("@/services/storage.service");
  const media = await uploadSocialFile(userId, file);
  const supabase = socialDb();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  const { data, error } = await supabase
    .from("social_stories")
    .insert({
      author_id: userId,
      media_url: media.url,
      caption: caption?.trim() || null,
      expires_at: expiresAt,
    })
    .select("*")
    .single();
  if (error) throw error;
  const row = data as { id: string; author_id: string; created_at: string; expires_at: string; media_url: string; caption?: string };
  return {
    id: row.id,
    author_id: row.author_id,
    created_at: row.created_at,
    expires_at: row.expires_at,
    media_url: row.media_url,
    caption: row.caption,
    viewed: false,
  };
}

export function subscribeToSocialFeed(onChange: () => void): () => void {
  const db = socialDb();
  const channel = db
    .channel("social-feed")
    .on("postgres_changes", { event: "*", schema: "public", table: "social_posts" }, () => onChange())
    .on("postgres_changes", { event: "*", schema: "public", table: "social_comments" }, () => onChange())
    .on("postgres_changes", { event: "*", schema: "public", table: "social_reactions" }, () => onChange())
    .subscribe();

  return () => {
    void db.removeChannel(channel);
  };
}

export async function toggleSavedPost(userId: string, postId: string, saved: boolean): Promise<void> {
  const supabase = socialDb();
  if (saved) {
    const { error } = await supabase
      .from("social_saved_posts")
      .delete()
      .eq("user_id", userId)
      .eq("post_id", postId);
    if (error && !isMissingTable(error)) throw error;
  } else {
    const { error } = await supabase.from("social_saved_posts").upsert({ user_id: userId, post_id: postId });
    if (error && !isMissingTable(error)) throw error;
  }
}

export async function toggleFollow(followerId: string, followingId: string, isFollowing: boolean): Promise<void> {
  const supabase = socialDb();
  if (isFollowing) {
    const { error } = await supabase
      .from("social_followers")
      .delete()
      .eq("follower_id", followerId)
      .eq("following_id", followingId);
    if (error && !isMissingTable(error)) throw error;
  } else {
    const { error } = await supabase.from("social_followers").insert({
      follower_id: followerId,
      following_id: followingId,
    });
    if (error && !isMissingTable(error)) throw error;

    const { notifyUser } = await import("@/services/notifications.service");
    void notifyUser({
      userId: followingId,
      type: "follow",
      title: "Nouvel abonné",
      body: "Quelqu'un s'est abonné à votre profil",
      link: `/ambassadeur/${followerId}`,
      actorId: followerId,
    });
  }
}

export async function isFollowing(followerId: string, followingId: string): Promise<boolean> {
  const supabase = socialDb();
  const { data, error } = await supabase
    .from("social_followers")
    .select("follower_id")
    .eq("follower_id", followerId)
    .eq("following_id", followingId)
    .maybeSingle();
  if (error) return false;
  return Boolean(data);
}

export async function fetchFollowerCount(userId: string): Promise<number> {
  const supabase = socialDb();
  const { count, error } = await supabase
    .from("social_followers")
    .select("*", { count: "exact", head: true })
    .eq("following_id", userId);
  if (error) return 0;
  return count ?? 0;
}

export async function fetchFollowingCount(userId: string): Promise<number> {
  const supabase = socialDb();
  const { count, error } = await supabase
    .from("social_followers")
    .select("*", { count: "exact", head: true })
    .eq("follower_id", userId);
  if (error) return 0;
  return count ?? 0;
}

export async function fetchFollowStats(userId: string): Promise<{ followers: number; following: number }> {
  const [followers, following] = await Promise.all([fetchFollowerCount(userId), fetchFollowingCount(userId)]);
  return { followers, following };
}

export async function fetchStoryById(storyId: string): Promise<Story | null> {
  const supabase = socialDb();
  const { data, error } = await supabase.from("social_stories").select("*").eq("id", storyId).maybeSingle();
  if (error || !data) return null;
  const row = data as { id: string; author_id: string; created_at: string; expires_at: string; media_url: string; caption?: string };
  const [{ count: viewCount }, { count: likeCount }] = await Promise.all([
    supabase
      .from("social_story_views")
      .select("*", { count: "exact", head: true })
      .eq("story_id", storyId)
      .neq("viewer_id", row.author_id),
    supabase.from("social_story_likes").select("*", { count: "exact", head: true }).eq("story_id", storyId),
  ]);
  return {
    id: row.id,
    author_id: row.author_id,
    created_at: row.created_at,
    expires_at: row.expires_at,
    media_url: row.media_url,
    caption: row.caption,
    viewed: true,
    view_count: viewCount ?? 0,
    like_count: likeCount ?? 0,
  };
}

export async function fetchStoryLikers(storyId: string): Promise<StoryViewer[]> {
  const supabase = socialDb();
  const { data, error } = await supabase
    .from("social_story_likes")
    .select("user_id, created_at")
    .eq("story_id", storyId)
    .order("created_at", { ascending: false })
    .limit(50);
  if (error || !data?.length) return [];

  const ids = [...new Set((data as { user_id: string }[]).map((r) => r.user_id))];
  const byId = await fetchStoryProfiles(ids);
  return ids.map((id) => byId.get(id) ?? { id, name: "Ambassadeur" });
}

export async function recordPostView(userId: string, postId: string): Promise<void> {
  const supabase = socialDb();
  const { error } = await supabase.from("social_post_views").upsert(
    { post_id: postId, viewer_id: userId, viewed_at: new Date().toISOString() },
    { onConflict: "post_id,viewer_id" },
  );
  if (error && !isMissingTable(error)) throw error;
}

export async function blockUser(blockerId: string, blockedId: string): Promise<void> {
  const { error } = await socialDb().from("social_blocks").upsert({ blocker_id: blockerId, blocked_id: blockedId });
  if (error && !isMissingTable(error)) throw error;
}

export async function reportPost(reporterId: string, postId: string, reason?: string): Promise<void> {
  const { error } = await socialDb().from("social_reports").insert({
    reporter_id: reporterId,
    post_id: postId,
    reason: reason?.trim() || null,
  });
  if (error && !isMissingTable(error)) throw error;
}

export async function replyToStory(
  userId: string,
  storyAuthorId: string,
  storyId: string,
  text: string,
): Promise<string> {
  const { getOrCreateDirectConversation, sendMessage } = await import("@/services/messaging.service");
  const convId = await getOrCreateDirectConversation(userId, storyAuthorId);
  await sendMessage(userId, convId, text, { storyId });
  return convId;
}

export async function searchPosts(query: string, userId?: string, limit = 10): Promise<Post[]> {
  const supabase = socialDb();
  const { data, error } = await supabase
    .from("social_posts")
    .select("*")
    .ilike("text", `%${query}%`)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) return [];
  return enrichPosts((data ?? []) as PostRow[], userId);
}

const DEFAULT_OPP_IMAGE =
  "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&q=70&auto=format&fit=crop";

export async function fetchOpportunities(): Promise<VsmOpportunity[]> {
  const supabase = socialDb();
  const { data, error } = await supabase
    .from("academy_opportunities")
    .select("*")
    .eq("is_published", true)
    .order("starts_at", { ascending: false });

  if (error) {
    if (isMissingTable(error)) return [];
    throw error;
  }

  const rows = data ?? [];
  const ids = rows.map((r: { id: string }) => r.id);
  let applicantCounts = new Map<string, number>();

  if (ids.length) {
    const { data: apps } = await supabase
      .from("academy_opportunity_applications")
      .select("opportunity_id")
      .in("opportunity_id", ids);
    for (const a of apps ?? []) {
      const oid = (a as { opportunity_id: string }).opportunity_id;
      applicantCounts.set(oid, (applicantCounts.get(oid) ?? 0) + 1);
    }
  }

  return rows.map((raw: Record<string, unknown>) => ({
    id: String(raw.id),
    title: String(raw.title ?? ""),
    category: String(raw.category ?? "Mission"),
    image: String(raw.image_url ?? DEFAULT_OPP_IMAGE),
    description: String(raw.description ?? ""),
    location: String(raw.location ?? ""),
    starts_at: String(raw.starts_at ?? ""),
    ends_at: String(raw.ends_at ?? ""),
    slots: Number(raw.slots ?? 1),
    applicants: applicantCounts.get(String(raw.id)) ?? 0,
    conditions: Array.isArray(raw.conditions) ? (raw.conditions as string[]) : [],
    status: (raw.status as VsmOpportunity["status"]) ?? "open",
    reward: String(raw.reward ?? ""),
  }));
}

export { fetchAmbassadorById };
