"use client";
import { useTransition } from "react";
import { toast } from "sonner";
import { createWorkshopAction } from "@/shared/actions/facilitator/actions";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
export function WorkshopEditor() {
  const [pending, startTransition] = useTransition();
  return (
    <form
      action={(data) =>
        startTransition(async () => {
          const response = await createWorkshopAction(null, data);
          response.ok ? toast.success(response.message) : toast.error(response.message);
        })
      }
      className="grid gap-4"
    >
      <Input name="title" placeholder="Nombre del taller" required />
      <Textarea name="description" placeholder="Descripción" />
      <select name="mode" className="h-10 rounded-md border bg-background px-3">
        <option value="IN_PERSON">Presencial</option>
        <option value="VIRTUAL">Virtual</option>
        <option value="HYBRID">Hibrido</option>
      </select>
      <input type="hidden" name="status" value="SCHEDULED" />
      <Input name="location" placeholder="Lugar" />
      <Textarea name="materials" placeholder="Materiales" />
      <Input name="startsAt" type="datetime-local" required />
      <Input name="endsAt" type="datetime-local" required />
      <Button type="submit" disabled={pending}>
        Programar taller
      </Button>
    </form>
  );
}
