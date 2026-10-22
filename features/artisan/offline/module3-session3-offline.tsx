"use client";

/* eslint-disable @next/next/no-html-link-for-pages -- The offline shell handles these routes locally. */
import { useId, useRef, useState, type RefObject } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Download,
  FileText,
  List,
  ShieldCheck,
  TriangleAlert
} from "lucide-react";
import { SpeechButton } from "@/shared/accessibility/speech-button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from "@/shared/components/ui/sheet";
import { learningLinkStyle } from "@/features/artisan/learning/learning-content";
import {
  MODULE3_ID,
  MODULE3_SESSIONS,
  MODULE3_PAYMENT_RULE,
  MODULE3_PAYMENT_CHECKLIST,
  MODULE3_PAYMENT_ALERTS
} from "@/shared/learning/module3-journey";
import type { JourneyResource } from "@/features/artisan/learning/module3-journey-content";

export const SESSION3_OFFLINE_STEPS = [
  "Elige cómo cobrar",
  "Cobro seguro",
  "Señales de alerta"
] as const;
const verificationDetails = [
  "Abro Yape o Plin desde mi celular.",
  "Busco el pago en la lista de movimientos.",
  "Compruebo que el dinero ingresó y corresponde a la venta.",
  "Solo después de verificar el dinero, entrego la artesanía."
];
const alertDetails = [
  "Si algo no coincide, me detengo, verifico en mi aplicación y pido ayuda.",
  MODULE3_PAYMENT_RULE,
  `${MODULE3_PAYMENT_CHECKLIST[1]} ${MODULE3_PAYMENT_CHECKLIST[2]}`,
  MODULE3_PAYMENT_RULE,
  "Si algo no coincide, me detengo, verifico en mi aplicación y pido ayuda."
];

