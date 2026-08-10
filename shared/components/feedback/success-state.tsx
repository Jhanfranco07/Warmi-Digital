import { CheckCircle2 } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

type SuccessStateProps = {
  title: string;
  description?: string;
};

export function SuccessState({ title, description }: SuccessStateProps) {
  return (
    <Card className="border-success/40">
      <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
        <CheckCircle2 className="h-8 w-8 text-success" />
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
