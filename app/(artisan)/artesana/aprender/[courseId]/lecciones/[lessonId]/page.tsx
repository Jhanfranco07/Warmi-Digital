import Image from "next/image";
import {
  Download,
  ExternalLink,
  FileText,
  ImageIcon,
  Maximize2,
  NotebookPen,
  Video
} from "lucide-react";

import { LessonCompletionButton } from "@/features/artisan/lesson-completion-button";
import {
  ArtisanHero,
  ArtisanListItem,
  ArtisanPanel,
  ArtisanShell
} from "@/features/artisan/artisan-panel";
import { AudioHelpButton } from "@/shared/components/media/audio-help-button";
import { YouTubePlayer } from "@/shared/components/media/youtube-player";
import { Badge } from "@/shared/components/ui/badge";
import { requireRole } from "@/shared/server/auth/helpers";
import { LearningService } from "@/shared/services/learning.service";

export default async function ArtisanLessonPage({
  params
}: {
  params: Promise<{ courseId: string; lessonId: string }>;
}) {
  const { courseId, lessonId } = await params;
  const session = await requireRole("ARTESANA");
  const { enrollment, lesson, progress } = await new LearningService().getLessonDetail(
    session.user.id,
    courseId,
    lessonId
  );
  const resources = lesson.lessonFiles;

  return (
    <ArtisanShell>
      <ArtisanHero
        eyebrow={enrollment.course.title}
        title={lesson.title}
        description={`Módulo: ${lesson.module.title}`}
        imageUrl={enrollment.course.imageUrl ?? undefined}
      />

      <section className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <ArtisanPanel title="Contenido de la lección" eyebrow="Aprendizaje">
          <div className="flex flex-wrap gap-2">
            <Badge>{lesson.type}</Badge>
            <Badge variant="outline">{lesson.durationMin ?? 0} min</Badge>
          </div>
          <div className="mt-6 text-lg leading-8 text-[#5b4a42]">
            <p>{lesson.content ?? "Contenido de la lección pendiente de ampliar."}</p>
          </div>
          <div className="mt-7 space-y-6">
            {resources.map((resource) => (
              <LessonResource key={resource.id} resource={resource} />
            ))}
          </div>
          <div className="mt-7">
            <LessonCompletionButton
              courseId={courseId}
              lessonId={lessonId}
              completed={progress?.completed}
            />
          </div>
        </ArtisanPanel>

        <div className="space-y-6">
          <ArtisanPanel title="Recursos" eyebrow="Materiales">
            <div className="grid gap-4">
              {resources.length ? (
                resources.map((resource) => (
                  <ResourceNavigationCard key={resource.id} resource={resource} />
                ))
              ) : (
                <p className="text-base leading-7 text-[#5b4a42]">
                  La facilitadora aún no agregó materiales descargables.
                </p>
              )}
            </div>
          </ArtisanPanel>

          <ArtisanPanel title="Actividad práctica" eyebrow="Aplicar">
            <div className="flex items-start gap-4">
              <span className="inline-flex rounded-full bg-[#fff0f5] p-3 text-[#b5245b]">
                <NotebookPen className="h-5 w-5" />
              </span>
              <p className="text-base leading-7 text-[#5b4a42]">
                Aplica esta lección en una pieza, foto o nota de tu proceso artesanal.
                Luego puedes compartir tu avance con tu facilitadora.
              </p>
            </div>
          </ArtisanPanel>

          <ArtisanPanel title="Sugerencia" eyebrow="Guardar evidencia">
            <div className="flex items-start gap-4">
              <span className="inline-flex rounded-full bg-[#e8fbfc] p-3 text-[#0b7f88]">
                <FileText className="h-5 w-5" />
              </span>
              <p className="text-base leading-7 text-[#5b4a42]">
                Toma una captura o fotografía de tu avance para usarla luego en tu
                historia o en tu vitrina cultural.
              </p>
            </div>
          </ArtisanPanel>
        </div>
      </section>
    </ArtisanShell>
  );
}

type LessonResourceProps = {
  resource: Awaited<
    ReturnType<LearningService["getLessonDetail"]>
  >["lesson"]["lessonFiles"][number];
};

function getPreviewUrl(resource: LessonResourceProps["resource"]) {
  if (!resource.file?.id) return null;
  return `/api/files/${resource.file.id}/preview`;
}

function getDownloadUrl(resource: LessonResourceProps["resource"]) {
  const previewUrl = getPreviewUrl(resource);
  return previewUrl ? `${previewUrl}?download=1` : resource.file?.url;
}

function ResourceNavigationCard({ resource }: LessonResourceProps) {
  return (
    <a
      href={`#recurso-${resource.id}`}
      className="block rounded-lg focus:outline-none focus:ring-2 focus:ring-[#b5245b]"
    >
      <ArtisanListItem
        meta={resource.type.replace(/_/g, " ")}
        title={resource.title}
        description={resource.description ?? "Ver este recurso dentro de la lección."}
      />
    </a>
  );
}

