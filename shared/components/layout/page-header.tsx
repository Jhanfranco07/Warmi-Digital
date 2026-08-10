import { cn } from "@/shared/lib/utils";

type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  className?: string;
  actions?: React.ReactNode;
};

export function PageHeader({
  eyebrow,
  title,
  description,
  className,
  actions
}: PageHeaderProps) {
  return (
    <header className={cn("max-w-4xl space-y-4", className)}>
      {actions ? <div className="flex flex-wrap justify-end gap-2">{actions}</div> : null}
      {eyebrow ? (
        <p className="font-ui text-label-ui uppercase tracking-[0.05em] text-primary">
          {eyebrow}
        </p>
      ) : null}
      <h1 className="font-serif text-headline-lg text-foreground md:text-display-lg">
        {title}
      </h1>
      {description ? (
        <p className="text-body-lg text-muted-foreground">{description}</p>
      ) : null}
    </header>
  );
}
