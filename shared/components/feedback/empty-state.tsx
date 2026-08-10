import { Inbox } from "lucide-react";

import { Card, CardContent } from "@/shared/components/ui/card";

type EmptyStateProps = {
  title: string;
  description?: string;
};

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
        <Inbox className="h-8 w-8 text-muted-foreground" />
        <div>
          <h2 className="font-serif text-headline-md">{title}</h2>
          {description ? (
            <p className="mt-2 text-body-md text-muted-foreground">{description}</p>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
