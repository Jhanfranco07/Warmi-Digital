import Image from "next/image";
import { Clock, MapPin, Palette, User } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/shared/lib/utils";

export type ProductCardProps = {
  name: string;
  artisanName: string;
  community: string;
  technique: string;
  makingTime: string;
  culturalPhrase: string;
  imageUrl?: string;
  className?: string;
};

export function ProductCard({
  name,
  artisanName,
  community,
  technique,
  makingTime,
  culturalPhrase,
  imageUrl,
  className
}: ProductCardProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <div className="relative aspect-[4/3] bg-surface-high">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={name}
            fill
            className="object-cover"
            sizes="(min-width: 768px) 33vw, 100vw"
          />
        ) : null}
      </div>
      <CardHeader className="space-y-3">
        <div className="space-y-2">
          <Badge variant="outline">{community}</Badge>
          <CardTitle>{name}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="font-serif text-body-lg text-primary">{`"${culturalPhrase}"`}</p>
        <dl className="grid gap-3 text-body-md text-muted-foreground">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-primary" />
            <dt className="sr-only">Artesana</dt>
            <dd>{artisanName}</dd>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            <dt className="sr-only">Comunidad</dt>
            <dd>{community}</dd>
          </div>
          <div className="flex items-center gap-2">
            <Palette className="h-4 w-4 text-primary" />
            <dt className="sr-only">Tecnica</dt>
            <dd>{technique}</dd>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            <dt className="sr-only">Tiempo de elaboracion</dt>
            <dd>{makingTime}</dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
}
