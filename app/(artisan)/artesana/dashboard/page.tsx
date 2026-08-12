import Link from "next/link";
import type { Route } from "next";
import { format } from "date-fns";
import {
  Bell,
  BookOpen,
  CalendarDays,
  Camera,
  Gem,
  Megaphone,
  Palette,
  PlayCircle,
  ScrollText,
  Search,
  Store
} from "lucide-react";

import { EmptyState } from "@/shared/components/feedback/empty-state";
import { PageHeader } from "@/shared/components/layout/page-header";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Progress } from "@/shared/components/ui/progress";
import { ArtisanDashboardService } from "@/shared/services/artisan-dashboard.service";
import { requireRole } from "@/shared/server/auth/helpers";

export default async function ArtisanDashboardPage() {
  const session = await requireRole("ARTESANA");
  const data = await new ArtisanDashboardService().getDashboard(session.user.id);
  const profile = data.artisan?.profile;
  const craft = profile?.craftTypes[0]?.craftType.name ?? "Especialidad por registrar";
  const currentCourse = data.currentEnrollment?.course;
  const displayName = profile?.displayName ?? session.user.name ?? "artesana";

  return (
    <>
      <section className="bg-[#fff7f9] px-4 pb-6 pt-4 lg:hidden">
        <p className="font-ui text-base font-bold text-[#1b1c1a]">
          !Bienvenida, {displayName.split(" ")[0] ?? "artesana"}!
        </p>
        <p className="text-[11px] text-[#5b4a42]">
          Aprende, emprende y transforma tu futuro.
        </p>

        <form className="mt-4 flex h-9 items-center rounded-md border border-[#d98da8] bg-[#ffe8ef] px-3">
          <input
            name="q"
            className="min-w-0 flex-1 bg-transparent text-xs text-[#7a1042] outline-none placeholder:text-[#9f6b7e]"
            placeholder="Que quieres aprender hoy?"
          />
          <Search className="h-4 w-4 text-[#7a1042]" />
        </form>

        <div className="mt-5 flex items-center justify-between">
          <h2 className="font-ui text-sm font-bold text-[#1b1c1a]">
            Continua aprendiendo
          </h2>
        </div>

        <Link
          href={
            currentCourse
              ? (`/artesana/aprender/${currentCourse.id}` as Route)
              : ("/artesana/aprender" as Route)
          }
          className="mt-2 grid grid-cols-[118px_1fr] overflow-hidden rounded-lg border border-[#f0c3cf] bg-white shadow-[0_10px_22px_rgba(122,16,66,0.08)]"
        >
          <div
            className="relative min-h-[92px] bg-cover bg-center"
            style={{
              backgroundImage:
                "url(https://lh3.googleusercontent.com/aida-public/AB6AXuBGgKcUdhFAz7xu7Lh4yWBB9KQfpCjA3MuKPBvVvb4j-PACBJaQMiytvgKOvo0Se7xNfFzDs4kPrwezehnYiJOjtRW20DyD3BWDggWnEsgQySwOp3of4nO6eHtx2nQk2AjtUXqDZ4UDMojrexi581KWqhNoxwR4XJz54mShphLbYTqKNlQmN2mT8nCldPzz9QxFQpX-uX_qXhPQ59lEdAWaXepnzKAkOcOUA4nrUFh9g4jHk)"
            }}
          >
            <span className="absolute inset-0 bg-[#7a1042]/15" />
            <span className="absolute left-1/2 top-1/2 grid h-10 w-10 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white text-[#e65578]">
              <PlayCircle className="h-7 w-7" />
            </span>
          </div>
          <div className="p-3">
            <p className="font-ui text-xs font-bold text-[#1b1c1a]">
              {currentCourse?.title ?? "Tecnicas de tejido tradicional andino"}
            </p>
            <p className="mt-2 text-[10px] text-[#5b4a42]">
              {data.generalProgress}% completado
            </p>
            <Progress
              value={data.generalProgress}
              className="mt-1 h-1.5 bg-[#eadfe2] [&>div]:bg-[#e65578]"
            />
            <span className="mt-2 inline-flex rounded-sm border border-[#b5245b] px-3 py-1 text-[10px] font-bold text-[#7a1042]">
              Continuar
            </span>
          </div>
        </Link>

        <div className="mt-5 flex items-center justify-between">
          <h2 className="font-ui text-sm font-bold text-[#1b1c1a]">
            Cursos recomendados para ti
          </h2>
          <Link href="/artesana/aprender" className="text-[11px] text-[#7a1042]">
            Ver todos
          </Link>
        </div>

        <div className="mt-2 space-y-2">
          <MobileCourse
            image="https://lh3.googleusercontent.com/aida-public/AB6AXuCALyFOMNshlu8spmcZJTvzNV6c0By891ZqDXEBHhPmKcFLhA3xMzyY50ew-aW0BnQE0ss8-gSZ98s-Q5kW52fHNh5NkJp4qEH5Pv8L2p1sxcBVvRnmaZdPcA3WTTI15HVgrQol4UY4_C1EEIUIooGBBiSpRIPVTRNcSavo3TLrQwIqlAFQAJZVxpcNgIpgbxicsiWJaLkadylZrQ2N9C5x6_E2a740t9Sj5ol--qlqt49l9bTsvt-D"
            title="Emprendimiento para artesanas"
            modules="8 modulos"
          />
          <MobileCourse
            image="https://lh3.googleusercontent.com/aida-public/AB6AXuD3zhbC53_wbrVF6X2y_CUyH1DNCoWJeXPudmWHjxueMx03Shxe9NqMFfHP4p1WNxwaBalanl5HRdQ_hQnJUOiL0YVib0WwJb5Husly6guxFR1Hel5CwTyDAheuAIRzorIFYv59_UwG_7FfBEP1qieoxp93GOgWipmF_btFlxKEDYDHQ3osxtSsXoJJtajLe4XGu1RouNDQbRu6SCf-vTZx4Ov8J0bJzrV6dyvougpAOWFb97Qx-ym8"
            title="Fotografia de productos con celular"
            modules="6 modulos"
          />
          <MobileCourse
            image="https://lh3.googleusercontent.com/aida-public/AB6AXuCxqQs2n05-zA-CUuMBp3gs33g-G6HMvA1vMqtB6TzE4oR7IVbl6ec4vZmHS4QdYP421CmKIIlk9do1GyQ6CGaFhrMAUiyItjTfKR7nnEyypnL4Dv0Xn3zCZD5_D3ZkxyW5tjwy5dbVKS8B6cQH6T4Tb_a1MEgYDV-ylYnWS05WxrjkHF1kNMdFU5E1psqCcnHkRI2j4jpvMpFi_ers-tIT2VQknnp411QtbVL3JJBJhc_XZ8ADs1Sr"
            title="Marketing digital para artesanas"
            modules="7 modulos"
          />
        </div>

        <h2 className="mt-5 font-ui text-sm font-bold text-[#1b1c1a]">Categorias</h2>
        <div className="mt-2 grid grid-cols-5 gap-2">
          <MobileCategory icon={Palette} label="Tejido" />
          <MobileCategory icon={Gem} label="Bordado" />
          <MobileCategory icon={Store} label="Emprendimiento" />
          <MobileCategory icon={Megaphone} label="Marketing" />
          <MobileCategory icon={Camera} label="Fotografia" />
        </div>
      </section>

      <div className="hidden min-h-screen bg-[#fffaf8] px-8 py-8 lg:block xl:px-12 2xl:px-16">
        <div className="mx-auto w-full max-w-[1680px] space-y-8">
          <PageHeader
            eyebrow="Inicio"
            title={`Hola, ${displayName}`}
            description="Este es tu espacio para aprender, fortalecer tu historia y avanzar paso a paso."
          />

          <section className="grid gap-6 xl:grid-cols-[1.45fr_0.95fr]">
            <Card className="overflow-hidden border-[#edc9bd] bg-white shadow-[0_22px_50px_rgba(122,49,0,0.08)]">
              <CardHeader className="border-b border-[#f4d8cc] bg-gradient-to-r from-[#fff0f5] via-white to-[#fff7df]">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge>{data.routeName}</Badge>
                  <Badge variant="outline">
                    {profile?.community?.name ?? "Comunidad pendiente"}
                  </Badge>
                  <Badge variant="secondary">{craft}</Badge>
                </div>
                <CardTitle className="font-serif text-4xl text-[#7a3100] 2xl:text-5xl">
                  Tu avance general
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 p-8">
                <div className="flex items-end gap-3">
                  <span className="font-serif text-7xl 2xl:text-8xl">
                    {data.generalProgress}%
                  </span>
                  <span className="pb-3 text-lg text-muted-foreground">
                    de tu ruta actual
                  </span>
                </div>
                <Progress
                  value={data.generalProgress}
                  className="h-3 bg-[#eadfe2] [&>div]:bg-[#e65578]"
                />
                <p className="text-lg text-muted-foreground">
                  Proximo objetivo: {data.nextObjective}.
                </p>
                {currentCourse ? (
                  <Button
                    asChild
                    size="lg"
                    className="min-h-[56px] rounded-full px-7 text-base"
                  >
                    <Link href={`/artesana/aprender/${currentCourse.id}` as Route}>
                      <BookOpen className="h-5 w-5" />
                      Continuar mi aprendizaje
                    </Link>
                  </Button>
                ) : null}
              </CardContent>
            </Card>

            <Card className="overflow-hidden border-[#edc9bd] bg-[#fff8f5] shadow-[0_22px_50px_rgba(122,49,0,0.08)]">
              <CardHeader className="border-b border-[#f4d8cc] bg-[#fff0f5]">
                <CardTitle className="font-serif text-4xl text-[#7a3100] 2xl:text-5xl">
                  Proximo taller
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-8">
                {data.nextWorkshop ? (
                  <>
                    <h2 className="font-serif text-4xl leading-tight 2xl:text-5xl">
                      {data.nextWorkshop.workshop.title}
                    </h2>
                    <p className="text-lg text-muted-foreground">
                      {data.nextWorkshop.workshop.startsAt
                        ? format(data.nextWorkshop.workshop.startsAt, "dd/MM/yyyy HH:mm")
                        : "Fecha por confirmar"}
                    </p>
                    <p className="text-lg">
                      {data.nextWorkshop.workshop.location ?? "Lugar por confirmar"}
                    </p>
                  </>
                ) : (
                  <p className="text-lg text-muted-foreground">
                    Aun no tienes talleres programados.
                  </p>
                )}
              </CardContent>
            </Card>
          </section>

          <section className="grid gap-4 xl:grid-cols-3">
            <QuickAccess
              href="/artesana/aprender"
              icon={BookOpen}
              label="Continuar curso"
            />
            <QuickAccess
              href="/artesana/talleres"
              icon={CalendarDays}
              label="Ver talleres"
            />
            <QuickAccess
              href="/artesana/mi-historia"
              icon={ScrollText}
              label="Editar mi historia"
            />
            <QuickAccess
              href="/artesana/convocatorias"
              icon={Bell}
              label="Convocatorias"
            />
            <QuickAccess href="/artesana/mi-vitrina" icon={Store} label="Mi vitrina" />
            <QuickAccess href="/artesana/logros" icon={BadgeIcon} label="Mis logros" />
          </section>

          <section className="grid gap-6 xl:grid-cols-2">
            <DashboardList title="Convocatorias destacadas">
              {data.opportunities.length ? (
                data.opportunities.map((item) => (
                  <ListItem
                    key={item.id}
                    title={item.title}
                    description={
                      item.endsAt
                        ? `Cierra el ${format(item.endsAt, "dd/MM/yyyy")}`
                        : "Fecha abierta"
                    }
                  />
                ))
              ) : (
                <EmptyState title="Sin convocatorias por ahora" />
              )}
            </DashboardList>

            <DashboardList title="Logros recientes">
              {data.recentBadges.length ? (
                data.recentBadges.map((item) => (
                  <ListItem
                    key={item.id}
                    title={item.badge.name}
                    description={item.reason ?? item.badge.description ?? ""}
                  />
                ))
              ) : (
                <EmptyState title="Tus logros apareceran aqui" />
              )}
            </DashboardList>

            <DashboardList title="Productos publicados">
              <ListItem
                title={`${data.products.length} piezas registradas`}
                description="La vitrina muestra tus piezas con historia cultural, no solo como productos."
              />
            </DashboardList>

            <DashboardList title="Pedidos recientes">
              {data.recentOrders.length ? (
                data.recentOrders.map((order) => (
                  <ListItem
                    key={order.id}
                    title={`Pedido ${order.id.slice(0, 8)}`}
                    description={`${order.items[0]?.product.name ?? "Pieza cultural"} - ${order.status}`}
                  />
                ))
              ) : (
                <EmptyState title="Todavia no tienes pedidos" />
              )}
            </DashboardList>
          </section>

          <DashboardList title={`Notificaciones pendientes: ${data.unreadNotifications}`}>
            {data.notifications.map((notification) => (
              <ListItem
                key={notification.id}
                title={notification.title}
                description={notification.body}
              />
            ))}
          </DashboardList>
        </div>
      </div>
    </>
  );
}

