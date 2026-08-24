import {
  AnnouncementApplicationStatus,
  AnnouncementStatus,
  AnnouncementType
} from "@prisma/client";
import { z } from "zod";

const optionalString = (max = 500) =>
  z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
    z.string().trim().max(max).optional()
  );

const optionalUrl = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.string().trim().url("Ingresa un enlace valido.").optional()
);

const optionalUuid = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.string().uuid("Selecciona una opcion valida.").optional()
);

const optionalPositiveInt = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.coerce.number().int().positive("Los cupos deben ser mayores que cero.").optional()
);

export const opportunityFormSchema = z
  .object({
    announcementId: optionalUuid,
    title: z.string().trim().min(3, "Escribe un titulo.").max(180),
    body: z
      .string()
      .trim()
      .min(10, "Describe la convocatoria con un poco mas de detalle.")
      .max(5000),
    type: z.nativeEnum(AnnouncementType).default(AnnouncementType.PROGRAM),
    status: z.nativeEnum(AnnouncementStatus).default(AnnouncementStatus.DRAFT),
    institution: optionalString(180),
    requirements: z.string().trim().min(5, "Agrega los requisitos principales.").max(3000),
    officialUrl: optionalUrl,
    communityId: optionalUuid,
    startsAt: z.coerce.date({ message: "Ingresa la fecha de inicio." }),
    endsAt: z.coerce.date({ message: "Ingresa la fecha limite." }),
    location: z
      .string()
      .trim()
      .min(2, "Indica el lugar o modalidad.")
      .max(180),
    spots: optionalPositiveInt
  })
  .refine((data) => data.endsAt >= data.startsAt, {
    message: "La fecha limite debe ser posterior o igual a la fecha de inicio.",
    path: ["endsAt"]
  });

export const opportunityIdSchema = z.object({
  announcementId: z.string().uuid("Convocatoria invalida.")
});

export const opportunityStatusSchema = opportunityIdSchema.extend({
  status: z.enum([AnnouncementStatus.PUBLISHED, AnnouncementStatus.CLOSED])
});

export const opportunityApplicationReviewSchema = z.object({
  applicationId: z.string().uuid("Postulacion invalida."),
  status: z.enum([
    AnnouncementApplicationStatus.ACCEPTED,
    AnnouncementApplicationStatus.REJECTED
  ]),
  reviewNotes: optionalString(1000)
});

export type OpportunityFormInput = z.infer<typeof opportunityFormSchema>;
