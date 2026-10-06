export const LEARNING_PROGRAM = {
  id: "93dc7355-d746-4acd-87df-29f71d16a955",
  title: "Aprender para crecer",
  slug: "aprender-para-crecer",
  modules: [
    {
      id: "7dd54036-26d9-4104-8008-9d559135b461",
      order: 1,
      title: "Módulo 1: Mi celular como herramienta de acceso al Estado",
      offline: false,
      previousCourseId: "de47675b-fd20-4fbd-b980-41dbd71a94ae"
    },
    {
      id: null,
      order: 2,
      title: "Módulo 2: Oportunidades para mi negocio",
      offline: false,
      previousCourseId: null
    },
    {
      id: "6c96bcdf-0b41-48d2-bdcd-394d06acd9d2",
      order: 3,
      title: "Módulo 3: Herramientas digitales para vender",
      offline: true,
      previousCourseId: "3889134e-620b-40db-98cf-8f6b2a0c43ec"
    },
    {
      id: null,
      order: 4,
      title: "Módulo 4: Estrategias de venta y autonomía digital",
      offline: false,
      previousCourseId: null
    }
  ]
} as const;

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
