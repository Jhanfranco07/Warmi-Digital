"use client";

import { FormEvent, ReactNode, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import type { LessonResourceType, LessonType } from "@prisma/client";
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  BookOpen,
  CheckCircle2,
  Clock3,
  Download,
  Eye,
  ExternalLink,
  FileAudio,
  FileText,
  ImageIcon,
  Layers3,
  Link2,
  ListPlus,
  Maximize2,
  MoreHorizontal,
  Pencil,
  PlayCircle,
  Plus,
  Save,
  Trash2,
  Upload,
  Video,
  type LucideIcon
} from "lucide-react";
import { toast } from "sonner";

import {
  addLessonResourceAction,
  createCourseLessonAction,
  createCourseModuleAction,
  deleteLessonResourceAction,
  moveCourseModuleAction,
  moveLessonResourceAction,
  updateCourseEditorAction,
  updateCourseLessonAction,
  updateLessonResourceAction,
  updateCourseModuleAction
} from "@/shared/actions/facilitator/course-editor";
import { EmptyState } from "@/shared/components/feedback/empty-state";
import {
  FileUpload,
  type UploadedFileValue
} from "@/shared/components/upload/file-upload";
import { ImageUpload } from "@/shared/components/upload/image-upload";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/shared/components/ui/accordion";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/shared/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/shared/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/shared/components/ui/dropdown-menu";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { cn } from "@/shared/lib/utils";

type FileRecord = {
  id: string;
  url: string;
  provider?: string | null;
  publicId?: string | null;
  type?: "IMAGE" | "VIDEO" | "AUDIO" | "DOCUMENT" | "CERTIFICATE" | "OTHER" | null;
  mimeType?: string | null;
  size?: number | null;
  width?: number | null;
  height?: number | null;
  altText?: string | null;
  metadata?: unknown;
  createdAt?: Date | string | null;
  updatedAt?: Date | string | null;
  ownerId?: string | null;
};

type LessonResource = {
  id: string;
  lessonId: string;
  type: LessonResourceType;
  title: string;
  description: string | null;
  position: number;
  provider: string | null;
  externalId: string | null;
  originalUrl: string | null;
  file: FileRecord | null;
};

type LessonRecord = {
  id: string;
  title: string;
  content: string | null;
  type: LessonType;
  durationMin: number | null;
  order: number;
  lessonFiles: LessonResource[];
};

type ModuleRecord = {
  id: string;
  title: string;
  description: string | null;
  order: number;
  durationMin: number | null;
  coverFileId: string | null;
  coverFile: FileRecord | null;
  lessons: LessonRecord[];
};

export type CourseEditorData = {
  id: string;
  title: string;
  description: string | null;
  level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  durationMin: number | null;
  imageUrl: string | null;
  modules: ModuleRecord[];
};

type ActionResult = {
  ok: boolean;
  message: string;
};

const levelLabel = {
  BEGINNER: "Inicial",
  INTERMEDIATE: "Intermedio",
  ADVANCED: "Avanzado"
};

const statusLabel = {
  DRAFT: "Borrador",
  PUBLISHED: "Publicado",
  ARCHIVED: "Archivado"
};

const resourceOptions = [
  {
    kind: "YOUTUBE",
    label: "Video de YouTube",
    description: "Pega el enlace y revisa la vista previa.",
    icon: PlayCircle,
    color: "text-[#c21f5a]"
  },
  {
    kind: "IMAGE",
    label: "Imagen",
    description: "Fotografías, afiches o capturas de apoyo.",
    icon: ImageIcon,
    color: "text-[#2fbfc5]"
  },
  {
    kind: "DOCUMENT",
    label: "PDF o documento",
    description: "Guías, plantillas y materiales descargables.",
    icon: FileText,
    color: "text-[#2f63a4]"
  },
  {
    kind: "AUDIO",
    label: "Audio",
    description: "Explicaciones breves o mensajes grabados.",
    icon: FileAudio,
    color: "text-[#d99a00]"
  },
  {
    kind: "EXTERNAL_LINK",
    label: "Enlace externo",
    description: "Recursos oficiales o páginas complementarias.",
    icon: Link2,
    color: "text-[#f26b21]"
  },
  {
    kind: "VIDEO_UPLOAD",
    label: "Subir video",
    description: "Deshabilitado. Usa un enlace de YouTube.",
    icon: Video,
    color: "text-[#8f1450]"
  }
] as const;

type ResourceKind = (typeof resourceOptions)[number]["kind"];

function getMetadataValue(
  file: FileRecord,
  key: "title" | "description" | "resourceKind"
) {
  if (!file.metadata || typeof file.metadata !== "object") return null;
  const value = (file.metadata as Record<string, unknown>)[key];
  return typeof value === "string" ? value : null;
}

function extractYouTubeId(url: string) {
  const patterns = [
    /youtu\.be\/([^?&]+)/,
    /youtube\.com\/watch\?v=([^?&]+)/,
    /youtube\.com\/embed\/([^?&]+)/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match?.[1]) return match[1];
  }

  return null;
}

function resourceLabel(file: FileRecord) {
  const kind = getMetadataValue(file, "resourceKind");
  if (kind === "YOUTUBE") return "YouTube";
  if (kind === "EXTERNAL_LINK") return "Enlace";
  if (file.type === "IMAGE") return "Imagen";
  if (file.type === "AUDIO") return "Audio";
  if (file.type === "VIDEO") return "Video";
  if (file.type === "DOCUMENT") return "Documento";
  return "Recurso";
}

function resourceIcon(file: FileRecord) {
  const kind = getMetadataValue(file, "resourceKind");
  if (kind === "YOUTUBE") return PlayCircle;
  if (kind === "EXTERNAL_LINK") return ExternalLink;
  if (file.type === "IMAGE") return ImageIcon;
  if (file.type === "AUDIO") return FileAudio;
  if (file.type === "VIDEO") return Video;
  return FileText;
}

function resourceKindFromType(type: LessonResourceType): ResourceKind {
  const map: Record<LessonResourceType, ResourceKind> = {
    VIDEO_YOUTUBE: "YOUTUBE",
    VIDEO_UPLOAD: "VIDEO_UPLOAD",
    IMAGE: "IMAGE",
    PDF: "DOCUMENT",
    DOCUMENT: "DOCUMENT",
    AUDIO: "AUDIO",
    EXTERNAL_LINK: "EXTERNAL_LINK"
  };

  return map[type] ?? "DOCUMENT";
}

