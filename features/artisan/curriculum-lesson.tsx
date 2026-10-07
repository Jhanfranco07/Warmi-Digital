import Image from "next/image";
import { SpeechButton } from "@/shared/accessibility/speech-button";
import { curriculumSession } from "@/shared/learning/curriculum";

export function CurriculumLesson({
  session
}: {
  session: NonNullable<ReturnType<typeof curriculumSession>>;
}) {
  return (
    <div className="space-y-10">
      <nav aria-label="Guías de esta sesión" className="grid gap-2 sm:grid-cols-2">
        {session.sections.map((section) => (
          <a
            key={section.page}
            href={`#guia-${section.page}`}
            className="flex min-h-14 items-center rounded-xl border border-[#f0c7bb] bg-[#fff8f1] px-4 py-3 font-semibold text-[#7a3100] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#b5245b]"
          >
            {section.title}
          </a>
        ))}
      </nav>
      {session.sections.map((section) => {
        const guide = session.guides.find((item) => item.page === section.page)!;
        return (
          <section
            id={`guia-${section.page}`}
            key={section.page}
            className="scroll-mt-24 space-y-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-display text-2xl text-[#7a3100]">{section.title}</h2>
              {section.text && (
                <SpeechButton
                  text={`${section.title}. ${section.text}`}
                  label="Escuchar esta guía"
                  compact
                />
              )}
            </div>
            {section.text && (
              <div className="space-y-4 break-words text-lg leading-8 text-[#5b4a42]">
                {section.text.split("\n\n").map((paragraph, index) => (
                  <p key={index} className="whitespace-pre-line">
                    {paragraph.split("\n").map((line, lineIndex) => (
                      <span key={lineIndex}>
                        {lineIndex > 0 && <br />}
                        {/^https:\/\/\S+$/.test(line) ? (
                          <a
                            href={line}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex min-h-12 items-center font-semibold text-[#b5245b] underline"
                          >
                            {line}
                          </a>
                        ) : (
                          line
                        )}
                      </span>
                    ))}
                  </p>
                ))}
              </div>
            )}
            <figure className="space-y-3">
              <Image
                src={guide.src}
                alt={guide.alt}
                width={guide.width}
                height={guide.height}
                sizes="(min-width: 1280px) 900px, 100vw"
                className="h-auto w-full rounded-xl border bg-white"
              />
              <figcaption>
                <a
                  href={guide.src}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-12 items-center rounded-lg border border-[#b5245b] px-4 py-3 font-semibold text-[#b5245b]"
                >
                  Ampliar guía: {guide.title}
                </a>
              </figcaption>
            </figure>
          </section>
        );
      })}
    </div>
  );
}
