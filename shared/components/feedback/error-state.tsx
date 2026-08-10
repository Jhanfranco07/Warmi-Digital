import { AlertTriangle } from "lucide-react";

import { Card, CardContent } from "@/shared/components/ui/card";

type ErrorStateProps = {
  title: string;
  description?: string;
};

export function ErrorState({ title, description }: ErrorStateProps) {
  return (
    <Card className="border-destructive/40">
      <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
        <AlertTriangle className="h-8 w-8 text-destructive" />
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
