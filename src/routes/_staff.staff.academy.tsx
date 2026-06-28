import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Loader2, Plus, Trash2, Pencil, Check } from "lucide-react";
import { toast } from "sonner";
import { useIsBrowser } from "@/hooks/use-is-browser";
import {
  adminDeleteCourse,
  adminDeleteLesson,
  adminDeleteOpportunity,
  adminDeleteQuiz,
  adminFetchAllCourses,
  adminFetchChallenges,
  adminFetchLessons,
  adminFetchOpportunities,
  adminFetchQuizzes,
  adminFetchResources,
  adminUpsertChallenge,
  adminUpsertCourse,
  adminUpsertLesson,
  adminUpsertOpportunity,
  adminUpsertQuiz,
  adminUpsertResource,
  type AdminCourseRow,
  type AdminLessonRow,
} from "@/services/admin-academy.service";

export const Route = createFileRoute("/_staff/staff/academy")({
  ssr: false,
  component: StaffAcademyPage,
});

type Tab = "courses" | "lessons" | "challenges" | "resources" | "opportunities" | "quizzes";

function StaffAcademyPage() {
  const browser = useIsBrowser();
  const [tab, setTab] = useState<Tab>("courses");
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const qc = useQueryClient();

  const { data: courses = [], isLoading } = useQuery({ queryKey: ["admin-courses"], queryFn: adminFetchAllCourses, enabled: browser });
  const { data: lessons = [] } = useQuery({
    queryKey: ["admin-lessons", selectedCourseId],
    queryFn: () => adminFetchLessons(selectedCourseId!),
    enabled: browser && !!selectedCourseId && tab === "lessons",
  });
  const { data: challenges = [] } = useQuery({ queryKey: ["admin-challenges"], queryFn: adminFetchChallenges, enabled: browser && tab === "challenges" });
  const { data: resources = [] } = useQuery({ queryKey: ["admin-resources"], queryFn: adminFetchResources, enabled: browser && tab === "resources" });
  const { data: opportunities = [] } = useQuery({ queryKey: ["admin-opportunities"], queryFn: adminFetchOpportunities, enabled: browser && tab === "opportunities" });
  const { data: quizzes = [] } = useQuery({
    queryKey: ["admin-quizzes", selectedCourseId],
    queryFn: () => adminFetchQuizzes(selectedCourseId ?? undefined),
    enabled: browser && tab === "quizzes",
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["admin-courses"] });
    qc.invalidateQueries({ queryKey: ["admin-lessons"] });
    qc.invalidateQueries({ queryKey: ["admin-challenges"] });
    qc.invalidateQueries({ queryKey: ["admin-resources"] });
    qc.invalidateQueries({ queryKey: ["admin-opportunities"] });
    qc.invalidateQueries({ queryKey: ["admin-quizzes"] });
  };

  const tabs: { k: Tab; label: string }[] = [
    { k: "courses", label: "Formations" },
    { k: "lessons", label: "Leçons" },
    { k: "challenges", label: "Défis" },
    { k: "resources", label: "Ressources" },
    { k: "opportunities", label: "Opportunités" },
    { k: "quizzes", label: "Quiz" },
  ];

  if (isLoading) {
    return (
      <div className="grid min-h-[40vh] place-items-center">
        <Loader2 className="h-8 w-8 animate-spin text-vsm-red" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header>
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-vsm-red">Academy</p>
        <h1 className="font-display text-3xl font-bold uppercase tracking-wide">Gestion des formations</h1>
      </header>

      <div className="flex flex-wrap gap-1 rounded-xl border border-border bg-surface p-1">
        {tabs.map((t) => (
          <button
            key={t.k}
            onClick={() => setTab(t.k)}
            className={`rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-wider ${tab === t.k ? "bg-vsm-red text-white" : "text-muted-foreground"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "courses" && <CoursesPanel courses={courses} onSaved={invalidate} />}
      {tab === "lessons" && (
        <LessonsPanel
          courses={courses.filter((c) => !c.is_parcours)}
          selectedCourseId={selectedCourseId}
          onSelectCourse={setSelectedCourseId}
          lessons={lessons}
          onSaved={invalidate}
        />
      )}
      {tab === "challenges" && <ChallengesPanel challenges={challenges} onSaved={invalidate} />}
      {tab === "resources" && <ResourcesPanel resources={resources} onSaved={invalidate} />}
      {tab === "opportunities" && <OpportunitiesPanel opportunities={opportunities} onSaved={invalidate} />}
      {tab === "quizzes" && (
        <QuizzesPanel
          courses={courses.filter((c) => !c.is_parcours)}
          selectedCourseId={selectedCourseId}
          onSelectCourse={setSelectedCourseId}
          quizzes={quizzes}
          onSaved={invalidate}
        />
      )}
    </div>
  );
}

function CoursesPanel({ courses, onSaved }: { courses: AdminCourseRow[]; onSaved: () => void }) {
  const [editing, setEditing] = useState<Partial<AdminCourseRow> | null>(null);

  const save = useMutation({
    mutationFn: () =>
      adminUpsertCourse({
        id: editing!.id,
        slug: editing!.slug || slugify(editing!.title || ""),
        title: editing!.title!,
        description: editing!.description,
        category: editing!.category,
        difficulty: editing!.difficulty,
        cover_url: editing!.cover_url,
        is_published: editing!.is_published,
        is_parcours: editing!.is_parcours,
        parent_parcours_id: editing!.parent_parcours_id,
        sort_order: editing!.sort_order,
        reward_xp: editing!.reward_xp,
      }),
    onSuccess: () => {
      toast.success("Formation enregistrée");
      setEditing(null);
      onSaved();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Erreur"),
  });

  const remove = useMutation({
    mutationFn: (id: string) => adminDeleteCourse(id),
    onSuccess: () => { toast.success("Supprimé"); onSaved(); },
  });

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={() => setEditing({ title: "", slug: "", is_published: false, is_parcours: false, sort_order: courses.length })}
        className="inline-flex items-center gap-2 rounded-lg bg-vsm-red px-4 py-2 text-xs font-bold uppercase text-white"
      >
        <Plus className="h-4 w-4" /> Nouvelle formation
      </button>

      {editing && (
        <FormCard title={editing.id ? "Modifier" : "Créer"} onClose={() => setEditing(null)}>
          <Field label="Titre" value={editing.title ?? ""} onChange={(v) => setEditing({ ...editing, title: v })} />
          <Field label="Slug" value={editing.slug ?? ""} onChange={(v) => setEditing({ ...editing, slug: v })} />
          <Field label="Description" value={editing.description ?? ""} onChange={(v) => setEditing({ ...editing, description: v })} multiline />
          <Field label="Cover URL" value={editing.cover_url ?? ""} onChange={(v) => setEditing({ ...editing, cover_url: v })} />
          <div className="flex flex-wrap gap-4">
            <Toggle label="Publié" checked={!!editing.is_published} onChange={(v) => setEditing({ ...editing, is_published: v })} />
            <Toggle label="Parcours" checked={!!editing.is_parcours} onChange={(v) => setEditing({ ...editing, is_parcours: v })} />
          </div>
          <button type="button" disabled={save.isPending} onClick={() => void save.mutate()} className="rounded-lg bg-vsm-red px-4 py-2 text-xs font-bold uppercase text-white">
            {save.isPending ? "…" : "Enregistrer"}
          </button>
        </FormCard>
      )}

      <div className="space-y-2">
        {courses.map((c) => (
          <div key={c.id} className="flex items-center justify-between rounded-xl border border-border bg-surface p-4">
            <div>
              <p className="font-semibold">{c.title}</p>
              <p className="text-xs text-muted-foreground">
                {c.slug} · {c.is_parcours ? "Parcours" : "Cours"} · {c.is_published ? "Publié" : "Brouillon"} · {c.lesson_count} leçons
              </p>
            </div>
            <div className="flex gap-2">
              <IconBtn icon={Pencil} onClick={() => setEditing(c)} />
              <IconBtn icon={Trash2} danger onClick={() => void remove.mutate(c.id)} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function LessonsPanel({
  courses,
  selectedCourseId,
  onSelectCourse,
  lessons,
  onSaved,
}: {
  courses: AdminCourseRow[];
  selectedCourseId: string | null;
  onSelectCourse: (id: string) => void;
  lessons: AdminLessonRow[];
  onSaved: () => void;
}) {
  const [editing, setEditing] = useState<Partial<AdminLessonRow> | null>(null);

  const save = useMutation({
    mutationFn: () =>
      adminUpsertLesson({
        id: editing!.id,
        course_id: selectedCourseId!,
        title: editing!.title!,
        position: editing!.position ?? lessons.length + 1,
        description: editing!.description,
        video_url: editing!.video_url,
        content_md: editing!.content_md,
      }),
    onSuccess: () => { toast.success("Leçon enregistrée"); setEditing(null); onSaved(); },
  });

  const remove = useMutation({
    mutationFn: (id: string) => adminDeleteLesson(id),
    onSuccess: () => { toast.success("Leçon supprimée"); onSaved(); },
  });

  return (
    <div className="space-y-4">
      <select
        value={selectedCourseId ?? ""}
        onChange={(e) => onSelectCourse(e.target.value)}
        className="h-10 rounded-lg border border-border bg-background px-3 text-sm"
      >
        <option value="">Choisir un cours…</option>
        {courses.map((c) => (
          <option key={c.id} value={c.id}>{c.title}</option>
        ))}
      </select>

      {selectedCourseId && (
        <>
          <button
            type="button"
            onClick={() => setEditing({ title: "", position: lessons.length + 1 })}
            className="inline-flex items-center gap-2 rounded-lg bg-vsm-red px-4 py-2 text-xs font-bold uppercase text-white"
          >
            <Plus className="h-4 w-4" /> Nouvelle leçon
          </button>

          {editing && (
            <FormCard title="Leçon" onClose={() => setEditing(null)}>
              <Field label="Titre" value={editing.title ?? ""} onChange={(v) => setEditing({ ...editing, title: v })} />
              <Field label="Position" value={String(editing.position ?? 1)} onChange={(v) => setEditing({ ...editing, position: Number(v) })} />
              <Field label="Vidéo URL" value={editing.video_url ?? ""} onChange={(v) => setEditing({ ...editing, video_url: v })} />
              <Field label="Contenu (markdown)" value={editing.content_md ?? ""} onChange={(v) => setEditing({ ...editing, content_md: v })} multiline />
              <button type="button" disabled={save.isPending} onClick={() => void save.mutate()} className="rounded-lg bg-vsm-red px-4 py-2 text-xs font-bold uppercase text-white">Enregistrer</button>
            </FormCard>
          )}

          <div className="space-y-2">
            {lessons.map((l) => (
              <div key={l.id} className="flex items-center justify-between rounded-xl border border-border bg-surface p-4">
                <div>
                  <p className="font-semibold">#{l.position} — {l.title}</p>
                </div>
                <div className="flex gap-2">
                  <IconBtn icon={Pencil} onClick={() => setEditing(l)} />
                  <IconBtn icon={Trash2} danger onClick={() => void remove.mutate(l.id)} />
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function ChallengesPanel({ challenges, onSaved }: { challenges: Awaited<ReturnType<typeof adminFetchChallenges>>; onSaved: () => void }) {
  const [editing, setEditing] = useState<Partial<(typeof challenges)[0]> | null>(null);

  const save = useMutation({
    mutationFn: () => adminUpsertChallenge({ ...editing!, title: editing!.title! }),
    onSuccess: () => { toast.success("Défi enregistré"); setEditing(null); onSaved(); },
  });

  return (
    <div className="space-y-4">
      <button type="button" onClick={() => setEditing({ title: "", goal: 1, reward_xp: 50, is_active: true })} className="inline-flex items-center gap-2 rounded-lg bg-vsm-red px-4 py-2 text-xs font-bold uppercase text-white">
        <Plus className="h-4 w-4" /> Nouveau défi
      </button>
      {editing && (
        <FormCard title="Défi" onClose={() => setEditing(null)}>
          <Field label="Titre" value={editing.title ?? ""} onChange={(v) => setEditing({ ...editing, title: v })} />
          <Field label="Description" value={editing.description ?? ""} onChange={(v) => setEditing({ ...editing, description: v })} multiline />
          <Field label="Objectif" value={String(editing.goal ?? 1)} onChange={(v) => setEditing({ ...editing, goal: Number(v) })} />
          <Field label="XP récompense" value={String(editing.reward_xp ?? 50)} onChange={(v) => setEditing({ ...editing, reward_xp: Number(v) })} />
          <Toggle label="Actif" checked={!!editing.is_active} onChange={(v) => setEditing({ ...editing, is_active: v })} />
          <button type="button" onClick={() => void save.mutate()} className="rounded-lg bg-vsm-red px-4 py-2 text-xs font-bold uppercase text-white">Enregistrer</button>
        </FormCard>
      )}
      {challenges.map((c) => (
        <div key={c.id} className="flex items-center justify-between rounded-xl border border-border bg-surface p-4">
          <div>
            <p className="font-semibold">{c.title}</p>
            <p className="text-xs text-muted-foreground">{c.type} · objectif {c.goal} · +{c.reward_xp} XP · {c.is_active ? "Actif" : "Inactif"}</p>
          </div>
          <IconBtn icon={Pencil} onClick={() => setEditing(c)} />
        </div>
      ))}
    </div>
  );
}

function ResourcesPanel({ resources, onSaved }: { resources: Awaited<ReturnType<typeof adminFetchResources>>; onSaved: () => void }) {
  const [editing, setEditing] = useState<Partial<(typeof resources)[0]> | null>(null);
  const save = useMutation({
    mutationFn: () => adminUpsertResource({ ...editing!, title: editing!.title!, file_url: editing!.file_url! }),
    onSuccess: () => { toast.success("Ressource enregistrée"); setEditing(null); onSaved(); },
  });

  return (
    <div className="space-y-4">
      <button type="button" onClick={() => setEditing({ title: "", file_url: "", category: "template", is_published: true })} className="inline-flex items-center gap-2 rounded-lg bg-vsm-red px-4 py-2 text-xs font-bold uppercase text-white">
        <Plus className="h-4 w-4" /> Nouvelle ressource
      </button>
      {editing && (
        <FormCard title="Ressource" onClose={() => setEditing(null)}>
          <Field label="Titre" value={editing.title ?? ""} onChange={(v) => setEditing({ ...editing, title: v })} />
          <Field label="URL fichier" value={editing.file_url ?? ""} onChange={(v) => setEditing({ ...editing, file_url: v })} />
          <Field label="Catégorie" value={editing.category ?? "template"} onChange={(v) => setEditing({ ...editing, category: v })} />
          <Toggle label="Publié" checked={!!editing.is_published} onChange={(v) => setEditing({ ...editing, is_published: v })} />
          <button type="button" onClick={() => void save.mutate()} className="rounded-lg bg-vsm-red px-4 py-2 text-xs font-bold uppercase text-white">Enregistrer</button>
        </FormCard>
      )}
      {resources.map((r) => (
        <div key={r.id} className="flex items-center justify-between rounded-xl border border-border bg-surface p-4">
          <div>
            <p className="font-semibold">{r.title}</p>
            <p className="text-xs text-muted-foreground">{r.category} · {r.is_published ? "Publié" : "Masqué"}</p>
          </div>
          <IconBtn icon={Pencil} onClick={() => setEditing(r)} />
        </div>
      ))}
    </div>
  );
}

function OpportunitiesPanel({ opportunities, onSaved }: { opportunities: Awaited<ReturnType<typeof adminFetchOpportunities>>; onSaved: () => void }) {
  const [editing, setEditing] = useState<Partial<(typeof opportunities)[0]> | null>(null);
  const save = useMutation({
    mutationFn: () => adminUpsertOpportunity({ ...editing!, title: editing!.title!, category: editing!.category! }),
    onSuccess: () => { toast.success("Opportunité enregistrée"); setEditing(null); onSaved(); },
  });
  const remove = useMutation({
    mutationFn: (id: string) => adminDeleteOpportunity(id),
    onSuccess: () => { toast.success("Supprimée"); onSaved(); },
  });

  return (
    <div className="space-y-4">
      <button type="button" onClick={() => setEditing({ title: "", category: "Événement", status: "open", is_published: true, slots: 1 })} className="inline-flex items-center gap-2 rounded-lg bg-vsm-red px-4 py-2 text-xs font-bold uppercase text-white">
        <Plus className="h-4 w-4" /> Nouvelle opportunité
      </button>
      {editing && (
        <FormCard title="Opportunité" onClose={() => setEditing(null)}>
          <Field label="Titre" value={editing.title ?? ""} onChange={(v) => setEditing({ ...editing, title: v })} />
          <Field label="Catégorie" value={editing.category ?? ""} onChange={(v) => setEditing({ ...editing, category: v })} />
          <Field label="Description" value={editing.description ?? ""} onChange={(v) => setEditing({ ...editing, description: v })} multiline />
          <Field label="Récompense" value={editing.reward ?? ""} onChange={(v) => setEditing({ ...editing, reward: v })} />
          <Field label="Places" value={String(editing.slots ?? 1)} onChange={(v) => setEditing({ ...editing, slots: Number(v) })} />
          <select value={editing.status ?? "open"} onChange={(e) => setEditing({ ...editing, status: e.target.value })} className="h-10 rounded-lg border border-border bg-background px-3 text-sm">
            <option value="open">Ouvert</option>
            <option value="soon">Bientôt</option>
            <option value="closed">Fermé</option>
          </select>
          <Toggle label="Publié" checked={!!editing.is_published} onChange={(v) => setEditing({ ...editing, is_published: v })} />
          <button type="button" onClick={() => void save.mutate()} className="rounded-lg bg-vsm-red px-4 py-2 text-xs font-bold uppercase text-white">Enregistrer</button>
        </FormCard>
      )}
      {opportunities.map((o) => (
        <div key={o.id} className="flex items-center justify-between rounded-xl border border-border bg-surface p-4">
          <div>
            <p className="font-semibold">{o.title}</p>
            <p className="text-xs text-muted-foreground">{o.category} · {o.status} · {o.slots} places</p>
          </div>
          <div className="flex gap-2">
            <IconBtn icon={Pencil} onClick={() => setEditing(o)} />
            <IconBtn icon={Trash2} danger onClick={() => void remove.mutate(o.id)} />
          </div>
        </div>
      ))}
    </div>
  );
}

function QuizzesPanel({
  courses,
  selectedCourseId,
  onSelectCourse,
  quizzes,
  onSaved,
}: {
  courses: AdminCourseRow[];
  selectedCourseId: string | null;
  onSelectCourse: (id: string) => void;
  quizzes: Awaited<ReturnType<typeof adminFetchQuizzes>>;
  onSaved: () => void;
}) {
  const [editing, setEditing] = useState<Partial<(typeof quizzes)[0]> & { questionsJson?: string } | null>(null);

  const save = useMutation({
    mutationFn: () => {
      let questions: unknown = [];
      try {
        questions = JSON.parse(editing!.questionsJson || "[]");
      } catch {
        throw new Error("JSON des questions invalide");
      }
      return adminUpsertQuiz({
        id: editing!.id,
        course_id: selectedCourseId!,
        title: editing!.title!,
        passing_score: editing!.passing_score ?? 70,
        questions,
      });
    },
    onSuccess: () => { toast.success("Quiz enregistré"); setEditing(null); onSaved(); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Erreur"),
  });

  const remove = useMutation({
    mutationFn: (id: string) => adminDeleteQuiz(id),
    onSuccess: () => { toast.success("Quiz supprimé"); onSaved(); },
  });

  return (
    <div className="space-y-4">
      <select
        value={selectedCourseId ?? ""}
        onChange={(e) => onSelectCourse(e.target.value)}
        className="h-10 rounded-lg border border-border bg-background px-3 text-sm"
      >
        <option value="">Choisir un cours…</option>
        {courses.map((c) => (
          <option key={c.id} value={c.id}>{c.title}</option>
        ))}
      </select>

      {selectedCourseId && (
        <>
          <button
            type="button"
            onClick={() => setEditing({ title: "", passing_score: 70, questionsJson: "[]" })}
            className="inline-flex items-center gap-2 rounded-lg bg-vsm-red px-4 py-2 text-xs font-bold uppercase text-white"
          >
            <Plus className="h-4 w-4" /> Nouveau quiz
          </button>

          {editing && (
            <FormCard title="Quiz" onClose={() => setEditing(null)}>
              <Field label="Titre" value={editing.title ?? ""} onChange={(v) => setEditing({ ...editing, title: v })} />
              <Field label="Score minimum (%)" value={String(editing.passing_score ?? 70)} onChange={(v) => setEditing({ ...editing, passing_score: Number(v) })} />
              <Field
                label="Questions (JSON)"
                value={editing.questionsJson ?? JSON.stringify(editing.questions ?? [], null, 2)}
                onChange={(v) => setEditing({ ...editing, questionsJson: v })}
                multiline
              />
              <button type="button" disabled={save.isPending} onClick={() => void save.mutate()} className="rounded-lg bg-vsm-red px-4 py-2 text-xs font-bold uppercase text-white">Enregistrer</button>
            </FormCard>
          )}

          <div className="space-y-2">
            {quizzes.map((q) => (
              <div key={q.id} className="flex items-center justify-between rounded-xl border border-border bg-surface p-4">
                <div>
                  <p className="font-semibold">{q.title}</p>
                  <p className="text-xs text-muted-foreground">Seuil {q.passing_score}% · {Array.isArray(q.questions) ? q.questions.length : 0} questions</p>
                </div>
                <div className="flex gap-2">
                  <IconBtn
                    icon={Pencil}
                    onClick={() =>
                      setEditing({
                        ...q,
                        questionsJson: JSON.stringify(q.questions ?? [], null, 2),
                      })
                    }
                  />
                  <IconBtn icon={Trash2} danger onClick={() => void remove.mutate(q.id)} />
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function FormCard({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-vsm-red/30 bg-surface p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold">{title}</p>
        <button type="button" onClick={onClose} className="text-xs text-muted-foreground">Fermer</button>
      </div>
      {children}
    </div>
  );
}

function Field({ label, value, onChange, multiline }: { label: string; value: string; onChange: (v: string) => void; multiline?: boolean }) {
  const cls = "mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-vsm-red/50";
  return (
    <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
      {label}
      {multiline ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={3} className={cls} />
      ) : (
        <input value={value} onChange={(e) => onChange(e.target.value)} className={cls} />
      )}
    </label>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <button type="button" onClick={() => onChange(!checked)} className={`grid h-5 w-5 place-items-center rounded border ${checked ? "border-vsm-red bg-vsm-red text-white" : "border-border"}`}>
        {checked && <Check className="h-3 w-3" />}
      </button>
      {label}
    </label>
  );
}

function IconBtn({ icon: Icon, onClick, danger }: { icon: typeof Pencil; onClick: () => void; danger?: boolean }) {
  return (
    <button type="button" onClick={onClick} className={`grid h-8 w-8 place-items-center rounded-lg border ${danger ? "border-destructive/30 text-destructive" : "border-border text-muted-foreground hover:bg-accent"}`}>
      <Icon className="h-4 w-4" />
    </button>
  );
}

function slugify(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
