import { LEARNING_PROGRAM, moduleCapability } from "@/shared/learning/program";

export const MODULE3_TITLE = LEARNING_PROGRAM.modules[2].title;
export const OFFLINE_DB = "warmi-learning-offline";
export const OFFLINE_STORE = "downloads";
export const OFFLINE_KEY = "module3";

export function isOfflineModule(moduleId: string) {
  return moduleCapability(moduleId)?.offline === true;
}

export function getReferencedLessonId(
  courseId: string,
  resource: {
    type: string;
    provider: string | null;
    originalUrl: string | null;
  }
) {
  if (
    resource.type !== "EXTERNAL_LINK" ||
    resource.provider !== "warmi" ||
    !resource.originalUrl?.startsWith("/") ||
    resource.originalUrl.startsWith("//") ||
    resource.originalUrl.includes("\\")
  )
    return null;
  const url = new URL(resource.originalUrl, "https://warmi.invalid");
  const segments = url.pathname.split("/");
  if (
    url.origin !== "https://warmi.invalid" ||
    url.search ||
    url.hash ||
    segments.length !== 6 ||
    segments[1] !== "artesana" ||
    segments[2] !== "aprender" ||
    segments[3] !== courseId ||
    segments[4] !== "lecciones"
  )
    return null;
  return segments[5] || null;
}

export function getReferencedLesson(
  resource: Parameters<typeof getReferencedLessonId>[1]
) {
  const segments = resource.originalUrl?.split("/");
  const courseId = segments?.[3];
  if (!courseId) return null;
  const lessonId = getReferencedLessonId(courseId, resource);
  return lessonId ? { courseId, lessonId } : null;
}

export type OfflineResource = {
  id: string;
  title: string;
  description: string | null;
  type: string;
  externalUrl: string | null;
  internalLessonId?: string;
  file: { id: string; mimeType: string; size: number } | null;
};

export type OfflineLesson = {
  id: string;
  title: string;
  content: string | null;
  resources: OfflineResource[];
};

export type OfflineModule = {
  contentVersion?: string;
  userId: string;
  courseId: string;
  courseTitle: string;
  moduleId: string;
  title: string;
  description: string | null;
  lessons: OfflineLesson[];
  supportLessons?: OfflineLesson[];
};

export type ModuleDownload = OfflineModule & {
  cacheName: string;
  downloadedAt: string;
  bytes: number;
  assets: Record<string, string>;
};

export function isDownloadableFile(file: OfflineResource["file"]) {
  return Boolean(
    file &&
    (file.mimeType.startsWith("image/") ||
      file.mimeType === "application/pdf" ||
      file.mimeType === "video/mp4")
  );
}

export function isCurrentDownload(download: ModuleDownload, expected: OfflineModule) {
  const revision = (value: OfflineModule) =>
    JSON.stringify({
      contentVersion: value.contentVersion,
      lessons: value.lessons,
      supportLessons: value.supportLessons ?? []
    });
  return (
    revision(download) === revision(expected) &&
    [...expected.lessons, ...(expected.supportLessons ?? [])]
      .flatMap((lesson) => lesson.resources)
      .filter((resource) => isDownloadableFile(resource.file))
      .every((resource) => Boolean(download.assets[resource.file!.id]))
  );
}
