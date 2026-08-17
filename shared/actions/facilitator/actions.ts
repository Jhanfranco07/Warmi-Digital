"use server";

import { revalidatePath } from "next/cache";
import { FileType, LessonResourceType } from "@prisma/client";

import { parseYouTubeVideoId } from "@/shared/lib/youtube";
import { requireRole } from "@/shared/server/auth/helpers";
import { AnnouncementRepository } from "@/shared/repositories/announcement.repository";
import { CourseRepository } from "@/shared/repositories/course.repository";
import { FileRepository } from "@/shared/repositories/file.repository";
import { WorkshopRepository } from "@/shared/repositories/workshop.repository";
import { FollowUpService, MessagingService } from "@/shared/services/facilitator.service";
import {
  announcementFormSchema,
  attendanceFormSchema,
  courseFormSchema,
  followUpFormSchema,
  lessonFormSchema,
  lessonResourceFormSchema,
  messageFormSchema,
  moduleFormSchema,
  updateCourseFormSchema,
  workshopFormSchema
} from "@/shared/validations";

const result = (ok: boolean, message: string) => ({ ok, message });
const values = (data: FormData) =>
  Object.fromEntries(
    Array.from(data.entries()).map(([key, value]) => [
      key,
      typeof value === "string" && value.trim() === "" ? undefined : value
    ])
  );

function slugify(title: string) {
  return `${title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\\u0300-\\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")}-${Date.now()}`;
}

export async function createFollowUpAction(_: unknown, formData: FormData) {
  try {
    const session = await requireRole("FACILITADORA");
    const input = followUpFormSchema.parse(values(formData));
    await new FollowUpService().create(session.user.id, input.artisanId, {
      ...input,
      occurredAt: input.occurredAt,
      nextFollowUpAt: input.nextFollowUpAt ?? null,
      difficulty: input.difficulty ?? null,
      recommendation: input.recommendation ?? null,
      commitment: input.commitment ?? null,
      outcome: input.outcome ?? null
    });
    revalidatePath(`/facilitadora/artesanas/${input.artisanId}`);
    return result(true, "Seguimiento registrado.");
  } catch (error) {
    return result(
      false,
      error instanceof Error ? error.message : "No fue posible registrar el seguimiento."
    );
  }
}

export async function createCourseAction(_: unknown, formData: FormData) {
  try {
    const session = await requireRole("FACILITADORA");
    const input = courseFormSchema.parse(values(formData));
    await new CourseRepository().create({
      ...input,
      facilitatorId: session.user.id,
      slug: slugify(input.title),
      publishedAt: input.status === "PUBLISHED" ? new Date() : null
    });
    revalidatePath("/facilitadora/cursos");
    return result(true, "Curso creado.");
  } catch (error) {
    return result(
      false,
      error instanceof Error ? error.message : "No fue posible crear el curso."
    );
  }
}

export async function updateCourseAction(_: unknown, formData: FormData) {
  try {
    const session = await requireRole("FACILITADORA");
    const input = updateCourseFormSchema.parse(values(formData));
    await new CourseRepository().update(input.courseId, session.user.id, {
      title: input.title,
      description: input.description ?? null,
      level: input.level,
      status: input.status,
      durationMin: input.durationMin ?? null,
      imageUrl: input.imageUrl ?? null,
      publishedAt: input.status === "PUBLISHED" ? new Date() : null
    });
    revalidatePath(`/facilitadora/cursos/${input.courseId}/editar`);
    revalidatePath("/facilitadora/cursos");
    return result(true, "Curso actualizado.");
  } catch (error) {
    return result(
      false,
      error instanceof Error ? error.message : "No fue posible actualizar el curso."
    );
  }
}

