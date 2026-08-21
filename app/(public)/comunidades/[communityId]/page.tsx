import { notFound } from "next/navigation";
import { prisma } from "@/shared/server/db/prisma";
import { Container } from "@/shared/components/layout/container";
import { PageHeader } from "@/shared/components/layout/page-header";
export default async function Page({
  params
}: {
  params: Promise<{ communityId: string }>;
}) {
  const c = await prisma.community.findUnique({
    where: { id: (await params).communityId },
    include: {
      profiles: { where: { deletedAt: null, user: { deletedAt: null } } },
      products: {
        where: {
          status: "PUBLISHED",
          available: true,
          deletedAt: null,
          artisan: { deletedAt: null }
        }
      }
    }
  });
  if (!c) notFound();
  return (
    <Container className="space-y-6 py-10">
      <PageHeader
        title={c.name}
        description={`${c.location ?? "Perú"} · ${c.description ?? "Comunidad de saberes vivos."}`}
      />
      <p>
        {c.profiles.length} artesanas participantes · {c.products.length} piezas
        culturales publicadas
      </p>
    </Container>
  );
}
