/* eslint-disable @next/next/no-html-link-for-pages -- Shared with the local offline router. */
import { ArrowLeft } from "lucide-react";

export function LearningLessonHeader({
  courseHref,
  moduleTitle,
  title
}: {
  courseHref: string;
  moduleTitle: string;
  title: string;
}) {
  return (
    <header
      data-learning-lesson-header
      className="space-y-3 border-b border-[#ead2dc] pb-5"
    >
      <a
        href={courseHref}
        className="inline-flex min-h-12 items-center gap-2 font-bold text-[#b5245b]"
      >
        <ArrowLeft aria-hidden="true" className="h-5 w-5" />
        Aprender para crecer
      </a>
      <p className="text-sm font-bold text-[#24756f]">{moduleTitle}</p>
      <h1 className="font-serif text-2xl font-bold leading-tight text-[#202b29]">
        {title}
      </h1>
    </header>
  );
}
