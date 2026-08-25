"use client";

import { useActionState, useEffect, useRef } from "react";
import { Send, Smile } from "lucide-react";
import { toast } from "sonner";

import { sendMessageAction } from "@/shared/actions/facilitator/actions";

const initialState = { ok: false, message: "" };

export function MessageComposer({ conversationId }: { conversationId: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(
    sendMessageAction,
    initialState
  );

  useEffect(() => {
    if (!state.message) return;
    if (state.ok) {
      toast.success(state.message);
      formRef.current?.reset();
    } else {
      toast.error(state.message);
    }
  }, [state]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="flex flex-col gap-3 sm:flex-row sm:items-center"
    >
      <input type="hidden" name="conversationId" value={conversationId} />
      <label className="flex min-h-14 flex-1 items-center gap-3 rounded-[10px] border border-[#ead4ca] bg-white px-4 text-[#7a5b4a]">
        <span className="sr-only">Escribe un mensaje</span>
        <input
          name="content"
          placeholder="Escribe un mensaje..."
          required
          disabled={pending}
          className="min-w-0 flex-1 bg-transparent outline-none"
        />
        <Smile className="h-5 w-5 text-[#a66a20]" />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="inline-flex min-h-14 items-center justify-center gap-2 rounded-[10px] bg-[#d89b06] px-6 font-ui font-bold text-white shadow-[0_16px_30px_rgba(216,155,6,0.22)] transition-transform duration-300 hover:-translate-y-0.5 disabled:opacity-60"
      >
        <Send className="h-5 w-5" />
        {pending ? "Enviando..." : "Enviar"}
      </button>
    </form>
  );
}
