import { cn } from "@/shared/lib/utils";

export type TimelineItem = {
  title: string;
  description?: string;
  meta?: string;
  status?: "complete" | "current" | "pending";
};

type TimelineProps = {
  items: TimelineItem[];
  className?: string;
};

export function Timeline({ items, className }: TimelineProps) {
  return (
    <ol className={cn("space-y-4", className)}>
      {items.map((item, index) => (
        <li key={`${item.title}-${index}`} className="relative pl-8">
          {index < items.length - 1 ? (
            <span
              className="absolute left-2 top-5 h-full w-px bg-border"
              aria-hidden="true"
            />
          ) : null}
          <span
            className={cn(
              "absolute left-0 top-1 flex h-4 w-4 rounded-full border bg-background",
              item.status === "complete" && "border-tertiary bg-tertiary",
              item.status === "current" && "border-primary bg-primary-fixed",
              item.status === "pending" && "border-border bg-surface-high"
            )}
            aria-hidden="true"
          />
          <div className="space-y-1">
            <p className="text-label-ui font-semibold">{item.title}</p>
            {item.description ? (
              <p className="text-body-md text-muted-foreground">{item.description}</p>
            ) : null}
            {item.meta ? (
              <p className="text-caption text-muted-foreground">{item.meta}</p>
            ) : null}
          </div>
        </li>
      ))}
    </ol>
  );
}
