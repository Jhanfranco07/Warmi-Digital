import { WarmiPublicHeader } from "@/app/(public)/_components/warmi-public-header";
import { WarmiIdentityContent } from "@/shared/components/landing/identidad-content";

export default function IdentidadPage() {
  return (
    <main>
      <WarmiPublicHeader compact />
      <WarmiIdentityContent />
    </main>
  );
}
