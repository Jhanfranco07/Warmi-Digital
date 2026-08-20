"use client";

import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import { useMemo, useState } from "react";
import { BookOpen, ChevronRight, CheckCircle2 } from "lucide-react";

import { Progress } from "@/shared/components/ui/progress";
import { cn } from "@/shared/lib/utils";

export type MobileLearningCourse = {
  id: string;
  href?: string;
  image: string | null;
  meta: string;
  progress: number;
  title: string;
};

type LearningTab = "progress" | "completed" | "available";

type MobileLearningTabsProps = {
  availableCourses: MobileLearningCourse[];
  completedCourses: MobileLearningCourse[];
  inProgressCourses: MobileLearningCourse[];
};

const tabs: Array<{ id: LearningTab; label: string }> = [
  { id: "progress", label: "En progreso" },
  { id: "completed", label: "Completados" },
  { id: "available", label: "Disponibles" }
];

export function MobileLearningTabs({
  availableCourses,
  completedCourses,
  inProgressCourses
}: MobileLearningTabsProps) {
  const [activeTab, setActiveTab] = useState<LearningTab>("progress");
  const selectedCourses = useMemo(() => {
    if (activeTab === "completed") {
      return completedCourses;
    }

    if (activeTab === "available") {
      return availableCourses;
    }

    return inProgressCourses;
  }, [activeTab, availableCourses, completedCourses, inProgressCourses]);

  const emptyText =
    activeTab === "completed"
      ? "Aún no tienes cursos completados."
      : activeTab === "available"
        ? "No hay cursos disponibles por ahora."
        : "No tienes cursos en progreso por ahora.";

  return (
    <div className="mt-6">
      <div
        className="grid grid-cols-3 overflow-hidden rounded-full border border-[#f0c3cf] bg-white p-1 shadow-[0_10px_24px_rgba(181,36,91,0.08)]"
        role="tablist"
        aria-label="Filtrar cursos"
      >
        {tabs.map((tab) => {
          const selected = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "min-h-11 select-none rounded-full px-3 py-3 text-center text-xs font-bold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b5245b] focus-visible:ring-offset-2",
                selected
                  ? "bg-[#b5245b] text-white shadow-[0_8px_18px_rgba(181,36,91,0.22)]"
                  : "text-[#7a5b4a] hover:bg-[#fff3f7] hover:text-[#b5245b]"
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <MobileSectionLabel title={tabs.find((tab) => tab.id === activeTab)?.label ?? ""} />
      <div className="mt-3 space-y-4" role="tabpanel">
        {selectedCourses.length ? (
          selectedCourses
            .slice(0, activeTab === "available" ? 4 : 3)
            .map((course) => (
              <MobileLearningCard
                key={course.id}
                {...course}
                completed={activeTab === "completed"}
                actionLabel={
                  activeTab === "completed"
                    ? "Repasar"
                    : activeTab === "available"
                      ? "Pedir acceso"
                      : "Continuar"
                }
              />
            ))
        ) : (
          <MobileInlineEmpty text={emptyText} />
        )}
      </div>
    </div>
  );
}

function MobileSectionLabel({ title }: { title: string }) {
  return (
    <div className="mt-6 flex items-center gap-3">
      <h2 className="font-serif text-lg font-bold text-[#5a1d2f]">{title}</h2>
      <span className="h-px flex-1 bg-[#f1c6d5]" />
    </div>
  );
}

function MobileLearningCard({
  actionLabel,
  completed = false,
  href,
  image,
  meta,
  progress,
  title
}: MobileLearningCourse & {
  actionLabel: string;
  completed?: boolean;
}) {
  const content = (
    <>
      <div className="relative min-h-[126px]">
        {image ? (
          <Image src={image} alt={title} fill sizes="126px" className="object-cover" />
        ) : (
          <LearningImagePlaceholder />
        )}
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-ui text-sm font-extrabold leading-tight text-[#1b1c1a]">
            {title}
          </h3>
          {completed ? (
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#f0f8df] text-[#5a9238]">
              <CheckCircle2 className="h-5 w-5" />
            </span>
          ) : null}
        </div>
        <p className="mt-2 flex items-center gap-1 text-[11px] text-[#5b4a42]">
          <BookOpen className="h-3.5 w-3.5 text-[#b5245b]" />
          {meta}
        </p>
        <p className="mt-3 text-[11px] font-bold text-[#b5245b]">
          {progress}% completado
        </p>
        <Progress
          value={progress}
          className="mt-1.5 h-1.5 bg-[#f4dbe4] [&>div]:bg-[#b5245b]"
        />
        <span className="mt-3 inline-flex items-center rounded-lg bg-[#b5245b] px-4 py-2 text-[11px] font-bold text-white">
          {actionLabel}
          <ChevronRight className="ml-1 h-3.5 w-3.5" />
        </span>
      </div>
    </>
  );

  if (!href) {
    return (
      <article className="grid grid-cols-[126px_1fr] overflow-hidden rounded-2xl border border-[#f5d2dc] bg-white shadow-[0_12px_26px_rgba(122,16,66,0.08)]">
        {content}
      </article>
    );
  }

  return (
    <Link
      href={href as Route}
      className="grid grid-cols-[126px_1fr] overflow-hidden rounded-2xl border border-[#f5d2dc] bg-white shadow-[0_12px_26px_rgba(122,16,66,0.08)] transition-transform duration-300 active:scale-[0.99]"
    >
      {content}
    </Link>
  );
}

function LearningImagePlaceholder() {
  return (
    <div className="grid h-full w-full place-items-center bg-[linear-gradient(135deg,#fff0d6,#ffe8ef,#e8fbfd)]">
      <div className="grid h-12 w-12 place-items-center rounded-full bg-white/80 text-[#b5245b] shadow-sm">
        <BookOpen className="h-6 w-6" />
      </div>
    </div>
  );
}

function MobileInlineEmpty({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-[#f0c3cf] bg-white/80 p-4 text-sm font-semibold text-[#7a5b4a]">
      {text}
    </div>
  );
}
