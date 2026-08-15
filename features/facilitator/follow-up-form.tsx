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
      className="grid gap-4"
    >
      <input type="hidden" name="artisanId" value={artisanId} />
      <input type="hidden" name="occurredAt" value={new Date().toISOString()} />
      <input type="hidden" name="priority" value="MEDIUM" />
      <label className="grid gap-2 text-body-md font-medium">
        Tipo
        <select
          name="type"
          className="h-10 rounded-md border border-input bg-background px-3"
        >
          <option value="ACADEMIC">Academico</option>
          <option value="DIGITAL">Digital</option>
          <option value="WORKSHOP">Taller</option>
          <option value="PERSONAL">Personal</option>
          <option value="OTHER">Otro</option>
        </select>
      </label>
      <label className="grid gap-2 text-body-md font-medium">
        Observacion
        <Textarea required name="observation" rows={3} />
      </label>
      <label className="grid gap-2 text-body-md font-medium">
        Recomendacion
        <Textarea name="recommendation" rows={2} />
      </label>
      <label className="grid gap-2 text-body-md font-medium">
        Proximo seguimiento
        <Input name="nextFollowUpAt" type="date" />
      </label>
      <Button disabled={pending} type="submit">
        Registrar seguimiento
      </Button>
    </form>
  );
}
