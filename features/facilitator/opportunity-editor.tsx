"use client";
import { useTransition } from "react";
import { toast } from "sonner";
import { createAnnouncementAction } from "@/shared/actions/facilitator/actions";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
export function OpportunityEditor() {
  const [pending, startTransition] = useTransition();
  return (
    <form
      action={(data) =>
        startTransition(async () => {
          const response = await createAnnouncementAction(null, data);
          response.ok ? toast.success(response.message) : toast.error(response.message);
        })
      }
      className="grid gap-3 rounded-md border p-4"
    >
      <Input name="title" placeholder="Titulo de la convocatoria" required />
      <Input name="institution" placeholder="Institucion" />
      <Textarea name="body" placeholder="Descripcion" required />
      <select name="type" className="h-10 rounded-md border bg-background px-3">
        <option value="PROGRAM">Programa</option>
        <option value="FAIR">Feria</option>
        <option value="CONTEST">Concurso</option>
        <option value="TRAINING">Capacitacion</option>
        <option value="OTHER">Otro</option>
      </select>
      <Input name="officialUrl" placeholder="Enlace oficial" />
      <label className="flex gap-2">
        <input type="checkbox" name="published" value="true" /> Publicar ahora
      </label>
      <Button type="submit" disabled={pending}>
        Guardar convocatoria
      </Button>
    </form>
  );
}
