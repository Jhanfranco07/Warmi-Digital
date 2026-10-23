import { MODULE3_SESSIONS } from "@/shared/learning/module3-journey";

export const READING_POSITION_PREFIX = "warmi-m3-reading-v1:";
export const READING_POSITION_EVENT = "warmi-reading-position-change";

function notify() {
  if (typeof window !== "undefined")
    window.dispatchEvent(new Event(READING_POSITION_EVENT));
}

export function rememberModule3Session(lessonId: string) {
  const session = MODULE3_SESSIONS.find((item) => item.id === lessonId);
  if (session) writePosition("last-session", session.order);
}

export function readModule3Resume(allowedLessonIds: readonly string[], userId?: string) {
  try {
    if (userId && localStorage.getItem("warmi-reading-owner-v1") !== userId) return null;
    const order: unknown = JSON.parse(
      localStorage.getItem(READING_POSITION_PREFIX + "last-session") ?? "null"
    );
    return (
      MODULE3_SESSIONS.find(
        (session) => session.order === order && allowedLessonIds.includes(session.id)
      ) ?? null
    );
  } catch {
    return null;
  }
}

export function readPosition(key: string, maximum: number, fallback = 0) {
  try {
    const raw = localStorage.getItem(READING_POSITION_PREFIX + key);
    if (raw === null) return fallback;
    const value: unknown = JSON.parse(raw);
    return typeof value === "number" && Number.isInteger(value) && value >= 0
      ? Math.min(value, maximum)
      : fallback;
  } catch {
    return fallback;
  }
}

export function writePosition(key: string, value: number) {
  try {
    localStorage.setItem(READING_POSITION_PREFIX + key, JSON.stringify(value));
    notify();
  } catch {
    // Reading remains usable when storage is blocked or full.
  }
}

export function clearReadingPositions() {
  try {
    const keys = Array.from({ length: localStorage.length }, (_, i) =>
      localStorage.key(i)
    );
    for (const key of keys)
      if (key?.startsWith(READING_POSITION_PREFIX)) localStorage.removeItem(key);
    notify();
  } catch {
    // No personal information is stored in these numeric bookmarks.
  }
}

export function setReadingOwner(userId: string) {
  try {
    const key = "warmi-reading-owner-v1";
    const owner = localStorage.getItem(key);
    if (owner && owner !== userId) clearReadingPositions();
    localStorage.setItem(key, userId);
    notify();
  } catch {
    // Bookmarks are optional on devices that disable local storage.
  }
}
