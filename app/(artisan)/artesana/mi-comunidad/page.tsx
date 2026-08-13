import Image from "next/image";
import Link from "next/link";
import {
  Bell,
  Camera,
  ChevronRight,
  Clock,
  MapPin,
  Medal,
  MessageCircle,
  Trophy
} from "lucide-react";

import { Button } from "@/shared/components/ui/button";

const featuredStories = [
  {
    tag: "Inspiración",
    title: "Tejiendo nuestra identidad",
    description: "Juana Quispe comparte cómo el tejido une generaciones en su comunidad.",
    author: "Juana Quispe",
    community: "San Miguel, Cajamarca",
    image: "/images/discover/taller.png"
  },
  {
    tag: "Tradición",
    title: "El arte que nos representa",
    description: "Don Mateo nos cuenta sobre la cerámica ancestral de su comunidad.",
    author: "Mateo Mamani",
    community: "San Miguel, Cajamarca",
    image: "/images/home/bienvenida-warmi.png"
  },
  {
    tag: "Colaboración",
    title: "Juntas llegamos más lejos",
    description: "Artesanas de San Miguel se unen para participar en la feria regional.",
    author: "Colectivo Warmi",
    community: "San Miguel, Cajamarca",
    image: "/images/discover/aprende.png"
  }
];

const artisans = [
  ["Juana Quispe", "Tejedora", "128 puntos", "/images/auth/artesana.png"],
  ["Rosa Mamani", "Bordadora", "112 puntos", "/images/discover/emprende.png"],
  ["Marta Huanca", "Ceramista", "96 puntos", "/images/learning/aprender-hero.png"],
  ["Elena Choque", "Tejedora", "88 puntos", "/images/home/bienvenida-warmi.png"]
];

