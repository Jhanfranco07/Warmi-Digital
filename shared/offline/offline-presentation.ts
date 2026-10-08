import type { ModuleDownload } from "@/shared/offline/module3-types";

export const OFFLINE_HOME = "/offline-learning";
export const OFFLINE_HERO = "/images/hero/warmi-hero.png";
export const OFFLINE_LOGO = "/icons/faviconWarmi.png";
export function isOfflineHomePath(path: string) {
  return ["/", "/artesana", "/artesana/dashboard", OFFLINE_HOME].includes(path);
}
export function offlineProgress(download: ModuleDownload) {
  if (!download.progress) return undefined;
  const completed = download.lessons.filter((l) =>
    download.progress!.completedLessonIds.includes(l.id)
  ).length;
  return { completed, total: download.lessons.length };
}
export function offlineLocation(path: string, downloads: ModuleDownload[]) {
  const url = new URL(path || OFFLINE_HOME, "https://warmi.invalid");
  const parts = url.pathname.split("/").filter(Boolean);
  const lessonId = parts[4];
  const download =
    downloads.find((d) =>
      [...d.lessons, ...(d.supportLessons ?? [])].some((l) => l.id === lessonId)
    ) ??
    downloads.find((d) => d.moduleId === url.searchParams.get("module")) ??
    downloads[0];
  return { pathname: url.pathname, courseId: parts[2], lessonId, download };
}
