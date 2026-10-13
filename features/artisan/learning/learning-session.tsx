"use client";

import {
  createContext,
  useContext,
  useId,
  useRef,
  useState,
  type ReactNode
} from "react";
import Link from "next/link";
import type { Route } from "next";
import { ArrowLeft, ArrowRight, Check, ChevronDown, Trophy } from "lucide-react";
import { SpeechButton } from "@/shared/accessibility/speech-button";
import { LearningSessionComplete } from "@/features/artisan/learning/learning-session-complete";

export type LearningStep = {
  title: string;
  narration: string;
  content: ReactNode;
  continueLabel?: string;
};
const StepNavigation = createContext<((index: number) => void) | null>(null);
export function LearningStepJump({ to, children }: { to: number; children: ReactNode }) {
  const change = useContext(StepNavigation);
  return (
    <button
      type="button"
      onClick={() => change?.(to)}
      className="inline-flex min-h-12 items-center gap-2 font-bold text-[#b5245b]"
    >
      {children}
      <ArrowRight className="h-4 w-4 shrink-0" />
    </button>
  );
}
export function LearningSession({
  courseId,
  lessonId,
  moduleNumber,
  order,
  title,
  intro,
  sessions,
  steps,
  outcomes,
  completed
}: {
  courseId: string;
  lessonId: string;
  moduleNumber: number;
  order: number;
  title: string;
  intro: string;
  sessions: readonly { id: string; title: string; order: number }[];
  steps: LearningStep[];
  outcomes: readonly string[];
  completed: boolean;
}) {
  const [index, setIndex] = useState(0);
  const focus = useRef<HTMLHeadingElement>(null);
  const finish = index === steps.length;
  const current = steps[index];
  const courseHref = `/artesana/aprender/${courseId}` as Route;
  const sessionHref = (id: string) =>
    `/artesana/aprender/${courseId}/lecciones/${id}` as Route;
  const change = (next: number) => {
    setIndex(next);
    requestAnimationFrame(() => {
      focus.current?.focus({ preventScroll: true });
      window.scrollTo({ top: 0, behavior: "instant" });
    });
  };
  return (
    <StepNavigation.Provider value={change}>
      <div className="mx-auto w-full min-w-0 max-w-3xl space-y-6 pb-6 text-base leading-7 text-[#344441] [&_a]:scroll-mb-28 [&_button]:scroll-mb-28">
        <header className="space-y-3 border-b border-[#ead2dc] pb-5">
          <Link
            href={courseHref}
            className="inline-flex min-h-12 items-center gap-2 font-bold text-[#b5245b]"
          >
            <ArrowLeft className="h-5 w-5" />
            Aprender para crecer
          </Link>
          <div className="flex justify-between gap-3 text-sm font-bold text-[#b5245b]">
            <p>Módulo {moduleNumber}</p>
            <p>
              Sesión {order} de {sessions.length}
            </p>
          </div>
          <h1 className="font-display text-xl font-bold leading-tight text-[#202b29] sm:text-2xl">
            {title}
          </h1>
          <p>{intro}</p>
          <nav
            aria-label={`Sesiones del Módulo ${moduleNumber}`}
            className="grid grid-cols-4 gap-3"
          >
            {sessions.map((session) => (
              <Link
                key={session.id}
                href={sessionHref(session.id)}
                aria-current={session.id === lessonId ? "step" : undefined}
                aria-label={`Sesión ${session.order}: ${session.title}`}
                className={`flex min-h-12 items-center justify-center rounded-md border font-bold ${session.id === lessonId ? "border-[#b5245b] bg-[#b5245b] text-white" : "border-[#dfc7d2] bg-white text-[#b5245b]"}`}
              >
                {session.order}
              </Link>
            ))}
          </nav>
        </header>
        <section key={index} data-learning-step className="space-y-4">
          <p role="status" className="text-sm font-bold text-[#24756f]">
            {finish ? "Sesión lista" : `Paso ${index + 1} de ${steps.length}`}
          </p>
          <div
            role="progressbar"
            aria-label="Recorrido de la sesión"
            aria-valuemin={0}
            aria-valuemax={steps.length}
            aria-valuenow={index}
            className="h-2 overflow-hidden rounded bg-[#e2f2ef]"
          >
            <div
              className="h-full bg-[#24756f]"
              style={{ width: `${(index / steps.length) * 100}%` }}
            />
          </div>
          <h2
            ref={focus}
            tabIndex={-1}
            className="font-display scroll-mt-24 text-xl font-bold leading-7 text-[#202b29] focus:outline-none"
          >
            {finish
              ? order === sessions.length
                ? `Al terminar el Módulo ${moduleNumber}, yo puedo…`
                : "Al terminar esta sesión podrás:"
              : current.title}
          </h2>
          <SpeechButton
            text={finish ? outcomes.join(". ") : `${current.title}. ${current.narration}`}
            label="Escuchar este paso"
          />
          {finish ? (
            <div className="space-y-4">
              <div className="rounded-[28px] border border-[#f4d5c6] bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.95),_rgba(255,247,242,0.95)_35%,_rgba(254,233,220,0.9)_100%)] p-4 shadow-[0_18px_30px_rgba(122,49,0,0.08)]">
                <div className="flex items-center gap-3">
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#b5245b] text-white shadow-[0_12px_24px_rgba(181,36,91,0.22)]">
                    <Trophy className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-ui text-[0.68rem] font-extrabold uppercase tracking-[0.14em] text-[#b5245b]">
                      Mis logros
                    </p>
                    <p className="mt-1 text-lg font-bold text-[#202b29]">
                      {order === sessions.length
                        ? `Al terminar el Módulo ${moduleNumber}, yo puedo…`
                        : "Al terminar esta sesión podrás:"}
                    </p>
                  </div>
                </div>
              </div>

              <ul className="grid gap-3">
                {outcomes.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 rounded-2xl border border-[#e9d0d9] bg-[linear-gradient(135deg,#fff7fa_0%,#fffaf4_100%)] p-3 shadow-[0_10px_22px_rgba(122,49,0,0.04)]"
                  >
                    <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#e2f2ef] text-[#24756f] ring-4 ring-white">
                      <Check className="h-4 w-4" />
                    </span>
                    <span className="pt-0.5 text-base leading-7 text-[#123f78]">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            current.content
          )}
        </section>
        <footer className="space-y-4 border-t border-[#ead2dc] pt-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
            {index > 0 && (
              <button
                onClick={() => change(index - 1)}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-[#dfc7d2] px-4 py-3 font-bold text-[#b5245b]"
              >
                <ArrowLeft className="h-5 w-5" />
                Paso anterior
              </button>
            )}
            {!finish ? (
              <button
                onClick={() => change(index + 1)}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-[#b5245b] px-4 py-3 font-bold text-white hover:bg-[#941747] sm:ml-auto"
              >
                {current.continueLabel ?? "Continuar al siguiente paso"}
                <ArrowRight className="h-5 w-5 shrink-0" />
              </button>
            ) : (
              <LearningSessionComplete
                courseId={courseId}
                lessonId={lessonId}
                moduleNumber={moduleNumber}
                completed={completed}
                last={order === sessions.length}
                nextHref={
                  order === sessions.length ? courseHref : sessionHref(sessions[order].id)
                }
              />
            )}
          </div>
          {order > 1 && (
            <Link
              href={sessionHref(sessions[order - 2].id)}
              className="inline-flex min-h-12 items-center gap-2 text-sm font-bold text-[#526361]"
            >
              <ArrowLeft className="h-4 w-4" />
              Sesión anterior
            </Link>
          )}
        </footer>
      </div>
    </StepNavigation.Provider>
  );
}

export function LearningDisclosure({
  label,
  children
}: {
  label: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <div className="border-y border-[#ead2dc] py-2">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen(!open)}
        className="flex min-h-12 w-full items-center justify-between gap-3 text-left font-bold text-[#24756f]"
      >
        {label}
        <ChevronDown className={`h-5 w-5 shrink-0 ${open ? "rotate-180" : ""}`} />
      </button>
      <div id={id} hidden={!open}>
        {open && <div className="space-y-4 py-3">{children}</div>}
      </div>
    </div>
  );
}
