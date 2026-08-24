"use server";

import { revalidatePath } from "next/cache";
import { AnnouncementApplicationStatus, AnnouncementStatus } from "@prisma/client";

import { ArtisanRepository } from "@/shared/repositories/artisan.repository";
import { OpportunityService } from "@/shared/services/opportunity.service";
import { requireRole } from "@/shared/server/auth/helpers";
import {
  opportunityApplicationReviewSchema,
  opportunityFormSchema,
  opportunityIdSchema,
  opportunityStatusSchema
} from "@/shared/validations";

type ActionResult = {
  ok: boolean;
  message: string;
  id?: string;
};

const result = (ok: boolean, message: string, id?: string): ActionResult => ({
  ok,
  message,
  id
});

const values = (data: FormData) =>
  Object.fromEntries(
    Array.from(data.entries()).map(([key, value]) => [
      key,
      typeof value === "string" && value.trim() === "" ? undefined : value
    ])
  );

export async function createOpportunityAction(
  _: unknown,
  formData: FormData
): Promise<ActionResult> {
  try {
    const session = await requireRole("FACILITADORA");
    const input = opportunityFormSchema.parse(values(formData));
    const opportunity = await new OpportunityService().create(session.user.id, input);

    revalidatePath("/facilitadora/convocatorias");
    return result(true, "Convocatoria creada.", opportunity.id);
  } catch (error) {
    return result(
      false,
      error instanceof Error ? error.message : "No fue posible crear la convocatoria."
    );
  }
}

export async function updateOpportunityAction(
  _: unknown,
  formData: FormData
): Promise<ActionResult> {
  try {
    const session = await requireRole("FACILITADORA");
    const input = opportunityFormSchema.parse(values(formData));
    await new OpportunityService().update(session.user.id, input);

    revalidatePath("/facilitadora/convocatorias");
    if (input.announcementId) {
      revalidatePath(`/facilitadora/convocatorias/${input.announcementId}`);
      revalidatePath(`/facilitadora/convocatorias/${input.announcementId}/editar`);
    }

    return result(true, "Convocatoria actualizada.", input.announcementId);
  } catch (error) {
    return result(
      false,
      error instanceof Error ? error.message : "No fue posible actualizar la convocatoria."
    );
  }
}

export async function setOpportunityStatusAction(
  announcementId: string,
  status: "PUBLISHED" | "CLOSED"
): Promise<ActionResult> {
  try {
    const session = await requireRole("FACILITADORA");
    const input = opportunityStatusSchema.parse({ announcementId, status });
    const service = new OpportunityService();

    if (input.status === AnnouncementStatus.PUBLISHED) {
      await service.publish(input.announcementId, session.user.id);
    } else {
      await service.close(input.announcementId, session.user.id);
    }

    revalidatePath("/facilitadora/convocatorias");
    revalidatePath(`/facilitadora/convocatorias/${input.announcementId}`);
    revalidatePath("/artesana/convocatorias");

    return result(
      true,
      input.status === AnnouncementStatus.PUBLISHED
        ? "Convocatoria publicada."
        : "Convocatoria cerrada."
    );
  } catch (error) {
    return result(
      false,
      error instanceof Error ? error.message : "No fue posible cambiar el estado."
    );
  }
}

export async function applyToOpportunityAction(
  announcementId: string
): Promise<ActionResult> {
  try {
    const session = await requireRole("ARTESANA");
    const input = opportunityIdSchema.parse({ announcementId });
    const artisan = await new ArtisanRepository().findProfile(session.user.id);

    await new OpportunityService().apply(
      input.announcementId,
      session.user.id,
      artisan?.profile?.communityId
    );

    revalidatePath("/artesana/convocatorias");
    revalidatePath(`/artesana/convocatorias/${input.announcementId}`);
    return result(true, "Tu postulacion fue enviada. Ahora esta en evaluacion.");
  } catch (error) {
    return result(
      false,
      error instanceof Error ? error.message : "No fue posible enviar tu postulacion."
    );
  }
}

export async function reviewOpportunityApplicationAction(
  _: unknown,
  formData: FormData
): Promise<ActionResult> {
  try {
    const session = await requireRole("FACILITADORA");
    const raw = values(formData);
    const input = opportunityApplicationReviewSchema.parse(raw);
    const { announcementId } = opportunityIdSchema.parse(raw);

    await new OpportunityService().reviewApplication(
      input.applicationId,
      session.user.id,
      input.status,
      input.reviewNotes
    );

    revalidatePath(`/facilitadora/convocatorias/${announcementId}`);
    revalidatePath("/facilitadora/convocatorias");
    revalidatePath("/artesana/convocatorias");

    return result(
      true,
      input.status === AnnouncementApplicationStatus.ACCEPTED
        ? "Postulacion aceptada."
        : "Postulacion rechazada."
    );
  } catch (error) {
    return result(
      false,
      error instanceof Error ? error.message : "No fue posible revisar la postulacion."
    );
  }
}