function MobileCourse({
  image,
  title,
  modules
}: {
  image: string;
  title: string;
  modules: string;
}) {
  return (
    <Link
      href="/artesana/aprender"
      className="grid grid-cols-[78px_1fr_auto] items-center gap-3 rounded-md bg-white p-2 shadow-[0_8px_18px_rgba(122,16,66,0.06)]"
    >
      <div
        className="h-14 rounded bg-cover bg-center"
        style={{ backgroundImage: `url(${image})` }}
      />
      <div className="min-w-0">
        <p className="line-clamp-2 font-ui text-xs font-bold text-[#1b1c1a]">{title}</p>
        <p className="mt-1 text-[10px] text-[#5b4a42]">{modules}</p>
      </div>
      <span className="rounded-sm border border-[#b5245b] px-2 py-1 text-[10px] font-bold text-[#7a1042]">
        Ver curso
      </span>
    </Link>
  );
}

function MobileCategory({
  icon: Icon,
  label
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <Link
      href="/artesana/aprender"
      className="flex min-h-[70px] flex-col items-center justify-center gap-1 rounded-lg bg-[#ffe3eb] px-1 text-center text-[#7a1042]"
    >
      <Icon className="h-5 w-5" />
      <span className="text-[9px] leading-tight">{label}</span>
    </Link>
  );
}

