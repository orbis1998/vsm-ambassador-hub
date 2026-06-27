// VSM Ambassador Academy — Social / Community / Messaging mock layer.
// All structures mirror a future Supabase schema. Replace each exported getter
// in `socialApi` with a real query to migrate without touching the UI.

import { ambassadors, currentUser, type Ambassador } from "./mock-data";

// ============================================================
// SCHEMA TYPES (Supabase-ready)
// ============================================================

export type ReactionKey = "love" | "fire" | "clap" | "rocket" | "diamond";
export const REACTIONS: { key: ReactionKey; emoji: string; label: string }[] = [
  { key: "love", emoji: "❤️", label: "J'aime" },
  { key: "fire", emoji: "🔥", label: "Inspirant" },
  { key: "clap", emoji: "👏", label: "Bravo" },
  { key: "rocket", emoji: "🚀", label: "Excellent" },
  { key: "diamond", emoji: "💎", label: "Premium" },
];

export interface Post {
  id: string;
  author_id: string;
  created_at: string;
  text: string;
  media: { type: "image" | "video" | "gif" | "doc" | "link"; url: string; thumb?: string; title?: string }[];
  reactions: Record<ReactionKey, number>;
  comments_count: number;
  shares: number;
  saved: boolean;
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

export interface Conversation {
  id: string;
  participant_ids: string[];
  last_message: string;
  last_at: string;
  unread: number;
  pinned?: boolean;
  is_group?: boolean;
  title?: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  author_id: string;
  type: "text" | "image" | "video" | "doc" | "voice" | "emoji";
  body: string;
  created_at: string;
  reactions?: Record<ReactionKey, number>;
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

export interface VsmOpportunity {
  id: string;
  title: string;
  category:
    | "Recrutement"
    | "Campagne"
    | "Collection"
    | "Contenu"
    | "Photoshoot"
    | "Casting"
    | "Évènement"
    | "Mission"
    | "Voyage"
    | "Vidéo"
    | "Test produit"
    | "Défilé"
    | "Rencontre équipe";
  image: string;
  description: string;
  location: string;
  starts_at: string;
  ends_at: string;
  slots: number;
  applicants: number;
  conditions: string[];
  status: "open" | "soon" | "closed";
  reward: string;
}

export interface VsmChallenge {
  id: string;
  title: string;
  description: string;
  type: "weekly" | "monthly" | "special";
  reward_xp: number;
  reward_points: number;
  deadline: string;
  participants: number;
  progress: number; // current user 0..100
  goal: string;
  ranking: { rank: number; name: string; avatar: string; score: number }[];
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

// ============================================================
// HELPERS
// ============================================================

const UNSPLASH = [
  "1490481651871-ab68de25d43d","1503342217505-b0a15ec3261c","1483985988355-763728e1935b",
  "1521577352947-9bb58764b69a","1469334031218-e382a71b716b","1495121605193-b116b5b9c5fe",
  "1490578474895-699cd4e2cf59","1492707892479-7bc8d5a4ee93","1517649763962-0c623066013b",
  "1539109136881-3be0616acf4b","1517438476312-10d79c5f25c4","1485518882345-15568b007407",
  "1485875437342-9b39470b3d95","1490481651871-ab68de25d43d","1542204625-ca960e69d472",
  "1554941068-a252680d25d3","1495121605193-b116b5b9c5fe","1483985988355-763728e1935b",
  "1469334031218-e382a71b716b","1492707892479-7bc8d5a4ee93",
];
const img = (i: number, w = 900) =>
  `https://images.unsplash.com/photo-${UNSPLASH[i % UNSPLASH.length]}?w=${w}&q=70&auto=format&fit=crop`;

const POST_TEXTS = [
  "Tournage terminé pour la prochaine campagne #VSMCollection. Le résultat va envoyer. 🔥",
  "Aujourd'hui +3 nouveaux ambassadeurs onboardés sur Kinshasa. La famille grandit.",
  "Petit BTS de mon shooting de ce week-end. Lumière naturelle, zéro retouche.",
  "Astuce du jour : ton hook compte plus que ton matériel. Test, mesure, ajuste.",
  "Quand tu reçois ton premier badge Gold, ça change ton énergie. Merci VSM 💎",
  "Reel posté ce matin : 12k vues en 4h. La méthode VSM fonctionne.",
  "Cherche un·e ambassadeur·rice basé·e à Lubumbashi pour un projet en duo. DM ouverts.",
  "Le streetwear, c'est d'abord une histoire. Vie-Sur-Moi raconte la nôtre.",
  "Quiz Brand Master Class validé à 95%. Prochaine étape : Sales Closing.",
  "Petit rappel : ta consistance battra toujours ton talent.",
  "Behind the scenes de la collection Renescentia. Bientôt.",
  "Premier voyage ambassadeur à Paris confirmé. Hâte de rencontrer la team.",
];

const COMMENT_TEXTS = [
  "💎 Énorme respect frérot.",
  "On est tous en route 🚀",
  "Ce reel est une masterclass.",
  "Tu peux partager ton storyboard ?",
  "VSM Family 🔥",
  "Je note pour ma prochaine campagne.",
  "Trop fort, bravo 👏",
  "On s'organise pour un live ?",
  "C'est exactement ce qu'on enseigne en module 4.",
  "Ambition + discipline = VSM.",
];

function pick<T>(arr: T[], i: number): T { return arr[i % arr.length]; }
function hours(n: number) { return new Date(Date.now() - n * 3600_000).toISOString(); }

// ============================================================
// SEED DATA
// ============================================================

export const posts: Post[] = Array.from({ length: 100 }, (_, i) => {
  const author = i % 7 === 0 ? currentUser : ambassadors[i % ambassadors.length];
  const mediaCount = i % 5 === 0 ? 0 : i % 4 === 0 ? 3 : i % 3 === 0 ? 2 : 1;
  return {
    id: `post-${i + 1}`,
    author_id: author.id,
    created_at: hours(i * 3 + 1),
    text: pick(POST_TEXTS, i),
    media: Array.from({ length: mediaCount }, (_, k) => ({
      type: i % 11 === 0 ? "video" as const : "image" as const,
      url: img(i + k),
      thumb: img(i + k, 400),
    })),
    reactions: {
      love: 12 + ((i * 17) % 380),
      fire: 8 + ((i * 11) % 220),
      clap: 4 + ((i * 7) % 90),
      rocket: 2 + ((i * 5) % 60),
      diamond: 1 + ((i * 3) % 30),
    },
    comments_count: 3 + (i % 28),
    shares: i % 12,
    saved: i % 9 === 0,
    group_id: i % 6 === 0 ? `grp-${(i % 9) + 1}` : null,
    tags: i % 4 === 0 ? ["#VSMCollection"] : i % 5 === 0 ? ["#Ambassadeur", "#Renescentia"] : [],
  };
});

export const stories: Story[] = Array.from({ length: 14 }, (_, i) => {
  const a = i === 0 ? currentUser : ambassadors[i];
  return {
    id: `story-${i + 1}`,
    author_id: a.id,
    created_at: hours(i + 1),
    expires_at: new Date(Date.now() + (24 - i) * 3600_000).toISOString(),
    media_url: img(i + 5),
    caption: pick(["Behind the scenes","Nouveau drop bientôt","Recap quiz","Set-up shooting","En mode Gold"], i),
    viewed: i > 6,
  };
});

export const comments: Comment[] = posts.flatMap((p, i) =>
  Array.from({ length: Math.min(p.comments_count, 4) }, (_, k) => ({
    id: `cmt-${p.id}-${k}`,
    post_id: p.id,
    author_id: ambassadors[(i * 3 + k) % ambassadors.length].id,
    text: pick(COMMENT_TEXTS, i + k),
    created_at: hours(i + k),
    likes: (k * 4 + i) % 25,
    pinned: k === 0 && i % 13 === 0,
    parent_id: k === 3 ? `cmt-${p.id}-0` : null,
  })),
);

// Conversations + messages
export const conversations: Conversation[] = Array.from({ length: 14 }, (_, i) => {
  const other = ambassadors[i];
  return {
    id: `conv-${i + 1}`,
    participant_ids: i % 6 === 0
      ? [currentUser.id, ambassadors[i].id, ambassadors[i + 1].id, ambassadors[i + 2].id]
      : [currentUser.id, other.id],
    last_message: pick(["On se cale demain 18h ?","Top, je te renvoie le brief","Reçu, merci 🙏","On signe la campagne ✅","RDV studio Kin","Tu as le lookbook ?","🔥🔥","Je t'envoie un vocal"], i),
    last_at: hours(i),
    unread: i < 4 ? (i % 3) + 1 : 0,
    pinned: i < 2,
    is_group: i % 6 === 0,
    title: i % 6 === 0 ? pick(["Créateurs Kinshasa","Squad Renescentia","Team Vidéo VSM"], i) : undefined,
  };
});

export const messages: Message[] = conversations.flatMap((c, i) =>
  Array.from({ length: 8 }, (_, k) => ({
    id: `msg-${c.id}-${k}`,
    conversation_id: c.id,
    author_id: k % 2 === 0 ? c.participant_ids[1] : currentUser.id,
    type: k === 5 ? "voice" as const : k === 3 ? "image" as const : "text" as const,
    body: k === 5 ? "0:42" : k === 3 ? img(i + k) : pick(["Salut, t'es dispo ?","Oui, je t'écoute","Parfait on cale ça","Je te call dans 5","Reçu","Je valide ✅","Top top top","🔥"], k + i),
    created_at: hours((8 - k) + i),
  })),
);

// Groups
const GROUP_DEFS: { name: string; category: string; description: string }[] = [
  { name: "Créateurs Kinshasa", category: "Local", description: "Le hub des créateurs basés à Kinshasa." },
  { name: "Lifestyle VSM", category: "Lifestyle", description: "Inspiration quotidienne, mood, codes." },
  { name: "Mode & Streetwear", category: "Mode", description: "Tendances, drops, styling VSM." },
  { name: "Streetwear Premium", category: "Mode", description: "Décoder le luxe streetwear." },
  { name: "Photographie", category: "Création", description: "Studio, lumière, retouche, gear." },
  { name: "Vidéo & Reels", category: "Création", description: "Cadrage, mouvement, montage." },
  { name: "Marketing & Growth", category: "Business", description: "Stratégie de contenu et acquisition." },
  { name: "Facebook Mastery", category: "Plateforme", description: "Pages, Reels, communautés." },
  { name: "Instagram Pro", category: "Plateforme", description: "Reels, carousels, growth IG." },
  { name: "TikTok Creators", category: "Plateforme", description: "Hooks, formats, trends." },
];
export const groups: Group[] = GROUP_DEFS.map((g, i) => ({
  id: `grp-${i + 1}`,
  name: g.name,
  slug: g.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
  description: g.description,
  cover: img(i + 2, 1200),
  members: 80 + ((i * 47) % 920),
  posts: 30 + ((i * 13) % 240),
  category: g.category,
  privacy: i % 4 === 0 ? "private" : "public",
  joined: i < 4,
}));

// VSM-only opportunities
const OPP_DEFS: { title: string; category: VsmOpportunity["category"] }[] = [
  { title: "Casting officiel — Campagne Renescentia", category: "Casting" },
  { title: "Recrutement 12 nouveaux ambassadeurs RDC", category: "Recrutement" },
  { title: "Lancement Collection « Vie-Sur-Moi Vol. 3 »", category: "Collection" },
  { title: "Photoshoot officiel Kinshasa — Studio VSM", category: "Photoshoot" },
  { title: "Création de contenu UGC — Drop hiver", category: "Contenu" },
  { title: "Évènement privé ambassadeurs Paris", category: "Évènement" },
  { title: "Mission rémunérée : 5 reels VSM", category: "Mission" },
  { title: "Voyage ambassadeurs — Marrakech", category: "Voyage" },
  { title: "Tournage clip campagne Renescentia", category: "Vidéo" },
  { title: "Test produit — Capsule Streetwear", category: "Test produit" },
  { title: "Défilé privé Bruxelles", category: "Défilé" },
  { title: "Rencontre avec l'équipe fondatrice VSM", category: "Rencontre équipe" },
  { title: "Campagne marketing « Story 24h »", category: "Campagne" },
  { title: "Casting visages collection capsule", category: "Casting" },
];
export const vsmOpportunities: VsmOpportunity[] = OPP_DEFS.map((o, i) => ({
  id: `opp-${i + 1}`,
  title: o.title,
  category: o.category,
  image: img(i + 1, 1200),
  description:
    "Opportunité officielle V S M Collection réservée aux ambassadeurs actifs du programme. Sélection sur dossier et niveau d'engagement.",
  location: pick(["Kinshasa","Paris","Bruxelles","Marrakech","Montréal","Lubumbashi","Remote"], i),
  starts_at: new Date(Date.now() + (i + 2) * 86400_000).toISOString(),
  ends_at: new Date(Date.now() + (i + 14) * 86400_000).toISOString(),
  slots: 3 + (i % 12),
  applicants: 12 + ((i * 23) % 240),
  conditions: [
    "Niveau Silver minimum",
    "Profil complété à 100%",
    i % 2 ? "Dispo sur place" : "Dispo en remote",
    "Avoir validé 3 cours Académie",
  ],
  status: i < 9 ? "open" : i < 12 ? "soon" : "closed",
  reward: pick(["500 USD","Produits offerts","750 USD + lookbook","1000 USD","Voyage tout compris","Visibilité officielle"], i),
}));

// Challenges
const CHAL_DEFS: { title: string; goal: string; type: VsmChallenge["type"] }[] = [
  { title: "Crée 1 Reel #VSMCollection", goal: "Publier 1 reel", type: "weekly" },
  { title: "Poste 3 stories cette semaine", goal: "3 stories", type: "weekly" },
  { title: "Photo produit en lumière naturelle", goal: "1 photo produit", type: "weekly" },
  { title: "UGC 30s — pitch produit", goal: "Vidéo UGC", type: "weekly" },
  { title: "Obtenir 100 interactions sur un post", goal: "100 interactions", type: "monthly" },
  { title: "Partager 2 campagnes officielles VSM", goal: "2 campagnes", type: "monthly" },
  { title: "Inviter 1 nouvel ambassadeur", goal: "1 invitation", type: "monthly" },
  { title: "Compléter le parcours Brand 101", goal: "Parcours validé", type: "monthly" },
  { title: "Défi spécial — Renescentia Drop", goal: "Mission spéciale", type: "special" },
  { title: "Défi spécial — Voyage Marrakech", goal: "Mission spéciale", type: "special" },
];
export const vsmChallenges: VsmChallenge[] = CHAL_DEFS.map((c, i) => ({
  id: `chall-${i + 1}`,
  title: c.title,
  description:
    "Défi officiel du programme. Termine la mission avant la deadline pour gagner XP, points et débloquer des opportunités exclusives.",
  type: c.type,
  reward_xp: 100 + (i % 6) * 75,
  reward_points: 50 + (i % 8) * 40,
  deadline: pick(["2 jours","5 jours","1 semaine","12 jours","3 jours"], i),
  participants: 40 + ((i * 19) % 380),
  progress: i < 3 ? [70, 40, 15][i] : 0,
  goal: c.goal,
  ranking: ambassadors.slice(0, 10).map((a, k) => ({
    rank: k + 1,
    name: a.name,
    avatar: a.avatar,
    score: 980 - k * 67 - i * 5,
  })),
}));

// Notifications (100+)
export const notificationsFull: NotificationFull[] = Array.from({ length: 110 }, (_, i) => {
  const types: NotificationFull["type"][] = ["challenge","opportunity","message","comment","certificate","badge","campaign","post","course","follow"];
  const t = types[i % types.length];
  const titleMap: Record<NotificationFull["type"], [string, string]> = {
    challenge:   ["Nouveau défi disponible", "Un défi vient d'être ajouté à ton tableau."],
    opportunity: ["Nouvelle opportunité VSM", "Une opportunité officielle vient d'ouvrir."],
    message:     ["Nouveau message", "Tu as reçu un message privé."],
    comment:     ["Nouveau commentaire", "Quelqu'un a commenté ta publication."],
    certificate: ["Certificat débloqué", "Bravo ! Un nouveau certificat est disponible."],
    badge:       ["Badge obtenu", "Un nouveau badge vient de rejoindre ta collection."],
    campaign:    ["Nouvelle campagne", "Une campagne officielle vient d'être lancée."],
    post:        ["Nouvelle publication", "Un ambassadeur que tu suis vient de publier."],
    course:      ["Nouveau cours publié", "Un nouveau cours est disponible dans l'Académie."],
    follow:      ["Nouveau follower", "Un ambassadeur vient de te suivre."],
  };
  const actor = ambassadors[i % ambassadors.length];
  return {
    id: `notif-${i + 1}`,
    type: t,
    title: titleMap[t][0],
    body: titleMap[t][1],
    actor_id: actor.id,
    created_at: hours(i * 2 + 1),
    read: i > 12,
  };
});

// ============================================================
// SUPABASE-READY API SURFACE
// ============================================================

export const socialApi = {
  // Feed
  getStories: async () => stories,
  getPosts: async (limit = 100) => posts.slice(0, limit),
  getPost: async (id: string) => posts.find((p) => p.id === id) ?? null,
  getCommentsForPost: async (postId: string) => comments.filter((c) => c.post_id === postId),

  // Profiles
  getAmbassadorById: async (id: string): Promise<Ambassador | null> =>
    id === currentUser.id ? currentUser : ambassadors.find((a) => a.id === id) ?? null,
  getPostsByAuthor: async (authorId: string) => posts.filter((p) => p.author_id === authorId),

  // Messaging
  getConversations: async () => conversations,
  getMessages: async (conversationId: string) =>
    messages.filter((m) => m.conversation_id === conversationId),

  // Groups
  getGroups: async () => groups,
  getGroup: async (id: string) => groups.find((g) => g.id === id) ?? null,
  getPostsByGroup: async (groupId: string) => posts.filter((p) => p.group_id === groupId),

  // Opportunities
  getOpportunities: async () => vsmOpportunities,
  getOpportunity: async (id: string) => vsmOpportunities.find((o) => o.id === id) ?? null,

  // Challenges
  getChallenges: async () => vsmChallenges,
  getChallenge: async (id: string) => vsmChallenges.find((c) => c.id === id) ?? null,

  // Notifications
  getNotifications: async () => notificationsFull,
};

// ============================================================
// FUTURE SUPABASE SCHEMA (documentation)
// ============================================================
// Tables planifiées (préparation Supabase) :
// users, profiles, ambassadors, courses, lessons, videos, quizzes,
// quiz_answers, missions, certificates, badges, levels, posts, stories,
// comments, likes, reactions, followers, messages, conversations, groups,
// group_members, notifications, resources, opportunities, applications,
// leaderboards, weekly_challenges, challenge_progress, xp_history,
// activity_logs, settings.
export const SUPABASE_TABLES = [
  "users","profiles","ambassadors","courses","lessons","videos","quizzes",
  "quiz_answers","missions","certificates","badges","levels","posts","stories",
  "comments","likes","reactions","followers","messages","conversations","groups",
  "group_members","notifications","resources","opportunities","applications",
  "leaderboards","weekly_challenges","challenge_progress","xp_history",
  "activity_logs","settings",
] as const;
