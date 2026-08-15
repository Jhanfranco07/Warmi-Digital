import { z } from "zod";

export const storyFormSchema = z.object({
  title: z.string().min(3, "Escribe un titulo para tu historia.").max(120),
  publicName: z.string().min(2, "Escribe tu nombre publico.").max(100),
  communityId: z.string().uuid("Selecciona una comunidad.").optional().or(z.literal("")),
  craftTypeId: z
    .string()
    .uuid("Selecciona una especialidad.")
    .optional()
    .or(z.literal("")),
  summary: z.string().max(240).optional(),
  personalStory: z.string().min(20, "Cuentanos un poco mas de tu camino."),
  artisanJourney: z.string().min(20, "Describe tu trayectoria artesanal."),
  knowledgeOrigin: z.string().min(10, "Describe el origen de tu conocimiento."),
  learnedFrom: z.string().min(2, "Indica de quien o de que generacion aprendiste."),
  techniques: z.string().min(3, "Registra tus tecnicas principales."),
  culturalMeaning: z.string().min(20, "Explica el significado cultural de tu trabajo."),
  coverImageFileId: z
    .string()
    .uuid("Selecciona una imagen valida.")
    .optional()
    .or(z.literal(""))
});

export const artisanProfileSchema = z.object({
  firstName: z.string().min(2, "Escribe tu nombre.").max(80),
  lastName: z.string().min(2, "Escribe tus apellidos.").max(120),
  displayName: z.string().min(2, "Escribe tu nombre visible.").max(120),
  phone: z.string().max(30).optional().or(z.literal("")),
  bio: z.string().max(500).optional().or(z.literal("")),
  communityId: z.string().uuid("Selecciona una comunidad.").optional().or(z.literal("")),
  craftTypeIds: z.array(z.string().uuid()).default([])
});

export const avatarUpdateSchema = z.object({
  fileId: z.string().uuid("Selecciona una imagen valida.")
});

export const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(8, "Ingresa tu contrasena actual."),
    newPassword: z
      .string()
      .min(8, "La nueva contrasena debe tener al menos 8 caracteres."),
    confirmPassword: z.string().min(8, "Confirma la nueva contrasena.")
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Las contrasenas no coinciden."
  });

export const storyGalleryFileSchema = z.object({
  fileId: z.string().uuid("Selecciona una imagen valida.")
});

export const storyGalleryMoveSchema = z.object({
  fileId: z.string().uuid("Selecciona una imagen valida."),
  direction: z.enum(["up", "down"])
});

export const messageSendSchema = z.object({
  conversationId: z.string().uuid("Selecciona una conversacion valida."),
  content: z.string().min(1, "Escribe un mensaje.").max(2000)
});

export const notificationReadSchema = z.object({
  notificationId: z.string().uuid("Selecciona una notificacion valida.")
});

export type StoryFormInput = z.infer<typeof storyFormSchema>;
export type ArtisanProfileInput = z.infer<typeof artisanProfileSchema>;
export type AvatarUpdateInput = z.infer<typeof avatarUpdateSchema>;
export type PasswordChangeInput = z.infer<typeof passwordChangeSchema>;
