import { MobileNavigation, Sidebar } from "@/shared/components/navigation/sidebar";
import { requirePermission } from "@/shared/server/auth/helpers";

export default async function FacilitatorLayout({
  children
}: {
  children: React.ReactNode;
}) {
  await requirePermission("ACCESS_FACILITATOR");

  return (
    <div className="min-h-screen bg-surface">
      <MobileNavigation role="FACILITADORA" />
      <Sidebar role="FACILITADORA" />
      <main className="min-h-screen lg:pl-72">{children}</main>
    </div>
  );
}
