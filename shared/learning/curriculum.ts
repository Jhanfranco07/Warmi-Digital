import curriculum from "./curriculum.json";

export const WARMI_CURRICULUM = curriculum;
export function curriculumSession(lessonId: string) {
  return curriculum.sessions.find((session) => session.id === lessonId);
}

export function curriculumFile(url: string) {
  return curriculum.sessions
    .flatMap((session) => session.guides)
    .find((guide) => guide.src === url);
}
