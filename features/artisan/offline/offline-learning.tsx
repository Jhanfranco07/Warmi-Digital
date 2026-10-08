"use client";
/* eslint-disable @next/next/no-html-link-for-pages -- Offline links use the existing local router. */
/* eslint-disable @next/next/no-img-element -- Original cached images must not depend on Next image transforms. */
import { useEffect, useState, type MouseEvent } from "react";
import {
  ArrowLeft,
  BookOpen,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Home,
  PlayCircle,
  Trash2
} from "lucide-react";
import { SpeechButton } from "@/shared/accessibility/speech-button";
import { Button } from "@/shared/components/ui/button";
import { Module3Session1Content } from "@/features/artisan/learning/module3-session1-content";
import { Module4Content } from "@/features/artisan/learning/module4-content";
import { LearningLessonHeader } from "@/features/artisan/learning/learning-lesson-header";
import {
  OfflineHome,
  DownloadedModuleCard
} from "@/features/artisan/offline/offline-home";
import {
  OFFLINE_HOME,
  OFFLINE_LOGO,
  isOfflineHomePath,
  offlineLocation,
  offlineProgress
} from "@/shared/offline/offline-presentation";
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
  const [downloads, setDownloads] = useState<ModuleDownload[]>([]);
  const [loading, setLoading] = useState(true);
  const [path, setPath] = useState(OFFLINE_HOME);
  const [entered, setEntered] = useState(false);
  const [message, setMessage] = useState("");
  const [online, setOnline] = useState(false);
  const [hasLocalData, setHasLocalData] = useState(false);
  useEffect(() => {
    const connection = () => setOnline(navigator.onLine);
    connection();
    window.addEventListener("online", connection);
    window.addEventListener("offline", connection);
    // Every cold start of the public fallback begins with Warmi context, even on a saved lesson URL.
    window.history.replaceState(
      { ...window.history.state, warmiOfflineView: "home" },
      ""
    );
    setPath(location.pathname + location.search);
    const history = () => {
      setPath(location.pathname + location.search);
      setEntered(historyStateIsLearning());
      setMessage("");
      window.scrollTo(0, 0);
    };
    function historyStateIsLearning() {
      return (
        window.history.state?.warmiOfflineView !== "home" &&
        !isOfflineHomePath(location.pathname)
      );
    }
    window.addEventListener("popstate", history);
    let cancelled = false;
    void verifiedDownloads()
      .then(async (saved) => {
        if (cancelled) return;
        setDownloads(saved);
        setHasLocalData(
          (await readDownloads()).length > 0 ||
            (await caches.keys()).some(isLearningCache)
        );
      })
      .catch(() => {
        if (!cancelled) setMessage(unavailable);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
      window.removeEventListener("online", connection);
      window.removeEventListener("offline", connection);
      window.removeEventListener("popstate", history);
    };
  }, []);
  const { pathname, download, courseId, lessonId } = offlineLocation(path, downloads);
  const home = !entered || isOfflineHomePath(pathname);
  const validCourse =
    !courseId ||
    Boolean(
      download && acceptsOfflineCourse(download.moduleId, download.courseId, courseId)
    );
  const supportLessons = download?.supportLessons ?? [];
  const lesson = [...(download?.lessons ?? []), ...supportLessons].find(
    (l) => l.id === lessonId
  );
  const lessonIndex = download?.lessons.findIndex((l) => l.id === lessonId) ?? -1;
  const nextLesson = lessonIndex >= 0 ? download?.lessons[lessonIndex + 1] : undefined;
  const programModule = download && moduleCapability(download.moduleId);
  const moduleTitle = programModule?.title ?? download?.title ?? "Mi aprendizaje";
  const courseHref = `/artesana/aprender/${programModule ? LEARNING_PROGRAM.id : download?.courseId}`;
  const ownNavigation =
    lesson &&
    (download?.moduleId === MODULE4_ID ||
      (download?.contentVersion === MODULE3_CONTENT_VERSION &&
        MODULE3_SESSIONS.slice(1).some((s) => s.id === lesson.id)));
  const additionalSupport = supportLessons.filter(
    (l) => !lesson?.resources.some((r) => r.internalLessonId === l.id)
  );
  const progress = download && offlineProgress(download);
  function navigate(event: MouseEvent<HTMLElement>) {
    const anchor = (event.target as Element).closest<HTMLAnchorElement>("a[href]");
    if (
      !anchor ||
      event.defaultPrevented ||
      anchor.target === "_blank" ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    )
      return;
    const url = new URL(anchor.href);
    if (
      url.origin !== location.origin ||
      (!url.pathname.startsWith("/artesana/aprender") && !isOfflineHomePath(url.pathname))
    )
      return;
    if (url.pathname === location.pathname && url.hash) return;
    event.preventDefault();
    const learning = !isOfflineHomePath(url.pathname);
    window.history.pushState(
      { warmiOfflineView: learning ? "learning" : "home" },
      "",
      url.href
    );
    setEntered(learning);
    setPath(url.pathname + url.search);
    setMessage("");
    window.scrollTo(0, 0);
  }
  async function remove() {
    try {
      await removeDownload(download?.moduleId);
      const remaining = await verifiedDownloads();
      setDownloads(remaining);
      setHasLocalData((await readDownloads()).length > 0);
      setMessage("");
    } catch {
      setMessage("No se pudo eliminar la descarga. Intenta nuevamente.");
    }
  }
  return (
    <div
      data-warmi-offline-learning
      onClick={navigate}
      className="min-h-screen bg-[#fffaf8] text-[#344441] [&_a]:scroll-mb-32 [&_button]:scroll-mb-32"
    >
      <header className="border-b border-[#ead2dc] bg-white px-4 py-2 sm:px-6">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2">
          <a
            href={OFFLINE_HOME}
            className="inline-flex min-h-12 items-center gap-2 font-serif font-bold text-[#b5245b]"
            aria-label="Inicio Warmi"
          >
            <img
              src={OFFLINE_LOGO}
              alt=""
              width={40}
              height={40}
              className="h-10 w-10 object-contain"
            />
            Warmi Digital
          </a>
          {!home && (
            <a
              href={OFFLINE_HOME}
              className="inline-flex min-h-12 items-center gap-2 text-sm font-bold text-[#b5245b]"
            >
              <Home aria-hidden="true" className="h-4 w-4" />
              Inicio Warmi
            </a>
          )}
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl space-y-6 px-4 pb-[calc(7rem+env(safe-area-inset-bottom))] pt-5 sm:px-6">
        {home ? (
          <OfflineHome downloads={downloads} loading={loading} />
        ) : loading ? (
          <p role="status">Cargando contenidos descargados...</p>
        ) : !download ||
          !validCourse ||
          (lessonId && !lesson) ||
          !pathname.startsWith("/artesana/aprender") ? (
          <p role="status">{unavailable}</p>
        ) : (
          <div className="mx-auto max-w-3xl space-y-6">
            {download.moduleId === LEARNING_PROGRAM.modules[2].id &&
              download.contentVersion !== MODULE3_CONTENT_VERSION && (
                <p role="status" className="rounded-md border border-[#dfc7d2] p-4">
                  Tienes una descarga anterior del Módulo 3. Puedes seguir usándola.
                  Conéctate y actualiza la descarga para acceder a las cuatro sesiones y
                  sus guías nuevas.
                </p>
              )}
            {lesson ? (
              <>
                {progress && (
                  <p className="text-sm text-[#24756f]">
                    {progress.completed} de {progress.total} sesiones completadas al
                    descargar
                  </p>
                )}
                {!ownNavigation && (
                  <LearningLessonHeader
                    courseHref={courseHref}
                    moduleTitle={moduleTitle}
                    title={lesson.title}
                  />
                )}
                <OfflineLessonContent
                  key={lesson.id}
                  lesson={lesson}
                  download={download}
                />
                {!ownNavigation && (
                  <>
                    {nextLesson && (
                      <a
                        href={`${courseHref}/lecciones/${nextLesson.id}`}
                        className="flex min-h-12 items-center justify-between gap-3 rounded-md bg-[#b5245b] px-4 py-3 font-bold text-white"
                      >
                        Siguiente sesión
                        <ChevronRight aria-hidden="true" className="h-5 w-5 shrink-0" />
                      </a>
                    )}
                    <details className="border-y border-[#ead2dc]">
                      <summary className="flex min-h-12 cursor-pointer items-center justify-between py-3 font-bold text-[#24756f]">
                        Todas las sesiones
                        <ChevronDown aria-hidden="true" className="h-5 w-5" />
                      </summary>
                      <SessionNavigation
                        download={download}
                        lessonId={lesson.id}
                        courseHref={courseHref}
                      />
                    </details>
                  </>
                )}
                {additionalSupport.length > 0 && (
                  <SupportNavigation
                    lessons={additionalSupport}
                    courseHref={courseHref}
                  />
                )}
              </>
            ) : (
              <section className="space-y-5">
                <a
                  href={OFFLINE_HOME}
                  className="inline-flex min-h-12 items-center gap-2 font-bold text-[#b5245b]"
                >
                  <ArrowLeft aria-hidden="true" className="h-5 w-5" />
                  Volver al inicio Warmi
                </a>
                <p className="text-sm font-bold text-[#24756f]">
                  {programModule ? LEARNING_PROGRAM.title : download.courseTitle}
                </p>
                <h1 className="font-serif text-3xl font-bold text-[#202b29]">
                  Mi aprendizaje
                </h1>
                {downloads.length > 1 && (
                  <nav
                    aria-label="Módulos descargados"
                    className="grid gap-3 sm:grid-cols-2"
                  >
                    {downloads.map((d) => (
                      <DownloadedModuleCard key={d.moduleId} download={d} />
                    ))}
                  </nav>
                )}
                <h2 className="font-serif text-2xl font-bold text-[#202b29]">
                  {moduleTitle}
                </h2>
                <p className="leading-7">{download.description}</p>
                <p className="text-sm font-bold text-[#24756f]">
                  Disponible sin conexión · {download.lessons.length} sesiones ·{" "}
                  {formatBytes(download.bytes)}
                </p>
                {progress && (
                  <p>
                    {progress.completed} de {progress.total} sesiones completadas al
                    descargar
                  </p>
                )}
                <SpeechButton
                  preferDefaultVoice
                  text={`${moduleTitle}. ${download.description ?? ""}`}
                  label="Escuchar este módulo"
                  compact
                />
                <SessionNavigation download={download} courseHref={courseHref} />
                {supportLessons.length > 0 && (
                  <SupportNavigation lessons={supportLessons} courseHref={courseHref} />
                )}
              </section>
            )}
          </div>
        )}
        {!home && hasLocalData && (
          <Button variant="outline" className="min-h-12" onClick={remove}>
            <Trash2 aria-hidden="true" className="h-5 w-5" />
            Eliminar descarga
          </Button>
        )}
        {message && <p role="alert">{message}</p>}
        {online && (
          <Button
            variant="outline"
            className="min-h-12"
            onClick={() => location.assign(home ? "/artesana/aprender" : location.href)}
          >
            Volver con conexión
          </Button>
        )}
      </main>
      <nav
        aria-label="Navegación Warmi sin conexión"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-[#ead2dc] bg-white pb-[env(safe-area-inset-bottom)]"
      >
        <div className="mx-auto grid max-w-3xl grid-cols-2 gap-2 px-4 py-2">
          <a
            href={OFFLINE_HOME}
            aria-current={home ? "page" : undefined}
            className="flex min-h-12 items-center justify-center gap-2 rounded-md font-bold text-[#24756f] aria-[current=page]:bg-[#f4e3eb] aria-[current=page]:text-[#b5245b]"
          >
            <Home aria-hidden="true" className="h-5 w-5" />
            Inicio Warmi
          </a>
          <a
            href="/artesana/aprender"
            aria-current={!home ? "page" : undefined}
            className="flex min-h-12 items-center justify-center gap-2 rounded-md font-bold text-[#24756f] aria-[current=page]:bg-[#f4e3eb] aria-[current=page]:text-[#b5245b]"
          >
            <BookOpen aria-hidden="true" className="h-5 w-5" />
            Mi aprendizaje
          </a>
        </div>
      </nav>
    </div>
  );
}
function SessionNavigation({
  download,
  lessonId,
  courseHref
}: {
  download: ModuleDownload;
  lessonId?: string;
  courseHref: string;
}) {
  return (
    <nav
      aria-label="Lecciones del módulo"
      className="divide-y divide-[#ead2dc] border-y border-[#ead2dc]"
    >
      {download.lessons.map((item, index) => (
        <a
          key={item.id}
          href={`${courseHref}/lecciones/${item.id}`}
          aria-current={item.id === lessonId ? "page" : undefined}
          className="flex min-h-16 items-center justify-between gap-3 py-4 font-bold text-[#b5245b]"
        >
          <span>
            {index + 1}. {item.title}
          </span>
          <ChevronRight aria-hidden="true" className="h-5 w-5 shrink-0" />
        </a>
      ))}
    </nav>
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
        completedIds={download.progress?.completedLessonIds}
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
        completedIds={download.progress?.completedLessonIds}
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
