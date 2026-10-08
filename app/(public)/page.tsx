import { WarmiPublicHeader } from "@/app/(public)/_components/warmi-public-header";
import { WarmiWelcomeContent } from "@/shared/components/landing/welcome-content";
export default function LandingPage() {
  return (
    <main>
      <WarmiPublicHeader />
      <WarmiWelcomeContent />
    </main>
  );
}