function LessonResource({ resource }: LessonResourceProps) {
  if (resource.type === "VIDEO_YOUTUBE" && resource.externalId) {
    return (
      <section id={`recurso-${resource.id}`} className="scroll-mt-24 space-y-3">
        <h2 className="font-display text-2xl">{resource.title}</h2>
        {resource.description ? (
          <p className="text-base leading-7 text-[#5b4a42]">{resource.description}</p>
        ) : null}
        <YouTubePlayer videoId={resource.externalId} title={resource.title} />
        <p className="text-sm text-[#6b5a4e]">
          Si el video no carga, puede tener reproducción embebida restringida.
        </p>
      </section>
    );
  }

  if (resource.type === "AUDIO" && resource.file?.url) {
    return (
      <section id={`recurso-${resource.id}`} className="scroll-mt-24">
        <AudioHelpButton
          audioUrl={resource.file.url}
          title={resource.title || "Escuchar explicación"}
          description={resource.description ?? undefined}
        />
      </section>
    );
  }

  if (resource.type === "IMAGE" && resource.file?.url) {
    return (
      <figure id={`recurso-${resource.id}`} className="scroll-mt-24 space-y-3">
        <div className="relative aspect-video overflow-hidden rounded-lg border bg-white">
          <Image
            src={resource.file.url}
            alt={resource.file.altText ?? resource.title}
            fill
            sizes="(min-width: 1280px) 720px, 100vw"
            className="object-contain"
          />
        </div>
        <figcaption className="flex items-start gap-2 text-sm text-[#6b5a4e]">
          <ImageIcon className="mt-0.5 h-4 w-4" />
          <span>{resource.description ?? resource.title}</span>
        </figcaption>
      </figure>
    );
  }

  if (resource.type === "VIDEO_UPLOAD" && resource.file?.url) {
    return (
      <section id={`recurso-${resource.id}`} className="scroll-mt-24 space-y-3">
        <h2 className="font-display text-2xl">{resource.title}</h2>
        <video
          src={resource.file.url}
          controls
          preload="metadata"
          className="aspect-video w-full rounded-lg bg-black"
        >
          <a href={resource.file.url}>Abrir video</a>
        </video>
      </section>
    );
  }

  if ((resource.type === "PDF" || resource.type === "DOCUMENT") && resource.file?.url) {
    const previewUrl = getPreviewUrl(resource);
    const downloadUrl = getDownloadUrl(resource);

    return (
      <section
        id={`recurso-${resource.id}`}
        className="scroll-mt-24 overflow-hidden rounded-lg border border-[#f2c7b3] bg-white shadow-[0_16px_42px_rgba(122,73,20,0.08)]"
      >
        <div className="flex flex-col gap-4 border-b border-[#f2c7b3] bg-[#fff8f1] p-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#ffe8f0] text-[#b5245b]">
              <FileText className="h-6 w-6" />
            </span>
            <div>
              <h2 className="font-display text-2xl">{resource.title}</h2>
              <p className="mt-1 text-base leading-7 text-[#5b4a42]">
                {resource.description ?? "Documento de apoyo para esta lección."}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {previewUrl ? (
              <a
                href={previewUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-md border border-[#b5245b] px-4 py-2 font-ui text-sm font-bold text-[#b5245b]"
              >
                <Maximize2 className="h-4 w-4" />
                Abrir visor
              </a>
            ) : null}
            {downloadUrl ? (
              <a
                href={downloadUrl}
                target="_blank"
                rel="noreferrer"
                download
                className="inline-flex items-center gap-2 rounded-md bg-[#b5245b] px-4 py-2 font-ui text-sm font-bold text-white"
              >
                <Download className="h-4 w-4" />
                Descargar PDF
              </a>
            ) : null}
          </div>
        </div>
        {previewUrl ? (
          <iframe
            src={previewUrl}
            title={`Vista previa de ${resource.title}`}
            className="h-[560px] w-full bg-[#f5f0ea]"
          />
        ) : null}
      </section>
    );
  }

  if (resource.type === "EXTERNAL_LINK" && resource.originalUrl) {
    return (
      <a
        id={`recurso-${resource.id}`}
        href={resource.originalUrl}
        target="_blank"
        rel="noreferrer"
        className="flex scroll-mt-24 items-start gap-4 rounded-lg border bg-white p-4"
      >
        <ExternalLink className="mt-1 h-6 w-6 text-[#0b7f88]" />
        <span>
          <span className="block font-ui font-bold">{resource.title}</span>
          <span className="block text-sm text-[#6b5a4e]">
            {resource.description ?? "Abrir enlace complementario"}
          </span>
        </span>
      </a>
    );
  }

  if (resource.file?.url) {
    return (
      <a
        id={`recurso-${resource.id}`}
        href={resource.file.url}
        target="_blank"
        rel="noreferrer"
        className="flex scroll-mt-24 items-center gap-3 rounded-lg border bg-white p-4 font-ui font-bold"
      >
        <Video className="h-5 w-5" />
        {resource.title}
      </a>
    );
  }

  return null;
}
