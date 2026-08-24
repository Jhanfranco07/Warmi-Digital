"use client";

import * as React from "react";
import { OrderStatus } from "@prisma/client";
import { ArrowRight, Ban, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import {
  artisanOrderNextLabel,
  artisanOrderNextStatus,
  artisanOrderStatusLabel
} from "@/shared/lib/order-labels";
import {
  cancelArtisanOrderAction,
  updateArtisanOrderStatusAction
} from "@/shared/actions/orders/actions";

type ArtisanOrderActionsProps = {
  orderId: string;
  status: OrderStatus;
};

const finalStatusSet = new Set<OrderStatus>([
  OrderStatus.CANCELLED,
  OrderStatus.COMPLETED
]);

export function ArtisanOrderActions({ orderId, status }: ArtisanOrderActionsProps) {
  const router = useRouter();
  const [isUpdating, startUpdateTransition] = React.useTransition();
  const [isCancelling, startCancelTransition] = React.useTransition();
  const [cancelOpen, setCancelOpen] = React.useState(false);
  const [reason, setReason] = React.useState("");
  const nextStatus = artisanOrderNextStatus[status];
  const canCancel = !finalStatusSet.has(status);

  const updateStatus = () => {
    if (!nextStatus) {
      return;
    }

    startUpdateTransition(async () => {
      const response = await updateArtisanOrderStatusAction({
        orderId,
        status: nextStatus
      });

      if (response.ok) {
        toast.success(response.message);
        router.refresh();
        return;
      }

      toast.error(response.message);
    });
  };

  const cancelOrder = () => {
    startCancelTransition(async () => {
      const response = await cancelArtisanOrderAction({
        orderId,
        reason
      });

      if (response.ok) {
        toast.success(response.message);
        setCancelOpen(false);
        setReason("");
        router.refresh();
        return;
      }

      toast.error(response.message);
    });
  };

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Button
        type="button"
        onClick={updateStatus}
        disabled={!nextStatus || isUpdating}
        className="min-h-touch-target rounded-full bg-[#b5245b] px-6 text-white hover:bg-[#8e1746]"
      >
        {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        {nextStatus
          ? artisanOrderNextLabel[status]
          : `Pedido ${artisanOrderStatusLabel[status].toLowerCase()}`}
        {nextStatus ? <ArrowRight className="h-4 w-4" /> : null}
      </Button>

      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogTrigger asChild>
          <Button
            type="button"
            variant="outline"
            disabled={!canCancel}
            className="min-h-touch-target rounded-full border-[#e2a0ba] text-[#b5245b] hover:bg-[#fff0f5]"
          >
            <Ban className="h-4 w-4" />
            Cancelar pedido
          </Button>
        </DialogTrigger>
        <DialogContent className="border-[#e2a0ba] bg-[#fffaf8]">
          <DialogHeader>
            <DialogTitle>Cancelar pedido</DialogTitle>
            <DialogDescription>
              Escribe el motivo para que quede registrado en el historial del pedido.
            </DialogDescription>
          </DialogHeader>
          <label className="grid gap-2 text-sm font-bold text-[#5b4a42]">
            Motivo de cancelación
            <textarea
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Ejemplo: no cuento con el material necesario para preparar esta pieza."
              className="min-h-32 rounded-lg border border-[#d8b9a8] bg-white px-4 py-3 text-base font-normal outline-none focus:border-[#b5245b] focus:ring-2 focus:ring-[#f4b8ce]"
            />
          </label>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setCancelOpen(false)}
            >
              Volver
            </Button>
            <Button
              type="button"
              disabled={reason.trim().length < 8 || isCancelling}
              onClick={cancelOrder}
              className="bg-[#b5245b] text-white hover:bg-[#8e1746]"
            >
              {isCancelling ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Confirmar cancelación
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
