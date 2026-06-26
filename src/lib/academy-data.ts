// VSM Ambassador Academy — Academy module mock data.
// Pure data, no React imports. Future-Supabase friendly: getters live in `academyApi`.

export type Difficulty = "Débutant" | "Intermédiaire" | "Avancé" | "Expert";
export type LevelTier = "Bronze" | "Silver" | "Gold" | "Diamond" | "Elite" | "Legend";

export interface Lesson {
  id: string;
  title: string;
  duration: string; // "8 min"
  type: "video" | "reading" | "practice";
  completed: boolean;
  preview: string; // short text
}

export interface QuizQuestion {
  id: string;
  prompt: string;
  kind: "single" | "multiple" | "truefalse";
  choices: string[];
  answer: number[]; // indexes
  explanation: string;
}

export interface Quiz {
  id: string;
  title: string;
  minScore: number;
  questions: QuizQuestion[];
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  reward: number; // XP
  example: string;
}

export interface Resource {
  id: string;
  title: string;
  category: ResourceCategory;
  format: "PDF" | "Canva" | "ZIP" | "MP4" | "PNG" | "DOCX";
  size: string;
  downloads: number;
  cover: string;
}

export type ResourceCategory =
  | "Scripts"
  | "Templates Canva"
  | "Calendriers éditoriaux"
  | "Guides Instagram"
  | "Guides Facebook"
  | "Guides TikTok"
  | "Brand Kit VSM"
  | "Photos"
  | "Vidéos"
  | "Icônes"
  | "Mockups";

export interface Course {
  id: string;
  parcoursId: string;
  title: string;
  description: string;
  objectives: string[];
  cover: string;
  videoPoster: string;
  duration: string;
  difficulty: Difficulty;
  lessons: Lesson[];
  quiz: Quiz;
  mission: Mission;
  downloads: { id: string; label: string; format: string; size: string }[];
  rating: number;
  studentCount: number;
}

export interface Parcours {
  id: string;
  slug: string;
  number: number;
  title: string;
  tagline: string;
  description: string;
  cover: string;
  hours: number;
  difficulty: Difficulty;
  certificateTitle: string;
  badge: string;
  courses: Course[];
}

export interface BadgeDef {
  id: string;
  name: string;
  description: string;
  icon: string; // lucide name
  tier: LevelTier;
  unlocked: boolean;
}

export interface CertificateRecord {
  id: string;
  parcoursTitle: string;
  ambassadorName: string;
  date: string;
  serial: string;
  signature: string;
}

/* ------------------------------------------------------------------ */
/*  Imagery pool                                                      */
/* ------------------------------------------------------------------ */
const COVERS = [
  "photo-1521577352947-9bb58764b69a",
  "photo-1483985988355-763728e1935b",
  "photo-1490481651871-ab68de25d43d",
  "photo-1503342217505-b0a15ec3261c",
  "photo-1469334031218-e382a71b716b",
  "photo-1495121605193-b116b5b9c5fe",
  "photo-1542038784456-1ea8e935640e",
  "photo-1529139574466-a303027c1d8b",
  "photo-1492691527719-9d1e07e534b4",
  "photo-1517363898874-737b62a7db91",
] as const;

const img = (i: number, w = 800) =>
  `https://images.unsplash.com/${COVERS[i % COVERS.length]}?w=${w}&q=70&auto=format&fit=crop`;

/* ------------------------------------------------------------------ */
/*  Parcours blueprints                                               */
/* ------------------------------------------------------------------ */
interface Blueprint {
  title: string;
  tagline: string;
  description: string;
  badge: string;
  difficulty: Difficulty;
  modules: string[];
}