export function Module3Session3Offline({
  courseHref,
  step,
  payment,
  selectedVideo,
  guide,
  guideViewerOpen,
  headingRef,
  narration,
  onPayment,
  onChange,
  onGuide,
  onCloseGuide,
  onNextSession,
  onExternal
}: {
  courseHref: string;
  step: number;
  payment: "Yape" | "Plin" | null;
  selectedVideo?: JourneyResource;
  guide?: JourneyResource;
  guideViewerOpen: boolean;
  headingRef: RefObject<HTMLHeadingElement | null>;
  narration: string;
  onPayment: (method: "Yape" | "Plin") => void;
  onChange: (step: number) => void;
  onGuide: (save: boolean) => void;
  onCloseGuide: () => void;
  onNextSession: () => void;
  onExternal: (url: string) => void;
}) {
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [openAlerts, setOpenAlerts] = useState<number[]>([]);
  const selectorRef = useRef<HTMLButtonElement>(null);
  const selected = useRef(false);
  const id = useId();
  function choose(index: number) {
    onCloseGuide();
    onChange(index);
    if (selectorOpen) {
      selected.current = true;
      setSelectorOpen(false);
    }
  }
  return (
    <div
      data-module3-session3-offline
      data-session3-step={step + 1}
      className="mx-auto max-w-3xl space-y-5 rounded-lg bg-[#fcf9f4] p-3 text-base leading-7 text-[#344441] sm:p-5"
    >
      <header className="space-y-3 border-b border-[#ddbfc6] pb-4">
        <p className="flex items-center gap-2 text-xs font-bold text-[#006b5a]">
          <CheckCircle2 aria-hidden="true" className="h-4 w-4" />
          Disponible sin conexión
        </p>
        <a
          href={`${courseHref}?module=${MODULE3_ID}`}
          className="inline-flex min-h-12 items-center gap-2 font-bold text-[#800041]"
        >
          <ArrowLeft aria-hidden="true" className="h-5 w-5" />
          Volver al módulo 3
        </a>
        <p className="text-sm font-bold text-[#006b5a]">Módulo 3 · Sesión 3</p>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="font-serif text-xl font-bold text-[#1c1c19]">
            {MODULE3_SESSIONS[2].title}
          </h1>
          <button
            ref={selectorRef}
            onClick={() => setSelectorOpen(true)}
            aria-haspopup="dialog"
            aria-expanded={selectorOpen}
            className="inline-flex min-h-12 items-center gap-2 rounded-md bg-[#f0ede9] px-4 font-bold text-[#800041]"
          >
            <List aria-hidden="true" className="h-5 w-5" />
            Pasos
            <ChevronDown aria-hidden="true" className="h-4 w-4" />
          </button>
        </div>
        <p role="status" className="text-xs font-bold text-[#006b5a]">
          Paso {step + 1} de 3
        </p>
        <div aria-hidden="true" className="grid grid-cols-3 gap-1.5">
          {SESSION3_OFFLINE_STEPS.map((title, index) => (
            <span
              key={title}
              className={`h-2 rounded-full ${step === index ? "bg-[#006b5a]" : "bg-[#e5e2dd]"}`}
            />
          ))}
        </div>
      </header>
      <section key={step} aria-labelledby={`${id}-heading`} className="space-y-4">
        <h2
          id={`${id}-heading`}
          ref={headingRef}
          tabIndex={-1}
          className="scroll-mt-20 font-serif text-2xl font-bold leading-tight text-[#1c1c19] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#800041]"
        >
          {SESSION3_OFFLINE_STEPS[step]}
        </h2>
        <SpeechButton
          preferDefaultVoice
          text={`${SESSION3_OFFLINE_STEPS[step]}. ${narration}`}
          label="Escuchar este paso"
          compact
        />
        {step === 0 && (
          <>
            <p>
              Elige una opción para conocer su tutorial. No compartas contraseñas ni
              códigos de verificación.
            </p>
            <div
              role="group"
              aria-label="Elige cómo cobrar"
              className="grid grid-cols-2 gap-3"
            >
              {(["Yape", "Plin"] as const).map((method) => (
                <button
                  key={method}
                  aria-pressed={payment === method}
                  onClick={() => onPayment(method)}
                  className="flex min-h-20 items-center justify-center gap-2 rounded-lg border border-[#ddbfc6] bg-white p-4 text-lg font-bold text-[#800041] aria-pressed:border-[#006b5a] aria-pressed:bg-[#e2f2ec] aria-pressed:text-[#006b5a]"
                >
                  {payment === method && (
                    <CheckCircle2 aria-hidden="true" className="h-5 w-5 shrink-0" />
                  )}
                  {method}
                </button>
              ))}
            </div>
            {payment ? (
              selectedVideo?.url ? (
                <section
                  aria-label={`Video de ${payment}`}
                  className="space-y-3 rounded-lg border border-[#ddbfc6]/50 bg-white p-4 shadow-sm"
                >
                  <h3 className="font-bold">{selectedVideo.title}</h3>
                  <video
                    key={selectedVideo.id}
                    src={selectedVideo.url}
                    aria-label={selectedVideo.title}
                    controls
                    playsInline
                    preload="metadata"
                    className="aspect-video w-full rounded-md bg-black"
                  />
                  <p className="text-xs font-semibold text-[#006b5a]">
                    Video disponible sin conexión
                  </p>
                </section>
              ) : (
                <p role="status">
                  Este video no está disponible en esta descarga. Actualiza el módulo
                  cuando tengas conexión.
                </p>
              )
            ) : (
              <p className="text-sm text-[#574147]">
                Selecciona Yape o Plin para ver su video.
              </p>
            )}
            <p className="text-sm">
              Consulta requisitos y pasos vigentes en la aplicación oficial de Yape o en
              tu entidad para Plin.
            </p>
            <aside className="flex items-start gap-3 border-l-4 border-[#006b5a] bg-[#e2f2ec] p-4 font-semibold">
              <ShieldCheck
                aria-hidden="true"
                className="mt-1 h-6 w-6 shrink-0 text-[#006b5a]"
              />
              Antes de entregar tu artesanía, comprueba siempre que recibiste el pago.
            </aside>
          </>
        )}
        {step === 1 && (
          <>
            <blockquote className="border-l-4 border-[#006b5a] bg-[#e2f2ec] p-5 font-serif text-xl font-bold leading-8 text-[#005143]">
              La captura no es el pago. El pago se confirma en mi aplicación.
            </blockquote>
            <ol className="ml-4 space-y-3 border-l-2 border-[#9dd9c8] pl-5">
              {MODULE3_PAYMENT_CHECKLIST.map((item, index) => (
                <li
                  key={item}
                  className="relative rounded-lg border border-[#ddbfc6]/50 bg-white p-4"
                >
                  <span className="absolute -left-10 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-[#006b5a] text-sm font-bold text-white">
                    {index + 1}
                  </span>
                  <h3 className="font-bold">{item}</h3>
                  <p className="mt-2 text-sm text-[#574147]">
                    {verificationDetails[index]}
                  </p>
                </li>
              ))}
            </ol>
            <p className="border-y border-[#9dd9c8] py-4 font-bold text-[#006b5a]">
              Primero el dinero en mi cuenta. Después entrego el producto.
            </p>
          </>
        )}
        {step === 2 && (
          <>
            <p>¿Cómo reconocer un posible pago falso?</p>
            <div className="space-y-3">
              {MODULE3_PAYMENT_ALERTS.map((alert, index) => {
                const open = openAlerts.includes(index);
                return (
                  <section
                    key={alert}
                    className="overflow-hidden rounded-lg border border-[#ddbfc6] bg-white"
                  >
                    <h3>
                      <button
                        onClick={() =>
                          setOpenAlerts((current) =>
                            current.includes(index)
                              ? current.filter((item) => item !== index)
                              : [...current, index]
                          )
                        }
                        aria-expanded={open}
                        aria-controls={`${id}-alert-${index}`}
                        className="flex min-h-14 w-full items-start gap-3 p-4 text-left font-bold text-[#800041]"
                      >
                        <TriangleAlert
                          aria-hidden="true"
                          className="mt-1 h-5 w-5 shrink-0"
                        />
                        <span className="flex-1">{alert}</span>
                        <ChevronDown
                          aria-hidden="true"
                          className={`mt-1 h-5 w-5 shrink-0 ${open ? "rotate-180" : ""}`}
                        />
                      </button>
                    </h3>
                    <div
                      id={`${id}-alert-${index}`}
                      hidden={!open}
                      className="border-t border-[#ead2dc] px-4 py-3 text-sm"
                    >
                      {alertDetails[index]}
                    </div>
                  </section>
                );
              })}
            </div>
            <aside className="border-l-4 border-[#006b5a] bg-[#e2f2ec] p-4 font-semibold">
              Si tengo dudas, no entrego el producto hasta verificar el dinero o pedir
              ayuda.
            </aside>
            <details className="border-y border-[#ddbfc6]">
              <summary className="min-h-12 cursor-pointer py-3 font-bold text-[#006b5a]">
                Consultar información oficial
              </summary>
              <div className="flex flex-wrap gap-3 pb-4">
                <button
                  onClick={() => onExternal("https://www.yape.com.pe/seguridad/estafas")}
                  className={learningLinkStyle}
                >
                  Revisar seguridad de Yape
                </button>
                <button
                  onClick={() => onExternal("https://plin.pe/")}
                  className={learningLinkStyle}
                >
                  Conocer Plin
                </button>
              </div>
            </details>
          </>
        )}
      </section>
      <section
        aria-label="Guía de cobros seguros"
        className="space-y-3 rounded-lg border border-[#ddbfc6]/50 bg-white p-4 shadow-sm"
      >
        <h2 className="flex items-start gap-2 font-bold">
          <FileText aria-hidden="true" className="mt-1 h-5 w-5 shrink-0 text-[#006b5a]" />
          {guide?.title ?? "Guía de cobros seguros con Yape y Plin"}
        </h2>
        {guide?.url ? (
          <>
            <p className="text-xs font-semibold text-[#006b5a]">
              PDF disponible sin conexión
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <button onClick={() => onGuide(false)} className={learningLinkStyle}>
                Ver guía de cobros seguros
              </button>
              <button onClick={() => onGuide(true)} className={learningLinkStyle}>
                <Download aria-hidden="true" className="h-5 w-5 shrink-0" />
                Descargar PDF
              </button>
            </div>
            {guideViewerOpen && (
              <section aria-label="Guía abierta" className="space-y-3">
                <button onClick={onCloseGuide} className={learningLinkStyle}>
                  Volver a la sesión
                </button>
                <iframe
                  src={guide.url}
                  title={guide.title}
                  className="h-[70dvh] min-h-[420px] w-full border"
                />
              </section>
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
        aria-label="Navegación de pasos"
        className="flex flex-wrap gap-3 border-t border-[#ddbfc6] pt-4"
      >
        {step > 0 && (
          <button
            onClick={() => choose(step - 1)}
            className={`${learningLinkStyle} flex-1`}
          >
            <ArrowLeft aria-hidden="true" className="h-5 w-5 shrink-0" />
            Anterior
          </button>
        )}
        {step < 2 ? (
          <button
            onClick={() => choose(step + 1)}
            className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-md bg-[#b5245b] px-4 py-3 font-bold text-white"
          >
            Siguiente
            <ArrowRight aria-hidden="true" className="h-5 w-5 shrink-0" />
          </button>
        ) : (
          <button
            onClick={onNextSession}
            className="min-h-12 flex-1 rounded-md bg-[#b5245b] px-4 py-3 font-bold text-white"
          >
            Continuar a la sesión 4
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
              headingRef.current?.focus({ preventScroll: true });
            } else selectorRef.current?.focus();
          }}
        >
          <SheetHeader className="pr-12">
            <SheetTitle>Pasos de la sesión 3</SheetTitle>
            <SheetDescription>{MODULE3_SESSIONS[2].title}</SheetDescription>
          </SheetHeader>
          <ol className="mx-auto mt-4 max-w-3xl divide-y divide-[#ddbfc6]">
            {SESSION3_OFFLINE_STEPS.map((title, index) => (
              <li key={title}>
                <button
                  onClick={() => choose(index)}
                  aria-current={step === index ? "step" : undefined}
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
