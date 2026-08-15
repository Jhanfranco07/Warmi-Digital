"use client";

import { useTransition } from "react";
import { toast } from "sonner";

import {
  addStoryGalleryImageAction,
  moveStoryGalleryImageAction,
  removeStoryGalleryImageAction
} from "@/shared/actions/artisan/story-gallery";
import { GalleryManager } from "@/shared/components/upload/gallery-manager";
import type { GalleryImageValue } from "@/shared/components/upload/multi-image-upload";

type StoryGalleryManagerProps = {
  images: GalleryImageValue[];
};

export function StoryGalleryManager({ images }: StoryGalleryManagerProps) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className={isPending ? "pointer-events-none opacity-70" : undefined}>
      <GalleryManager
        folder="warmi/story-gallery"
        images={images}
        onUploaded={(file) => {
          startTransition(async () => {
            const result = await addStoryGalleryImageAction(file.id);
            if (result.ok) {
              toast.success(result.message);
            } else {
              toast.error(result.message);
            }
          });
        }}
        onRemove={(fileId) => {
          startTransition(async () => {
            const result = await removeStoryGalleryImageAction(fileId);
            if (result.ok) {
              toast.success(result.message);
            } else {
              toast.error(result.message);
            }
          });
        }}
        onMove={(fileId, direction) => {
          startTransition(async () => {
            const result = await moveStoryGalleryImageAction(fileId, direction);
            if (result.ok) {
              toast.success(result.message);
            } else {
              toast.error(result.message);
            }
          });
        }}
      />
    </div>
  );
}
