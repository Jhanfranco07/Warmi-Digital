import { Mail, Palette, Shield, Store, UserRound } from "lucide-react";

import {
  ArtisanHero,
  ArtisanListItem,
  ArtisanPanel,
  ArtisanShell,
  ArtisanStatCard
} from "@/features/artisan/artisan-panel";
import { ArtisanRepository } from "@/shared/repositories/artisan.repository";
import { requireRole } from "@/shared/server/auth/helpers";

export default async function ArtisanProfilePage() {
  const session = await requireRole("ARTESANA");
  const user = await new ArtisanRepository().findProfile(session.user.id);
  const profile = user?.profile;
  const craftTypes =
    profile?.craftTypes.map((item) => item.craftType.name).join(", ") ??
    "Especialidad pendiente";

  return (
    <ArtisanShell>
      <ArtisanHero
        eyebrow="Mi perfil"
        title="Datos de mi cuenta"
        description="Tu perfil separa datos personales, emprendimiento, cultura y seguridad para acompañar mejor tu proceso."
        imageUrl="/images/learning/aprender-hero.png"
      />

      <section className="grid gap-5 md:grid-cols-3">
        <ArtisanStatCard
          title="Nombre visible"
          value={profile?.displayName ?? session.user.name ?? "Artesana Warmi"}
          description="Así se mostrará tu identidad dentro de la plataforma."
          icon={UserRound}
          color="bg-[#b5245b]"
        />
        <ArtisanStatCard
          title="Comunidad"
          value={profile?.community?.name ?? "Pendiente"}
          description="Territorio y memoria cultural."
          icon={Store}
          color="bg-[#2f62a3]"
        />
        <ArtisanStatCard
          title="Técnica"
          value={craftTypes}
          description="Saberes vinculados a tu historia."
          icon={Palette}
          color="bg-[#17c3cf]"
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <InfoPanel
          title="Datos personales"
          icon={UserRound}
          rows={[
            profile?.displayName,
            user?.email,
            profile?.phone ?? "Teléfono pendiente"
          ]}
        />
        <InfoPanel
          title="Datos del emprendimiento"
          icon={Store}
          rows={[
            "Vitrina cultural en preparación",
            "Productos vinculados a tus piezas",
            "Proceso de aprendizaje antes de comercializar"
          ]}
        />
        <InfoPanel
          title="Datos culturales"
          icon={Palette}
          rows={[profile?.community?.name, craftTypes, "San Miguel, Cajamarca"]}
        />
        <InfoPanel
          title="Cuenta y seguridad"
          icon={Shield}
          rows={[
            "Correo verificado pendiente",
            "Cambio de contraseña disponible desde recuperación",
            "Acceso protegido por rol de artesana"
          ]}
        />
      </section>
    </ArtisanShell>
  );
}

function InfoPanel({
  title,
  rows,
  icon: Icon
}: {
  title: string;
  rows: Array<string | null | undefined>;
  icon: typeof Mail;
}) {
  return (
    <ArtisanPanel
      title={title}
      eyebrow="Información"
      action={
        <span className="inline-flex rounded-full bg-[#fff0f5] p-3 text-[#b5245b]">
          <Icon className="h-5 w-5" />
        </span>
      }
    >
      <div className="grid gap-4">
        {rows.filter(Boolean).map((row) => (
          <ArtisanListItem key={row} title={row ?? ""} />
        ))}
      </div>
    </ArtisanPanel>
  );
}
