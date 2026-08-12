import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Container } from "@/shared/components/layout/container";
import { PageHeader } from "@/shared/components/layout/page-header";

export default function AccessDeniedPage() {
  return (
    <Container className="py-10">
      <PageHeader
        eyebrow="Acceso denegado"
        title="No tienes permiso para ver esta página"
        description="Tu sesión no tiene el rol necesario. Inicia sesión con otra cuenta o contacta al administrador."
      />
      <div className="flex flex-col items-start gap-4 pt-8">
        <Link href="/login">
          <Button>Volver al inicio de sesión</Button>
        </Link>
      </div>
    </Container>
  );
}
