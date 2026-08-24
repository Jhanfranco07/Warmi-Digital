"use client";

import { useTransition } from "react";
import { AnnouncementStatus } from "@prisma/client";
import { CheckCircle2, Lock } from "lucide-react";
import { toast } from "sonner";

import { setOpportunityStatusAction } from "@/shared/actions/opportunities/actions";
import { Button } from "@/shared/components/ui/button";

type OpportunityStatusControlsProps = {
  opportunityId: string;
  status: AnnouncementStatus;
};

export function OpportunityStatusControls({
  opportunityId,
  status
}: OpportunityStatusControlsProps) {
  const [pending, startTransition] = useTransition();

  const publish = () =>
    startTransition(async () => {
      const response = await setOpportunityStatusAction(
        opportunityId,
        AnnouncementStatus.PUBLISHED
      );
      if (response.ok) {
        toast.success(response.message);
      } else {
        toast.error(response.message);
      }
    });

  const close = () =>
    startTransition(async () => {
      const response = await setOpportunityStatusAction(
        opportunityId,
        AnnouncementStatus.CLOSED
      );
      if (response.ok) {
        toast.success(response.message);
      } else {
        toast.error(response.message);
      }
    });

  return (
    <div className="flex flex-wrap gap-2">
      {status !== AnnouncementStatus.PUBLISHED ? (
        <Button
          type="button"
          disabled={pending || status === AnnouncementStatus.CLOSED}
          onClick={publish}
          className="rounded-full bg-[#d89b06] text-white hover:bg-[#b77d00]"
        >
          <CheckCircle2 className="h-4 w-4" />
          Publicar
        </Button>
      ) : null}
      {status !== AnnouncementStatus.CLOSED ? (
        <Button
          type="button"
          disabled={pending}
          onClick={close}
          variant="outline"
          className="rounded-full border-[#b5245b] text-[#b5245b] hover:bg-[#fff0f5]"
        >
          <Lock className="h-4 w-4" />
          Cerrar
        </Button>
      ) : null}
    </div>
  );
}
