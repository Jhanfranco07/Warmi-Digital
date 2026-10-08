"use client";

/* eslint-disable @next/next/no-html-link-for-pages -- Offline navigation needs document requests, not uncached RSC payloads. */

import { useEffect, useState, type MouseEvent } from "react";
import {
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  PlayCircle,
  Trash2
} from "lucide-react";
import { SpeechButton } from "@/shared/accessibility/speech-button";
import { Button } from "@/shared/components/ui/button";
import { Module3Session1Content } from "@/features/artisan/learning/module3-session1-content";
import { Module4Content } from "@/features/artisan/learning/module4-content";
import { MODULE4_ID, MODULE4_SESSIONS, module4ImageKey } from "@/shared/learning/module4";
import { Module3JourneyContent } from "@/features/artisan/learning/module3-journey-content";
import { MODULE3_SESSIONS } from "@/shared/learning/module3-journey";
import { MODULE3_CONTENT_VERSION } from "@/shared/learning/module3-version";
import {
  MODULE3_SESSION1_ID,
  MODULE3_SESSION2_ID,
  type Session1Resource
} from "@/shared/learning/module3-session1";
import {
  formatBytes,
  readDownloads,
  isLearningCache,
  removeDownload,
  verifiedDownloads
} from "@/shared/offline/module3-storage";
import type {
  ModuleDownload,
  OfflineLesson,
  OfflineResource
} from "@/shared/offline/module3-types";
import {
  acceptsOfflineCourse,
  LEARNING_PROGRAM,
  moduleCapability
} from "@/shared/learning/program";

const unavailable = "Este contenido todavía no está disponible sin conexión.";
const connectionRequired = "Este recurso necesita conexión a internet.";