function resourceTypeLabel(type: LessonResourceType) {
  const label: Record<LessonResourceType, string> = {
    VIDEO_YOUTUBE: "YouTube",
    VIDEO_UPLOAD: "Video",
    IMAGE: "Imagen",
    PDF: "PDF",
    DOCUMENT: "Documento",
    AUDIO: "Audio",
    EXTERNAL_LINK: "Enlace"
  };

  return label[type] ?? "Recurso";
}

function resourceIconFromType(type: LessonResourceType) {
  const Icon: Record<LessonResourceType, LucideIcon> = {
    VIDEO_YOUTUBE: PlayCircle,
    VIDEO_UPLOAD: Video,
    IMAGE: ImageIcon,
    PDF: FileText,
    DOCUMENT: FileText,
    AUDIO: FileAudio,
    EXTERNAL_LINK: ExternalLink
  };

  return Icon[type] ?? FileText;
}

function getResourceUrl(resource: LessonResource) {
  return resource.originalUrl ?? resource.file?.url ?? "";
}

function getResourcePreviewUrl(resource: LessonResource) {
  if (!resource.file?.id) return "";
  return `/api/files/${resource.file.id}/preview`;
}

function getResourceDownloadUrl(resource: LessonResource) {
  const previewUrl = getResourcePreviewUrl(resource);
  return previewUrl ? `${previewUrl}?download=1` : getResourceUrl(resource);
}

function useSubmitAction() {
  const [isPending, startTransition] = useTransition();

  function submit(
    event: FormEvent<HTMLFormElement>,
    action: (formData: FormData) => Promise<ActionResult>,
    onSuccess?: () => void
  ) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const result = await action(formData);
      if (result.ok) {
        toast.success(result.message);
        onSuccess?.();
      } else {
        toast.error(result.message);
      }
    });
  }

  return { isPending, submit, startTransition };
}

function FormField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="space-y-2 text-label-ui font-semibold text-[#4b2414]">
      <span>{label}</span>
      {children}
    </label>
  );
}

function WarmiDots() {
  return (
    <div className="flex items-center gap-2" aria-hidden="true">
      {["#2f63a4", "#c21f5a", "#2fbfc5", "#f26b21", "#ff8a3d", "#f6bc1b"].map((color) => (
        <span
          key={color}
          className="h-3 w-3 rounded-full shadow-sm"
          style={{ backgroundColor: color }}
        />
      ))}
    </div>
  );
}

function EmptyPreview() {
  return (
    <div className="grid min-h-44 place-items-center rounded-md border border-dashed border-[#efc9b6] bg-[#fff8ef] text-center">
      <div>
        <Layers3 className="mx-auto h-8 w-8 text-[#c21f5a]" />
        <p className="mt-3 text-label-ui font-semibold text-[#4b2414]">
          Sin imagen principal
        </p>
      </div>
    </div>
  );
}

