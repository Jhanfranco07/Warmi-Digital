"use server";

import { requireRole } from "@/shared/server/auth/helpers";
import { StoryService } from "@/shared/services/story.service";
import { storyFormSchema } from "@/shared/validations";

type UpdateStoryResult = {
  ok: boolean;
  message: string;
  errors?: Record<string, string[]>;
};

export async function updateStoryAction(
  _previousState: UpdateStoryResult,
  formData: FormData
): Promise<UpdateStoryResult> {
  const session = await requireRole("ARTESANA");
  const raw = Object.fromEntries(formData.entries());
  const parsed = storyFormSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      ok: false,
      message: "Revisa los campos marcados antes de guardar.",
      errors: parsed.error.flatten().fieldErrors
    };
  }

  await new StoryService().updateStory(session.user.id, parsed.data);

  return {
    ok: true,
    message: "Tu historia cultural fue guardada."
  };
}
