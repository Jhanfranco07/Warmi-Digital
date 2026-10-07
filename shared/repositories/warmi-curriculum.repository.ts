import { Prisma } from "@prisma/client";
import { prisma } from "@/shared/server/db/prisma";
import { LEARNING_PROGRAM, learningProgress } from "@/shared/learning/program";
import { WARMI_CURRICULUM } from "@/shared/learning/curriculum";
import videos from "@/shared/learning/curriculum-videos.json";

const videoAssignments = [
  {
    name: "video01",
    lessonId: "699a22ef-7d43-4133-8710-96b33284396a",
    title: "Enviar documentos adjuntos en Gmail"
  },
  {
    name: "video05",
    lessonId: "8bf80b24-f90c-5cba-a1d1-3b3aacc7c606",
    title: "Convertir una foto a PDF desde el celular"
  },
  {
    name: "video06",
    lessonId: "8bf80b24-f90c-5cba-a1d1-3b3aacc7c606",
    title: "Tomar una buena foto del producto"
  }
];

export class WarmiCurriculumRepository {
  constructor(private readonly db = prisma) {}

  inspect() {
    return this.db.course.findUnique({
      where: { id: LEARNING_PROGRAM.id },
      include: {
        modules: {
          orderBy: { order: "asc" },
          include: {
            lessons: {
              orderBy: { order: "asc" },
              include: {
                lessonFiles: { include: { file: true }, orderBy: { id: "asc" } }
              }
            }
          }
        }
      }
    });
  }

