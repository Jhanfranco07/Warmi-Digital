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
  personalStory: z.string().min(20, "Cuéntanos un poco más de tu camino."),
  artisanJourney: z.string().min(20, "Describe tu trayectoria artesanal."),
  knowledgeOrigin: z.string().min(10, "Describe el origen de tu conocimiento."),
  learnedFrom: z.string().min(2, "Indica de quién o de qué generación aprendiste."),
  techniques: z.string().min(3, "Registra tus técnicas principales."),
  culturalMeaning: z.string().min(20, "Explica el significado cultural de tu trabajo."),
  coverImageUrl: z.string().url("Ingresa una URL valida.").optional().or(z.literal(""))
});

export type StoryFormInput = z.infer<typeof storyFormSchema>;
