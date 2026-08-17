import Image from "next/image";
import { ExternalLink, FileText, ImageIcon, NotebookPen, Video } from "lucide-react";

import { LessonCompletionButton } from "@/features/artisan/lesson-completion-button";
import {
  ArtisanHero,
  ArtisanListItem,
  ArtisanPanel,
  ArtisanShell
} from "@/features/artisan/artisan-panel";
import { Badge } from "@/shared/components/ui/badge";
import { AudioHelpButton } from "@/shared/components/media/audio-help-button";
import { YouTubePlayer } from "@/shared/components/media/youtube-player";
import { LearningService } from "@/shared/services/learning.service";
import { requireRole } from "@/shared/server/auth/helpers";

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
                  <a
                    key={resource.id}
                    href={resource.originalUrl ?? resource.file?.url ?? "#"}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <ArtisanListItem
                      meta={resource.type}
                      title={resource.title}
                      description={
                        resource.description ??
                        "Abre o descarga el recurso de esta lección."
                      }
                    />
                  </a>
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

function LessonResource({ resource }: LessonResourceProps) {
  if (resource.type === "VIDEO_YOUTUBE" && resource.externalId) {
    return (
      <section className="space-y-3">
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
      <AudioHelpButton
        audioUrl={resource.file.url}
        title={resource.title || "Escuchar explicación"}
        description={resource.description ?? undefined}
      />
    );
  }

  if (resource.type === "IMAGE" && resource.file?.url) {
    return (
      <figure className="space-y-3">
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
      <section className="space-y-3">
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
    return (
      <a
        href={resource.file.url}
        target="_blank"
        rel="noreferrer"
        className="flex items-start gap-4 rounded-lg border bg-white p-4"
      >
        <FileText className="mt-1 h-6 w-6 text-[#b5245b]" />
        <span>
          <span className="block font-ui font-bold">{resource.title}</span>
          <span className="block text-sm text-[#6b5a4e]">
            {resource.description ?? "Abrir o descargar documento"}
          </span>
        </span>
      </a>
    );
  }

  if (resource.type === "EXTERNAL_LINK" && resource.originalUrl) {
    return (
      <a
        href={resource.originalUrl}
        target="_blank"
        rel="noreferrer"
        className="flex items-start gap-4 rounded-lg border bg-white p-4"
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
        href={resource.file.url}
        target="_blank"
        rel="noreferrer"
        className="flex items-center gap-3 rounded-lg border bg-white p-4 font-ui font-bold"
      >
        <Video className="h-5 w-5" />
        {resource.title}
      </a>
    );
  }

  return null;
}
