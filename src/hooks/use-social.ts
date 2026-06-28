import { useEffect, useMemo } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useAuth } from "@/providers/auth-provider";

import { fetchAmbassadorById, fetchAmbassadors } from "@/services/ambassador.service";

import {

  addComment,

  createPost,

  createStory,

  deletePost,

  updatePost,

  fetchCommentsForPost,

  fetchFollowingIds,

  fetchGroupById,

  fetchGroups,

  fetchPosts,

  fetchPostsByAuthor,

  fetchPostsByGroup,

  fetchStories,

  fetchUserCommentLikes,

  isFollowing,

  joinGroup,

  leaveGroup,

  toggleStoryLike,

  markStoryViewed,

  searchPosts,

  setPostReaction,

  sharePost,

  subscribeToSocialFeed,

  toggleCommentLike,

  toggleFollow,

  toggleSavedPost,

  fetchFollowStats,

  replyToStory,

  blockUser,

  reportPost,

  recordPostView,

} from "@/services/social.service";

import { fetchOpportunitiesWithApplications } from "@/services/opportunities.service";

import type { PostMedia, ReactionKey } from "@/types/social";

import { EMPTY_REACTIONS } from "@/types/social";



export type FeedTab = "all" | "following" | "mine" | "trending";



export type CreatePostInput = {

  text: string;

  media?: PostMedia[];

  tags?: string[];

  groupId?: string;

};



export function useSocialRealtime() {

  const qc = useQueryClient();



  useEffect(() => {

    const unsub = subscribeToSocialFeed(() => {

      qc.invalidateQueries({ queryKey: ["posts"] });

      qc.invalidateQueries({ queryKey: ["comments"] });

      qc.invalidateQueries({ queryKey: ["posts-author"] });

    });

    return unsub;

  }, [qc]);

}



export function useAmbassador(id: string | undefined) {

  return useQuery({

    queryKey: ["ambassador", id],

    queryFn: () => fetchAmbassadorById(id!),

    enabled: !!id,

    staleTime: 300_000,

    gcTime: 600_000,

    placeholderData: (prev) => prev,

  });

}



export function useSuggestedAmbassadors(limit = 6) {

  const { profile } = useAuth();

  return useQuery({

    queryKey: ["ambassadors-suggested", limit],

    queryFn: () => fetchAmbassadors(limit + 5),

    enabled: !!profile,

    staleTime: 120_000,

    select: (data) => data.filter((a) => a.id !== profile?.id).slice(0, limit),

  });

}



export function useFollowingIds() {

  const { profile } = useAuth();

  const userId = profile?.userId;



  return useQuery({

    queryKey: ["following-ids", userId],

    queryFn: () => fetchFollowingIds(userId!),

    enabled: !!userId,

    staleTime: 60_000,

  });

}



export function useIsFollowing(targetId: string | undefined) {

  const { profile } = useAuth();

  const userId = profile?.userId;



  return useQuery({

    queryKey: ["is-following", userId, targetId],

    queryFn: () => isFollowing(userId!, targetId!),

    enabled: !!userId && !!targetId && userId !== targetId,

    staleTime: 30_000,

  });

}



export function useFollowStats(userId: string | undefined) {

  return useQuery({

    queryKey: ["follow-stats", userId],

    queryFn: () => fetchFollowStats(userId!),

    enabled: !!userId,

    staleTime: 60_000,

  });

}



export function usePosts(tab: FeedTab = "all", query = "") {

  const { profile } = useAuth();

  const userId = profile?.userId;

  const { data: followingIds = [] } = useFollowingIds();

  useSocialRealtime();



  return useQuery({

    queryKey: ["posts", userId, tab, query],

    queryFn: () => fetchPosts(userId, 60),

    enabled: !!userId,

    staleTime: 15_000,

    select: (posts) => {

      let list = [...posts];

      if (tab === "mine" && userId) list = list.filter((p) => p.author_id === userId);

      if (tab === "following") list = list.filter((p) => followingIds.includes(p.author_id));

      if (tab === "trending") {

        list.sort(

          (a, b) =>

            Object.values(b.reactions).reduce((x, y) => x + y, 0) -

            Object.values(a.reactions).reduce((x, y) => x + y, 0),

        );

      }

      if (query.trim()) {

        const q = query.toLowerCase();

        list = list.filter((p) => p.text.toLowerCase().includes(q) || p.tags.some((t) => t.toLowerCase().includes(q)));

      }

      return list.slice(0, 40);

    },

  });

}



export function useAuthorPosts(authorId: string | undefined) {

  const { profile } = useAuth();

  return useQuery({

    queryKey: ["posts-author", authorId, profile?.userId],

    queryFn: () => fetchPostsByAuthor(authorId!, profile?.userId, 20),

    enabled: !!authorId,

    staleTime: 30_000,

  });

}



