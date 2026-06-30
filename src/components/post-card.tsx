import { useRef, useState } from "react";

import { Link } from "@tanstack/react-router";

import { Bookmark, MessageCircle, Share2, MoreHorizontal, Heart, Pencil, Trash2, Flag, Ban, Eye } from "lucide-react";

import { REACTIONS, type Comment, type Post, type ReactionKey } from "@/types/social";

import { useAmbassador, usePostComments, useSocialMutations } from "@/hooks/use-social";

import { useCurrentAmbassadorPublic } from "@/hooks/use-current-ambassador";

import { profileAvatarUrl } from "@/lib/program-tier";

import { formatRelativeTime } from "@/services/ambassador.service";

import { PostMediaCarousel } from "@/components/post-media-carousel";

import { toast } from "sonner";



type CommentWithLike = Comment & { liked?: boolean };



export function PostCard({ post }: { post: Post }) {

  const me = useCurrentAmbassadorPublic();

  const { data: author } = useAmbassador(post.author_id);

  const { setReaction, toggleSaved, addComment, sharePost, toggleCommentLike, deletePost, updatePost, blockUser, reportPost, recordPostView } = useSocialMutations();

  const myReaction = post.my_reaction ?? null;

  const saved = post.saved;

  const isOwner = me?.id === post.author_id;

  const [showMenu, setShowMenu] = useState(false);

  const [editing, setEditing] = useState(false);

  const [editText, setEditText] = useState(post.text);

  const [replyToComment, setReplyToComment] = useState<Comment | null>(null);

  const [showReactions, setShowReactions] = useState(false);

  const [showComments, setShowComments] = useState(false);

  const [commentInput, setCommentInput] = useState("");

  const longPressRef = useRef<ReturnType<typeof setTimeout> | null>(null);



  const previewComments = post.comments_count > 0;

  const { data: comments = [] } = usePostComments(post.id, previewComments || showComments);



  const displayAuthor = author ?? (me && post.author_id === me.id ? me : null);

  const authorName = displayAuthor?.name ?? "Ambassadeur";

  const authorAvatar = displayAuthor?.avatar ?? profileAvatarUrl(null, authorName);

  const authorLevel = displayAuthor?.level ?? "—";

  const authorBadge = displayAuthor?.badge ?? "";

  const authorId = displayAuthor?.id ?? post.author_id;



  const totalReactions = Object.values(post.reactions).reduce((a, b) => a + b, 0);

  const activeReactions = REACTIONS.filter((r) => (post.reactions[r.key] ?? 0) > 0);



  const handleReaction = (reaction: ReactionKey | null) => {

    setReaction.mutate({ postId: post.id, reaction });

  };



  const handleComment = async () => {

    const text = commentInput.trim();

    if (!text) return;

    await addComment.mutateAsync({ postId: post.id, text, parentId: replyToComment?.id });

    setCommentInput("");

    setReplyToComment(null);

    setShowComments(true);

  };



  const handleShare = async () => {

    await sharePost.mutateAsync(post.id);

    const url = `${window.location.origin}/communaute`;

    if (navigator.share) {

      try {

        await navigator.share({ title: "Publication VSM", text: post.text.slice(0, 120), url });

      } catch {

        /* cancelled */

      }

    } else {

      await navigator.clipboard.writeText(url);

      toast.success("Lien copié dans le presse-papier");

    }

  };



  return (

    <article className="animate-fade-up overflow-hidden rounded-2xl border border-border bg-surface">

      <header className="flex items-center gap-3 p-4">

        <Link to="/ambassadeur/$id" params={{ id: authorId }}>

          <img src={authorAvatar} alt="" className="h-11 w-11 rounded-xl border border-border bg-background object-cover" />

        </Link>

        <div className="min-w-0 flex-1">

          <div className="flex items-center gap-2">

            <Link to="/ambassadeur/$id" params={{ id: authorId }} className="truncate text-sm font-semibold hover:text-vsm-red">

              {authorName}

            </Link>

            <span className="rounded-full bg-vsm-red/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-vsm-red">

              {authorLevel}

            </span>

          </div>

          <p className="text-[11px] uppercase tracking-wider text-muted-foreground">

            {authorBadge} · {formatRelativeTime(post.created_at)}

          </p>

        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => setShowMenu((v) => !v)}
            className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground hover:bg-accent"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
          {showMenu && (
            <div className="absolute right-0 top-9 z-20 min-w-[160px] rounded-lg border border-border bg-popover py-1 shadow-lg">
              {isOwner ? (
                <>
                  <button type="button" onClick={() => { setEditing(true); setEditText(post.text); setShowMenu(false); }} className="flex w-full items-center gap-2 px-3 py-2 text-xs hover:bg-accent">
                    <Pencil className="h-3.5 w-3.5" /> Modifier
                  </button>
                  <button
                    type="button"
                    onClick={() => void deletePost.mutateAsync(post.id).then(() => toast.success("Publication supprimée"))}
                    className="flex w-full items-center gap-2 px-3 py-2 text-xs text-destructive hover:bg-accent"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Supprimer
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => void blockUser.mutateAsync(post.author_id).then(() => { toast.success("Utilisateur bloqué"); setShowMenu(false); })}
                    className="flex w-full items-center gap-2 px-3 py-2 text-xs hover:bg-accent"
                  >
                    <Ban className="h-3.5 w-3.5" /> Bloquer
                  </button>
                  <button
                    type="button"
                    onClick={() => void reportPost.mutateAsync({ postId: post.id }).then(() => { toast.success("Signalement envoyé à l'admin"); setShowMenu(false); })}
                    className="flex w-full items-center gap-2 px-3 py-2 text-xs text-destructive hover:bg-accent"
                  >
                    <Flag className="h-3.5 w-3.5" /> Signaler
                  </button>
                </>
              )}
            </div>
          )}
        </div>

      </header>



      {editing ? (
        <div className="space-y-2 px-4 pb-3">
          <textarea value={editText} onChange={(e) => setEditText(e.target.value)} rows={3} className="w-full rounded-lg border border-border bg-background p-3 text-sm outline-none focus:border-vsm-red/50" />
          <div className="flex gap-2">
            <button type="button" onClick={() => setEditing(false)} className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold">Annuler</button>
            <button
              type="button"
              onClick={() => void updatePost.mutateAsync({ postId: post.id, text: editText }).then(() => { setEditing(false); toast.success("Publication modifiée"); })}
              className="rounded-lg bg-vsm-red px-3 py-1.5 text-xs font-semibold text-white"
            >
              Enregistrer
            </button>
          </div>
        </div>
      ) : post.text.trim() && (

        <p className="px-4 pb-3 text-[15px] leading-relaxed text-foreground">

          {post.text}

          {post.tags.length > 0 && (

            <span className="ml-1 text-vsm-red">{post.tags.join(" ")}</span>

          )}

        </p>

      )}



      {post.media.length > 0 && (
        <PostMediaCarousel media={post.media} onView={() => void recordPostView.mutate(post.id)} />
      )}



      <div className="flex items-center justify-between px-4 pt-2 text-xs text-muted-foreground">

        {totalReactions > 0 ? (
          <button
            type="button"
            onClick={() => setShowComments(true)}
            className="flex items-center gap-1 hover:text-foreground"
          >
            {activeReactions.map((r) => (
              <span key={r.key} className="text-sm">{r.emoji}</span>
            ))}
            <span className="ml-1">{totalReactions.toLocaleString()} réaction{totalReactions !== 1 ? "s" : ""}</span>
          </button>
        ) : (
          <span />
        )}

        <div className="flex items-center gap-3 text-muted-foreground">
          <button type="button" onClick={() => setShowComments(true)} className="hover:text-foreground">
            <span className="hidden sm:inline">{post.comments_count} commentaire{post.comments_count !== 1 ? "s" : ""}</span>
            <span className="sm:hidden">{post.comments_count > 0 ? post.comments_count : ""}</span>
          </button>
          <span className="hidden sm:inline">{post.shares} partage{post.shares !== 1 ? "s" : ""}</span>
          {(post.view_count ?? 0) > 0 && (
            <span className="hidden sm:inline-flex items-center gap-1"><Eye className="h-3.5 w-3.5" /> {post.view_count} vue{(post.view_count ?? 0) !== 1 ? "s" : ""}</span>
          )}
        </div>

      </div>



      {!showComments && comments.length > 0 && (

        <ul className="space-y-2 border-t border-border/60 bg-background/30 px-4 py-3">

          {comments.slice(-2).map((c) => (

            <CommentPreview key={c.id} comment={c as CommentWithLike} postId={post.id} />

          ))}

          {post.comments_count > 2 && (

            <button type="button" onClick={() => setShowComments(true)} className="text-xs font-semibold text-vsm-red hover:underline">

              Voir les {post.comments_count} commentaires

            </button>

          )}

        </ul>

      )}



      <div className="mt-2 flex items-stretch border-t border-border text-sm">

        <div className="relative flex-1">

          <button
            onClick={() => handleReaction(myReaction ? null : "love")}
            onTouchStart={() => {
              longPressRef.current = setTimeout(() => setShowReactions(true), 450);
            }}
            onTouchEnd={() => {
              if (longPressRef.current) clearTimeout(longPressRef.current);
            }}
            onContextMenu={(e) => { e.preventDefault(); setShowReactions(true); }}
            className={`flex w-full items-center justify-center gap-2 py-3 transition-colors hover:bg-accent ${myReaction ? "text-vsm-red" : "text-muted-foreground"}`}
            aria-label="J'aime"
          >
            {myReaction ? (
              <span className="text-xl">{REACTIONS.find((r) => r.key === myReaction)?.emoji}</span>
            ) : (
              <Heart className="h-6 w-6" />
            )}
          </button>

          {showReactions && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowReactions(false)} />
              <div className="absolute bottom-full left-1/2 z-20 mb-2 flex -translate-x-1/2 items-center gap-1 rounded-full border border-border bg-popover px-2 py-1.5 shadow-elegant">
                {REACTIONS.map((r) => (
                  <button
                    key={r.key}
                    type="button"
                    onClick={() => { handleReaction(r.key); setShowReactions(false); }}
                    className="grid h-10 w-10 place-items-center rounded-full text-xl transition-transform hover:scale-125"
                    title={r.label}
                  >
                    {r.emoji}
                  </button>
                ))}
              </div>
            </>
          )}

        </div>

        <button
          onClick={() => setShowComments((v) => !v)}
          className="flex flex-1 items-center justify-center py-3 text-muted-foreground hover:bg-accent"
          aria-label="Commenter"
        >
          <MessageCircle className="h-6 w-6" />
        </button>

        <button
          onClick={() => void handleShare()}
          className="flex flex-1 items-center justify-center py-3 text-muted-foreground hover:bg-accent"
          aria-label="Partager"
        >
          <Share2 className="h-6 w-6" />
        </button>

        <button
          onClick={() => toggleSaved.mutate({ postId: post.id, saved })}
          className={`flex flex-1 items-center justify-center py-3 hover:bg-accent ${saved ? "text-vsm-red" : "text-muted-foreground"}`}
          aria-label="Sauvegarder"
        >
          <Bookmark className={`h-6 w-6 ${saved ? "fill-current" : ""}`} />
        </button>

      </div>



      {showComments && (

        <CommentsSection

          postId={post.id}

          comments={comments as CommentWithLike[]}

          onLike={(commentId, liked) => toggleCommentLike.mutate({ commentId, liked, postId: post.id })}

          onReply={(c) => { setReplyToComment(c); setShowComments(true); }}

        />

      )}

      {showComments && (

        <div className="flex items-center gap-2 border-t border-border p-3">

          <img src={me?.avatar ?? authorAvatar} alt="" className="h-8 w-8 rounded-lg bg-background object-cover" />

          <div className="flex-1">
            {replyToComment && (
              <p className="mb-1 text-[10px] text-muted-foreground">
                Réponse à un commentaire · <button type="button" className="text-vsm-red" onClick={() => setReplyToComment(null)}>Annuler</button>
              </p>
            )}
            <input

            value={commentInput}

            onChange={(e) => setCommentInput(e.target.value)}

            onKeyDown={(e) => e.key === "Enter" && void handleComment()}

            placeholder="Écrire un commentaire…"

            className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-vsm-red/50"

          />
          </div>

          <button

            disabled={!commentInput.trim() || addComment.isPending}

            onClick={() => void handleComment()}

            className="rounded-lg bg-vsm-red px-3 py-2 text-xs font-semibold uppercase tracking-wider text-white disabled:opacity-40"

          >

            Envoyer

          </button>

        </div>

      )}

    </article>

  );

}



