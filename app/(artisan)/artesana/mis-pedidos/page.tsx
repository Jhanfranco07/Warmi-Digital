import Image from "next/image";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Gift,
  MapPin,
  PackageCheck,
  ReceiptText,
  Send
} from "lucide-react";
import type { OrderStatus } from "@prisma/client";

import { EmptyState } from "@/shared/components/feedback/empty-state";
import { OrderRepository } from "@/shared/repositories/order.repository";
import { requireRole } from "@/shared/server/auth/helpers";

type OrderCard = {
  id: string;
  status: OrderStatus;
  productName: string;
  buyerName: string;
  date: Date;
  location: string;
  amount: string;
  image: string | null;
};

const statusColumns: Array<{
  status: OrderStatus;
  label: string;
  tone: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { status: "PENDING", label: "Pendiente", tone: "pink", icon: Clock3 },
  { status: "CONFIRMED", label: "Confirmado", tone: "amber", icon: CheckCircle2 },
  { status: "IN_PROGRESS", label: "Preparando", tone: "purple", icon: Gift },
  { status: "SHIPPED", label: "Enviado", tone: "blue", icon: Send },
  { status: "COMPLETED", label: "Entregado", tone: "green", icon: PackageCheck }
];

export default async function ArtisanOrdersPage() {
  const session = await requireRole("ARTESANA");
  const orders = await new OrderRepository().findRecentForArtisan(session.user.id, 50);
  const normalizedOrders: OrderCard[] = orders.map((order) => {
    const firstItem = order.items[0];
    const product = firstItem?.product;
    return {
      id: `PED-${order.id.slice(0, 6).toUpperCase()}`,
      status: order.status,
      productName: product?.name ?? "Pieza artesanal",
      buyerName:
        order.buyer.profile?.displayName ?? order.buyer.name ?? order.buyer.email,
      date: order.placedAt,
      location:
        product?.community.location ?? product?.community.name ?? "San Miguel, Cajamarca",
      amount: `S/ ${Number(order.totalAmount).toFixed(2)}`,
      image: product?.images[0]?.file.url ?? null
    };
  });

  return (
    <main className="min-h-screen bg-[#fffaf6] px-4 py-5 pb-24 md:px-8 lg:px-10 lg:py-10 xl:px-14 2xl:px-20">
      <div className="mx-auto w-full max-w-[1760px]">
        <header className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <h1 className="font-serif text-5xl font-bold leading-none text-[#101833] md:text-6xl 2xl:text-7xl">
              Mis pedidos <span className="text-4xl text-[#b5245b]">-</span>
            </h1>
            <p className="mt-4 max-w-4xl text-lg leading-8 text-[#5b4a42]">
              Gestiona tus pedidos reales y acompaña cada entrega con dedicación.
            </p>
          </div>
        </header>

        <section className="mt-8 grid gap-5 xl:grid-cols-5">
          {statusColumns.map((column) => {
            const columnOrders = normalizedOrders.filter(
              (order) => order.status === column.status
            );
            return (
              <OrderColumn
                key={column.status}
                label={column.label}
                tone={column.tone}
                icon={column.icon}
                count={columnOrders.length}
              >
                {columnOrders.length ? (
                  columnOrders.map((order) => (
                    <OrderCardItem key={order.id} order={order} tone={column.tone} />
                  ))
                ) : (
                  <p className="rounded-xl border border-dashed border-[#ecd0bd] bg-[#fffaf6] p-4 text-sm text-[#7a5b4a]">
                    No hay pedidos en este estado.
                  </p>
                )}
              </OrderColumn>
            );
          })}
        </section>

        {!normalizedOrders.length ? (
          <div className="mt-6">
            <EmptyState
              title="Todavía no tienes pedidos registrados"
              description="Cuando una pieza de tu vitrina reciba un pedido, aparecerá aquí con su estado y detalle."
            />
          </div>
        ) : null}

        <section className="mt-6 rounded-[18px] border border-[#ecd0bd] bg-white p-5 shadow-[0_22px_58px_rgba(122,49,0,0.08)]">
          <div className="grid gap-4 lg:grid-cols-[1.35fr_repeat(5,1fr)] lg:items-center">
            <div className="flex items-center gap-4">
              <span className="grid h-14 w-14 place-items-center rounded-full bg-[#fff1e5] text-[#a95511]">
                <ReceiptText className="h-7 w-7" />
              </span>
              <div>
                <h2 className="font-serif text-2xl font-bold text-[#a95511]">
                  Resumen de pedidos
                </h2>
                <p className="text-sm text-[#5b4a42]">Estado general de tus pedidos.</p>
              </div>
            </div>
            {statusColumns.map((column) => {
              const Icon = column.icon;
              const count = normalizedOrders.filter(
                (order) => order.status === column.status
              ).length;
              return (
                <div
                  key={column.status}
                  className="flex items-center gap-3 rounded-xl border border-[#f0dfd2] bg-[#fffaf6] p-4"
                >
                  <StatusIcon tone={column.tone} icon={Icon} />
                  <div>
                    <p className="font-serif text-3xl font-bold text-[#1b1c1a]">
                      {count}
                    </p>
                    <p className="text-sm text-[#5b4a42]">{column.label}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}

function OrderColumn({
  label,
  tone,
  icon: Icon,
  count,
  children
}: {
  label: string;
  tone: string;
  icon: React.ComponentType<{ className?: string }>;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-[18px] border border-[#ecd0bd] bg-white shadow-[0_18px_44px_rgba(122,49,0,0.08)] transition-all duration-500 hover:-translate-y-1">
      <header
        className={`${toneClasses[tone].header} flex items-center justify-between p-5`}
      >
        <div className="flex items-center gap-3">
          <Icon className={`h-7 w-7 ${toneClasses[tone].text}`} />
          <h2 className={`font-serif text-3xl font-bold ${toneClasses[tone].text}`}>
            {label}
          </h2>
        </div>
        <span
          className={`grid h-10 w-10 place-items-center rounded-full border bg-white font-ui font-extrabold ${toneClasses[tone].text}`}
        >
          {count}
        </span>
      </header>
      <div className="space-y-4 p-4">{children}</div>
    </section>
  );
}

function OrderCardItem({ order, tone }: { order: OrderCard; tone: string }) {
  return (
    <article className="rounded-xl border border-[#ecd0bd] bg-white p-4 shadow-[0_12px_30px_rgba(122,49,0,0.06)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_18px_44px_rgba(122,49,0,0.11)]">
      <div className="mb-4 flex items-start justify-between gap-3">
        <p className="font-ui text-sm font-extrabold text-[#1b1c1a]">#{order.id}</p>
        <span
          className={`rounded-full px-3 py-1 text-xs font-bold ${toneClasses[tone].pill}`}
        >
          {statusLabel(order.status)}
        </span>
      </div>
      <div className="flex gap-4">
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-[#f8eadc]">
          {order.image ? (
            <Image
              src={order.image}
              alt={order.productName}
              fill
              sizes="80px"
              className="object-cover"
            />
          ) : (
            <div className="grid h-full w-full place-items-center text-[#b5245b]">
              <ReceiptText className="h-6 w-6" />
            </div>
          )}
        </div>
        <div className="min-w-0">
          <h3 className="font-ui text-base font-extrabold text-[#1b1c1a]">
            {order.productName}
          </h3>
          <p className="mt-1 text-sm text-[#5b4a42]">{order.buyerName}</p>
        </div>
      </div>
      <div className="mt-4 space-y-2 text-sm text-[#5b4a42]">
        <p className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4" />
          {format(order.date, "dd/MM/yyyy", { locale: es })}
        </p>
        <p className="flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          {order.location}
        </p>
      </div>
      <p className="mt-4 text-right font-ui text-lg font-extrabold text-[#1b1c1a]">
        {order.amount}
      </p>
    </article>
  );
}

function StatusIcon({
  tone,
  icon: Icon
}: {
  tone: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <span
      className={`grid h-12 w-12 place-items-center rounded-full ${toneClasses[tone].header}`}
    >
      <Icon className={`h-6 w-6 ${toneClasses[tone].text}`} />
    </span>
  );
}

function statusLabel(status: OrderStatus) {
  const labels: Record<OrderStatus, string> = {
    PENDING: "Pendiente",
    CONFIRMED: "Confirmado",
    IN_PROGRESS: "Preparando",
    SHIPPED: "Enviado",
    COMPLETED: "Entregado",
    CANCELLED: "Cancelado"
  };

  return labels[status];
}

const toneClasses: Record<string, { header: string; text: string; pill: string }> = {
  pink: {
    header: "bg-[#fff0f5]",
    text: "text-[#b5245b]",
    pill: "bg-[#ffe1ec] text-[#b5245b]"
  },
  amber: {
    header: "bg-[#fff8e5]",
    text: "text-[#d89911]",
    pill: "bg-[#fff0c7] text-[#b17100]"
  },
  purple: {
    header: "bg-[#f8efff]",
    text: "text-[#8535a7]",
    pill: "bg-[#eddcff] text-[#8535a7]"
  },
  blue: {
    header: "bg-[#edf6ff]",
    text: "text-[#2f62a3]",
    pill: "bg-[#dcebff] text-[#2f62a3]"
  },
  green: {
    header: "bg-[#edf8f0]",
    text: "text-[#2f9b62]",
    pill: "bg-[#daf4e4] text-[#2f9b62]"
  }
};
