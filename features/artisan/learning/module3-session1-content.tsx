"use client";

import { useId, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  List,
  ChevronDown,
  Download,
  ExternalLink,
  FileText,
  PlayCircle
} from "lucide-react";
import { SpeechButton } from "@/shared/accessibility/speech-button";
import {
  MODULE3_SESSION1_TOPICS,
  type Session1Resource
} from "@/shared/learning/module3-session1";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger
} from "@/shared/components/ui/sheet";
import { formatBytes } from "@/shared/offline/module3-storage";

export function Module3Session1Content({
  title,
  content,
  resources,
  relatedResources = [],
  offline = false,
  nextSessionHref
}: {
  title: string;
  content: string | null;
  resources: Session1Resource[];
  relatedResources?: Session1Resource[];
  offline?: boolean;
  nextSessionHref?: string;
}) {
  const [active, setActive] = useState(0);
  const [message, setMessage] = useState("");
  const id = useId();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const selectedInSheet = useRef(false);
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [materialsOpen, setMaterialsOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const all = [...resources, ...relatedResources];
  const supports = resources.filter((item) => item.internalHref);
  const linkStyle =
    "inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-[#b5245b] px-4 py-3 text-center text-base font-bold text-[#b5245b] hover:bg-[#fff0f5]";
  function focusTopic() {
    requestAnimationFrame(() => {
      headingRef.current?.focus({ preventScroll: true });
      headingRef.current?.scrollIntoView({ block: "start", behavior: "instant" });
    });
  }
  function choose(index: number) {
    setActive(index);
    setMessage("");
    if (selectorOpen) {
      selectedInSheet.current = true;
      setSelectorOpen(false);
    } else focusTopic();
  }
  function external(href: string) {
    if (!navigator.onLine) setMessage("Este recurso necesita conexión a internet.");
    else window.open(href, "_blank", "noopener,noreferrer");
  }
  async function offlineGuideUrl(url: string) {
    const response = await fetch(url);
    if (!response.ok) throw new Error("PDF no disponible");
    return URL.createObjectURL(
      new Blob([await response.arrayBuffer()], { type: "application/pdf" })
    );
  }
  function openOfflineGuide(url: string) {
    const popup = window.open("about:blank", "_blank");
    if (!popup) {
      setMessage("No se pudo abrir la guía. Puedes descargar el PDF.");
      return;
    }
    popup.opener = null;
    void offlineGuideUrl(url)
      .then((objectUrl) => {
        if (popup.closed) {
          URL.revokeObjectURL(objectUrl);
          return;
        }
        popup.location.replace(objectUrl);
        const cleanup = setInterval(() => {
          if (popup.closed) {
            clearInterval(cleanup);
            URL.revokeObjectURL(objectUrl);
          }
        }, 1000);
        setMessage("");
      })
      .catch(() => {
        popup.close();
        setMessage("Este contenido todavía no está disponible sin conexión.");
      });
  }
  async function saveOfflineGuide(url: string, filename: string) {
    try {
      const objectUrl = await offlineGuideUrl(url);
      if (!contentRef.current) {
        URL.revokeObjectURL(objectUrl);
        return;
      }
      const anchor = document.createElement("a");
      anchor.href = objectUrl;
      anchor.download = filename;
      contentRef.current.appendChild(anchor);
      anchor.click();
      anchor.remove();
      // Native downloads can bypass the service worker; export its cached response.
      setTimeout(() => URL.revokeObjectURL(objectUrl), 60000);
      setMessage("");
    } catch {
      setMessage("Este contenido todavía no está disponible sin conexión.");
    }
  }
  const index = active;
  const topic = MODULE3_SESSION1_TOPICS[index];
  const guide = resources.find(
    (item) => item.title === topic.guideTitle && item.mimeType === "application/pdf"
  );
  const videos = topic.videoIds
    .map((videoId) => all.find((item) => item.id === videoId))
    .filter((item): item is Session1Resource => Boolean(item));
  return (
    <div
      ref={contentRef}
      data-module3-session1
      className="mx-auto w-full min-w-0 max-w-3xl space-y-5 text-base leading-7 text-[#344441] [&_a]:scroll-mb-28 [&_button]:scroll-mb-28"
    >
      <section
        key={topic.key}
        data-session1-topic={topic.key}
        aria-labelledby={`${id}-topic`}
      >
        <div className="mb-4 space-y-2">
          <p role="status" className="text-sm font-bold text-[#24756f]">
            Tema {index + 1} de {MODULE3_SESSION1_TOPICS.length} · {topic.group}
          </p>
          <h2
            id={`${id}-topic`}
            ref={headingRef}
            tabIndex={-1}
            className="scroll-mt-16 rounded-sm font-serif text-2xl font-bold leading-tight text-[#202b29] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#b5245b]"
          >
            {topic.title}
          </h2>
        </div>
        <div data-session1-active className="space-y-4">
          <p>{topic.description}</p>
          <SpeechButton
            preferDefaultVoice
            text={`${topic.title}. ${topic.description}. ${topic.steps.join(". ")}`}
            label="Escuchar este tema"
            compact
          />
          <ol className="space-y-2">
            {topic.steps.map((step, stepIndex) => (
              <li key={step} className="flex items-start gap-3">
                <span className="shrink-0 font-bold text-[#24756f]">
                  {stepIndex + 1}.
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
          {videos.map(
            (video, videoIndex) =>
              video.url &&
              (videoIndex === 0 ? (
                <Session1Video key={video.id} video={video} />
              ) : (
                <details key={video.id} className="group border-y border-[#ead2dc]">
                  <summary className="flex min-h-12 cursor-pointer items-center justify-between gap-3 py-3 font-semibold text-[#24756f]">
                    Video de apoyo: {video.title}
                    <ChevronDown
                      aria-hidden="true"
                      className="h-5 w-5 shrink-0 group-open:rotate-180"
                    />
                  </summary>
                  <Session1Video video={video} />
                </details>
              ))
          )}
          <div className="space-y-3 border-t border-[#ead2dc] pt-4">
            <h3 className="flex items-center gap-2 font-bold text-[#202b29]">
              <FileText aria-hidden="true" className="h-5 w-5 shrink-0 text-[#24756f]" />
              Guía paso a paso
            </h3>
            {guide?.description && (
              <p className="text-sm">
                {guide.description}
                {guide.size ? ` · ${formatBytes(guide.size)}` : ""}
              </p>
            )}
            <div className="grid gap-3 min-[390px]:grid-cols-2">
              {guide?.url ? (
                <>
                  <a
                    href={guide.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(event) => {
                      if (offline) {
                        event.preventDefault();
                        openOfflineGuide(guide.url!);
                      }
                    }}
                    className={`${linkStyle} px-2 text-sm`}
                    aria-label={`Abrir guía PDF: ${topic.title}`}
                  >
                    <ExternalLink aria-hidden="true" className="h-5 w-5 shrink-0" />
                    Abrir guía
                  </a>
                  <a
                    href={guide.downloadUrl ?? guide.url}
                    download={`${topic.key}.pdf`}
                    onClick={(event) => {
                      if (offline) {
                        event.preventDefault();
                        void saveOfflineGuide(
                          guide.downloadUrl ?? guide.url!,
                          `${topic.key}.pdf`
                        );
                      }
                    }}
                    className={`${linkStyle} px-2 text-sm`}
                    aria-label={`Descargar guía PDF: ${topic.title}`}
                  >
                    <Download aria-hidden="true" className="h-5 w-5 shrink-0" />
                    Descargar PDF
                  </a>
                </>
              ) : (
                <button
                  type="button"
                  disabled={!offline}
                  className={`${linkStyle} disabled:cursor-default disabled:opacity-60`}
                  onClick={() =>
                    setMessage(
                      offline
                        ? "Este contenido todavía no está disponible sin conexión."
                        : "Esta guía todavía no está disponible."
                    )
                  }
                >
                  <Download aria-hidden="true" className="h-5 w-5 shrink-0" />
                  {offline ? "Descargar guía PDF" : "Guía PDF en preparación"}
                </button>
              )}
            </div>
          </div>
          {index === 4 || index === 5 ? (
            <button
              type="button"
              className={linkStyle}
              onClick={() =>
                external(
                  index === 4
                    ? "https://www.facebook.com/"
                    : "https://www.facebook.com/marketplace/"
                )
              }
            >
              <ExternalLink aria-hidden="true" className="h-5 w-5 shrink-0" />
              {index === 4 ? "Abrir Facebook" : "Abrir Marketplace"}
            </button>
          ) : null}

          <nav
            aria-label="Navegación de temas"
            className="grid gap-3 min-[390px]:grid-cols-2"
          >
            {index > 0 && (
              <button
                type="button"
                className={linkStyle}
                onClick={() => choose(index - 1)}
              >
                <ArrowLeft aria-hidden="true" className="h-5 w-5 shrink-0" />
                Anterior
              </button>
            )}
            {index < MODULE3_SESSION1_TOPICS.length - 1 ? (
              <button
                type="button"
                onClick={() => choose(index + 1)}
                className={`flex min-h-12 items-center justify-center gap-2 rounded-md bg-[#b5245b] px-4 py-3 text-center font-bold text-white hover:bg-[#941747] ${index === 0 ? "min-[390px]:col-span-2" : ""}`}
              >
                Siguiente tema
                <ArrowRight aria-hidden="true" className="h-5 w-5 shrink-0" />
              </button>
            ) : nextSessionHref ? (
              <a
                href={nextSessionHref}
                className="flex min-h-12 items-center justify-center gap-2 rounded-md bg-[#b5245b] px-4 py-3 text-center font-bold text-white hover:bg-[#941747]"
              >
                Continuar a siguiente sesión
                <ArrowRight aria-hidden="true" className="h-5 w-5 shrink-0" />
              </a>
            ) : null}
          </nav>
        </div>
      </section>
      <Sheet open={selectorOpen} onOpenChange={setSelectorOpen}>
        <SheetTrigger asChild>
          <button type="button" className={`${linkStyle} w-full`}>
            <List aria-hidden="true" className="h-5 w-5" />
            Ver todos los temas
          </button>
        </SheetTrigger>
        <SheetContent
          side="bottom"
          className="max-h-[85dvh] overflow-y-auto rounded-t-xl pb-[calc(1.5rem+env(safe-area-inset-bottom))] [&>button]:flex [&>button]:h-12 [&>button]:w-12 [&>button]:items-center [&>button]:justify-center"
          onCloseAutoFocus={(event) => {
            if (selectedInSheet.current) {
              event.preventDefault();
              selectedInSheet.current = false;
              focusTopic();
            }
          }}
        >
          <SheetHeader className="pr-12">
            <SheetTitle>Temas de la sesión 1</SheetTitle>
            <SheetDescription>Publica tu arte en redes</SheetDescription>
          </SheetHeader>
          <ol className="mx-auto mt-4 max-w-3xl divide-y divide-[#ead2dc]">
            {MODULE3_SESSION1_TOPICS.map((item, number) => (
              <li key={item.key}>
                <button
                  type="button"
                  aria-current={number === active ? "step" : undefined}
                  onClick={() => choose(number)}
                  className={`flex min-h-12 w-full items-center gap-3 rounded-md px-2 py-3 text-left font-semibold ${number === active ? "bg-[#fff0f5] text-[#b5245b]" : "text-[#344441]"}`}
                >
                  <span aria-hidden="true" className="w-5 shrink-0 text-center">
                    {number + 1}.
                  </span>
                  {item.title}
                </button>
              </li>
            ))}
          </ol>
        </SheetContent>
      </Sheet>
      {message && <p role="alert">{message}</p>}
      <details
        className="border-y border-[#ead2dc]"
        open={materialsOpen}
        onToggle={(event) => setMaterialsOpen(event.currentTarget.open)}
      >
        <summary className="flex min-h-12 cursor-pointer items-center justify-between gap-3 py-3 font-bold text-[#24756f]">
          Material adicional · Ver materiales
          <ChevronDown aria-hidden="true" className="h-5 w-5 shrink-0" />
        </summary>
        {materialsOpen && (
          <div className="space-y-4 pb-4">
            <p>
              Empieza con una pieza. Aprende a presentarla en WhatsApp y luego conoce
              otras formas de llegar a clientes.
            </p>
            <p className="text-sm text-[#24756f]">
              Puedes preparar tus fotos y textos sin internet. Para publicar necesitas
              conexión.
            </p>
            {content && (
              <details data-offline-lesson-text className="border-y border-[#ead2dc]">
                <summary className="min-h-12 cursor-pointer py-3 font-bold">
                  Leer texto completo
                </summary>
                <SpeechButton
                  preferDefaultVoice
                  text={`${title}. ${content}`}
                  label="Escuchar texto completo"
                  compact
                />
                <p className="whitespace-pre-wrap break-words py-4">{content}</p>
              </details>
            )}
            {supports.length > 0 && (
              <nav aria-label="Lecciones de apoyo" className="space-y-2">
                <h3 className="font-bold">Material de apoyo</h3>
                {supports.map((item) => (
                  <a
                    key={item.id}
                    href={item.internalHref}
                    className="block min-h-12 py-3 font-semibold text-[#b5245b]"
                  >
                    <span className="block">{item.title}</span>
                    <span className="text-sm font-normal">Abrir lección de apoyo</span>
                  </a>
                ))}
              </nav>
            )}
          </div>
        )}
      </details>
    </div>
  );
}

function Session1Video({ video }: { video: Session1Resource }) {
  return (
    <div className="space-y-2">
      <p className="flex items-start gap-2 font-semibold">
        <PlayCircle aria-hidden="true" className="mt-1 h-5 w-5 shrink-0 text-[#24756f]" />
        {video.title}
      </p>
      <video
        src={video.url}
        aria-label={video.title}
        controls
        playsInline
        preload="metadata"
        className="aspect-video w-full rounded-md bg-black"
      >
        <a href={video.url}>Abrir video</a>
      </video>
    </div>
  );
}
