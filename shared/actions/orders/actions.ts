"use server";

import { revalidatePath } from "next/cache";

import { ArtisanOrderService } from "@/shared/services/artisan-order.service";
import { requireRole } from "@/shared/server/auth/helpers";
import {
  cancelArtisanOrderSchema,
  updateArtisanOrderStatusSchema
} from "@/shared/validations/order-schemas";

type ActionResponse = {
  ok: boolean;
  message: string;
};

export async function updateArtisanOrderStatusAction(
  input: unknown
): Promise<ActionResponse> {
  const parsed = updateArtisanOrderStatusSchema.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.errors[0]?.message ?? "Datos del pedido inválidos."
    };
  }

  try {
    const session = await requireRole("ARTESANA");

    await new ArtisanOrderService().updateStatus(
      session.user.id,
      parsed.data.orderId,
      parsed.data.status
    );

    revalidatePath("/artesana/mis-pedidos");
    revalidatePath("/artesana/pedidos");
    revalidatePath(`/artesana/mis-pedidos/${parsed.data.orderId}`);

    return { ok: true, message: "Estado del pedido actualizado." };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error ? error.message : "No fue posible actualizar el pedido."
    };
  }
}

export async function cancelArtisanOrderAction(
  input: unknown
): Promise<ActionResponse> {
  const parsed = cancelArtisanOrderSchema.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.errors[0]?.message ?? "Datos del pedido inválidos."
    };
  }

  try {
    const session = await requireRole("ARTESANA");

    await new ArtisanOrderService().cancel(
      session.user.id,
      parsed.data.orderId,
      parsed.data.reason
    );

    revalidatePath("/artesana/mis-pedidos");
    revalidatePath("/artesana/pedidos");
    revalidatePath(`/artesana/mis-pedidos/${parsed.data.orderId}`);

    return { ok: true, message: "Pedido cancelado con motivo registrado." };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "No fue posible cancelar el pedido."
    };
  }
}
