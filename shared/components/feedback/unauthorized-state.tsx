import { ShieldAlert } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

type UnauthorizedStateProps = {
  title?: string;
  description?: string;
};

export function UnauthorizedState({
  title = "Acceso restringido",
  description = "Tu rol actual no tiene permiso para ver este contenido."
}: UnauthorizedStateProps) {
  return (
    <Card className="border-warning/40">
      <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
        <ShieldAlert className="h-8 w-8 text-warning" />
        <div>
          <h2 className="font-serif text-headline-md">{title}</h2>
          <p className="mt-2 text-body-md text-muted-foreground">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}
