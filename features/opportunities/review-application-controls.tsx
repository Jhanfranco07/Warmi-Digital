"use client";

import { useTransition } from "react";
import { AnnouncementApplicationStatus } from "@prisma/client";
import { Check, X } from "lucide-react";
import { toast } from "sonner";

import { reviewOpportunityApplicationAction } from "@/shared/actions/opportunities/actions";
import { Button } from "@/shared/components/ui/button";

type ReviewApplicationControlsProps = {
  announcementId: string;
  applicationId: string;
  currentStatus: AnnouncementApplicationStatus;
};

export function ReviewApplicationControls({
  announcementId,
  applicationId,
  currentStatus
}: ReviewApplicationControlsProps) {
  const [pending, startTransition] = useTransition();

  const review = (status: AnnouncementApplicationStatus) => {
    const formData = new FormData();
    formData.set("announcementId", announcementId);
    formData.set("applicationId", applicationId);
    formData.set("status", status);

    startTransition(async () => {
      const response = await reviewOpportunityApplicationAction(null, formData);
      if (response.ok) {
        toast.success(response.message);
      } else {
        toast.error(response.message);
      }
    });
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        type="button"
        size="sm"
        disabled={pending || currentStatus === AnnouncementApplicationStatus.ACCEPTED}
        onClick={() => review(AnnouncementApplicationStatus.ACCEPTED)}
        className="rounded-full bg-emerald-600 text-white hover:bg-emerald-700"
      >
        <Check className="h-4 w-4" />
        Aprobar
      </Button>
      <Button
        type="button"
        size="sm"
        disabled={pending || currentStatus === AnnouncementApplicationStatus.REJECTED}
        onClick={() => review(AnnouncementApplicationStatus.REJECTED)}
        variant="outline"
        className="rounded-full border-[#b5245b] text-[#b5245b] hover:bg-[#fff0f5]"
      >
        <X className="h-4 w-4" />
        Rechazar
      </Button>
    </div>
  );
}
