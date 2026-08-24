import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { OrderStatus } from "@prisma/client";
import {
  CalendarDays,
  ChevronRight,
  Clock3,
  MapPin,
  Package,
  ReceiptText,
  Search
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/shared/components/feedback/empty-state";
import { ArtisanOrderService } from "@/shared/services/artisan-order.service";
import { requireRole } from "@/shared/server/auth/helpers";
import {
  artisanOrderStatusClass,
  artisanOrderStatusDescription,
  artisanOrderStatusLabel
} from "@/shared/lib/order-labels";
import { cn } from "@/shared/lib/utils";

type ArtisanOrdersPageProps = {
  searchParams: Promise<{
    estado?: string;
  }>;
};

const statusFilters: Array<{ value: "todos" | OrderStatus; label: string }> = [
  { value: "todos", label: "Todos" },
  { value: OrderStatus.PENDING, label: "Nuevos" },
  { value: OrderStatus.CONFIRMED, label: "Confirmados" },
  { value: OrderStatus.IN_PROGRESS, label: "En preparación" },
  { value: OrderStatus.SHIPPED, label: "Listos" },
  { value: OrderStatus.COMPLETED, label: "Entregados" },
  { value: OrderStatus.CANCELLED, label: "Cancelados" }
];

const fallbackProduct = "/images/discover/emprende.png";
const pendingStatusSet = new Set<OrderStatus>([
  OrderStatus.PENDING,
  OrderStatus.CONFIRMED,
  OrderStatus.IN_PROGRESS
]);

export default async function ArtisanOrdersPage({
  searchParams
}: ArtisanOrdersPageProps) {
  const session = await requireRole("ARTESANA");
  const { estado } = await searchParams;
  const status = parseOrderStatus(estado);
  const orders = await new ArtisanOrderService().listForArtisan(session.user.id, {
    status
  });
  const totalOrders = orders.length;
  const pendingOrders = orders.filter((order) =>
    pendingStatusSet.has(order.status)
  ).length;

  return (
    <main className="min-h-screen bg-[#fffaf6] px-4 py-5 pb-24 md:px-8 lg:px-10 lg:py-10 xl:px-14 2xl:px-20">
      <div className="mx-auto w-full max-w-[1760px]">
        <header className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="font-ui text-sm font-extrabold uppercase tracking-[0.12em] text-[#b5245b]">
              Pedidos de mi vitrina
            </p>
            <h1 className="mt-2 font-serif text-5xl font-bold leading-none text-[#101833] md:text-6xl 2xl:text-7xl">
              Mis pedidos <span className="text-4xl text-[#b5245b]">-</span>
            </h1>
            <p className="mt-4 max-w-4xl text-lg leading-8 text-[#5b4a42]">
              Acompaña cada pedido de tus piezas publicadas, paso a paso y con
              claridad.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:min-w-[360px]">
            <SummaryPill label="Pedidos" value={totalOrders} />
            <SummaryPill label="Por atender" value={pendingOrders} />
          </div>
        </header>

        <section className="mt-8 rounded-[22px] border border-[#ecd0bd] bg-white/85 p-4 shadow-[0_22px_58px_rgba(122,49,0,0.08)] md:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-h-touch-target items-center gap-3 rounded-full border border-[#ecd0bd] bg-[#fffaf6] px-4 text-[#7a5b4a] lg:min-w-[320px]">
              <Search className="h-5 w-5 text-[#b5245b]" />
              <span className="text-sm">Filtra por estado del pedido</span>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {statusFilters.map((filter) => {
                const href =
                  filter.value === "todos"
                    ? "/artesana/mis-pedidos"
                    : `/artesana/mis-pedidos?estado=${filter.value}`;
                const active =
                  (!status && filter.value === "todos") || status === filter.value;

                return (
                  <Button
                    key={filter.value}
                    asChild
                    variant={active ? "default" : "outline"}
                    className={cn(
                      "shrink-0 rounded-full px-5",
                      active
                        ? "bg-[#b5245b] text-white hover:bg-[#8e1746]"
                        : "border-[#e2a0ba] bg-white text-[#7a3100] hover:bg-[#fff0f5]"
                    )}
                  >
                    <Link href={href}>{filter.label}</Link>
                  </Button>
                );
              })}
            </div>
          </div>
        </section>

        {orders.length ? (
          <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {orders.map((order) => {
              const firstItem = order.items[0];
              const image = firstItem?.product.images[0]?.file.url ?? fallbackProduct;
              const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
              const artisanTotal = order.items.reduce(
                (sum, item) => sum + Number(item.totalPrice),
                0
              );
              const buyerName =
                order.buyer.profile?.displayName ??
                order.buyer.name ??
                order.buyer.email;

              return (
                <article
                  key={order.id}
                  className="group overflow-hidden rounded-[18px] border border-[#ecd0bd] bg-white shadow-[0_18px_44px_rgba(122,49,0,0.08)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_58px_rgba(122,49,0,0.13)]"
                >
                  <div className="relative aspect-[4/3] bg-[#f8eadc]">
                    <Image
                      src={image}
                      alt={firstItem?.product.name ?? "Pieza artesanal"}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-contain p-3 transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                    <Badge
                      className={cn(
                        "absolute left-3 top-3 rounded-full border text-xs",
                        artisanOrderStatusClass[order.status]
                      )}
                    >
                      {artisanOrderStatusLabel[order.status]}
                    </Badge>
                  </div>

                  <div className="space-y-4 p-5">
                    <div>
                      <p className="font-ui text-xs font-extrabold uppercase tracking-[0.08em] text-[#b5245b]">
                        Pedido #{order.id.slice(0, 6).toUpperCase()}
                      </p>
                      <h2 className="mt-2 line-clamp-2 font-serif text-2xl font-bold text-[#7a3100]">
                        {firstItem?.product.name ?? "Pieza artesanal"}
                      </h2>
                      <p className="mt-1 text-sm text-[#5b4a42]">
                        Cliente: {buyerName}
                      </p>
                    </div>

                    <div className="grid gap-2 text-sm text-[#5b4a42]">
                      <p className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-[#b5245b]" />
                        Cantidad: {itemCount}
                      </p>
                      <p className="flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 text-[#b5245b]" />
                        {format(order.placedAt, "dd 'de' MMMM, yyyy", { locale: es })}
                      </p>
                      <p className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-[#b5245b]" />
                        {firstItem?.product.community.location ??
                          firstItem?.product.community.name ??
                          "San Miguel, Cajamarca"}
                      </p>
                    </div>

                    <div className="flex items-center justify-between border-t border-[#f0dfd2] pt-4">
                      <div>
                        <p className="text-xs text-[#7a5b4a]">Total</p>
                        <p className="font-ui text-xl font-extrabold text-[#1b1c1a]">
                          S/ {artisanTotal.toFixed(2)}
                        </p>
                      </div>
                      <Button
                        asChild
                        className="rounded-full bg-[#b5245b] text-white hover:bg-[#8e1746]"
                      >
                        <Link href={`/artesana/mis-pedidos/${order.id}`}>
                          Ver pedido <ChevronRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        ) : (
          <div className="mt-6">
            <EmptyState
              title="Todavía no tienes pedidos en este estado"
              description="Cuando una pieza de tu vitrina reciba un pedido, aparecerá aquí con su detalle."
            />
          </div>
        )}

        <section className="mt-6 rounded-[18px] border border-[#ecd0bd] bg-white p-5 shadow-[0_18px_44px_rgba(122,49,0,0.06)]">
          <div className="flex items-start gap-4">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#fff0f5] text-[#b5245b]">
              <Clock3 className="h-6 w-6" />
            </span>
            <div>
              <h2 className="font-serif text-2xl font-bold text-[#7a3100]">
                Estados del pedido
              </h2>
              <p className="mt-2 text-sm leading-6 text-[#5b4a42]">
                La ruta recomendada es: Nuevo, Confirmado, En preparación, Listo y
                Entregado. Si algo impide atenderlo, puedes cancelarlo registrando un
                motivo.
              </p>
            </div>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {statusFilters
              .filter((filter): filter is { value: OrderStatus; label: string } =>
                filter.value !== "todos"
              )
              .map((filter) => (
                <div
                  key={filter.value}
                  className="rounded-xl border border-[#f0dfd2] bg-[#fffaf6] p-4"
                >
                  <Badge
                    className={cn(
                      "rounded-full border",
                      artisanOrderStatusClass[filter.value]
                    )}
                  >
                    {artisanOrderStatusLabel[filter.value]}
                  </Badge>
                  <p className="mt-3 text-sm leading-6 text-[#5b4a42]">
                    {artisanOrderStatusDescription[filter.value]}
                  </p>
                </div>
              ))}
          </div>
        </section>
      </div>
    </main>
  );
}

function SummaryPill({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[16px] border border-[#ecd0bd] bg-white p-4 shadow-[0_12px_30px_rgba(122,49,0,0.06)]">
      <div className="flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-full bg-[#fff7df] text-[#d89911]">
          <ReceiptText className="h-5 w-5" />
        </span>
        <div>
          <p className="font-serif text-3xl font-bold text-[#1b1c1a]">{value}</p>
          <p className="text-sm text-[#5b4a42]">{label}</p>
        </div>
      </div>
    </div>
  );
}

function parseOrderStatus(status?: string): OrderStatus | undefined {
  if (!status) {
    return undefined;
  }

  return Object.values(OrderStatus).includes(status as OrderStatus)
    ? (status as OrderStatus)
    : undefined;
}
