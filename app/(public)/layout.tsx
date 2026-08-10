import { Footer } from "@/shared/components/layout/footer";
import { Navbar } from "@/shared/components/layout/navbar";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
