import Image from "next/image";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock3,
  Gift,
  MapPin,
  PackageCheck,
  ReceiptText,
  Send,
  SlidersHorizontal
} from "lucide-react";
import type { OrderStatus } from "@prisma/client";

import { Button } from "@/shared/components/ui/button";
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
  image: string;
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

const demoOrders: OrderCard[] = [
  {
    id: "PED-000125",
    status: "PENDING",
    productName: "Bolso tejido a mano",
    buyerName: "María Quispe",
    date: new Date("2026-08-12T10:00:00"),
    location: "San Miguel, Cajamarca",
    amount: "S/ 120.00",
    image: "/images/discover/taller.png"
  },
  {
    id: "PED-000126",
    status: "PENDING",
    productName: "Taza de cerámica",
    buyerName: "Juan Pérez",
    date: new Date("2026-08-12T10:00:00"),
    location: "San Miguel, Cajamarca",
    amount: "S/ 45.00",
    image: "/images/home/bienvenida-warmi.png"
  },
  {
    id: "PED-000127",
    status: "PENDING",
    productName: "Cojín decorativo",
    buyerName: "Lucía Condori",
    date: new Date("2026-08-12T10:00:00"),
    location: "San Miguel, Cajamarca",
    amount: "S/ 80.00",
    image: "/images/discover/aprende.png"
  },
  {
    id: "PED-000122",
    status: "CONFIRMED",
    productName: "Torito de Pucará",
    buyerName: "Carlos Mamani",
    date: new Date("2026-08-11T10:00:00"),
    location: "San Miguel, Cajamarca",
    amount: "S/ 65.00",
    image: "/images/discover/emprende.png"
  },
  {
    id: "PED-000123",
    status: "CONFIRMED",
    productName: "Camino de mesa",
    buyerName: "Ana López",
    date: new Date("2026-08-11T10:00:00"),
    location: "San Miguel, Cajamarca",
    amount: "S/ 95.00",
    image: "/images/discover/aprende.png"
  },
  {
    id: "PED-000118",
    status: "IN_PROGRESS",
    productName: "Canasta de mimbre",
    buyerName: "Rosa Huarcaya",
    date: new Date("2026-08-10T10:00:00"),
    location: "San Miguel, Cajamarca",
    amount: "S/ 70.00",
    image: "/images/discover/taller.png"
  },
  {
    id: "PED-000119",
    status: "IN_PROGRESS",
    productName: "Tapiz decorativo",
    buyerName: "Diego Quispe",
    date: new Date("2026-08-10T10:00:00"),
    location: "San Miguel, Cajamarca",
    amount: "S/ 110.00",
    image: "/images/discover/aprende.png"
  },
  {
    id: "PED-000115",
    status: "SHIPPED",
    productName: "Juego de miniaturas",
    buyerName: "Patricia Gómez",
    date: new Date("2026-08-09T10:00:00"),
    location: "San Miguel, Cajamarca",
    amount: "S/ 55.00",
    image: "/images/learning/aprender-hero.png"
  },
  {
    id: "PED-000116",
    status: "SHIPPED",
    productName: "Bolso bordado",
    buyerName: "Miguel Ángel",
    date: new Date("2026-08-09T10:00:00"),
    location: "San Miguel, Cajamarca",
    amount: "S/ 35.00",
    image: "/images/discover/emprende.png"
  },
  {
    id: "PED-000110",
    status: "COMPLETED",
    productName: "Individual tejido",
    buyerName: "Sofía Ramírez",
    date: new Date("2026-08-07T10:00:00"),
    location: "San Miguel, Cajamarca",
    amount: "S/ 30.00",
    image: "/images/discover/aprende.png"
  },
  {
    id: "PED-000111",
    status: "COMPLETED",
    productName: "Plato decorativo",
    buyerName: "Luis Quispe",
    date: new Date("2026-08-07T10:00:00"),
    location: "San Miguel, Cajamarca",
    amount: "S/ 60.00",
    image: "/images/home/bienvenida-warmi.png"
  },
  {
    id: "PED-000112",
    status: "COMPLETED",
    productName: "Llavero artesanal",
    buyerName: "Valeria Flores",
    date: new Date("2026-08-07T10:00:00"),
    location: "San Miguel, Cajamarca",
    amount: "S/ 20.00",
    image: "/images/discover/taller.png"
  }
];

