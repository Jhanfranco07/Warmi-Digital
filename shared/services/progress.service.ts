import { ProgressRepository } from "@/shared/repositories/progress.repository";

export class ProgressService {
  constructor(private readonly progressRepository = new ProgressRepository()) {}

  markLessonStarted(enrollmentId: string, lessonId: string) {
    return this.progressRepository.markLessonStarted(enrollmentId, lessonId);
  }

  completeLesson(enrollmentId: string, lessonId: string) {
    return this.progressRepository.markLessonCompleted(enrollmentId, lessonId);
  }
}
