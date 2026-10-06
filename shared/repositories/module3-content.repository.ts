import { LessonResourceType, Prisma } from "@prisma/client";
import { prisma } from "@/shared/server/db/prisma";
import { LEARNING_PROGRAM } from "@/shared/learning/program";

type ModuleContent = {
  courseId: string;
  courseTitle: string;
  title: string;
  description: string;
  order: number;
  support: { id: string; title: string }[];
  lessons: {
    title: string;
    slug: string;
    content: string;
    order: number;
    durationMin: number;
    resources: {
      title: string;
      description: string;
      position: number;
      provider: string;
      originalUrl: string;
    }[];
  }[];
};

export class Module3ContentRepository {
  constructor(private readonly db = prisma) {}

  async provision(content: ModuleContent) {
    return this.db.$transaction(
      async (tx) => {
        // Serialize this targeted provisioning operation without changing the course.
        await tx.$queryRaw(
          Prisma.sql`SELECT "id" FROM "Course" WHERE "id" = ${content.courseId} FOR UPDATE`
        );
        const course = await tx.course.findUnique({ where: { id: content.courseId } });
        if (!course || course.deletedAt || course.title !== content.courseTitle) {
          throw new Error(
            "El curso de WhatsApp Business esperado no existe o cambió de identidad."
          );
        }
        const support = await tx.lesson.findMany({
          where: {
            id: { in: content.support.map((item) => item.id) },
            module: { courseId: course.id }
          },
          include: { lessonFiles: { orderBy: { position: "asc" } } },
          orderBy: { id: "asc" }
        });
        if (
          support.length !== content.support.length ||
          content.support.some(
            (item) =>
              !support.some(
                (lesson) => lesson.id === item.id && lesson.title === item.title
              )
          )
        ) {
          throw new Error(
            "No se encontraron las lecciones originales de apoyo dentro del curso."
          );
        }
        const originalSnapshot = JSON.stringify(support);
        const existing = await tx.module.findFirst({
          where: {
            OR: [
              { id: LEARNING_PROGRAM.modules[2].id },
              { courseId: course.id, title: content.title }
            ]
          },
          include: {
            lessons: {
              orderBy: { order: "asc" },
              include: { lessonFiles: { orderBy: { position: "asc" } } }
            }
          }
        });
        if (existing) {
          if (
            existing.order !== content.order ||
            content.lessons.some(
              (item) =>
                !existing.lessons.some(
                  (lesson) =>
                    lesson.title === item.title &&
                    lesson.slug === item.slug &&
                    lesson.order === item.order
                )
            )
          ) {
            throw new Error(
              "El módulo ya existe con otra estructura. No se modificó ni duplicó."
            );
          }
          return { created: false, module: existing, originalsUnchanged: true };
        }
        if (
          await tx.module.findFirst({
            where: { courseId: course.id, order: content.order }
          })
        ) {
          throw new Error("El curso ya tiene otro módulo con order 3. No se modificó.");
        }
        const created = await tx.module.create({
          data: {
            course: { connect: { id: course.id } },
            title: content.title,
            description: content.description,
            order: content.order,
            durationMin: content.lessons.reduce(
              (sum, lesson) => sum + lesson.durationMin,
              0
            ),
            lessons: {
              create: content.lessons.map(({ resources, ...lesson }) => ({
                ...lesson,
                type: "TEXT",
                lessonFiles: {
                  create: resources.map((resource) => ({
                    ...resource,
                    type: LessonResourceType.EXTERNAL_LINK
                  }))
                }
              }))
            }
          },
          include: {
            lessons: {
              orderBy: { order: "asc" },
              include: { lessonFiles: { orderBy: { position: "asc" } } }
            }
          }
        });
        const after = await tx.lesson.findMany({
          where: { id: { in: support.map((lesson) => lesson.id) } },
          include: { lessonFiles: { orderBy: { position: "asc" } } },
          orderBy: { id: "asc" }
        });
        if (JSON.stringify(after) !== originalSnapshot)
          throw new Error("Las lecciones originales cambiaron; se canceló la creación.");
        return { created: true, module: created, originalsUnchanged: true };
      },
      { timeout: 20000 }
    );
  }
}
