import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { Bell, BookOpen, ChevronRight, MapPin, Megaphone, Users } from "lucide-react";

import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { ArtisanCommunityService } from "@/shared/services/artisan-community.service";
import { requireRole } from "@/shared/server/auth/helpers";

export default async function ArtisanCommunityPage() {
  const session = await requireRole("ARTESANA");
  const { artisan, community, stories, announcements, unreadNotifications } =
    await new ArtisanCommunityService().getCommunityPage(session.user.id);
  const profile = artisan?.profile;
  const displayName = profile?.displayName ?? session.user.name ?? "Artesana Warmi";
  const avatarUrl = profile?.avatarUrl ?? null;

  return (
    <main className="min-h-screen bg-[#fffaf6] px-4 py-5 pb-24 md:px-8 lg:px-10 lg:py-10 xl:px-14 2xl:px-20">
      <div className="mx-auto w-full max-w-[1760px]">
        <header className="flex items-start justify-between gap-6">
          <div>
            <h1 className="font-serif text-5xl font-bold leading-none text-[#101833] md:text-6xl 2xl:text-7xl">
              Mi comunidad <span className="text-4xl text-[#b5245b]">*</span>
            </h1>
            <p className="mt-4 max-w-4xl text-lg leading-8 text-[#5b4a42]">
              Conecta con las artesanas de tu entorno, consulta historias culturales y
              encuentra oportunidades vinculadas a tu comunidad.
            </p>
          </div>
          <div className="hidden items-center gap-5 xl:flex">
            <button
              type="button"
              className="relative grid h-12 w-12 place-items-center rounded-full text-[#7a3100]"
              aria-label="Notificaciones"
            >
              <Bell className="h-6 w-6" />
              {unreadNotifications ? (
                <span className="absolute right-1 top-0 grid h-6 w-6 place-items-center rounded-full bg-[#b5245b] text-xs font-bold text-white">
                  {unreadNotifications}
                </span>
              ) : null}
            </button>
            <span className="relative h-16 w-16 overflow-hidden rounded-full border-2 border-white shadow-[0_12px_28px_rgba(122,49,0,0.16)]">
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt={displayName}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              ) : (
                <span className="grid h-full w-full place-items-center bg-[#ffe8ef] font-ui text-xl font-extrabold text-[#b5245b]">
                  {displayName.slice(0, 1)}
                </span>
              )}
            </span>
            <ChevronRight className="h-5 w-5 rotate-90 text-[#7a3100]" />
          </div>
        </header>

        {!community ? (
          <section className="mt-8">
            <EmptyCommunityState text="Tu perfil aún no tiene una comunidad asignada." />
          </section>
        ) : (
          <>
            <section className="mt-8 grid gap-8 xl:grid-cols-[1.25fr_0.75fr]">
              <article className="rounded-[20px] border border-[#ecd0bd] bg-white p-7 shadow-[0_22px_58px_rgba(122,49,0,0.08)]">
                <div className="flex flex-wrap items-start justify-between gap-6">
                  <div>
                    <Badge className="bg-[#ffe8ef] text-[#b5245b] hover:bg-[#ffe8ef]">
                      Comunidad
                    </Badge>
                    <h2 className="mt-4 font-serif text-4xl font-bold text-[#b5245b]">
                      {community.name}
                    </h2>
                    <p className="mt-3 max-w-3xl text-base leading-7 text-[#5b4a42]">
                      {community.description ??
                        "Espacio comunitario para preservar saberes, acompañar aprendizajes y compartir oportunidades."}
                    </p>
                  </div>
                  <div className="grid gap-3 rounded-2xl bg-[#fff5e8] p-5 text-[#7a3100]">
                    <p className="flex items-center gap-2 font-ui text-sm font-bold">
                      <MapPin className="h-4 w-4" />
                      {community.location ?? "San Miguel, Cajamarca"}
                    </p>
                    <p className="flex items-center gap-2 font-ui text-sm font-bold">
                      <Users className="h-4 w-4" />
                      {community.profiles.length} artesanas vinculadas
                    </p>
                    <p className="flex items-center gap-2 font-ui text-sm font-bold">
                      <BookOpen className="h-4 w-4" />
                      {stories.length} historias documentadas
                    </p>
                  </div>
                </div>
              </article>

              <Panel title="Artesanas de mi comunidad">
                {community.profiles.length ? (
                  <div className="grid gap-5">
                    {community.profiles.slice(0, 5).map((member) => (
                      <div key={member.id} className="flex items-center gap-4">
                        <Avatar
                          name={member.displayName}
                          imageUrl={member.avatarUrl}
                          size="h-14 w-14"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="font-ui text-base font-extrabold text-[#1b1c1a]">
                            {member.displayName}
                          </p>
                          <p className="text-sm text-[#5b4a42]">
                            {member.craftTypes[0]?.craftType.name ?? "Artesana"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyCommunityState text="Aún no hay artesanas registradas en esta comunidad." />
                )}
              </Panel>
            </section>

            <section className="mt-8 grid gap-8 xl:grid-cols-[1.45fr_0.72fr]">
              <Panel title="Historias culturales">
                {stories.length ? (
                  <div className="grid gap-5 md:grid-cols-3">
                    {stories.slice(0, 3).map((story) => (
                      <article
                        key={story.id}
                        className="group overflow-hidden rounded-[18px] border border-[#ecd0bd] bg-white shadow-[0_16px_38px_rgba(122,49,0,0.08)] transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_26px_58px_rgba(122,49,0,0.13)]"
                      >
                        <div className="relative h-44 bg-[#fff5e8]">
                          {story.coverImage?.url ? (
                            <Image
                              src={story.coverImage.url}
                              alt={story.title}
                              fill
                              sizes="(min-width: 1024px) 360px, 100vw"
                              className="object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                          ) : (
                            <StoryPlaceholder />
                          )}
                          <span className="absolute left-4 top-4 rounded-lg bg-[#fff8f1] px-3 py-1 text-sm font-bold text-[#7a3100]">
                            {story.craftType?.name ?? "Historia"}
                          </span>
                        </div>
                        <div className="p-5">
                          <h3 className="font-serif text-2xl font-bold text-[#101833]">
                            {story.title}
                          </h3>
                          <p className="mt-3 line-clamp-3 text-sm leading-6 text-[#5b4a42]">
                            {story.summary ?? story.content}
                          </p>
                          <div className="mt-5 flex items-center gap-3">
                            <Avatar
                              name={
                                story.user.profile?.displayName ??
                                story.user.name ??
                                "Artesana"
                              }
                              imageUrl={story.user.profile?.avatarUrl ?? null}
                              size="h-10 w-10"
                            />
                            <div>
                              <p className="text-sm font-bold text-[#1b1c1a]">
                                {story.user.profile?.displayName ??
                                  story.user.name ??
                                  "Artesana"}
                              </p>
                              <p className="text-xs text-[#5b4a42]">{community.name}</p>
                            </div>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <EmptyCommunityState text="Todavía no hay historias compartidas por esta comunidad." />
                )}
              </Panel>

              <Panel title="Oportunidades">
                {announcements.length ? (
                  <div className="grid gap-4">
                    {announcements.map((announcement) => (
                      <article
                        key={announcement.id}
                        className="rounded-xl border border-[#ecd0bd] bg-[#fffaf6] p-4"
                      >
                        <p className="flex items-center gap-2 font-ui text-sm font-bold text-[#b5245b]">
                          <Megaphone className="h-4 w-4" />
                          {announcement.type}
                        </p>
                        <h3 className="mt-2 font-serif text-xl font-bold text-[#101833]">
                          {announcement.title}
                        </h3>
                        <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#5b4a42]">
                          {announcement.body}
                        </p>
                        {announcement.endsAt ? (
                          <p className="mt-3 text-xs font-bold text-[#7a3100]">
                            Cierra el {format(announcement.endsAt, "dd/MM/yyyy")}
                          </p>
                        ) : null}
                      </article>
                    ))}
                  </div>
                ) : (
                  <EmptyCommunityState text="No hay convocatorias para tu comunidad por ahora." />
                )}
              </Panel>
            </section>

            <section className="mt-8 rounded-[18px] border border-[#f3c1d3] bg-[#fff0f5] px-7 py-5 shadow-[0_18px_40px_rgba(181,36,91,0.08)]">
              <h3 className="font-serif text-3xl font-bold text-[#b5245b]">
                Comparte desde tu historia
              </h3>
              <p className="mt-2 text-base text-[#5b4a42]">
                Las publicaciones sociales completas estarán disponibles cuando exista el
                modelo de comunidad. Por ahora puedes documentar y actualizar tu historia
                cultural.
              </p>
              <Button
                asChild
                className="mt-5 rounded-xl bg-[#b5245b] px-8 text-white hover:bg-[#941747]"
              >
                <Link href="/artesana/mi-historia">
                  Editar mi historia <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
            </section>
          </>
        )}
      </div>
    </main>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[20px] border border-[#ecd0bd] bg-white p-6 shadow-[0_22px_58px_rgba(122,49,0,0.08)]">
      <header className="mb-5 flex items-center justify-between">
        <h2 className="font-serif text-3xl font-bold text-[#b5245b]">{title}</h2>
      </header>
      {children}
    </section>
  );
}

function Avatar({
  name,
  imageUrl,
  size
}: {
  name: string;
  imageUrl: string | null;
  size: string;
}) {
  return (
    <span className={`relative shrink-0 overflow-hidden rounded-full ${size}`}>
      {imageUrl ? (
        <Image src={imageUrl} alt={name} fill sizes="64px" className="object-cover" />
      ) : (
        <span className="grid h-full w-full place-items-center bg-[#ffe8ef] font-ui text-sm font-extrabold text-[#b5245b]">
          {name.slice(0, 1)}
        </span>
      )}
    </span>
  );
}

function StoryPlaceholder() {
  return (
    <div className="grid h-full w-full place-items-center bg-[linear-gradient(135deg,#fff0d6,#ffe8ef,#e8fbfd)]">
      <BookOpen className="h-10 w-10 text-[#b5245b]" />
    </div>
  );
}

function EmptyCommunityState({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-dashed border-[#ecd0bd] bg-[#fffaf6] p-7 text-center text-base font-semibold text-[#7a5b4a]">
      {text}
    </div>
  );
}
