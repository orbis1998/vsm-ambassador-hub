/** Types communauté — alignés sur tables social_* (migration 003). */

export type ReactionKey = "love" | "fire" | "clap" | "rocket" | "diamond";

export const REACTIONS: { key: ReactionKey; emoji: string; label: string }[] = [
  { key: "love", emoji: "❤️", label: "J'aime" },
  { key: "fire", emoji: "🔥", label: "Inspirant" },
  { key: "clap", emoji: "👏", label: "Bravo" },
  { key: "rocket", emoji: "🚀", label: "Excellent" },
  { key: "diamond", emoji: "💎", label: "Premium" },
];

export const EMPTY_REACTIONS: Record<ReactionKey, number> = {
  love: 0,
  fire: 0,
  clap: 0,
  rocket: 0,
  diamond: 0,
};

export interface PostMedia {
  type: "image" | "video" | "gif" | "doc" | "link";
  url: string;
  path?: string;
  thumb?: string;
  title?: string;
}

export interface Post {
  id: string;
  author_id: string;
  created_at: string;
  text: string;
  media: PostMedia[];
  reactions: Record<ReactionKey, number>;
  comments_count: number;
  shares: number;
  saved: boolean;
  my_reaction?: ReactionKey | null;
  group_id?: string | null;
  tags: string[];
}

export interface Story {
  id: string;
  author_id: string;
  created_at: string;
  expires_at: string;
  media_url: string;
  caption?: string;
  viewed: boolean;
  liked?: boolean;
}

export interface Comment {
  id: string;
  post_id: string;
  author_id: string;
  text: string;
  created_at: string;
  likes: number;
  pinned?: boolean;
  parent_id?: string | null;
}

export interface Group {
  id: string;
  name: string;
  slug: string;
  description: string;
  cover: string;
  members: number;
  posts: number;
  category: string;
  privacy: "public" | "private";
  joined: boolean;
}

export interface NotificationFull {
  id: string;
  type:
    | "challenge"
    | "opportunity"
    | "message"
    | "comment"
    | "certificate"
    | "badge"
    | "campaign"
    | "post"
    | "course"
    | "follow";
  title: string;
  body: string;
  actor_id?: string;
  created_at: string;
  read: boolean;
  link?: string;
}
