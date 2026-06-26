import { useState } from "react";
import { CheckCircle2, XCircle, RotateCcw, Trophy } from "lucide-react";
import type { Quiz } from "@/lib/academy-data";

interface Props {
  quiz: Quiz;
  onPass: (pct: number) => void;
}

export function QuizRunner({ quiz, onPass }: Props) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<number[][]>(quiz.questions.map(() => []));
  const [done, setDone] = useState(false);

  const q = quiz.questions[step];
  const total = quiz.questions.length;

  function toggle(idx: number) {
    setAnswers((a) => {
      const cur = a[step];
      let next: number[];
      if (q.kind === "single" || q.kind === "truefalse") next = [idx];
      else next = cur.includes(idx) ? cur.filter((x) => x !== idx) : [...cur, idx];
      const copy = [...a];
      copy[step] = next;
      return copy;
    });
  }

  function next() {
    if (step + 1 < total) setStep(step + 1);
    else {
      const correct = quiz.questions.filter((qq, i) => {
        const sel = [...answers[i]].sort().join(",");
        const ans = [...qq.answer].sort().join(",");
        return sel === ans;
      }).length;
      const pct = Math.round((correct / total) * 100);
      setDone(true);
      if (pct >= quiz.minScore) onPass(pct);
    }
  }

  function reset() {
    setStep(0);
    setAnswers(quiz.questions.map(() => []));
    setDone(false);
  }

  if (done) {
    const correct = quiz.questions.filter((qq, i) => {
      const sel = [...answers[i]].sort().join(",");
      const ans = [...qq.answer].sort().join(",");
      return sel === ans;
    }).length;
    const pct = Math.round((correct / total) * 100);
    const passed = pct >= quiz.minScore;
    return (
      <div className="relative overflow-hidden rounded-2xl border border-border bg-surface p-6 text-center">
        <div className={`absolute -top-20 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full blur-3xl ${passed ? "bg-vsm-red/30" : "bg-muted-foreground/20"}`} />
        <div className="relative">
          <div className={`mx-auto grid h-16 w-16 place-items-center rounded-2xl ${passed ? "bg-gradient-to-br from-vsm-red to-vsm-red-glow shadow-glow-red" : "bg-surface-elevated"}`}>
            <Trophy className={`h-7 w-7 ${passed ? "text-white" : "text-muted-foreground"}`} />
          </div>
          <h3 className="mt-4 font-display text-2xl font-bold uppercase tracking-wide">
            {passed ? "Quiz réussi !" : "Encore un effort"}
          </h3>
          <p className="mt-1 text-3xl font-bold text-vsm-red">{pct}%</p>
          <p className="text-xs text-muted-foreground">Score minimum requis : {quiz.minScore}%</p>

          <div className="mt-6 space-y-2 text-left">
            {quiz.questions.map((qq, i) => {
              const sel = answers[i];
              const ok = [...sel].sort().join(",") === [...qq.answer].sort().join(",");
              return (
                <details key={qq.id} className="rounded-lg border border-border bg-background/60 p-3">
                  <summary className="flex cursor-pointer items-center justify-between gap-3 text-sm">
                    <span className="flex items-center gap-2">
                      {ok ? <CheckCircle2 className="h-4 w-4 text-vsm-red" /> : <XCircle className="h-4 w-4 text-muted-foreground" />}
                      <span className="font-medium">{qq.prompt}</span>
                    </span>
                  </summary>
                  <div className="mt-3 space-y-1">
                    {qq.choices.map((c, idx) => {
                      const isAns = qq.answer.includes(idx);
                      const isSel = sel.includes(idx);
                      return (
                        <p
                          key={idx}
                          className={`rounded-md px-2 py-1 text-xs ${
                            isAns ? "bg-vsm-red/15 text-vsm-red" : isSel ? "bg-muted text-muted-foreground line-through" : "text-muted-foreground"
                          }`}
                        >
                          {c}
                        </p>
                      );
                    })}
                    <p className="mt-2 text-xs italic text-muted-foreground">{qq.explanation}</p>
                  </div>
                </details>
              );
            })}
          </div>

          <button
            onClick={reset}
            className="mt-6 inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-semibold hover:bg-surface-elevated"
          >
            <RotateCcw className="h-4 w-4" /> Recommencer le quiz
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-surface p-6">
      <div className="mb-4 flex items-center justify-between text-xs uppercase tracking-[0.2em] text-muted-foreground">
        <span>Question {step + 1} / {total}</span>
        <span>Minimum {quiz.minScore}%</span>
      </div>
      <div className="mb-4 h-1 overflow-hidden rounded-full bg-background">
        <div className="h-full rounded-full bg-gradient-to-r from-vsm-red to-vsm-red-glow transition-all" style={{ width: `${((step + 1) / total) * 100}%` }} />
      </div>

      <h3 className="text-lg font-semibold">{q.prompt}</h3>
      <p className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">
        {q.kind === "multiple" ? "Choix multiples" : q.kind === "truefalse" ? "Vrai ou Faux" : "Choix unique"}
      </p>

      <div className="mt-4 space-y-2">
        {q.choices.map((c, idx) => {
          const sel = answers[step].includes(idx);
          return (
            <button
              key={idx}
              onClick={() => toggle(idx)}
              className={`flex w-full items-center justify-between rounded-lg border px-4 py-3 text-left text-sm transition ${
                sel ? "border-vsm-red bg-vsm-red/10 text-foreground" : "border-border bg-background hover:bg-surface-elevated"
              }`}
            >
              <span>{c}</span>
              <span className={`grid h-5 w-5 place-items-center rounded-full border ${sel ? "border-vsm-red bg-vsm-red text-white" : "border-border"}`}>
                {sel && <CheckCircle2 className="h-3 w-3" />}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={next}
          disabled={answers[step].length === 0}
          className="rounded-lg bg-vsm-red px-5 py-2 text-sm font-semibold uppercase tracking-wider text-white shadow-glow-red transition hover:brightness-110 disabled:opacity-40"
        >
          {step + 1 === total ? "Valider" : "Suivant"}
        </button>
      </div>
    </div>
  );
}