export function useGroupPosts(groupId: string | undefined) {

  const { profile } = useAuth();

  return useQuery({

    queryKey: ["posts-group", groupId, profile?.userId],

    queryFn: () => fetchPostsByGroup(groupId!, profile?.userId, 20),

    enabled: !!groupId,

    staleTime: 30_000,

  });

}



export function useStories() {

  const { profile } = useAuth();

  return useQuery({

    queryKey: ["stories", profile?.userId],

    queryFn: () => fetchStories(profile?.userId),

    enabled: !!profile,

    staleTime: 60_000,

  });

}



export function useGroups() {

  const { profile } = useAuth();

  return useQuery({

    queryKey: ["groups", profile?.userId],

    queryFn: () => fetchGroups(profile?.userId),

    enabled: !!profile,

    staleTime: 60_000,

  });

}



export function useGroup(id: string | undefined) {

  const { profile } = useAuth();

  return useQuery({

    queryKey: ["group", id, profile?.userId],

    queryFn: () => fetchGroupById(id!, profile?.userId),

    enabled: !!id && !!profile,

    staleTime: 60_000,

  });

}



export function usePostComments(postId: string | undefined, enabled = false) {

  const { profile } = useAuth();

  const userId = profile?.userId;



  return useQuery({

    queryKey: ["comments", postId, userId],

    queryFn: async () => {

      const comments = await fetchCommentsForPost(postId!);

      if (!userId || !comments.length) return comments;

      const liked = await fetchUserCommentLikes(

        userId,

        comments.map((c) => c.id),

      );

      return comments.map((c) => ({ ...c, liked: liked.has(c.id) }));

    },

    enabled: !!postId && enabled,

    staleTime: 10_000,

  });

}



export function useSearchPosts(query: string) {

  const { profile } = useAuth();

  const q = query.trim();

  return useQuery({

    queryKey: ["search-posts", q, profile?.userId],

    queryFn: () => searchPosts(q, profile?.userId, 10),

    enabled: q.length >= 2 && !!profile,

    staleTime: 30_000,

  });

}



export function useOpportunities() {

  const { profile } = useAuth();

  return useQuery({

    queryKey: ["opportunities", profile?.userId],

    queryFn: () => fetchOpportunitiesWithApplications(profile!.userId),

    enabled: !!profile,

    staleTime: 60_000,

  });

}



function patchPostsInCache(

  qc: ReturnType<typeof useQueryClient>,

  userId: string | undefined,

  patch: (posts: import("@/types/social").Post[]) => import("@/types/social").Post[],

) {

  qc.setQueriesData({ queryKey: ["posts"] }, (old: unknown) => {

    if (!Array.isArray(old)) return old;

    return patch(old as import("@/types/social").Post[]);

  });

  qc.setQueriesData({ queryKey: ["posts-author"] }, (old: unknown) => {

    if (!Array.isArray(old)) return old;

    return patch(old as import("@/types/social").Post[]);

  });

}



