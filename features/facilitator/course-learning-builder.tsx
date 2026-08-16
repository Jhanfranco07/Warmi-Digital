"use client";

import { useMemo, useState, useTransition } from "react";
import {
  ExternalLink,
  FileText,
  ImageIcon,
  LinkIcon,
  Loader2,
  Music,
  Plus,
  Trash2,
  Video
} from "lucide-react";
import { toast } from "sonner";
import type {
  CourseLevel,
  CourseStatus,
  LessonResourceType,
  LessonType
} from "@prisma/client";

import {
  addLessonResourceAction,
  deleteLessonResourceAction,
  updateCourseAction,
  upsertLessonAction,
  upsertModuleAction
} from "@/shared/actions/facilitator/actions";
import { YouTubePlayer } from "@/shared/components/media/youtube-player";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { FileUpload } from "@/shared/components/upload/file-upload";
import { ImageUpload } from "@/shared/components/upload/image-upload";
import { parseYouTubeVideoId } from "@/shared/lib/youtube";

type Resource = {
  id: string;
  type: LessonResourceType;
  title: string;
  description: string | null;
  position: number;
  provider: string | null;
  externalId: string | null;
  originalUrl: string | null;
  file: {
    id: string;
    url: string;
    type: string;
    mimeType: string;
    altText: string | null;
  } | null;
};

type Lesson = {
  id: string;
  title: string;
  content: string | null;
  type: LessonType;
  order: number;
  durationMin: number | null;
  lessonFiles: Resource[];
};

type Module = {
  id: string;
  title: string;
  description: string | null;
  order: number;
  durationMin: number | null;
  lessons: Lesson[];
};

type Course = {
  id: string;
  title: string;
  description: string | null;
  level: CourseLevel;
  status: CourseStatus;
  durationMin: number | null;
  imageUrl: string | null;
  modules: Module[];
};

type ActionState = { ok: boolean; message: string };

const resourceOptions: {
  value: LessonResourceType;
  label: string;
  Icon: typeof Video;
}[] = [
  { value: "VIDEO_YOUTUBE", label: "Video de YouTube", Icon: Video },
  { value: "IMAGE", label: "Imagen", Icon: ImageIcon },
  { value: "PDF", label: "PDF / documento", Icon: FileText },
  { value: "AUDIO", label: "Audio", Icon: Music },
  { value: "EXTERNAL_LINK", label: "Enlace externo", Icon: LinkIcon },
  { value: "VIDEO_UPLOAD", label: "Subir video", Icon: Video }
];

function submitWithToast(
  action: (state: unknown, data: FormData) => Promise<ActionState>,
  data: FormData,
  startTransition: ReturnType<typeof useTransition>[1]
) {
  startTransition(async () => {
    const response = await action(null, data);
    if (response.ok) toast.success(response.message);
    else toast.error(response.message);
  });
}

