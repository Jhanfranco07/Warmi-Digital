import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ComponentType } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  ArrowLeft,
  CalendarDays,
  Mail,
  MapPin,
  MessageSquareText,
  Package,
  Phone,
  ReceiptText,
  UserRound
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArtisanOrderActions } from "@/features/orders/artisan-order-actions";
import { SpeechButton } from "@/shared/accessibility/speech-button";
import { ArtisanOrderService } from "@/shared/services/artisan-order.service";
import { requireRole } from "@/shared/server/auth/helpers";
import {
  artisanOrderStatusClass,
  artisanOrderStatusLabel
} from "@/shared/lib/order-labels";
import { cn } from "@/shared/lib/utils";

type ArtisanOrderDetailPageProps = {
  params: Promise<{
    orderId: string;
  }>;
};

const fallbackProduct = "/images/discover/emprende.png";

export default async function ArtisanOrderDetailPage({
  params
}: ArtisanOrderDetailPageProps) {
  const session = await requireRole("ARTESANA");
  const { orderId } = await params;
  const service = new ArtisanOrderService();
  const order = await service
    .detailForArtisan(orderId, session.user.id)
    .catch(() => null);

  if (!order) {
    notFound();
  }

  const buyerName =
    order.buyer.profile?.displayName ?? order.buyer.name ?? order.buyer.email;
  const buyerPhone = order.buyer.profile?.phone;
  const artisanTotal = order.items.reduce(
    (sum, item) => sum + Number(item.totalPrice),
    0
  );
  const totalQuantity = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const firstItem = order.items[0];
  const image = firstItem?.product.images[0]?.file.url ?? fallbackProduct;
  const orderNarration = `Estás viendo el detalle del pedido número ${order.id.slice(0, 6).toUpperCase()}. El cliente es ${buyerName}. El pedido tiene ${totalQuantity} piezas y el total para tus piezas es ${artisanTotal.toFixed(2)} soles. El estado actual es ${artisanOrderStatusLabel[order.status]}. Revisa los datos antes de actualizar el estado o cancelar el pedido.`;

  return (
    <main className="min-h-screen bg-[#fffaf6] px-4 py-5 pb-24 md:px-8 lg:px-10 lg:py-10 xl:px-14 2xl:px-20">
      <div className="mx-auto w-full max-w-[1500px]">
        <Button
          asChild
          variant="outline"
          className="rounded-full border-[#e2a0ba] bg-white text-[#7a3100] hover:bg-[#fff0f5]"
        >
          <Link href="/artesana/mis-pedidos">
            <ArrowLeft className="h-4 w-4" />
            Volver a mis pedidos
          </Link>
        </Button>

        <header className="mt-6 grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="font-ui text-sm font-extrabold uppercase tracking-[0.12em] text-[#b5245b]">
              Pedido #{order.id.slice(0, 6).toUpperCase()}
            </p>
            <h1 className="mt-2 font-serif text-5xl font-bold leading-none text-[#101833] md:text-6xl">
              Detalle del pedido
            </h1>
            <p className="mt-4 max-w-4xl text-lg leading-8 text-[#5b4a42]">
              Revisa la información antes de avanzar el estado. Los precios y cantidades
              no se editan desde esta pantalla.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <SpeechButton text={orderNarration} label="Escuchar" compact />
            <Badge
              className={cn(
                "w-fit rounded-full border px-4 py-2 text-sm font-bold",
                artisanOrderStatusClass[order.status]
              )}
            >
              {artisanOrderStatusLabel[order.status]}
            </Badge>
          </div>
        </header>

        <section className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(360px,0.65fr)]">
          <div className="overflow-hidden rounded-[22px] border border-[#ecd0bd] bg-white shadow-[0_22px_58px_rgba(122,49,0,0.08)]">
            <div className="grid lg:grid-cols-[0.85fr_1.15fr]">
              <div className="relative min-h-[280px] bg-[#f8eadc] lg:min-h-full">
                <Image
                  src={image}
                  alt={firstItem?.product.name ?? "Pieza artesanal"}
                  fill
                  sizes="(max-width: 1024px) 100vw, 42vw"
                  className="object-contain p-5"
                  priority
                />
              </div>
              <div className="p-5 md:p-7">
                <p className="font-ui text-xs font-extrabold uppercase tracking-[0.12em] text-[#b5245b]">
                  Piezas solicitadas
                </p>
                <div className="mt-5 space-y-4">
                  {order.items.map((item) => (
                    <article
                      key={item.id}
                      className="rounded-2xl border border-[#f0dfd2] bg-[#fffaf6] p-4"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h2 className="font-serif text-2xl font-bold text-[#7a3100]">
                            {item.product.name}
                          </h2>
                          <p className="mt-1 text-sm text-[#5b4a42]">
                            {item.product.craftType.name} -{" "}
                            {item.product.community.location ??
                              item.product.community.name ??
                              "San Miguel, Cajamarca"}
                          </p>
                        </div>
                        <Badge className="rounded-full border border-[#ecd0bd] bg-white text-[#7a3100]">
                          x{item.quantity}
                        </Badge>
                      </div>
                      <div className="mt-4 grid gap-3 text-sm text-[#5b4a42] sm:grid-cols-3">
                        <DetailValue
                          label="Precio unitario"
                          value={`S/ ${Number(item.unitPrice).toFixed(2)}`}
                        />
                        <DetailValue label="Cantidad" value={`${item.quantity}`} />
                        <DetailValue
                          label="Subtotal"
                          value={`S/ ${Number(item.totalPrice).toFixed(2)}`}
                        />
                      </div>
                    </article>
                  ))}
                </div>

                <div className="mt-5 rounded-2xl border border-[#e2a0ba] bg-[#fff0f5] p-5">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-bold text-[#7a5b4a]">
                        Total de este pedido
                      </p>
                      <p className="mt-1 font-serif text-4xl font-bold text-[#b5245b]">
                        S/ {artisanTotal.toFixed(2)}
                      </p>
                    </div>
                    <div className="text-right text-sm text-[#5b4a42]">
                      <p>{totalQuantity} pieza(s)</p>
                      <p>{order.currency}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <aside className="grid gap-5">
            <section className="rounded-[22px] border border-[#ecd0bd] bg-white p-5 shadow-[0_18px_44px_rgba(122,49,0,0.08)]">
              <h2 className="font-serif text-2xl font-bold text-[#7a3100]">
                Cliente
              </h2>
              <div className="mt-5 grid gap-3 text-sm text-[#5b4a42]">
                <InfoRow icon={UserRound} label={buyerName} />
                <InfoRow icon={Mail} label={order.buyer.email} />
                {buyerPhone ? <InfoRow icon={Phone} label={buyerPhone} /> : null}
              </div>
            </section>

            <section className="rounded-[22px] border border-[#ecd0bd] bg-white p-5 shadow-[0_18px_44px_rgba(122,49,0,0.08)]">
              <h2 className="font-serif text-2xl font-bold text-[#7a3100]">
                Pedido y entrega
              </h2>
              <div className="mt-5 grid gap-3 text-sm text-[#5b4a42]">
                <InfoRow
                  icon={ReceiptText}
                    label={`Código #${order.id.slice(0, 6).toUpperCase()}`}
                />
                <InfoRow
                  icon={CalendarDays}
                  label={format(order.placedAt, "dd 'de' MMMM, yyyy - HH:mm", {
                    locale: es
                  })}
                />
                <InfoRow
                  icon={MapPin}
                  label={
                    firstItem?.product.community.location ??
                    firstItem?.product.community.name ??
                    "San Miguel, Cajamarca"
                  }
                />
                <InfoRow
                  icon={Package}
                  label={
                    order.shippingNotes?.trim()
                      ? order.shippingNotes
                      : "Entrega o contacto pendiente de coordinar."
                  }
                />
                {order.cancellationReason ? (
                  <InfoRow
                    icon={MessageSquareText}
                  label={`Motivo de cancelación: ${order.cancellationReason}`}
                  />
                ) : null}
              </div>
            </section>

            <section className="rounded-[22px] border border-[#ecd0bd] bg-white p-5 shadow-[0_18px_44px_rgba(122,49,0,0.08)]">
              <h2 className="font-serif text-2xl font-bold text-[#7a3100]">
                Acciones
              </h2>
              <p className="mt-2 text-sm leading-6 text-[#5b4a42]">
                Avanza el pedido solo cuando el paso anterior ya esté listo.
              </p>
              <div className="mt-5">
                <ArtisanOrderActions orderId={order.id} status={order.status} />
              </div>
            </section>
          </aside>
        </section>
      </div>
    </main>
  );
}

function DetailValue({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white p-3">
      <p className="text-xs text-[#7a5b4a]">{label}</p>
      <p className="mt-1 font-ui text-base font-extrabold text-[#1b1c1a]">{value}</p>
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <div className="flex gap-3 rounded-xl border border-[#f0dfd2] bg-[#fffaf6] p-3">
      <Icon className="mt-0.5 h-5 w-5 shrink-0 text-[#b5245b]" />
      <p className="leading-6">{label}</p>
    </div>
  );
}