export function CourseEditor({ course }: { course: CourseEditorData }) {
  const totalLessons = useMemo(
    () => course.modules.reduce((sum, module) => sum + module.lessons.length, 0),
    [course.modules]
  );
  const totalResources = useMemo(
    () =>
      course.modules.reduce(
        (sum, module) =>
          sum +
          module.lessons.reduce(
            (lessonSum, lesson) => lessonSum + lesson.lessonFiles.length,
            0
          ),
        0
      ),
    [course.modules]
  );

  return (
    <div className="min-h-screen bg-[#fffaf4]">
      <div className="mx-auto w-full max-w-[1500px] px-4 py-6 sm:px-6 lg:px-10">
        <div className="flex flex-col gap-4 border-b-2 border-[#2f63a4] pb-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <Button asChild variant="outline" className="border-[#d8aa8f] text-[#7b3500]">
              <Link href="/facilitadora/cursos">
                <ArrowLeft className="h-4 w-4" />
                Volver a cursos
              </Link>
            </Button>
            <Badge className="bg-[#fff0d1] text-[#8a4b00]">
              {statusLabel[course.status]}
            </Badge>
          </div>
          <div className="flex items-center gap-4">
            <WarmiDots />
            <PreviewDialog
              course={course}
              totalLessons={totalLessons}
              totalResources={totalResources}
            />
          </div>
        </div>

        <section className="grid gap-6 py-8 xl:grid-cols-[minmax(0,1.05fr)_minmax(420px,0.95fr)]">
          <Card className="overflow-hidden border-[#efc9b6] bg-white shadow-[0_18px_50px_rgba(126,55,13,0.08)]">
            <CardHeader className="border-b border-[#f3d7c8] bg-gradient-to-r from-[#fff4e6] via-white to-[#fff7fb]">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-label-ui font-bold uppercase tracking-[0.18em] text-[#c21f5a]">
                    Curso formativo
                  </p>
                  <CardTitle className="mt-2 text-4xl text-[#111827]">
                    {course.title}
                  </CardTitle>
                  <CardDescription className="mt-2 max-w-3xl text-base">
                    {course.description ??
                      "Agrega una descripción para orientar a las artesanas."}
                  </CardDescription>
                </div>
                <CourseInfoDialog course={course} />
              </div>
            </CardHeader>
            <CardContent className="grid gap-5 p-6 md:grid-cols-[320px_minmax(0,1fr)]">
              {course.imageUrl ? (
                <div
                  className="min-h-56 rounded-md bg-cover bg-center shadow-soft"
                  style={{ backgroundImage: `url(${course.imageUrl})` }}
                />
              ) : (
                <EmptyPreview />
              )}
              <div className="grid gap-3 sm:grid-cols-3">
                <SummaryTile
                  icon={Layers3}
                  label="Módulos"
                  value={course.modules.length}
                />
                <SummaryTile icon={BookOpen} label="Lecciones" value={totalLessons} />
                <SummaryTile icon={Upload} label="Recursos" value={totalResources} />
                <div className="rounded-lg border border-[#f0cfbb] bg-[#fff8ef] p-4 sm:col-span-3">
                  <p className="text-label-ui font-semibold text-[#7b3500]">
                    Nivel y duración
                  </p>
                  <p className="mt-2 font-serif text-2xl text-[#111827]">
                    {levelLabel[course.level]} · {course.durationMin ?? 0} min
                  </p>
                  <p className="text-body-sm mt-1 text-muted-foreground">
                    El orden de módulos, lecciones y recursos se calcula desde esta
                    pantalla.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#efc9b6] bg-[#fff7fb] shadow-[0_18px_50px_rgba(194,31,90,0.08)]">
            <CardHeader>
              <CardTitle className="text-3xl text-[#8f1450]">
                Constructor guiado
              </CardTitle>
              <CardDescription>
                Organiza el curso como una ruta clara: módulo, lección y recurso.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ProcessStep
                number="1"
                title="Define el curso"
                description="Nombre, descripción, nivel, estado e imagen principal."
              />
              <ProcessStep
                number="2"
                title="Crea módulos"
                description="Cada módulo puede tener portada y duración estimada."
              />
              <ProcessStep
                number="3"
                title="Agrega lecciones"
                description="Las lecciones contienen el contenido breve y práctico."
              />
              <ProcessStep
                number="4"
                title="Adjunta recursos"
                description="Videos, documentos, audios, imágenes o enlaces útiles."
              />
            </CardContent>
          </Card>
        </section>

        <section id="contenido-curso" className="space-y-5">
          <div className="flex flex-col gap-4 border-t border-[#e7c7b2] pt-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-label-ui font-bold uppercase tracking-[0.18em] text-[#2f63a4]">
                Contenido del curso
              </p>
              <h2 className="font-serif text-4xl text-[#111827]">Módulos y lecciones</h2>
            </div>
            <ModuleDialog courseId={course.id} mode="create">
              <Button className="bg-[#c21f5a] text-white hover:bg-[#9f174a]">
                <Plus className="h-4 w-4" />
                Crear módulo
              </Button>
            </ModuleDialog>
          </div>

          {course.modules.length ? (
            <Accordion
              type="multiple"
              defaultValue={course.modules.slice(0, 1).map((module) => module.id)}
              className="space-y-4"
            >
              {course.modules.map((module, moduleIndex) => (
                <ModuleAccordion
                  key={module.id}
                  courseId={course.id}
                  module={module}
                  moduleIndex={moduleIndex}
                />
              ))}
            </Accordion>
          ) : (
            <EmptyState
              title="Aún no hay módulos"
              description="Crea el primer módulo para comenzar a ordenar la ruta formativa."
            />
          )}
        </section>
      </div>
    </div>
  );
}

function SummaryTile({
  icon: Icon,
  label,
  value
}: {
  icon: LucideIcon;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-lg border border-[#f0cfbb] bg-white p-4">
      <Icon className="h-5 w-5 text-[#c21f5a]" />
      <p className="mt-3 text-label-ui font-semibold text-[#4b2414]">{label}</p>
      <p className="font-serif text-3xl text-[#111827]">{value}</p>
    </div>
  );
}

function ProcessStep({
  number,
  title,
  description
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-4 rounded-lg border border-[#f1cdda] bg-white p-4 transition duration-200 hover:-translate-y-0.5 hover:shadow-soft">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#c21f5a] text-label-ui font-bold text-white">
        {number}
      </span>
      <div>
        <p className="font-serif text-xl text-[#111827]">{title}</p>
        <p className="text-body-sm mt-1 text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

function ModuleAccordion({
  courseId,
  module,
  moduleIndex
}: {
  courseId: string;
  module: ModuleRecord;
  moduleIndex: number;
}) {
  const { startTransition } = useSubmitAction();
  const resourceCount = module.lessons.reduce(
    (sum, lesson) => sum + lesson.lessonFiles.length,
    0
  );

  function move(direction: "up" | "down") {
    startTransition(async () => {
      const result = await moveCourseModuleAction(courseId, module.id, direction);
      if (result.ok) {
        toast.success(result.message);
      } else {
        toast.info(result.message);
      }
    });
  }

  return (
    <AccordionItem
      value={module.id}
      className="overflow-hidden rounded-xl border border-[#efc9b6] bg-white shadow-[0_16px_44px_rgba(126,55,13,0.08)] transition duration-200 hover:-translate-y-0.5"
    >
      <div className="grid gap-4 p-4 lg:grid-cols-[220px_minmax(0,1fr)_auto] lg:items-center">
        <div
          className="min-h-36 rounded-lg bg-[#fff0e5] bg-cover bg-center"
          style={{
            backgroundImage: module.coverFile?.url
              ? `url(${module.coverFile.url})`
              : "linear-gradient(135deg,#fff0e5,#fff7fb)"
          }}
        >
          {!module.coverFile?.url ? (
            <div className="grid h-full min-h-36 place-items-center text-[#c21f5a]">
              <ImageIcon className="h-8 w-8" />
            </div>
          ) : null}
        </div>

        <div>
          <Badge className="bg-[#eaf2ff] text-[#2f63a4]">Módulo {moduleIndex + 1}</Badge>
          <AccordionTrigger className="mt-2 py-2 text-left font-serif text-3xl text-[#111827] hover:text-[#c21f5a]">
            {module.title}
          </AccordionTrigger>
          <p className="max-w-3xl text-body-md text-muted-foreground">
            {module.description ?? "Agrega una descripción para este módulo."}
          </p>
          <div className="text-body-sm mt-4 flex flex-wrap gap-2">
            <Badge variant="outline" className="border-[#efc9b6]">
              <BookOpen className="mr-1 h-3.5 w-3.5" />
              {module.lessons.length} lecciones
            </Badge>
            <Badge variant="outline" className="border-[#efc9b6]">
              <Upload className="mr-1 h-3.5 w-3.5" />
              {resourceCount} recursos
            </Badge>
            <Badge variant="outline" className="border-[#efc9b6]">
              <Clock3 className="mr-1 h-3.5 w-3.5" />
              {module.durationMin ?? 0} min
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-2 lg:justify-end">
          <ModuleDialog courseId={courseId} module={module} mode="edit">
            <Button variant="outline" className="border-[#d8aa8f] text-[#7b3500]">
              <Pencil className="h-4 w-4" />
              Editar
            </Button>
          </ModuleDialog>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="border-[#d8aa8f]">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Acciones del módulo</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => move("up")}>
                <ArrowUp className="mr-2 h-4 w-4" />
                Subir módulo
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => move("down")}>
                <ArrowDown className="mr-2 h-4 w-4" />
                Bajar módulo
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <AccordionContent className="border-t border-[#f2d6c5] bg-[#fffaf4] p-4">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-label-ui font-bold uppercase tracking-[0.16em] text-[#c21f5a]">
              Lecciones del módulo
            </p>
            <p className="text-body-sm text-muted-foreground">
              Mantén cada lección breve, clara y acompañada de recursos prácticos.
            </p>
          </div>
          <LessonDialog courseId={courseId} moduleId={module.id} mode="create">
            <Button variant="outline" className="border-[#c21f5a] text-[#c21f5a]">
              <ListPlus className="h-4 w-4" />
              Crear lección
            </Button>
          </LessonDialog>
        </div>

        <div className="space-y-3">
          {module.lessons.length ? (
            module.lessons.map((lesson, index) => (
              <LessonCard
                key={lesson.id}
                courseId={courseId}
                moduleId={module.id}
                lesson={lesson}
                lessonIndex={index}
              />
            ))
          ) : (
            <div className="rounded-lg border border-dashed border-[#efc9b6] bg-white p-6 text-center">
              <p className="font-serif text-2xl text-[#111827]">Sin lecciones todavía</p>
              <p className="text-body-sm mt-1 text-muted-foreground">
                Crea una lección para comenzar a agregar recursos.
              </p>
            </div>
          )}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

function LessonCard({
  courseId,
  moduleId,
  lesson,
  lessonIndex
}: {
  courseId: string;
  moduleId: string;
  lesson: LessonRecord;
  lessonIndex: number;
}) {
  return (
    <Card className="border-[#efc9b6] bg-white shadow-none">
      <CardHeader className="pb-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <Badge className="bg-[#fff0d1] text-[#8a4b00]">
              Lección {lessonIndex + 1}
            </Badge>
            <CardTitle className="mt-2 text-2xl text-[#111827]">{lesson.title}</CardTitle>
            <CardDescription className="mt-1">
              {lesson.content ?? "Agrega el contenido textual de la lección."}
            </CardDescription>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge variant="outline" className="border-[#efc9b6]">
                <Clock3 className="mr-1 h-3.5 w-3.5" />
                {lesson.durationMin ?? 0} min
              </Badge>
              <Badge variant="outline" className="border-[#efc9b6]">
                <Upload className="mr-1 h-3.5 w-3.5" />
                {lesson.lessonFiles.length} recursos
              </Badge>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <LessonDialog
              courseId={courseId}
              moduleId={moduleId}
              lesson={lesson}
              mode="edit"
            >
              <Button variant="outline" className="border-[#d8aa8f] text-[#7b3500]">
                <Pencil className="h-4 w-4" />
                Editar
              </Button>
            </LessonDialog>
            <ResourceDialog courseId={courseId} lessonId={lesson.id}>
              <Button className="bg-[#2f63a4] text-white hover:bg-[#234d82]">
                <Plus className="h-4 w-4" />
                Agregar recurso
              </Button>
            </ResourceDialog>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {lesson.lessonFiles.length ? (
          lesson.lessonFiles.map((resource, index) => (
            <ResourceItem
              key={resource.id}
              courseId={courseId}
              resource={resource}
              index={index}
            />
          ))
        ) : (
          <div className="text-body-sm rounded-lg border border-dashed border-[#efc9b6] bg-[#fffaf4] p-4 text-muted-foreground">
            Esta lección aún no tiene recursos adjuntos.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ResourceItem({
  courseId,
  resource,
  index
}: {
  courseId: string;
  resource: LessonResource;
  index: number;
}) {
  const file = resource.file;
  const Icon = file ? resourceIcon(file) : resourceIconFromType(resource.type);

  const { startTransition } = useSubmitAction();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const title =
    resource.title ||
    (file
      ? (getMetadataValue(file, "title") ?? file.altText ?? file.url)
      : (resource.originalUrl ?? "Recurso"));

  const description =
    resource.description ?? (file ? getMetadataValue(file, "description") : null);

  const label = file ? resourceLabel(file) : resourceTypeLabel(resource.type);

  function move(direction: "up" | "down") {
    startTransition(async () => {
      const result = await moveLessonResourceAction(courseId, resource.id, direction);

      if (result.ok) {
        toast.success(result.message);
      } else {
        toast.info(result.message);
      }
    });
  }

  function remove() {
    startTransition(async () => {
      const result = await deleteLessonResourceAction(courseId, resource.id);

      if (result.ok) {
        toast.success(result.message);
        setConfirmOpen(false);
      } else {
        toast.error(result.message);
      }
    });
  }

  return (
    <div className="grid gap-3 rounded-lg border border-[#f0cfbb] bg-white p-3 transition duration-200 hover:-translate-y-0.5 hover:shadow-soft md:grid-cols-[auto_minmax(0,1fr)_auto] md:items-center">
      <div className="grid h-12 w-12 place-items-center rounded-lg bg-[#fff0d1] text-[#c21f5a]">
        <Icon className="h-5 w-5" />
      </div>

      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="border-[#efc9b6]">
            Recurso {index + 1}
          </Badge>

          <Badge className="bg-[#f7e6f0] text-[#8f1450]">{label}</Badge>
        </div>

        <p className="mt-2 truncate font-semibold text-[#111827]">{title}</p>

        {description ? (
          <p className="text-body-sm mt-1 line-clamp-2 text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>

      <div className="flex items-center gap-2">
        <ResourcePreviewDialog resource={resource}>
          <Button variant="outline" size="icon" className="border-[#d8aa8f]">
            <Eye className="h-4 w-4" />
            <span className="sr-only">Ver recurso</span>
          </Button>
        </ResourcePreviewDialog>

        <ResourceEditDialog courseId={courseId} resource={resource}>
          <Button variant="outline" size="icon" className="border-[#d8aa8f]">
            <Pencil className="h-4 w-4" />
            <span className="sr-only">Editar recurso</span>
          </Button>
        </ResourceEditDialog>

        <Button
          variant="outline"
          size="icon"
          className="border-[#d8aa8f]"
          onClick={() => move("up")}
        >
          <ArrowUp className="h-4 w-4" />
          <span className="sr-only">Subir recurso</span>
        </Button>

        <Button
          variant="outline"
          size="icon"
          className="border-[#d8aa8f]"
          onClick={() => move("down")}
        >
          <ArrowDown className="h-4 w-4" />
          <span className="sr-only">Bajar recurso</span>
        </Button>

        <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="border-[#f1b8b8] text-destructive"
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Retirar recurso</span>
            </Button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>Retirar recurso</DialogTitle>

              <DialogDescription>
                El recurso se quitará de esta lección. El archivo original se conserva en
                la biblioteca.
              </DialogDescription>
            </DialogHeader>

            <DialogFooter>
              <Button variant="outline" onClick={() => setConfirmOpen(false)}>
                Cancelar
              </Button>

              <Button variant="destructive" onClick={remove}>
                Retirar recurso
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

function ResourcePreviewDialog({
  resource,
  children
}: {
  resource: LessonResource;
  children: ReactNode;
}) {
  const previewUrl = getResourcePreviewUrl(resource);
  const downloadUrl = getResourceDownloadUrl(resource);

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-h-[92vh] max-w-5xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{resource.title || "Vista previa del recurso"}</DialogTitle>
          <DialogDescription>
            Revisa el material antes de publicarlo o modificarlo.
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-hidden rounded-xl border border-[#efc9b6] bg-[#fffaf4]">
          <ResourcePreviewFrame resource={resource} />
        </div>

        <DialogFooter className="gap-2 sm:justify-between">
          <p className="text-body-sm text-muted-foreground">
            {resource.description ?? resourceTypeLabel(resource.type)}
          </p>
          <div className="flex flex-wrap gap-2">
            {previewUrl ? (
              <Button asChild variant="outline" className="border-[#d8aa8f]">
                <a href={previewUrl} target="_blank" rel="noreferrer">
                  <Maximize2 className="h-4 w-4" />
                  Abrir visor
                </a>
              </Button>
            ) : null}
            {downloadUrl ? (
              <Button asChild className="bg-[#7b3500] text-white hover:bg-[#5d2900]">
                <a href={downloadUrl} target="_blank" rel="noreferrer" download>
                  <Download className="h-4 w-4" />
                  Descargar
                </a>
              </Button>
            ) : null}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ResourcePreviewFrame({ resource }: { resource: LessonResource }) {
  const previewUrl = getResourcePreviewUrl(resource);
  const resourceUrl = getResourceUrl(resource);

  if (resource.type === "VIDEO_YOUTUBE" && resource.externalId) {
    return (
      <iframe
        className="aspect-video w-full"
        src={`https://www.youtube.com/embed/${resource.externalId}`}
        title={resource.title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    );
  }

  if (resource.type === "IMAGE" && resource.file?.url) {
    return (
      <div
        className="aspect-video w-full bg-contain bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${resource.file.url})` }}
      />
    );
  }

  if (resource.type === "AUDIO" && resource.file?.url) {
    return (
      <div className="grid min-h-72 place-items-center p-8">
        <audio className="w-full max-w-2xl" src={resource.file.url} controls />
      </div>
    );
  }

  if (resource.type === "VIDEO_UPLOAD" && resource.file?.url) {
    return (
      <video
        className="aspect-video w-full bg-black"
        src={resource.file.url}
        controls
        preload="metadata"
      />
    );
  }

  if ((resource.type === "PDF" || resource.type === "DOCUMENT") && previewUrl) {
    return (
      <iframe
        src={previewUrl}
        title={`Vista previa de ${resource.title}`}
        className="h-[70vh] min-h-[520px] w-full bg-[#f5f0ea]"
      />
    );
  }

  if (resource.type === "EXTERNAL_LINK" && resourceUrl) {
    return (
      <div className="grid min-h-72 place-items-center p-8 text-center">
        <div>
          <ExternalLink className="mx-auto h-12 w-12 text-[#c21f5a]" />
          <p className="mt-4 font-serif text-2xl text-[#111827]">
            Este recurso se abre en una página externa.
          </p>
          <Button asChild className="mt-5 bg-[#c21f5a] text-white hover:bg-[#9f174a]">
            <a href={resourceUrl} target="_blank" rel="noreferrer">
              Abrir enlace
            </a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid min-h-72 place-items-center p-8 text-center text-muted-foreground">
      No hay una vista previa disponible para este recurso.
    </div>
  );
}

function ResourceEditDialog({
  courseId,
  resource,
  children
}: {
  courseId: string;
  resource: LessonResource;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<ResourceKind>(resourceKindFromType(resource.type));
  const [fileId, setFileId] = useState("");
  const [filePreviewUrl, setFilePreviewUrl] = useState(resource.file?.url ?? "");
  const [url, setUrl] = useState(
    resource.type === "VIDEO_YOUTUBE" || resource.type === "EXTERNAL_LINK"
      ? getResourceUrl(resource)
      : ""
  );
  const [altText, setAltText] = useState(resource.file?.altText ?? "");
  const { isPending, submit } = useSubmitAction();
  const youtubeId = kind === "YOUTUBE" ? extractYouTubeId(url) : null;
  const needsUpload = kind !== "YOUTUBE" && kind !== "EXTERNAL_LINK";

  function handleKindChange(nextKind: ResourceKind) {
    setKind(nextKind);
    setFileId("");
    setFilePreviewUrl(nextKind === resourceKindFromType(resource.type) ? resource.file?.url ?? "" : "");
    setUrl(nextKind === "YOUTUBE" || nextKind === "EXTERNAL_LINK" ? getResourceUrl(resource) : "");
  }

  function handleUploaded(file: UploadedFileValue) {
    setFileId(file.id);
    setFilePreviewUrl(file.url);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-h-[92vh] max-w-5xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar recurso</DialogTitle>
          <DialogDescription>
            Ajusta el material, su descripción y la forma en que se mostrará a la artesana.
          </DialogDescription>
        </DialogHeader>

        <form
          className="grid gap-6"
          onSubmit={(event) =>
            submit(event, updateLessonResourceAction, () => setOpen(false))
          }
        >
          <input type="hidden" name="courseId" value={courseId} />
          <input type="hidden" name="resourceId" value={resource.id} />
          <input type="hidden" name="kind" value={kind} />
          <input type="hidden" name="fileId" value={fileId} />

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {resourceOptions.map((option) => {
              const Icon = option.icon;
              const selected = kind === option.kind;

              return (
                <button
                  key={option.kind}
                  type="button"
                  disabled={option.kind === "VIDEO_UPLOAD"}
                  className={cn(
                    "rounded-xl border p-4 text-left transition duration-200 hover:-translate-y-0.5 hover:shadow-soft",
                    selected
                      ? "border-[#c21f5a] bg-[#fff0f6] ring-2 ring-[#c21f5a]/15"
                      : "border-[#efc9b6] bg-white",
                    option.kind === "VIDEO_UPLOAD" &&
                      "cursor-not-allowed opacity-55 hover:translate-y-0 hover:shadow-none"
                  )}
                  onClick={() => {
                    if (option.kind === "VIDEO_UPLOAD") return;
                    handleKindChange(option.kind);
                  }}
                >
                  <Icon className={cn("h-6 w-6", option.color)} />
                  <p className="mt-3 font-serif text-xl text-[#111827]">
                    {option.label}
                  </p>
                  <p className="text-body-sm mt-1 text-muted-foreground">
                    {option.description}
                  </p>
                </button>
              );
            })}
          </div>

          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.8fr)]">
            <div className="grid gap-4">
              <FormField label="Título del recurso">
                <Input
                  name="title"
                  defaultValue={resource.title}
                  placeholder="Ej. Guía para crear cuenta Gmail"
                />
              </FormField>
              <FormField label="Descripción">
                <Textarea
                  name="description"
                  defaultValue={resource.description ?? ""}
                  placeholder="Explica para qué servirá este recurso."
                />
              </FormField>
              {kind === "YOUTUBE" || kind === "EXTERNAL_LINK" ? (
                <FormField label="URL del recurso">
                  <Input
                    name="url"
                    value={url}
                    onChange={(event) => setUrl(event.target.value)}
                    required
                  />
                </FormField>
              ) : (
                <>
                  <FormField label="Texto alternativo">
                    <Input
                      name="altText"
                      value={altText}
                      onChange={(event) => setAltText(event.target.value)}
                      placeholder="Describe el archivo para accesibilidad."
                    />
                  </FormField>
                  <ResourceUploader
                    kind={kind}
                    previewUrl={filePreviewUrl}
                    altText={altText}
                    onUploaded={handleUploaded}
                    onRemove={() => {
                      setFileId("");
                      setFilePreviewUrl("");
                    }}
                  />
                  {resource.file?.url && !fileId ? (
                    <p className="text-body-sm text-muted-foreground">
                      Si no subes un archivo nuevo, se conservará el recurso actual.
                    </p>
                  ) : null}
                </>
              )}
            </div>

            <div className="rounded-xl border border-[#efc9b6] bg-[#fffaf4] p-4">
              <p className="text-label-ui font-bold uppercase tracking-[0.16em] text-[#2f63a4]">
                Previsualización
              </p>
              {kind === "YOUTUBE" && youtubeId ? (
                <iframe
                  className="mt-4 aspect-video w-full rounded-lg"
                  src={`https://www.youtube.com/embed/${youtubeId}`}
                  title="Vista previa de YouTube"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : needsUpload && filePreviewUrl ? (
                <div className="mt-4 overflow-hidden rounded-lg border border-[#efc9b6] bg-white">
                  {kind === "IMAGE" ? (
                    <div
                      className="aspect-video bg-contain bg-center bg-no-repeat"
                      style={{ backgroundImage: `url(${filePreviewUrl})` }}
                    />
                  ) : kind === "AUDIO" ? (
                    <div className="grid aspect-video place-items-center p-6">
                      <audio className="w-full" src={filePreviewUrl} controls />
                    </div>
                  ) : kind === "VIDEO_UPLOAD" ? (
                    <video
                      className="aspect-video w-full bg-black"
                      src={filePreviewUrl}
                      controls
                    />
                  ) : (
                    <iframe
                      src={fileId ? filePreviewUrl : getResourcePreviewUrl(resource)}
                      title="Vista previa del documento"
                      className="h-80 w-full bg-[#f5f0ea]"
                    />
                  )}
                </div>
              ) : (
                <div className="mt-4 grid aspect-video place-items-center rounded-lg border border-dashed border-[#efc9b6] bg-white text-center">
                  <div>
                    <Upload className="mx-auto h-8 w-8 text-[#c21f5a]" />
                    <p className="text-body-sm mt-2 text-muted-foreground">
                      La previsualización aparecerá aquí.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              <Save className="h-4 w-4" />
              Guardar recurso
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function CourseInfoDialog({ course }: { course: CourseEditorData }) {
  const [open, setOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState(course.imageUrl ?? "");
  const { isPending, submit } = useSubmitAction();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#7b3500] text-white hover:bg-[#5d2900]">
          <Pencil className="h-4 w-4" />
          Editar información
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[92vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Información del curso</DialogTitle>
          <DialogDescription>
            Actualiza los datos generales que verán las artesanas al iniciar su ruta.
          </DialogDescription>
        </DialogHeader>
        <form
          className="grid gap-5"
          onSubmit={(event) =>
            submit(event, updateCourseEditorAction, () => setOpen(false))
          }
        >
          <input type="hidden" name="courseId" value={course.id} />
          <input type="hidden" name="imageUrl" value={imageUrl} />
          <div className="grid gap-5 md:grid-cols-[280px_minmax(0,1fr)]">
            <ImageUpload
              folder="warmi/courses"
              previewUrl={imageUrl}
              label="Imagen principal del curso"
              onUploaded={(file) => setImageUrl(file.url)}
              onRemove={() => setImageUrl("")}
            />
            <div className="grid gap-4">
              <FormField label="Nombre del curso">
                <Input name="title" defaultValue={course.title} required />
              </FormField>
              <FormField label="Descripción">
                <Textarea name="description" defaultValue={course.description ?? ""} />
              </FormField>
              <div className="grid gap-4 sm:grid-cols-3">
                <FormField label="Nivel">
                  <select
                    name="level"
                    defaultValue={course.level}
                    className="h-10 w-full rounded-md border border-input bg-transparent px-3 text-body-md"
                  >
                    <option value="BEGINNER">Inicial</option>
                    <option value="INTERMEDIATE">Intermedio</option>
                    <option value="ADVANCED">Avanzado</option>
                  </select>
                </FormField>
                <FormField label="Estado">
                  <select
                    name="status"
                    defaultValue={course.status}
                    className="h-10 w-full rounded-md border border-input bg-transparent px-3 text-body-md"
                  >
                    <option value="DRAFT">Borrador</option>
                    <option value="PUBLISHED">Publicado</option>
                    <option value="ARCHIVED">Archivado</option>
                  </select>
                </FormField>
                <FormField label="Duración estimada">
                  <Input
                    name="durationMin"
                    type="number"
                    min={0}
                    defaultValue={course.durationMin ?? ""}
                  />
                </FormField>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              <Save className="h-4 w-4" />
              Guardar curso
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ModuleDialog({
  courseId,
  module,
  mode,
  children
}: {
  courseId: string;
  module?: ModuleRecord;
  mode: "create" | "edit";
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [coverFileId, setCoverFileId] = useState(module?.coverFileId ?? "");
  const [previewUrl, setPreviewUrl] = useState(module?.coverFile?.url ?? "");
  const { isPending, submit } = useSubmitAction();
  const action = mode === "create" ? createCourseModuleAction : updateCourseModuleAction;

  function handleUploaded(file: UploadedFileValue) {
    setCoverFileId(file.id);
    setPreviewUrl(file.url);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-h-[92vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Crear módulo" : "Editar módulo"}
          </DialogTitle>
          <DialogDescription>
            Agrupa lecciones relacionadas y agrega una portada opcional para orientar
            visualmente.
          </DialogDescription>
        </DialogHeader>
        <form
          className="grid gap-5"
          onSubmit={(event) => submit(event, action, () => setOpen(false))}
        >
          <input type="hidden" name="courseId" value={courseId} />
          {module ? <input type="hidden" name="moduleId" value={module.id} /> : null}
          <input type="hidden" name="coverFileId" value={coverFileId} />
          <div className="grid gap-5 md:grid-cols-[240px_minmax(0,1fr)]">
            <ImageUpload
              folder="warmi/modules"
              previewUrl={previewUrl}
              label="Portada del módulo"
              description="Opcional, ayuda a reconocer el tema"
              onUploaded={handleUploaded}
              onRemove={() => {
                setCoverFileId("");
                setPreviewUrl("");
              }}
            />
            <div className="grid gap-4">
              <FormField label="Título del módulo">
                <Input name="title" defaultValue={module?.title ?? ""} required />
              </FormField>
              <FormField label="Descripción">
                <Textarea name="description" defaultValue={module?.description ?? ""} />
              </FormField>
              <FormField label="Duración estimada en minutos">
                <Input
                  name="durationMin"
                  type="number"
                  min={0}
                  defaultValue={module?.durationMin ?? ""}
                />
              </FormField>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              <Save className="h-4 w-4" />
              {mode === "create" ? "Crear módulo" : "Guardar módulo"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function LessonDialog({
  courseId,
  moduleId,
  lesson,
  mode,
  children
}: {
  courseId: string;
  moduleId: string;
  lesson?: LessonRecord;
  mode: "create" | "edit";
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const { isPending, submit } = useSubmitAction();
  const action = mode === "create" ? createCourseLessonAction : updateCourseLessonAction;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-h-[92vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Crear lección" : "Editar lección"}
          </DialogTitle>
          <DialogDescription>
            Escribe una lección breve y agrega los recursos después.
          </DialogDescription>
        </DialogHeader>
        <form
          className="grid gap-4"
          onSubmit={(event) => submit(event, action, () => setOpen(false))}
        >
          <input type="hidden" name="courseId" value={courseId} />
          <input type="hidden" name="moduleId" value={moduleId} />
          {lesson ? <input type="hidden" name="lessonId" value={lesson.id} /> : null}
          <FormField label="Título de la lección">
            <Input name="title" defaultValue={lesson?.title ?? ""} required />
          </FormField>
          <FormField label="Contenido textual">
            <Textarea
              name="content"
              defaultValue={lesson?.content ?? ""}
              placeholder="Describe el paso, la guía o la actividad de esta lección."
            />
          </FormField>
          <FormField label="Duración estimada en minutos">
            <Input
              name="durationMin"
              type="number"
              min={0}
              defaultValue={lesson?.durationMin ?? ""}
            />
          </FormField>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              <Save className="h-4 w-4" />
              {mode === "create" ? "Crear lección" : "Guardar lección"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ResourceDialog({
  courseId,
  lessonId,
  children
}: {
  courseId: string;
  lessonId: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<ResourceKind>("YOUTUBE");
  const [fileId, setFileId] = useState("");
  const [filePreviewUrl, setFilePreviewUrl] = useState("");
  const [url, setUrl] = useState("");
  const [altText, setAltText] = useState("");
  const { isPending, submit } = useSubmitAction();
  const youtubeId = kind === "YOUTUBE" ? extractYouTubeId(url) : null;

  function handleUploaded(file: UploadedFileValue) {
    setFileId(file.id);
    setFilePreviewUrl(file.url);
  }

  function resetAndClose() {
    setOpen(false);
    setKind("YOUTUBE");
    setFileId("");
    setFilePreviewUrl("");
    setUrl("");
    setAltText("");
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-h-[92vh] max-w-5xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Agregar recurso</DialogTitle>
          <DialogDescription>
            Selecciona el tipo de recurso y completa solo los datos necesarios.
          </DialogDescription>
        </DialogHeader>
        <form
          className="grid gap-6"
          onSubmit={(event) => submit(event, addLessonResourceAction, resetAndClose)}
        >
          <input type="hidden" name="courseId" value={courseId} />
          <input type="hidden" name="lessonId" value={lessonId} />
          <input type="hidden" name="kind" value={kind} />
          <input type="hidden" name="fileId" value={fileId} />

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {resourceOptions.map((option) => {
              const Icon = option.icon;
              const selected = kind === option.kind;

              return (
                <button
                  key={option.kind}
                  type="button"
                  disabled={option.kind === "VIDEO_UPLOAD"}
                  className={cn(
                    "rounded-xl border p-4 text-left transition duration-200 hover:-translate-y-0.5 hover:shadow-soft",
                    selected
                      ? "border-[#c21f5a] bg-[#fff0f6] ring-2 ring-[#c21f5a]/15"
                      : "border-[#efc9b6] bg-white",
                    option.kind === "VIDEO_UPLOAD" &&
                      "cursor-not-allowed opacity-55 hover:translate-y-0 hover:shadow-none"
                  )}
                  onClick={() => {
                    if (option.kind === "VIDEO_UPLOAD") return;
                    setKind(option.kind);
                    setFileId("");
                    setFilePreviewUrl("");
                    setUrl("");
                  }}
                >
                  <Icon className={cn("h-6 w-6", option.color)} />
                  <p className="mt-3 font-serif text-xl text-[#111827]">{option.label}</p>
                  <p className="text-body-sm mt-1 text-muted-foreground">
                    {option.description}
                  </p>
                </button>
              );
            })}
          </div>

          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.8fr)]">
            <div className="grid gap-4">
              <FormField label="Título del recurso">
                <Input name="title" placeholder="Ej. Video: crear cuenta Gmail" />
              </FormField>
              <FormField label="Descripción">
                <Textarea
                  name="description"
                  placeholder="Describe para qué sirve este recurso dentro de la lección."
                />
              </FormField>
              {kind === "YOUTUBE" || kind === "EXTERNAL_LINK" ? (
                <FormField label="URL del recurso">
                  <Input
                    name="url"
                    value={url}
                    onChange={(event) => setUrl(event.target.value)}
                    placeholder={
                      kind === "YOUTUBE"
                        ? "https://www.youtube.com/watch?v=..."
                        : "https://..."
                    }
                    required
                  />
                </FormField>
              ) : (
                <>
                  <FormField label="Texto alternativo">
                    <Input
                      name="altText"
                      value={altText}
                      onChange={(event) => setAltText(event.target.value)}
                      placeholder="Describe el archivo para accesibilidad."
                    />
                  </FormField>
                  <ResourceUploader
                    kind={kind}
                    previewUrl={filePreviewUrl}
                    altText={altText}
                    onUploaded={handleUploaded}
                    onRemove={() => {
                      setFileId("");
                      setFilePreviewUrl("");
                    }}
                  />
                </>
              )}
            </div>

            <div className="rounded-xl border border-[#efc9b6] bg-[#fffaf4] p-4">
              <p className="text-label-ui font-bold uppercase tracking-[0.16em] text-[#2f63a4]">
                Vista previa
              </p>
              {kind === "YOUTUBE" && youtubeId ? (
                <iframe
                  className="mt-4 aspect-video w-full rounded-lg"
                  src={`https://www.youtube.com/embed/${youtubeId}`}
                  title="Vista previa de YouTube"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : filePreviewUrl && kind === "IMAGE" ? (
                <div
                  className="mt-4 aspect-video rounded-lg bg-cover bg-center"
                  style={{ backgroundImage: `url(${filePreviewUrl})` }}
                />
              ) : filePreviewUrl && kind === "AUDIO" ? (
                <audio className="mt-4 w-full" src={filePreviewUrl} controls />
              ) : filePreviewUrl && kind === "VIDEO_UPLOAD" ? (
                <video
                  className="mt-4 aspect-video w-full rounded-lg"
                  src={filePreviewUrl}
                  controls
                />
              ) : (
                <div className="mt-4 grid aspect-video place-items-center rounded-lg border border-dashed border-[#efc9b6] bg-white text-center">
                  <div>
                    <Upload className="mx-auto h-8 w-8 text-[#c21f5a]" />
                    <p className="text-body-sm mt-2 text-muted-foreground">
                      La previsualización aparecerá aquí.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={resetAndClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              <Plus className="h-4 w-4" />
              Agregar recurso
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ResourceUploader({
  kind,
  previewUrl,
  altText,
  onUploaded,
  onRemove
}: {
  kind: Exclude<ResourceKind, "YOUTUBE" | "EXTERNAL_LINK">;
  previewUrl: string;
  altText: string;
  onUploaded: (file: UploadedFileValue) => void;
  onRemove: () => void;
}) {
  if (kind === "VIDEO_UPLOAD") {
    return (
      <div className="rounded-xl border border-dashed border-[#efc9b6] bg-[#fffaf4] p-5 text-body-sm text-muted-foreground">
        La subida de videos propios esta deshabilitada. Agrega el recurso como
        video de YouTube para que cargue mas rapido y sea facil de reproducir.
      </div>
    );
  }

  const config = {
    IMAGE: {
      label: "Subir imagen",
      description: "JPG, PNG o WebP",
      accept: "image/jpeg,image/jpg,image/png,image/webp",
      uploadType: "IMAGE" as const
    },
    DOCUMENT: {
      label: "Subir PDF o documento",
      description: "PDF hasta 20 MB",
      accept: "application/pdf",
      uploadType: "DOCUMENT" as const
    },
    AUDIO: {
      label: "Subir audio",
      description: "MP3, WAV u OGG",
      accept: "audio/mpeg,audio/mp3,audio/wav,audio/ogg",
      uploadType: "AUDIO" as const
    }
  }[kind];

  return (
    <FileUpload
      folder="warmi/lesson-resources"
      label={config.label}
      description={config.description}
      accept={config.accept}
      uploadType={config.uploadType}
      previewUrl={previewUrl}
      altText={altText}
      onUploaded={onUploaded}
      onRemove={onRemove}
    />
  );
}

function PreviewDialog({
  course,
  totalLessons,
  totalResources
}: {
  course: CourseEditorData;
  totalLessons: number;
  totalResources: number;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-[#d8aa8f] text-[#7b3500]">
          <CheckCircle2 className="h-4 w-4" />
          Vista previa
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{course.title}</DialogTitle>
          <DialogDescription>
            Resumen rápido del contenido antes de continuar la edición.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 sm:grid-cols-3">
          <SummaryTile icon={Layers3} label="Módulos" value={course.modules.length} />
          <SummaryTile icon={BookOpen} label="Lecciones" value={totalLessons} />
          <SummaryTile icon={Upload} label="Recursos" value={totalResources} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