function CommentPreview({ comment, postId }: { comment: CommentWithLike; postId: string }) {

  const { data: author } = useAmbassador(comment.author_id);

  const name = author?.name ?? "Ambassadeur";

  return (

    <li className="flex gap-2 text-sm">

      <img src={author?.avatar ?? profileAvatarUrl(null, name)} alt="" className="h-6 w-6 rounded-md object-cover" />

      <p>

        <span className="font-semibold">{name}</span>{" "}

        <span className="text-foreground/90">{comment.text}</span>

      </p>

    </li>

  );

}



function CommentsSection({

  postId,

  comments,

  onLike,

  onReply,

}: {

  postId: string;

  comments: CommentWithLike[];

  onLike: (commentId: string, liked: boolean) => void;

  onReply: (comment: CommentWithLike) => void;

}) {

  if (comments.length === 0) {

    return <p className="border-t border-border p-4 text-center text-xs text-muted-foreground">Aucun commentaire.</p>;

  }



  return (

    <ul className="space-y-3 border-t border-border bg-background/40 p-4">

      {comments.map((c) => (

        <CommentItem key={c.id} comment={c} onLike={onLike} onReply={() => onReply(c)} />

      ))}

    </ul>

  );

}



function CommentItem({

  comment,

  onLike,

  onReply,

}: {

  comment: CommentWithLike;

  onLike: (commentId: string, liked: boolean) => void;

  onReply: () => void;

}) {

  const { data: author } = useAmbassador(comment.author_id);

  const name = author?.name ?? "Ambassadeur";

  const avatar = author?.avatar ?? profileAvatarUrl(null, name);



  return (

    <li className={`flex gap-3 ${comment.parent_id ? "ml-10" : ""}`}>

      <img src={avatar} alt="" className="h-8 w-8 rounded-lg bg-surface object-cover" />

      <div className="flex-1 rounded-xl bg-surface p-3">

        <div className="flex items-center gap-2">

          <p className="text-xs font-semibold">{name}</p>

          {comment.pinned && <span className="rounded-full bg-vsm-red/20 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-vsm-red">Épinglé</span>}

        </div>

        <p className="mt-1 text-sm text-foreground/90">{comment.text}</p>

        <div className="mt-1.5 flex items-center gap-3 text-[11px] text-muted-foreground">

          <button

            type="button"

            onClick={() => onLike(comment.id, Boolean(comment.liked))}

            className={`inline-flex items-center gap-1 hover:text-vsm-red ${comment.liked ? "text-vsm-red" : ""}`}

          >

            <Heart className={`h-3 w-3 ${comment.liked ? "fill-current" : ""}`} />

            {comment.likes > 0 ? comment.likes : "J'aime"}

          </button>

          <button

            type="button"

            onClick={onReply}

            className="hover:text-vsm-red"

          >

            Répondre

          </button>

          <span>{formatRelativeTime(comment.created_at)}</span>

        </div>

      </div>

    </li>

  );

}

