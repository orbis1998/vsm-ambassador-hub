import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Bookmark, MessageCircle, Share2, MoreHorizontal } from "lucide-react";
import { REACTIONS, type Post, type ReactionKey, socialApi } from "@/lib/social-data";
import { useSocialStore } from "@/lib/social-store";
import { ambassadors, currentUser } from "@/lib/mock-data";

function timeAgo(iso: string) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return `${diff}s`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}j`;
}

export function PostCard({ post }: { post: Post }) {
  const { state, setReaction, toggleSaved } = useSocialStore();
  const author = useMemo(
    () => (post.author_id === currentUser.id ? currentUser : ambassadors.find((a) => a.id === post.author_id) ?? ambassadors[0]),
    [post.author_id],
  );
  const myReaction = state.reactions[post.id] ?? null;
  const saved = state.saved.includes(post.id);
  const [showReactions, setShowReactions] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentInput, setCommentInput] = useState("");

  const totalReactions =
    Object.values(post.reactions).reduce((a, b) => a + b, 0) + (myReaction ? 1 : 0);

  return (
    <article className="animate-fade-up overflow-hidden rounded-2xl border border-border bg-surface">
      {/* Header */}
      <header className="flex items-center gap-3 p-4">
        <Link to="/ambassadeur/$id" params={{ id: author.id }}>
          <img src={author.avatar} alt="" className="h-11 w-11 rounded-xl border border-border bg-background" />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Link to="/ambassadeur/$id" params={{ id: author.id }} className="truncate text-sm font-semibold hover:text-vsm-red">
              {author.name}
            </Link>
            <span className="rounded-full bg-vsm-red/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-vsm-red">
              {author.level}
            </span>
          </div>
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
            {author.badge} · il y a {timeAgo(post.created_at)}
          </p>
        </div>
        <button className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground hover:bg-accent">
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </header>

      {/* Text */}
      {post.text && (
        <p className="px-4 pb-3 text-[15px] leading-relaxed text-foreground">
          {post.text}
          {post.tags.length > 0 && (
            <span className="ml-1 text-vsm-red">{post.tags.join(" ")}</span>
          )}
        </p>
      )}

      {/* Media */}
      {post.media.length > 0 && (
        <div className={`grid gap-1 px-4 ${post.media.length === 1 ? "" : "grid-cols-2"}`}>
          {post.media.slice(0, 4).map((m, i) => (
            <div key={i} className="relative overflow-hidden rounded-xl border border-border bg-background">
              <img src={m.url} alt="" className="aspect-[4/3] h-full w-full object-cover" />
              {m.type === "video" && (
                <span className="absolute right-2 top-2 rounded-full bg-black/70 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                  Vidéo
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Reaction counts */}
      <div className="flex items-center justify-between px-4 pt-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          {REACTIONS.slice(0, 3).map((r) => (
            <span key={r.key} className="text-sm">{r.emoji}</span>
          ))}
          <span className="ml-1">{totalReactions.toLocaleString()} réactions</span>
        </div>
        <div className="flex items-center gap-3">
          <span>{post.comments_count} commentaires</span>
          <span>{post.shares} partages</span>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-3 flex items-stretch border-t border-border text-sm">
        <div
          className="relative flex-1"
          onMouseEnter={() => setShowReactions(true)}
          onMouseLeave={() => setShowReactions(false)}
        >
          <button
            onClick={() => setReaction(post.id, myReaction ? null : "love")}
            className={`flex w-full items-center justify-center gap-2 py-3 transition-colors hover:bg-accent ${myReaction ? "text-vsm-red" : "text-muted-foreground"}`}
          >
            {myReaction ? (
              <>
                <span className="text-base">{REACTIONS.find((r) => r.key === myReaction)?.emoji}</span>
                <span className="font-semibold">{REACTIONS.find((r) => r.key === myReaction)?.label}</span>
              </>
            ) : (
              <>
                <span className="text-base">❤️</span>
                <span>Réagir</span>
              </>
            )}
          </button>
          {showReactions && (
            <div className="absolute -top-12 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1 rounded-full border border-border bg-popover px-2 py-1.5 shadow-elegant">
              {REACTIONS.map((r) => (
                <button
                  key={r.key}
                  onClick={() => { setReaction(post.id, r.key); setShowReactions(false); }}
                  className="grid h-9 w-9 place-items-center rounded-full text-lg transition-transform hover:scale-125"
                  title={r.label}
                >
                  {r.emoji}
                </button>
              ))}
            </div>
          )}
        </div>
        <button
          onClick={() => setShowComments((v) => !v)}
          className="flex flex-1 items-center justify-center gap-2 py-3 text-muted-foreground hover:bg-accent"
        >
          <MessageCircle className="h-4 w-4" /> Commenter
        </button>
        <button className="flex flex-1 items-center justify-center gap-2 py-3 text-muted-foreground hover:bg-accent">
          <Share2 className="h-4 w-4" /> Partager
        </button>
        <button
          onClick={() => toggleSaved(post.id)}
          className={`flex flex-1 items-center justify-center gap-2 py-3 hover:bg-accent ${saved ? "text-vsm-red" : "text-muted-foreground"}`}
        >
          <Bookmark className={`h-4 w-4 ${saved ? "fill-current" : ""}`} /> Sauver
        </button>
      </div>

      {/* Comments */}
      {showComments && (
        <CommentsSection postId={post.id} />
      )}
      {showComments && (
        <div className="flex items-center gap-2 border-t border-border p-3">
          <img src={currentUser.avatar} alt="" className="h-8 w-8 rounded-lg bg-background" />
          <input
            value={commentInput}
            onChange={(e) => setCommentInput(e.target.value)}
            placeholder="Écrire un commentaire…"
            className="h-10 flex-1 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-vsm-red/50"
          />
          <button
            disabled={!commentInput.trim()}
            onClick={() => setCommentInput("")}
            className="rounded-lg bg-vsm-red px-3 py-2 text-xs font-semibold uppercase tracking-wider text-white disabled:opacity-40"
          >
            Envoyer
          </button>
        </div>
      )}
    </article>
  );
}

function CommentsSection({ postId }: { postId: string }) {
  const [items, setItems] = useState<Awaited<ReturnType<typeof socialApi.getCommentsForPost>>>([]);
  useState(() => { socialApi.getCommentsForPost(postId).then(setItems); return 0; });
  return (
    <ul className="space-y-3 border-t border-border bg-background/40 p-4">
      {items.map((c) => {
        const author = ambassadors.find((a) => a.id === c.author_id) ?? ambassadors[0];
        return (
          <li key={c.id} className={`flex gap-3 ${c.parent_id ? "ml-10" : ""}`}>
            <img src={author.avatar} alt="" className="h-8 w-8 rounded-lg bg-surface" />
            <div className="flex-1 rounded-xl bg-surface p-3">
              <div className="flex items-center gap-2">
                <p className="text-xs font-semibold">{author.name}</p>
                {c.pinned && <span className="rounded-full bg-vsm-red/20 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-vsm-red">Épinglé</span>}
              </div>
              <p className="mt-1 text-sm text-foreground/90">{c.text}</p>
              <div className="mt-1.5 flex items-center gap-3 text-[11px] text-muted-foreground">
                <button className="hover:text-vsm-red">J'aime · {c.likes}</button>
                <button className="hover:text-vsm-red">Répondre</button>
                <span>·</span>
                <span>{Math.floor(Math.random() * 12) + 1}h</span>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
