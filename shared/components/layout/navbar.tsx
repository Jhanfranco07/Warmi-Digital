import Link from "next/link";

import { Container } from "@/shared/components/layout/container";

export function Navbar() {
  return (
    <header className="border-b border-border bg-surface/90 backdrop-blur">
      <Container className="flex h-16 items-center justify-between">
        <Link href="/" className="font-serif text-headline-md text-primary">
          Warmi Digital
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
