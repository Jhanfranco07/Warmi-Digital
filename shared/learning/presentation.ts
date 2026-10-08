import { learningProgress } from "@/shared/learning/program";

export function validMinutes(value?: number | null) {
  return typeof value === "number" && Number.isFinite(value) && value > 0 ? value : null;
}

export function durationLabel(value?: number | null) {
  const minutes = validMinutes(value);
  return minutes === null ? null : `${minutes} min`;
}

// An explicit estimate takes precedence. Derive only from a complete set of estimates.
export function aggregateDuration(
  explicit: number | null | undefined,
  children: readonly (number | null | undefined)[]
) {
  const minutes = validMinutes(explicit);
  if (minutes !== null) return minutes;
  if (!children.length || children.some((value) => validMinutes(value) === null))
    return null;
  return validMinutes(children.reduce<number>((sum, value) => sum + value!, 0));
}

export function moduleDuration(module: {
  durationMin?: number | null;
  lessons: readonly { durationMin?: number | null }[];
}) {
  return aggregateDuration(
    module.durationMin,
    module.lessons.map((lesson) => lesson.durationMin)
  );
}

export function countLabel(count: number, singular: string, plural: string) {
  return `${count} ${count === 1 ? singular : plural}`;
}

type ProgressItem = {
  lessonId: string;
  completed: boolean;
  startedAt?: Date | string | null;
  progress?: number;
};
export function learningState(
  lessons: readonly { id: string }[],
  progresses: readonly ProgressItem[]
) {
  const ids = new Set(lessons.map((lesson) => lesson.id));
  const progress = learningProgress(
    { id: "presentation", modules: [{ id: "module", lessons }] },
    progresses
  );
  const completed =
    progress.totalLessons > 0 && progress.completedLessons === progress.totalLessons;
  const started = progresses.some(
    (item) =>
      ids.has(item.lessonId) &&
      (item.completed ||
        Boolean(item.startedAt) ||
        (Number.isFinite(item.progress) && item.progress! > 0))
  );
  return {
    ...progress,
    started,
    state: completed
      ? ("completed" as const)
      : started
        ? ("started" as const)
        : ("new" as const),
    label: completed ? "Completado" : started ? "En progreso" : "No iniciado",
    action: completed ? "Repasar" : started ? "Continuar" : "Comenzar"
  };
}

export function snapshotProgressLabel(completed: number, total: number) {
  return `${completed} de ${countLabel(total, "sesión completada", "sesiones completadas")} al descargar`;
}
