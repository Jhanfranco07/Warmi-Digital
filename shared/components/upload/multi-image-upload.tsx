"use client";

import Image from "next/image";
import { GripVertical, Trash2 } from "lucide-react";

import { ImageUpload } from "@/shared/components/upload/image-upload";
import type { UploadedFileValue } from "@/shared/components/upload/file-upload";
import { cn } from "@/shared/lib/utils";

export type GalleryImageValue = UploadedFileValue & {
  order: number;
};

type MultiImageUploadProps = {
  label?: string;
  description?: string;
  folder?: string;
  images?: GalleryImageValue[];
  onUploaded?: (file: UploadedFileValue) => void;
  onRemove?: (fileId: string) => void;
  onMove?: (fileId: string, direction: "up" | "down") => void;
  className?: string;
};

export function MultiImageUpload({
  label = "Agregar imagen a la galeria",
  description = "Puedes agregar varias fotos y ordenarlas.",
  folder = "warmi/gallery",
  images = [],
  onUploaded,
  onRemove,
  onMove,
  className
}: MultiImageUploadProps) {
  return (
    <div className={cn("space-y-4", className)}>
      <ImageUpload
        label={label}
        description={description}
        folder={folder}
        onUploaded={onUploaded}
      />

      {images.length ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {images
            .slice()
            .sort((a, b) => a.order - b.order)
            .map((image, index) => (
              <div
                key={image.id}
                className="overflow-hidden rounded-lg border border-border bg-background shadow-sm"
              >
                <div className="relative aspect-[4/3]">
                  <Image
                    src={image.url}
                    alt={image.altText ?? "Imagen de galeria"}
                    fill
                    sizes="(max-width: 768px) 50vw, 220px"
                    className="object-cover"
                  />
                </div>
                <div className="flex items-center justify-between gap-2 px-3 py-2">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground"
                    onClick={() => onMove?.(image.id, index === 0 ? "down" : "up")}
                  >
                    <GripVertical className="h-4 w-4" aria-hidden="true" />
                    Ordenar
                  </button>
                  <button
                    type="button"
                    className="text-destructive"
                    onClick={() => onRemove?.(image.id)}
                    aria-label="Eliminar imagen"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
            ))}
        </div>
      ) : null}
    </div>
  );
}
