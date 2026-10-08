"use client";

/* eslint-disable @next/next/no-html-link-for-pages -- The same links are intercepted by the existing offline shell. */
import { useRef, useState, useTransition } from "react";
import { ArrowLeft, ArrowRight, Check, Download, ExternalLink } from "lucide-react";
import { SpeechButton } from "@/shared/accessibility/speech-button";
import { completeLessonAction } from "@/shared/actions/artisan/complete-lesson";
import { LearningDisclosure } from "@/features/artisan/learning/learning-session";
import {
  LearningChecklist,
  learningLinkStyle
} from "@/features/artisan/learning/learning-content";
import {
  MODULE3_SESSIONS,
  MODULE3_QUESTIONS,
  MODULE3_PLATFORMS,
  MODULE3_START_SMALL,
  MODULE3_PAYMENT_RULE,
  MODULE3_PAYMENT_CHECKLIST,
  MODULE3_PAYMENT_ALERTS,
  MODULE3_DELIVERY_STEPS,
  MODULE3_OUTCOMES,
  MODULE3_CLOSING_MESSAGE,
  module3Progress
} from "@/shared/learning/module3-journey";

export type JourneyResource = {
  id: string;
  title: string;
  mimeType: string;
  url?: string;
  downloadUrl?: string;
  publicId?: string | null;
};

