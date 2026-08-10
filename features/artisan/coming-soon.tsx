import { Container } from "@/shared/components/layout/container";
import { PageHeader } from "@/shared/components/layout/page-header";
import { Card, CardContent } from "@/shared/components/ui/card";

export function ComingSoon({ title }: { title: string }) {
  return (
    <Container className="space-y-6 py-6 md:py-10">
      <PageHeader
        eyebrow="Proximamente"
        title={title}
        description="Esta seccion ya tiene ruta y navegacion. Su funcionalidad completa llegara en una fase posterior."
      />
      <Card>
        <CardContent className="pt-6 text-body-md text-muted-foreground">
          Seguiremos construyendo este modulo sin perder el foco en aprendizaje,
          acompanamiento y patrimonio cultural.
        </CardContent>
      </Card>
    </Container>
  );
}
