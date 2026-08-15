"use client";
import { useTransition } from "react";
import { toast } from "sonner";
import { registerAttendanceAction } from "@/shared/actions/facilitator/actions";
import { Button } from "@/shared/components/ui/button";
export function AttendanceForm({
  workshopId,
  participants
}: {
  workshopId: string;
  participants: Array<{ id: string; name: string; status?: string }>;
}) {
  const [pending, startTransition] = useTransition();
  return (
    <div className="space-y-3">
      {participants.map((participant) => (
        <form
          key={participant.id}
          action={(data) =>
            startTransition(async () => {
              const response = await registerAttendanceAction(null, data);
              if (response.ok) {
                toast.success(response.message);
              } else {
                toast.error(response.message);
              }
            })
          }
          className="flex flex-wrap items-center justify-between gap-3 rounded-md border p-3"
        >
          <input type="hidden" name="workshopId" value={workshopId} />
          <input type="hidden" name="userId" value={participant.id} />
          <span className="font-medium">{participant.name}</span>
          <select
            name="status"
            defaultValue={participant.status ?? "ABSENT"}
            className="h-9 rounded-md border bg-background px-2"
          >
            <option value="PRESENT">Presente</option>
            <option value="ABSENT">Ausente</option>
            <option value="EXCUSED">Justificada</option>
          </select>
          <Button type="submit" size="sm" disabled={pending}>
            Guardar
          </Button>
        </form>
      ))}
    </div>
  );
}
