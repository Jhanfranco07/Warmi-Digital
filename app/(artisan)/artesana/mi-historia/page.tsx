import Image from "next/image";
import {
  BookOpen as BookOpenIcon,
  Camera,
  Edit3,
  Eye,
  HeartHandshake,
  ImagePlus,
  KeyRound,
  MapPin,
  Palette,
  ScrollText,
  Users
} from "lucide-react";

import { StoryForm } from "@/features/artisan/story-form";
import { Button } from "@/shared/components/ui/button";
import { StoryService } from "@/shared/services/story.service";
import { requireRole } from "@/shared/server/auth/helpers";

const galleryImages = [
  "/images/discover/aprende.png",
  "/images/discover/taller.png",
  "/images/learning/aprender-hero.png",
  "/images/home/bienvenida-warmi.png",
  "/images/discover/emprende.png"
];

export default async function ArtisanStoryPage() {
  const session = await requireRole("ARTESANA");
  const { story, communities, craftTypes } = await new StoryService().getStoryPage(
    session.user.id
  );

  const communityName =
    communities.find((community) => community.id === story?.communityId)?.name ??
    "San Miguel, Cajamarca";
  const craftName =
    craftTypes.find((craftType) => craftType.id === story?.craftTypeId)?.name ??
    "Tejido en telar de cintura";
  const displayName = story?.publicName || session.user.name || "Elena Mamani";
  const summary =
    story?.summary ||
    "Comparte tu historia, tus raíces y el conocimiento que te hace única.";
  const personalStory =
    story?.personalStory ||
    "Desde pequeña acompañé a mi abuela en el telar. Ella me enseñó que cada diseño cuenta una historia. Hoy, mi propósito es mantener viva esta tradición y compartir nuestro legado con las nuevas generaciones.";
  const familyStory =
    story?.knowledgeOrigin ||
    "Aprendí de mi abuela Domitila, luego mi madre me guió y ahora enseño a mis hijas y sobrinas. El tejido es parte de nuestra vida y de nuestra identidad.";
  const techniques =
    story?.techniques
      ?.split(",")
      .map((technique) => technique.trim())
      .filter(Boolean) ?? [];

  return (
    <>
      <section className="relative overflow-hidden bg-[#fffaf6] px-5 pb-7 pt-6 lg:hidden">
        <div className="pointer-events-none absolute -right-16 top-5 h-44 w-44 rounded-full bg-[#ffe6ee]" />
        <div className="pointer-events-none absolute -right-4 top-9 h-40 w-40 opacity-80">
          <Image
            src="/images/brand/warmi-isotipo.png"
            alt=""
            fill
            sizes="160px"
            className="object-contain"
          />
        </div>

        <div className="relative">
          <h1 className="font-serif text-4xl font-bold leading-tight text-[#7a1042]">
            Mi historia <span className="text-[#c93772]">❧</span>
          </h1>
          <p className="mt-2 max-w-[270px] text-sm leading-5 text-[#5b4a42]">
            Comparte tus raíces, tu camino y lo que te inspira a seguir creando con tus
            manos.
          </p>

          <article className="mt-6 rounded-2xl border border-[#f0c3cf] bg-white p-4 shadow-[0_14px_30px_rgba(122,16,66,0.1)]">
            <div className="flex items-center gap-4">
              <div className="relative h-24 w-24 shrink-0">
                <span className="relative block h-full w-full overflow-hidden rounded-full border-4 border-white shadow-lg">
                  <Image
                    src={story?.coverImage?.url || "/images/auth/artesana.png"}
                    alt={displayName}
                    fill
                    sizes="96px"
                    className="object-cover"
                  />
                </span>
                <span className="absolute -bottom-1 -right-1 grid h-9 w-9 place-items-center rounded-full bg-white text-[#b5245b] shadow">
                  <Camera className="h-4 w-4" />
                </span>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="font-serif text-2xl font-bold text-[#7a1042]">
                    {displayName}
                  </h2>
                  <Edit3 className="h-4 w-4 text-[#b5245b]" />
                </div>
                <p className="mt-2 flex items-center gap-2 text-xs text-[#5b4a42]">
                  <MapPin className="h-3.5 w-3.5 text-[#b5245b]" />
                  Comunidad: {communityName}
                </p>
                <p className="mt-1 flex items-center gap-2 text-xs text-[#5b4a42]">
                  <Palette className="h-3.5 w-3.5 text-[#b5245b]" />
                  Especialidad: {craftName}
                </p>
              </div>
            </div>
          </article>

          <div className="mt-5 space-y-4">
            <MobileStoryCard
              icon={Users}
              title="Mi identidad"
              text="Me identifico como una mujer andina, soñadora y perseverante. Valoro mis raíces y creo en el poder de nuestras manos para transformar realidades."
            />
            <MobileStoryCard
              icon={BookOpenIcon}
              title="Mi historia personal"
              text={personalStory}
            />
            <MobileStoryCard
              icon={HeartHandshake}
              title="Tradición familiar"
              text={familyStory}
            />
          </div>

          <section className="mt-5 rounded-2xl border border-[#f0c3cf] bg-white p-4 shadow-[0_14px_30px_rgba(122,16,66,0.08)]">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-serif text-lg font-bold text-[#7a1042]">
                Galería de mi trabajo
              </h2>
              <span className="text-xs font-bold text-[#b5245b]">Editar galería</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {galleryImages.slice(0, 4).map((image, index) => (
                <div
                  key={image}
                  className="relative aspect-square overflow-hidden rounded-xl border border-[#f5d2dc]"
                >
                  <Image
                    src={image}
                    alt={`Trabajo artesanal ${index + 1}`}
                    fill
                    sizes="25vw"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
            <div className="mt-3 flex justify-center gap-1">
              {galleryImages.slice(0, 5).map((image, index) => (
                <span
                  key={image}
                  className={`h-1.5 w-1.5 rounded-full ${
                    index === 0 ? "bg-[#b5245b]" : "bg-[#f0c3cf]"
                  }`}
                />
              ))}
            </div>
          </section>
        </div>
      </section>

      <main className="hidden min-h-screen bg-[#fffaf6] px-4 py-5 pb-24 md:px-8 lg:block lg:px-10 lg:py-10 xl:px-14 2xl:px-20">
        <div className="mx-auto w-full max-w-[1760px]">
          <header className="flex flex-wrap items-start justify-between gap-6">
            <div>
              <h1 className="font-serif text-5xl font-bold leading-none text-[#b5245b] md:text-6xl 2xl:text-7xl">
                Mi historia <span className="text-4xl">❧</span>
              </h1>
              <p className="mt-4 max-w-4xl text-lg leading-8 text-[#5b4a42]">{summary}</p>
            </div>
            <div className="flex items-center gap-5">
              <Button
                variant="outline"
                className="hidden rounded-full border-[#d8b899] bg-white px-8 text-[#7a3100] hover:bg-[#fff1e5] md:inline-flex"
              >
                <Eye className="h-5 w-5" />
                Vista pública
              </Button>
              <span className="relative h-16 w-16 overflow-hidden rounded-full border-2 border-white shadow-[0_12px_28px_rgba(122,49,0,0.16)]">
                <Image
                  src={story?.coverImage?.url || "/images/auth/artesana.png"}
                  alt={displayName}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </span>
            </div>
          </header>

          <section className="mt-8 grid gap-7 xl:grid-cols-[1.08fr_0.9fr]">
            <StoryPanel
              title="Mi identidad"
              description="Cuéntanos quién eres y de dónde vienes."
              icon={Palette}
              action="Editar"
            >
              <div className="grid gap-8 lg:grid-cols-[260px_1fr] lg:items-center">
                <div className="relative mx-auto h-52 w-52">
                  <div className="absolute inset-6 bg-[radial-gradient(circle,#f6d9c3_1px,transparent_1px)] [background-size:12px_12px]" />
                  <span className="relative block h-full w-full overflow-hidden rounded-full border-8 border-white shadow-[0_18px_40px_rgba(122,49,0,0.15)]">
                    <Image
                      src={story?.coverImage?.url || "/images/auth/artesana.png"}
                      alt={displayName}
                      fill
                      sizes="208px"
                      className="object-cover"
                    />
                  </span>
                  <span className="absolute bottom-2 right-2 grid h-14 w-14 place-items-center rounded-full bg-[#b5245b] text-white shadow-lg">
                    <Camera className="h-6 w-6" />
                  </span>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <ReadOnlyField label="Nombre completo" value={displayName} />
                  <ReadOnlyField label="Comunidad" value={communityName} />
                  <ReadOnlyField
                    label="Ubicación"
                    value="San Miguel, Cajamarca"
                    icon={MapPin}
                  />
                  <ReadOnlyField label="Idioma(s)" value="Quechua, Español" />
                </div>
              </div>
            </StoryPanel>

            <StoryPanel
              title="Mi especialidad"
              description="¿Qué técnica o arte tradicional desarrollas?"
              icon={KeyRound}
              action="Editar"
            >
              <div className="space-y-6">
                <div className="inline-flex rounded-full bg-[#f8eadc] px-5 py-3 font-ui font-bold text-[#7a3100]">
                  {craftName}
                </div>
                <div>
                  <p className="mb-3 text-sm font-bold text-[#5b4a42]">
                    ¿Qué productos elaboras?
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {["Fajas", "Chullos", "Licllas", "Bolsos", "Otros"].map((item) => (
                      <Chip key={item}>{item}</Chip>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-sm font-bold text-[#5b4a42]">
                    Materiales que utilizo
                  </p>
                  <p className="text-base text-[#5b4a42]">
                    Lana de oveja, lana de alpaca y tintes naturales.
                  </p>
                </div>
              </div>
            </StoryPanel>

            <StoryPanel
              title="Mi historia personal"
              description="Cuéntanos tu historia, lo que te inspira y lo que te motiva a seguir creando."
              icon={ScrollText}
              action="Editar"
            >
              <p className="max-w-3xl text-lg leading-8 text-[#5b4a42]">
                {personalStory}
              </p>
            </StoryPanel>

            <StoryPanel
              title="Mi comunidad"
              description="Mi comunidad o asociación"
              icon={Users}
              action="Editar"
            >
              <div className="flex gap-5">
                <span className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-[#d89911] text-white shadow-[0_14px_28px_rgba(216,153,17,0.25)]">
                  <Users className="h-8 w-8" />
                </span>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-bold text-[#5b4a42]">
                      Mi comunidad o asociación
                    </p>
                    <p className="text-lg font-bold text-[#1b1c1a]">
                      Asociación de Artesanas de San Miguel
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#5b4a42]">
                      Mi rol en la comunidad
                    </p>
                    <p className="text-base text-[#5b4a42]">
                      Soy artesana y también enseño a las niñas y jóvenes el arte del
                      tejido.
                    </p>
                  </div>
                </div>
              </div>
            </StoryPanel>

            <StoryPanel
              title="Tradición familiar"
              description="¿Quiénes te enseñaron? ¿Cómo ha pasado esta tradición en tu familia?"
              icon={HeartHandshake}
              action="Editar"
            >
              <div className="grid gap-6 md:grid-cols-[1fr_220px] md:items-center">
                <p className="text-lg leading-8 text-[#5b4a42]">{familyStory}</p>
                <div className="relative h-40 overflow-hidden rounded-[18px] bg-[#fff1e5]">
                  <Image
                    src="/images/brand/warmi-isotipo.png"
                    alt="Tradición familiar"
                    fill
                    sizes="220px"
                    className="object-contain p-5"
                  />
                </div>
              </div>
            </StoryPanel>

            <StoryPanel
              title="Técnicas que utilizo"
              description="Técnicas principales"
              icon={Palette}
              action="Editar"
            >
              <div className="space-y-6">
                <div>
                  <p className="mb-3 text-sm font-bold text-[#5b4a42]">
                    Técnicas principales
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {(techniques.length
                      ? techniques
                      : ["Telar de cintura", "Urdimbre", "Brocado", "Tinte natural"]
                    ).map((technique) => (
                      <Chip key={technique}>{technique}</Chip>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="mb-3 text-sm font-bold text-[#5b4a42]">Otras técnicas</p>
                  <div className="flex flex-wrap gap-3">
                    {["Teñido con plantas", "Hilado a mano", "Diseño tradicional"].map(
                      (item) => (
                        <Chip key={item}>{item}</Chip>
                      )
                    )}
                  </div>
                </div>
              </div>
            </StoryPanel>
          </section>

          <StoryPanel
            title="Galería de mi trabajo"
            description="Comparte imágenes de tus creaciones y tu proceso artesanal."
            icon={ImagePlus}
            action="Agregar imagen"
            className="mt-7"
          >
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {galleryImages.map((image, index) => (
                <div
                  key={image}
                  className="group relative h-44 overflow-hidden rounded-xl border border-[#ecd0bd] shadow-[0_14px_32px_rgba(122,49,0,0.08)]"
                >
                  <Image
                    src={image}
                    alt={`Imagen del trabajo artesanal ${index + 1}`}
                    fill
                    sizes="(min-width: 1024px) 260px, 50vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
              ))}
            </div>
          </StoryPanel>

          <section className="mt-7 rounded-[20px] border border-[#ecd0bd] bg-white p-6 shadow-[0_22px_58px_rgba(122,49,0,0.08)]">
            <div className="mb-6">
              <h2 className="font-serif text-3xl font-bold text-[#b5245b]">
                Editar ficha completa
              </h2>
              <p className="mt-2 text-base text-[#5b4a42]">
                Actualiza la información que alimenta tu perfil cultural público.
              </p>
            </div>
            <StoryForm
              communities={communities}
              craftTypes={craftTypes}
              defaultValues={{
                title: story?.title ?? "",
                publicName: story?.publicName ?? "",
                communityId: story?.communityId ?? "",
                craftTypeId: story?.craftTypeId ?? "",
                summary: story?.summary ?? "",
                personalStory: story?.personalStory ?? "",
                artisanJourney: story?.artisanJourney ?? "",
                knowledgeOrigin: story?.knowledgeOrigin ?? "",
                learnedFrom: story?.learnedFrom ?? "",
                techniques: story?.techniques ?? "",
                culturalMeaning: story?.culturalMeaning ?? "",
                coverImageUrl: story?.coverImage?.url ?? ""
              }}
            />
          </section>
        </div>
      </main>
    </>
  );
}

function StoryPanel({
  title,
  description,
  icon: Icon,
  action,
  children,
  className = ""
}: {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  action?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-[20px] border border-[#ecd0bd] bg-white p-6 shadow-[0_22px_58px_rgba(122,49,0,0.08)] ${className}`}
    >
      <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="flex gap-4">
          <Icon className="mt-1 h-8 w-8 shrink-0 text-[#b5245b]" />
          <div>
            <h2 className="font-serif text-3xl font-bold text-[#b5245b]">{title}</h2>
            <p className="mt-1 text-sm text-[#5b4a42]">{description}</p>
          </div>
        </div>
        {action ? (
          <Button
            variant="outline"
            className="rounded-full border-[#d8b899] bg-white px-7 text-[#7a3100] hover:bg-[#fff1e5]"
          >
            <Edit3 className="h-4 w-4" />
            {action}
          </Button>
        ) : null}
      </header>
      {children}
    </section>
  );
}

function MobileStoryCard({
  icon: Icon,
  title,
  text
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  text: string;
}) {
  return (
    <article className="rounded-2xl border border-[#f5d2dc] bg-white p-4 shadow-[0_12px_26px_rgba(122,16,66,0.07)]">
      <div className="grid grid-cols-[58px_1fr_auto] gap-3">
        <span className="grid h-14 w-14 place-items-center rounded-full bg-[#ffe6ee] text-[#b5245b]">
          <Icon className="h-7 w-7" />
        </span>
        <div>
          <h3 className="font-serif text-xl font-bold text-[#7a1042]">{title}</h3>
          <p className="mt-2 line-clamp-4 text-xs leading-5 text-[#5b4a42]">{text}</p>
        </div>
        <Edit3 className="mt-1 h-4 w-4 text-[#b5245b]" />
      </div>
    </article>
  );
}

function ReadOnlyField({
  label,
  value,
  icon: Icon
}: {
  label: string;
  value: string;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div>
      <p className="mb-2 text-sm font-bold text-[#5b4a42]">{label}</p>
      <div className="flex min-h-14 items-center gap-3 rounded-lg border border-[#ecd0bd] bg-white px-4 text-base text-[#1b1c1a]">
        {Icon ? <Icon className="h-5 w-5 text-[#b5245b]" /> : null}
        {value}
      </div>
    </div>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-[#f8eadc] px-5 py-2 font-ui text-sm font-bold text-[#7a3100]">
      {children}
    </span>
  );
}
