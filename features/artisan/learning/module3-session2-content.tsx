"use client";
import { PdfGuideDialog } from "@/shared/components/media/pdf-guide-dialog";
import { useReadingPosition } from "@/shared/learning/use-reading-position";
import { useVisitedModule3Session } from "@/shared/learning/use-module3-resume";

/* eslint-disable @next/next/no-html-link-for-pages -- The offline shell handles these routes locally. */
import { useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  Download,
  ExternalLink,
  FileText,
  MousePointer2,
  BookOpen,
  Sprout
} from "lucide-react";
import { SpeechButton } from "@/shared/accessibility/speech-button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription
} from "@/shared/components/ui/sheet";
import {
  MODULE3_ID,
  MODULE3_PLATFORMS,
  MODULE3_SESSIONS,
  MODULE3_START_SMALL
} from "@/shared/learning/module3-journey";
import { learningLinkStyle } from "@/features/artisan/learning/learning-content";
import type { JourneyResource } from "@/features/artisan/learning/module3-journey-content";
import {
  IconSequence,
  LearningPhoto,
  ProductExample,
  module3AudioStyle,
  module3GuideStyle,
  Module3SessionHeader,
  platformIcons,
  platformTones,
  questionIcons,
  storefrontBenefits
} from "@/features/artisan/learning/module3-visuals";

export const SESSION2_OFFLINE_TOPICS = [
  "¿Qué son las tiendas virtuales?",
  "Antes de entrar a una tienda virtual, pregunto",
  "Otras tiendas donde puedo vender",
  "No tengo que estar en todas"
] as const;

const questions = [
  [
    "¿Me piden RUC o basta mi DNI?",
    "Revisa cómo participar y las condiciones vigentes en el portal oficial."
  ],
  [
    "¿Cobran comisión por cada venta?",
    "Revisa los costos y condiciones antes de publicar."
  ],
  [
    "¿Quién envía el producto y quién paga el envío?",
    "Confirma el costo de envío y quién lo paga."
  ],
  [
    "¿Cuándo y cómo me llega mi dinero?",
    "Consulta las condiciones de pago antes de elegir una plataforma."
  ]
] as const;
const route = ["Elijo una opción", "Aprendo cómo funciona", "Después puedo probar otra"];

