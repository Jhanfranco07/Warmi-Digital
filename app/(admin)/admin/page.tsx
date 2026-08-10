import { Container } from "@/shared/components/layout/container";
import { PageHeader } from "@/shared/components/layout/page-header";

export default function AdminPage() {
  return (
    <Container className="py-10">
      <PageHeader
        eyebrow="Admin"
        title="Layout base"
        description="Espacio estructural reservado para gestion del ecosistema."
      />
    </Container>
  );
}
