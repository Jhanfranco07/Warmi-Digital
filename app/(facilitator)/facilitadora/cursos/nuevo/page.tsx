import { Container } from "@/shared/components/layout/container";
import { PageHeader } from "@/shared/components/layout/page-header";
import { Card, CardContent } from "@/shared/components/ui/card";
import { CourseEditor } from "@/features/facilitator/course-editor";
export default function Page() {
  return (
    <Container className="max-w-3xl space-y-6 py-8">
      <PageHeader
        title="Crear curso"
        description="Una ruta clara, práctica y respetuosa con el ritmo de aprendizaje."
      />
      <Card>
        <CardContent className="pt-6">
          <CourseEditor />
        </CardContent>
      </Card>
    </Container>
  );
}
