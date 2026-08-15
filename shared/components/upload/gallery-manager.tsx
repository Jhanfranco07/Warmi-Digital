"use client";

import {
  MultiImageUpload,
  type GalleryImageValue
} from "@/shared/components/upload/multi-image-upload";
import type { UploadedFileValue } from "@/shared/components/upload/file-upload";

type GalleryManagerProps = {
  images?: GalleryImageValue[];
  folder?: string;
  onUploaded?: (file: UploadedFileValue) => void;
  onRemove?: (fileId: string) => void;
  onMove?: (fileId: string, direction: "up" | "down") => void;
};

export function GalleryManager(props: GalleryManagerProps) {
  return <MultiImageUpload {...props} />;
}
