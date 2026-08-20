"use server";

import { revalidatePath } from "next/cache";
import { FileType, LessonResourceType } from "@prisma/client";
import { z } from "zod";

import { parseYouTubeVideoId } from "@/shared/lib/youtube";
import { CourseRepository } from "@/shared/repositories/course.repository";
import { FileRepository } from "@/shared/repositories/file.repository";
import { requireRole } from "@/shared/server/auth/helpers";

type ActionResult = {
  ok: boolean;
  message: string;
};

const nullableText = z.preprocess(
  (value) => {
    if (typeof value !== "string") return null;
    const trimmed = value.trim();
    return trimmed.length ? trimmed : null;
  },
  z.string().nullable()
);

const nullableInt = z.preprocess(
  (value) => {
    if (typeof value !== "string" || value.trim() === "") return null;
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : value;
  },
  z.number().int().min(0).nullable()
);

const courseSchema = z.object({
  courseId: z.string().uuid(),
  title: z.string().trim().min(3, "El nombre del curso es obligatorio."),
  description: nullableText,
  level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
  durationMin: nullableInt,
  imageUrl: nullableText
});

const moduleCreateSchema = z.object({
  courseId: z.string().uuid(),
  title: z.string().trim().min(3, "El titulo del modulo es obligatorio."),
  description: nullableText,
  durationMin: nullableInt,
  coverFileId: nullableText
});

const moduleUpdateSchema = moduleCreateSchema.extend({
  moduleId: z.string().uuid()
});

const lessonCreateSchema = z.object({
  courseId: z.string().uuid(),
  moduleId: z.string().uuid(),
  title: z.string().trim().min(3, "El titulo de la leccion es obligatorio."),
  content: nullableText,
  durationMin: nullableInt
});

const lessonUpdateSchema = lessonCreateSchema.extend({
  lessonId: z.string().uuid()
});

const baseResourceSchema = z.object({
  courseId: z.string().uuid(),
  lessonId: z.string().uuid(),
  kind: z.enum([
    "YOUTUBE",
    "IMAGE",
    "DOCUMENT",
    "AUDIO",
    "EXTERNAL_LINK",
    "VIDEO_UPLOAD"
  ]),
  fileId: nullableText,
  url: nullableText,
  title: nullableText,
  description: nullableText,
  altText: nullableText
});

const resourceSchema = baseResourceSchema.superRefine((value, ctx) => {
    if (["YOUTUBE", "EXTERNAL_LINK"].includes(value.kind) && !value.url) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "La URL es obligatoria para este recurso.",
        path: ["url"]
      });
    }

    if (!["YOUTUBE", "EXTERNAL_LINK"].includes(value.kind) && !value.fileId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Debes subir o seleccionar un archivo.",
        path: ["fileId"]
      });
    }
  });

const resourceUpdateSchema = z
  .object({
    courseId: z.string().uuid(),
    resourceId: z.string().uuid(),
    kind: z.enum([
      "YOUTUBE",
      "IMAGE",
      "DOCUMENT",
      "AUDIO",
      "EXTERNAL_LINK",
      "VIDEO_UPLOAD"
    ]),
    fileId: nullableText,
    url: nullableText,
    title: nullableText,
    description: nullableText,
    altText: nullableText
  })
  .superRefine((value, ctx) => {
    if (["YOUTUBE", "EXTERNAL_LINK"].includes(value.kind) && !value.url) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "La URL es obligatoria para este recurso.",
        path: ["url"]
      });
    }
  });

const resourceKindMap = {
  YOUTUBE: LessonResourceType.VIDEO_YOUTUBE,
  IMAGE: LessonResourceType.IMAGE,
  DOCUMENT: LessonResourceType.PDF,
  AUDIO: LessonResourceType.AUDIO,
  EXTERNAL_LINK: LessonResourceType.EXTERNAL_LINK,
  VIDEO_UPLOAD: LessonResourceType.VIDEO_UPLOAD
} as const;

const expectedFileTypeMap = {
  IMAGE: FileType.IMAGE,
  DOCUMENT: FileType.DOCUMENT,
  AUDIO: FileType.AUDIO,
  VIDEO_UPLOAD: FileType.VIDEO
} as const;

function resourceFallbackTitle(kind: keyof typeof resourceKindMap) {
  return {
    YOUTUBE: "Video de YouTube",
    IMAGE: "Imagen de apoyo",
    DOCUMENT: "Documento PDF",
    AUDIO: "Audio de apoyo",
    EXTERNAL_LINK: "Enlace complementario",
    VIDEO_UPLOAD: "Video de apoyo"
  }[kind];
}

