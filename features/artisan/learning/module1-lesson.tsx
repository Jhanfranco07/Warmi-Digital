import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import { FileText, GraduationCap, Store, Trophy } from "lucide-react";
import {
  LearningExternal,
  LearningChecklist,
  learningLinkStyle
} from "@/features/artisan/learning/learning-content";
import { ArtisanShell } from "@/features/artisan/artisan-panel";
import {
  LearningSession,
  LearningDisclosure,
  type LearningStep
} from "@/features/artisan/learning/learning-session";
import { LearningVideo } from "@/features/artisan/learning/learning-video";
import {
  MODULE1_CHECKLIST,
  MODULE1_INSTITUTIONS,
  MODULE1_OUTCOMES,
  MODULE1_SESSIONS,
  MODULE1_SUPPORT_VIDEOS,
  MODULE1_VIDEOS
} from "@/shared/learning/module1";
import type { LearningService } from "@/shared/services/learning.service";

export type LearningLesson = Awaited<
  ReturnType<LearningService["getLessonDetail"]>
>["lesson"];

export function Module1Lesson({
  courseId,
  lesson,
  completed
}: {
  courseId: string;
  lesson: LearningLesson;
  completed: boolean;
}) {
  const session = MODULE1_SESSIONS.find((item) => item.id === lesson.id);
  if (!session) throw new Error("Sesión M1 no configurada.");
  const video = (key: string) => {
    const mapping = MODULE1_VIDEOS.find((item) => item.key === key)!;
    const resource = lesson.lessonFiles.find(
      (item) => item.file?.publicId === mapping.publicId
    );
    return resource?.file ? (
      <LearningVideo
        sourceType="CLOUDINARY"
        url={resource.file.url}
        title={mapping.title}
        action={mapping.action}
      />
    ) : (
      <p role="status">Este video todavía no está disponible.</p>
    );
  };
  const tutorial = (key: keyof typeof MODULE1_SUPPORT_VIDEOS) => (
    <LearningVideo {...MODULE1_SUPPORT_VIDEOS[key]} />
  );
  const additional = (
    <LearningDisclosure label="Material adicional">
      <p>¿Quieres ver otra forma de hacerlo?</p>
      {video("M1-S1-03")}
      {video("M1-S1-04")}
      {lesson.lessonFiles
        .filter((item) => (item.type === "PDF" || item.type === "DOCUMENT") && item.file)
        .map((item) => (
          <a
            key={item.id}
            href={`/api/files/${item.fileId}/preview`}
            target="_blank"
            rel="noopener noreferrer"
            className={learningLinkStyle}
          >
            <FileText className="h-5 w-5 shrink-0" />
            Abrir guía de Gmail en PDF
          </a>
        ))}
      {lesson.lessonFiles
        .filter((item) => item.provider === "warmi" && item.originalUrl)
        .map((item) => (
          <Link
            key={item.id}
            href={item.originalUrl as Route}
            className={learningLinkStyle}
          >
            {item.title}
          </Link>
        ))}
    </LearningDisclosure>
  );
  const institutionContent = (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        {MODULE1_INSTITUTIONS.map((item) => (
          <article
            key={item.key}
            className="flex flex-col items-start gap-3 rounded-lg border border-[#dfc7d2] bg-white p-4"
          >
            <div
              className={`relative h-16 w-full ${item.key === "mincetur" ? "rounded bg-[#b5245b]" : ""}`}
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
            <h3 className="text-lg font-bold leading-6">{item.name}</h3>
            <p className="text-sm leading-6">{item.description}</p>
            <LearningExternal href={item.url}>{item.action}</LearningExternal>
            <LearningDisclosure label="¿Qué puedo encontrar aquí?">
              <p>{item.opportunity}</p>
              <ul className="space-y-2">
                <li className="flex gap-2">
                  <Store className="h-5 w-5" />
                  Ferias artesanales
                </li>
                <li className="flex gap-2">
                  <Trophy className="h-5 w-5" />
                  Concursos
                </li>
                <li className="flex gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Capacitaciones
                </li>
              </ul>
            </LearningDisclosure>
          </article>
        ))}
      </div>
    </>
  );
  const stepsBySession: Record<number, LearningStep[]> = {
    1: [
      {
        title: "Crear mi cuenta de Gmail",
        narration: session.intro,
        continueLabel: "Ya sé cómo crear mi cuenta",
        content: (
          <>
            <p>{session.intro}</p>
            {video("M1-S1-01")}
          </>
        )
      },
      {
        title: "Enviar un documento adjunto",
        narration:
          "Ahora aprenderás a enviar un documento, una fotografía o un PDF desde tu correo.",
        continueLabel: "Ya sé cómo adjuntar un archivo",
        content: (
          <>
            <p>
              Ahora aprenderás a enviar un documento, una fotografía o un PDF desde tu
              correo.
            </p>
            {video("M1-S1-02")}
            {additional}
          </>
        )
      }
    ],
    2: [
      {
        title: "¿Dónde puedo encontrar oportunidades?",
        narration: MODULE1_INSTITUTIONS.map(
          (item) =>
            `${item.name}. ${item.description}. ${item.opportunity}. Ferias, concursos y capacitaciones.`
        ).join(" "),
        content: institutionContent
      },
      {
        title: "Cómo encontrar convocatorias y oportunidades",
        narration:
          "Puedes encontrar ferias artesanales, concursos y capacitaciones en los enlaces oficiales.",
        content: <>{video("M1-S2-01")}</>
      },
      {
        title: "Plataforma Artesanías del Perú",
        narration:
          "Artesanías del Perú permite conocer artesanos y productos representativos del país y facilita el contacto directo con ellos. Cómo registrarse en Artesanías del Perú.",
        content: (
          <>
            <Image
              src="/images/learning/module1/artesanias.png"
              alt="Artesanías del Perú"
              width={220}
              height={80}
              className="h-20 w-56 object-contain object-left"
            />
            <p>
              Artesanías del Perú permite conocer artesanos y productos representativos
              del país y facilita el contacto directo con ellos.
            </p>
            <LearningExternal href="https://www.artesaniasdelperu.gob.pe/">
              Ir a Artesanías del Perú
            </LearningExternal>
            {tutorial("artesanias")}
          </>
        )
      }
    ],
    3: [
      {
        title: "Preparar mis requisitos",
        narration: `${session.intro} ${MODULE1_CHECKLIST.join(". ")}. Los requisitos dependen de las bases de cada convocatoria.`,
        content: (
          <>
            <p>Antes de postular necesitas preparar algunas cosas.</p>
            <LearningChecklist items={MODULE1_CHECKLIST} />
            <p className="text-sm">{session.intro}</p>
            <p className="text-sm">
              Los requisitos dependen de las bases de cada convocatoria. Revisa cuáles te
              solicitan antes de postular.
            </p>
          </>
        )
      },
      {
        title: "Registro Nacional del Artesano",
        narration: "Cómo inscribirme o renovar mi RNA. Consulta los requisitos vigentes.",
        content: (
          <>
            <p>Cómo inscribirme o renovar mi RNA</p>
            {video("M1-S3-02")}
            <LearningDisclosure label="Más información sobre RNA">
              <LearningExternal href="https://www.gob.pe/747-inscribirse-en-el-registro-nacional-del-artesano-rna">
                Consultar requisitos vigentes del RNA
              </LearningExternal>
            </LearningDisclosure>
          </>
        )
      },
      {
        title: "Registro Único de Contribuyentes (RUC)",
        narration: "Cómo obtener mi RUC y Clave SOL. Consulta información de SUNAT.",
        content: (
          <>
            <p>Cómo obtener mi RUC y Clave SOL</p>
            {video("M1-S3-01")}
            <LearningDisclosure label="Más información sobre RUC">
              <LearningExternal href="https://www.gob.pe/sunat">
                Consultar información de SUNAT
              </LearningExternal>
            </LearningDisclosure>
          </>
        )
      },
      {
        title: "Cuenta bancaria",
        narration:
          "Necesitarás una cuenta bancaria para recibir pagos o participar en algunas oportunidades. También es importante conocer tu CCI. Este ejemplo usa BBVA, pero puedes elegir otra entidad. Consulta requisitos, comisiones y condiciones vigentes en tu banco. Nunca compartas tu clave ni los códigos que recibes.",
        content: (
          <>
            <p>
              Necesitarás una cuenta bancaria para recibir pagos o participar en algunas
              oportunidades. También es importante conocer tu CCI.
            </p>
            {tutorial("bank")}
            <LearningDisclosure label="Más información y seguridad">
              <p>
                Este ejemplo usa BBVA, pero puedes elegir otra entidad. Consulta
                requisitos, comisiones y condiciones vigentes directamente en tu banco.
              </p>
              <p>Nunca compartas tu clave ni los códigos que recibes.</p>
            </LearningDisclosure>
          </>
        )
      }
    ],
    4: [
      {
        title: "Aprender a usar Zoom",
        narration:
          "Abre el enlace que te envían. Ingresa tu nombre y permite el micrófono y la cámara cuando se soliciten. Activa el audio para escuchar y silencia el micrófono mientras otras personas hablan.",
        content: (
          <>
            <p>Abre el enlace de tu capacitación para entrar por Zoom.</p>
            {tutorial("zoom")}
            <LearningDisclosure label="Ver explicación de Zoom">
              <p>
                Abre el enlace que te envían. Ingresa tu nombre y permite el micrófono y
                la cámara cuando se soliciten.
              </p>
              <p>
                Activa el audio para escuchar y silencia el micrófono mientras otras
                personas hablan.
              </p>
            </LearningDisclosure>
          </>
        )
      },
      {
        title: "Aprender a usar Google Meet",
        narration:
          "Abre el enlace de la capacitación. Revisa el micrófono y la cámara antes de ingresar. Toca el micrófono para silenciar o activar tu voz y la cámara para mostrar u ocultar tu imagen.",
        content: (
          <>
            <p>Ahora entra a una capacitación por Google Meet.</p>
            {tutorial("meet")}
            <LearningDisclosure label="Ver explicación de Meet">
              <p>
                Abre el enlace de la capacitación. Revisa el micrófono y la cámara antes
                de ingresar.
              </p>
              <p>
                Toca el micrófono para silenciar o activar tu voz y la cámara para mostrar
                u ocultar tu imagen.
              </p>
            </LearningDisclosure>
          </>
        )
      }
    ]
  };
  const introductions = [
    "En esta sesión aprenderás a crear tu correo y enviar documentos.",
    "En esta sesión aprenderás a buscar oportunidades en fuentes oficiales.",
    "En esta sesión aprenderás a preparar tus requisitos antes de postular.",
    "En esta sesión aprenderás a entrar por Zoom y Google Meet."
  ];
  return (
    <ArtisanShell>
      <LearningSession
        key={lesson.id}
        courseId={courseId}
        lessonId={lesson.id}
        moduleNumber={1}
        order={session.order}
        title={session.title}
        intro={introductions[session.order - 1]}
        sessions={MODULE1_SESSIONS}
        steps={stepsBySession[session.order]}
        outcomes={session.order === 4 ? MODULE1_OUTCOMES : session.outcomes}
        completed={completed}
      />
    </ArtisanShell>
  );
}
