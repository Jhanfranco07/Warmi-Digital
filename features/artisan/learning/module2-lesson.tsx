import {
  Check,
  GraduationCap,
  Store,
  Trophy,
  Sun,
  Camera,
  Hand,
  Square
} from "lucide-react";
import { ArtisanShell } from "@/features/artisan/artisan-panel";
import {
  LearningSession,
  LearningDisclosure,
  LearningStepJump
} from "@/features/artisan/learning/learning-session";
import { LearningVideo } from "@/features/artisan/learning/learning-video";
import {
  LearningChecklist,
  LearningExternal
} from "@/features/artisan/learning/learning-content";
import { LearningChoice } from "@/features/artisan/learning/learning-choice";
import type { LearningLesson } from "@/features/artisan/learning/module1-lesson";
import {
  MODULE2_PRODUCT,
  MODULE2_QUESTIONS,
  MODULE2_SESSIONS,
  MODULE2_VIDEOS
} from "@/shared/learning/module2";

export function Module2Lesson({
  courseId,
  lesson,
  completed
}: {
  courseId: string;
  lesson: LearningLesson;
  completed: boolean;
}) {
  const session = MODULE2_SESSIONS.find((item) => item.id === lesson.id);
  if (!session) throw new Error("Sesión M2 no configurada.");
  const video = (key: string) => {
    const mapping = MODULE2_VIDEOS.find((item) => item.key === key)!;
    const file = lesson.lessonFiles.find(
      (item) => item.file?.publicId === mapping.publicId
    )?.file;
    return file ? (
      <LearningVideo
        sourceType="CLOUDINARY"
        url={file.url}
        title={mapping.title}
        action={mapping.action}
      />
    ) : (
      <p role="status">Este video todavía no está disponible.</p>
    );
  };
  const steps = session.steps.map((step) => {
    const narration = [
      step.text,
      ...(step.bullets ?? []),
      ...(step.examples ?? []).map((item) => `${item.title}. ${item.note ?? ""}`),
      ...(step.kind === "questions"
        ? MODULE2_QUESTIONS.map((item) => `${item.title} ${item.text}`)
        : []),
      ...(step.kind === "product"
        ? MODULE2_PRODUCT.map((item) => `${item.title}. ${item.value}. ${item.help}`)
        : [])
    ].join(". ");
    return {
      title: step.title,
      narration,
      content: (
        <>
          <p>{step.text}</p>
          {step.kind === "opportunities" && (
            <div className="grid gap-3">
              {[
                {
                  title: "Ferias",
                  text: "Muestra tus piezas y conversa directamente con clientes.",
                  action: "Conocer las ferias",
                  icon: Store
                },
                {
                  title: "Concursos",
                  text: "Presenta tu trabajo para una evaluación y posibles premios.",
                  action: "Conocer los concursos",
                  icon: Trophy
                },
                {
                  title: "Capacitaciones",
                  text: "Aprende habilidades para preparar tu negocio.",
                  action: "Conocer las capacitaciones",
                  icon: GraduationCap
                }
              ].map(({ title, text, action, icon: Icon }, index) => (
                <article
                  key={title}
                  className="rounded-lg border border-[#dfc7d2] bg-white p-4"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-6 w-6 shrink-0 text-[#24756f]" />
                    <h3 className="font-bold">{title}</h3>
                  </div>
                  <p className="mt-2">{text}</p>
                  <LearningStepJump to={index + 1}>{action}</LearningStepJump>
                </article>
              ))}
            </div>
          )}
          {step.kind === "choice" && <LearningChoice />}
          {step.kind === "questions" && (
            <div className="space-y-2">
              {MODULE2_QUESTIONS.map((question, index) => (
                <LearningDisclosure
                  key={question.title}
                  label={`${index + 1}. ${question.title}`}
                >
                  <p>{question.text}</p>
                </LearningDisclosure>
              ))}
            </div>
          )}
          {step.bullets &&
            (step.kind === "checklist" || step.kind === "form" ? (
              <LearningChecklist items={step.bullets} />
            ) : (
              <ul className="space-y-3">
                {step.bullets.map((item, index) => {
                  const Icon =
                    step.kind === "photos" ? [Sun, Square, Camera, Hand][index] : Check;
                  return (
                    <li
                      key={item}
                      className="flex items-start gap-3 border-b border-[#ead2dc] py-2"
                    >
                      <span className="shrink-0 font-bold text-[#24756f]">
                        {step.kind === "pdf" ? (
                          `${index + 1}.`
                        ) : (
                          <Icon className="mt-1 h-5 w-5" />
                        )}
                      </span>
                      {item}
                    </li>
                  );
                })}
              </ul>
            ))}
          {step.videoKey && video(step.videoKey)}
          {step.kind === "pdf" && (
            <>
              <LearningDisclosure label="Si mi celular no muestra Guardar como PDF">
                <p>
                  En algunos celulares entra a Compartir o Imprimir y elige Guardar como
                  PDF. Los nombres cambian según el dispositivo.
                </p>
                <p>
                  Comprueba que el PDF se abra y que el texto se lea. No subas documentos
                  privados a páginas desconocidas.
                </p>
              </LearningDisclosure>
              <LearningDisclosure label="Material adicional">
                {video("M2-S3-01")}
              </LearningDisclosure>
            </>
          )}
          {step.kind === "product" && (
            <dl className="space-y-4">
              {MODULE2_PRODUCT.map((field) => (
                <div key={field.title} className="border-b border-[#ead2dc] pb-3">
                  <dt className="font-bold text-[#24756f]">{field.title}</dt>
                  <dd className="mt-1">
                    {field.value}
                    <LearningDisclosure
                      label={
                        field.title === "Precio"
                          ? "¿Cómo calcularlo?"
                          : `¿Cómo lleno ${field.title.toLowerCase()}?`
                      }
                    >
                      <p>{field.help}</p>
                    </LearningDisclosure>
                  </dd>
                </div>
              ))}
            </dl>
          )}
          {step.examples && (
            <LearningDisclosure
              label={
                session.order === 2 ? "Ver bases oficiales del ejemplo" : "Ver ejemplos"
              }
            >
              <ul className="space-y-4">
                {step.examples.map((item) => (
                  <li key={item.title} className="space-y-2">
                    {item.url ? (
                      <LearningExternal href={item.url}>{item.title}</LearningExternal>
                    ) : (
                      <p className="font-bold">{item.title}</p>
                    )}
                    {item.note && <p className="text-sm">{item.note}</p>}
                  </li>
                ))}
              </ul>
            </LearningDisclosure>
          )}
        </>
      )
    };
  });
  return (
    <ArtisanShell>
      <LearningSession
        key={lesson.id}
        courseId={courseId}
        lessonId={lesson.id}
        moduleNumber={2}
        order={session.order}
        title={session.title}
        intro={session.intro}
        sessions={MODULE2_SESSIONS}
        steps={steps}
        outcomes={session.outcomes}
        completed={completed}
      />
    </ArtisanShell>
  );
}