function formObject(formData: FormData) {
  return Object.fromEntries(formData.entries());
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function editorPath(courseId: string) {
  return `/facilitadora/cursos/${courseId}/editar`;
}

function validationError(error: unknown) {
  if (error instanceof z.ZodError) {
    return error.issues[0]?.message ?? "Revisa los datos ingresados.";
  }

  return "No se pudo completar la accion.";
}

export async function updateCourseEditorAction(
  formData: FormData
): Promise<ActionResult> {
  const session = await requireRole("FACILITADORA");

  try {
    const data = courseSchema.parse(formObject(formData));
    const result = await new CourseRepository().updateManagedCourse(
      data.courseId,
      session.user.id,
      {
        title: data.title,
        description: data.description,
        level: data.level,
        status: data.status,
        durationMin: data.durationMin,
        imageUrl: data.imageUrl
      }
    );

    revalidatePath(editorPath(data.courseId));
    return {
      ok: result.count > 0,
      message:
        result.count > 0
          ? "Informacion del curso guardada."
          : "No se encontro el curso asignado."
    };
  } catch (error) {
    return { ok: false, message: validationError(error) };
  }
}

export async function createCourseModuleAction(
  formData: FormData
): Promise<ActionResult> {
  const session = await requireRole("FACILITADORA");

  try {
    const data = moduleCreateSchema.parse(formObject(formData));
    const created = await new CourseRepository().createModule(session.user.id, data.courseId, {
      title: data.title,
      description: data.description,
      durationMin: data.durationMin,
      coverFileId: data.coverFileId
    });

    revalidatePath(editorPath(data.courseId));
    return {
      ok: Boolean(created),
      message: created ? "Modulo creado correctamente." : "No se pudo crear el modulo."
    };
  } catch (error) {
    return { ok: false, message: validationError(error) };
  }
}

export async function updateCourseModuleAction(
  formData: FormData
): Promise<ActionResult> {
  const session = await requireRole("FACILITADORA");

  try {
    const data = moduleUpdateSchema.parse(formObject(formData));
    const result = await new CourseRepository().updateModule(session.user.id, data.moduleId, {
      title: data.title,
      description: data.description,
      durationMin: data.durationMin,
      coverFileId: data.coverFileId
    });

    revalidatePath(editorPath(data.courseId));
    return {
      ok: result.count > 0,
      message:
        result.count > 0
          ? "Modulo actualizado correctamente."
          : "No se encontro el modulo."
    };
  } catch (error) {
    return { ok: false, message: validationError(error) };
  }
}

export async function moveCourseModuleAction(
  courseId: string,
  moduleId: string,
  direction: "up" | "down"
): Promise<ActionResult> {
  const session = await requireRole("FACILITADORA");
  const moved = await new CourseRepository().moveModule(
    session.user.id,
    moduleId,
    direction
  );

  revalidatePath(editorPath(courseId));
  return {
    ok: moved,
    message: moved ? "Orden del modulo actualizado." : "No hay mas modulos para mover."
  };
}

export async function createCourseLessonAction(
  formData: FormData
): Promise<ActionResult> {
  const session = await requireRole("FACILITADORA");

  try {
    const data = lessonCreateSchema.parse(formObject(formData));
    const created = await new CourseRepository().createLesson(session.user.id, data.moduleId, {
      title: data.title,
      slug: `${slugify(data.title)}-${Date.now()}`,
      content: data.content,
      durationMin: data.durationMin,
      type: "TEXT"
    });

    revalidatePath(editorPath(data.courseId));
    return {
      ok: Boolean(created),
      message: created ? "Leccion creada correctamente." : "No se pudo crear la leccion."
    };
  } catch (error) {
    return { ok: false, message: validationError(error) };
  }
}

export async function updateCourseLessonAction(
  formData: FormData
): Promise<ActionResult> {
  const session = await requireRole("FACILITADORA");

  try {
    const data = lessonUpdateSchema.parse(formObject(formData));
    const result = await new CourseRepository().updateLesson(session.user.id, data.lessonId, {
      title: data.title,
      content: data.content,
      durationMin: data.durationMin
    });

    revalidatePath(editorPath(data.courseId));
    return {
      ok: result.count > 0,
      message:
        result.count > 0
          ? "Leccion actualizada correctamente."
          : "No se encontro la leccion."
    };
  } catch (error) {
    return { ok: false, message: validationError(error) };
  }
}

export async function addLessonResourceAction(
  formData: FormData
): Promise<ActionResult> {
  const session = await requireRole("FACILITADORA");

  try {
    const data = resourceSchema.parse(formObject(formData));
    const files = new FileRepository();
    const courses = new CourseRepository();
    let fileId = data.fileId;
    let provider: string | null = null;
    let externalId: string | null = null;
    let originalUrl: string | null = data.url;

    if (data.kind === "YOUTUBE") {
      const videoId = parseYouTubeVideoId(data.url ?? "");

      if (!videoId) {
        return { ok: false, message: "El enlace de YouTube no es valido." };
      }

      provider = "YOUTUBE";
      externalId = videoId;
      fileId = null;
    } else if (data.kind === "EXTERNAL_LINK") {
      provider = "EXTERNAL";
      fileId = null;
    } else if (fileId) {
      const expectedFileType = expectedFileTypeMap[data.kind];
      const file = await files.findOwnedByType(fileId, session.user.id, expectedFileType);

      if (!file) {
        return {
          ok: false,
          message: "El archivo no existe o no corresponde al tipo seleccionado."
        };
      }

      await files.updateOwned(fileId, session.user.id, {
        altText: data.altText,
        metadata: {
          ...(typeof file.metadata === "object" && file.metadata ? file.metadata : {}),
          resourceKind: data.kind,
          title: data.title,
          description: data.description
        }
      });

      originalUrl = null;
    }

    const attached = await courses.createManagedLessonResource(
      session.user.id,
      data.lessonId,
      {
        fileId,
        type: resourceKindMap[data.kind],
        title: data.title ?? resourceFallbackTitle(data.kind),
        description: data.description,
        provider,
        externalId,
        originalUrl
      }
    );
    revalidatePath(editorPath(data.courseId));

    return {
      ok: Boolean(attached),
      message: attached ? "Recurso agregado a la leccion." : "No se encontro la leccion."
    };
  } catch (error) {
    return { ok: false, message: validationError(error) };
  }
}

export async function updateLessonResourceAction(
  formData: FormData
): Promise<ActionResult> {
  const session = await requireRole("FACILITADORA");

  try {
    const data = resourceUpdateSchema.parse(formObject(formData));
    const files = new FileRepository();
    const courses = new CourseRepository();
    let fileId: string | null | undefined = undefined;
    let provider: string | null = null;
    let externalId: string | null = null;
    let originalUrl: string | null = data.url;

    if (data.kind === "YOUTUBE") {
      const videoId = parseYouTubeVideoId(data.url ?? "");

      if (!videoId) {
        return { ok: false, message: "El enlace de YouTube no es valido." };
      }

      provider = "YOUTUBE";
      externalId = videoId;
      fileId = null;
    } else if (data.kind === "EXTERNAL_LINK") {
      provider = "EXTERNAL";
      fileId = null;
    } else {
      originalUrl = null;

      if (data.fileId) {
        const expectedFileType = expectedFileTypeMap[data.kind];
        const file = await files.findOwnedByType(data.fileId, session.user.id, expectedFileType);

        if (!file) {
          return {
            ok: false,
            message: "El archivo no existe o no corresponde al tipo seleccionado."
          };
        }

        await files.updateOwned(data.fileId, session.user.id, {
          altText: data.altText,
          metadata: {
            ...(typeof file.metadata === "object" && file.metadata ? file.metadata : {}),
            resourceKind: data.kind,
            title: data.title,
            description: data.description
          }
        });

        fileId = data.fileId;
      }
    }

    const result = await courses.updateLessonResource(session.user.id, data.resourceId, {
      fileId,
      type: resourceKindMap[data.kind],
      title: data.title ?? resourceFallbackTitle(data.kind),
      description: data.description,
      provider,
      externalId,
      originalUrl
    });

    revalidatePath(editorPath(data.courseId));
    return {
      ok: result.count > 0,
      message:
        result.count > 0
          ? "Recurso actualizado correctamente."
          : "No se encontro el recurso."
    };
  } catch (error) {
    return { ok: false, message: validationError(error) };
  }
}

export async function moveLessonResourceAction(
  courseId: string,
  lessonFileId: string,
  direction: "up" | "down"
): Promise<ActionResult> {
  const session = await requireRole("FACILITADORA");
  const moved = await new CourseRepository().moveLessonFile(
    session.user.id,
    lessonFileId,
    direction
  );

  revalidatePath(editorPath(courseId));
  return {
    ok: moved,
    message: moved ? "Orden del recurso actualizado." : "No hay mas recursos para mover."
  };
}

export async function deleteLessonResourceAction(
  courseId: string,
  lessonFileId: string
): Promise<ActionResult> {
  const session = await requireRole("FACILITADORA");
  const result = await new CourseRepository().deleteLessonFile(
    session.user.id,
    lessonFileId
  );

  revalidatePath(editorPath(courseId));
  return {
    ok: result.count > 0,
    message:
      result.count > 0
        ? "Recurso retirado de la leccion."
        : "No se encontro el recurso."
  };
}
