"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, Send, XCircle } from "lucide-react";
import { toast } from "sonner";

import { applyToOpportunityAction } from "@/shared/actions/opportunities/actions";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/shared/components/ui/dialog";

type ApplyOpportunityButtonProps = {
  opportunityId: string;
  disabledReason?: string;
  applicationLabel?: string;
};

export function ApplyOpportunityButton({
  opportunityId,
  disabledReason,
  applicationLabel
}: ApplyOpportunityButtonProps) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  if (applicationLabel) {
    return (
      <div className="rounded-[12px] border border-[#f0c7bb] bg-white p-4">
        <p className="flex items-center gap-2 font-ui text-sm font-bold text-[#7a3100]">
          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          Ya postulaste
        </p>
        <p className="mt-1 text-sm text-[#5b4a42]">Estado: {applicationLabel}</p>
      </div>
    );
  }

  if (disabledReason) {
    return (
      <Button disabled className="h-14 w-full rounded-full">
        <XCircle className="h-5 w-5" />
        {disabledReason}
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="h-14 w-full rounded-full bg-[#b5245b] text-base text-white hover:bg-[#941647]">
          <Send className="h-5 w-5" />
          Postular
        </Button>
      </DialogTrigger>
      <DialogContent className="border-[#f0c7bb] bg-[#fffaf8]">
        <DialogHeader>
          <DialogTitle>Confirmar postulacion</DialogTitle>
          <DialogDescription>
            Enviaremos tu postulacion a la facilitadora. Luego podras revisar si esta
            en evaluacion, aceptada o rechazada.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-3">
          <DialogClose asChild>
            <Button type="button" variant="outline" className="rounded-full">
              Volver
            </Button>
          </DialogClose>
          <Button
            type="button"
            disabled={pending}
            className="rounded-full bg-[#b5245b] text-white hover:bg-[#941647]"
            onClick={() =>
              startTransition(async () => {
                const response = await applyToOpportunityAction(opportunityId);
                if (response.ok) {
                  toast.success(response.message);
                  setOpen(false);
                } else {
                  toast.error(response.message);
                }
              })
            }
          >
            {pending ? "Enviando..." : "Si, postular"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
