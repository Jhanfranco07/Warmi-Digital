import Link from "next/link";

import { WarmiLogo } from "@/shared/components/brand/warmi-logo";
import { Container } from "@/shared/components/layout/container";

export function Navbar() {
  return (
    <header className="border-b border-border bg-surface/95 shadow-sm">
      <Container className="flex h-16 items-center justify-between">
        <Link href="/" aria-label="Ir al inicio de Warmi Digital">
          <WarmiLogo compact markClassName="w-32" />
        </Link>
        <nav className="hidden items-center gap-6 font-ui text-label-ui text-muted-foreground md:flex">
          <Link href="/#patrimonio">Patrimonio</Link>
          <Link href="/#comunidades">Comunidades</Link>
          <Link href="/#aprendizaje">Aprendizaje</Link>
          <Link href="/mercado">Mercado cultural</Link>
        </nav>
      </Container>
    </header>
  );
}
