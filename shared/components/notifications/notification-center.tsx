import { format } from "date-fns";
import { Bell, CheckCircle2, Circle, Megaphone } from "lucide-react";
import type { Notification, UserRole } from "@prisma/client";

import {
  markAllNotificationsReadAction,
  markNotificationReadAction
} from "@/shared/actions/notifications";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";

const typeLabels: Record<Notification["type"], string> = {
  SYSTEM: "Sistema",
  LEARNING: "Aprendizaje",
  COMMUNITY: "Comunidad",
  ORDER: "Pedidos",
  PAYMENT: "Pagos",
  SUPPORT: "Soporte"
};

type NotificationCenterProps = {
  role: Extract<UserRole, "ARTESANA" | "FACILITADORA">;
  notifications: Notification[];
};

export function NotificationCenter({ role, notifications }: NotificationCenterProps) {
  const isFacilitator = role === "FACILITADORA";
  const unreadCount = notifications.filter((notification) => !notification.readAt).length;

  return (
    <main className="min-h-screen bg-[#fffaf6] px-4 py-5 pb-24 text-[#2a211c] md:px-8 lg:px-10 lg:py-10 xl:px-14 2xl:px-20">
      <div className="mx-auto w-full max-w-[1320px] space-y-7">
        <header className="flex flex-col gap-5 border-b border-[#ead4ca] pb-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p
              className={cn(
                "font-ui text-sm font-extrabold uppercase tracking-[0.08em]",
                isFacilitator ? "text-[#9a6800]" : "text-[#b5245b]"
              )}
            >
              {isFacilitator ? "Facilitadora" : "Artesana"}
            </p>
            <h1 className="mt-2 font-serif text-5xl font-bold leading-none text-[#101833] md:text-6xl">
              Notificaciones
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-[#5b4a42] md:text-lg">
              Revisa avisos importantes sobre tu aprendizaje, comunidad, pedidos y
              acompañamiento.
            </p>
          </div>

          {unreadCount > 0 ? (
            <form action={markAllNotificationsReadAction}>
              <Button
                type="submit"
                variant="outline"
                className="h-12 rounded-full border-[#d9b8a7] bg-white px-6 text-[#7a3100] hover:bg-[#fff0f5] hover:text-[#b5245b]"
              >
                <CheckCircle2 className="h-5 w-5" />
                Marcar todas como leídas
              </Button>
            </form>
          ) : null}
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          <SummaryCard
            label="Pendientes"
            value={unreadCount}
            tone={isFacilitator ? "gold" : "pink"}
          />
          <SummaryCard label="Recientes" value={notifications.length} tone="blue" />
          <SummaryCard
            label="Leídas"
            value={notifications.length - unreadCount}
            tone="green"
          />
        </section>

        <section className="overflow-hidden rounded-[22px] border border-[#ecd0bd] bg-white shadow-[0_20px_60px_rgba(122,49,0,0.08)]">
          <div className="border-b border-[#f0dacd] bg-[#fffdfb] px-5 py-5 md:px-7">
            <h2 className="font-serif text-3xl font-bold text-[#7a3100]">
              Avisos recientes
            </h2>
          </div>

          {notifications.length ? (
            <div className="divide-y divide-[#f3ded2]">
              {notifications.map((notification) => {
                const unread = !notification.readAt;

                return (
                  <article
                    key={notification.id}
                    className={cn(
                      "grid gap-4 px-5 py-5 transition-colors md:grid-cols-[auto_1fr_auto] md:items-center md:px-7",
                      unread ? "bg-[#fff7fa]" : "bg-white"
                    )}
                  >
                    <span
                      className={cn(
                        "grid h-12 w-12 place-items-center rounded-full",
                        unread
                          ? isFacilitator
                            ? "bg-[#fff4cf] text-[#d89b06]"
                            : "bg-[#fff0f5] text-[#b5245b]"
                          : "bg-[#f6efe9] text-[#7a5b4a]"
                      )}
                    >
                      {unread ? (
                        <Bell className="h-6 w-6" />
                      ) : (
                        <CheckCircle2 className="h-6 w-6" />
                      )}
                    </span>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={cn(
                            "rounded-full px-3 py-1 font-ui text-xs font-extrabold",
                            unread
                              ? "bg-[#b5245b] text-white"
                              : "bg-[#f6efe9] text-[#7a5b4a]"
                          )}
                        >
                          {unread ? "Nuevo" : "Leído"}
                        </span>
                        <span className="rounded-full bg-[#fff4cf] px-3 py-1 font-ui text-xs font-bold text-[#9a6800]">
                          {typeLabels[notification.type]}
                        </span>
                        <time className="text-sm text-[#7a5b4a]">
                          {format(notification.createdAt, "dd/MM/yyyy HH:mm")}
                        </time>
                      </div>
                      <h3 className="mt-3 font-serif text-2xl font-bold text-[#1b1c1a]">
                        {notification.title}
                      </h3>
                      <p className="mt-2 max-w-3xl text-sm leading-6 text-[#5b4a42] md:text-base">
                        {notification.body}
                      </p>
                    </div>

                    {unread ? (
                      <form action={markNotificationReadAction}>
                        <input
                          type="hidden"
                          name="notificationId"
                          value={notification.id}
                        />
                        <Button
                          type="submit"
                          variant="outline"
                          className="h-11 rounded-full border-[#d9b8a7] bg-white text-[#7a3100] hover:bg-[#fff0f5] hover:text-[#b5245b]"
                        >
                          Marcar como leída
                        </Button>
                      </form>
                    ) : null}
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="grid place-items-center px-6 py-16 text-center">
              <span className="grid h-16 w-16 place-items-center rounded-full bg-[#fff0f5] text-[#b5245b]">
                <Megaphone className="h-8 w-8" />
              </span>
              <h3 className="mt-5 font-serif text-3xl font-bold text-[#7a3100]">
                Aún no tienes notificaciones
              </h3>
              <p className="mt-3 max-w-xl text-[#5b4a42]">
                Cuando haya novedades importantes, aparecerán aquí.
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function SummaryCard({
  label,
  value,
  tone
}: {
  label: string;
  value: number;
  tone: "pink" | "gold" | "blue" | "green";
}) {
  const toneClass = {
    pink: "bg-[#fff0f5] text-[#b5245b]",
    gold: "bg-[#fff4cf] text-[#d89b06]",
    blue: "bg-[#edf5ff] text-[#2f62a3]",
    green: "bg-[#eef9ee] text-[#2f7d3f]"
  }[tone];

  return (
    <article className="rounded-[18px] border border-[#ecd0bd] bg-white p-5 shadow-[0_16px_44px_rgba(122,49,0,0.06)]">
      <span className={cn("inline-flex rounded-full p-3", toneClass)}>
        <Circle className="h-5 w-5 fill-current" />
      </span>
      <p className="mt-4 font-ui text-xs font-extrabold uppercase tracking-[0.08em] text-[#b5245b]">
        {label}
      </p>
      <p className="mt-1 font-serif text-4xl font-bold text-[#1b1c1a]">{value}</p>
    </article>
  );
}