export function useSocialMutations() {

  const { profile } = useAuth();

  const userId = profile?.userId;

  const qc = useQueryClient();



  const invalidateFeed = () => {

    qc.invalidateQueries({ queryKey: ["posts"] });

    qc.invalidateQueries({ queryKey: ["posts-author"] });

    qc.invalidateQueries({ queryKey: ["posts-group"] });

  };



  const createPostMutation = useMutation({

    mutationFn: (input: CreatePostInput | string) => {

      const payload = typeof input === "string" ? { text: input } : input;

      return createPost(userId!, payload.text, {

        media: payload.media,

        tags: payload.tags,

        groupId: payload.groupId,

      });

    },

    onSuccess: invalidateFeed,

  });



  const reactionMutation = useMutation({

    mutationFn: ({ postId, reaction }: { postId: string; reaction: ReactionKey | null }) =>

      setPostReaction(userId!, postId, reaction),

    onMutate: async ({ postId, reaction }) => {

      await qc.cancelQueries({ queryKey: ["posts"] });

      const prev = qc.getQueriesData({ queryKey: ["posts"] });

      patchPostsInCache(qc, userId, (posts) =>

        posts.map((p) => {

          if (p.id !== postId) return p;

          const reactions = { ...EMPTY_REACTIONS, ...p.reactions };

          const old = p.my_reaction;

          if (old && old in reactions) reactions[old] = Math.max(0, reactions[old] - 1);

          if (reaction && reaction in reactions) reactions[reaction] += 1;

          return { ...p, reactions, my_reaction: reaction };

        }),

      );

      return { prev };

    },

    onError: (_e, _v, ctx) => {

      ctx?.prev?.forEach(([key, data]) => qc.setQueryData(key, data));

    },

    onSettled: invalidateFeed,

  });



  const savedMutation = useMutation({

    mutationFn: ({ postId, saved }: { postId: string; saved: boolean }) =>

      toggleSavedPost(userId!, postId, saved),

    onSuccess: invalidateFeed,

  });



  const commentMutation = useMutation({

    mutationFn: ({ postId, text, parentId }: { postId: string; text: string; parentId?: string }) =>
      addComment(userId!, postId, text, parentId),

    onMutate: async ({ postId }) => {

      patchPostsInCache(qc, userId, (posts) =>

        posts.map((p) => (p.id === postId ? { ...p, comments_count: p.comments_count + 1 } : p)),

      );

    },

    onSuccess: (_, { postId }) => {

      invalidateFeed();

      qc.invalidateQueries({ queryKey: ["comments", postId] });

    },

  });



  const commentLikeMutation = useMutation({
    mutationFn: ({ commentId, liked }: { commentId: string; liked: boolean; postId: string }) =>
      toggleCommentLike(userId!, commentId, liked),
    onSuccess: (_, { postId }) => {
      qc.invalidateQueries({ queryKey: ["comments", postId] });
    },
  });



  const shareMutation = useMutation({

    mutationFn: (postId: string) => sharePost(postId),

    onMutate: async (postId) => {

      patchPostsInCache(qc, userId, (posts) =>

        posts.map((p) => (p.id === postId ? { ...p, shares: p.shares + 1 } : p)),

      );

    },

    onSettled: invalidateFeed,

  });



  const followMutation = useMutation({

    mutationFn: ({ targetId, isFollowing: following }: { targetId: string; isFollowing: boolean }) =>

      toggleFollow(userId!, targetId, following),

    onSuccess: (_, { targetId }) => {

      qc.invalidateQueries({ queryKey: ["following-ids"] });

      qc.invalidateQueries({ queryKey: ["is-following", userId, targetId] });

    },

  });



  const joinGroupMutation = useMutation({

    mutationFn: ({ groupId, joined }: { groupId: string; joined: boolean }) =>

      joined ? leaveGroup(userId!, groupId) : joinGroup(userId!, groupId),

    onSuccess: () => {

      qc.invalidateQueries({ queryKey: ["groups"] });

      qc.invalidateQueries({ queryKey: ["group"] });

    },

  });



  const viewStoryMutation = useMutation({

    mutationFn: (storyId: string) => markStoryViewed(userId!, storyId),

    onSuccess: () => qc.invalidateQueries({ queryKey: ["stories"] }),

  });



  const createStoryMutation = useMutation({

    mutationFn: ({ file, caption }: { file: File; caption?: string }) => createStory(userId!, file, caption),

    onSuccess: () => qc.invalidateQueries({ queryKey: ["stories"] }),

  });



  const deletePostMutation = useMutation({

    mutationFn: (postId: string) => deletePost(postId),

    onSuccess: invalidateFeed,

  });



  const updatePostMutation = useMutation({

    mutationFn: ({ postId, text }: { postId: string; text: string }) => updatePost(userId!, postId, text),

    onSuccess: invalidateFeed,

  });



  const toggleStoryLikeMutation = useMutation({

    mutationFn: ({ storyId, liked }: { storyId: string; liked: boolean }) => toggleStoryLike(userId!, storyId, liked),

    onSuccess: () => qc.invalidateQueries({ queryKey: ["stories"] }),

  });



  const replyToStoryMutation = useMutation({

    mutationFn: ({ authorId, storyId, text }: { authorId: string; storyId: string; text: string }) =>
      replyToStory(userId!, authorId, storyId, text),

  });

  const blockUserMutation = useMutation({
    mutationFn: (blockedId: string) => blockUser(userId!, blockedId),
  });

  const reportPostMutation = useMutation({
    mutationFn: ({ postId, reason }: { postId: string; reason?: string }) => reportPost(userId!, postId, reason),
  });

  const recordPostViewMutation = useMutation({
    mutationFn: (postId: string) => recordPostView(userId!, postId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["posts"] }),
  });



  return useMemo(

    () => ({

      createPost: createPostMutation,

      setReaction: reactionMutation,

      toggleSaved: savedMutation,

      addComment: commentMutation,

      toggleCommentLike: commentLikeMutation,

      sharePost: shareMutation,

      toggleFollow: followMutation,

      toggleGroup: joinGroupMutation,

      viewStory: viewStoryMutation,

      createStory: createStoryMutation,

      deletePost: deletePostMutation,

      updatePost: updatePostMutation,

      toggleStoryLike: toggleStoryLikeMutation,

      replyToStory: replyToStoryMutation,

      blockUser: blockUserMutation,

      reportPost: reportPostMutation,

      recordPostView: recordPostViewMutation,

    }),

    [

      createPostMutation,

      reactionMutation,

      savedMutation,

      commentMutation,

      commentLikeMutation,

      shareMutation,

      followMutation,

      joinGroupMutation,

      viewStoryMutation,

      createStoryMutation,

      deletePostMutation,

      updatePostMutation,

      toggleStoryLikeMutation,

      replyToStoryMutation,

      blockUserMutation,

      reportPostMutation,

      recordPostViewMutation,

    ],

  );

}


