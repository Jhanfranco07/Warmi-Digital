"use client";

import { useEffect, useState } from "react";
import {
  readModule3Resume,
  rememberModule3Session,
  READING_POSITION_EVENT
} from "@/shared/learning/reading-position";

export function useVisitedModule3Session(lessonId: string) {
  useEffect(() => rememberModule3Session(lessonId), [lessonId]);
}

export function useModule3Resume(allowedLessonIds: readonly string[], userId?: string) {
  const [session, setSession] = useState<ReturnType<typeof readModule3Resume>>(null);
  const allowed = JSON.stringify(allowedLessonIds);
  useEffect(() => {
    const ids = JSON.parse(allowed) as string[];
    const update = () => setSession(readModule3Resume(ids, userId));
    update();
    window.addEventListener(READING_POSITION_EVENT, update);
    window.addEventListener("storage", update);
    window.addEventListener("focus", update);
    return () => {
      window.removeEventListener(READING_POSITION_EVENT, update);
      window.removeEventListener("storage", update);
      window.removeEventListener("focus", update);
    };
  }, [allowed, userId]);
  return session;
}