const BLUEPRINTS: Blueprint[] = [
  {
    title: "Bienvenue chez VSM Collection",
    tagline: "L'ADN d'une marque streetwear premium",
    description:
      "Plonge dans l'histoire, la vision et les valeurs de VSM. Comprends ton rôle et ta mission en tant qu'ambassadeur officiel.",
    badge: "VSM Expert",
    difficulty: "Débutant",
    modules: ["Histoire de la marque", "Vision", "Valeurs", "Philosophie", "ADN de VSM", "Le rôle d'un ambassadeur"],
  },
  {
    title: "Image personnelle",
    tagline: "Construire un ambassadeur authentique",
    description: "Bâtis une présence forte, professionnelle et reconnaissable, qui inspire confiance et leadership.",
    badge: "Leader",
    difficulty: "Débutant",
    modules: [
      "Construire sa réputation",
      "Créer une image professionnelle",
      "Développer sa crédibilité",
      "Communication",
      "Confiance en soi",
      "Leadership",
    ],
  },
  {
    title: "Instagram",
    tagline: "Devenir une référence sur Instagram",
    description: "Maîtrise les codes du feed, des Reels, des stories et de l'algorithme pour faire grandir ta communauté.",
    badge: "Expert Instagram",
    difficulty: "Intermédiaire",
    modules: [
      "Créer une bio parfaite",
      "Optimiser son profil",
      "Créer un feed cohérent",
      "Stories",
      "Highlights",
      "Reels",
      "Carrousels",
      "Algorithme",
      "Engagement",
      "Analyse des statistiques",
    ],
  },
  {
    title: "Facebook",
    tagline: "Activer la puissance des pages & groupes",
    description: "Construis un profil pro, anime des communautés engagées et exploite l'algorithme Meta.",
    badge: "Expert Facebook",
    difficulty: "Intermédiaire",
    modules: [
      "Profil professionnel",
      "Page Facebook",
      "Publications",
      "Stories",
      "Réels",
      "Communautés",
      "Engagement",
      "Algorithme",
    ],
  },
  {
    title: "TikTok",
    tagline: "Créer du contenu viral sur TikTok",
    description: "Hooks, montage rapide, tendances : les leviers concrets pour exploser sur la plateforme.",
    badge: "Content Master",
    difficulty: "Avancé",
    modules: ["Hooks", "Montage", "Algorithme", "Vidéos virales", "Tendances", "Live"],
  },
  {
    title: "Marketing d'influence",
    tagline: "Penser comme un créateur stratégique",
    description: "Personal branding, storytelling, collaborations, mesure de performance et fidélisation.",
    badge: "Top Ambassador",
    difficulty: "Avancé",
    modules: [
      "Créer son personal branding",
      "Storytelling",
      "Créer une audience",
      "Collaborer avec une marque",
      "Créer une campagne",
      "Mesurer les performances",
      "Créer la confiance",
      "Fidéliser sa communauté",
    ],
  },
  {
    title: "Création de contenu",
    tagline: "Production pro avec un téléphone",
    description: "De la photo au montage : tous les fondamentaux pour produire du contenu cinématique en autonomie.",
    badge: "Créateur",
    difficulty: "Intermédiaire",
    modules: ["Photo", "Vidéo", "Éclairage", "Composition", "Montage", "CapCut", "Canva", "Miniatures", "Sous-titres"],
  },
  {
    title: "Vendre une marque",
    tagline: "Convertir sans jamais forcer",
    description: "Maîtrise la psychologie de la vente, les appels à l'action et la création d'offres irrésistibles.",
    badge: "Storyteller",
    difficulty: "Avancé",
    modules: [
      "Comment présenter un produit",
      "Créer une vidéo qui vend",
      "Psychologie de vente",
      "Créer une émotion",
      "Créer un appel à l'action",
      "Créer une offre",
      "Convaincre sans forcer",
    ],
  },
  {
    title: "Communication",
    tagline: "Prendre la parole avec impact",
    description: "Travaille ta voix, ta présence caméra et apprends à gérer critiques, commentaires et haters.",
    badge: "Top Communicator",
    difficulty: "Intermédiaire",
    modules: [
      "Prise de parole",
      "Voix",
      "Présence caméra",
      "Gestion des critiques",
      "Gestion des commentaires",
      "Gestion des haters",
    ],
  },
  {
    title: "Business",
    tagline: "Vivre de l'influence",
    description: "Pose les bases de ton activité : freelancing, clients, factures, portfolio et croissance pro.",
    badge: "Community Builder",
    difficulty: "Expert",
    modules: [
      "Créer son activité",
      "Freelancing",
      "Gestion client",
      "Facturation",
      "Portfolio",
      "Développement professionnel",
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  Quiz / mission generators                                         */
/* ------------------------------------------------------------------ */
function makeQuiz(courseTitle: string, seed: number): Quiz {
  const base: Omit<QuizQuestion, "id">[] = [
    {
      prompt: `Quel est le principal objectif du module « ${courseTitle} » ?`,
      kind: "single",
      choices: [
        "Créer du contenu cohérent avec l'identité VSM",
        "Acheter plus d'abonnés",
        "Copier la concurrence",
        "Publier sans stratégie",
      ],
      answer: [0],
      explanation: "Un ambassadeur VSM cherche toujours la cohérence avec l'ADN de la marque.",
    },
    {
      prompt: "Un ambassadeur doit incarner les valeurs de la marque dans chaque publication.",
      kind: "truefalse",
      choices: ["Vrai", "Faux"],
      answer: [0],
      explanation: "L'authenticité est la première règle de l'ambassadeur VSM.",
    },
    {
      prompt: "Sélectionne tous les piliers d'un contenu performant.",
      kind: "multiple",
      choices: ["Hook fort", "Valeur claire", "Bruit ambiant", "Appel à l'action"],
      answer: [0, 1, 3],
      explanation: "Hook, valeur et CTA sont les trois fondamentaux universels.",
    },
    {
      prompt: "Quel format est le plus efficace pour amorcer une audience nouvelle ?",
      kind: "single",
      choices: ["Reel court vertical", "PDF de 30 pages", "Email de 2 000 mots", "Story éphémère sans son"],
      answer: [0],
      explanation: "Les Reels concentrent la portée organique en 2025.",
    },
    {
      prompt: "On peut négliger la lumière en photo produit.",
      kind: "truefalse",
      choices: ["Vrai", "Faux"],
      answer: [1],
      explanation: "La lumière est le premier critère de qualité perçue.",
    },
  ];
  return {
    id: `quiz-${seed}`,
    title: `Quiz — ${courseTitle}`,
    minScore: 80,
    questions: base.map((q, i) => ({ ...q, id: `q-${seed}-${i}` })),
  };
}

const MISSION_POOL = [
  { title: "Publier une Story VSM", example: "Mets en scène une pièce VSM en story avec sticker, lieu et musique." },
  { title: "Tourner un Reel de 15s", example: "Hook fort dans les 2 premières secondes, plan large puis détail produit." },
  { title: "Créer une publication carrousel", example: "5 slides : hook, problème, solution, preuve, CTA." },
  { title: "Faire une photo produit", example: "Lumière naturelle, fond minimal, focus sur la matière." },
  { title: "Créer une vidéo UGC", example: "Format selfie 30s, témoignage personnel sur la marque." },
];

function makeMission(seed: number, reward: number): Mission {
  const m = MISSION_POOL[seed % MISSION_POOL.length];
  return {
    id: `mission-${seed}`,
    title: m.title,
    description: `Mets en pratique le module avec une livraison concrète : ${m.title.toLowerCase()}.`,
    example: m.example,
    reward,
  };
}

function makeLessons(courseTitle: string, count: number, seed: number): Lesson[] {
  const segments = [
    "Introduction",
    "Concepts clés",
    "Étude de cas VSM",
    "Démonstration pratique",
    "Erreurs à éviter",
    "Outils & ressources",
    "Mise en application",
    "Récapitulatif",
  ];
  return Array.from({ length: count }, (_, i) => ({
    id: `lesson-${seed}-${i}`,
    title: `${segments[i % segments.length]} — ${courseTitle.split(" ").slice(0, 3).join(" ")}`,
    duration: `${4 + ((i + seed) % 12)} min`,
    type: i % 4 === 3 ? "practice" : i % 3 === 0 ? "reading" : "video",
    completed: false,
    preview: "Une session courte, dense et actionable, à appliquer dès la fin du visionnage.",
  }));
}

/* ------------------------------------------------------------------ */
/*  Parcours build                                                    */
/* ------------------------------------------------------------------ */
function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

let courseSeed = 0;
export const parcours: Parcours[] = BLUEPRINTS.map((bp, pIdx) => {
  const id = `parcours-${pIdx + 1}`;
  const courses: Course[] = bp.modules.map((mod, mIdx) => {
    courseSeed += 1;
    const lessonsCount = 4 + (mIdx % 4);
    return {
      id: `course-${id}-${mIdx + 1}`,
      parcoursId: id,
      title: mod,
      description: `Module ${mIdx + 1} du parcours « ${bp.title} ». Découvre les méthodes, exemples et exercices pour passer à l'action immédiatement.`,
      objectives: [
        `Comprendre les fondamentaux : ${mod}`,
        "Identifier les codes VSM applicables",
        "Produire un livrable concret",
        "Évaluer ta progression via le quiz",
      ],
      cover: img(courseSeed, 800),
      videoPoster: img(courseSeed + 3, 1200),
      duration: `${18 + ((courseSeed * 7) % 32)} min`,
      difficulty: bp.difficulty,
      lessons: makeLessons(mod, lessonsCount, courseSeed),
      quiz: makeQuiz(mod, courseSeed),
      mission: makeMission(courseSeed, 120 + (courseSeed % 5) * 40),
      downloads: [
        { id: `dl-${courseSeed}-1`, label: "Checklist du module", format: "PDF", size: "320 Ko" },
        { id: `dl-${courseSeed}-2`, label: "Template Canva", format: "Canva", size: "Lien" },
        { id: `dl-${courseSeed}-3`, label: "Script de tournage", format: "DOCX", size: "180 Ko" },
      ],
      rating: 4.5 + ((courseSeed % 5) * 0.1),
      studentCount: 80 + ((courseSeed * 37) % 920),
    };
  });

  const totalMinutes = courses.reduce((acc, c) => acc + parseInt(c.duration, 10), 0);
  return {
    id,
    slug: slugify(bp.title),
    number: pIdx + 1,
    title: bp.title,
    tagline: bp.tagline,
    description: bp.description,
    cover: img(pIdx + 1, 1200),
    hours: Math.max(1, Math.round(totalMinutes / 60)),
    difficulty: bp.difficulty,
    certificateTitle: `Certificat ${bp.title}`,
    badge: bp.badge,
    courses,
  };
});

export const allCourses: Course[] = parcours.flatMap((p) => p.courses);

/* ------------------------------------------------------------------ */
/*  Badges, levels, resources, certificates                           */
/* ------------------------------------------------------------------ */
export const tiers: { tier: LevelTier; color: string; min: number }[] = [
  { tier: "Bronze", color: "#B07A3A", min: 0 },
  { tier: "Silver", color: "#C9CDD4", min: 1000 },
  { tier: "Gold", color: "#E6B73C", min: 2500 },
  { tier: "Diamond", color: "#8AD7E6", min: 5000 },
  { tier: "Elite", color: "#A06CFF", min: 8500 },
  { tier: "Legend", color: "#E51C23", min: 12500 },
];

export const badges: BadgeDef[] = [
  { id: "b1", name: "Créateur", description: "10 contenus publiés", icon: "Camera", tier: "Bronze", unlocked: true },
  { id: "b2", name: "Leader", description: "Encadre 3 ambassadeurs", icon: "Crown", tier: "Silver", unlocked: true },
  { id: "b3", name: "Expert Instagram", description: "Parcours Instagram terminé", icon: "Instagram", tier: "Gold", unlocked: true },
  { id: "b4", name: "Expert Facebook", description: "Parcours Facebook terminé", icon: "Facebook", tier: "Gold", unlocked: false },
  { id: "b5", name: "Storyteller", description: "5 stories validées par la marque", icon: "BookOpen", tier: "Silver", unlocked: true },
  { id: "b6", name: "Top Communicator", description: "Quiz Communication 100%", icon: "Mic", tier: "Gold", unlocked: false },
  { id: "b7", name: "Top Ambassador", description: "Top 10 du classement mensuel", icon: "Trophy", tier: "Diamond", unlocked: false },
  { id: "b8", name: "Community Builder", description: "Anime un groupe local", icon: "Users", tier: "Diamond", unlocked: false },
  { id: "b9", name: "VSM Expert", description: "Tous les parcours fondamentaux", icon: "ShieldCheck", tier: "Elite", unlocked: false },
  { id: "b10", name: "Content Master", description: "100 contenus publiés", icon: "Sparkles", tier: "Legend", unlocked: false },
];

const RES_CATS: ResourceCategory[] = [
  "Scripts",
  "Templates Canva",
  "Calendriers éditoriaux",
  "Guides Instagram",
  "Guides Facebook",
  "Guides TikTok",
  "Brand Kit VSM",
  "Photos",
  "Vidéos",
  "Icônes",
  "Mockups",
];

const RES_TITLES = [
  "Script Reel — Lancement collection",
  "Template Canva — Carrousel storytelling",
  "Calendrier éditorial 30 jours",
  "Guide Instagram — Algorithme 2026",
  "Guide Facebook — Pages premium",
  "Guide TikTok — Hooks qui convertissent",
  "Brand Kit VSM — Logos officiels",
  "Pack 25 photos lifestyle VSM",
  "Vidéos B-roll urbain",
  "Icônes UI streetwear",
  "Mockups t-shirt premium",
  "Script vidéo UGC 30s",
  "Template Canva — Story produit",
  "Calendrier éditorial saison Renescentia",
];

export const resources: Resource[] = Array.from({ length: 60 }, (_, i) => ({
  id: `res-${i + 1}`,
  title: RES_TITLES[i % RES_TITLES.length] + (i >= RES_TITLES.length ? ` — V${Math.floor(i / RES_TITLES.length) + 1}` : ""),
  category: RES_CATS[i % RES_CATS.length],
  format: (["PDF", "Canva", "ZIP", "MP4", "PNG", "DOCX"] as const)[i % 6],
  size: `${1 + (i % 9)}.${i % 10} Mo`,
  downloads: 40 + ((i * 31) % 1800),
  cover: img(i, 600),
}));

export const certificateRecords: CertificateRecord[] = parcours.slice(0, 7).map((p, i) => ({
  id: `cert-${i + 1}`,
  parcoursTitle: p.title,
  ambassadorName: "Joel Mbuyi",
  date: `${10 + i}/0${1 + (i % 9)}/2026`,
  serial: `VSM-CERT-${(20250 + i).toString()}`,
  signature: "Christ Mbuyi · CEO VSM Collection",
}));

/* ------------------------------------------------------------------ */
/*  Selectors (Supabase swap surface)                                 */
/* ------------------------------------------------------------------ */
export const academyApi = {
  getParcours: async () => parcours,
  getParcoursById: async (id: string) => parcours.find((p) => p.id === id) ?? null,
  getCourseById: async (id: string) => allCourses.find((c) => c.id === id) ?? null,
  getResources: async () => resources,
  getBadges: async () => badges,
  getCertificates: async () => certificateRecords,
};

export function findCourse(id: string): { course: Course; parcours: Parcours } | null {
  for (const p of parcours) {
    const c = p.courses.find((x) => x.id === id);
    if (c) return { course: c, parcours: p };
  }
  return null;
}
