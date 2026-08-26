"use client";

import { useTransition } from "react";
import { toast } from "sonner";

import { createFollowUpAction } from "@/shared/actions/facilitator/actions";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";

export function FollowUpForm({ artisanId }: { artisanId: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <form
      action={(data) =>
        startTransition(async () => {
          const response = await createFollowUpAction(null, data);
          if (response.ok) {
            toast.success(response.message);
          } else {
            toast.error(response.message);
          }
        })
      }
      className="grid gap-5"
    >
      <input type="hidden" name="artisanId" value={artisanId} />
      <input type="hidden" name="occurredAt" value={new Date().toISOString()} />

      <div className="grid gap-5 md:grid-cols-2">
        <label className="grid gap-2 text-body-md font-medium">
          Tipo
          <select
            name="type"
            className="h-12 rounded-[10px] border border-[#ead4ca] bg-white px-3"
          >
            <option value="ACADEMIC">Academico</option>
            <option value="DIGITAL">Digital</option>
            <option value="COMMERCIAL">Comercial</option>
            <option value="WORKSHOP">Taller</option>
            <option value="PERSONAL">Personal</option>
            <option value="OTHER">Otro</option>
          </select>
        </label>
        <label className="grid gap-2 text-body-md font-medium">
          Prioridad
          <select
            name="priority"
            className="h-12 rounded-[10px] border border-[#ead4ca] bg-white px-3"
            defaultValue="MEDIUM"
          >
            <option value="LOW">Baja</option>
            <option value="MEDIUM">Media</option>
            <option value="HIGH">Alta</option>
          </select>
        </label>
      </div>

      <label className="grid gap-2 text-body-md font-medium">
        Observacion
        <Textarea
          required
          name="observation"
          rows={4}
          placeholder="Describe que conversaron, que avance viste o que necesita reforzar."
        />
      </label>
      <label className="grid gap-2 text-body-md font-medium">
        Dificultad identificada
        <Textarea
          name="difficulty"
          rows={2}
          placeholder="Ejemplo: necesita practicar el envio de archivos por correo."
        />
      </label>
      <label className="grid gap-2 text-body-md font-medium">
        Recomendacion
        <Textarea
          name="recommendation"
          rows={2}
          placeholder="Indica una recomendacion clara y facil de seguir."
        />
      </label>
      <label className="grid gap-2 text-body-md font-medium">
        Compromiso acordado
        <Textarea
          name="commitment"
          rows={2}
          placeholder="Ejemplo: practicar dos veces antes del proximo taller."
        />
      </label>

      <div className="grid gap-5 md:grid-cols-2">
        <label className="grid gap-2 text-body-md font-medium">
          Resultado
          <Input
            name="outcome"
            placeholder="Ejemplo: orientacion completada"
            className="h-12 rounded-[10px] border-[#ead4ca]"
          />
        </label>
        <label className="grid gap-2 text-body-md font-medium">
          Proximo seguimiento
          <Input
            name="nextFollowUpAt"
            type="date"
            className="h-12 rounded-[10px] border-[#ead4ca]"
          />
        </label>
      </div>

      <Button disabled={pending} type="submit">
        {pending ? "Guardando..." : "Registrar seguimiento"}
      </Button>
    </form>
  );
}
