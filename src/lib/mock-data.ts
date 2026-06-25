// VSM Ambassador Academy — Mock Data
// All data here is fictitious. Structure mirrors a future Supabase schema
// so swapping to real data only requires replacing the exported getters.

export type Level =
  | "Rookie"
  | "Bronze"
  | "Silver"
  | "Gold Ambassador"
  | "Platinum"
  | "Diamond";

export interface Ambassador {
  id: string;
  name: string;
  handle: string;
  badge: string; // VSM-XXXX
  avatar: string;
  level: Level;
  xp: number;
  points: number;
  country: string;
}

export interface Course {
  id: string;
  title: string;
  category: "Storytelling" | "Brand" | "Sales" | "Content" | "Community" | "Style";
  duration: string;
  progress: number; // 0..100
  lessons: number;
  cover: string;
  status: "in-progress" | "completed" | "locked" | "new";
}

export interface Challenge {
  id: string;
  title: string;
  reward: number; // XP
  deadline: string;
  participants: number;
  status: "active" | "soon" | "ended";
}

export interface NotificationItem {
  id: string;
  type: "course" | "challenge" | "opportunity" | "message" | "campaign";
  title: string;
  body: string;
  time: string;
  unread: boolean;
}

export interface Opportunity {
  id: string;
  brand: string;
  title: string;
  reward: string;
  location: string;
  deadline: string;
  tag: "Campaign" | "Event" | "Casting" | "Shoot";
}

export interface Certificate {
  id: string;
  title: string;
  issuedAt: string;
  serial: string;
}

const AVA = (seed: string) =>
  `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(seed)}&backgroundColor=0a0a0a`;

const FIRST = ["Amani","Joel","Sarah","Divine","Patrick","Grace","Kevin","Ines","Junior","Cathy","Eric","Naomi","Steve","Laura","Brian","Aline","Marc","Sandra","Olivier","Esther","Yannick","Belinda","Hugo","Maya","Christ","Lina","Daniel","Aïcha","Samuel","Noella","Bryan","Estelle","Trésor","Mireille","Glody","Princesse","Fabrice","Cynthia","Gloire","Joyce","Henock","Ruth","Israel","Plamedi","Jean","Merveille","Boaz","Bénédicte","Don","Sephora"];
const LAST = ["Mbuyi","Kabasele","Lwamba","Tshibangu","Ilunga","Mwamba","Kalonji","Bemba","Mukendi","Ngalula","Lokombe","Mputu","Kasongo","Mulumba","Mansoki","Nzuzi","Lubaki","Mbiya","Kapinga","Tshilumba"];
const COUNTRIES = ["RDC 🇨🇩","France 🇫🇷","Belgique 🇧🇪","Canada 🇨🇦","USA 🇺🇸","UK 🇬🇧","Côte d'Ivoire 🇨🇮","Sénégal 🇸🇳"];
const LEVELS: Level[] = ["Rookie","Bronze","Silver","Gold Ambassador","Platinum","Diamond"];

function rand<T>(arr: T[], i: number): T { return arr[i % arr.length]; }

export const ambassadors: Ambassador[] = Array.from({ length: 50 }, (_, i) => {
  const name = `${rand(FIRST, i * 3)} ${rand(LAST, i * 5)}`;
  return {
    id: `amb-${i + 1}`,
    name,
    handle: name.toLowerCase().replace(/\s+/g, ".").normalize("NFD").replace(/[\u0300-\u036f]/g, ""),
    badge: `VSM-${(1000 + i).toString()}`,
    avatar: AVA(name),
    level: rand(LEVELS, i),
    xp: 200 + ((i * 137) % 4800),
    points: 500 + ((i * 311) % 14500),
    country: rand(COUNTRIES, i * 2),
  };
});

export const currentUser: Ambassador & { lastLogin: string; progress: number } = {
  id: "me",
  name: "Joel Mbuyi",
  handle: "joel.mbuyi",
  badge: "VSM-0427",
  avatar: AVA("Joel Mbuyi"),
  level: "Gold Ambassador",
  xp: 1250,
  points: 7800,
  country: "RDC 🇨🇩",
  lastLogin: "Aujourd'hui à 09:42",
  progress: 68,
};

export const stats = {
  progress: 68,
  xp: 1250,
  xpNextLevel: 2000,
  points: 7800,
  level: "Gold Ambassador" as Level,
  activeCourses: 4,
  completedCourses: 18,
  certificates: 7,
  challenges: 3,
  opportunities: 2,
};

const COURSE_TITLES = [
  ["Storytelling", "L'art du Storytelling VSM"],
  ["Brand", "Identité de marque & héritage"],
  ["Sales", "Vente premium en streetwear"],
  ["Content", "Créer du contenu cinématique"],
  ["Community", "Bâtir une communauté fidèle"],
  ["Style", "Codes du streetwear haut de gamme"],
  ["Storytelling", "Pitcher VSM en 60 secondes"],
  ["Content", "Photographie produit mobile"],
  ["Sales", "Closing sans pression"],
  ["Brand", "Histoire de Vie-Sur-Moi"],
] as const;