export function Module3JourneyContent({
  courseId,
  lessonId,
  resources,
  completedIds = [],
  offline = false
}: {
  courseId: string;
  lessonId: string;
  resources: JourneyResource[];
  completedIds?: string[];
  offline?: boolean;
}) {
  const session = MODULE3_SESSIONS.find((s) => s.id === lessonId)!;
  const [step, setStep] = useState(0);
  const [platform, setPlatform] = useState(0);
  const [payment, setPayment] = useState<"Yape" | "Plin" | null>(null);
  const [example, setExample] = useState(false);
  const [closing, setClosing] = useState(false);
  const [saved, setSaved] = useState(completedIds.includes(lessonId));
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();
  const focus = useRef<HTMLHeadingElement>(null);
  const root = useRef<HTMLDivElement>(null);
  const count = session.order === 2 ? 3 : session.order === 3 ? 3 : 4;
  const guide = resources.find((r) => r.mimeType === "application/pdf");
  const videos = resources.filter((r) => r.mimeType === "video/mp4");
  const selectedVideo =
    session.order === 2
      ? videos[example ? 1 : 0]
      : videos.find((r) => r.publicId?.includes(payment === "Yape" ? "Yape" : "Plin"));
  const title =
    session.order === 2
      ? [
          "Antes de elegir una tienda",
          "Conociendo las opciones",
          "Aprender a vender en Marketplace"
        ][step]
      : session.order === 3
        ? ["Elige cómo cobrar", "Cobro seguro", "Señales de alerta"][step]
        : MODULE3_DELIVERY_STEPS[step]?.title;
  const narration =
    session.order === 2
      ? step === 0
        ? MODULE3_QUESTIONS.join(". ") + MODULE3_START_SMALL
        : step === 1
          ? Object.values(MODULE3_PLATFORMS[platform]).slice(0, 4).join(". ")
          : "Prepara una pieza, revisa sus fotos y los datos antes de publicar. Puedes ver un ejemplo de Marketplace."
      : session.order === 3
        ? step === 0
          ? "Elige Yape o Plin para conocer su tutorial. No compartas contraseñas ni códigos de verificación."
          : step === 1
            ? MODULE3_PAYMENT_RULE + MODULE3_PAYMENT_CHECKLIST.join(". ")
            : MODULE3_PAYMENT_ALERTS.join(". ")
        : MODULE3_DELIVERY_STEPS[step]?.items.join(". ");
  const courseHref = `/artesana/aprender/${courseId}`;
  const href = (id: string) => `${courseHref}/lecciones/${id}`;
  const percentage = module3Progress([...completedIds, ...(saved ? [lessonId] : [])]);
  function change(next: number) {
    setStep(next);
    setMessage("");
    setExample(false);
    requestAnimationFrame(() => {
      focus.current?.focus({ preventScroll: true });
      root.current?.scrollIntoView({ block: "start", behavior: "instant" });
    });
  }
  function external(url: string) {
    if (offline || !navigator.onLine)
      setMessage("Este recurso necesita conexión a internet.");
    else window.open(url, "_blank", "noopener,noreferrer");
  }
  async function pdf(save: boolean) {
    if (!guide?.url) {
      setMessage(
        "Esta guía no está disponible en esta descarga. Actualiza el módulo cuando tengas conexión."
      );
      return;
    }
    if (!offline) {
      window.open(
        save ? (guide.downloadUrl ?? guide.url) : guide.url,
        "_blank",
        "noopener,noreferrer"
      );
      return;
    }
    const popup = save ? null : window.open("about:blank", "_blank");
    if (popup) popup.opener = null;
    try {
      const response = await fetch(guide.url);
      if (
        !response.ok ||
        response.headers.get("content-type")?.split(";")[0] !== "application/pdf"
      )
        throw new Error("PDF no disponible");
      const url = URL.createObjectURL(await response.blob());
      if (save) {
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = `${guide.title}.pdf`;
        root.current?.appendChild(anchor);
        anchor.click();
        anchor.remove();
        setTimeout(() => URL.revokeObjectURL(url), 60000);
      } else if (popup && !popup.closed) {
        popup.location.replace(url);
        const timer = setInterval(() => {
          if (popup.closed) {
            clearInterval(timer);
            URL.revokeObjectURL(url);
          }
        }, 1000);
      } else {
        URL.revokeObjectURL(url);
        setMessage("No se pudo abrir el visor. Puedes descargar el PDF.");
      }
    } catch {
      popup?.close();
      setMessage("Esta guía todavía no está disponible sin conexión.");
    }
  }
  function finish() {
    if (offline) {
      if (session.order === 4) setClosing(true);
      else window.history.pushState(null, "", href(MODULE3_SESSIONS[session.order].id));
      if (session.order !== 4) window.dispatchEvent(new PopStateEvent("popstate"));
      return;
    }
    startTransition(async () => {
      try {
        if (!saved) {
          const result = await completeLessonAction(courseId, lessonId);
          if (!result.ok) {
            setMessage(result.message);
            return;
          }
        }
        setSaved(true);
        if (session.order === 4) {
          setClosing(true);
          requestAnimationFrame(() => {
            focus.current?.focus();
            root.current?.scrollIntoView({ block: "start" });
          });
        } else window.location.assign(href(MODULE3_SESSIONS[session.order].id));
      } catch {
        setMessage(
          "No se pudo guardar tu avance. Revisa tu conexión e inténtalo otra vez."
        );
      }
    });
  }
  return (
    <div
      ref={root}
      data-module3-journey
      data-session-order={session.order}
      className="mx-auto w-full min-w-0 max-w-3xl scroll-mt-24 space-y-5 pb-8 text-base leading-7 text-[#344441] [&_button]:scroll-mb-28"
    >
      <header className="space-y-3 border-b border-[#ead2dc] pb-4">
        <a
          href={courseHref}
          className="inline-flex min-h-12 items-center gap-2 font-bold text-[#b5245b]"
        >
          <ArrowLeft className="h-5 w-5" />
          Aprender para crecer
        </a>
        <p className="text-sm font-bold text-[#24756f]">
          Módulo 3 · Sesión {session.order} de {MODULE3_SESSIONS.length}
        </p>
        <h1 className="font-serif text-2xl font-bold leading-tight text-[#202b29]">
          {session.title}
        </h1>
        <nav aria-label="Sesiones del Módulo 3" className="flex gap-3">
          {MODULE3_SESSIONS.map((s) => (
            <a
              key={s.id}
              href={href(s.id)}
              aria-current={s.id === lessonId ? "step" : undefined}
              aria-label={`Sesión ${s.order}: ${s.title}`}
              className="flex min-h-12 min-w-12 items-center justify-center rounded-md border border-[#dfc7d2] font-bold text-[#b5245b] aria-[current=step]:bg-[#b5245b] aria-[current=step]:text-white"
            >
              {s.order}
            </a>
          ))}
        </nav>
      </header>
      {closing ? (
        <section data-module3-closing className="space-y-4">
          <h2
            ref={focus}
            tabIndex={-1}
            className="font-serif text-2xl font-bold text-[#202b29]"
          >
            Al terminar el Módulo 3, yo puedo…
          </h2>
          <SpeechButton
            text={
              MODULE3_OUTCOMES.map((o) => `${o.title}. ${o.description}`).join(". ") +
              MODULE3_CLOSING_MESSAGE
            }
            label="Escuchar mis logros"
          />
          <ul className="space-y-4">
            {MODULE3_OUTCOMES.map((o) => (
              <li key={o.title} className="flex gap-3 border-b border-[#ead2dc] py-3">
                <Check className="mt-1 h-5 w-5 shrink-0 text-[#24756f]" />
                <div>
                  <strong>{o.title}</strong>
                  <p>{o.description}</p>
                </div>
              </li>
            ))}
          </ul>
          <p>{MODULE3_CLOSING_MESSAGE}</p>
          {offline ? (
            <p role="status">
              Práctica finalizada sin conexión. Para guardar tu avance en Warmi, vuelve
              con conexión y completa la sesión.
            </p>
          ) : (
            <p role="status">Módulo 3: {percentage}% completado.</p>
          )}
          {!offline && percentage < 100 && (
            <p>Completa las sesiones pendientes para llegar al 100%.</p>
          )}
          <a
            href={courseHref}
            className="flex min-h-12 items-center justify-center rounded-md bg-[#b5245b] px-4 py-3 font-bold text-white"
          >
            Finalizar Módulo 3
          </a>
        </section>
      ) : (
        <>
          <section key={step} data-m3-step className="space-y-4">
            <p role="status" className="font-bold text-[#24756f]">
              Paso {step + 1} de {count}
            </p>
            <h2
              ref={focus}
              tabIndex={-1}
              className="font-serif text-xl font-bold text-[#202b29] focus:outline-none"
            >
              {title}
            </h2>
            <SpeechButton text={`${title}. ${narration}`} label="Escuchar este paso" />
            {session.order === 2 && step === 0 && (
              <>
                <LearningChecklist items={MODULE3_QUESTIONS} />
                <p className="border-l-4 border-[#24756f] pl-4">{MODULE3_START_SMALL}</p>
              </>
            )}
            {session.order === 2 && step === 1 && (
              <>
                <div
                  role="group"
                  aria-label="Elige una plataforma"
                  className="grid gap-2 sm:grid-cols-2"
                >
                  {MODULE3_PLATFORMS.map((p, i) => (
                    <button
                      key={p.name}
                      aria-pressed={platform === i}
                      onClick={() => setPlatform(i)}
                      className={`min-h-12 rounded-md border px-4 py-3 text-left font-bold ${platform === i ? "border-[#24756f] bg-[#e2f2ef]" : "border-[#dfc7d2] bg-white"}`}
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
                <article
                  aria-live="polite"
                  className="space-y-3 border-l-4 border-[#24756f] pl-4"
                >
                  <h3 className="font-bold">{MODULE3_PLATFORMS[platform].name}</h3>
                  <p>{MODULE3_PLATFORMS[platform].description}</p>
                  <p>
                    <strong>Para qué sirve: </strong>
                    {MODULE3_PLATFORMS[platform].purpose}
                  </p>
                  <p>
                    <strong>Antes de elegir: </strong>
                    {MODULE3_PLATFORMS[platform].consideration}
                  </p>
                  <button
                    className={learningLinkStyle}
                    onClick={() =>
                      platform === 2
                        ? change(2)
                        : external(MODULE3_PLATFORMS[platform].url)
                    }
                  >
                    {MODULE3_PLATFORMS[platform].cta}
                    <ExternalLink className="h-4 w-4 shrink-0" />
                  </button>
                </article>
              </>
            )}
            {session.order === 2 && step === 2 && (
              <>
                <p>
                  Prepara una pieza, sus fotos y una descripción clara. Revisa los datos y
                  las reglas de Marketplace antes de publicar. Las opciones pueden variar
                  según tu cuenta.
                </p>
                <button
                  onClick={() => setExample(!example)}
                  aria-pressed={example}
                  className={learningLinkStyle}
                >
                  {example ? "Volver al video principal" : "Ver otro ejemplo"}
                </button>
              </>
            )}
            {session.order === 3 && step === 0 && (
              <>
                <p>
                  Elige una opción para conocer su tutorial. No compartas contraseñas ni
                  códigos de verificación.
                </p>
                <div className="flex gap-3" role="group" aria-label="Elige cómo cobrar">
                  {(["Yape", "Plin"] as const).map((p) => (
                    <button
                      key={p}
                      aria-pressed={payment === p}
                      onClick={() => setPayment(p)}
                      className={`min-h-12 flex-1 rounded-md border px-4 py-3 font-bold ${payment === p ? "border-[#24756f] bg-[#e2f2ef]" : "border-[#dfc7d2] bg-white"}`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
                <p className="text-sm">
                  Consulta requisitos y pasos vigentes en la aplicación oficial de Yape o
                  en tu entidad para Plin.
                </p>
              </>
            )}
            {((session.order === 2 && step === 2) ||
              (session.order === 3 && step === 0 && payment)) &&
              (selectedVideo?.url ? (
                <video
                  key={selectedVideo.id}
                  src={selectedVideo.url}
                  controls
                  playsInline
                  preload="metadata"
                  title={selectedVideo.title}
                  aria-label={selectedVideo.title}
                  className="aspect-video w-full rounded-md bg-black"
                />
              ) : (
                <p role="status">
                  Este video no está disponible en esta descarga. Actualiza el módulo
                  cuando tengas conexión.
                </p>
              ))}
            {session.order === 3 && step === 1 && (
              <>
                <p className="rounded-md border-l-4 border-[#24756f] bg-[#e2f2ef] p-4 text-xl font-bold leading-8 text-[#185750]">
                  {MODULE3_PAYMENT_RULE}
                </p>
                <h3 className="font-bold">Antes de entregar</h3>
                <ol className="space-y-3">
                  {MODULE3_PAYMENT_CHECKLIST.map((item, i) => (
                    <li key={item} className="flex gap-3">
                      <strong className="text-[#24756f]">{i + 1}.</strong>
                      {item}
                    </li>
                  ))}
                </ol>
              </>
            )}
            {session.order === 3 && step === 2 && (
              <>
                <LearningDisclosure label="¿Cómo reconocer un posible pago falso?">
                  <ul className="list-disc space-y-2 pl-5">
                    {MODULE3_PAYMENT_ALERTS.map((a) => (
                      <li key={a}>{a}</li>
                    ))}
                  </ul>
                  <p>
                    Si algo no coincide, me detengo, verifico en mi aplicación y pido
                    ayuda.
                  </p>
                </LearningDisclosure>
                <button
                  onClick={() => external("https://www.yape.com.pe/seguridad/estafas")}
                  className={learningLinkStyle}
                >
                  Revisar seguridad de Yape
                </button>
                <button
                  onClick={() => external("https://plin.pe/")}
                  className={learningLinkStyle}
                >
                  Conocer Plin
                </button>
              </>
            )}
            {session.order === 4 && (
              <>
                <p>Esta es una práctica. No envía pedidos ni mensajes reales.</p>
                <LearningChecklist items={MODULE3_DELIVERY_STEPS[step].items} />
                <p className="border-l-4 border-[#24756f] pl-4">
                  {MODULE3_DELIVERY_STEPS[step].example}
                </p>
              </>
            )}
          </section>
          <footer className="space-y-4 border-t border-[#ead2dc] py-4">
            <div className="flex flex-col gap-3 sm:flex-row">
              {step > 0 && (
                <button onClick={() => change(step - 1)} className={learningLinkStyle}>
                  <ArrowLeft className="h-4 w-4" />
                  Paso anterior
                </button>
              )}
              {step < count - 1 ? (
                <button
                  onClick={() => change(step + 1)}
                  className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-md bg-[#b5245b] px-4 py-3 font-bold text-white"
                >
                  Continuar
                  <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  disabled={pending}
                  onClick={finish}
                  className="min-h-12 flex-1 rounded-md bg-[#b5245b] px-4 py-3 font-bold text-white disabled:opacity-60"
                >
                  {pending
                    ? "Guardando tu avance…"
                    : session.order === 4
                      ? "Finalizar práctica"
                      : offline
                        ? "Continuar a la siguiente sesión"
                        : "Completar sesión y continuar"}
                </button>
              )}
            </div>
            {guide && (
              <LearningDisclosure label={guide.title}>
                <div className="flex flex-col gap-3">
                  <button onClick={() => void pdf(false)} className={learningLinkStyle}>
                    Abrir guía paso a paso
                  </button>
                  <button onClick={() => void pdf(true)} className={learningLinkStyle}>
                    <Download className="h-4 w-4" />
                    Descargar PDF
                  </button>
                </div>
              </LearningDisclosure>
            )}
          </footer>
        </>
      )}
      {message && <p role="alert">{message}</p>}
    </div>
  );
}
