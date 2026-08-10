import { MobileNavigation, Sidebar } from "@/shared/components/navigation/sidebar";
import { requirePermission } from "@/shared/server/auth/helpers";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requirePermission("ACCESS_ADMIN");

  return (
    <div className="min-h-screen bg-surface">
      <MobileNavigation role="ADMIN" />
      <Sidebar role="ADMIN" />
      <main className="min-h-screen lg:pl-72">{children}</main>
    </div>
  );
}
