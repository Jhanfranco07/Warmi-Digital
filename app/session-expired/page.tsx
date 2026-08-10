import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Container } from "@/shared/components/layout/container";
import { PageHeader } from "@/shared/components/layout/page-header";

export default function SessionExpiredPage() {
  return (
    <Container className="py-10">
      <PageHeader
        eyebrow="Sesion expirada"
        title="Tu sesion necesita renovarse"
        description="Por seguridad, vuelve a iniciar sesion para continuar usando Warmi Digital."
      />
      <div className="flex flex-col items-start gap-4 pt-8">
        <Link href="/login">
          <Button>Iniciar sesion</Button>
        </Link>
      </div>
    </Container>
  );
}