function QuickAccess({
  href,
  icon: Icon,
  label
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <Button
      asChild
      variant="outline"
      className="min-h-[58px] justify-start rounded-lg border-[#edc9bd] bg-white px-5 font-ui text-base font-bold text-[#7a3100] shadow-[0_12px_28px_rgba(122,49,0,0.05)] hover:bg-[#ffe5eb]"
    >
      <Link href={href as Route}>
        <Icon className="h-6 w-6" />
        {label}
      </Link>
    </Button>
  );
}

function DashboardList({
  title,
  children
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="overflow-hidden border-[#edc9bd] bg-white shadow-[0_18px_42px_rgba(122,49,0,0.07)]">
      <CardHeader className="border-b border-[#f4d8cc] bg-[#fffdfb]">
        <CardTitle className="font-serif text-3xl text-[#7a3100] 2xl:text-4xl">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 p-6">{children}</CardContent>
    </Card>
  );
}

function ListItem({ title, description }: { title: string; description?: string }) {
  return (
    <div className="rounded-lg border border-[#edc9bd] bg-[#fffdfb] p-5 transition-colors hover:bg-[#fff7f9]">
      <p className="text-base font-bold text-[#1b1c1a] 2xl:text-lg">{title}</p>
      {description ? (
        <p className="mt-2 text-sm leading-6 text-muted-foreground 2xl:text-base">
          {description}
        </p>
      ) : null}
    </div>
  );
}

function BadgeIcon({ className }: { className?: string }) {
  return <Bell className={className} />;
}
