import { MobileNavigation, Sidebar } from "@/shared/components/navigation/sidebar";
import { requireAuth } from "@/shared/server/auth/helpers";

export default async function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  await requireAuth();

  return (
    <div className="min-h-screen bg-surface">
      <MobileNavigation role="ARTESANA" />
      <Sidebar role="ARTESANA" />
      <main className="min-h-screen lg:pl-72">{children}</main>
    </div>
  );
}
