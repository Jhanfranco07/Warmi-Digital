import { MobileNavigation, Sidebar } from "@/shared/components/navigation/sidebar";
import { requireRole } from "@/shared/server/auth/helpers";

export default async function ArtisanLayout({ children }: { children: React.ReactNode }) {
  await requireRole("ARTESANA");

  return (
    <div className="min-h-screen bg-surface">
      <MobileNavigation role="ARTESANA" />
      <Sidebar role="ARTESANA" />
      <main className="min-h-screen pb-20 lg:pb-0 lg:pl-72">{children}</main>
    </div>
  );
}
