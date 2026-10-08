import { WarmiPublicHeader } from "@/app/(public)/_components/warmi-public-header";
import { WarmiProgrammeContent } from "@/shared/components/landing/programa-content";

export default function ProgramaPage() {
  return (
    <main>
      <WarmiPublicHeader compact />
      <WarmiProgrammeContent />
    </main>
  );
}
