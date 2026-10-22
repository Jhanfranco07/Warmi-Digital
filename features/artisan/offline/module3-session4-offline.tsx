"use client";

/* eslint-disable @next/next/no-html-link-for-pages -- The offline shell intercepts these local routes. */
import { useRef, useState, type RefObject } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Download,
  FileText,
  MessageCircle,
  Truck,
  Wallet
} from "lucide-react";
import { SpeechButton } from "@/shared/accessibility/speech-button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from "@/shared/components/ui/sheet";
import { LearningChecklist } from "@/features/artisan/learning/learning-checklist";
import { learningLinkStyle } from "@/features/artisan/learning/learning-content";
import {
  MODULE3_DELIVERY_STEPS,
  MODULE3_ID,
  MODULE3_OUTCOMES,
  MODULE3_SESSIONS
} from "@/shared/learning/module3-journey";
import type { JourneyResource } from "@/features/artisan/learning/module3-journey-content";
import {
  deliverySequences,
  IconSequence,
  LearningPhoto,
  LearningTip,
  offlineAudioStyle,
  offlineGuideStyle,
  OfflineSessionHeader,
  PracticeChat,
  ReceiptExample
} from "@/features/artisan/offline/module3-visuals";

const introductions = [
  "Dónde lo recibe, qué día llega y quién paga el envío. Lo escribo en el chat para que quede.",
  "Bolsa limpia, el tejido doblado y protegido de la lluvia. Adentro pongo un papel con mi nombre y mi WhatsApp.",
  "Le tomo foto al paquete y al recibo de la agencia. Si algo se pierde, esa foto es mi respaldo.",
  "Le paso el número de seguimiento y le escribo cuándo debe llegar. Le pregunto si le gustó."
];
const agreementQuestions = [
  "¿Dónde recibirá el producto?",
  "¿Cuándo debe llegar?",
  "¿Cuánto cuesta el envío?",
  "¿Quién pagará el envío?",
  "¿El acuerdo quedó escrito en el chat?"
];
const reminders = [
  "Dejar el acuerdo por escrito evita confusiones.",
  "Antes de cerrar el paquete reviso que la pieza esté limpia, protegida y correctamente identificada.",
  "Uso el comprobante como respaldo del envío.",
  "Una clienta contenta vuelve a comprar y me recomienda. Entregar bien vale tanto como tejer bien."
];
const outcomeDescriptions = [
  "Subo la foto de mi producto con su precio, y sé que se ve durante 24 horas.",
  "Tengo mi cuenta y publiqué al menos un producto con foto, descripción y precio.",
  "Uso Yape o Plin, y verifico el pago en mi propia aplicación antes de entregar.",
  "Acuerdo la entrega, empaco, guardo el comprobante y aviso a mi clienta."
];
const outcomeIcons = [MessageCircle, MessageCircle, Wallet, Truck];
const solidarity =
  "Si algo de esto todavía no me sale, lo practico con mi promotora antes de seguir. Ninguna avanza sola.";

