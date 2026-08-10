import { Container } from "@/shared/components/layout/container";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-surface">
      <Container className="flex min-h-screen items-center justify-center py-12">
        {children}
      </Container>
    </main>
  );
}
