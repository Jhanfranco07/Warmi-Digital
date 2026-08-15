import Image from "next/image";
import {
  BookOpen,
  Camera,
  HeartHandshake,
  ImagePlus,
  MapPin,
  Palette,
  ScrollText,
  Users
} from "lucide-react";

import { StoryForm } from "@/features/artisan/story-form";
import { StoryGalleryManager } from "@/features/artisan/story-gallery-manager";
import { StoryService } from "@/shared/services/story.service";
import { requireRole } from "@/shared/server/auth/helpers";

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
    "Especialidad pendiente";
  const displayName = story?.publicName || session.user.name || "Artesana Warmi";
  const coverUrl = story?.coverImage?.url ?? null;
  const gallery =
    story?.storyFiles.map(({ file, order }) => ({
      id: file.id,
      url: file.url,
      altText: file.altText,
      width: file.width,
      height: file.height,
      order
    })) ?? [];
  const techniques = splitList(story?.techniques);

  return (
    <>
      <section className="relative overflow-hidden bg-[#fffaf6] px-5 pb-7 pt-6 lg:hidden">
        <MobileFloral />
        <div className="relative">
          <h1 className="font-serif text-4xl font-bold leading-tight text-[#7a1042]">
            Mi historia <span className="text-[#c93772]">-</span>
          </h1>
          <p className="mt-2 max-w-[270px] text-sm leading-5 text-[#5b4a42]">
            Comparte tus raíces, tu camino y lo que te inspira a seguir creando con tus
            manos.
          </p>

          <article className="mt-6 rounded-2xl border border-[#f0c3cf] bg-white p-4 shadow-[0_14px_30px_rgba(122,16,66,0.1)]">
            <div className="flex items-center gap-4">
              <AvatarImage imageUrl={coverUrl} name={displayName} size="mobile" />
              <div className="min-w-0">
                <h2 className="font-serif text-2xl font-bold text-[#7a1042]">
                  {displayName}
                </h2>
                <Meta icon={MapPin} text={communityName} />
                <Meta icon={Palette} text={craftName} />
              </div>
            </div>
          </article>

          <div className="mt-5 space-y-4">
            <MobileStoryCard
              icon={Users}
              title="Mi identidad"
              text={story?.summary ?? "Tu resumen cultural aparecera aqui."}
            />
            <MobileStoryCard
              icon={BookOpen}
              title="Mi historia personal"
              text={
                story?.personalStory ?? "Cuenta tu historia personal para verla aqui."
              }
            />
            <MobileStoryCard
              icon={HeartHandshake}
              title="Tradicion familiar"
              text={story?.knowledgeOrigin ?? "Documenta de quien aprendiste tu saber."}
            />
          </div>

          <MobileGallery images={gallery} />
        </div>
      </section>

      <main className="hidden min-h-screen bg-[#fffaf6] px-4 py-5 pb-24 md:px-8 lg:block lg:px-10 lg:py-10 xl:px-14 2xl:px-20">
        <div className="mx-auto w-full max-w-[1760px]">
          <header className="flex flex-wrap items-start justify-between gap-6">
            <div>
              <h1 className="font-serif text-5xl font-bold leading-none text-[#b5245b] md:text-6xl 2xl:text-7xl">
                Mi historia <span className="text-4xl">-</span>
              </h1>
              <p className="mt-4 max-w-4xl text-lg leading-8 text-[#5b4a42]">
                {story?.summary ??
                  "Completa tu perfil cultural para documentar tu identidad, técnica y memoria."}
              </p>
            </div>
            <AvatarImage imageUrl={coverUrl} name={displayName} size="desktop" />
          </header>

          <section className="mt-8 grid gap-7 xl:grid-cols-[1.08fr_0.9fr]">
            <StoryPanel
              title="Mi identidad"
              description="Quién eres y de dónde vienes."
              icon={Palette}
            >
              <div className="grid gap-8 lg:grid-cols-[260px_1fr] lg:items-center">
                <AvatarImage imageUrl={coverUrl} name={displayName} size="large" />
                <div className="grid gap-4 md:grid-cols-2">
                  <ReadOnlyField label="Nombre visible" value={displayName} />
                  <ReadOnlyField label="Comunidad" value={communityName} />
                  <ReadOnlyField
                    label="Ubicación"
                    value="San Miguel, Cajamarca"
                    icon={MapPin}
                  />
                  <ReadOnlyField label="Especialidad" value={craftName} />
                </div>
              </div>
            </StoryPanel>

            <StoryPanel
              title="Mi especialidad"
              description="Técnica o arte tradicional principal."
              icon={Palette}
            >
              <div className="space-y-6">
                <Chip>{craftName}</Chip>
                <div>
                  <p className="mb-3 text-sm font-bold text-[#5b4a42]">
                    Técnicas registradas
                  </p>
                  {techniques.length ? (
                    <div className="flex flex-wrap gap-3">
                      {techniques.map((technique) => (
                        <Chip key={technique}>{technique}</Chip>
                      ))}
                    </div>
                  ) : (
                    <EmptyText text="Aún no registraste técnicas." />
                  )}
                </div>
              </div>
            </StoryPanel>

            <StoryPanel
              title="Mi historia personal"
              description="Lo que te inspira y te motiva a seguir creando."
              icon={ScrollText}
            >
              <Paragraph text={story?.personalStory} />
            </StoryPanel>

            <StoryPanel
              title="Mi comunidad"
              description="Comunidad o asociación."
              icon={Users}
            >
              <div className="flex gap-5">
                <span className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-[#d89911] text-white shadow-[0_14px_28px_rgba(216,153,17,0.25)]">
                  <Users className="h-8 w-8" />
                </span>
                <div className="space-y-4">
                  <ReadOnlyInline label="Comunidad" value={communityName} />
                  <ReadOnlyInline
                    label="Trayectoria"
                    value={
                      story?.artisanJourney ?? "Trayectoria pendiente de documentar."
                    }
                  />
                </div>
              </div>
            </StoryPanel>

            <StoryPanel
              title="Tradicion familiar"
              description="Origen del conocimiento artesanal."
              icon={HeartHandshake}
            >
              <Paragraph text={story?.knowledgeOrigin} />
            </StoryPanel>

            <StoryPanel
              title="Significado cultural"
              description="Valor y memoria que sostiene tu trabajo."
              icon={BookOpen}
            >
              <Paragraph text={story?.culturalMeaning} />
            </StoryPanel>
          </section>

          <StoryPanel
            title="Galería de mi trabajo"
            description="Sube imágenes de tus creaciones y proceso artesanal."
            icon={ImagePlus}
            className="mt-7"
          >
            <StoryGalleryManager images={gallery} />
          </StoryPanel>

          <section className="mt-7 rounded-[20px] border border-[#ecd0bd] bg-white p-6 shadow-[0_22px_58px_rgba(122,49,0,0.08)]">
            <div className="mb-6">
              <h2 className="font-serif text-3xl font-bold text-[#b5245b]">
                Editar ficha completa
              </h2>
              <p className="mt-2 text-base text-[#5b4a42]">
                Esta información alimenta tu perfil cultural público.
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
                coverImageFileId: story?.coverImageId ?? ""
              }}
            />
          </section>
        </div>
      </main>
    </>
  );
}