export function OfflineLearning() {
  const [download, setDownload] = useState<ModuleDownload>();
  const [downloads, setDownloads] = useState<ModuleDownload[]>([]);
  const [loading, setLoading] = useState(true);
  const [path, setPath] = useState("");
  const [message, setMessage] = useState("");
  const [online, setOnline] = useState(false);
  const [hasLocalData, setHasLocalData] = useState(false);
  useEffect(() => {
    const connection = () => setOnline(navigator.onLine);
    connection();
    window.addEventListener("online", connection);
    window.addEventListener("offline", connection);
    const history = () => setPath(window.location.pathname);
    window.addEventListener("popstate", history);
    setPath(window.location.pathname);
    void verifiedDownloads()
      .then(async (saved) => {
        setDownloads(saved);
        const segments = window.location.pathname.split("/").filter(Boolean);
        setDownload(
          saved.find((item) =>
            [...item.lessons, ...(item.supportLessons ?? [])].some(
              (lesson) => lesson.id === segments[4]
            )
          ) ?? saved[0]
        );
        setHasLocalData(
          (await readDownloads()).length > 0 ||
            (await caches.keys()).some(isLearningCache)
        );
      })
      .catch(() => setMessage(unavailable))
      .finally(() => setLoading(false));
    return () => {
      window.removeEventListener("online", connection);
      window.removeEventListener("offline", connection);
      window.removeEventListener("popstate", history);
    };
  }, []);
  const segments = path.split("/").filter(Boolean);
  const courseId = segments[2];
  const lessonId = segments[4];
  const isEntry = [
    "/",
    "/artesana",
    "/artesana/dashboard",
    "/artesana/aprender",
    "/offline-learning"
  ].includes(path);
  const validCourse =
    !courseId ||
    Boolean(
      download && acceptsOfflineCourse(download.moduleId, download.courseId, courseId)
    );
  const supportLessons = download?.supportLessons ?? [];
  const lesson = [...(download?.lessons ?? []), ...supportLessons].find(
    (item) => item.id === lessonId
  );
  const lessonIndex = download?.lessons.findIndex((item) => item.id === lessonId) ?? -1;
  const nextLesson = lessonIndex >= 0 ? download?.lessons[lessonIndex + 1] : undefined;
  const programModule = download && moduleCapability(download.moduleId);
  const moduleTitle = programModule?.title ?? download?.title;
  const courseHref = `/artesana/aprender/${programModule ? LEARNING_PROGRAM.id : download?.courseId}`;

  function navigate(event: MouseEvent<HTMLElement>) {
    const anchor = (event.target as Element).closest<HTMLAnchorElement>("a[href]");
    if (!anchor || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey)
      return;
    const url = new URL(anchor.href);
    if (url.origin !== location.origin || !url.pathname.startsWith("/artesana/aprender"))
      return;
    if (url.pathname === location.pathname && url.hash) return;
    event.preventDefault();
    // The shell keeps its local data while preserving the existing lesson URLs.
    window.history.pushState(null, "", url.href);
    setPath(url.pathname);
    setMessage("");
    window.scrollTo(0, 0);
  }

  async function remove() {
    try {
      await removeDownload(download?.moduleId);
      const remaining = await verifiedDownloads();
      setDownloads(remaining);
      setDownload(remaining[0]);
      setHasLocalData(remaining.length > 0);
      setMessage("");
    } catch {
      setMessage("No se pudo eliminar la descarga. Intenta nuevamente.");
    }
  }

  return (
    <main
      data-warmi-offline-learning
      onClick={navigate}
      className="mx-auto min-h-screen max-w-4xl space-y-6 px-5 py-8"
    >
      <header className="space-y-3 border-b pb-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="font-serif text-lg font-bold text-[#b5245b]">Warmi Digital</p>
          <a
            href="/artesana/aprender"
            className="inline-flex min-h-12 items-center gap-2 font-semibold text-[#b5245b]"
          >
            <ArrowLeft className="h-5 w-5" />
            Mi aprendizaje
          </a>
        </div>
        <h1 className="break-words font-serif text-2xl font-bold">
          {lesson?.title ?? "Mi aprendizaje"}
        </h1>
      </header>
      {download?.moduleId === LEARNING_PROGRAM.modules[2].id &&
        download.contentVersion !== MODULE3_CONTENT_VERSION && (
          <p role="status" className="rounded-md border border-[#dfc7d2] p-4">
            Tienes una descarga anterior del Módulo 3. Puedes seguir usándola. Conéctate y
            actualiza la descarga para acceder a las cuatro sesiones y sus guías nuevas.
          </p>
        )}
      {!lessonId && downloads.length > 1 && (
        <nav aria-label="Módulos descargados" className="flex flex-wrap gap-3">
          {downloads.map((item) => (
            <Button
              key={item.moduleId}
              variant="outline"
              onClick={() => setDownload(item)}
            >
              {moduleCapability(item.moduleId)?.title ?? item.title}
            </Button>
          ))}
        </nav>
      )}
      {loading ? (
        <p role="status">Cargando contenidos descargados...</p>
      ) : !download ||
        !validCourse ||
        (lessonId && !lesson) ||
        (!isEntry && segments[1] !== "aprender") ? (
        <p role="status">{unavailable}</p>
      ) : (
        <>
          {lesson ? (
            <>
              <a
                href={courseHref}
                className="inline-flex min-h-12 items-center gap-2 text-[#b5245b]"
              >
                <ArrowLeft className="h-5 w-5" />
                Volver al curso
              </a>
              <p className="text-sm text-muted-foreground">{moduleTitle}</p>
              <OfflineLessonContent key={lesson.id} lesson={lesson} download={download} />
              {nextLesson && (
                <a
                  href={`${courseHref}/lecciones/${nextLesson.id}`}
                  className="flex min-h-12 items-center justify-between gap-3 rounded-md bg-[#b5245b] px-4 py-3 font-semibold text-white"
                >
                  Siguiente sesión
                  <ChevronRight className="h-5 w-5 shrink-0" />
                </a>
              )}
              <nav
                aria-label="Lecciones del módulo"
                className="flex flex-wrap gap-3 border-t pt-4"
              >
                {download.lessons.map((item, index) => (
                  <a
                    key={item.id}
                    href={`${courseHref}/lecciones/${item.id}`}
                    aria-current={item.id === lesson.id ? "page" : undefined}
                    className="inline-flex min-h-12 items-center gap-2 rounded-md border px-4 py-2 font-semibold aria-[current=page]:border-[#b5245b]"
                  >
                    {index + 1}. {item.title}
                    <ChevronRight className="h-4 w-4 shrink-0" />
                  </a>
                ))}
              </nav>
              {supportLessons.length > 0 && (
                <SupportNavigation lessons={supportLessons} courseHref={courseHref} />
              )}
            </>
          ) : (
            <section className="space-y-5">
              <p className="text-muted-foreground">
                {programModule ? LEARNING_PROGRAM.title : download.courseTitle}
              </p>
              <h2 className="break-words font-serif text-2xl font-bold">{moduleTitle}</h2>
              <p>{download.description}</p>
              <p role="status" className="font-semibold text-green-700">
                ✓ Disponible sin conexión · {formatBytes(download.bytes)}
              </p>
              <SpeechButton
                preferDefaultVoice
                text={`${moduleTitle}. ${download.description ?? ""}`}
                label="Escuchar este módulo"
                compact
              />
              <nav aria-label="Lecciones" className="divide-y border-y">
                {download.lessons.map((item, index) => (
                  <a
                    key={item.id}
                    href={`${courseHref}/lecciones/${item.id}`}
                    className="flex min-h-16 items-center justify-between gap-3 py-3 font-semibold"
                  >
                    {index + 1}. {item.title}
                    <ChevronRight className="h-5 w-5 shrink-0" />
                  </a>
                ))}
              </nav>
              {supportLessons.length > 0 && (
                <SupportNavigation lessons={supportLessons} courseHref={courseHref} />
              )}
            </section>
          )}
        </>
      )}
      {hasLocalData && (
        <Button variant="outline" onClick={remove}>
          <Trash2 className="h-5 w-5" />
          Eliminar descarga
        </Button>
      )}
      {message && <p role="alert">{message}</p>}
      {online && (
        <Button variant="outline" onClick={() => location.reload()}>
          Volver con conexión
        </Button>
      )}
    </main>
  );
}

function OfflineLessonContent({
  lesson,
  download
}: {
  lesson: OfflineLesson;
  download: ModuleDownload;
}) {
  if (
    download.moduleId === MODULE4_ID &&
    MODULE4_SESSIONS.some((s) => s.id === lesson.id)
  )
    return (
      <Module4Content
        offline
        courseId={LEARNING_PROGRAM.id}
        lessonId={lesson.id}
        visuals={lesson.resources.flatMap((r) => {
          const key = module4ImageKey(r.externalUrl);
          return key && r.file ? [{ key, url: download.assets[r.file.id] }] : [];
        })}
      />
    );
  if (
    download.contentVersion === MODULE3_CONTENT_VERSION &&
    MODULE3_SESSIONS.slice(1).some((s) => s.id === lesson.id)
  ) {
    return (
      <Module3JourneyContent
        offline
        courseId={LEARNING_PROGRAM.id}
        lessonId={lesson.id}
        resources={lesson.resources.flatMap((r) =>
          r.file
            ? [
                {
                  id: r.id,
                  title: r.title,
                  mimeType: r.file.mimeType,
                  publicId: r.externalUrl,
                  url: download.assets[r.file.id],
                  downloadUrl: download.assets[r.file.id]
                }
              ]
            : []
        )}
      />
    );
  }
  if (lesson.id === MODULE3_SESSION1_ID) {
    const resourceView = (resource: OfflineResource): Session1Resource => ({
      id: resource.id,
      title: resource.title,
      description: resource.description,
      ...(resource.internalLessonId
        ? {
            internalHref: `/artesana/aprender/${LEARNING_PROGRAM.id}/lecciones/${resource.internalLessonId}`
          }
        : {}),
      ...(resource.file
        ? {
            fileId: resource.file.id,
            mimeType: resource.file.mimeType,
            size: resource.file.size,
            url: download.assets[resource.file.id],
            downloadUrl: download.assets[resource.file.id]
          }
        : {})
    });
    return (
      <Module3Session1Content
        offline
        title={lesson.title}
        content={lesson.content}
        resources={lesson.resources.map(resourceView)}
        relatedResources={(
          download.lessons.find((item) => item.id === MODULE3_SESSION2_ID)?.resources ??
          []
        )
          .filter((item) => item.file?.mimeType === "video/mp4")
          .map(resourceView)}
      />
    );
  }
  const videos = lesson.resources.filter(
    (resource) => resource.file?.mimeType === "video/mp4"
  );
  const materials = lesson.resources.filter(
    (resource) => resource.file?.mimeType !== "video/mp4"
  );
  const index = download.lessons.findIndex((item) => item.id === lesson.id);
  return (
    <div className="space-y-6">
      <p className="text-sm font-semibold text-[#b5245b]">
        {index >= 0
          ? `Sesión ${index + 1} de ${download.lessons.length}`
          : "Material de apoyo"}
      </p>
      {videos.length > 0 && (
        <section aria-label="Videos de esta sesión" className="space-y-3">
          <h2 className="font-serif text-xl font-bold">Videos de esta sesión</h2>
          {videos.map((resource, index) => (
            <details
              key={resource.id}
              open={index === 0}
              className="group border-y border-[#b5245b]/20"
            >
              <summary className="flex min-h-14 cursor-pointer list-none items-center gap-3 py-3 font-semibold [&::-webkit-details-marker]:hidden">
                <PlayCircle className="h-6 w-6 shrink-0 text-[#b5245b]" />
                <span className="min-w-0 flex-1 break-words">
                  {index + 1}. {resource.title}
                </span>
                <ChevronDown className="h-5 w-5 shrink-0 group-open:rotate-180" />
              </summary>
              <OfflineResourceView
                resource={resource}
                download={download}
                showHeading={false}
              />
            </details>
          ))}
        </section>
      )}
      {lesson.content && (
        <section className="space-y-3">
          <SpeechButton
            text={`${lesson.title}. ${lesson.content}`}
            label="Escuchar explicación"
            compact
            preferDefaultVoice
          />
          <details data-offline-lesson-text className="group border-y">
            <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 py-3 font-semibold [&::-webkit-details-marker]:hidden">
              Leer texto completo
              <ChevronDown className="h-5 w-5 shrink-0 group-open:rotate-180" />
            </summary>
            <p className="whitespace-pre-wrap break-words pb-5 text-base leading-7">
              {lesson.content}
            </p>
          </details>
        </section>
      )}
      {materials.length > 0 && (
        <section aria-label="Recursos y material de apoyo">
          <h2 className="font-serif text-xl font-bold">Recursos y material de apoyo</h2>
          {materials.map((resource) => (
            <OfflineResourceView
              key={resource.id}
              resource={resource}
              download={download}
            />
          ))}
        </section>
      )}
    </div>
  );
}

function SupportNavigation({
  lessons,
  courseHref
}: {
  lessons: NonNullable<ModuleDownload["supportLessons"]>;
  courseHref: string;
}) {
  return (
    <nav aria-label="Material de apoyo" className="space-y-3 border-t pt-4">
      <h2 className="font-serif text-xl font-bold">Material de apoyo</h2>
      {lessons.map((lesson) => (
        <a
          key={lesson.id}
          href={`${courseHref}/lecciones/${lesson.id}`}
          className="flex min-h-12 items-center justify-between gap-3 font-semibold"
        >
          {lesson.title}
          <ChevronRight className="h-5 w-5 shrink-0" />
        </a>
      ))}
    </nav>
  );
}

function OfflineResourceView({
  resource,
  download,
  showHeading = true
}: {
  resource: OfflineResource;
  download: ModuleDownload;
  showHeading?: boolean;
}) {
  const [message, setMessage] = useState("");
  const url = resource.file && download.assets[resource.file.id];
  function external() {
    if (!navigator.onLine) {
      setMessage(connectionRequired);
      return;
    }
    if (resource.externalUrl && /^https?:\/\//i.test(resource.externalUrl))
      window.open(resource.externalUrl, "_blank", "noopener,noreferrer");
    else setMessage(connectionRequired);
  }
  return (
    <section id={`recurso-${resource.id}`} className="scroll-mt-5 space-y-3 py-4">
      {showHeading && (
        <h3 className="break-words font-serif text-xl font-bold">{resource.title}</h3>
      )}
      {resource.description && (
        <p className="break-words text-sm text-muted-foreground">
          {resource.description}
        </p>
      )}
      <SpeechButton
        preferDefaultVoice
        text={`${resource.title}. ${resource.description ?? ""}`}
        label="Escuchar descripción"
        compact
      />
      {resource.internalLessonId ? (
        <a
          href={`/artesana/aprender/${download.courseId}/lecciones/${resource.internalLessonId}`}
          className="inline-flex min-h-12 items-center gap-2 font-semibold text-[#b5245b]"
        >
          Abrir lección de apoyo
          <ChevronRight className="h-5 w-5" />
        </a>
      ) : url && resource.file?.mimeType.startsWith("image/") ? (
        // Local service-worker URLs are already the original image, not Next image transforms.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt={resource.title}
          className="max-h-[600px] w-full object-contain"
        />
      ) : url && resource.file?.mimeType === "video/mp4" ? (
        <video
          aria-label={resource.title}
          controls
          playsInline
          preload="metadata"
          src={url}
          className="aspect-video w-full rounded-md bg-black"
        />
      ) : url && resource.file?.mimeType === "application/pdf" ? (
        <div className="space-y-3">
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-12 items-center gap-2 font-semibold text-[#b5245b]"
          >
            <ExternalLink className="h-5 w-5" />
            Abrir PDF
          </a>
          <iframe src={url} title={resource.title} className="h-[560px] w-full border" />
        </div>
      ) : resource.type === "EXTERNAL_LINK" || resource.type === "VIDEO_YOUTUBE" ? (
        <Button
          variant="outline"
          onClick={external}
          className="h-auto min-h-12 whitespace-normal"
        >
          <ExternalLink className="h-5 w-5 shrink-0" />
          {resource.type === "VIDEO_YOUTUBE" ? "Abrir video en internet" : "Abrir enlace"}
        </Button>
      ) : (
        <p>{unavailable}</p>
      )}
      {message && <p role="status">{message}</p>}
    </section>
  );
}
