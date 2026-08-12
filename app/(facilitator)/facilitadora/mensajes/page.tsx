import { Container } from "@/shared/components/layout/container";
import { PageHeader } from "@/shared/components/layout/page-header";
import { Card, CardContent } from "@/shared/components/ui/card";
import { requireRole } from "@/shared/server/auth/helpers";
import { ConversationRepository } from "@/shared/repositories/conversation.repository";
import { MessageComposer } from "@/features/facilitator/message-composer";
export default async function Page() {
  const session = await requireRole("FACILITADORA");
  const conversations = await new ConversationRepository().findForUser(session.user.id);
  return (
    <Container className="space-y-6 py-8">
      <PageHeader
        title="Mensajes"
        description="Conversaciones de acompañamiento, sin tiempo real en esta etapa."
      />
      <div className="grid gap-4">
        {conversations.map((conversation) => (
          <Card key={conversation.id}>
            <CardContent className="space-y-3 py-4">
              <p className="font-semibold">
                {conversation.participants
                  .filter((p) => p.userId !== session.user.id)
                  .map((p) => p.user.profile?.displayName ?? p.user.email)
                  .join(", ")}
              </p>
              <p className="text-body-sm text-muted-foreground">
                {conversation.messages[0]?.content ?? "Sin mensajes"}
              </p>
              <MessageComposer conversationId={conversation.id} />
            </CardContent>
          </Card>
        ))}
      </div>
    </Container>
  );
}
