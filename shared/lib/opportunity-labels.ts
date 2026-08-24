import {
  AnnouncementApplicationStatus,
  AnnouncementStatus,
  AnnouncementType
} from "@prisma/client";

export const opportunityStatusLabel: Record<AnnouncementStatus, string> = {
  DRAFT: "Borrador",
  PUBLISHED: "Publicada",
  CLOSED: "Cerrada"
};

export const opportunityTypeLabel: Record<AnnouncementType, string> = {
  FAIR: "Feria",
  CONTEST: "Concurso",
  TRAINING: "Capacitacion",
  PROGRAM: "Programa",
  OTHER: "Otra oportunidad"
};

export const opportunityApplicationStatusLabel: Record<
  AnnouncementApplicationStatus,
  string
> = {
  IN_REVIEW: "En evaluacion",
  ACCEPTED: "Aceptada",
  REJECTED: "Rechazada"
};

export function opportunityStatusClass(status: AnnouncementStatus) {
  if (status === AnnouncementStatus.PUBLISHED) return "bg-emerald-100 text-emerald-700";
  if (status === AnnouncementStatus.CLOSED) return "bg-slate-100 text-slate-600";
  return "bg-[#fff2cf] text-[#9a6800]";
}

export function opportunityApplicationStatusClass(
  status: AnnouncementApplicationStatus
) {
  if (status === AnnouncementApplicationStatus.ACCEPTED) {
    return "bg-emerald-100 text-emerald-700";
  }

  if (status === AnnouncementApplicationStatus.REJECTED) {
    return "bg-[#ffe8f0] text-[#9d0f4f]";
  }

  return "bg-[#fff2cf] text-[#9a6800]";
}