export async function upsertModuleAction(_: unknown, formData: FormData) {
  try {
    const session = await requireRole("FACILITADORA");
    const input = moduleFormSchema.parse(values(formData));
    const course = await new CourseRepository().findManagedCourse(
      session.user.id,
      input.courseId
    );

    if (!course) return result(false, "No tienes acceso a este curso.");

    await new CourseRepository().upsertModule(session.user.id, {
      id: input.moduleId,
      courseId: input.courseId,
      title: input.title,
      description: input.description ?? null,
      order: input.order,
      durationMin: input.durationMin ?? null
    });
    revalidatePath(`/facilitadora/cursos/${input.courseId}/editar`);
    return result(true, input.moduleId ? "Módulo actualizado." : "Módulo creado.");
  } catch (error) {
    return result(
      false,
      error instanceof Error ? error.message : "No fue posible guardar el módulo."
    );
  }
}

export async function upsertLessonAction(_: unknown, formData: FormData) {
  try {
    const session = await requireRole("FACILITADORA");
    const input = lessonFormSchema.parse(values(formData));
    const course = await new CourseRepository().findManagedCourse(
      session.user.id,
      input.courseId
    );
    const moduleBelongsToCourse = course?.modules.some(
      (module) => module.id === input.moduleId
    );

    if (!course || !moduleBelongsToCourse) {
      return result(false, "No tienes acceso a este módulo.");
    }

    const lessonPayload = {
      id: input.lessonId,
      moduleId: input.moduleId,
      title: input.title,
      content: input.content ?? null,
      type: input.type,
      order: input.order,
      durationMin: input.durationMin ?? null
    };

    await new CourseRepository().upsertLesson(
      session.user.id,
      input.lessonId ? lessonPayload : { ...lessonPayload, slug: slugify(input.title) }
    );
    revalidatePath(`/facilitadora/cursos/${input.courseId}/editar`);
    return result(true, input.lessonId ? "Lección actualizada." : "Lección creada.");
  } catch (error) {
    return result(
      false,
      error instanceof Error ? error.message : "No fue posible guardar la lección."
    );
  }
}

export async function addLessonResourceAction(_: unknown, formData: FormData) {
  try {
    const session = await requireRole("FACILITADORA");
    const input = lessonResourceFormSchema.parse(values(formData));
    const repository = new CourseRepository();
    const lesson = await repository.findManagedLesson(
      session.user.id,
      input.courseId,
      input.lessonId
    );

    if (!lesson) return result(false, "No tienes acceso a esta lección.");

    if (input.resourceType === LessonResourceType.VIDEO_UPLOAD) {
      return result(
        false,
        "La subida directa de video queda pendiente. Usa un enlace de YouTube."
      );
    }

    if (input.resourceType === LessonResourceType.VIDEO_YOUTUBE) {
      if (!input.url) return result(false, "Ingresa un enlace de YouTube.");
      const videoId = parseYouTubeVideoId(input.url);
      if (!videoId) return result(false, "El enlace de YouTube no es válido.");

      await repository.createLessonResource({
        lesson: { connect: { id: input.lessonId } },
        type: input.resourceType,
        title: input.title,
        description: input.description ?? null,
        position: input.position,
        provider: "YOUTUBE",
        externalId: videoId,
        originalUrl: input.url
      });
    } else if (input.resourceType === LessonResourceType.EXTERNAL_LINK) {
      if (!input.url) return result(false, "Ingresa un enlace válido.");
      await repository.createLessonResource({
        lesson: { connect: { id: input.lessonId } },
        type: input.resourceType,
        title: input.title,
        description: input.description ?? null,
        position: input.position,
        provider: "EXTERNAL",
        originalUrl: input.url
      });
    } else {
      if (!input.fileId) return result(false, "Sube o selecciona un archivo.");
      const expectedFileType = {
        [LessonResourceType.IMAGE]: FileType.IMAGE,
        [LessonResourceType.PDF]: FileType.DOCUMENT,
        [LessonResourceType.DOCUMENT]: FileType.DOCUMENT,
        [LessonResourceType.AUDIO]: FileType.AUDIO,
        [LessonResourceType.VIDEO_UPLOAD]: FileType.VIDEO
      }[input.resourceType];
      const file = expectedFileType
        ? await new FileRepository().findOwnedByType(
            input.fileId,
            session.user.id,
            expectedFileType
          )
        : null;

      if (!file) return result(false, "El archivo no existe o no corresponde al tipo.");

      await repository.createLessonResource({
        lesson: { connect: { id: input.lessonId } },
        file: { connect: { id: input.fileId } },
        type: input.resourceType,
        title: input.title,
        description: input.description ?? null,
        position: input.position
      });
    }

    revalidatePath(`/facilitadora/cursos/${input.courseId}/editar`);
    revalidatePath(`/artesana/aprender/${input.courseId}/lecciones/${input.lessonId}`);
    return result(true, "Recurso agregado.");
  } catch (error) {
    return result(
      false,
      error instanceof Error ? error.message : "No fue posible agregar el recurso."
    );
  }
}

