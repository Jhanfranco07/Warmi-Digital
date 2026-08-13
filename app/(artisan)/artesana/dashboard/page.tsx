import Link from "next/link";
import type { Route } from "next";
import { format } from "date-fns";
import {
  Award,
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
  Store,
  Users
} from "lucide-react";

import {
  ArtisanActionCard,
  ArtisanHero,
  ArtisanListItem,
  ArtisanPanel,
  ArtisanShell,
  ArtisanStatCard
} from "@/features/artisan/artisan-panel";
import { EmptyState } from "@/shared/components/feedback/empty-state";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
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
  const firstName = displayName.split(" ")[0] ?? "artesana";

  return (
    <>
      <section className="bg-[#fff7f9] px-4 pb-6 pt-4 lg:hidden">
        <p className="font-ui text-base font-bold text-[#1b1c1a]">
          ¡Bienvenida, {firstName}!
        </p>
        <p className="text-[11px] text-[#5b4a42]">
          Aprende, emprende y transforma tu futuro.
        </p>

        <form className="mt-4 flex h-9 items-center rounded-md border border-[#d98da8] bg-[#ffe8ef] px-3">
          <input
            name="q"
            className="min-w-0 flex-1 bg-transparent text-xs text-[#7a1042] outline-none placeholder:text-[#9f6b7e]"
            placeholder="¿Qué quieres aprender hoy?"
          />
          <Search className="h-4 w-4 text-[#7a1042]" />
        </form>

        <div className="mt-5 flex items-center justify-between">
          <h2 className="font-ui text-sm font-bold text-[#1b1c1a]">
            Continúa aprendiendo
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
              backgroundImage: "url(/images/discover/aprende.png)"
            }}
          >
            <span className="absolute inset-0 bg-[#7a1042]/15" />
            <span className="absolute left-1/2 top-1/2 grid h-10 w-10 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white text-[#e65578]">
              <PlayCircle className="h-7 w-7" />
            </span>
          </div>
          <div className="p-3">
            <p className="font-ui text-xs font-bold text-[#1b1c1a]">
              {currentCourse?.title ?? "Técnicas de tejido tradicional andino"}
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
            image="/images/discover/aprende.png"
            title="Emprendimiento para artesanas"
            modules="8 módulos"
          />
          <MobileCourse
            image="/images/discover/emprende.png"
            title="Fotografía de productos con celular"
            modules="6 módulos"
          />
          <MobileCourse
            image="/images/discover/recursos.png"
            title="Marketing digital para artesanas"
            modules="7 módulos"
          />
        </div>

        <h2 className="mt-5 font-ui text-sm font-bold text-[#1b1c1a]">Categorías</h2>
        <div className="mt-2 grid grid-cols-5 gap-2">
          <MobileCategory icon={Palette} label="Tejido" />
          <MobileCategory icon={Gem} label="Bordado" />
          <MobileCategory icon={Store} label="Emprendimiento" />
          <MobileCategory icon={Megaphone} label="Marketing" />
          <MobileCategory icon={Camera} label="Fotografía" />
        </div>
      </section>

      <div className="hidden lg:block">
        <ArtisanShell>
          <ArtisanHero
            eyebrow="Inicio"
            title={`Hola, ${displayName}`}
            description="Este es tu espacio para aprender, fortalecer tu historia y avanzar paso a paso junto a tu comunidad."
            imageUrl="/images/home/bienvenida-warmi.png"
            actions={
              currentCourse ? (
                <Button
                  asChild
                  size="lg"
                  className="min-h-[56px] rounded-full bg-[#7a3100] px-7 text-base text-white hover:bg-[#5f2600]"
                >
                  <Link href={`/artesana/aprender/${currentCourse.id}` as Route}>
                    <BookOpen className="h-5 w-5" />
                    Continuar mi aprendizaje
                  </Link>
                </Button>
              ) : null
            }
          />

          <section className="grid gap-5 xl:grid-cols-4">
            <ArtisanStatCard
              title="Ruta actual"
              value={data.routeName}
              description={`${data.generalProgress}% de avance general`}
              icon={BookOpen}
              color="bg-[#2f62a3]"
            />
            <ArtisanStatCard
              title="Comunidad"
              value={profile?.community?.name ?? "Pendiente"}
              description="Territorio de referencia cultural"
              icon={Users}
              color="bg-[#17c3cf]"
            />
            <ArtisanStatCard
              title="Técnica"
              value={craft}
              description="Especialidad principal registrada"
              icon={Palette}
              color="bg-[#c02a68]"
            />
            <ArtisanStatCard
              title="Notificaciones"
              value={data.unreadNotifications}
              description="Mensajes o avisos por revisar"
              icon={Bell}
              color="bg-[#f5b900]"
            />
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.35fr_0.9fr]">
            <ArtisanPanel title="Tu avance general" eyebrow="Ruta formativa">
              <div className="flex flex-wrap items-center gap-2">
                <Badge>{data.routeName}</Badge>
                <Badge variant="outline">
                  {profile?.community?.name ?? "Comunidad pendiente"}
                </Badge>
                <Badge variant="secondary">{craft}</Badge>
              </div>
              <div className="mt-8 flex items-end gap-3">
                <span className="font-serif text-7xl font-bold text-[#1b1c1a] 2xl:text-8xl">
                  {data.generalProgress}%
                </span>
                <span className="pb-4 text-lg text-[#5b4a42]">de tu ruta actual</span>
              </div>
              <Progress
                value={data.generalProgress}
                className="mt-6 h-3 bg-[#eadfe2] [&>div]:bg-[#e65578]"
              />
              <p className="mt-5 text-lg text-[#5b4a42]">
                Próximo objetivo: {data.nextObjective}.
              </p>
            </ArtisanPanel>

            <ArtisanPanel title="Próximo taller" eyebrow="Encuentro">
              {data.nextWorkshop ? (
                <div className="space-y-5">
                  <h3 className="font-serif text-4xl font-bold leading-tight text-[#1b1c1a] 2xl:text-5xl">
                    {data.nextWorkshop.workshop.title}
                  </h3>
                  <p className="text-lg text-[#5b4a42]">
                    {data.nextWorkshop.workshop.startsAt
                      ? format(data.nextWorkshop.workshop.startsAt, "dd/MM/yyyy HH:mm")
                      : "Fecha por confirmar"}
                  </p>
                  <p className="text-lg text-[#1b1c1a]">
                    {data.nextWorkshop.workshop.location ?? "Lugar por confirmar"}
                  </p>
                  <Button asChild variant="outline" className="rounded-full">
                    <Link href="/artesana/talleres">
                      <CalendarDays className="h-4 w-4" />
                      Ver talleres
                    </Link>
                  </Button>
                </div>
              ) : (
                <p className="text-lg text-[#5b4a42]">
                  Aún no tienes talleres programados.
                </p>
              )}
            </ArtisanPanel>
          </section>

          <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            <ArtisanActionCard
              href="/artesana/aprender"
              icon={BookOpen}
              title="Continuar curso"
              description="Retoma tus lecciones y revisa materiales pendientes."
              color="bg-[#2f62a3]"
            />
            <ArtisanActionCard
              href="/artesana/talleres"
              icon={CalendarDays}
              title="Ver talleres"
              description="Encuentros para practicar, preguntar y compartir avances."
              color="bg-[#f17a2a]"
            />
            <ArtisanActionCard
              href="/artesana/mi-historia"
              icon={ScrollText}
              title="Editar mi historia"
              description="Documenta tu memoria, técnica y comunidad."
              color="bg-[#b5245b]"
            />
            <ArtisanActionCard
              href="/artesana/convocatorias"
              icon={Bell}
              title="Convocatorias"
              description="Ferias, concursos y oportunidades de crecimiento."
              color="bg-[#f5b900]"
            />
            <ArtisanActionCard
              href="/artesana/mi-vitrina"
              icon={Store}
              title="Mi vitrina"
              description="Presenta tus piezas desde la historia cultural."
              color="bg-[#17c3cf]"
            />
            <ArtisanActionCard
              href="/artesana/logros"
              icon={Award}
              title="Mis logros"
              description="Reconoce avances de aprendizaje y autonomía digital."
              color="bg-[#14715d]"
            />
          </section>

          <section className="grid gap-6 xl:grid-cols-2">
            <ArtisanPanel title="Convocatorias destacadas">
              <div className="grid gap-4">
                {data.opportunities.length ? (
                  data.opportunities.map((item) => (
                    <ArtisanListItem
                      key={item.id}
                      title={item.title}
                      description={
                        item.endsAt
                          ? `Cierra el ${format(item.endsAt, "dd/MM/yyyy")}`
                          : "Fecha abierta"
                      }
                      meta="Oportunidad"
                    />
                  ))
                ) : (
                  <EmptyState title="Sin convocatorias por ahora" />
                )}
              </div>
            </ArtisanPanel>

            <ArtisanPanel title="Logros recientes">
              <div className="grid gap-4">
                {data.recentBadges.length ? (
                  data.recentBadges.map((item) => (
                    <ArtisanListItem
                      key={item.id}
                      title={item.badge.name}
                      description={item.reason ?? item.badge.description ?? ""}
                      meta="Insignia"
                    />
                  ))
                ) : (
                  <EmptyState title="Tus logros aparecerán aquí" />
                )}
              </div>
            </ArtisanPanel>

            <ArtisanPanel title="Productos publicados">
              <ArtisanListItem
                title={`${data.products.length} piezas registradas`}
                description="La vitrina muestra tus piezas con historia cultural, no solo como productos."
                meta="Vitrina cultural"
              />
            </ArtisanPanel>

            <ArtisanPanel title="Pedidos recientes">
              <div className="grid gap-4">
                {data.recentOrders.length ? (
                  data.recentOrders.map((order) => (
                    <ArtisanListItem
                      key={order.id}
                      title={`Pedido ${order.id.slice(0, 8)}`}
                      description={`${order.items[0]?.product.name ?? "Pieza cultural"} - ${order.status}`}
                      meta="Pedido"
                    />
                  ))
                ) : (
                  <EmptyState title="Todavía no tienes pedidos" />
                )}
              </div>
            </ArtisanPanel>
          </section>
        </ArtisanShell>
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