function splitList(value?: string | null) {
  return (
    value
      ?.split(",")
      .map((item) => item.trim())
      .filter(Boolean) ?? []
  );
}

function MobileFloral() {
  return (
    <>
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
    </>
  );
}

function AvatarImage({
  imageUrl,
  name,
  size
}: {
  imageUrl: string | null;
  name: string;
  size: "mobile" | "desktop" | "large";
}) {
  const classes = {
    mobile: "h-24 w-24 border-4",
    desktop: "h-16 w-16 border-2",
    large: "h-52 w-52 border-8"
  }[size];

  return (
    <span
      className={`relative grid shrink-0 place-items-center overflow-hidden rounded-full border-white bg-[#fff1e5] shadow-[0_18px_40px_rgba(122,49,0,0.15)] ${classes}`}
    >
      {imageUrl ? (
        <Image src={imageUrl} alt={name} fill sizes="208px" className="object-cover" />
      ) : (
        <Camera className="h-8 w-8 text-[#b5245b]" />
      )}
    </span>
  );
}

function Meta({
  icon: Icon,
  text
}: {
  icon: React.ComponentType<{ className?: string }>;
  text: string;
}) {
  return (
    <p className="mt-2 flex items-center gap-2 text-xs text-[#5b4a42]">
      <Icon className="h-3.5 w-3.5 text-[#b5245b]" />
      {text}
    </p>
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
      <div className="grid grid-cols-[58px_1fr] gap-3">
        <span className="grid h-14 w-14 place-items-center rounded-full bg-[#ffe6ee] text-[#b5245b]">
          <Icon className="h-7 w-7" />
        </span>
        <div>
          <h3 className="font-serif text-xl font-bold text-[#7a1042]">{title}</h3>
          <p className="mt-2 line-clamp-4 text-xs leading-5 text-[#5b4a42]">{text}</p>
        </div>
      </div>
    </article>
  );
}