export default function ArtisanCommunityPage() {
  return (
    <main className="min-h-screen bg-[#fffaf6] px-4 py-5 pb-24 md:px-8 lg:px-10 lg:py-10 xl:px-14 2xl:px-20">
      <div className="mx-auto w-full max-w-[1760px]">
        <header className="flex items-start justify-between gap-6">
          <div>
            <h1 className="font-serif text-5xl font-bold leading-none text-[#101833] md:text-6xl 2xl:text-7xl">
              Mi comunidad <span className="text-4xl text-[#b5245b]">❧</span>
            </h1>
            <p className="mt-4 max-w-4xl text-lg leading-8 text-[#5b4a42]">
              Conectar, compartir y crecer juntas para preservar nuestras tradiciones y
              fortalecer nuestro trabajo.
            </p>
          </div>
          <div className="hidden items-center gap-5 xl:flex">
            <button
              type="button"
              className="relative grid h-12 w-12 place-items-center rounded-full text-[#7a3100]"
              aria-label="Notificaciones"
            >
              <Bell className="h-6 w-6" />
              <span className="absolute right-1 top-0 grid h-6 w-6 place-items-center rounded-full bg-[#b5245b] text-xs font-bold text-white">
                3
              </span>
            </button>
            <span className="relative h-16 w-16 overflow-hidden rounded-full border-2 border-white shadow-[0_12px_28px_rgba(122,49,0,0.16)]">
              <Image
                src="/images/auth/artesana.png"
                alt="Artesana"
                fill
                sizes="64px"
                className="object-cover"
              />
            </span>
            <ChevronRight className="h-5 w-5 rotate-90 text-[#7a3100]" />
          </div>
        </header>

        <section className="mt-8 grid gap-8 xl:grid-cols-[1.45fr_0.72fr]">
          <Panel title="Historias destacadas" href="/artesana/mi-comunidad">
            <div className="grid gap-5 md:grid-cols-3">
              {featuredStories.map((story) => (
                <article
                  key={story.title}
                  className="group overflow-hidden rounded-[18px] border border-[#ecd0bd] bg-white shadow-[0_16px_38px_rgba(122,49,0,0.08)] transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_26px_58px_rgba(122,49,0,0.13)]"
                >
                  <div className="relative h-44">
                    <Image
                      src={story.image}
                      alt={story.title}
                      fill
                      sizes="(min-width: 1024px) 360px, 100vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <span className="absolute left-4 top-4 rounded-lg bg-[#fff8f1] px-3 py-1 text-sm font-bold text-[#7a3100]">
                      {story.tag}
                    </span>
                  </div>
                  <div className="p-5">
                    <h3 className="font-serif text-2xl font-bold text-[#101833]">
                      {story.title}
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-[#5b4a42]">
                      {story.description}
                    </p>
                    <div className="mt-5 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <span className="relative h-10 w-10 overflow-hidden rounded-full">
                          <Image
                            src="/images/auth/artesana.png"
                            alt=""
                            fill
                            sizes="40px"
                            className="object-cover"
                          />
                        </span>
                        <div>
                          <p className="text-sm font-bold text-[#1b1c1a]">
                            {story.author}
                          </p>
                          <p className="text-xs text-[#5b4a42]">{story.community}</p>
                        </div>
                      </div>
                      <span className="grid h-10 w-10 place-items-center rounded-full bg-[#f8eadc] text-[#a95511] transition-transform duration-300 group-hover:translate-x-1">
                        <ChevronRight className="h-5 w-5" />
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </Panel>

          <Panel title="Artesanas de mi comunidad" href="/artesana/mi-comunidad">
            <div className="grid gap-6">
              {artisans.map(([name, craft, points, image]) => (
                <div key={name} className="flex items-center gap-4">
                  <span className="relative h-14 w-14 overflow-hidden rounded-full">
                    <Image
                      src={image}
                      alt={name}
                      fill
                      sizes="56px"
                      className="object-cover"
                    />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-ui text-base font-extrabold text-[#1b1c1a]">
                      {name}
                    </p>
                    <p className="text-sm text-[#5b4a42]">{craft}</p>
                    <p className="text-sm text-[#5b4a42]">{points}</p>
                  </div>
                  <Button className="rounded-lg bg-[#f8eadc] text-[#7a3100] hover:bg-[#f3dcc7]">
                    Ver perfil
                  </Button>
                </div>
              ))}
            </div>
          </Panel>
        </section>

        <section className="mt-8 grid gap-8 xl:grid-cols-[1.15fr_0.9fr]">
          <div className="space-y-6">
            <Panel title="Novedades de la comunidad">
              <div className="flex gap-4">
                <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full">
                  <Image
                    src="/images/auth/artesana.png"
                    alt=""
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                </span>
                <div className="flex-1">
                  <div className="rounded-xl border border-[#ecd0bd] px-5 py-4 text-[#7a5b4a]">
                    Comparte algo con tu comunidad...
                  </div>
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap gap-3">
                      <PostButton icon={Camera} label="Foto" />
                      <PostButton icon={Trophy} label="Logro" />
                      <PostButton icon={MessageCircle} label="Pregunta" />
                    </div>
                    <Button className="rounded-lg bg-[#b5245b] px-10 text-white hover:bg-[#941747]">
                      Publicar
                    </Button>
                  </div>
                </div>
              </div>
            </Panel>

            <article className="rounded-[20px] border border-[#ecd0bd] bg-white p-6 shadow-[0_22px_58px_rgba(122,49,0,0.08)]">
              <header className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="relative h-12 w-12 overflow-hidden rounded-full">
                    <Image
                      src="/images/discover/emprende.png"
                      alt=""
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  </span>
                  <div>
                    <p className="font-ui font-extrabold text-[#1b1c1a]">Rosa Mamani</p>
                    <p className="text-sm text-[#5b4a42]">
                      Hace 2 horas · San Miguel, Cajamarca
                    </p>
                  </div>
                </div>
                <span className="text-2xl text-[#7a3100]">...</span>
              </header>
              <p className="mt-5 text-base leading-7 text-[#5b4a42]">
                Así quedó el tejido que terminé hoy, inspirado en los diseños de mi abuela
                y en los colores de mi comunidad.
              </p>
              <div className="relative mt-5 h-72 overflow-hidden rounded-xl">
                <Image
                  src="/images/discover/aprende.png"
                  alt="Tejido compartido por la comunidad"
                  fill
                  sizes="(min-width: 1024px) 900px, 100vw"
                  className="object-cover"
                />
              </div>
            </article>
          </div>

          <div className="space-y-6">
            <Panel title="Eventos próximos" href="/artesana/talleres">
              <article className="grid gap-5 rounded-xl border border-[#ecd0bd] p-4 md:grid-cols-[78px_1fr_auto] md:items-center">
                <div className="rounded-lg bg-[#fff8f1] p-3 text-center">
                  <p className="font-serif text-4xl font-bold text-[#1b1c1a]">15</p>
                  <p className="text-sm font-bold text-[#5b4a42]">AGO</p>
                </div>
                <div>
                  <h3 className="font-ui font-extrabold text-[#1b1c1a]">
                    Feria de saberes textiles
                  </h3>
                  <p className="mt-1 text-sm text-[#5b4a42]">
                    Intercambio de técnicas y exposición de productos artesanales.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-5 text-sm text-[#5b4a42]">
                    <span className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" /> San Miguel, Cajamarca
                    </span>
                    <span className="flex items-center gap-2">
                      <Clock className="h-4 w-4" /> 10:00 AM
                    </span>
                  </div>
                </div>
                <Button className="rounded-lg bg-[#ffe8ef] text-[#b5245b] hover:bg-[#ffdbe8]">
                  Ver detalles
                </Button>
              </article>
            </Panel>

            <Panel title="Logros compartidos" href="/artesana/logros">
              <div className="flex items-center gap-5 rounded-xl border border-[#ecd0bd] bg-[#fffaf6] p-5">
                <span className="grid h-16 w-16 place-items-center rounded-full bg-[#b5245b] text-white">
                  <Medal className="h-8 w-8" />
                </span>
                <div className="flex-1">
                  <p className="font-ui text-lg font-extrabold text-[#1b1c1a]">
                    Meta de aprendizaje alcanzada
                  </p>
                  <p className="text-sm text-[#5b4a42]">
                    10 artesanas completaron 3 talleres este mes.
                  </p>
                </div>
                <span className="rounded-full bg-[#f8eadc] px-4 py-2 font-bold text-[#7a3100]">
                  +7
                </span>
              </div>
            </Panel>

            <Panel title="Cultura que nos inspira" href="/artesana/mi-comunidad">
              <div className="grid gap-5 md:grid-cols-[150px_1fr_auto] md:items-center">
                <div className="relative h-24 overflow-hidden rounded-lg">
                  <Image
                    src="/images/hero/warmi-hero.png"
                    alt="Paisaje cultural"
                    fill
                    sizes="150px"
                    className="object-cover"
                  />
                </div>
                <div>
                  <p className="font-ui font-extrabold text-[#1b1c1a]">
                    Significado de nuestros colores
                  </p>
                  <p className="mt-1 text-sm text-[#5b4a42]">
                    Descubre el simbolismo detrás de los colores que usamos en nuestros
                    tejidos.
                  </p>
                </div>
                <span className="grid h-10 w-10 place-items-center rounded-full bg-[#f8eadc] text-[#a95511]">
                  <ChevronRight className="h-5 w-5" />
                </span>
              </div>
            </Panel>
          </div>
        </section>
      </div>
    </main>
  );
}

function Panel({
  title,
  href,
  children
}: {
  title: string;
  href?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[20px] border border-[#ecd0bd] bg-white p-6 shadow-[0_22px_58px_rgba(122,49,0,0.08)]">
      <header className="mb-6 flex items-center justify-between gap-4">
        <h2 className="font-serif text-3xl font-bold text-[#b5245b]">{title}</h2>
        {href ? (
          <Link href={href} className="font-ui text-sm font-bold text-[#b5245b]">
            Ver todas <ChevronRight className="inline h-4 w-4" />
          </Link>
        ) : null}
      </header>
      {children}
    </section>
  );
}

function PostButton({
  icon: Icon,
  label
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <button
      type="button"
      className="inline-flex h-12 items-center gap-3 rounded-lg bg-[#f8eadc] px-6 font-ui text-sm font-extrabold text-[#7a3100]"
    >
      <Icon className="h-5 w-5" />
      {label}
    </button>
  );
}
