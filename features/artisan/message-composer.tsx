"use client";

import { useActionState, useEffect, useRef } from "react";
import { Send, Smile } from "lucide-react";
import { toast } from "sonner";

import { sendArtisanMessageAction } from "@/shared/actions/artisan/messages";

type MessageComposerProps = {
  conversationId: string;
};

const initialState = { ok: false, message: "" };

export function MessageComposer({ conversationId }: MessageComposerProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, isPending] = useActionState(
    sendArtisanMessageAction,
    initialState
  );

  useEffect(() => {
    if (!state.message) return;
    if (state.ok) {
      toast.success(state.message);
    } else {
      toast.error(state.message);
    }
    if (state.ok) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="flex items-center gap-4">
      <input type="hidden" name="conversationId" value={conversationId} />
      <label className="flex min-h-14 flex-1 items-center gap-3 rounded-lg border border-[#ecd0bd] bg-white px-4 text-[#7a5b4a]">
        <span className="sr-only">Escribe un mensaje</span>
        <input
          name="content"
          placeholder="Escribe un mensaje..."
          className="min-w-0 flex-1 bg-transparent outline-none"
          disabled={isPending}
        />
        <Smile className="h-5 w-5" />
      </label>
      <button
        type="submit"
        disabled={isPending}
        className="grid h-14 w-14 place-items-center rounded-lg bg-[#b5245b] text-white shadow-[0_16px_30px_rgba(181,36,91,0.25)] transition-transform duration-300 hover:-translate-y-1 disabled:opacity-60"
        aria-label="Enviar mensaje"
      >
        <Send className="h-6 w-6" />
      </button>
    </form>
  );
}