export function Module3Session2Content({
  courseHref,
  resources,
  onGuide,
  guideViewerOpen,
  onCloseGuide,
  onExternal,
  onNextSession,
  offline = false,
  pending = false,
  saved = false
}: {
  courseHref: string;
  resources: JourneyResource[];
  onGuide: (save: boolean) => void;
  guideViewerOpen: boolean;
  onCloseGuide: () => void;
  onExternal: (url: string) => void;
  onNextSession: () => void;
  offline?: boolean;
  pending?: boolean;
  saved?: boolean;
}) {
  useVisitedModule3Session(MODULE3_SESSIONS[1].id);
  const [topic, setTopic] = useReadingPosition(
    `${courseHref}/session-2`,
    SESSION2_OFFLINE_TOPICS.length - 1
  );
  const [selectorOpen, setSelectorOpen] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const selector = useRef<HTMLButtonElement>(null);
  const selected = useRef(false);
  const guide = resources.find((resource) => resource.mimeType === "application/pdf");
  const videos = resources.filter(
    (resource) => resource.mimeType === "video/mp4" && resource.url
  );
  const summary =
    topic === 0
      ? "Una tienda virtual permite presentar tus piezas y contactar con compradores por internet. Cada plataforma tiene sus propias condiciones."
      : topic === 1
        ? questions.flat().join(". ")
        : topic === 2
          ? MODULE3_PLATFORMS.map(
              (item) =>
                `${item.name}. ${item.description}. ${item.purpose}. ${item.consideration}`
            ).join(". ")
          : `${MODULE3_START_SMALL} ${route.join(". ")}`;
  function focusTopic() {
    requestAnimationFrame(() => {
      heading.current?.focus({ preventScroll: true });
      heading.current?.scrollIntoView({ block: "start" });
    });
  }
  function choose(index: number) {
    setTopic(index);
    onCloseGuide();
    if (selectorOpen) {
      selected.current = true;
      setSelectorOpen(false);
    } else focusTopic();
  }
  return (
    <div
      data-module3-session2
      data-module3-session2-offline={offline || undefined}
      data-session2-topic={topic + 1}
      className="mx-auto max-w-3xl space-y-5 rounded-lg bg-[#fcf9f4] p-3 text-base leading-7 text-[#344441] sm:p-5"
    >
      <Module3SessionHeader
        offline={offline}
        href={`${courseHref}?module=${MODULE3_ID}`}
        session={2}
        title={MODULE3_SESSIONS[1].title}
        active={topic}
        total={4}
        mode="Temas"
        selectorRef={selector}
        open={selectorOpen}
        onOpen={() => setSelectorOpen(true)}
      />
      <section
        key={topic}
        className="space-y-4"
        aria-labelledby="session2-offline-heading"
      >
        <h2
          id="session2-offline-heading"
          ref={heading}
          tabIndex={-1}
          className="scroll-mt-20 font-serif text-2xl font-bold leading-tight text-[#1c1c19] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#800041]"
        >
          {SESSION2_OFFLINE_TOPICS[topic]}
        </h2>
        <SpeechButton
          className={module3AudioStyle}
          preferDefaultVoice
          text={`${SESSION2_OFFLINE_TOPICS[topic]}. ${summary}`}
          label="Escuchar este tema"
          compact
        />
        {topic === 0 && (
          <>
            <p>{summary}</p>
            <ProductExample mode="store" />
            <div className="grid gap-3 sm:grid-cols-2">
              {storefrontBenefits.map(({ title, detail, icon: Icon }) => (
                <article
                  key={title}
                  className="rounded-lg border border-[#ddbfc6]/50 bg-white p-4 shadow-sm"
                >
                  <Icon aria-hidden="true" className="mb-3 h-7 w-7 text-[#006b5a]" />
                  <h3 className="font-bold text-[#006b5a]">{title}</h3>
                  <p className="mt-2 text-sm">{detail}</p>
                </article>
              ))}
            </div>
          </>
        )}
        {topic === 1 && (
          <ol className="space-y-3">
            {questions.map(([question, explanation], index) => {
              const Icon = questionIcons[index];
              return (
                <li
                  key={question}
                  className="flex items-start gap-3 rounded-lg border border-[#ddbfc6]/50 bg-white p-4 shadow-sm"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#e2f2ec] font-bold text-[#006b5a]">
                    <Icon aria-hidden="true" className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-xs font-bold text-[#006b5a]">
                      Pregunta {index + 1}
                    </p>
                    <h3 className="font-bold">{question}</h3>
                    <p className="mt-2 text-sm text-[#574147]">{explanation}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
        {topic === 2 && (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              {MODULE3_PLATFORMS.map((item, index) => {
                const Icon = platformIcons[index];
                return (
                  <article
                    key={item.name}
                    className="space-y-3 rounded-lg border border-[#ddbfc6]/50 bg-white p-4 shadow-sm"
                  >
                    <div
                      className={`-mx-4 -mt-4 flex items-center gap-3 rounded-t-lg p-4 ${platformTones[index]}`}
                    >
                      <Icon aria-hidden="true" className="h-8 w-8 shrink-0" />
                      <h3 className="font-serif text-xl font-bold">{item.name}</h3>
                    </div>
                    <p>{item.description}</p>
                    <p className="text-sm">{item.purpose}</p>
                    <p className="text-sm text-[#574147]">{item.consideration}</p>
                    <button
                      className={`${learningLinkStyle} w-full whitespace-normal`}
                      onClick={() => onExternal(item.url)}
                    >
                      <ExternalLink aria-hidden="true" className="h-5 w-5 shrink-0" />
                      {item.cta}
                    </button>
                  </article>
                );
              })}
            </div>
            {videos.length > 0 && (
              <details className="group border-y border-[#ddbfc6]">
                <summary className="flex min-h-12 cursor-pointer items-center justify-between gap-3 py-3 font-bold text-[#006b5a]">
                  Videos de Marketplace
                  <ChevronDown aria-hidden="true" className="h-5 w-5 shrink-0" />
                </summary>
                <div className="space-y-4 pb-4">
                  {videos.map((video) => (
                    <div key={video.id} className="space-y-2">
                      <h3 className="font-bold">{video.title}</h3>
                      <video
                        src={video.url}
                        aria-label={video.title}
                        controls
                        playsInline
                        preload="metadata"
                        className="aspect-video w-full rounded-md bg-black"
                      />
                    </div>
                  ))}
                </div>
              </details>
            )}
          </>
        )}
        {topic === 3 && (
          <>
            <blockquote className="border-l-4 border-[#006b5a] bg-[#e2f2ec] p-5 font-serif text-xl leading-8">
              No tengo que estar en todas. Empiezo por una, aprendo cómo funciona y recién
              sumo otra.
            </blockquote>
            <IconSequence
              items={route.map((title, index) => ({
                title,
                icon: [MousePointer2, BookOpen, Sprout][index]
              }))}
            />
            <LearningPhoto
              kind="together"
              caption="Puedo aprender y practicar acompañada."
            />
            <p className="text-sm">
              Puedes preparar fotos y textos sin internet. Para publicar necesitas
              conexión.
            </p>
            <a href={`${courseHref}?module=${MODULE3_ID}`} className={learningLinkStyle}>
              Volver al módulo 3
            </a>
          </>
        )}
      </section>
      <section aria-label="Guía de la sesión 2" className={module3GuideStyle}>
        <h2 className="flex items-start gap-2 font-bold">
          <FileText aria-hidden="true" className="mt-1 h-5 w-5 shrink-0 text-[#006b5a]" />
          {guide?.title ?? "Guía para elegir dónde vender"}
        </h2>
        {guide?.url ? (
          <>
            <p data-mode-detail className="text-xs font-semibold text-[#006b5a]">
              {offline ? "PDF disponible sin conexión" : "Guía PDF"}
            </p>
            <div className="grid gap-3 min-[390px]:grid-cols-2">
              <button onClick={() => onGuide(false)} className={learningLinkStyle}>
                Abrir guía PDF
              </button>
              <button onClick={() => onGuide(true)} className={learningLinkStyle}>
                <Download aria-hidden="true" className="h-5 w-5 shrink-0" />
                Descargar PDF
              </button>
            </div>
            {guideViewerOpen && (
              <PdfGuideDialog
                src={guide.url}
                title={guide.title}
                onClose={onCloseGuide}
              />
            )}
          </>
        ) : (
          <p role="status">
            Esta guía no está disponible en esta descarga. Actualiza el módulo cuando
            tengas conexión.
          </p>
        )}
      </section>
      <nav
        aria-label="Navegación de temas"
        className="flex flex-wrap gap-3 border-t border-[#ddbfc6] pt-4"
      >
        {topic > 0 && (
          <button
            onClick={() => choose(topic - 1)}
            className={`${learningLinkStyle} flex-1`}
          >
            <ArrowLeft aria-hidden="true" className="h-5 w-5 shrink-0" />
            Anterior
          </button>
        )}
        {topic < 3 ? (
          <button
            onClick={() => choose(topic + 1)}
            className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-md bg-[#b5245b] px-4 py-3 font-bold text-white"
          >
            Siguiente
            <ArrowRight aria-hidden="true" className="h-5 w-5 shrink-0" />
          </button>
        ) : (
          <button
            onClick={onNextSession}
            data-mode-detail
            disabled={pending}
            className="min-h-12 flex-1 rounded-md bg-[#b5245b] px-4 py-3 font-bold text-white disabled:opacity-60"
          >
            {pending
              ? "Guardando tu avance…"
              : offline || saved
                ? "Continuar a la sesión 3"
                : "Completar sesión y continuar"}
          </button>
        )}
      </nav>
      <Sheet open={selectorOpen} onOpenChange={setSelectorOpen}>
        <SheetContent
          side="bottom"
          className="max-h-[85dvh] overflow-y-auto pb-[calc(1.5rem+env(safe-area-inset-bottom))] [&>button]:h-12 [&>button]:w-12"
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            if (selected.current) {
              selected.current = false;
              focusTopic();
            } else selector.current?.focus();
          }}
        >
          <SheetHeader className="pr-12">
            <SheetTitle>Temas de la sesión 2</SheetTitle>
            <SheetDescription>{MODULE3_SESSIONS[1].title}</SheetDescription>
          </SheetHeader>
          <ol className="mx-auto mt-4 max-w-3xl divide-y divide-[#ddbfc6]">
            {SESSION2_OFFLINE_TOPICS.map((title, index) => (
              <li key={title}>
                <button
                  onClick={() => choose(index)}
                  aria-current={topic === index ? "step" : undefined}
                  className="flex min-h-12 w-full items-start gap-3 rounded-md p-3 text-left font-bold text-[#344441] aria-[current=step]:bg-[#fff0f5] aria-[current=step]:text-[#800041]"
                >
                  <span aria-hidden="true">{index + 1}.</span>
                  {title}
                </button>
              </li>
            ))}
          </ol>
        </SheetContent>
      </Sheet>
    </div>
  );
}
