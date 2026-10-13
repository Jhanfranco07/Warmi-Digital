import { ExternalLink } from "lucide-react";

export { LearningChecklist } from "@/features/artisan/learning/learning-checklist";

export const learningLinkStyle =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-[#b5245b] px-4 py-3 text-center text-base font-bold text-[#b5245b] hover:bg-[#fff0f5]";
export function LearningExternal({
  href,
  children
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={learningLinkStyle}
    >
      {children}
      <ExternalLink className="h-4 w-4 shrink-0" />
    </a>
  );
}