export const courses: Course[] = Array.from({ length: 30 }, (_, i) => {
  const [cat, title] = COURSE_TITLES[i % COURSE_TITLES.length];
  const progress = i < 4 ? [82, 56, 34, 12][i] : i < 22 ? 100 : 0;
  return {
    id: `course-${i + 1}`,
    title: `${title}${i >= COURSE_TITLES.length ? ` — Vol. ${Math.floor(i / COURSE_TITLES.length) + 1}` : ""}`,
    category: cat,
    duration: `${20 + ((i * 7) % 70)} min`,
    lessons: 4 + (i % 8),
    progress,
    cover: `https://images.unsplash.com/photo-${["1490481651871-ab68de25d43d","1503342217505-b0a15ec3261c","1483985988355-763728e1935b","1521577352947-9bb58764b69a","1469334031218-e382a71b716b","1495121605193-b116b5b9c5fe"][i % 6]}?w=600&q=70&auto=format&fit=crop`,
    status: i < 4 ? "in-progress" : i < 22 ? "completed" : i === 22 ? "new" : "locked",
  };
});

export const challenges: Challenge[] = Array.from({ length: 20 }, (_, i) => ({
  id: `chal-${i + 1}`,
  title: rand([
    "Publier 3 stories #VSMCollection",
    "Inviter 5 nouveaux abonnés",
    "Tourner un reel de 15s",
    "Compléter le quiz Brand 101",
    "Participer à la discussion hebdo",
    "Référencer un futur ambassadeur",
  ], i),
  reward: 100 + (i % 6) * 75,
  deadline: `${2 + (i % 12)}j`,
  participants: 40 + ((i * 19) % 380),
  status: i < 3 ? "active" : i < 14 ? "soon" : "ended",
}));

export const notifications: NotificationItem[] = Array.from({ length: 30 }, (_, i) => {
  const types: NotificationItem["type"][] = ["campaign", "challenge", "course", "opportunity", "message"];
  const t = types[i % types.length];
  const map = {
    campaign: ["Nouvelle campagne disponible", "VSM Renescentia recrute 12 ambassadeurs pour la prochaine collection."],
    challenge: ["Nouveau défi lancé", "Un défi 'Story 24h' vient d'être ajouté à votre tableau."],
    course: ["Nouveau cours publié", "« Closing sans pression » est maintenant disponible."],
    opportunity: ["Nouvelle opportunité", "Casting shooting Vie-Sur-Moi — Kinshasa."],
    message: ["Nouveau message", "Sarah Kabasele vous a écrit dans la communauté."],
  }[t];
  return {
    id: `notif-${i + 1}`,
    type: t,
    title: map[0],
    body: map[1],
    time: `${(i % 12) + 1}h`,
    unread: i < 6,
  };
});

export const opportunities: Opportunity[] = Array.from({ length: 10 }, (_, i) => ({
  id: `opp-${i + 1}`,
  brand: "VSM Collection",
  title: rand([
    "Casting — Campagne Renescentia",
    "Shooting Vie-Sur-Moi Vol. 3",
    "Évènement privé Kinshasa",
    "Pop-up Paris Marais",
    "Ambassadeur du mois",
    "Reel collaboration",
  ], i),
  reward: rand(["350 USD", "500 USD", "Produits offerts", "750 USD + lookbook", "1000 USD"], i),
  location: rand(["Kinshasa", "Paris", "Bruxelles", "Montréal", "Remote"], i),
  deadline: `${3 + (i % 20)} jours`,
  tag: (["Campaign","Event","Casting","Shoot"] as const)[i % 4],
}));

export const certificates: Certificate[] = Array.from({ length: 20 }, (_, i) => ({
  id: `cert-${i + 1}`,
  title: rand([
    "Storytelling VSM — Niveau 1",
    "Brand Master Class",
    "Content Creator Pro",
    "Sales Closing",
    "Community Builder",
    "Style Streetwear",
  ], i),
  issuedAt: `${(i % 28) + 1}/${1 + (i % 12)}/2025`,
  serial: `VSM-CERT-${(10000 + i).toString()}`,
}));

export interface ActivityItem { id: string; text: string; time: string; emoji: string; }
export const activity: ActivityItem[] = [
  { id: "a1", text: "Vous avez terminé le cours « Storytelling VSM »", time: "il y a 2h", emoji: "🎓" },
  { id: "a2", text: "+250 XP gagnés sur le défi #ReelChallenge", time: "il y a 5h", emoji: "⚡" },
  { id: "a3", text: "Badge obtenu : Créateur", time: "hier", emoji: "🏅" },
  { id: "a4", text: "Vous êtes passé au rang Gold Ambassador", time: "il y a 3j", emoji: "👑" },
  { id: "a5", text: "Certificat reçu : Brand Master Class", time: "il y a 1 sem.", emoji: "📜" },
  { id: "a6", text: "Vous avez rejoint la discussion #KinshasaMeetup", time: "il y a 1 sem.", emoji: "💬" },
];

export interface WeeklyGoal { id: string; title: string; done: number; total: number; }
export const weeklyGoals: WeeklyGoal[] = [
  { id: "g1", title: "Terminer 2 cours", done: 1, total: 2 },
  { id: "g2", title: "Publier une Story", done: 1, total: 1 },
  { id: "g3", title: "Réussir un Quiz", done: 0, total: 1 },
  { id: "g4", title: "Participer à une discussion", done: 2, total: 3 },
];

export const leaderboard = [...ambassadors]
  .sort((a, b) => b.xp - a.xp)
  .slice(0, 10)
  .map((a, i) => ({ ...a, rank: i + 1 }));

// Future Supabase swap surface — replace these with real queries.
export const api = {
  getCurrentUser: async () => currentUser,
  getStats: async () => stats,
  getCourses: async () => courses,
  getChallenges: async () => challenges,
  getNotifications: async () => notifications,
  getOpportunities: async () => opportunities,
  getCertificates: async () => certificates,
  getActivity: async () => activity,
  getWeeklyGoals: async () => weeklyGoals,
  getLeaderboard: async () => leaderboard,
};
