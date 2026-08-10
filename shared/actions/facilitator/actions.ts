"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/shared/server/auth/helpers";
import { AnnouncementRepository } from "@/shared/repositories/announcement.repository";
import { CourseRepository } from "@/shared/repositories/course.repository";
import { WorkshopRepository } from "@/shared/repositories/workshop.repository";
import { FollowUpService, MessagingService } from "@/shared/services/facilitator.service";
import {
  announcementFormSchema,
  attendanceFormSchema,
  courseFormSchema,
  followUpFormSchema,
  messageFormSchema,
  workshopFormSchema
} from "@/shared/validations";

const result = (ok: boolean, message: string) => ({ ok, message });
const values = (data: FormData) => Object.fromEntries(data.entries());

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
    const slug = `${input.title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\\u0300-\\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")}-${Date.now()}`;
    await new CourseRepository().create({
      ...input,
      facilitatorId: session.user.id,
      slug,
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