export function Module3Session4Offline({
  courseHref,
  step,
  closing,
  guide,
  guideViewerOpen,
  headingRef,
  onChange,
  onGuide,
  onCloseGuide,
  onShowOutcomes,
  onReturnToSession
}: {
  courseHref: string;
  step: number;
  closing: boolean;
  guide?: JourneyResource;
  guideViewerOpen: boolean;
  headingRef: RefObject<HTMLHeadingElement | null>;
  onChange: (step: number) => void;
  onGuide: (save: boolean) => void;
  onCloseGuide: () => void;
  onShowOutcomes: () => void;
  onReturnToSession: () => void;
}) {
  const [selectorOpen, setSelectorOpen] = useState(false);
  const selector = useRef<HTMLButtonElement>(null);
  const selected = useRef(false);
  const moduleHref = `${courseHref}?module=${MODULE3_ID}`;
  const current = MODULE3_DELIVERY_STEPS[step];
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
      data-module3-session4-offline
      data-session4-step={closing ? undefined : step + 1}
      className="mx-auto max-w-3xl space-y-5 rounded-lg bg-[#fcf9f4] p-3 text-base leading-7 text-[#344441] sm:p-5"
    >
      <OfflineSessionHeader
        href={moduleHref}
        session={4}
        title={MODULE3_SESSIONS[3].title}
        active={step}
        total={4}
        mode="Pasos"
        selectorRef={selector}
        open={selectorOpen}
        onOpen={() => setSelectorOpen(true)}
        closing={closing}
      />
      {closing ? (
        <section data-module3-closing className="space-y-5">
          <div className="space-y-3 border-b border-[#ddbfc6] pb-5">
            <p className="text-sm font-bold text-[#006b5a]">
              Logros del Módulo 3: Herramientas digitales para vender
            </p>
            <h1
              ref={headingRef}
              tabIndex={-1}
              className="scroll-mt-20 font-serif text-3xl font-bold leading-tight text-[#1c1c19]"
            >
              ¡Mira todo lo que aprendiste!
            </h1>
            <p>
              Repasa lo aprendido y conversa con tu facilitadora sobre lo que todavía
              necesitas practicar.
            </p>
          </div>
          <SpeechButton
            className={offlineAudioStyle}
            preferDefaultVoice
            text={`${MODULE3_OUTCOMES.map((item, index) => `${item.title}. ${outcomeDescriptions[index]}`).join(". ")}. ${solidarity}`}
            label="Escuchar mis logros"
            compact
          />
          <p className="text-sm text-[#574147]">
            Estos aprendizajes se revisan con tu facilitadora. No son actividades
            verificadas automáticamente.
          </p>
          <ul className="grid gap-4 sm:grid-cols-2">
            {MODULE3_OUTCOMES.map((item, index) => {
              const Icon = outcomeIcons[index];
              return (
                <li
                  key={item.title}
                  className="space-y-3 rounded-lg border border-[#ddbfc6]/50 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${index % 2 ? "bg-[#ffdcbc] text-[#800041]" : "bg-[#e2f2ec] text-[#006b5a]"}`}
                    >
                      <Icon aria-hidden="true" className="h-6 w-6" />
                    </span>
                    <p className="text-xs font-bold uppercase text-[#006b5a]">
                      Aprendizaje {index + 1}
                    </p>
                  </div>
                  <h2 className="font-serif text-xl font-bold text-[#1c1c19]">
                    {item.title}
                  </h2>
                  <p>{outcomeDescriptions[index]}</p>
                </li>
              );
            })}
          </ul>
          <LearningPhoto
            kind="together"
            caption="Comparto lo que aprendí y practico con mi comunidad."
          />
          <blockquote className="border-l-4 border-[#006b5a] bg-[#e2f2ec] p-5 font-serif text-xl leading-8">
            {solidarity}
          </blockquote>
          <p role="status" className="text-sm text-[#574147]">
            Para guardar tu avance, vuelve con conexión y completa la sesión.
          </p>
          <nav
            aria-label="Navegación de logros"
            className="flex flex-col gap-3 border-t border-[#ddbfc6] pt-4"
          >
            <button onClick={onReturnToSession} className={learningLinkStyle}>
              <ArrowLeft aria-hidden="true" className="h-5 w-5 shrink-0" />
              Volver a la sesión 4
            </button>
            <a href={moduleHref} className={learningLinkStyle}>
              Volver al módulo 3
            </a>
            <a
              href="/artesana/aprender"
              className="flex min-h-12 items-center justify-center rounded-md bg-[#b5245b] px-4 py-3 text-center font-bold text-white"
            >
              Regresar a Mi aprendizaje
            </a>
          </nav>
        </section>
      ) : (
        <>
          <section key={step} data-m3-step className="space-y-4">
            <h2
              ref={headingRef}
              tabIndex={-1}
              className="scroll-mt-20 font-serif text-2xl font-bold leading-tight text-[#1c1c19]"
            >
              {current.title}
            </h2>
            <p className="text-sm font-semibold text-[#006b5a]">
              Esta es una práctica. No envía pedidos ni mensajes reales.
            </p>
            <SpeechButton
              className={offlineAudioStyle}
              preferDefaultVoice
              text={`${current.title}. ${introductions[step]}. ${current.items.join(". ")}. ${reminders[step]}`}
              label="Escuchar este paso"
              compact
            />
            <blockquote className="border-l-4 border-[#006b5a] bg-[#e2f2ec] p-4">
              {introductions[step]}
            </blockquote>
            {step === 1 && (
              <LearningPhoto
                kind="delivery"
                caption="Preparo mi pieza y el empaque antes de cerrar la bolsa."
              />
            )}
            <IconSequence items={deliverySequences[step]} />
            <div className="space-y-3 rounded-lg border border-[#ddbfc6]/50 bg-white p-4 shadow-sm">
              <LearningChecklist
                items={step === 0 ? agreementQuestions : current.items}
                title={
                  step === 0
                    ? "Antes de enviar, acuerdo estos detalles"
                    : step === 1
                      ? "Antes de enviar, reviso mi paquete"
                      : step === 2
                        ? "Guardo mi respaldo"
                        : "Acompaño la entrega"
                }
              />
              <p className="text-xs leading-5 text-[#574147]">
                Estas casillas son temporales y se reinician al cambiar de paso o cerrar
                la pantalla. Marcarlas no guarda el avance de la sesión.
              </p>
            </div>
            {step === 0 || step === 3 ? (
              <PracticeChat message={current.example} />
            ) : step === 2 ? (
              <>
                <ReceiptExample />
                <p className="text-sm">{current.example}</p>
              </>
            ) : (
              <p className="text-sm">{current.example}</p>
            )}
            <LearningTip
              strong={step === 3}
              title={
                step === 3 ? "Mi trabajo también es cuidar la entrega" : "Para recordar"
              }
            >
              {reminders[step]}
            </LearningTip>
          </section>
          <section aria-label="Guía de entrega" className={offlineGuideStyle}>
            <h2 className="flex items-start gap-2 font-bold">
              <FileText
                aria-hidden="true"
                className="mt-1 h-5 w-5 shrink-0 text-[#006b5a]"
              />
              Guía de entrega de una venta en línea
            </h2>
            {guide?.url ? (
              <>
                <p className="text-xs font-semibold text-[#006b5a]">
                  PDF disponible sin conexión
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <button onClick={() => onGuide(false)} className={learningLinkStyle}>
                    Ver guía de entrega
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
            {step < 3 ? (
              <button
                onClick={() => choose(step + 1)}
                className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-md bg-[#b5245b] px-4 py-3 font-bold text-white"
              >
                Siguiente
                <ArrowRight aria-hidden="true" className="h-5 w-5 shrink-0" />
              </button>
            ) : (
              <button
                onClick={onShowOutcomes}
                className="min-h-12 flex-1 rounded-md bg-[#b5245b] px-4 py-3 font-bold text-white"
              >
                Ver logros del Módulo 3
              </button>
            )}
          </nav>
        </>
      )}
      <Sheet open={selectorOpen} onOpenChange={setSelectorOpen}>
        <SheetContent
          side="bottom"
          className="max-h-[85dvh] overflow-y-auto pb-[calc(1.5rem+env(safe-area-inset-bottom))] [&>button]:h-12 [&>button]:w-12"
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            if (selected.current) {
              selected.current = false;
              headingRef.current?.focus({ preventScroll: true });
            } else selector.current?.focus();
          }}
        >
          <SheetHeader className="pr-12">
            <SheetTitle>Pasos de la sesión 4</SheetTitle>
            <SheetDescription>{MODULE3_SESSIONS[3].title}</SheetDescription>
          </SheetHeader>
          <ol className="mx-auto mt-4 max-w-3xl divide-y divide-[#ddbfc6]">
            {MODULE3_DELIVERY_STEPS.map((item, index) => (
              <li key={item.title}>
                <button
                  onClick={() => choose(index)}
                  aria-current={step === index ? "step" : undefined}
                  className="flex min-h-12 w-full items-start gap-3 rounded-md p-3 text-left font-bold text-[#344441] aria-[current=step]:bg-[#fff0f5] aria-[current=step]:text-[#800041]"
                >
                  <span aria-hidden="true">{index + 1}.</span>
                  {item.title}
                </button>
              </li>
            ))}
          </ol>
        </SheetContent>
      </Sheet>
    </div>
  );
}
