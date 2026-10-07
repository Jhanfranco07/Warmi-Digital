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
import { ArrowLeft, ArrowRight, Check, ChevronDown } from "lucide-react";
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
            <ul className="space-y-3">
              {outcomes.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 border-b border-[#ead2dc] py-3"
                >
                  <Check className="mt-1 h-5 w-5 shrink-0 text-[#24756f]" />
                  {item}
                </li>
              ))}
            </ul>
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
