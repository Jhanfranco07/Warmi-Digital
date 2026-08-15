"use server";

import { revalidatePath } from "next/cache";

import { ConversationRepository } from "@/shared/repositories/conversation.repository";
import { requireRole } from "@/shared/server/auth/helpers";
import { messageSendSchema } from "@/shared/validations";

type ActionResult = {
  ok: boolean;
  message: string;
  errors?: Record<string, string[]>;
};

export async function sendArtisanMessageAction(
  _previousState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const session = await requireRole("ARTESANA");
  const parsed = messageSendSchema.safeParse({
    conversationId: formData.get("conversationId"),
    content: formData.get("content")
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: "Escribe un mensaje antes de enviarlo.",
      errors: parsed.error.flatten().fieldErrors
    };
  }

  await new ConversationRepository().sendMessage(
    parsed.data.conversationId,
    session.user.id,
    parsed.data.content
  );

  revalidatePath("/artesana/mensajes");
  return { ok: true, message: "Mensaje enviado." };
}

export async function markArtisanConversationReadAction(
  conversationId: string
): Promise<ActionResult> {
  const session = await requireRole("ARTESANA");
  await new ConversationRepository().markRead(conversationId, session.user.id);
  revalidatePath("/artesana/mensajes");
  return { ok: true, message: "Conversacion leida." };
}
