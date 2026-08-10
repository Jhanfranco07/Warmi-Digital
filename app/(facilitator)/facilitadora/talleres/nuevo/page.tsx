import { Container } from "@/shared/components/layout/container";
import { PageHeader } from "@/shared/components/layout/page-header";
import { WorkshopEditor } from "@/features/facilitator/workshop-editor";
export default function Page() {
  return (
    <Container className="max-w-3xl space-y-6 py-8">
      <PageHeader
        title="Programar taller"
        description="Organiza un encuentro con proposito, lugar y materiales claros."
      />
      <WorkshopEditor />
    </Container>
  );
}
