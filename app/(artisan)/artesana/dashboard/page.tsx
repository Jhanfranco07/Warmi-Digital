import Link from "next/link";
import type { Route } from "next";
import { format } from "date-fns";
import { BookOpen, Bell, CalendarDays, ScrollText, Store } from "lucide-react";

import { EmptyState } from "@/shared/components/feedback/empty-state";
import { Container } from "@/shared/components/layout/container";
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

  return (
    <Container className="space-y-8 py-6 md:py-10">
      <PageHeader
        eyebrow="Inicio"
        title={`Hola, ${profile?.displayName ?? session.user.name ?? "artesana"}`}
        description="Este es tu espacio para aprender, fortalecer tu historia y avanzar paso a paso."
      />

      <section className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center gap-2">
              <Badge>{data.routeName}</Badge>
              <Badge variant="outline">
                {profile?.community?.name ?? "Comunidad pendiente"}
              </Badge>
              <Badge variant="secondary">{craft}</Badge>
            </div>
            <CardTitle>Tu avance general</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-end gap-3">
              <span className="font-serif text-display-lg">{data.generalProgress}%</span>
              <span className="pb-2 text-body-md text-muted-foreground">
                de tu ruta actual
              </span>
            </div>
            <Progress value={data.generalProgress} />
            <p className="text-body-md text-muted-foreground">
              Proximo objetivo: {data.nextObjective}.
            </p>
            {currentCourse ? (
              <Button asChild size="lg" className="min-h-touch-target">
                <Link href={`/artesana/aprender/${currentCourse.id}` as Route}>
                  <BookOpen className="h-5 w-5" />
                  Continuar mi aprendizaje
                </Link>
              </Button>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Proximo taller</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.nextWorkshop ? (
              <>
                <h2 className="font-serif text-headline-md">
                  {data.nextWorkshop.workshop.title}
                </h2>
                <p className="text-body-md text-muted-foreground">
                  {data.nextWorkshop.workshop.startsAt
                    ? format(data.nextWorkshop.workshop.startsAt, "dd/MM/yyyy HH:mm")
                    : "Fecha por confirmar"}
                </p>
                <p className="text-body-md">
                  {data.nextWorkshop.workshop.location ?? "Lugar por confirmar"}
                </p>
              </>
            ) : (
              <p className="text-body-md text-muted-foreground">
                Aun no tienes talleres programados.
              </p>
            )}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <QuickAccess href="/artesana/aprender" icon={BookOpen} label="Continuar curso" />
        <QuickAccess href="/artesana/talleres" icon={CalendarDays} label="Ver talleres" />
        <QuickAccess
          href="/artesana/mi-historia"
          icon={ScrollText}
          label="Editar mi historia"
        />
        <QuickAccess href="/artesana/convocatorias" icon={Bell} label="Convocatorias" />
        <QuickAccess href="/artesana/mi-vitrina" icon={Store} label="Mi vitrina" />
        <QuickAccess href="/artesana/logros" icon={BadgeIcon} label="Mis logros" />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
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
    </Container>
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
    <Button asChild variant="outline" className="min-h-touch-target justify-start">
      <Link href={href as Route}>
        <Icon className="h-5 w-5" />
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
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">{children}</CardContent>
    </Card>
  );
}

function ListItem({ title, description }: { title: string; description?: string }) {
  return (
    <div className="rounded-md border border-border p-3">
      <p className="font-medium">{title}</p>
      {description ? (
        <p className="text-body-sm mt-1 text-muted-foreground">{description}</p>
      ) : null}
    </div>
  );
}

function BadgeIcon({ className }: { className?: string }) {
  return <Bell className={className} />;
}
