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

  return `Te tomará aproximadamente ${durationMin} minutos. Puedes hacerlo con calma.`;
}

function compact(parts: Array<string | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function buildLearningPageNarration(input: LearningPageNarrationInput) {
  const current = input.currentCourseTitle
    ? `Para seguir avanzando, puedes continuar con el curso ${input.currentCourseTitle}.`
    : "Cuando tengas un curso asignado, aparecerá aquí para que puedas continuar tu ruta paso a paso.";

  return compact([
    "Estás en Mi aprendizaje. Este espacio te acompaña para aprender a tu ritmo.",
    "Aquí encontrarás tus cursos, tus avances y nuevos contenidos preparados para fortalecer tu trabajo.",
    `En este momento tienes ${itemCount(input.enrolledCount, "curso asignado", "cursos asignados")}.`,
    input.availableCount > 0
      ? `También puedes explorar ${itemCount(input.availableCount, "curso disponible", "cursos disponibles")} cuando te sientas lista.`
      : null,
    current,
    "Elige un curso y Warmi te mostrará los módulos y lecciones disponibles."
  ]);
}

export function buildCourseNarration(input: CourseNarrationInput) {
  return compact([
    `Estás en el curso ${input.title}.`,
    input.description,
    `La ruta está organizada en ${itemCount(input.moduleCount, "módulo", "módulos")} y ${itemCount(input.lessonCount, "lección", "lecciones")}, para que avances poco a poco.`,
    `Tu avance actual es de ${input.progress} por ciento. Cada lección completada suma a tu progreso.`,
    input.nextLessonTitle
      ? `Tu siguiente paso recomendado es abrir la lección ${input.nextLessonTitle}. Puedes empezar por ahí.`
      : "Por ahora no hay una siguiente lección pendiente. Si tienes dudas, puedes revisar el curso nuevamente o escribir a tu facilitadora."
  ]);
}

export function buildModuleNarration(input: ModuleNarrationInput) {
  const lessons =
    input.lessonTitles && input.lessonTitles.length > 0
      ? `En este módulo encontrarás estas lecciones: ${input.lessonTitles.join(", ")}.`
      : null;

  return compact([
    `Este es el módulo ${wordForNumber(input.order)}: ${input.title}.`,
    input.description,
    `Tiene ${itemCount(input.lessonCount, "lección", "lecciones")} para practicar de manera sencilla.`,
    durationPhrase(input.durationMin),
    lessons,
    "Cuando estés lista, abre la primera lección disponible y sigue las indicaciones."
  ]);
}

export function buildLessonNarration(input: LessonNarrationInput) {
  const resources = summarizeResources(input.resources ?? []);

  return compact([
    `Estás en la lección ${input.title}.`,
    input.moduleTitle ? `Esta lección pertenece al módulo ${input.moduleTitle}.` : null,
    input.content,
    durationPhrase(input.durationMin),
    resources,
    "Lee o escucha con calma. Cuando termines, marca la lección como completada para guardar tu avance."
  ]);
}

export function buildResourceNarration(resource: LessonNarrationResource) {
  const type = resourceTypeLabels[resource.type] ?? "un recurso";

  return compact([
    `Este recurso se llama ${resource.title}.`,
    `Es ${type} preparado para ayudarte con esta lección.`,
    resource.description,
    "Puedes abrirlo cuando necesites ver un ejemplo, repasar o practicar nuevamente."
  ]);
}

function summarizeResources(resources: LessonNarrationResource[]) {
  if (!resources.length) {
    return "Esta lección no tiene recursos adicionales por ahora. Puedes continuar con la explicación principal.";
  }

  const labels = resources.map(
    (resource) => resourceTypeLabels[resource.type] ?? "un recurso"
  );
  const uniqueLabels = Array.from(new Set(labels));

  return `Como apoyo, en esta lección encontrarás ${uniqueLabels.join(", ")}. Úsalos cuando quieras reforzar lo aprendido.`;
}
