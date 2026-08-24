"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { AnnouncementStatus, AnnouncementType } from "@prisma/client";
import { CalendarDays, MapPin, UsersRound } from "lucide-react";
import { toast } from "sonner";

import {
  createOpportunityAction,
  updateOpportunityAction
} from "@/shared/actions/opportunities/actions";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";

type OpportunityFormValues = {
  id?: string;
  title?: string;
  body?: string;
  type?: AnnouncementType;
  status?: AnnouncementStatus;
  institution?: string | null;
  requirements?: string | null;
  officialUrl?: string | null;
  startsAt?: string;
  endsAt?: string;
  location?: string | null;
  spots?: number | null;
};

type OpportunityFormProps = {
  initialValues?: OpportunityFormValues;
};

const typeOptions: { value: AnnouncementType; label: string }[] = [
  { value: AnnouncementType.FAIR, label: "Feria" },
  { value: AnnouncementType.CONTEST, label: "Concurso" },
  { value: AnnouncementType.TRAINING, label: "Capacitacion" },
  { value: AnnouncementType.PROGRAM, label: "Programa" },
  { value: AnnouncementType.OTHER, label: "Otra oportunidad" }
];

const statusOptions: { value: AnnouncementStatus; label: string }[] = [
  { value: AnnouncementStatus.DRAFT, label: "Borrador" },
  { value: AnnouncementStatus.PUBLISHED, label: "Publicada" },
  { value: AnnouncementStatus.CLOSED, label: "Cerrada" }
];

export function OpportunityForm({ initialValues }: OpportunityFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const isEditing = Boolean(initialValues?.id);

  return (
    <form
      action={(formData) =>
        startTransition(async () => {
          const response = isEditing
            ? await updateOpportunityAction(null, formData)
            : await createOpportunityAction(null, formData);

          if (response.ok) {
            toast.success(response.message);
            if (!isEditing && response.id) {
              router.push(`/facilitadora/convocatorias/${response.id}`);
            } else {
              router.refresh();
            }
          } else {
            toast.error(response.message);
          }
        })
      }
      className="rounded-[16px] border border-[#eed8bf] bg-white p-5 shadow-[0_18px_45px_rgba(122,73,20,0.07)] md:p-7"
    >
      {initialValues?.id ? (
        <input type="hidden" name="announcementId" value={initialValues.id} />
      ) : null}

      <div className="grid gap-5 lg:grid-cols-2">
        <label className="grid gap-2">
          <span className="font-ui text-sm font-bold text-[#6b3f2c]">Titulo</span>
          <Input
            name="title"
            required
            defaultValue={initialValues?.title}
            placeholder="Feria de Artesanas Warmi 2026"
            className="h-12 border-[#e6c8b8]"
          />
        </label>
        <label className="grid gap-2">
          <span className="font-ui text-sm font-bold text-[#6b3f2c]">Institucion</span>
          <Input
            name="institution"
            defaultValue={initialValues?.institution ?? ""}
            placeholder="Warmi Digital"
            className="h-12 border-[#e6c8b8]"
          />
        </label>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <label className="grid gap-2">
          <span className="font-ui text-sm font-bold text-[#6b3f2c]">Tipo</span>
          <select
            name="type"
            defaultValue={initialValues?.type ?? AnnouncementType.PROGRAM}
            className="h-12 rounded-md border border-[#e6c8b8] bg-white px-3 font-ui"
          >
            {typeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-2">
          <span className="font-ui text-sm font-bold text-[#6b3f2c]">Estado</span>
          <select
            name="status"
            defaultValue={initialValues?.status ?? AnnouncementStatus.DRAFT}
            className="h-12 rounded-md border border-[#e6c8b8] bg-white px-3 font-ui"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="mt-5 grid gap-2">
        <span className="font-ui text-sm font-bold text-[#6b3f2c]">Descripcion</span>
        <Textarea
          name="body"
          required
          defaultValue={initialValues?.body}
          placeholder="Explica de forma sencilla de que trata la convocatoria."
          className="min-h-32 border-[#e6c8b8]"
        />
      </label>

      <label className="mt-5 grid gap-2">
        <span className="font-ui text-sm font-bold text-[#6b3f2c]">Requisitos</span>
        <Textarea
          name="requirements"
          required
          defaultValue={initialValues?.requirements ?? ""}
          placeholder="Ejemplo: DNI, fotos de productos, historia breve de la pieza..."
          className="min-h-28 border-[#e6c8b8]"
        />
      </label>

      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <label className="grid gap-2">
          <span className="flex items-center gap-2 font-ui text-sm font-bold text-[#6b3f2c]">
            <CalendarDays className="h-4 w-4" /> Inicio
          </span>
          <Input
            name="startsAt"
            type="datetime-local"
            required
            defaultValue={initialValues?.startsAt}
            className="h-12 border-[#e6c8b8]"
          />
        </label>
        <label className="grid gap-2">
          <span className="flex items-center gap-2 font-ui text-sm font-bold text-[#6b3f2c]">
            <CalendarDays className="h-4 w-4" /> Fecha limite
          </span>
          <Input
            name="endsAt"
            type="datetime-local"
            required
            defaultValue={initialValues?.endsAt}
            className="h-12 border-[#e6c8b8]"
          />
        </label>
        <label className="grid gap-2">
          <span className="flex items-center gap-2 font-ui text-sm font-bold text-[#6b3f2c]">
            <UsersRound className="h-4 w-4" /> Cupos
          </span>
          <Input
            name="spots"
            type="number"
            min="1"
            defaultValue={initialValues?.spots ?? ""}
            placeholder="Opcional"
            className="h-12 border-[#e6c8b8]"
          />
        </label>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_1.2fr]">
        <label className="grid gap-2">
          <span className="flex items-center gap-2 font-ui text-sm font-bold text-[#6b3f2c]">
            <MapPin className="h-4 w-4" /> Lugar o modalidad
          </span>
          <Input
            name="location"
            required
            defaultValue={initialValues?.location ?? ""}
            placeholder="San Miguel, Cajamarca / Virtual"
            className="h-12 border-[#e6c8b8]"
          />
        </label>
        <label className="grid gap-2">
          <span className="font-ui text-sm font-bold text-[#6b3f2c]">
            Enlace oficial
          </span>
          <Input
            name="officialUrl"
            type="url"
            defaultValue={initialValues?.officialUrl ?? ""}
            placeholder="https://..."
            className="h-12 border-[#e6c8b8]"
          />
        </label>
      </div>

      <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          className="h-12 rounded-full border-[#d89b06] px-6 text-[#9a6800]"
          onClick={() => router.back()}
        >
          Volver
        </Button>
        <Button
          type="submit"
          disabled={pending}
          className="h-12 rounded-full bg-[#b5245b] px-8 text-white hover:bg-[#941647]"
        >
          {pending ? "Guardando..." : isEditing ? "Guardar cambios" : "Crear convocatoria"}
        </Button>
      </div>
    </form>
  );
}
