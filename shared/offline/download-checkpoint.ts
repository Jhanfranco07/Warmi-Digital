import type { OfflineModule, OfflineResource } from "@/shared/offline/module3-types";

export type DownloadCheckpoint = {
  userId: string;
  courseId: string;
  moduleId: string;
  generation: string;
  signature: string;
  state?: "paused" | "incomplete";
};

export function fileSignature(file: NonNullable<OfflineResource["file"]>) {
  return JSON.stringify([file.id, file.mimeType, file.size, file.revision ?? null]);
}

export function downloadSignature(module: OfflineModule) {
  const files = [...module.lessons, ...(module.supportLessons ?? [])]
    .flatMap((lesson) => lesson.resources)
    .filter((resource) => resource.file)
    .map((resource) => fileSignature(resource.file!));
  return JSON.stringify([module.contentVersion ?? null, [...new Set(files)].sort()]);
}

export function isMatchingCheckpoint(
  value: unknown,
  module: OfflineModule
): value is DownloadCheckpoint {
  if (!value || typeof value !== "object") return false;
  const saved = value as Partial<DownloadCheckpoint>;
  return (
    saved.userId === module.userId &&
    saved.courseId === module.courseId &&
    saved.moduleId === module.moduleId &&
    saved.signature === downloadSignature(module) &&
    typeof saved.generation === "string" &&
    /^[\w-]+$/.test(saved.generation)
  );
}
