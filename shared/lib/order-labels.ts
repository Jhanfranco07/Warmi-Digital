import { OrderStatus } from "@prisma/client";

export const artisanOrderStatusLabel: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: "Nuevo",
  [OrderStatus.CONFIRMED]: "Confirmado",
  [OrderStatus.IN_PROGRESS]: "En preparación",
  [OrderStatus.SHIPPED]: "Listo",
  [OrderStatus.COMPLETED]: "Entregado",
  [OrderStatus.CANCELLED]: "Cancelado"
};

export const artisanOrderStatusDescription: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: "Recibiste una solicitud nueva.",
  [OrderStatus.CONFIRMED]: "El pedido fue confirmado.",
  [OrderStatus.IN_PROGRESS]: "La pieza se está preparando.",
  [OrderStatus.SHIPPED]: "La pieza está lista para entregar.",
  [OrderStatus.COMPLETED]: "El pedido fue entregado.",
  [OrderStatus.CANCELLED]: "El pedido fue cancelado."
};

export const artisanOrderStatusClass: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: "bg-[#fff0f5] text-[#b5245b] border-[#f4b8ce]",
  [OrderStatus.CONFIRMED]: "bg-[#fff7df] text-[#9a6200] border-[#e5c067]",
  [OrderStatus.IN_PROGRESS]: "bg-[#fff0e6] text-[#a95511] border-[#efb37f]",
  [OrderStatus.SHIPPED]: "bg-[#edf8fa] text-[#137f87] border-[#8fdde3]",
  [OrderStatus.COMPLETED]: "bg-[#edf8f0] text-[#2f7d4f] border-[#9ad7b2]",
  [OrderStatus.CANCELLED]: "bg-[#f5f0ed] text-[#725144] border-[#d8b9a8]"
};

export const artisanOrderNextStatus: Partial<Record<OrderStatus, OrderStatus>> = {
  [OrderStatus.PENDING]: OrderStatus.CONFIRMED,
  [OrderStatus.CONFIRMED]: OrderStatus.IN_PROGRESS,
  [OrderStatus.IN_PROGRESS]: OrderStatus.SHIPPED,
  [OrderStatus.SHIPPED]: OrderStatus.COMPLETED
};

export const artisanOrderNextLabel: Partial<Record<OrderStatus, string>> = {
  [OrderStatus.PENDING]: "Confirmar pedido",
  [OrderStatus.CONFIRMED]: "Marcar en preparación",
  [OrderStatus.IN_PROGRESS]: "Marcar como listo",
  [OrderStatus.SHIPPED]: "Marcar como entregado"
};