function MobileGallery({
  images
}: {
  images: Array<{ id: string; url: string; altText: string | null }>;
}) {
  return (
    <section className="mt-5 rounded-2xl border border-[#f0c3cf] bg-white p-4 shadow-[0_14px_30px_rgba(122,16,66,0.08)]">
      <h2 className="mb-3 font-serif text-lg font-bold text-[#7a1042]">
        Galería de mi trabajo
      </h2>
      {images.length ? (
        <div className="grid grid-cols-4 gap-2">
          {images.slice(0, 4).map((image) => (
            <div
              key={image.id}
              className="relative aspect-square overflow-hidden rounded-xl border border-[#f5d2dc]"
            >
              <Image
                src={image.url}
                alt={image.altText ?? "Trabajo artesanal"}
                fill
                sizes="25vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>
      ) : (
        <EmptyText text="Aún no subiste imágenes a tu galería." />
      )}
    </section>
  );
}

function StoryPanel({
  title,
  description,
  icon: Icon,
  children,
  className = ""
}: {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-[20px] border border-[#ecd0bd] bg-white p-6 shadow-[0_22px_58px_rgba(122,49,0,0.08)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_28px_70px_rgba(122,49,0,0.11)] ${className}`}
    >
      <header className="mb-6 flex gap-4">
        <Icon className="mt-1 h-8 w-8 shrink-0 text-[#b5245b]" />
        <div>
          <h2 className="font-serif text-3xl font-bold text-[#b5245b]">{title}</h2>
          <p className="mt-1 text-sm text-[#5b4a42]">{description}</p>
        </div>
      </header>
      {children}
    </section>
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

function ReadOnlyInline({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm font-bold text-[#5b4a42]">{label}</p>
      <p className="mt-1 text-base leading-7 text-[#1b1c1a]">{value}</p>
    </div>
  );
}

function Paragraph({ text }: { text?: string | null }) {
  return text ? (
    <p className="max-w-3xl text-lg leading-8 text-[#5b4a42]">{text}</p>
  ) : (
    <EmptyText text="Pendiente de completar." />
  );
}

function EmptyText({ text }: { text: string }) {
  return (
    <p className="rounded-xl border border-dashed border-[#ecd0bd] bg-[#fffaf6] px-4 py-3 text-sm text-[#7a5b4a]">
      {text}
    </p>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex rounded-full bg-[#f8eadc] px-5 py-2 font-ui text-sm font-bold text-[#7a3100]">
      {children}
    </span>
  );
}
