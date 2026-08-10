import { Container } from "@/shared/components/layout/container";
import { PageHeader } from "@/shared/components/layout/page-header";

export default function LandingPage() {
  return (
    <Container className="py-section-gap">
      <PageHeader
        eyebrow="Fase 1"
        title="Warmi Digital"
        description="Infraestructura base lista para iniciar el desarrollo del ecosistema."
      />
    </Container>
  );
}