export function CourseLearningBuilder({ course }: { course: Course }) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Datos del curso</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            action={(data) => submitWithToast(updateCourseAction, data, startTransition)}
            className="grid gap-4 md:grid-cols-2"
          >
            <input type="hidden" name="courseId" value={course.id} />
            <label className="grid gap-2 md:col-span-2">
              Nombre
              <Input name="title" defaultValue={course.title} required />
            </label>
            <label className="grid gap-2 md:col-span-2">
              Descripción
              <Textarea name="description" defaultValue={course.description ?? ""} />
            </label>
            <label className="grid gap-2">
              Nivel
              <select
                name="level"
                defaultValue={course.level}
                className="h-10 rounded-md border bg-background px-3"
              >
                <option value="BEGINNER">Inicial</option>
                <option value="INTERMEDIATE">Intermedio</option>
                <option value="ADVANCED">Avanzado</option>
              </select>
            </label>
            <label className="grid gap-2">
              Estado
              <select
                name="status"
                defaultValue={course.status}
                className="h-10 rounded-md border bg-background px-3"
              >
                <option value="DRAFT">Borrador</option>
                <option value="PUBLISHED">Publicado</option>
                <option value="ARCHIVED">Archivado</option>
              </select>
            </label>
            <label className="grid gap-2">
              Duración estimada (min)
              <Input
                name="durationMin"
                type="number"
                defaultValue={course.durationMin ?? ""}
              />
            </label>
            <label className="grid gap-2">
              URL de portada
              <Input name="imageUrl" type="url" defaultValue={course.imageUrl ?? ""} />
            </label>
            <div className="md:col-span-2">
              <Button type="submit" disabled={pending}>
                {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Guardar curso
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <NewModuleForm courseId={course.id} />

      {course.modules.length ? (
        course.modules.map((module) => (
          <ModuleEditor key={module.id} courseId={course.id} module={module} />
        ))
      ) : (
        <Card>
          <CardContent className="pt-6 text-sm text-muted-foreground">
            Este curso todavía no tiene módulos.
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function NewModuleForm({ courseId }: { courseId: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Agregar módulo</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          action={(data) => submitWithToast(upsertModuleAction, data, startTransition)}
          className="grid gap-4 md:grid-cols-[1fr_120px_160px_auto]"
        >
          <input type="hidden" name="courseId" value={courseId} />
          <Input name="title" placeholder="Título del módulo" required />
          <Input name="order" type="number" min={0} defaultValue={0} aria-label="Orden" />
          <Input
            name="durationMin"
            type="number"
            min={1}
            placeholder="Minutos"
            aria-label="Duración"
          />
          <Button type="submit" disabled={pending}>
            <Plus className="mr-2 h-4 w-4" />
            Crear
          </Button>
          <Textarea
            name="description"
            placeholder="Descripción"
            className="md:col-span-4"
          />
        </form>
      </CardContent>
    </Card>
  );
}

function ModuleEditor({ courseId, module }: { courseId: string; module: Module }) {
  const [pending, startTransition] = useTransition();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{module.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <form
          action={(data) => submitWithToast(upsertModuleAction, data, startTransition)}
          className="grid gap-4 md:grid-cols-[1fr_120px_160px_auto]"
        >
          <input type="hidden" name="courseId" value={courseId} />
          <input type="hidden" name="moduleId" value={module.id} />
          <Input name="title" defaultValue={module.title} required />
          <Input name="order" type="number" min={0} defaultValue={module.order} />
          <Input
            name="durationMin"
            type="number"
            min={1}
            defaultValue={module.durationMin ?? ""}
          />
          <Button type="submit" variant="outline" disabled={pending}>
            Guardar módulo
          </Button>
          <Textarea
            name="description"
            defaultValue={module.description ?? ""}
            className="md:col-span-4"
          />
        </form>

        <NewLessonForm courseId={courseId} moduleId={module.id} />

        <div className="space-y-4">
          {module.lessons.length ? (
            module.lessons.map((lesson) => (
              <LessonEditor
                key={lesson.id}
                courseId={courseId}
                moduleId={module.id}
                lesson={lesson}
              />
            ))
          ) : (
            <p className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
              Este módulo todavía no tiene lecciones.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function NewLessonForm({ courseId, moduleId }: { courseId: string; moduleId: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <form
      action={(data) => submitWithToast(upsertLessonAction, data, startTransition)}
      className="grid gap-3 rounded-md border border-dashed p-4 md:grid-cols-[1fr_110px_140px_auto]"
    >
      <input type="hidden" name="courseId" value={courseId} />
      <input type="hidden" name="moduleId" value={moduleId} />
      <input type="hidden" name="type" value="TEXT" />
      <Input name="title" placeholder="Nueva lección" required />
      <Input name="order" type="number" min={0} defaultValue={0} aria-label="Orden" />
      <Input name="durationMin" type="number" min={1} placeholder="Minutos" />
      <Button type="submit" disabled={pending}>
        <Plus className="mr-2 h-4 w-4" />
        Crear lección
      </Button>
      <Textarea
        name="content"
        placeholder="Contenido textual de la lección"
        className="md:col-span-4"
      />
    </form>
  );
}

function LessonEditor({
  courseId,
  moduleId,
  lesson
}: {
  courseId: string;
  moduleId: string;
  lesson: Lesson;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <section className="rounded-lg border bg-surface-low p-4">
      <form
        action={(data) => submitWithToast(upsertLessonAction, data, startTransition)}
        className="grid gap-3 md:grid-cols-[1fr_110px_140px_auto]"
      >
        <input type="hidden" name="courseId" value={courseId} />
        <input type="hidden" name="moduleId" value={moduleId} />
        <input type="hidden" name="lessonId" value={lesson.id} />
        <input type="hidden" name="type" value={lesson.type} />
        <Input name="title" defaultValue={lesson.title} required />
        <Input name="order" type="number" min={0} defaultValue={lesson.order} />
        <Input
          name="durationMin"
          type="number"
          min={1}
          defaultValue={lesson.durationMin ?? ""}
        />
        <Button type="submit" variant="outline" disabled={pending}>
          Guardar lección
        </Button>
        <Textarea
          name="content"
          defaultValue={lesson.content ?? ""}
          className="md:col-span-4"
        />
      </form>

      <div className="mt-5 space-y-3">
        <h3 className="font-ui text-sm font-bold">Recursos</h3>
        {lesson.lessonFiles.length ? (
          lesson.lessonFiles.map((resource) => (
            <ResourceRow key={resource.id} courseId={courseId} resource={resource} />
          ))
        ) : (
          <p className="rounded-md border border-dashed bg-background p-3 text-sm text-muted-foreground">
            Esta lección todavía no tiene recursos.
          </p>
        )}
      </div>

      <LessonResourceForm
        courseId={courseId}
        lessonId={lesson.id}
        nextPosition={lesson.lessonFiles.length}
      />
    </section>
  );
}

function ResourceRow({ courseId, resource }: { courseId: string; resource: Resource }) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border bg-background p-3">
      <div>
        <p className="text-sm font-semibold">{resource.title}</p>
        <p className="text-xs text-muted-foreground">
          {resource.type}
          {resource.description ? ` · ${resource.description}` : ""}
        </p>
      </div>
      <div className="flex items-center gap-2">
        {resource.originalUrl || resource.file?.url ? (
          <a
            href={resource.originalUrl ?? resource.file?.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-sm font-semibold text-primary"
          >
            Abrir <ExternalLink className="h-4 w-4" />
          </a>
        ) : null}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              const response = await deleteLessonResourceAction(resource.id, courseId);
              if (response.ok) toast.success(response.message);
              else toast.error(response.message);
            })
          }
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function LessonResourceForm({
  courseId,
  lessonId,
  nextPosition
}: {
  courseId: string;
  lessonId: string;
  nextPosition: number;
}) {
  const [resourceType, setResourceType] = useState<LessonResourceType>("VIDEO_YOUTUBE");
  const [url, setUrl] = useState("");
  const [fileId, setFileId] = useState("");
  const [pending, startTransition] = useTransition();
  const videoId = useMemo(() => parseYouTubeVideoId(url), [url]);
  const selected = resourceOptions.find((option) => option.value === resourceType);
  const SelectedIcon = selected?.Icon;

  return (
    <form
      action={(data) => {
        if (fileId) data.set("fileId", fileId);
        submitWithToast(addLessonResourceAction, data, startTransition);
      }}
      className="mt-5 grid gap-4 rounded-md border bg-background p-4"
    >
      <input type="hidden" name="courseId" value={courseId} />
      <input type="hidden" name="lessonId" value={lessonId} />
      <input type="hidden" name="position" value={nextPosition} />
      <div className="grid gap-3 md:grid-cols-[220px_1fr_1fr]">
        <label className="grid gap-2">
          Agregar recurso
          <select
            name="resourceType"
            value={resourceType}
            onChange={(event) => {
              setResourceType(event.target.value as LessonResourceType);
              setFileId("");
            }}
            className="h-10 rounded-md border bg-background px-3"
          >
            {resourceOptions.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-2">
          Título del recurso
          <Input name="title" required />
        </label>
        <label className="grid gap-2">
          Descripción
          <Input name="description" />
        </label>
      </div>

      {resourceType === "VIDEO_YOUTUBE" || resourceType === "EXTERNAL_LINK" ? (
        <label className="grid gap-2">
          URL
          <Input
            name="url"
            type="url"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            required
          />
        </label>
      ) : null}

      {resourceType === "VIDEO_YOUTUBE" && url ? (
        videoId ? (
          <div className="space-y-2">
            <p className="text-sm font-semibold">Video agregado</p>
            <YouTubePlayer videoId={videoId} title="Previsualización del video" />
          </div>
        ) : (
          <p className="text-sm font-semibold text-destructive">
            Pega un enlace válido de YouTube.
          </p>
        )
      ) : null}

      {resourceType === "IMAGE" ? (
        <ImageUpload
          folder="warmi/learning"
          label="Subir imagen"
          onUploaded={(file) => setFileId(file.id)}
          onRemove={() => setFileId("")}
        />
      ) : null}
      {resourceType === "PDF" || resourceType === "DOCUMENT" ? (
        <FileUpload
          accept="application/pdf"
          uploadType="DOCUMENT"
          folder="warmi/learning"
          label="Subir PDF"
          description="PDF hasta 20 MB"
          onUploaded={(file) => setFileId(file.id)}
          onRemove={() => setFileId("")}
        />
      ) : null}
      {resourceType === "AUDIO" ? (
        <FileUpload
          accept="audio/mpeg,audio/mp3,audio/wav,audio/ogg"
          uploadType="AUDIO"
          folder="warmi/learning"
          label="Subir audio"
          description="MP3, WAV u OGG hasta 30 MB"
          onUploaded={(file) => setFileId(file.id)}
          onRemove={() => setFileId("")}
        />
      ) : null}
      {resourceType === "VIDEO_UPLOAD" ? (
        <FileUpload
          accept="video/mp4,video/webm,video/quicktime"
          uploadType="VIDEO"
          folder="warmi/learning"
          label="Subir video"
          description="Video compatible con Cloudinary"
          onUploaded={(file) => setFileId(file.id)}
          onRemove={() => setFileId("")}
        />
      ) : null}

      <Button type="submit" className="justify-self-start" disabled={pending}>
        {SelectedIcon ? <SelectedIcon className="mr-2 h-4 w-4" /> : null}
        Guardar recurso
      </Button>
    </form>
  );
}
