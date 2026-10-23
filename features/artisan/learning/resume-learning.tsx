"use client";

/* eslint-disable @next/next/no-html-link-for-pages -- The offline shell also handles these links. */
import type { ReactNode } from "react";
import { ArrowRight, BookOpen } from "lucide-react";
import { useModule3Resume } from "@/shared/learning/use-module3-resume";

export function ResumeLearning({
  courseHref,
  allowedLessonIds,
  userId,
  fallback = null
}: {
  courseHref: string;
  allowedLessonIds: readonly string[];
  userId?: string;
  fallback?: ReactNode;
}) {
  const session = useModule3Resume(allowedLessonIds, userId);
  if (!session) return fallback;
  return (
    <a
      data-resume-learning
      href={`${courseHref}/lecciones/${session.id}`}
      className="my-4 flex min-h-14 min-w-0 items-center gap-3 border-y border-[#ead2dc] py-4 text-[#b5245b] hover:text-[#7a1042]"
    >
      <BookOpen aria-hidden="true" className="h-5 w-5 shrink-0" />
      <span className="min-w-0 flex-1">
        <span className="block font-bold">Continuar donde me quedé</span>
        <span className="mt-1 block break-words text-sm text-[#344441]">
          Módulo 3 · Sesión {session.order}: {session.title}
        </span>
      </span>
      <ArrowRight aria-hidden="true" className="h-5 w-5 shrink-0" />
    </a>
  );
}
