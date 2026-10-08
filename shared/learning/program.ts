import { MODULE4_ID } from "@/shared/learning/module4";

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
        src: "/images/discover/recursos.png",
        alt: "Artesanas usando celulares y una computadora en una capacitación digital"
      },
      offline: false,
      previousCourseId: "de47675b-fd20-4fbd-b980-41dbd71a94ae"
    },
    {
      id: "c156c5d5-8c81-48f8-85d4-234ecb21ec0e",
      order: 2,
      title: "Módulo 2: Oportunidades para mi negocio",
      status: "available",
      image: {
        src: "/images/discover/aprende.png",
        alt: "Artesanas participando en una capacitación con sus celulares"
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
        src: "/images/discover/emprende.png",
        alt: "Artesana fotografiando un tejido con su celular"
      },
      // Currently the only module enabled for new offline downloads.
      offline: true,
      previousCourseId: "3889134e-620b-40db-98cf-8f6b2a0c43ec"
    },
    {
      id: MODULE4_ID,
      order: 4,
      title: "Módulo 4: Estrategias de venta y autonomía digital",
      status: "available",
      image: {
        src: "/images/learning/module4/qallwa.webp",
        alt: "Artesana trabajando un tejido en qallwa de colores"
      },
      offline: false,
      previousCourseId: null
    }
  ]
} as const;

export function isArtisanLearningCourse(courseId: string) {
  return courseId === LEARNING_PROGRAM.id;
}

// Only real, available content participates in the program. Historical data stays in DB.
export function isLearningModuleAvailable(courseId: string, moduleId: string) {
  return (
    courseId !== LEARNING_PROGRAM.id ||
    LEARNING_PROGRAM.modules.some(
      (module) => module.id === moduleId && module.status === "available"
    )
  );
}

export function availableLearningModules<T extends { id: string }>(
  courseId: string,
  modules: readonly T[]
) {
  return modules.filter((module) => isLearningModuleAvailable(courseId, module.id));
}

export function learningProgress(
  course: {
    id: string;
    modules: readonly { id: string; lessons: readonly { id: string }[] }[];
  },
  progresses: readonly { lessonId: string; completed: boolean }[]
) {
  const lessonIds = new Set(
    availableLearningModules(course.id, course.modules).flatMap((module) =>
      module.lessons.map((lesson) => lesson.id)
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
  return LEARNING_PROGRAM.modules.find((module) => module.id === moduleId);
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
