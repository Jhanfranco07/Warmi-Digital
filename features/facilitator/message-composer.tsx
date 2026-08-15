"use client";
import { useTransition } from "react";
import { toast } from "sonner";
import { sendMessageAction } from "@/shared/actions/facilitator/actions";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
export function MessageComposer({ conversationId }: { conversationId: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <form
      action={(data) =>
        startTransition(async () => {
          const response = await sendMessageAction(null, data);
          if (response.ok) {
            toast.success(response.message);
          } else {
            toast.error(response.message);
          }
        })
      }
      className="flex gap-2"
    >
      <input type="hidden" name="conversationId" value={conversationId} />
      <Input name="content" placeholder="Escribe un mensaje" required />
      <Button type="submit" size="sm" disabled={pending}>
        Enviar
      </Button>
    </form>
  );
}
