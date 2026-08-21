"use client";

import { useTransition } from "react";
import { CheckCircle2, Save } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/shared/components/ui/button";
import { registerAttendanceAction } from "@/shared/actions/facilitator/actions";

export function AttendanceForm({
  workshopId,
  participants
}: {
  workshopId: string;
  participants: Array<{
    community?: string;
    email?: string;
    id: string;
    name: string;
    status?: string;
  }>;
}) {
  const [pending, startTransition] = useTransition();

  if (!participants.length) {
    return (
      <div className="rounded-[14px] border border-dashed border-[#e4c5a7] bg-white p-8 text-center">
        <p className="font-display text-2xl text-[#7a3100]">Sin participantes</p>
        <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[#7a5b4a]">
          Cuando una artesana se inscriba en este taller, aparecerá aquí para registrar
          su asistencia.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {participants.map((participant, index) => (
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
          className="grid gap-4 rounded-[14px] border border-[#eed8bf] bg-white p-4 shadow-[0_12px_28px_rgba(122,73,20,0.05)] md:grid-cols-[48px_1fr_220px_auto]"
        >
          <input type="hidden" name="workshopId" value={workshopId} />
          <input type="hidden" name="userId" value={participant.id} />
          <span className="grid h-12 w-12 place-items-center rounded-full bg-[#fff7e8] font-display text-xl text-[#7a3100]">
            {index + 1}
          </span>
          <div>
            <p className="font-ui text-base font-extrabold text-[#2a211c]">
              {participant.name}
            </p>
            <p className="mt-1 text-sm text-[#7a5b4a]">
              {participant.community ?? "Sin comunidad registrada"}
              {participant.email ? ` · ${participant.email}` : ""}
            </p>
          </div>
          <label className="grid gap-2 text-sm font-bold text-[#7a3100]">
            Estado de asistencia
            <select
              name="status"
              defaultValue={participant.status ?? "ABSENT"}
              className="min-h-11 rounded-[10px] border border-[#ecd0bd] bg-[#fffaf6] px-3 text-[#2a211c] outline-none transition focus:border-[#d89b06] focus:ring-4 focus:ring-[#fff2cf]"
            >
              <option value="PRESENT">Presente</option>
              <option value="ABSENT">Ausente</option>
              <option value="EXCUSED">Justificada</option>
            </select>
          </label>
          <Button
            type="submit"
            disabled={pending}
            className="min-h-11 self-end rounded-[10px] bg-[#d89b06] px-5 text-white hover:bg-[#b77d00]"
          >
            {pending ? (
              <>
                <Save className="h-4 w-4" /> Guardando
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" /> Guardar
              </>
            )}
          </Button>
        </form>
      ))}
    </div>
  );
}
