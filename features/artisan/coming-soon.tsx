import { Container } from "@/shared/components/layout/container";
import { PageHeader } from "@/shared/components/layout/page-header";
import { Card, CardContent } from "@/shared/components/ui/card";

export function ComingSoon({ title }: { title: string }) {
  return (
    <Container className="space-y-6 py-6 md:py-10">
      <PageHeader
        eyebrow="Proximamente"
        title={title}
        description="Esta sección ya tiene ruta y navegación. Su funcionalidad completa llegará en una fase posterior."
      />
      <Card>
        <CardContent className="pt-6 text-body-md text-muted-foreground">
          Seguiremos construyendo este módulo sin perder el foco en aprendizaje,
          acompañamiento y patrimonio cultural.
        </CardContent>
      </Card>
    </Container>
  );
}
