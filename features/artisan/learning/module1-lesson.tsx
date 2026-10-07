import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  ExternalLink,
  FileText,
  GraduationCap,
  Store,
  Trophy
} from "lucide-react";
import { ArtisanShell } from "@/features/artisan/artisan-panel";
import { SpeechButton } from "@/shared/accessibility/speech-button";
import {
  MODULE1_CHECKLIST,
  MODULE1_INSTITUTIONS,
  MODULE1_OUTCOMES,
  MODULE1_SESSIONS,
  MODULE1_SUPPORT_VIDEOS,
  MODULE1_VIDEOS,
  module1SessionText
} from "@/shared/learning/module1";
import { cn } from "@/shared/lib/utils";
import type { LearningService } from "@/shared/services/learning.service";
import { Module1Video } from "@/features/artisan/learning/module1-video";
import { Module1Completion } from "@/features/artisan/learning/module1-completion";

type Lesson = Awaited<ReturnType<LearningService["getLessonDetail"]>>["lesson"];
const linkStyle =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-[#b5245b] px-4 py-3 text-center text-base font-bold text-[#b5245b] hover:bg-[#fff0f5] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#b5245b]";

export function Module1Lesson({
  courseId,
  lesson,
  completed
}: {
  courseId: string;
  lesson: Lesson;
  completed: boolean;
}) {
  const session = MODULE1_SESSIONS.find((item) => item.id === lesson.id);
  if (!session) throw new Error("La sesión del Módulo 1 no está configurada.");
  const order = session.order;
  const courseHref = `/artesana/aprender/${courseId}` as Route;
  const sessionHref = (id: string) =>
    `/artesana/aprender/${courseId}/lecciones/${id}` as Route;
  const video = (key: string) => {
    const mapping = MODULE1_VIDEOS.find((item) => item.key === key)!;
    const resource = lesson.lessonFiles.find(
      (item) => item.file?.publicId === mapping.publicId
    );
    return resource?.file ? (
      <Module1Video
        sourceType="CLOUDINARY"
        url={resource.file.url}
        title={mapping.title}
        action={mapping.action}
      />
    ) : (
      <p role="status" className="mt-3 text-sm">
        Este video todavía no está disponible.
      </p>
    );
  };
  const tutorial = (key: keyof typeof MODULE1_SUPPORT_VIDEOS) => (
    <Module1Video {...MODULE1_SUPPORT_VIDEOS[key]} />
  );
  return (
    <ArtisanShell>
      <div className="mx-auto w-full min-w-0 max-w-3xl space-y-8 pb-6 text-base leading-7 text-[#344441]">
        <header className="space-y-4 border-b border-[#ead2dc] pb-6">
          <Link
            href={courseHref}
            className="inline-flex min-h-12 items-center gap-2 font-bold text-[#b5245b]"
          >
            <ArrowLeft className="h-5 w-5" />
            Aprender para crecer
          </Link>
          <div className="flex flex-wrap justify-between gap-2 text-sm font-bold text-[#b5245b]">
            <p>Módulo 1</p>
            <p>Sesión {order} de 4</p>
          </div>
          <nav aria-label="Sesiones del Módulo 1" className="grid grid-cols-4 gap-3">
            {MODULE1_SESSIONS.map((item) => (
              <Link
                key={item.id}
                href={sessionHref(item.id)}
                aria-label={`Sesión ${item.order}: ${item.title}`}
                aria-current={item.id === lesson.id ? "step" : undefined}
                className={cn(
                  "flex min-h-12 items-center justify-center rounded-md border text-lg font-bold",
                  item.id === lesson.id
                    ? "border-[#b5245b] bg-[#b5245b] text-white"
                    : "border-[#dfc7d2] bg-white text-[#b5245b] hover:bg-[#fff0f5]"
                )}
              >
                {item.order}
              </Link>
            ))}
          </nav>
          <h1 className="font-display text-2xl font-bold leading-tight text-[#202b29] sm:text-3xl">
            {session.title}
          </h1>
          {order === 4 && <p className="font-bold text-[#24756f]">Zoom y Google Meet</p>}
          <p>{session.intro}</p>
          <SpeechButton text={module1SessionText(order)} label="Escuchar esta sesión" />
        </header>

        {order === 1 && (
          <>
            <Step number={1} title="Crear mi cuenta de Gmail">
              <p>{session.intro}</p>
              {video("M1-S1-01")}
            </Step>
            <Step number={2} title="Enviar un documento adjunto">
              <p>
                Ahora aprenderás a enviar un documento, una fotografía o un PDF desde tu
                correo.
              </p>
              {video("M1-S1-02")}
            </Step>
            <details className="group border-y border-[#ead2dc] py-4">
              <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 font-bold text-[#24756f] [&::-webkit-details-marker]:hidden">
                Material adicional
                <ChevronDown className="h-5 w-5 shrink-0 group-open:rotate-180" />
              </summary>
              <div className="space-y-5 pt-3">
                <p>¿Quieres ver otra forma de hacerlo?</p>
                {video("M1-S1-03")}
                {video("M1-S1-04")}
                {lesson.lessonFiles
                  .filter((item) => item.type === "PDF" || item.type === "DOCUMENT")
                  .map(
                    (item) =>
                      item.file && (
                        <a
                          key={item.id}
                          href={`/api/files/${item.file.id}/preview`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={linkStyle}
                        >
                          <FileText className="h-5 w-5 shrink-0" />
                          Abrir guía de Gmail en PDF
                        </a>
                      )
                  )}
                {lesson.lessonFiles
                  .filter((item) => item.provider === "warmi" && item.originalUrl)
                  .map((item) => (
                    <Link
                      key={item.id}
                      href={item.originalUrl as Route}
                      className={linkStyle}
                    >
                      {item.title}
                    </Link>
                  ))}
              </div>
            </details>
          </>
        )}

        {order === 2 && (
          <>
            <section aria-labelledby="instituciones">
              <h2
                id="instituciones"
                className="font-display mb-5 text-xl font-bold text-[#202b29]"
              >
                Dónde buscar información oficial
              </h2>
              <div className="grid gap-5 sm:grid-cols-2">
                {MODULE1_INSTITUTIONS.map((item) => (
                  <article
                    key={item.key}
                    className="flex flex-col items-start rounded-lg border border-[#dfc7d2] bg-white p-5"
                  >
                    <div
                      className={cn(
                        "relative mb-4 h-20 w-full",
                        item.key === "mincetur" && "rounded bg-[#b5245b]"
                      )}
                    >
                      <Image
                        src={item.logo}
                        alt={
                          item.key === "dircetur"
                            ? "Gobierno Regional de Cajamarca, institución de la que depende DIRCETUR"
                            : `Logo oficial de ${item.name}`
                        }
                        fill
                        sizes="(min-width: 640px) 320px, 90vw"
                        className="object-contain p-2"
                      />
                    </div>
                    <h3 className="text-lg font-bold leading-6 text-[#202b29]">
                      {item.name}
                    </h3>
                    <p className="mt-3">{item.description}</p>
                    <p className="mb-4 mt-2 text-sm font-semibold text-[#24756f]">
                      {item.opportunity}
                    </p>
                    <External href={item.url} className="mt-auto w-full">
                      {item.action}
                    </External>
                  </article>
                ))}
              </div>
            </section>
            <section>
              <h2 className="font-display mb-4 text-xl font-bold text-[#202b29]">
                ¿Qué puedes encontrar?
              </h2>
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  { title: "Ferias artesanales", icon: Store },
                  { title: "Concursos", icon: Trophy },
                  { title: "Capacitaciones", icon: GraduationCap }
                ].map(({ title, icon: Icon }) => (
                  <p key={title} className="flex items-center gap-3 py-3 font-semibold">
                    <Icon className="h-6 w-6 shrink-0 text-[#24756f]" />
                    {title}
                  </p>
                ))}
              </div>
            </section>
            <Step number={1} title="Cómo encontrar convocatorias y oportunidades">
              {video("M1-S2-01")}
            </Step>
            <section className="space-y-4 border-t border-[#ead2dc] pt-6">
              <Image
                src="/images/learning/module1/artesanias.png"
                alt="Artesanías del Perú"
                width={220}
                height={80}
                className="h-20 w-56 object-contain object-left"
              />
              <h2 className="font-display text-xl font-bold text-[#202b29]">
                Plataforma Artesanías del Perú
              </h2>
              <p>
                Artesanías del Perú permite conocer artesanos y productos representativos
                del país y facilita el contacto directo con ellos.
              </p>
              <External href="https://www.artesaniasdelperu.gob.pe/">
                Ir a Artesanías del Perú
              </External>
              <h3 className="pt-2 text-lg font-bold">
                ¿Cómo registrarse en Artesanías del Perú?
              </h3>
              {tutorial("artesanias")}
            </section>
          </>
        )}

        {order === 3 && (
          <>
            <section>
              <h2 className="font-display mb-4 text-xl font-bold text-[#202b29]">
                ¿Qué necesito antes de postular a un concurso?
              </h2>
              <fieldset className="space-y-2">
                <legend className="sr-only">Requisitos que tengo preparados</legend>
                {MODULE1_CHECKLIST.map((item) => (
                  <label
                    key={item}
                    className="flex min-h-12 cursor-pointer items-center gap-3 border-b border-[#ead2dc] py-3"
                  >
                    <input
                      type="checkbox"
                      className="h-5 w-5 shrink-0 accent-[#b5245b]"
                    />
                    <span>{item}</span>
                  </label>
                ))}
              </fieldset>
              <p className="mt-4 text-sm">
                Los requisitos dependen de las bases de cada convocatoria. Revisa cuáles
                te solicitan antes de postular.
              </p>
            </section>
            <section className="space-y-5">
              <h2 className="font-display text-xl font-bold text-[#202b29]">
                Antes de postular, prepara estos 3 requisitos
              </h2>
              <Step card number={1} title="Registro Nacional del Artesano">
                <p>Cómo inscribirme o renovar mi RNA</p>
                {video("M1-S3-02")}
                <External
                  href="https://www.gob.pe/747-inscribirse-en-el-registro-nacional-del-artesano-rna"
                  className="mt-4"
                >
                  Consultar requisitos vigentes del RNA
                </External>
              </Step>
              <Step card number={2} title="Registro Único de Contribuyentes (RUC)">
                <p>Cómo obtener mi RUC y Clave SOL</p>
                {video("M1-S3-01")}
                <External href="https://www.gob.pe/sunat" className="mt-4">
                  Consultar información de SUNAT
                </External>
              </Step>
              <Step card number={3} title="Cuenta bancaria">
                <p>
                  Necesitarás una cuenta bancaria para recibir pagos o participar en
                  algunas oportunidades. También es importante conocer tu CCI.
                </p>
                <p className="mt-3 text-sm">
                  Este ejemplo usa BBVA, pero puedes elegir otra entidad. Consulta
                  requisitos, comisiones y condiciones vigentes directamente en tu banco.
                  Nunca compartas tu clave ni los códigos que recibes.
                </p>
                {tutorial("bank")}
              </Step>
            </section>
          </>
        )}

        {order === 4 && (
          <>
            <Step number={1} title="¿Cómo ingresar a una reunión por Zoom?">
              <p>
                Abre el enlace que te envían. Ingresa tu nombre y permite el micrófono y
                la cámara cuando se soliciten. Activa el audio para escuchar y silencia el
                micrófono mientras otras personas hablan.
              </p>
              {tutorial("zoom")}
            </Step>
            <Step number={2} title="¿Cómo ingresar a una reunión por Google Meet?">
              <p>
                Abre el enlace de la capacitación. Revisa el micrófono y la cámara antes
                de ingresar. Toca el micrófono para silenciar o activar tu voz y la cámara
                para mostrar u ocultar tu imagen.
              </p>
              {tutorial("meet")}
            </Step>
            <Outcomes
              title="Al terminar el Módulo 1, yo puedo…"
              items={MODULE1_OUTCOMES}
            />
          </>
        )}

        {order !== 4 && (
          <Outcomes title="Al terminar esta sesión podrás:" items={session.outcomes} />
        )}
        <footer className="space-y-4 border-t border-[#ead2dc] pt-6">
          <p className="font-bold">{completed ? "Sesión completada" : "Ya terminé"}</p>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {order > 1 && (
              <Link
                href={sessionHref(MODULE1_SESSIONS[order - 2].id)}
                className={linkStyle}
              >
                <ArrowLeft className="h-5 w-5 shrink-0" />
                Sesión anterior
              </Link>
            )}
            <Module1Completion
              courseId={courseId}
              lessonId={lesson.id}
              completed={completed}
              nextHref={
                order === 4 ? courseHref : sessionHref(MODULE1_SESSIONS[order].id)
              }
              last={order === 4}
            />
          </div>
        </footer>
      </div>
    </ArtisanShell>
  );
}

function Step({
  number,
  title,
  children,
  card = false
}: {
  number: number;
  title: string;
  children: React.ReactNode;
  card?: boolean;
}) {
  return (
    <section
      className={cn("min-w-0", card && "rounded-lg border border-[#dfc7d2] bg-white p-5")}
    >
      <div className="mb-4 flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#e2f2ef] font-bold text-[#24756f]">
          {number}
        </span>
        <div>
          <p className="text-xs font-bold uppercase text-[#24756f]">
            {card ? "Requisito" : "Paso"} {number}
          </p>
          <h2 className="text-xl font-bold leading-7 text-[#202b29]">{title}</h2>
        </div>
      </div>
      {children}
    </section>
  );
}
function External({
  href,
  className,
  children
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(linkStyle, className)}
    >
      {children}
      <ExternalLink className="h-4 w-4 shrink-0" />
    </a>
  );
}
function Outcomes({ title, items }: { title: string; items: readonly string[] }) {
  return (
    <section className="border-t border-[#ead2dc] pt-6">
      <h2 className="font-display mb-4 text-xl font-bold text-[#202b29]">{title}</h2>
      <ul className="grid gap-3 sm:grid-cols-2">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-3 rounded-lg bg-[#e2f2ef] p-4">
            <Check className="mt-1 h-5 w-5 shrink-0 text-[#24756f]" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
