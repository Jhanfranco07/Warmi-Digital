import { WifiOff } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

type OfflineStateProps = {
  title?: string;
  description?: string;
};

export function OfflineState({
  title = "Sin conexion",
  description = "Revisa tu conexion e intenta nuevamente."
}: OfflineStateProps) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
        <WifiOff className="h-8 w-8 text-muted-foreground" />
        <div>
          <h2 className="font-serif text-headline-md">{title}</h2>
          <p className="mt-2 text-body-md text-muted-foreground">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}
