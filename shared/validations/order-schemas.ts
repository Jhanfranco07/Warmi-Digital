import { OrderStatus } from "@prisma/client";
import { z } from "zod";

export const artisanOrderStatusSchema = z.nativeEnum(OrderStatus);

export const artisanOrderIdSchema = z.object({
  orderId: z.string().uuid("Pedido inválido.")
});

export const updateArtisanOrderStatusSchema = artisanOrderIdSchema.extend({
  status: artisanOrderStatusSchema
});

export const cancelArtisanOrderSchema = artisanOrderIdSchema.extend({
  reason: z
    .string()
    .trim()
    .min(8, "Escribe un motivo claro para cancelar el pedido.")
    .max(500, "El motivo es demasiado largo.")
});

export type UpdateArtisanOrderStatusInput = z.infer<
  typeof updateArtisanOrderStatusSchema
>;
export type CancelArtisanOrderInput = z.infer<typeof cancelArtisanOrderSchema>;
