"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MessageCirclePlus } from "lucide-react";
import { toast } from "sonner";

import { startConversationAction } from "@/shared/actions/facilitator/actions";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/shared/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/shared/components/ui/select";

type ConversationArtisan = {
  id: string;
  name: string;
  community: string;
  specialty: string;
};

type StartConversationFormState = {
  ok: boolean;
  message: string;
  conversationId: string | null;
};

const initialState: StartConversationFormState = {
  ok: false,
  message: "",
  conversationId: null
};

export function StartConversationForm({
  artisans
}: {
  artisans: ConversationArtisan[];
}) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    startConversationAction,
    initialState
  );

  useEffect(() => {
    if (!state.message) return;
    if (state.ok && state.conversationId) {
      toast.success(state.message);
      router.push(`/facilitadora/mensajes?conversation=${state.conversationId}`);
      router.refresh();
    } else {
      toast.error(state.message);
    }
  }, [router, state]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="min-h-12 rounded-[10px] bg-[#d89b06] px-5 font-ui font-bold text-white hover:bg-[#b77900]">
          <MessageCirclePlus className="h-4 w-4" />
          Nuevo mensaje
        </Button>
      </DialogTrigger>
      <DialogContent className="border-[#eed8bf] bg-[#fffaf6]">
        <DialogHeader>
          <DialogTitle className="text-[#8a1747]">
            Escribir a una artesana
          </DialogTitle>
          <DialogDescription>
            Selecciona una artesana acompañada para abrir su conversación.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          <Select name="artisanId" required>
            <SelectTrigger className="min-h-12 rounded-[10px] border-[#ead4ca] bg-white">
              <SelectValue placeholder="Selecciona una artesana" />
            </SelectTrigger>
            <SelectContent>
              {artisans.map((artisan) => (
                <SelectItem key={artisan.id} value={artisan.id}>
                  {artisan.name} - {artisan.community} - {artisan.specialty}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            type="submit"
            disabled={pending || artisans.length === 0}
            className="min-h-12 w-full rounded-[10px] bg-[#d89b06] font-ui font-bold text-white hover:bg-[#b77900]"
          >
            {pending ? "Abriendo..." : "Abrir conversación"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
