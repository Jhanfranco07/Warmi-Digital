"use client";
import { PdfGuideDialog } from "@/shared/components/media/pdf-guide-dialog";

/* eslint-disable @next/next/no-html-link-for-pages -- The offline shell handles these routes locally. */
import { useId, useRef, useState, type RefObject } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Download,
  FileText,
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
import {
  IconSequence,
  LearningPhoto,
  LearningTip,
  module3AudioStyle,
  module3GuideStyle,
  Module3SessionHeader,
  paymentIcons
} from "@/features/artisan/learning/module3-visuals";

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
  "Aunque me apuren, tomo el tiempo necesario para abrir mi aplicación y revisar mis movimientos. No entrego solo por la presión del mensaje.",
  `Una imagen enviada por chat no demuestra que recibí dinero. ${MODULE3_PAYMENT_RULE}`,
  "Comparo el movimiento y el monto con la venta que acordé. Si algo no coincide, me detengo y pido ayuda.",
  "No entrego por una promesa de pago. Espero a comprobar que el dinero ingresó en mi propia aplicación.",
  "Antes de devolver cualquier dinero, verifico el ingreso y el monto en mi aplicación. Si tengo dudas, pido ayuda antes de actuar."
];

export function Module3Session3Content({
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
  onExternal,
  offline = false,
  pending = false,
  saved = false
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
  offline?: boolean;
  pending?: boolean;
  saved?: boolean;
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
      data-module3-session3
      data-module3-session3-offline={offline || undefined}
      data-session3-step={step + 1}
      className="mx-auto max-w-3xl space-y-5 rounded-lg bg-[#fcf9f4] p-3 text-base leading-7 text-[#344441] sm:p-5"
    >
      <Module3SessionHeader
        offline={offline}
        href={`${courseHref}?module=${MODULE3_ID}`}
        session={3}
        title={MODULE3_SESSIONS[2].title}
        active={step}
        total={3}
        mode="Pasos"
        selectorRef={selectorRef}
        open={selectorOpen}
        onOpen={() => setSelectorOpen(true)}
      />
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
          className={module3AudioStyle}
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
                  className={`flex min-h-24 flex-col items-center justify-center gap-2 rounded-lg border-2 p-4 text-lg font-bold shadow-sm aria-pressed:ring-2 aria-pressed:ring-[#006b5a] aria-pressed:ring-offset-2 ${method === "Yape" ? "border-[#7b3a85] bg-[#f4e8f4] text-[#692572]" : "border-[#007d84] bg-[#e0f5f3] text-[#006569]"}`}
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
                  className="space-y-3 overflow-hidden rounded-lg border border-[#ddbfc6] bg-white p-4 shadow-sm"
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
                  <p data-mode-detail className="text-xs font-semibold text-[#006b5a]">
                    {offline ? "Video disponible sin conexión" : "Video de apoyo"}
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
            <LearningTip strong title="Mi regla de seguridad">
              La captura no es el pago. El pago se confirma en mi aplicación.
            </LearningTip>
            <LearningPhoto
              kind="payment"
              caption="Reviso mi celular antes de entregar mi trabajo."
            />
            <IconSequence
              items={MODULE3_PAYMENT_CHECKLIST.map((title, index) => ({
                title,
                detail: verificationDetails[index],
                icon: paymentIcons[index]
              }))}
            />
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
            <LearningPhoto
              kind="support"
              caption="Si algo no me queda claro, lo reviso con mi promotora."
            />
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
      <section aria-label="Guía de cobros seguros" className={module3GuideStyle}>
        <h2 className="flex items-start gap-2 font-bold">
          <FileText aria-hidden="true" className="mt-1 h-5 w-5 shrink-0 text-[#006b5a]" />
          {guide?.title ?? "Guía de cobros seguros con Yape y Plin"}
        </h2>
        {guide?.url ? (
          <>
            <p data-mode-detail className="text-xs font-semibold text-[#006b5a]">
              {offline ? "PDF disponible sin conexión" : "Guía PDF"}
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
            data-mode-detail
            disabled={pending}
            className="min-h-12 flex-1 rounded-md bg-[#b5245b] px-4 py-3 font-bold text-white disabled:opacity-60"
          >
            {pending
              ? "Guardando tu avance…"
              : offline || saved
                ? "Continuar a la sesión 4"
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
