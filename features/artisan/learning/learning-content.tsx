import { ExternalLink } from "lucide-react";

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
export function LearningChecklist({ items }: { items: readonly string[] }) {
  return (
    <fieldset className="space-y-1">
      <legend className="sr-only">Mi preparación</legend>
      {items.map((item) => (
        <label
          key={item}
          className="flex min-h-12 cursor-pointer items-center gap-3 border-b border-[#ead2dc] py-2"
        >
          <input type="checkbox" className="h-5 w-5 shrink-0 accent-[#b5245b]" />
          <span>{item}</span>
        </label>
      ))}
    </fieldset>
  );
}