export default async function ArtisanOrdersPage() {
  const session = await requireRole("ARTESANA");
  const orders = await new OrderRepository().findRecentForArtisan(session.user.id, 50);
  const normalizedOrders: OrderCard[] = orders.map((order) => {
    const firstItem = order.items[0];
    return {
      id: `PED-${order.id.slice(0, 6).toUpperCase()}`,
      status: order.status,
      productName: firstItem?.product.name ?? "Pieza artesanal",
      buyerName: "Cliente Warmi",
      date: order.placedAt,
      location: "San Miguel, Cajamarca",
      amount: `S/ ${Number(order.totalAmount).toFixed(2)}`,
      image: "/images/discover/aprende.png"
    };
  });
  const boardOrders = normalizedOrders.length ? normalizedOrders : demoOrders;

  return (
    <main className="min-h-screen bg-[#fffaf6] px-4 py-5 pb-24 md:px-8 lg:px-10 lg:py-10 xl:px-14 2xl:px-20">
      <div className="mx-auto w-full max-w-[1760px]">
        <header className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <h1 className="font-serif text-5xl font-bold leading-none text-[#101833] md:text-6xl 2xl:text-7xl">
              Mis pedidos <span className="text-4xl text-[#b5245b]">❧</span>
            </h1>
            <p className="mt-4 max-w-4xl text-lg leading-8 text-[#5b4a42]">
              Gestiona todos tus pedidos y acompaña cada entrega con dedicación.
            </p>
          </div>
          <div className="flex items-center gap-5">
            <span className="relative hidden h-16 w-16 overflow-hidden rounded-full border-2 border-white shadow-[0_12px_28px_rgba(122,49,0,0.16)] md:block">
              <Image
                src="/images/auth/artesana.png"
                alt="Elena Mamani"
                fill
                sizes="64px"
                className="object-cover"
              />
            </span>
            <div className="hidden md:block">
              <p className="font-ui font-extrabold text-[#1b1c1a]">Elena Mamani</p>
              <p className="text-sm text-[#5b4a42]">Artesana</p>
            </div>
            <ChevronDown className="hidden h-5 w-5 text-[#7a3100] md:block" />
          </div>
        </header>

        <div className="mt-8 flex justify-end">
          <Button
            variant="outline"
            className="rounded-lg border-[#e7b89f] bg-white px-7 text-[#a95511] hover:bg-[#fff1e5]"
          >
            <SlidersHorizontal className="h-5 w-5" />
            Filtros
          </Button>
        </div>

        <section className="mt-5 grid gap-5 xl:grid-cols-5">
          {statusColumns.map((column) => {
            const columnOrders = boardOrders.filter(
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
                {columnOrders.map((order) => (
                  <OrderCardItem key={order.id} order={order} tone={column.tone} />
                ))}
              </OrderColumn>
            );
          })}
        </section>

        <section className="mt-6 rounded-[18px] border border-[#ecd0bd] bg-white p-5 shadow-[0_22px_58px_rgba(122,49,0,0.08)]">
          <div className="grid gap-4 lg:grid-cols-[1.35fr_repeat(5,1fr)_1.15fr] lg:items-center">
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
              const count = boardOrders.filter(
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
            <Button
              variant="outline"
              className="min-h-14 rounded-lg border-[#e7b89f] bg-white text-[#a95511] hover:bg-[#fff1e5]"
            >
              <ReceiptText className="h-5 w-5" />
              Ver historial de pedidos
            </Button>
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
    <section className="overflow-hidden rounded-[18px] border border-[#ecd0bd] bg-white shadow-[0_18px_44px_rgba(122,49,0,0.08)]">
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
      <div className="p-4 pt-0">
        <Button
          variant="outline"
          className="w-full rounded-lg border-[#ecd0bd] bg-white text-[#a95511] hover:bg-[#fff1e5]"
        >
          Ver todos ({count})
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
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
          <Image
            src={order.image}
            alt={order.productName}
            fill
            sizes="80px"
            className="object-cover"
          />
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
