"use client";

import Image from "next/image";
import { Camera } from "lucide-react";

import { ImageUpload } from "@/shared/components/upload/image-upload";
import type { UploadedFileValue } from "@/shared/components/upload/file-upload";
import { cn } from "@/shared/lib/utils";

type AvatarUploadProps = {
  currentUrl?: string | null;
  alt?: string;
  folder?: string;
  onUploaded?: (file: UploadedFileValue) => void;
  className?: string;
};

export function AvatarUpload({
  currentUrl,
  alt = "Foto de perfil",
  folder = "warmi/avatars",
  onUploaded,
  className
}: AvatarUploadProps) {
  return (
    <div className={cn("flex items-center gap-4", className)}>
      <div className="relative h-24 w-24 overflow-hidden rounded-full border border-border bg-surface-low">
        {currentUrl ? (
          <Image src={currentUrl} alt={alt} fill sizes="96px" className="object-cover" />
        ) : (
          <div className="grid h-full w-full place-items-center text-muted-foreground">
            <Camera className="h-7 w-7" aria-hidden="true" />
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <ImageUpload
          label="Cambiar foto"
          description="JPG, PNG o WebP"
          folder={folder}
          altText={alt}
          onUploaded={onUploaded}
        />
      </div>
    </div>
  );
}
