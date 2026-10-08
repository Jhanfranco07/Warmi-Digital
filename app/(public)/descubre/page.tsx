import { WarmiPublicHeader } from "@/app/(public)/_components/warmi-public-header";
import { WarmiDiscoveryContent } from "@/shared/components/landing/descubre-content";

export default function DescubrePage() {
  return (
    <main>
      <WarmiPublicHeader compact />
      <WarmiDiscoveryContent />
    </main>
  );
}
