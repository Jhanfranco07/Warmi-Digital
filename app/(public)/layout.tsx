import { Footer } from "@/shared/components/layout/footer";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <main>{children}</main>
      <Footer />
    </div>
  );
}