  async publish() {
    return this.db.$transaction(
      async (tx) => {
        await tx.$queryRaw(Prisma.sql`SELECT pg_advisory_xact_lock(73032026)::text`);
        const course = await tx.course.findUniqueOrThrow({
          where: { id: LEARNING_PROGRAM.id }
        });
        if (course.deletedAt || course.status !== "PUBLISHED")
          throw new Error("El programa publicado no coincide.");
        const originals = await tx.lessonFile.findMany({
          where: { lesson: { module: { courseId: course.id } } },
          include: { file: true },
          orderBy: { id: "asc" }
        });
        const originalVideoLinks = originals.filter((r) =>
          r.file?.publicId?.startsWith("WARMI - VIDEOS/")
        );
        const expected = ["02", "03", "04", "08", "07", "09"];
        if (
          expected.some(
            (n) =>
              originalVideoLinks.filter(
                (r) => r.file?.publicId === `WARMI - VIDEOS/video${n}`
              ).length !== 1
          )
        )
          throw new Error("Las seis relaciones originales de video no coinciden.");
        const protectedVideoFiles = await tx.file.findMany({
          where: { publicId: { in: expected.map((n) => `WARMI - VIDEOS/video${n}`) } },
          orderBy: { id: "asc" }
        });
        if (protectedVideoFiles.length !== 6)
          throw new Error("Hay videos originales ausentes o duplicados.");
        const historical = await tx.lesson.findUniqueOrThrow({
          where: { id: "5a317a3f-dc5c-4000-b059-ddf8b5f9e149" }
        });
        const created = { modules: 0, lessons: 0, files: 0, resources: 0 };

        async function appendResource(
          lessonId: string,
          key: string,
          data: Omit<Prisma.LessonFileUncheckedCreateInput, "lessonId" | "position">
        ) {
          const existing = await tx.lessonFile.findMany({
            where: {
              lessonId,
              OR: [{ externalId: key }, ...(data.fileId ? [{ fileId: data.fileId }] : [])]
            }
          });
          if (existing.length > 1) throw new Error(`Recurso duplicado: ${key}`);
          if (existing[0]) {
            if (
              existing[0].fileId !== (data.fileId ?? null) ||
              existing[0].type !== data.type ||
              existing[0].originalUrl !== (data.originalUrl ?? null)
            )
              throw new Error(`Recurso incompatible: ${key}`);
            return;
          }
          const last = await tx.lessonFile.aggregate({
            where: { lessonId },
            _max: { position: true }
          });
          await tx.lessonFile.create({
            data: {
              ...data,
              externalId: key,
              lessonId,
              position: (last._max.position ?? -1) + 1
            }
          });
          created.resources++;
        }

        for (const learningModule of LEARNING_PROGRAM.modules) {
          const current = await tx.module.findUnique({
            where: { id: learningModule.id }
          });
          if (current && current.courseId !== course.id)
            throw new Error("Un módulo pertenece a otro curso.");
          const description = WARMI_CURRICULUM.sessions
            .filter((s) => s.module === learningModule.order)
            .map((s) => s.title)
            .join(" · ");
          if (!current) {
            await tx.module.create({
              data: {
                id: learningModule.id,
                courseId: course.id,
                title: learningModule.title,
                order: learningModule.order,
                description
              }
            });
            created.modules++;
          } else if (
            current.title !== learningModule.title ||
            current.order !== learningModule.order ||
            current.description !== description
          ) {
            await tx.module.update({
              where: { id: learningModule.id },
              data: {
                title: learningModule.title,
                order: learningModule.order,
                description
              }
            });
          }
          for (const session of WARMI_CURRICULUM.sessions.filter(
            (s) => s.module === learningModule.order
          )) {
            const existing = await tx.lesson.findUnique({ where: { id: session.id } });
            if (existing && existing.moduleId !== learningModule.id)
              throw new Error(`La sesión ${session.id} cambió de módulo.`);
            if (!existing) {
              if (await tx.lesson.findUnique({ where: { slug: session.slug } }))
                throw new Error("Slug de sesión ocupado por otro registro.");
              await tx.lesson.create({
                data: {
                  id: session.id,
                  moduleId: learningModule.id,
                  title: session.title,
                  slug: session.slug,
                  content: session.content,
                  order: session.order,
                  type: "TEXT"
                }
              });
              created.lessons++;
            } else if (
              existing.title !== session.title ||
              existing.content !== session.content ||
              existing.order !== session.order
            ) {
              // Preserve the existing ID, slug, durations, resources and progress history.
              await tx.lesson.update({
                where: { id: session.id },
                data: {
                  title: session.title,
                  content: session.content,
                  order: session.order
                }
              });
            }
            for (const assignment of videoAssignments.filter(
              (v) => v.lessonId === session.id
            )) {
              const video = videos.find(
                (v) => v.publicId === `WARMI - VIDEOS/${assignment.name}`
              )!;
              const matches = await tx.file.findMany({
                where: { OR: [{ publicId: video.publicId }, { url: video.url }] }
              });
              if (matches.length > 1)
                throw new Error(`File duplicado: ${video.publicId}`);
              let file = matches[0];
              if (
                file &&
                (file.url !== video.url ||
                  file.publicId !== video.publicId ||
                  file.size !== video.bytes ||
                  file.mimeType !== "video/mp4")
              )
                throw new Error("File de video incompatible.");
              if (!file) {
                file = await tx.file.create({
                  data: {
                    url: video.url,
                    publicId: video.publicId,
                    provider: "cloudinary",
                    type: "VIDEO",
                    mimeType: "video/mp4",
                    size: video.bytes,
                    width: video.width,
                    height: video.height,
                    metadata: {
                      durationSeconds: video.duration,
                      originalName: `${assignment.name}.mp4`
                    }
                  }
                });
                created.files++;
              }
              await appendResource(session.id, video.publicId, {
                fileId: file.id,
                type: "VIDEO_UPLOAD",
                title: assignment.title,
                provider: "cloudinary",
                originalUrl: video.url,
                description: null
              });
            }
            if (session.module === 1 && session.order === 1)
              await appendResource(session.id, "curriculum-gmail-support", {
                type: "EXTERNAL_LINK",
                title: historical.title,
                provider: "warmi",
                originalUrl: `/artesana/aprender/${course.id}/lecciones/${historical.id}`,
                description: historical.content
              });
            for (const guide of session.guides) {
              const matches = await tx.file.findMany({
                where: { OR: [{ id: guide.id }, { url: guide.src }] }
              });
              if (matches.length > 1) throw new Error(`Guía duplicada: ${guide.src}`);
              let file = matches[0];
              if (
                file &&
                (file.provider !== "warmi-curriculum" ||
                  file.url !== guide.src ||
                  file.mimeType !== "image/webp" ||
                  file.size !== guide.size)
              )
                throw new Error("Guía existente incompatible; revisar la edición.");
              if (!file) {
                file = await tx.file.create({
                  data: {
                    id: guide.id,
                    url: guide.src,
                    provider: "warmi-curriculum",
                    type: "IMAGE",
                    mimeType: "image/webp",
                    size: guide.size,
                    width: guide.width,
                    height: guide.height,
                    altText: guide.alt,
                    metadata: {
                      sourceSha256: WARMI_CURRICULUM.source.sha256,
                      sourcePage: guide.page,
                      originalName: guide.src.split("/").pop()!
                    }
                  }
                });
                created.files++;
              }
              await appendResource(session.id, `curriculum-page-${guide.page}`, {
                fileId: file.id,
                type: "IMAGE",
                title: guide.title,
                description: guide.alt,
                provider: "warmi-curriculum",
                originalUrl: guide.src
              });
            }
          }
          const published = await tx.lesson.findMany({
            where: {
              id: {
                in: WARMI_CURRICULUM.sessions
                  .filter((s) => s.module === learningModule.order)
                  .map((s) => s.id)
              }
            }
          });
          const durationMin = published.reduce(
            (sum, lesson) => sum + (lesson.durationMin ?? 0),
            0
          );
          const after = await tx.module.findUniqueOrThrow({
            where: { id: learningModule.id }
          });
          if (after.durationMin !== durationMin)
            await tx.module.update({
              where: { id: learningModule.id },
              data: { durationMin }
            });
        }
        const afterResources = await tx.lessonFile.findMany({
          where: { id: { in: originals.map((r) => r.id) } },
          include: { file: true },
          orderBy: { id: "asc" }
        });
        const afterVideos = await tx.file.findMany({
          where: { id: { in: protectedVideoFiles.map((f) => f.id) } },
          orderBy: { id: "asc" }
        });
        if (
          JSON.stringify(originals) !== JSON.stringify(afterResources) ||
          JSON.stringify(protectedVideoFiles) !== JSON.stringify(afterVideos)
        )
          throw new Error(
            "Cambió un File/LessonFile original: se cancela toda la publicación."
          );
        if (
          JSON.stringify(historical) !==
          JSON.stringify(
            await tx.lesson.findUniqueOrThrow({ where: { id: historical.id } })
          )
        )
          throw new Error("Cambió la introducción histórica Gmail.");
        const updated = await tx.course.findUniqueOrThrow({
          where: { id: course.id },
          include: { modules: { include: { lessons: true } } }
        });
        const enrollments = await tx.enrollment.findMany({
          where: { courseId: course.id },
          include: { lessonProgresses: true }
        });
        for (const enrollment of enrollments) {
          const progress = learningProgress(updated, enrollment.lessonProgresses);
          await tx.courseProgress.upsert({
            where: { enrollmentId: enrollment.id },
            create: { enrollmentId: enrollment.id, ...progress },
            update: progress
          });
        }
        return {
          created,
          publishedSessions: WARMI_CURRICULUM.sessions.length,
          preservedOriginalResources: originals.length,
          preservedModule3Videos: 6,
          lessonProgressUnchanged: true
        };
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable, timeout: 120000 }
    );
  }
}
