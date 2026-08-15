"use server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/shared/server/db/prisma";
import { requireRole } from "@/shared/server/auth/helpers";
import { OrderService } from "@/shared/services/marketplace.service";

export async function updateProductAction(_: unknown, formData: FormData) {
  try {
    const session = await requireRole("ARTESANA");
    const id = String(formData.get("productId"));
    const product = await prisma.product.findFirst({
      where: { id, artisanId: session.user.id, deletedAt: null }
    });
    if (!product) throw new Error("No tienes permiso para editar esta pieza.");
    await prisma.product.update({
      where: { id },
      data: {
        name: String(formData.get("name")),
        price: Number(formData.get("price")),
        status: String(formData.get("status")) as import("@prisma/client").ProductStatus,
        description: String(formData.get("description") || ""),
        culturalPhrase: String(formData.get("culturalPhrase") || ""),
        story: String(formData.get("story") || ""),
        technique: String(formData.get("technique") || ""),
        materials: String(formData.get("materials") || ""),
        makingTime: String(formData.get("makingTime") || ""),
        culturalMeaning: String(formData.get("culturalMeaning") || ""),
        available: String(formData.get("status")) === "PUBLISHED"
      }
    });
    revalidatePath("/artesana/mi-vitrina");
    return { ok: true, message: "Pieza actualizada." };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error ? error.message : "No fue posible actualizar la pieza."
    };
  }
}
export async function createOrderAction(_: unknown, formData: FormData) {
  try {
    const session = await requireRole(["ARTESANA", "FACILITADORA", "ADMIN"]);
    const productId = String(formData.get("productId"));
    const quantity = Math.max(1, Number(formData.get("quantity")));
    await new OrderService().request(
      session.user.id,
      productId,
      quantity,
      String(formData.get("notes") || "")
    );
    return { ok: true, message: "Solicitud enviada a la artesana." };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "No fue posible crear el pedido."
    };
  }
}
export async function updateOrderStatusAction(_: unknown, formData: FormData) {
  try {
    const session = await requireRole("ARTESANA");
    const orderId = String(formData.get("orderId"));
    const status = String(formData.get("status")) as import("@prisma/client").OrderStatus;
    await new OrderService().transition(session.user.id, orderId, status);
    revalidatePath("/artesana/mis-pedidos");
    return { ok: true, message: "Estado actualizado." };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error ? error.message : "No fue posible actualizar el pedido."
    };
  }
}
export async function createProductAction(_: unknown, formData: FormData) {
  try {
    const session = await requireRole("ARTESANA");
    const profile = await prisma.profile.findUnique({
      where: { userId: session.user.id }
    });
    if (!profile?.communityId)
      throw new Error("Completa tu comunidad antes de publicar una pieza.");
    const name = String(formData.get("name"));
    const categoryId = String(formData.get("categoryId"));
    const craftTypeId = String(formData.get("craftTypeId"));
    const mainImageFileId = String(formData.get("mainImageFileId") || "");
    const slug = `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`;
    if (mainImageFileId) {
      const file = await prisma.file.findFirst({
        where: {
          id: mainImageFileId,
          ownerId: session.user.id,
          type: "IMAGE"
        }
      });

      if (!file) {
        throw new Error("La imagen principal no pertenece a tu cuenta.");
      }
    }

    const product = await prisma.product.create({
      data: {
        artisanId: session.user.id,
        communityId: profile.communityId,
        categoryId,
        craftTypeId,
        name,
        slug,
        price: Number(formData.get("price")),
        status: String(formData.get("status")) === "PUBLISHED" ? "PUBLISHED" : "DRAFT",
        description: String(formData.get("description") || ""),
        culturalPhrase: String(formData.get("culturalPhrase") || ""),
        story: String(formData.get("story") || ""),
        technique: String(formData.get("technique") || ""),
        materials: String(formData.get("materials") || ""),
        makingTime: String(formData.get("makingTime") || ""),
        culturalMeaning: String(formData.get("culturalMeaning") || "")
      }
    });

    if (mainImageFileId) {
      await prisma.productImage.create({
        data: {
          productId: product.id,
          fileId: mainImageFileId,
          altText: `Foto principal de ${name}`,
          order: 0
        }
      });
    }
    revalidatePath("/artesana/mi-vitrina");
    revalidatePath("/mercado");
    return { ok: true, message: "Pieza guardada." };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "No fue posible guardar la pieza."
    };
  }
}
