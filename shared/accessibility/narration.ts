type LearningPageNarrationInput = {
  enrolledCount: number;
  availableCount: number;
  currentCourseTitle?: string | null;
};

type LessonNarrationResource = {
  title: string;
  description?: string | null;
  type: string;
};

type ModuleNarrationInput = {
  order: number;
  title: string;
  description?: string | null;
  lessonCount: number;
  durationMin?: number | null;
  lessonTitles?: string[];
};

type CourseNarrationInput = {
  title: string;
  description?: string | null;
  moduleCount: number;
  lessonCount: number;
  progress: number;
  nextLessonTitle?: string | null;
};

type LessonNarrationInput = {
  title: string;
  moduleTitle?: string | null;
  content?: string | null;
  durationMin?: number | null;
  resources?: LessonNarrationResource[];
};

const ordinalWords = [
  "cero",
  "uno",
  "dos",
  "tres",
  "cuatro",
  "cinco",
  "seis",
  "siete",
  "ocho",
  "nueve",
  "diez"
];

const resourceTypeLabels: Record<string, string> = {
  VIDEO_YOUTUBE: "un video",
  VIDEO_UPLOAD: "un video",
  AUDIO: "un audio",
  IMAGE: "una imagen",
  PDF: "un PDF",
  DOCUMENT: "un documento",
  EXTERNAL_LINK: "un enlace externo"
};

function wordForNumber(value: number) {
  return ordinalWords[value] ?? String(value);
}

function itemCount(count: number, singular: string, plural: string) {
  return count === 1 ? `un ${singular}` : `${count} ${plural}`;
}

function durationPhrase(durationMin?: number | null) {
  if (!durationMin || durationMin <= 0) {
    return null;
  }

  return `Duración aproximada: ${durationMin} minutos.`;
}

function compact(parts: Array<string | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function buildLearningPageNarration(input: LearningPageNarrationInput) {
  const current = input.currentCourseTitle
    ? `Puedes continuar con el curso ${input.currentCourseTitle}.`
    : "Cuando tengas un curso asignado, aparecerá aquí para continuar tu ruta.";

  return compact([
    "Estás en Mi aprendizaje.",
    "Aquí puedes encontrar tus cursos, continuar los que ya comenzaste y revisar nuevos contenidos disponibles.",
    `Tienes ${itemCount(input.enrolledCount, "curso asignado", "cursos asignados")}.`,
    input.availableCount > 0
      ? `También hay ${itemCount(input.availableCount, "curso disponible", "cursos disponibles")} para explorar.`
      : null,
    current,
    "Selecciona un curso para conocer sus módulos y lecciones."
  ]);
}

export function buildCourseNarration(input: CourseNarrationInput) {
  return compact([
    `Curso. ${input.title}.`,
    input.description,
    `Este curso tiene ${itemCount(input.moduleCount, "módulo", "módulos")} y ${itemCount(input.lessonCount, "lección", "lecciones")}.`,
    `Tu avance actual es ${input.progress} por ciento.`,
    input.nextLessonTitle
      ? `Tu siguiente paso recomendado es abrir la lección ${input.nextLessonTitle}.`
      : "La facilitadora aún está preparando el siguiente paso."
  ]);
}

export function buildModuleNarration(input: ModuleNarrationInput) {
  const lessons =
    input.lessonTitles && input.lessonTitles.length > 0
      ? `Las lecciones son: ${input.lessonTitles.join(", ")}.`
      : null;

  return compact([
    `Módulo ${wordForNumber(input.order)}. ${input.title}.`,
    input.description,
    `Este módulo contiene ${itemCount(input.lessonCount, "lección", "lecciones")}.`,
    durationPhrase(input.durationMin),
    lessons
  ]);
}

export function buildLessonNarration(input: LessonNarrationInput) {
  const resources = summarizeResources(input.resources ?? []);

  return compact([
    `Lección. ${input.title}.`,
    input.moduleTitle ? `Pertenece al módulo ${input.moduleTitle}.` : null,
    input.content,
    durationPhrase(input.durationMin),
    resources
  ]);
}

export function buildResourceNarration(resource: LessonNarrationResource) {
  const type = resourceTypeLabels[resource.type] ?? "un recurso";

  return compact([
    `Recurso. ${resource.title}.`,
    `Es ${type}.`,
    resource.description,
    "Ábrelo cuando necesites revisar el material de apoyo."
  ]);
}

function summarizeResources(resources: LessonNarrationResource[]) {
  if (!resources.length) {
    return "Esta lección no tiene recursos adicionales por ahora.";
  }

  const labels = resources.map(
    (resource) => resourceTypeLabels[resource.type] ?? "un recurso"
  );
  const uniqueLabels = Array.from(new Set(labels));

  return `En esta lección encontrarás ${uniqueLabels.join(", ")}.`;
}