export async function deleteLessonResourceAction(resourceId: string, courseId: string) {
  try {
    const session = await requireRole("FACILITADORA");
    await new CourseRepository().deleteLessonResource(resourceId, session.user.id);
    revalidatePath(`/facilitadora/cursos/${courseId}/editar`);
    return result(true, "Recurso eliminado.");
  } catch (error) {
    return result(
      false,
      error instanceof Error ? error.message : "No fue posible eliminar el recurso."
    );
  }
}

export async function createWorkshopAction(_: unknown, formData: FormData) {
  try {
    const session = await requireRole("FACILITADORA");
    const input = workshopFormSchema.parse(values(formData));
    await new WorkshopRepository().create({ ...input, facilitatorId: session.user.id });
    revalidatePath("/facilitadora/talleres");
    return result(true, "Taller programado.");
  } catch (error) {
    return result(
      false,
      error instanceof Error ? error.message : "No fue posible programar el taller."
    );
  }
}

export async function registerAttendanceAction(_: unknown, formData: FormData) {
  try {
    const session = await requireRole("FACILITADORA");
    const input = attendanceFormSchema.parse(values(formData));
    const workshop = await new WorkshopRepository().findManagedWorkshop(
      input.workshopId,
      session.user.id
    );
    if (!workshop) return result(false, "No tienes acceso a este taller.");
    await new WorkshopRepository().registerAttendance(
      input.workshopId,
      input.userId,
      session.user.id,
      input.status
    );
    revalidatePath(`/facilitadora/talleres/${input.workshopId}`);
    return result(true, "Asistencia actualizada.");
  } catch (error) {
    return result(
      false,
      error instanceof Error ? error.message : "No fue posible actualizar la asistencia."
    );
  }
}

export async function createAnnouncementAction(_: unknown, formData: FormData) {
  try {
    const session = await requireRole("FACILITADORA");
    const raw = values(formData);
    const input = announcementFormSchema.parse({
      ...raw,
      published: raw.published === "true"
    });
    await new AnnouncementRepository().create({
      ...input,
      authorId: session.user.id,
      publishedAt: input.published ? new Date() : null
    });
    revalidatePath("/facilitadora/convocatorias");
    return result(true, "Convocatoria guardada.");
  } catch (error) {
    return result(
      false,
      error instanceof Error ? error.message : "No fue posible guardar la convocatoria."
    );
  }
}

export async function sendMessageAction(_: unknown, formData: FormData) {
  try {
    const session = await requireRole("FACILITADORA");
    const input = messageFormSchema.parse(values(formData));
    await new MessagingService().send(
      session.user.id,
      input.conversationId,
      input.content
    );
    revalidatePath("/facilitadora/mensajes");
    return result(true, "Mensaje enviado.");
  } catch (error) {
    return result(
      false,
      error instanceof Error ? error.message : "No fue posible enviar el mensaje."
    );
  }
}

export async function openConversationAction(artisanId: string) {
  const session = await requireRole("FACILITADORA");
  return new MessagingService().openWithArtisan(session.user.id, artisanId);
}
