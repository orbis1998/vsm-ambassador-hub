import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useRef, useMemo } from "react";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ClipboardList,
  Download,
  FileText,
  Heart,
  ListChecks,
  MessageSquare,
  NotebookPen,
  PlayCircle,
  Target,
  Clock,
  Sparkles,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { useAcademyStore } from "@/lib/academy-store";
import { useCourseWithParcours, useAcademyMutations } from "@/hooks/use-academy";
import { VideoPlayer } from "@/components/video-player";
import { QuizRunner } from "@/components/quiz-runner";
import { CourseRating } from "@/components/course-rating";
import { useAuth } from "@/providers/auth-provider";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/academie/cours/$id")({
  component: CoursePage,
});

type Tab = "overview" | "lessons" | "downloads" | "quiz" | "mission" | "notes" | "comments";

function CoursePage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { data: ctx, isLoading, isError } = useCourseWithParcours(id);
  const { state, toggleFavorite, logHistory, setProgress, setNote, toggleLesson, saveQuizScore } = useAcademyStore();
  const { rateCourse } = useAcademyMutations();
  const videoSectionRef = useRef<HTMLDivElement>(null);
  const historyLoggedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!ctx?.course) return;
    if (historyLoggedRef.current === ctx.course.id) return;
    historyLoggedRef.current = ctx.course.id;
    logHistory(ctx.course.id);
  }, [ctx?.course?.id, ctx?.course, logHistory]);

  const [tab, setTab] = useState<Tab>("overview");
  const [activeVideo, setActiveVideo] = useState<{ src: string; label: string } | null>(null);

  const course = ctx?.course;
  const defaultVideo = useMemo(() => {
    if (!course) return { src: null as string | null, label: "" };
    const lessonWithVideo = course.lessons.find((l) => l.videoUrl);
    return {
      src: course.videoUrl ?? lessonWithVideo?.videoUrl ?? null,
      label: lessonWithVideo?.title ?? course.title,
    };
  }, [course]);

  useEffect(() => {
    if (!course) return;
    setActiveVideo(defaultVideo.src ? { src: defaultVideo.src, label: defaultVideo.label } : null);
  }, [course?.id, defaultVideo.src, defaultVideo.label, course]);

  if (isLoading) {
    return (
      <div className="grid min-h-[40vh] place-items-center">
        <Loader2 className="h-8 w-8 animate-spin text-vsm-red" />
      </div>
    );
  }

  if (isError || !ctx) {
    return (
      <div className="grid place-items-center p-12 text-center">
        <p className="text-muted-foreground">Cours introuvable.</p>
        <Link to="/academie" className="mt-3 text-sm font-semibold text-vsm-red">
          Retour à l&apos;Académie
        </Link>
      </div>
    );
  }

  const { parcours } = ctx;
  const idx = parcours.courses.findIndex((c) => c.id === course.id);
  const next = parcours.courses[idx + 1];
  const isFav = state.favorites.includes(course.id);
  const completedLessons = state.completedLessons[course.id] ?? [];
  const lessonPct = course.lessons.length
    ? Math.round((completedLessons.length / course.lessons.length) * 100)
    : 0;
  const note = state.notes[course.id] ?? "";
  const progress = state.progress[course.id] ?? 0;

  const videoSrc = activeVideo?.src ?? defaultVideo.src;
  const videoLabel = activeVideo?.label ?? defaultVideo.label;

  function playLessonVideo(lessonId: string) {
    const lesson = course.lessons.find((l) => l.id === lessonId);
    if (!lesson?.videoUrl) return;
    setActiveVideo({ src: lesson.videoUrl, label: lesson.title });
    setTab("overview");
    videoSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function handleVideoComplete() {
    void setProgress(course.id, Math.max(progress, 60));
  }

  function handleQuizPass(pct: number) {
    void saveQuizScore(course.quiz.id, pct);
    void setProgress(course.id, 100);
  }

  return (
    <div className="mx-auto min-w-0 max-w-7xl space-y-4 overflow-x-hidden sm:space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3">
        <Link
          to="/academie/parcours/$id"
          params={{ id: parcours.id }}
          className="inline-flex max-w-full items-center gap-1.5 truncate text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{parcours.title}</span>
        </Link>
        <div className="flex items-center gap-2">
          <button
            onClick={() => void toggleFavorite(course.id)}
            className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition ${
              isFav
                ? "border-vsm-red bg-vsm-red/15 text-vsm-red"
                : "border-border bg-surface hover:bg-surface-elevated"
            }`}
          >
            <Heart className={`h-4 w-4 ${isFav ? "fill-vsm-red" : ""}`} /> {isFav ? "Favori" : "Ajouter aux favoris"}
          </button>
        </div>
      </div>

      <div className="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,280px)] lg:gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,320px)]">
        <div className="min-w-0 space-y-4 sm:space-y-6">
          <div ref={videoSectionRef} className="min-w-0 scroll-mt-20">
            <VideoPlayer
              key={videoSrc ?? course.id}
              src={videoSrc}
              poster={course.videoPoster}
              title={videoLabel}
              onComplete={handleVideoComplete}
              nextLabel={next?.title}
              onNext={
                next
                  ? () => navigate({ to: "/academie/cours/$id", params: { id: next.id } })
                  : undefined
              }
            />
          </div>

          {/* Progression mobile — visible sans sidebar */}
          <div className="rounded-2xl border border-border bg-surface p-4 lg:hidden">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Progression</p>
                <p className="font-display text-2xl font-bold">{progress}%</p>
              </div>
              <div className="grid shrink-0 grid-cols-2 gap-2 text-center text-xs">
                <div className="rounded-lg bg-background/60 px-3 py-2">
                  <p className="text-muted-foreground">Leçons</p>
                  <p className="font-bold">{completedLessons.length}/{course.lessons.length}</p>
                </div>
                <div className="rounded-lg bg-background/60 px-3 py-2">
                  <p className="text-muted-foreground">Quiz</p>
                  <p className="font-bold">{state.quizScores[course.quiz.id] ?? 0}%</p>
                </div>
              </div>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-background">
              <div className="h-full rounded-full bg-gradient-to-r from-vsm-red to-vsm-red-glow shadow-glow-red" style={{ width: `${progress}%` }} />
            </div>
          </div>

          <header className="min-w-0">
            <p className="truncate text-xs uppercase tracking-[0.2em] text-vsm-red">
              {parcours.title} · Module {idx + 1}/{parcours.courses.length}
            </p>
            <h1 className="mt-1 break-words font-display text-xl font-bold uppercase tracking-wide sm:text-2xl md:text-3xl">{course.title}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" />{course.duration}</span>
              <span>·</span>
              <span>{course.difficulty}</span>
              <span>·</span>
              <span>{course.studentCount} inscrit{course.studentCount !== 1 ? "s" : ""}</span>
              <span>·</span>
              <span>
                {course.ratingCount > 0 ? `★ ${(course.rating ?? 0).toFixed(1)} (${course.ratingCount} avis)` : "Pas encore noté"}
              </span>
            </div>
          </header>

          <CourseRating
            avgRating={course.rating ?? 0}
            reviewCount={course.ratingCount ?? 0}
            myRating={course.myRating ?? null}
            disabled={!profile?.userId}
            onRate={(stars) => {
              void rateCourse({ courseId: course.id, stars })
                .then(() => toast.success("Note enregistrée"))
                .catch(() => toast.error("Impossible d'enregistrer la note"));
            }}
          />

          {/* Tabs */}
          <nav className="flex gap-1 overflow-x-auto overscroll-x-contain border-b border-border [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {([
              ["overview", "Aperçu", BookOpen],
              ["lessons", "Leçons", ListChecks],
              ["downloads", "Ressources", Download],
              ["quiz", "Quiz", ClipboardList],
              ["mission", "Mission", Target],
              ["notes", "Notes", NotebookPen],
              ["comments", "Commentaires", MessageSquare],
            ] as const).map(([key, label, Icon]) => (
              <button
                key={key}
                type="button"
                onClick={() => setTab(key)}
                className={`relative -mb-px inline-flex shrink-0 items-center gap-1.5 px-2.5 py-2 text-[10px] font-semibold uppercase tracking-wider transition sm:gap-2 sm:px-3 sm:text-xs ${
                  tab === key
                    ? "text-vsm-red"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
                {tab === key && (
                  <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-vsm-red shadow-glow-red" />
                )}
              </button>
            ))}
          </nav>

          <div className="space-y-4">
            {tab === "overview" && (
              <div className="space-y-4">
                <div className="rounded-2xl border border-border bg-surface p-5">
                  <h3 className="font-display text-base font-bold uppercase tracking-wide">Description</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{course.description}</p>
                </div>
                <div className="rounded-2xl border border-border bg-surface p-5">
                  <h3 className="font-display text-base font-bold uppercase tracking-wide">Objectifs</h3>
                  <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                    {course.objectives.map((o) => (
                      <li key={o} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-vsm-red" />
                        <span>{o}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {tab === "lessons" && (
              <div className="overflow-hidden rounded-2xl border border-border bg-surface">
                <div className="flex items-center justify-between px-5 py-3 text-xs uppercase tracking-wider text-muted-foreground">
                  <span>Plan du cours</span>
                  <span className="font-semibold text-foreground">{lessonPct}% complété</span>
                </div>
                <ul className="divide-y divide-border">
                  {course.lessons.map((l, i) => {
                    const ok = completedLessons.includes(l.id);
                    const isActive = l.videoUrl && activeVideo?.src === l.videoUrl;
                    return (
                      <li key={l.id} className="flex items-center gap-3 px-4 py-3 sm:px-5">
                        <button
                          onClick={() => void toggleLesson(course.id, l.id)}
                          className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border transition ${
                            ok ? "border-vsm-red bg-vsm-red text-white" : "border-border text-muted-foreground"
                          }`}
                        >
                          {ok ? <CheckCircle2 className="h-4 w-4" /> : <span className="text-[10px] font-mono">{i + 1}</span>}
                        </button>
                        <button
                          type="button"
                          onClick={() => (l.videoUrl ? playLessonVideo(l.id) : void toggleLesson(course.id, l.id))}
                          className={`min-w-0 flex-1 text-left ${l.videoUrl ? "cursor-pointer" : ""}`}
                        >
                          <p className={`truncate text-sm font-medium ${ok ? "text-muted-foreground line-through" : ""} ${isActive ? "text-vsm-red" : ""}`}>
                            {l.title}
                          </p>
                          <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                            {l.type} · {l.duration}
                            {l.videoUrl ? " · Lire la vidéo" : ""}
                          </p>
                        </button>
                        {l.videoUrl ? (
                          <button
                            type="button"
                            onClick={() => playLessonVideo(l.id)}
                            className={`shrink-0 rounded-full p-1 ${isActive ? "text-vsm-red" : "text-muted-foreground"}`}
                            aria-label={`Lire ${l.title}`}
                          >
                            <PlayCircle className="h-4 w-4" />
                          </button>
                        ) : (
                          <PlayCircle className="h-4 w-4 shrink-0 text-muted-foreground/40" />
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {tab === "downloads" && (
              <div className="grid gap-3 sm:grid-cols-2">
                {course.downloads.map((d) => (
                  <button
                    key={d.id}
                    className="flex items-center gap-3 rounded-xl border border-border bg-surface p-4 text-left transition hover:border-vsm-red/50"
                  >
                    <span className="grid h-10 w-10 place-items-center rounded-lg bg-vsm-red/15 text-vsm-red">
                      <FileText className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{d.label}</p>
                      <p className="text-xs text-muted-foreground">{d.format} · {d.size}</p>
                    </div>
                    <Download className="h-4 w-4 text-muted-foreground" />
                  </button>
                ))}
              </div>
            )}

            {tab === "quiz" && (
              <QuizRunner quiz={course.quiz} onPass={handleQuizPass} />
            )}

            {tab === "mission" && (
              <div className="rounded-2xl border border-border bg-gradient-to-br from-surface to-surface-elevated p-6">
                <div className="flex items-start gap-4">
                  <span className="grid h-12 w-12 place-items-center rounded-xl bg-vsm-red/15 text-vsm-red">
                    <Target className="h-5 w-5" />
                  </span>
                  <div className="flex-1">
                    <p className="text-xs uppercase tracking-[0.2em] text-vsm-red">Mission pratique</p>
                    <h3 className="font-display text-xl font-bold uppercase tracking-wide">{course.mission.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{course.mission.description}</p>
                    <div className="mt-3 rounded-lg border border-border bg-background/60 p-3 text-sm">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Exemple</p>
                      <p className="mt-1">{course.mission.example}</p>
                    </div>
                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      <span className="inline-flex items-center gap-1 rounded-full bg-vsm-red/15 px-3 py-1 text-xs font-semibold text-vsm-red">
                        <Sparkles className="h-3 w-3" /> +{course.mission.reward} XP
                      </span>
                      <button className="rounded-lg bg-vsm-red px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white shadow-glow-red hover:brightness-110">
                        Soumettre ma livraison
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {tab === "notes" && (
              <div className="rounded-2xl border border-border bg-surface p-5">
                <p className="mb-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">Tes notes personnelles</p>
                <textarea
                  value={note}
                  onChange={(e) => setNote(course.id, e.target.value)}
                  rows={8}
                  placeholder="Capture les idées clés, citations, actions à mener…"
                  className="w-full resize-none rounded-lg border border-border bg-background p-3 text-base focus:border-vsm-red focus:outline-none focus:ring-1 focus:ring-vsm-red md:text-sm"
                />
                <p className="mt-2 text-[11px] text-muted-foreground">Sauvegarde automatique.</p>
              </div>
            )}

            {tab === "comments" && (
              <div className="rounded-2xl border border-dashed border-border bg-surface p-10 text-center">
                <MessageSquare className="mx-auto h-8 w-8 text-muted-foreground" />
                <p className="mt-3 text-sm text-muted-foreground">Les commentaires de cours arrivent bientôt.</p>
                <p className="mt-1 text-xs text-muted-foreground">Utilisez les notes ci-dessus pour partager votre avis.</p>
              </div>
            )}
          </div>
        </div>

        <aside className="hidden min-w-0 space-y-4 lg:block lg:sticky lg:top-20 lg:self-start">
          <div className="rounded-2xl border border-border bg-surface p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Progression du cours</p>
            <p className="mt-1 font-display text-3xl font-bold">{progress}%</p>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-background">
              <div className="h-full rounded-full bg-gradient-to-r from-vsm-red to-vsm-red-glow shadow-glow-red" style={{ width: `${progress}%` }} />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 text-center text-xs">
              <div className="rounded-lg bg-background/60 p-2">
                <p className="text-muted-foreground">Leçons</p>
                <p className="font-bold">{completedLessons.length}/{course.lessons.length}</p>
              </div>
              <div className="rounded-lg bg-background/60 p-2">
                <p className="text-muted-foreground">Quiz</p>
                <p className="font-bold">{state.quizScores[course.quiz.id] ?? 0}%</p>
              </div>
            </div>
          </div>

          {next && (
            <Link
              to="/academie/cours/$id"
              params={{ id: next.id }}
              className="group flex items-center gap-3 rounded-2xl border border-border bg-surface p-4 transition hover:border-vsm-red/50"
            >
              <img src={next.cover} alt="" className="h-14 w-20 rounded-md object-cover" />
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Cours suivant</p>
                <p className="truncate text-sm font-semibold">{next.title}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-vsm-red transition-transform group-hover:translate-x-0.5" />
            </Link>
          )}

          <div className="rounded-2xl border border-border bg-surface p-5">
            <p className="mb-3 text-xs uppercase tracking-[0.2em] text-muted-foreground">Plan du parcours</p>
            <ul className="space-y-1.5">
              {parcours.courses.map((c, i) => {
                const active = c.id === course.id;
                return (
                  <li key={c.id}>
                    <Link
                      to="/academie/cours/$id"
                      params={{ id: c.id }}
                      className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-xs ${
                        active ? "bg-vsm-red/15 text-foreground" : "text-muted-foreground hover:bg-surface-elevated hover:text-foreground"
                      }`}
                    >
                      <span className="w-5 text-right font-mono">{(i + 1).toString().padStart(2, "0")}</span>
                      <span className="truncate flex-1">{c.title}</span>
                      {(state.progress[c.id] ?? 0) >= 100 && <CheckCircle2 className="h-3.5 w-3.5 text-vsm-red" />}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
