import publication from "./publication.json" with { type: "json" };

export const LEARNING_PROGRAM = {
  id: "93dc7355-d746-4acd-87df-29f71d16a955",
  title: "Aprender para crecer",
  slug: "aprender-para-crecer",
  modules: [
    {
      id: "7dd54036-26d9-4104-8008-9d559135b461",
      order: 1,
      title: "Módulo 1: Mi celular como herramienta de acceso al Estado",
      status: "available",
      image: {
        src: "/images/learning/modules/module-1-cover.webp",
        alt: "Guía del PDF para crear una cuenta Gmail desde el celular"
      },
      offline: false,
      previousCourseId: "de47675b-fd20-4fbd-b980-41dbd71a94ae"
    },
    {
      id: "48e10986-4700-57fe-9c72-e7ba0272f240",
      order: 2,
      title: "Módulo 2: Oportunidades para mi negocio",
      status: "available",
      image: {
        src: "/images/learning/modules/module-2-cover.webp",
        alt: "Concursos y ferias artesanales del currículo original"
      },
      offline: false,
      previousCourseId: null
    },
    {
      id: "6c96bcdf-0b41-48d2-bdcd-394d06acd9d2",
      order: 3,
      title: "Módulo 3: Herramientas digitales para vender",
      status: "available",
      image: {
        src: "/images/learning/modules/module-3-cover.webp",
        alt: "Guía original para crear un catálogo en WhatsApp Business"
      },
      offline: true,
      previousCourseId: "3889134e-620b-40db-98cf-8f6b2a0c43ec"
    },
    {
      id: "b74c2dcb-8320-556e-a28f-97457334d7ac",
      order: 4,
      title: "Módulo 4: Estrategias de venta y autonomía digital",
      status: "available",
      image: {
        src: "/images/learning/modules/module-4-cover.webp",
        alt: "Artesana e historia cultural presentadas en el currículo original"
      },
      offline: false,
      previousCourseId: null
    }
  ]
} as const;

// Publication is based on the reviewed source status and real content, across all modules.
export const PUBLISHED_PROGRAM_LESSONS = publication
  .filter((session) => session.status === "published" && session.hasContent)
  .map((session) => session.id);

export function isLearningLessonAvailable(
  courseId: string,
  moduleId: string,
  lessonId: string
) {
  if (courseId !== LEARNING_PROGRAM.id) return true;
  const learningModule = LEARNING_PROGRAM.modules.find((item) => item.id === moduleId);
  return Boolean(
    learningModule &&
    publication.some(
      (session) =>
        session.id === lessonId &&
        session.module === learningModule.order &&
        session.status === "published" &&
        session.hasContent
    )
  );
}
export function isLearningModuleAvailable(courseId: string, moduleId: string) {
  return (
    courseId !== LEARNING_PROGRAM.id ||
    LEARNING_PROGRAM.modules.some(
      (learningModule) =>
        learningModule.id === moduleId && learningModule.status === "available"
    )
  );
}

export function availableLearningModules<
  T extends { id: string; lessons?: readonly { id: string }[] }
>(courseId: string, modules: readonly T[]) {
  return modules
    .filter((learningModule) => isLearningModuleAvailable(courseId, learningModule.id))
    .map((learningModule) =>
      courseId === LEARNING_PROGRAM.id && learningModule.lessons
        ? ({
            ...learningModule,
            lessons: learningModule.lessons.filter((lesson) =>
              isLearningLessonAvailable(courseId, learningModule.id, lesson.id)
            )
          } as T)
        : learningModule
    );
}

export function learningProgress(
  course: {
    id: string;
    modules: readonly { id: string; lessons: readonly { id: string }[] }[];
  },
  progresses: readonly { lessonId: string; completed: boolean }[]
) {
  const lessonIds = new Set(
    availableLearningModules(course.id, course.modules).flatMap((learningModule) =>
      learningModule.lessons.map((lesson) => lesson.id)
    )
  );
  const completedIds = new Set(
    progresses
      .filter((progress) => progress.completed && lessonIds.has(progress.lessonId))
      .map((progress) => progress.lessonId)
  );
  return {
    totalLessons: lessonIds.size,
    completedLessons: completedIds.size,
    percentage: lessonIds.size
      ? Math.round((completedIds.size / lessonIds.size) * 100)
      : 0
  };
}

export function moduleCapability(moduleId: string) {
  return LEARNING_PROGRAM.modules.find(
    (learningModule) => learningModule.id === moduleId
  );
}

export function acceptsOfflineCourse(
  moduleId: string,
  storedCourseId: string,
  courseId: string
) {
  const capability = moduleCapability(moduleId);
  return (
    courseId === storedCourseId ||
    Boolean(
      capability &&
      (courseId === LEARNING_PROGRAM.id || courseId === capability.previousCourseId)
    )
  );
}
