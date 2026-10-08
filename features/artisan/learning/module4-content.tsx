"use client";
/* eslint-disable @next/next/no-html-link-for-pages -- The existing offline shell intercepts these learning links. */
/* eslint-disable @next/next/no-img-element -- Original static images must use the same authenticated-cache URLs offline, without the image optimizer. */
import { useRef, useState, useTransition } from "react";
import { ArrowLeft, Check, ArrowRight } from "lucide-react";
import { SpeechButton } from "@/shared/accessibility/speech-button";
import { completeLessonAction } from "@/shared/actions/artisan/complete-lesson";
import { LearningDisclosure } from "@/features/artisan/learning/learning-session";
import { LearningChecklist } from "@/features/artisan/learning/learning-content";
import {
  MODULE4_SESSIONS,
  MODULE4_IMAGES,
  MODULE4_QUESTIONS,
  MODULE4_DESCRIPTION,
  MODULE4_EXPERIENCE,
  MODULE4_HERITAGE,
  MODULE4_HERITAGE_URL,
  MODULE4_SALE,
  MODULE4_OUTCOMES,
  module4Progress,
  type Module4ImageKey
} from "@/shared/learning/module4";
export type Module4Visual = { key: Module4ImageKey; url?: string };
function Photo({
  imageKey,
  visuals,
  className = "",
  caption
}: {
  imageKey: Module4ImageKey;
  visuals: Module4Visual[];
  className?: string;
  caption?: string;
}) {
  const resource = visuals.find((v) => v.key === imageKey);
  const alt = MODULE4_IMAGES.find((v) => v.key === imageKey)!.alt;
  return (
    <figure className={`min-w-0 ${className}`}>
      {resource?.url ? (
        <img
          src={resource.url}
          alt={alt}
          data-m4-image={imageKey}
          loading="lazy"
          className="h-auto w-full rounded-2xl object-cover"
        />
      ) : (
        <p role="status">
          Esta foto no está disponible en esta descarga. Actualiza el módulo cuando tengas
          conexión.
        </p>
      )}
      {caption && (
        <figcaption className="mt-2 text-sm leading-6 text-[#53615c]">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
export function Module4Content({
  courseId,
  lessonId,
  visuals,
  completedIds = [],
  offline = false
}: {
  courseId: string;
  lessonId: string;
  visuals: Module4Visual[];
  completedIds?: string[];
  offline?: boolean;
}) {
  const session = MODULE4_SESSIONS.find((s) => s.id === lessonId)!;
  const [step, setStep] = useState(0),
    [closing, setClosing] = useState(false),
    [saved, setSaved] = useState(completedIds.includes(lessonId)),
    [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();
  const focus = useRef<HTMLHeadingElement>(null);
  const count =
    session.order === 1 ? 3 : session.order === 2 ? 2 : session.order === 3 ? 2 : 4;
  const courseHref = `/artesana/aprender/${courseId}`;
  const lessonHref = (id: string) => `${courseHref}/lecciones/${id}`;
  const title =
    session.order === 1
      ? [
          "Mi historia también tiene valor",
          "Cómo describir mi producto",
          "Ahora cuento mi historia"
        ][step]
      : session.order === 2
        ? ["La experiencia de mi clienta", "Dos formas de presentar mi producto"][step]
        : session.order === 3
          ? ["Un saber reconocido", "Comunico el valor de mi trabajo"][step]
          : MODULE4_SALE[step].title;
  const narration =
    session.order === 1
      ? step === 0
        ? "Mi producto cuenta quién soy, de dónde vengo y el valor de mi cultura. Tejer es más que un trabajo: mantiene vivas nuestras tradiciones."
        : step === 1
          ? MODULE4_QUESTIONS.join(". ") + MODULE4_DESCRIPTION
          : "Pienso en una pieza que hice y cuento qué es, quién la hizo, dónde y cuánto tiempo me tomó."
      : session.order === 2
        ? step === 0
          ? MODULE4_EXPERIENCE.map((e) => `${e.title}. ${e.text}`).join(". ")
          : "Puedo presentar primero el valor cultural y después el producto, o mostrar el producto con su nombre, características y precio."
        : session.order === 3
          ? MODULE4_HERITAGE + "Mi trabajo representa historia, identidad y tradición."
          : `${MODULE4_SALE[step].prompt}. ${MODULE4_SALE[step].artisan}. Clienta: ${MODULE4_SALE[step].customer}`;
  function change(next: number) {
    setStep(next);
    setMessage("");
    requestAnimationFrame(() => {
      focus.current?.focus({ preventScroll: true });
      window.scrollTo({ top: 0, behavior: "instant" });
    });
  }
  function finish() {
    if (offline) {
      if (session.order === 4) {
        setClosing(true);
        window.scrollTo(0, 0);
      } else {
        window.history.pushState(
          null,
          "",
          lessonHref(MODULE4_SESSIONS[session.order].id)
        );
        window.dispatchEvent(new PopStateEvent("popstate"));
      }
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
          window.scrollTo(0, 0);
        } else window.location.assign(lessonHref(MODULE4_SESSIONS[session.order].id));
      } catch {
        setMessage(
          "No se pudo guardar tu avance. Revisa tu conexión e inténtalo otra vez."
        );
      }
    });
  }
  function official() {
    if (offline || !navigator.onLine)
      setMessage("Este recurso necesita conexión a internet.");
    else window.open(MODULE4_HERITAGE_URL, "_blank", "noopener,noreferrer");
  }
  const photo = (key: Module4ImageKey, className?: string, caption?: string) => (
    <Photo imageKey={key} visuals={visuals} className={className} caption={caption} />
  );
  return (
    <div
      data-module4-session
      data-session-order={session.order}
      className="mx-auto w-full min-w-0 max-w-3xl space-y-6 pb-8 text-base leading-7 text-[#344441] [&_a]:scroll-mb-28 [&_button]:scroll-mb-28"
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
          Módulo 4 · Sesión {session.order} de {MODULE4_SESSIONS.length}
        </p>
        <h1 className="font-serif text-2xl font-bold leading-tight text-[#202b29]">
          {session.title}
        </h1>
        <nav aria-label="Sesiones del Módulo 4" className="flex gap-3">
          {MODULE4_SESSIONS.map((s) => (
            <a
              key={s.id}
              href={lessonHref(s.id)}
              aria-label={`Sesión ${s.order}: ${s.title}`}
              aria-current={s.id === lessonId ? "step" : undefined}
              className="flex min-h-12 min-w-12 items-center justify-center rounded-md border border-[#dfc7d2] font-bold text-[#b5245b] aria-[current=step]:bg-[#b5245b] aria-[current=step]:text-white"
            >
              {s.order}
            </a>
          ))}
        </nav>
      </header>
      {closing ? (
        <section data-module4-closing className="space-y-5">
          <h2 className="font-serif text-2xl font-bold text-[#202b29]">
            Al terminar el Módulo 4, yo puedo…
          </h2>
          <SpeechButton text={MODULE4_OUTCOMES.join(". ")} label="Escuchar mis logros" />
          <ul className="space-y-3">
            {MODULE4_OUTCOMES.map((o) => (
              <li key={o} className="flex gap-3 border-b border-[#ead2dc] py-3">
                <Check className="mt-1 h-5 w-5 shrink-0 text-[#24756f]" />
                {o}
              </li>
            ))}
          </ul>
          {photo("entrega", "mx-auto max-w-xs")}
          <p className="text-xl font-bold text-[#185750]">
            ¡Confía en tu talento, tú puedes!
          </p>
          <p>
            Puedo volver a practicar cuando lo necesite. Mi historia, mi cultura y mi
            trabajo tienen valor.
          </p>
          {offline ? (
            <p role="status">
              Práctica finalizada sin conexión. Para guardar tu avance, vuelve con
              conexión y completa la sesión.
            </p>
          ) : (
            <p role="status">
              Módulo 4: {module4Progress([...completedIds, ...(saved ? [lessonId] : [])])}
              % completado.
            </p>
          )}
          <a
            href={courseHref}
            className="flex min-h-12 items-center justify-center rounded-md bg-[#b5245b] px-4 py-3 font-bold text-white"
          >
            Finalizar Módulo 4
          </a>
        </section>
      ) : (
        <>
          <section key={step} data-m4-step className="space-y-5">
            <p role="status" className="text-sm font-bold text-[#24756f]">
              Paso {step + 1} de {count}
            </p>
            <h2
              ref={focus}
              tabIndex={-1}
              className="scroll-mt-24 font-serif text-xl font-bold text-[#202b29] focus:outline-none"
            >
              {title}
            </h2>
            <SpeechButton text={`${title}. ${narration}`} label="Escuchar este paso" />
            {session.order === 1 && step === 0 && (
              <>
                <div className="mx-auto grid max-w-md grid-cols-[1.15fr_1fr] items-start gap-3 sm:grid-cols-[1fr_1fr]">
                  <div>{photo("artesana")}</div>
                  <div className="space-y-3">
                    {photo("paisaje")}
                    {photo("manos")}
                  </div>
                </div>
                <p className="text-xl font-bold leading-8 text-[#185750]">
                  Mi producto cuenta quién soy, de dónde vengo y el valor de mi cultura.
                </p>
                <blockquote className="border-l-4 border-[#b5245b] pl-4">
                  “Tejer es más que un trabajo, es mantener vivas nuestras tradiciones y
                  compartirlas con el mundo.”
                  <cite className="block text-sm not-italic">
                    Maribel Quispe · testimonio del material Warmi
                  </cite>
                </blockquote>
              </>
            )}
            {session.order === 1 && step === 1 && (
              <>
                <ol className="space-y-3">
                  {MODULE4_QUESTIONS.map((q, i) => (
                    <li key={q} className="rounded-xl bg-white p-4">
                      <strong className="mr-2 text-[#24756f]">{i + 1}.</strong>
                      {q}
                    </li>
                  ))}
                </ol>
                <div className="grid items-start gap-4 sm:grid-cols-[160px_1fr]">
                  {photo("tejidos", "mx-auto max-w-xs")}
                  <div className="space-y-2">
                    <h3 className="font-bold">Ejemplo de descripción</h3>
                    <p>{MODULE4_DESCRIPTION}</p>
                    <p className="text-sm">
                      Ejemplo del material; no es una oferta de venta actual.
                    </p>
                  </div>
                </div>
              </>
            )}
            {session.order === 1 && step === 2 && (
              <>
                {photo("munecas", "mx-auto max-w-[180px]")}
                <p>
                  Elijo una pieza que hice y preparo una historia breve con las tres
                  preguntas.
                </p>
                <LearningChecklist
                  items={[
                    "Digo qué es y de qué está hecha.",
                    "Cuento quién la hizo y de dónde viene.",
                    "Explico el tiempo que dediqué."
                  ]}
                />
                <LearningDisclosure label="Una ayuda para empezar">
                  <p>
                    “Esta pieza es… La hice en… Utilicé… y me tomó…” Completo la frase con
                    los datos de mi propio trabajo.
                  </p>
                </LearningDisclosure>
              </>
            )}
            {session.order === 2 && step === 0 && (
              <>
                <p>
                  Mi clienta no compra solo el tejido. También recuerda cómo la atiendo y
                  cómo recibe su paquete.
                </p>
                <ol className="space-y-3">
                  {MODULE4_EXPERIENCE.map((e, i) => (
                    <li key={e.title} className="flex gap-3 rounded-xl bg-white p-4">
                      <span className="font-bold text-[#24756f]">{i + 1}</span>
                      <div>
                        <strong>{e.title}</strong>
                        <p>{e.text}</p>
                      </div>
                    </li>
                  ))}
                </ol>
                <p className="rounded-xl border-l-4 border-[#b5245b] bg-[#fbedf2] p-4">
                  <strong>Lo que más molesta:</strong> que no respondan y esperar sin
                  saber cuándo llega.
                </p>
              </>
            )}
            {session.order === 2 && step === 1 && (
              <>
                <p>
                  Puedo elegir qué quiero destacar. Ambas formas necesitan una foto clara
                  y una explicación útil.
                </p>
                <div className="grid gap-5 md:grid-cols-2">
                  <article className="space-y-3 rounded-2xl border border-[#ead2dc] bg-white p-4">
                    <h3 className="font-bold text-[#185750]">
                      Destaco el valor cultural
                    </h3>
                    {photo("artesana", "mx-auto max-w-[220px]")}
                    <p>
                      Primero cuento quién lo hizo, de dónde viene y qué tradición
                      representa. Después muestro la pieza.
                    </p>
                    <blockquote className="border-l-4 border-[#24756f] pl-3">
                      “Mis tejidos mantienen viva la tradición de mi comunidad.”
                    </blockquote>
                    <p className="text-sm">Ejemplo de presentación cultural.</p>
                  </article>
                  <article className="space-y-3 rounded-2xl border border-[#ead2dc] bg-white p-4">
                    <h3 className="font-bold text-[#185750]">Destaco el producto</h3>
                    {photo("bolso", "mx-auto max-w-[220px]")}
                    <p className="font-bold">Bolso artesanal · S/ 80</p>
                    <p>Foto del producto, nombre, características y precio claros.</p>
                    <p className="text-sm">Producto y precio de ejemplo del material.</p>
                  </article>
                </div>
              </>
            )}
            {session.order === 3 && step === 0 && (
              <>
                {photo(
                  "qallwa",
                  undefined,
                  "Tejido en qallwa de San Miguel, Cajamarca · material fuente"
                )}
                <p className="text-xl font-bold text-[#185750]">
                  Una tradición reconocida como Patrimonio Cultural de la Nación
                </p>
                <p>{MODULE4_HERITAGE}</p>
                <LearningDisclosure label="Ver el documento de apoyo">
                  {photo("resolucion", "mx-auto max-w-xs")}
                  <p className="mt-3 text-sm">
                    Resolución Viceministerial N.º 211-2019-VMPCIC-MC, 15 de noviembre de
                    2019. La copia del material es un apoyo visual; el texto oficial está
                    en el Ministerio de Cultura.
                  </p>
                </LearningDisclosure>
                <button
                  onClick={official}
                  className="min-h-12 rounded-md border border-[#b5245b] px-4 py-3 font-bold text-[#b5245b]"
                >
                  Consultar el reconocimiento oficial
                </button>
              </>
            )}
            {session.order === 3 && step === 1 && (
              <>
                <p className="text-xl font-bold leading-8 text-[#185750]">
                  Mi artesanía lleva historia, identidad y tradición.
                </p>
                <p>
                  El valor también está en los conocimientos que recibí, la técnica que
                  practico y el tiempo que dedico a cada pieza.
                </p>
                <LearningChecklist
                  items={[
                    "Cuento de dónde viene mi trabajo.",
                    "Explico la técnica y los materiales.",
                    "Hablo del tiempo y cuidado que dediqué."
                  ]}
                />
                <LearningDisclosure label="Cómo puedo contarlo">
                  <p>
                    “Este tejido está hecho con una técnica que aprendimos en nuestra
                    comunidad. Cada detalle lleva tiempo, cuidado y conocimientos que
                    compartimos entre generaciones.”
                  </p>
                </LearningDisclosure>
              </>
            )}
            {session.order === 4 && (
              <>
                <p className="text-sm">
                  Práctica con un ejemplo. No envía mensajes, pedidos ni pagos reales.
                </p>
                {step === 0 && photo("bolso", "mx-auto max-w-[180px]")}
                <p className="text-lg font-bold text-[#185750]">
                  {MODULE4_SALE[step].prompt}
                </p>
                <div className="space-y-3">
                  <div className="rounded-2xl rounded-bl-none bg-[#e2f2ef] p-4">
                    <p className="mb-1 text-sm font-bold text-[#185750]">Artesana</p>
                    <p>{MODULE4_SALE[step].artisan}</p>
                  </div>
                  <div className="ml-5 rounded-2xl rounded-br-none border border-[#ead2dc] bg-white p-4">
                    <p className="mb-1 text-sm font-bold text-[#b5245b]">Clienta</p>
                    <p>{MODULE4_SALE[step].customer}</p>
                  </div>
                </div>
                {step === 2 && (
                  <p className="text-sm">
                    Los precios y condiciones son de práctica. En una venta real confirmo
                    el monto, el envío y el plazo antes de cobrar.
                  </p>
                )}
                {step === 3 && (
                  <p className="border-l-4 border-[#24756f] pl-4">
                    Una captura no confirma el pago. Lo verifico dentro de mi propia
                    aplicación.
                  </p>
                )}
                <LearningChecklist
                  items={["Practico este paso con los datos de mi propio producto."]}
                />
              </>
            )}
          </section>
          <footer className="space-y-3 border-t border-[#ead2dc] pt-5">
            <div className="flex flex-col gap-3 sm:flex-row">
              {step > 0 && (
                <button
                  onClick={() => change(step - 1)}
                  className="flex min-h-12 items-center justify-center gap-2 rounded-md border border-[#b5245b] px-4 py-3 font-bold text-[#b5245b]"
                >
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
          </footer>
        </>
      )}
      {message && <p role="alert">{message}</p>}
    </div>
  );
}
