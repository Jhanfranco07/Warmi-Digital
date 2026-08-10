import Image from "next/image";

import { StoryForm } from "@/features/artisan/story-form";
import { EmptyState } from "@/shared/components/feedback/empty-state";
import { Container } from "@/shared/components/layout/container";
import { PageHeader } from "@/shared/components/layout/page-header";
import { Card, CardContent } from "@/shared/components/ui/card";
import { StoryService } from "@/shared/services/story.service";
import { requireRole } from "@/shared/server/auth/helpers";

export default async function ArtisanStoryPage() {
  const session = await requireRole("ARTESANA");
  const { story, communities, craftTypes } = await new StoryService().getStoryPage(
    session.user.id
  );

  return (
    <Container className="space-y-8 py-6 md:py-10">
      <PageHeader
        eyebrow="Mi historia"
        title="Ficha de patrimonio cultural vivo"
        description="Cuenta de donde viene tu saber, que significa tu tecnica y que historia conserva tu trabajo."
      />

      {story ? (
        <Card>
          <CardContent className="grid gap-4 pt-6 md:grid-cols-[180px_1fr]">
            {story.coverImage?.url ? (
              <div className="relative aspect-square overflow-hidden rounded-md bg-surface-high">
                <Image
                  src={story.coverImage.url}
                  alt={story.title}
                  fill
                  className="object-cover"
                />
              </div>
            ) : null}
            <div className="space-y-2">
              <h2 className="font-serif text-headline-md">{story.title}</h2>
              <p className="text-body-md text-muted-foreground">
                {story.summary ?? "Historia cultural registrada."}
              </p>
              <p className="text-body-md">{story.culturalMeaning}</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <EmptyState
          title="Tu historia aun no esta registrada"
          description="Puedes empezar con pocas palabras y completarla con calma."
        />
      )}

      <StoryForm
        communities={communities}
        craftTypes={craftTypes}
        defaultValues={{
          title: story?.title ?? "",
          publicName: story?.publicName ?? "",
          communityId: story?.communityId ?? "",
          craftTypeId: story?.craftTypeId ?? "",
          summary: story?.summary ?? "",
          personalStory: story?.personalStory ?? "",
          artisanJourney: story?.artisanJourney ?? "",
          knowledgeOrigin: story?.knowledgeOrigin ?? "",
          learnedFrom: story?.learnedFrom ?? "",
          techniques: story?.techniques ?? "",
          culturalMeaning: story?.culturalMeaning ?? "",
          coverImageUrl: story?.coverImage?.url ?? ""
        }}
      />
    </Container>
  );
}
